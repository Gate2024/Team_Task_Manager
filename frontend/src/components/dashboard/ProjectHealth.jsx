import React from 'react';
import { Link } from 'react-router-dom';

export function ProjectHealth({ projects = [], tasks = [] }) {
  if (projects.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 text-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Project Health & Progress</h3>
        <p className="text-xs text-slate-400">No projects currently tracked across your workspace.</p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Project Health & Progress</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Deliverable velocity, overdue items, and initiative health.
          </p>
        </div>
        <Link
          to="/projects"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          View all &rarr;
        </Link>
      </div>

      <div className="space-y-4 pt-1">
        {projects.slice(0, 4).map((project) => {
          const projectTasks = tasks.filter((t) => t.project_id === project.id);
          const total = projectTasks.length;
          const completed = projectTasks.filter((t) => t.status === 'done').length;
          const inProgress = projectTasks.filter((t) => t.status === 'in_progress').length;
          const todo = projectTasks.filter((t) => t.status === 'todo').length;
          const overdue = projectTasks.filter(
            (t) => t.status !== 'done' && t.due_date && t.due_date < today
          ).length;

          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

          // Project Health Determination
          let healthLabel = 'On Track';
          let healthStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60';
          if (overdue > 0) {
            healthLabel = 'Needs Attention';
            healthStyle = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60';
          }
          if (overdue >= 3 || (total > 0 && pct === 0 && overdue > 0)) {
            healthLabel = 'At Risk';
            healthStyle = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60';
          }

          const memberCount = project.memberships?.length || 1;

          return (
            <div
              key={project.id}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-200 dark:hover:border-slate-700/80 transition-all space-y-2.5 group"
            >
              {/* Project Title + Health Tag */}
              <div className="flex items-center justify-between gap-3">
                <Link
                  to={`/projects/${project.id}`}
                  className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate transition-colors flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                  <span className="truncate">{project.name}</span>
                </Link>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${healthStyle}`}
                  >
                    {healthLabel}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Progress Segmented Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                {total === 0 ? (
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-full" />
                ) : (
                  <>
                    <div
                      style={{ width: `${(completed / total) * 100}%` }}
                      className="bg-emerald-500 h-full transition-all duration-500"
                      title={`Completed: ${completed}`}
                    />
                    <div
                      style={{ width: `${(inProgress / total) * 100}%` }}
                      className="bg-sky-500 h-full transition-all duration-500"
                      title={`In Progress: ${inProgress}`}
                    />
                    <div
                      style={{ width: `${(todo / total) * 100}%` }}
                      className="bg-amber-400 h-full transition-all duration-500"
                      title={`To Do: ${todo}`}
                    />
                  </>
                )}
              </div>

              {/* Contextual Metrics Row */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-wrap gap-2 pt-0.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {completed} / {total} tasks completed
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                  {overdue > 0 && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">
                        {overdue} overdue
                      </span>
                    </>
                  )}
                </div>

                <Link
                  to={`/projects/${project.id}`}
                  className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5"
                >
                  <span>View project</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
