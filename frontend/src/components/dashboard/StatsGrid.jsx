import React from 'react';

export function StatsGrid({ stats, view = 'admin', activeFilter, onFilterClick }) {
  if (view === 'member') {
    const memberItems = [
      {
        key: 'all',
        label: 'My Tasks',
        value: stats.my_tasks ?? 0,
        context: 'Assigned to you',
        color: 'text-slate-900 dark:text-white',
        iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
      },
      {
        key: 'due_today',
        label: 'Due Today',
        value: stats.my_due_today ?? 0,
        context: stats.my_due_today > 0 ? 'Requires action today' : 'No deadlines today',
        color: stats.my_due_today > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white',
        iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
        statusDot: stats.my_due_today > 0 ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        key: 'in_progress',
        label: 'In Progress',
        value: stats.my_in_progress ?? 0,
        context: 'Active execution',
        color: 'text-sky-600 dark:text-sky-400',
        iconBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      },
      {
        key: 'done',
        label: 'Completed',
        value: stats.my_completed ?? 0,
        context:
          stats.my_tasks > 0
            ? `${Math.round(((stats.my_completed ?? 0) / stats.my_tasks) * 100)}% completion rate`
            : 'Deliverables verified',
        color: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
        statusDot: 'bg-emerald-500',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ),
      },
      {
        key: 'overdue',
        label: 'Overdue',
        value: stats.my_overdue ?? 0,
        context: stats.my_overdue > 0 ? 'Urgent attention required' : 'All deadlines on track',
        color: stats.my_overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white',
        iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
        statusDot: stats.my_overdue > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      },
    ];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {memberItems.map((item) => {
          const isSelected = activeFilter === item.key;
          return (
            <div
              key={item.key}
              onClick={() => onFilterClick && onFilterClick(item.key)}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`Filter by ${item.label}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onFilterClick && onFilterClick(item.key);
                }
              }}
              className={`p-4 bg-white dark:bg-slate-900/60 border rounded-2xl shadow-sm transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 select-none ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:ring-indigo-400/20'
                  : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {item.label}
                </span>
                <div className="flex items-center gap-1.5">
                  {item.statusDot && <span className={`w-1.5 h-1.5 rounded-full ${item.statusDot}`} />}
                  <span className={`p-1.5 rounded-lg ${item.iconBg}`}>{item.icon}</span>
                </div>
              </div>
              <p className={`text-2xl sm:text-3xl font-black tracking-tight ${item.color}`}>
                {item.value}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                {item.context}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  // Admin View: 6 KPI Cards
  const adminItems = [
    {
      key: 'projects',
      label: 'Projects',
      value: stats.active_projects ?? 0,
      context: 'Active workspaces',
      color: 'text-slate-900 dark:text-white',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      key: 'all',
      label: 'Total Tasks',
      value: stats.total_tasks ?? 0,
      context: 'Across all projects',
      color: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      key: 'todo',
      label: 'To Do',
      value: stats.todo ?? 0,
      context: 'Backlog & queued',
      color: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: 'in_progress',
      label: 'In Progress',
      value: stats.in_progress ?? 0,
      context: 'Active execution',
      color: 'text-sky-600 dark:text-sky-400',
      iconBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      key: 'done',
      label: 'Completed',
      value: stats.completed ?? 0,
      context:
        stats.total_tasks > 0
          ? `${Math.round(((stats.completed ?? 0) / stats.total_tasks) * 100)}% workspace progress`
          : 'Verified deliverables',
      color: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      statusDot: 'bg-emerald-500',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      key: 'overdue',
      label: 'Overdue',
      value: stats.overdue ?? 0,
      context: stats.overdue > 0 ? `${stats.overdue} require attention` : 'All deadlines on track',
      color: stats.overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white',
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      statusDot: stats.overdue > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {adminItems.map((item) => {
        const isSelected = activeFilter === item.key;
        return (
          <div
            key={item.key}
            onClick={() => onFilterClick && onFilterClick(item.key)}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`Filter by ${item.label}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onFilterClick && onFilterClick(item.key);
              }
            }}
            className={`p-4 bg-white dark:bg-slate-900/60 border rounded-2xl shadow-sm transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 select-none ${
              isSelected
                ? 'border-indigo-600 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:ring-indigo-400/20'
                : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {item.label}
              </span>
              <div className="flex items-center gap-1.5">
                {item.statusDot && <span className={`w-1.5 h-1.5 rounded-full ${item.statusDot}`} />}
                <span className={`p-1.5 rounded-lg ${item.iconBg}`}>{item.icon}</span>
              </div>
            </div>
            <p className={`text-2xl sm:text-3xl font-black tracking-tight ${item.color}`}>
              {item.value}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
              {item.context}
            </p>
          </div>
        );
      })}
    </div>
  );
}
