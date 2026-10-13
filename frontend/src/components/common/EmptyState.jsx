import React from 'react';

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}) {
  return (
    <div className="p-10 sm:p-14 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col items-center justify-center animate-fadeIn">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3.5 shadow-sm">
        {icon || (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>

      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
        {title}
      </h4>

      {description && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {(actionLabel || secondaryLabel) && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {secondaryLabel && onSecondary && (
            <button
              onClick={onSecondary}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {secondaryLabel}
            </button>
          )}
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
