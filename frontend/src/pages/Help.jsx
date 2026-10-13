import React, { useState, useMemo } from 'react';
import { AppShell } from '../components/layout/AppShell';

export function Help() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const guides = [
    {
      category: 'getting-started',
      categoryName: 'Getting Started',
      title: 'Platform Architecture & Workspace Hierarchy',
      content:
        'TeamTask organizes work into hierarchical scopes: Company -> Projects/Workspaces -> Team Members -> Tasks & Cases -> Discussion & Notifications -> Reports. You can switch between active projects and view aggregated KPIs on your Dashboard.',
    },
    {
      category: 'getting-started',
      categoryName: 'Getting Started',
      title: 'Global Search & Command Palette (Ctrl+K)',
      content:
        'Press Ctrl+K (or Cmd+K on macOS) anywhere across the application to trigger the unified Search Palette. Search across projects, tasks, cases, and team members with instant navigation.',
    },
    {
      category: 'projects',
      categoryName: 'Projects & Workspaces',
      title: 'Role-Based Access Control (RBAC)',
      content:
        'Projects support three strict server-enforced roles: Owner (full administrative and deletion powers), Admin (task, case, and member management), and Member (visibility of assigned work, collaboration, and self-assignment).',
    },
    {
      category: 'tasks',
      categoryName: 'Task Management',
      title: 'Kanban Board & Workflow Lifecycles',
      content:
        'Tasks move through three states: TODO, IN PROGRESS, and DONE. On desktop viewports, drag and drop cards directly between columns with optimistic updates and automatic server validation. On mobile viewports, the board scrolls smoothly or stacks neatly to prevent horizontal viewport clipping.',
    },
    {
      category: 'tasks',
      categoryName: 'Task Management',
      title: 'Task Self-Assignment Rules',
      content:
        'Any active project member can claim an unassigned task by clicking "Assign to me". The backend prevents race conditions with conflict locks; members cannot take away tasks already assigned to another teammate.',
    },
    {
      category: 'cases',
      categoryName: 'Cases & Tickets',
      title: 'Understanding Tasks vs. Cases',
      content:
        'A Task represents planned implementation work. A Case represents an issue, incident, customer request, or defect that requires resolution. Cases possess ticket numbers (e.g., CASE-1001) and follow an OPEN -> IN PROGRESS -> RESOLVED -> CLOSED lifecycle.',
    },
    {
      category: 'collaboration',
      categoryName: 'Collaboration & Mentions',
      title: 'Comments and @Mentions System',
      content:
        'Leave resolution updates and comments directly on tasks and cases. Typing @username sends a persistent notification directly to that team member with an instant deep-link to the conversation.',
    },
    {
      category: 'notifications',
      categoryName: 'Notifications',
      title: 'Persistent Notification Center',
      content:
        'Receive alerts when deliverables are assigned to you, when case statuses change, or when you are mentioned. Click the bell in the topbar to preview alerts or visit the full Notifications center to mark individual items or all alerts as read.',
    },
    {
      category: 'reports',
      categoryName: 'Productivity Reports',
      title: 'Executive Metrics & Workload Privacy',
      content:
        'Project Owners and Admins can view project velocity, delivery percentages, and full team capacity matrices. Regular members see their own productivity metrics and pending tasks, ensuring sensitive colleague data remains confidential.',
    },
    {
      category: 'account',
      categoryName: 'Account & Security',
      title: 'Persistent Profile Images & Security',
      content:
        'Profile pictures are stored in validated persistent media storage and automatically synchronized across all avatar components. Sessions are secured via HttpOnly JWT cookies and double-submit CSRF tokens.',
    },
  ];

  const categories = [
    { id: 'all', name: 'All Guides' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'projects', name: 'Projects' },
    { id: 'tasks', name: 'Tasks & Kanban' },
    { id: 'cases', name: 'Cases & Tickets' },
    { id: 'collaboration', name: 'Comments & Mentions' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'reports', name: 'Reports' },
    { id: 'account', name: 'Account & Security' },
  ];

  const filteredGuides = useMemo(() => {
    let result = guides;
    if (activeCategory !== 'all') {
      result = result.filter((g) => g.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.content.toLowerCase().includes(q) ||
          g.categoryName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [guides, activeCategory, search]);

  return (
    <AppShell breadcrumb="Help & Documentation">
      <div className="space-y-6 animate-fadeIn pb-12 w-full">
        {/* Header Hero */}
        <div className="bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Knowledge Base & Product Guides
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-2 max-w-2xl leading-relaxed">
            Everything you need to know about navigating projects, tracking tasks and cases, collaborating with team members, and generating productivity insights.
          </p>

          {/* Search bar inside hero */}
          <div className="mt-6 relative max-w-xl">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help articles, shortcuts, features..."
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-white/10 backdrop-blur-md text-white placeholder-indigo-200 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 shadow-inner"
            />
            <svg className="w-5 h-5 text-indigo-200 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === c.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Guides List */}
        <div className="space-y-4">
          {filteredGuides.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">No articles found</h3>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for a different keyword or selecting "All Guides".
              </p>
            </div>
          ) : (
            filteredGuides.map((guide, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                    {guide.categoryName}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {guide.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {guide.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
