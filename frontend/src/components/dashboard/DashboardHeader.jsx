import React from 'react';

export function DashboardHeader({
  userName,
  isWorkspaceAdmin,
  currentView,
  onViewChange,
  onCreateProject,
  onCreateTask,
}) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-slate-200 dark:border-slate-800">
      <div>
        {/* Date & Workspace Tier Metadata */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {isWorkspaceAdmin ? 'Executive Workspace' : 'Personal Workspace'}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {formattedDate}
          </span>
        </div>

        {/* Primary Page Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {greeting}, {userName || 'User'}
        </h1>

        {/* Supporting Context Subtitle */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          {currentView === 'admin'
            ? "Here's what's happening across your workspace."
            : "Here's what needs your attention today."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Workspace Overview vs My Focus Switcher (Only if user has admin/owner rights) */}
        {isWorkspaceAdmin && (
          <div
            role="tablist"
            aria-label="Dashboard perspective view"
            className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center shadow-inner"
          >
            <button
              role="tab"
              aria-selected={currentView === 'admin'}
              onClick={() => onViewChange('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'admin'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Team Overview
            </button>
            <button
              role="tab"
              aria-selected={currentView === 'member'}
              onClick={() => onViewChange('member')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'member'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              My Focus
            </button>
          </div>
        )}

        {/* Quick Actions with Primary/Secondary visual hierarchy */}
        <div className="flex items-center gap-2">
          {/* Secondary Action: New Project (Admin only) */}
          {isWorkspaceAdmin && onCreateProject && (
            <button
              onClick={onCreateProject}
              className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 flex items-center gap-1.5 active:scale-95"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Project</span>
            </button>
          )}

          {/* Primary Action: New Task */}
          {onCreateTask && (
            <button
              onClick={onCreateTask}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-1.5 active:scale-95 hover:-translate-y-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Task</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
