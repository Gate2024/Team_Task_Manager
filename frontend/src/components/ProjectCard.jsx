import React from 'react';
import { Link } from 'react-router-dom';

const ROLE_BADGES = {
  owner: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  admin: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  member: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
};

export function ProjectCard({ project, userRole = 'member' }) {
  const roleBadgeStyle = ROLE_BADGES[userRole] || ROLE_BADGES.member;

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${roleBadgeStyle}`}
          >
            {userRole}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {project.memberships?.length || 1} members
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
          {project.name}
        </h3>
        {project.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Owner: {project.owner?.name || 'Self'}
        </span>
        <Link
          to={`/projects/${project.id}`}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
        >
          View tasks &rarr;
        </Link>
      </div>
    </div>
  );
}
