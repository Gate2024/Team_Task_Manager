/**
 * Base HTTP client configured for Flask-JWT-Extended cookie authentication.
 * Handles automatic CSRF token extraction from cookies, header injection,
 * and transparent 401 token refresh with a concurrency-safe single-flight queue.
 */

function getCookie(name) {
  if (typeof document === 'undefined') {
    return null;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
}

// Concurrency mutex & subscriber queue to collapse simultaneous 401s into a single refresh
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onRefreshed(error) {
  refreshSubscribers.forEach((callback) => callback(error));
  refreshSubscribers = [];
}

/**
 * Perform a single silent token refresh call via POST /api/auth/refresh.
 * Sends the CSRF token extracted from csrf_refresh_token cookie.
 */
async function executeSilentRefresh() {
  const refreshCsrf = getCookie('csrf_refresh_token') || getCookie('csrf_access_token');
  const headers = {
    Accept: 'application/json',
  };
  if (refreshCsrf) {
    headers['X-CSRF-TOKEN'] = refreshCsrf;
  }

  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: 'Token refresh failed' };
    }
    const error = new Error(errorData.message || errorData.msg || 'Session refresh failed');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
}

export async function apiClient(
  endpoint,
  { method = 'GET', data, headers = {}, _retry = false, ...customOptions } = {}
) {
  const config = {
    method,
    headers: {
      Accept: 'application/json',
      ...headers,
    },
    credentials: 'include', // Ensures session & JWT cookies are sent
    ...customOptions,
  };

  if (data !== undefined) {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      config.body = data;
    } else {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(data);
    }
  }

  // Attach CSRF header on unsafe mutation methods per Flask-JWT-Extended double-submit protection
  const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (unsafeMethods.includes(method.toUpperCase())) {
    const isRefreshEndpoint = endpoint.includes('/api/auth/refresh');
    const csrfToken = isRefreshEndpoint
      ? (getCookie('csrf_refresh_token') || getCookie('csrf_access_token'))
      : getCookie('csrf_access_token');
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }
  }

  const response = await fetch(endpoint, config);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText || 'Request failed' };
    }

    // Check if eligible for silent refresh:
    // 1. Status is 401 Unauthorized
    // 2. Request has NOT already been retried (_retry === false)
    // 3. Not an auth route where 401 is credential failure (login, register, logout, or refresh itself)
    const isAuthRoute =
      endpoint.includes('/api/auth/login') ||
      endpoint.includes('/api/auth/register') ||
      endpoint.includes('/api/auth/refresh');

    const canAttemptRefresh =
      response.status === 401 &&
      !_retry &&
      !isAuthRoute;

    if (canAttemptRefresh) {
      // If a refresh is already in-flight by a concurrent request, enqueue this one
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((refreshErr) => {
            if (refreshErr) {
              const err = new Error('Your session has ended. Please sign in again.');
              err.status = 401;
              err.data = { code: 'session_expired', message: err.message };
              return reject(err);
            }
            // Retry once with updated cookie/CSRF header and _retry: true flag
            apiClient(endpoint, { method, data, headers, _retry: true, ...customOptions })
              .then(resolve)
              .catch(reject);
          });
        });
      }

      // First request to hit 401: Acquire mutex lock and execute single refresh
      isRefreshing = true;

      try {
        await executeSilentRefresh();
        // Notify all concurrent requests waiting in the queue
        onRefreshed(null);

        // Retry the original request once
        return await apiClient(endpoint, {
          method,
          data,
          headers,
          _retry: true,
          ...customOptions,
        });
      } catch (refreshErr) {
        // Refresh failed (e.g. refresh token expired, revoked, or user deleted)
        onRefreshed(refreshErr);

        // Notify application that session has ended cleanly
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('auth:session-ended', {
              detail: {
                reason: 'session_expired',
                message: 'Your session has ended. Please sign in again.',
              },
            })
          );
        }

        const sessionEndedError = new Error('Your session has ended. Please sign in again.');
        sessionEndedError.status = 401;
        sessionEndedError.data = {
          code: 'session_expired',
          message: 'Your session has ended. Please sign in again.',
        };
        throw sessionEndedError;
      } finally {
        isRefreshing = false;
      }
    }

    const error = new Error(errorData.message || errorData.msg || 'API request failed');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
