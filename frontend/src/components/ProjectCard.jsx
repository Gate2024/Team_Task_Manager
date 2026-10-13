import React from 'react';
import { Link } from 'react-router-dom';

const ROLE_BADGES = {
  owner: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  admin: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  member: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
};

export function ProjectCard({ project, userRole = 'member', projectTasks = [] }) {
  const roleBadgeStyle = ROLE_BADGES[userRole] || ROLE_BADGES.member;

  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t) => t.status === 'done').length;
  const overdueTasks = projectTasks.filter(
    (t) => t.status !== 'done' && t.due_date && t.due_date < new Date().toISOString().split('T')[0]
  ).length;

  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Health tag determination
  let healthLabel = 'On Track';
  let healthStyle = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60';
  if (overdueTasks > 0) {
    healthLabel = 'Needs Attention';
    healthStyle = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60';
  }
  if (overdueTasks >= 3 || (totalTasks > 0 && pct === 0 && overdueTasks > 0)) {
    healthLabel = 'At Risk';
    healthStyle = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60';
  }

  const memberships = project.memberships || [];

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group">
      <div>
        {/* Top Badges: Role and Health */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${roleBadgeStyle}`}
          >
            {userRole}
          </span>

          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${healthStyle}`}
          >
            {healthLabel}
          </span>
        </div>

        {/* Project Title */}
        <Link
          to={`/projects/${project.id}`}
          className="text-base font-bold text-slate-900 dark:text-white mb-1.5 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block"
        >
          {project.name}
        </Link>

        {/* Project Description or Fallback */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed min-h-[32px]">
          {project.description || 'Collaborative workspace initiative and deliverables.'}
        </p>

        {/* Progress & Task Completion Metric */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-300">{pct}% complete</span>
            <span className="text-[11px] text-slate-400">
              {completedTasks} / {totalTasks} tasks
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              style={{ width: `${pct}%` }}
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Card Footer: Members Stack + Open Workspace Action */}
      <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between gap-3">
        {/* Member Avatars Stack */}
        <div className="flex -space-x-1.5 overflow-hidden">
          {memberships.length === 0 ? (
            <div className="w-6 h-6 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center uppercase ring-2 ring-white dark:ring-slate-900 flex-shrink-0">
              {project.owner?.profile_image_url ? (
                <img
                  src={project.owner.profile_image_url}
                  alt={project.owner?.name || 'Owner'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                (project.owner?.name || 'U').charAt(0)
              )}
            </div>
          ) : (
            memberships.slice(0, 3).map((m, idx) => (
              <div
                key={m.id || idx}
                title={m.user?.name || 'Member'}
                className="w-6 h-6 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center uppercase ring-2 ring-white dark:ring-slate-900 flex-shrink-0"
              >
                {m.user?.profile_image_url ? (
                  <img
                    src={m.user.profile_image_url}
                    alt={m.user?.name || 'Member'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  (m.user?.name || 'M').charAt(0)
                )}
              </div>
            ))
          )}
          {memberships.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
              +{memberships.length - 3}
            </div>
          )}
        </div>

        {/* Action Link */}
        <Link
          to={`/projects/${project.id}`}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 group-hover:translate-x-0.5 transition-all flex items-center gap-1"
        >
          <span>Open workspace</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
