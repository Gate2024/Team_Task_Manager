import React from 'react';

export function TaskFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  assigneeFilter,
  onAssigneeChange,
  sortBy,
  onSortChange,
  members = [],
  onReset,
}) {
  const hasActiveFilters =
    Boolean(search) ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    assigneeFilter !== 'all' ||
    sortBy !== 'newest';

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Top Search & Reset Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input with SVG icon */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title or description..."
            aria-label="Search tasks"
            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {hasActiveFilters && onReset && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors self-end sm:self-auto flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter Select Controls Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {/* Status Filter */}
        <div>
          <label htmlFor="filter-status" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label htmlFor="filter-priority" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Priority
          </label>
          <select
            id="filter-priority"
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Assignee Filter */}
        <div>
          <label htmlFor="filter-assignee" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Assignee
          </label>
          <select
            id="filter-assignee"
            value={assigneeFilter}
            onChange={(e) => onAssigneeChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {members.map((m) => {
              const u = m.user || m;
              const uid = m.user_id || u.id;
              return (
                <option key={uid} value={uid}>
                  {u.name}
                </option>
              );
            })}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="filter-sort" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Sort By
          </label>
          <select
            id="filter-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="newest">Recently Created</option>
            <option value="due_date_asc">Due Date (Earliest)</option>
            <option value="due_date_desc">Due Date (Latest)</option>
            <option value="priority_desc">Priority (Highest first)</option>
            <option value="priority_asc">Priority (Lowest first)</option>
            <option value="title_asc">Title (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
