/**
 * Base HTTP client configured for Flask-JWT-Extended cookie authentication.
 * Handles automatic CSRF token extraction from cookies and header injection.
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

export async function apiClient(endpoint, { method = 'GET', data, headers = {}, ...customOptions } = {}) {
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
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(data);
  }

  // Attach CSRF header on unsafe mutation methods per Flask-JWT-Extended double-submit protection
  const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (unsafeMethods.includes(method.toUpperCase())) {
    const csrfToken = getCookie('csrf_access_token');
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
