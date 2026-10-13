import React from 'react';
import { Link } from 'react-router-dom';

function formatRelativeTime(dateString) {
  if (!dateString) return 'Recently';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function RecentActivity({ tasks = [] }) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 text-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h3>
        <p className="text-xs text-slate-400">No activity recorded across your workspace yet.</p>
      </div>
    );
  }

  // Sort tasks by updated_at or created_at descending
  const sorted = [...tasks].sort((a, b) => {
    const da = new Date(a.updated_at || a.created_at || 0);
    const db = new Date(b.updated_at || b.created_at || 0);
    return db - da;
  });

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Deliverable events & timeline updates.
          </p>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live stream" />
      </div>

      <div className="relative pl-3 space-y-4 pt-1">
        {/* Continuous vertical timeline connector line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800" />

        {sorted.slice(0, 5).map((t) => {
          const authorName = t.assignee?.name || t.creator?.name || 'Workspace Collaborator';
          const authorInitial = authorName.charAt(0).toUpperCase();
          const timestamp = formatRelativeTime(t.updated_at || t.created_at);

          // Event type categorization
          let actionText = 'updated deliverable';
          let actionColor = 'bg-sky-500';
          if (t.status === 'done') {
            actionText = 'completed task';
            actionColor = 'bg-emerald-500';
          } else if (t.status === 'in_progress') {
            actionText = 'moved to in progress';
            actionColor = 'bg-indigo-500';
          } else if (t.created_at && (!t.updated_at || t.created_at === t.updated_at)) {
            actionText = 'created task';
            actionColor = 'bg-amber-500';
          }

          return (
            <div key={t.id} className="relative flex items-start gap-3 group">
              {/* Event node dot with avatar */}
              <div
                title={authorName}
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white dark:ring-slate-900 shadow-sm"
              >
                {authorInitial}
              </div>

              {/* Event Details */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                  <span className="font-bold text-slate-900 dark:text-white">{authorName}</span>{' '}
                  <span className="text-slate-500 dark:text-slate-400">{actionText}</span>
                </p>

                <Link
                  to={`/projects/${t.project_id}`}
                  className="font-medium text-xs text-indigo-600 dark:text-indigo-400 hover:underline truncate block mt-0.5"
                >
                  "{t.title}"
                </Link>

                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${actionColor}`} />
                  <span>{timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
