import React from 'react';

const TOAST_STYLES = {
  success: {
    container: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500/30 text-emerald-900 dark:text-emerald-100',
    iconBg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    container: 'bg-rose-50 dark:bg-rose-950/80 border-rose-500/30 text-rose-900 dark:text-rose-100',
    iconBg: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    container: 'bg-amber-50 dark:bg-amber-950/80 border-amber-500/30 text-amber-900 dark:text-amber-100',
    iconBg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  info: {
    container: 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500/30 text-indigo-900 dark:text-indigo-100',
    iconBg: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-slideUp ${style.container}`}
          >
            <div className={`p-1.5 rounded-lg flex-shrink-0 ${style.iconBg}`}>
              {style.icon}
            </div>
            <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
              {toast.message}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
