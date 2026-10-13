import React from 'react';

const PRIORITY_CONFIG = {
  low: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80',
    icon: (
      <svg className="w-3 h-3 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    ),
    label: 'Low',
  },
  medium: {
    bg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/70',
    icon: (
      <svg className="w-3 h-3 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14" />
      </svg>
    ),
    label: 'Medium',
  },
  high: {
    bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70',
    icon: (
      <svg className="w-3 h-3 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
      </svg>
    ),
    label: 'High',
  },
  urgent: {
    bg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/70',
    icon: (
      <svg className="w-3 h-3 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    label: 'Urgent',
  },
};

export function PriorityBadge({ priority = 'medium', size = 'default' }) {
  const norm = String(priority).toLowerCase();
  const config = PRIORITY_CONFIG[norm] || PRIORITY_CONFIG.medium;

  const isSmall = size === 'small';

  return (
    <span
      role="status"
      aria-label={`Priority: ${config.label}`}
      className={`inline-flex items-center gap-1 font-semibold rounded-md border tracking-tight transition-colors ${
        isSmall ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      } ${config.bg}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
