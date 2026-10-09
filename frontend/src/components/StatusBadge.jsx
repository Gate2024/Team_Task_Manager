import React from 'react';

const STATUS_STYLES = {
  todo: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  in_progress: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
  done: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
};

const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export function StatusBadge({ status }) {
  const normalized = status ? status.toLowerCase() : 'todo';
  const style = STATUS_STYLES[normalized] || STATUS_STYLES.todo;
  const label = STATUS_LABELS[normalized] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
    >
      {label}
    </span>
  );
}
