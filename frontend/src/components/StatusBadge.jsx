import React from 'react';

const STATUS_CONFIG = {
  todo: {
    bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70',
    icon: (
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
    ),
    label: 'To Do',
  },
  in_progress: {
    bg: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/70',
    icon: (
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
    ),
    label: 'In Progress',
  },
  done: {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70',
    icon: (
      <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
      </svg>
    ),
    label: 'Done',
  },
};

export function StatusBadge({ status = 'todo', size = 'default' }) {
  const norm = String(status).toLowerCase();
  const config = STATUS_CONFIG[norm] || STATUS_CONFIG.todo;
  const isSmall = size === 'small';

  return (
    <span
      role="status"
      aria-label={`Status: ${config.label}`}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-md border tracking-tight transition-colors ${
        isSmall ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      } ${config.bg}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
