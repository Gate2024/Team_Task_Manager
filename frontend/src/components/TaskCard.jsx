import React from 'react';
import { StatusBadge } from './StatusBadge';

export function TaskCard({ task, onStatusChange }) {
  const handleStatusChange = (e) => {
    if (onStatusChange) {
      onStatusChange(task.id, e.target.value);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug">{task.title}</h4>
        <StatusBadge status={task.status} />
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
        <div>
          {task.assignee ? (
            <span>Assigned: {task.assignee.name}</span>
          ) : (
            <span className="italic text-slate-400 dark:text-slate-500">Unassigned</span>
          )}
        </div>

        {onStatusChange && (
          <select
            value={task.status}
            onChange={handleStatusChange}
            className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        )}
      </div>
    </div>
  );
}
