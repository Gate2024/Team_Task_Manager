import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PublicLayout } from '../components/layout/PublicLayout';

export function Features() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');

  const featureItems = [
    {
      id: 'projects',
      category: 'workspaces',
      badge: 'Workspaces',
      title: 'Project & Workspace Management',
      description:
        'Establish independent project workspaces with custom descriptions, dedicated member assignments, and clear initiative boundaries. Maintain complete oversight over deliverable schedules and team workloads.',
      icon: (
        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      highlights: ['Multiple concurrent workspaces', 'Project-level ownership', 'Member permission scoping'],
    },
    {
      id: 'kanban',
      category: 'tasks',
      badge: 'Execution',
      title: 'Interactive Kanban Boards & Tasks',
      description:
        'Coordinate day-to-day deliverables on interactive columns (To Do, In Progress, Completed). Filter by urgency, track due dates, assign team owners, and update status instantly.',
      icon: (
        <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      highlights: ['To Do, In Progress, and Done lifecycles', 'Priority badges (Urgent, High, Medium, Low)', 'Self-assignment rules'],
    },
    {
      id: 'cases',
      category: 'support',
      badge: 'Issue Tracking',
      title: 'Operational Cases & Ticket Management',
      description:
        'Differentiate strategic implementation tasks from defects and customer issues. Generate unique ticket identifiers (e.g., CASE-1001) and follow structured lifecycle states (Open, In Progress, Resolved, Closed).',
      icon: (
        <svg className="w-6 h-6 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      highlights: ['Sequential ticket numbers', 'Dedicated resolution lifecycle', 'Cross-project issue organization'],
    },
    {
      id: 'collaboration',
      category: 'collaboration',
      badge: 'Communication',
      title: 'Contextual Comments & @Mentions',
      description:
        'Keep discussions right where the work happens. Leave feedback directly on tasks and cases, mention team members with @username, and trigger immediate notifications.',
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      highlights: ['Contextual comment threads', 'Automated creator notifications', '@Mention alert delivery'],
    },
    {
      id: 'rbac',
      category: 'governance',
      badge: 'Security',
      title: 'Granular Role-Based Access Control',
      description:
        'Enforce strict administrative boundaries with server-validated permissions. Project Owners maintain deletion and management rights, Admins orchestrate members and tasks, while Members focus on assigned deliverables.',
      icon: (
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      highlights: ['Owner, Admin, and Member roles', 'Server-enforced action authorization', 'Role-dependent data visibility'],
    },
    {
      id: 'activity',
      category: 'governance',
      badge: 'Accountability',
      title: 'Immutable Audit & Activity Stream',
      description:
        'Review a chronological audit trail of all project events, task completions, case status updates, and membership changes. Filter events by project or review platform-wide momentum.',
      icon: (
        <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      highlights: ['Timestamped activity logs', 'Project-specific filtering', 'Action-tagged event classification'],
    },
    {
      id: 'reports',
      category: 'analytics',
      badge: 'Insights',
      title: 'Productivity Reports & Velocity Metrics',
      description:
        'Evaluate delivery velocity, overdue task counts, and completion percentages. Project leaders gain aggregated team capacity metrics while member privacy remains strictly protected.',
      icon: (
        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      highlights: ['Completion rate charts', 'Overdue deliverable tracking', 'Team workload distribution'],
    },
    {
      id: 'notifications',
      category: 'collaboration',
      badge: 'Alerts',
      title: 'Persistent Notification Center',
      description:
        'Never miss a deadline or comment. Receive real-time popover notifications and visit the dedicated center to mark items as read or navigate directly to the relevant task or ticket.',
      icon: (
        <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      highlights: ['Unread counters & badge markers', 'One-click deep navigation', 'Mark all read controls'],
    },
  ];

  const filteredFeatures = activeCategory === 'all'
    ? featureItems
    : featureItems.filter((f) => f.category === activeCategory);

  return (
    <PublicLayout>
      <div className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        {/* Ambient Radial Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-indigo-500/15 via-violet-500/15 to-transparent blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-sky-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
              <span>Full Platform Capabilities</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Engineered for High-Velocity{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-500 dark:from-indigo-400 dark:via-violet-300 dark:to-indigo-200 bg-clip-text text-transparent">
                Team Execution
              </span>
            </h1>
            <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Discover how TeamTask unifies project management, Kanban workflows, operational ticket resolution, and granular governance into a cohesive SaaS ecosystem.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {[
                { id: 'all', label: 'All Capabilities' },
                { id: 'workspaces', label: 'Workspaces' },
                { id: 'tasks', label: 'Kanban & Tasks' },
                { id: 'support', label: 'Cases & Tickets' },
                { id: 'collaboration', label: 'Collaboration' },
                { id: 'governance', label: 'Governance & Audit' },
                { id: 'analytics', label: 'Analytics' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105'
                      : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredFeatures.map((feat) => (
              <div
                key={feat.id}
                id={feat.id}
                className="group relative bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                      {feat.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                    Key Highlights
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {feat.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Call to Action Strip */}
          <div className="mt-16 sm:mt-20 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="relative max-w-2xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ready to Experience These Capabilities?
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                Create a workspace in seconds, invite your teammates, and start orchestrating deliverables with total accountability.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-7 py-3 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all"
                  >
                    Go to Workspace Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="w-full sm:w-auto px-7 py-3 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all hover:scale-105"
                    >
                      Get Started Free
                    </Link>
                    <Link
                      to="/login"
                      className="w-full sm:w-auto px-7 py-3 bg-indigo-800/40 hover:bg-indigo-800/60 border border-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all"
                    >
                      Sign In to Workspace
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default Features;
