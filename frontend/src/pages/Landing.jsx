import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PublicLayout } from '../components/layout/PublicLayout';

export function Landing() {
  const { user } = useAuth();

  // Interactive Demo State
  const [demoTab, setDemoTab] = useState('kanban');
  const [kanbanTasks, setKanbanTasks] = useState([
    { id: 1, title: 'Redesign Executive Analytics Dashboard', status: 'todo', priority: 'high', assignee: 'Sarah M.', date: 'Oct 18' },
    { id: 2, title: 'Implement Granular RBAC Permissions', status: 'in_progress', priority: 'urgent', assignee: 'Alex K.', date: 'Oct 15' },
    { id: 3, title: 'Audit Session Invalidation Middleware', status: 'done', priority: 'medium', assignee: 'David L.', date: 'Oct 12' },
  ]);
  const [selectedRolePreview, setSelectedRolePreview] = useState('admin');

  const moveTaskStatus = (taskId, nextStatus) => {
    setKanbanTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );
  };

  return (
    <PublicLayout>
        {/* ======================================================== */}
        {/* 2. HERO SECTION                                          */}
        {/* ======================================================== */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
          {/* Ambient Radial Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-indigo-500/15 via-violet-500/15 to-transparent blur-[140px] pointer-events-none rounded-full" />
          <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-sky-500/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-sm shadow-sm hover:border-indigo-500/50 transition-all cursor-default animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
              <span>Team Task Manager • Company Work Management & Collaboration</span>
            </div>

            {/* Primary Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-5xl mx-auto leading-[1.12]">
              Manage Projects. Coordinate Teams.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-500 dark:from-indigo-400 dark:via-violet-300 dark:to-indigo-200 bg-clip-text text-transparent">
                Get Work Done.
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Bring project management, task coordination, and team collaboration into one cohesive workspace. Track progress with clear visibility, resolve operational cases, and boost team productivity with strict role-based governance.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm sm:text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Go to Workspace Dashboard</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm sm:text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Get Started</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all shadow-sm"
                  >
                    <span>Login</span>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Highlights Strip */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Project Management</span>
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Task Progress Visibility</span>
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Team Collaboration & Cases</span>
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Role-Based Governance</span>
              </span>
            </div>

            {/* ======================================================== */}
            {/* 3. INTERACTIVE PRODUCT SHOWCASE COMPONENT                */}
            {/* ======================================================== */}
            <div className="mt-16 max-w-5xl mx-auto">
              <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl text-left transition-all">
                {/* Mock Window Title Bar & Interactive Tab Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1 truncate">
                      Primary Workspace / Core Engineering
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none">
                    <button
                      onClick={() => setDemoTab('kanban')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        demoTab === 'kanban'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Kanban Board
                    </button>
                    <button
                      onClick={() => setDemoTab('projects')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        demoTab === 'projects'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Projects
                    </button>
                    <button
                      onClick={() => setDemoTab('cases')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        demoTab === 'cases'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Cases & Tickets
                    </button>
                    <button
                      onClick={() => setDemoTab('rbac')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        demoTab === 'rbac'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Role Inspector
                    </button>
                  </div>
                </div>

                {/* Tab 1: Interactive Live Kanban Board */}
                {demoTab === 'kanban' && (
                  <div className="pt-6 animate-fadeIn">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Try clicking the quick-move buttons on cards below to simulate task transitions:
                      </span>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                        Interactive Demo
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Column 1: To Do */}
                      <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">To Do</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {kanbanTasks.filter((t) => t.status === 'todo').length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {kanbanTasks
                            .filter((t) => t.status === 'todo')
                            .map((task) => (
                              <div
                                key={task.id}
                                className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
                              >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                    {task.priority}
                                  </span>
                                  <span className="text-[10px] text-slate-400">{task.date}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                  {task.title}
                                </p>
                                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    {task.assignee}
                                  </span>
                                  <button
                                    onClick={() => moveTaskStatus(task.id, 'in_progress')}
                                    className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition-all shadow-sm"
                                  >
                                    Start &rarr;
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Column 2: In Progress */}
                      <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">In Progress</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            {kanbanTasks.filter((t) => t.status === 'in_progress').length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {kanbanTasks
                            .filter((t) => t.status === 'in_progress')
                            .map((task) => (
                              <div
                                key={task.id}
                                className="bg-white dark:bg-slate-900/90 border border-indigo-500/40 rounded-xl p-3.5 shadow-md transition-all"
                              >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    {task.priority}
                                  </span>
                                  <span className="text-[10px] text-slate-400">{task.date}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                  {task.title}
                                </p>
                                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    {task.assignee}
                                  </span>
                                  <button
                                    onClick={() => moveTaskStatus(task.id, 'done')}
                                    className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-all shadow-sm"
                                  >
                                    Done ✓
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Column 3: Done */}
                      <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Done</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {kanbanTasks.filter((t) => t.status === 'done').length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {kanbanTasks
                            .filter((t) => t.status === 'done')
                            .map((task) => (
                              <div
                                key={task.id}
                                className="bg-white dark:bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3.5 shadow-sm transition-all"
                              >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    Resolved
                                  </span>
                                  <span className="text-[10px] text-slate-400">{task.date}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white line-through opacity-75 leading-tight">
                                  {task.title}
                                </p>
                                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                    Completed
                                  </span>
                                  <button
                                    onClick={() => moveTaskStatus(task.id, 'todo')}
                                    className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                                  >
                                    Reset
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Project Initiatives Preview */}
                {demoTab === 'projects' && (
                  <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md">
                          Active Workspace
                        </span>
                        <span className="text-xs text-slate-500 font-medium">8 Members</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Cloud Infrastructure & Microservices
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        PostgreSQL 17 high-availability clustering, token refresh persistence, and Docker multi-stage build pipelines.
                      </p>
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">14 Tasks • 85% Complete</span>
                        <span className="text-emerald-600 font-bold">On Track</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2.5 py-1 rounded-md">
                          Core Product
                        </span>
                        <span className="text-xs text-slate-500 font-medium">12 Members</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Q4 Customer Experience & Help Center
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        Omnichannel incident escalation, contextual help articles, and member productivity reporting charts.
                      </p>
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">9 Tasks • 60% Complete</span>
                        <span className="text-amber-500 font-bold">In Review</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Cases & Support Tickets Preview */}
                {demoTab === 'cases' && (
                  <div className="pt-6 space-y-3 animate-fadeIn">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                            #CASE-1042
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            Urgent
                          </span>
                          <span className="text-xs text-slate-400">Target: Tomorrow</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          CSRF Double-Submit Validation Intermittent 403 on Safari
                        </h4>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 self-start sm:self-auto">
                        In Progress
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                            #CASE-1039
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Medium
                          </span>
                          <span className="text-xs text-slate-400">Target: Oct 22</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          Profile Avatar Upload Memory Optimization
                        </h4>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 self-start sm:self-auto">
                        Resolved
                      </span>
                    </div>
                  </div>
                )}

                {/* Tab 4: Role-Based Authorization Inspector */}
                {demoTab === 'rbac' && (
                  <div className="pt-6 space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Inspect Role Persona:</span>
                      {['owner', 'admin', 'member'].map((role) => (
                        <button
                          key={role}
                          onClick={() => setSelectedRolePreview(role)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                            selectedRolePreview === role
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>

                    <div className="p-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2.5 text-xs">
                      {selectedRolePreview === 'owner' && (
                        <>
                          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span>✓ Full Workspace Administration</span>
                            <span>Unrestricted</span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span>✓ Project Creation & Deletion</span>
                            <span>Owner Exclusive</span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span>✓ Member Demotion & Removal Protection</span>
                            <span>Cannot be demoted</span>
                          </div>
                        </>
                      )}
                      {selectedRolePreview === 'admin' && (
                        <>
                          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span>✓ Create & Assign Tasks Across All Members</span>
                            <span>Allowed</span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span>✓ Manage Cases & Operational Tickets</span>
                            <span>Allowed</span>
                          </div>
                          <div className="flex items-center justify-between text-rose-500 font-semibold">
                            <span>✕ Delete Project Workspace</span>
                            <span>Owner Only</span>
                          </div>
                        </>
                      )}
                      {selectedRolePreview === 'member' && (
                        <>
                          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span>✓ View & Update Progress on Assigned Tasks</span>
                            <span>Allowed</span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span>✓ Participate in Comments & Discussions</span>
                            <span>Allowed</span>
                          </div>
                          <div className="flex items-center justify-between text-rose-500 font-semibold">
                            <span>✕ Manage Members or Change Project Settings</span>
                            <span>Admin/Owner Only</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 4. PRODUCT / VALUE SECTION                               */}
        {/* ======================================================== */}
        <section className="py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Core Value
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                A Unified Hub for Team Productivity & Execution
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                Replace fragmented spreadsheets, disconnected chats, and scattered notes with a structured, role-governed workspace designed for clarity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Value 1 */}
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all duration-200">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Total Project Visibility</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Know exactly what each team is working on, which deliverables are approaching deadlines, and where blockers occur in real time.
                </p>
              </div>

              {/* Value 2 */}
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all duration-200">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Coordinated Execution</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Break down large company goals into scoped tasks. Assign responsibilities, establish priorities, and track milestones effortlessly.
                </p>
              </div>

              {/* Value 3 */}
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:border-indigo-500/40 transition-all duration-200">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-indigo-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Role-Governed Control</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Strict Owner, Admin, and Member permissions enforced directly at the API and database levels to protect proprietary workflows.
                </p>
              </div>

              {/* Value 4 */}
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:border-indigo-500/40 transition-all duration-200">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Team Velocity & Focus</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Eliminate status update meetings with transparent boards, live activity feeds, and automated notifications when work changes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 5. FEATURE HIGHLIGHTS (8 Existing Capabilities)          */}
        {/* ======================================================== */}
        <section id="features" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Feature Highlights
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                  Built for How Modern Teams Work
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
                  Real, production-grade capabilities engineered for day-to-day company execution.
                </p>
              </div>
              <Link
                to="/features"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 group self-start sm:self-auto"
              >
                <span>View all capabilities in detail</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Highlight 1: Project Management */}
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Project Management</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Organize team initiatives into scoped projects. Assign project admins, set descriptions, and monitor deliverable momentum.
                </p>
              </div>

              {/* Highlight 2: Task Management */}
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Task Management</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Break projects into manageable tasks with priorities (Urgent, High, Medium, Low), due dates, assignees, and detailed descriptions.
                </p>
              </div>

              {/* Highlight 3: Team Collaboration */}
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Team Collaboration</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Collaborate directly on tasks with contextual comment threads, @mention teammates, and notify task creators automatically.
                </p>
              </div>

              {/* Highlight 4: Progress Tracking */}
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Progress Tracking</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Visualize workflows on Kanban boards across To Do, In Progress, and Completed stages with instant progress percentage updates.
                </p>
              </div>

              {/* Highlight 5: Cases / Tickets */}
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Cases & Tickets</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Track operational issues, bug reports, and support tickets with dedicated identifiers (e.g. #CASE-1001) and custom resolution flows.
                </p>
              </div>

              {/* Highlight 6: Notifications */}
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Notifications</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Real-time alerts for task assignments, @mentions, status transitions, and comments so team members never miss an update.
                </p>
              </div>

              {/* Highlight 7: Activity Tracking */}
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Activity Tracking</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Transparent, timestamped audit streams across every project. Monitor who performed which action and review historical progress.
                </p>
              </div>

              {/* Highlight 8: Reports & Analytics */}
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Reports & Analytics</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Evaluate deliverable completion velocity, overdue tasks, and aggregated team workload distribution to optimize operations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 6. HOW IT WORKS (Prompt-Specified 6-Step Visual Flow)    */}
        {/* ======================================================== */}
        <section className="py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Simple & Structured Flow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                How It Works
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                From project inception to deliverable completion in six clear steps.
              </p>
            </div>

            {/* 6-Step Visual Cards Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
              {/* Step 1 */}
              <div className="relative bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-indigo-600/30">
                    1
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 01</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Create Project</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Establish a dedicated workspace for your initiative, define strategic goals, and outline project parameters.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-indigo-600/30">
                    2
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 02</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Add Team</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Invite teammates and assign granular roles (Owner, Admin, or Member) to govern workspace rights appropriately.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-indigo-600/30">
                    3
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 03</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Create / Assign Tasks</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Break deliverables into concrete tasks with priorities, estimated deadlines, and clear assignees.
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-indigo-600/30">
                    4
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 04</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Collaborate</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Discuss work in comment threads, mention colleagues (@username), log tickets, and receive immediate alerts.
                </p>
              </div>

              {/* Step 5 */}
              <div className="relative bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-indigo-600/30">
                    5
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 05</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Track Progress</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Move task cards across Kanban columns, monitor overdue items, and maintain total delivery transparency.
                </p>
              </div>

              {/* Step 6 */}
              <div className="relative bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-emerald-600/30">
                    ✓
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Step 06</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Complete Work</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Review finalized tasks, resolve cases, inspect velocity metrics, and celebrate delivered milestones together.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 7. ROLE GOVERNANCE TRANSPARENCY MATRIX                   */}
        {/* ======================================================== */}
        <section id="architecture" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Security & Role Invariants
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                Hierarchical RBAC Governance
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                Validated at database query level to protect workspace integrity.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Workspace Action</th>
                    <th className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">Workspace Owner</th>
                    <th className="py-3.5 px-4 font-bold text-purple-600 dark:text-purple-400">Project Admin</th>
                    <th className="py-3.5 px-4 font-bold text-sky-600 dark:text-sky-400">Project Member</th>
                    <th className="py-3.5 px-4 font-bold text-slate-400">Outsider</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">Create Workspace Projects</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 text-rose-500 font-semibold">No</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">Create & Assign Tasks</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 text-rose-500 font-semibold">No</td>
                    <td className="py-3 px-4 text-rose-500 font-semibold">No</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">Task Visibility Scope</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">All Project Tasks</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">All Project Tasks</td>
                    <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-semibold">Assigned Tasks Only</td>
                    <td className="py-3 px-4 text-rose-500 font-semibold">403 Forbidden</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">Update Status of Assigned Task</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 text-rose-500 font-semibold">No</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">Manage & Remove Members</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 text-rose-500 font-semibold">No</td>
                    <td className="py-3 px-4 text-rose-500 font-semibold">No</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 8. STRONG FINAL CTA SECTION                              */}
        {/* ======================================================== */}
        <section className="py-20 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-8 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/20">
                  Ready to Coordinate Your Team?
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                  Start managing your team's work more effectively.
                </h2>
                <p className="mt-4 text-sm sm:text-base text-indigo-100 max-w-2xl mx-auto leading-relaxed">
                  Join teams that coordinate deliverables, resolve operational cases, and track momentum with confidence. Everything you need to get work done.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  {user ? (
                    <Link
                      to="/dashboard"
                      className="w-full sm:w-auto px-8 py-3.5 bg-white text-indigo-600 hover:bg-slate-100 rounded-xl text-sm sm:text-base font-bold shadow-lg transition-all hover:scale-105 active:scale-100"
                    >
                      Go to Workspace Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/register"
                        className="w-full sm:w-auto px-8 py-3.5 bg-white text-indigo-600 hover:bg-slate-100 rounded-xl text-sm sm:text-base font-bold shadow-lg transition-all hover:scale-105 active:scale-100"
                      >
                        Get Started
                      </Link>
                      <Link
                        to="/login"
                        className="w-full sm:w-auto px-8 py-3.5 border border-white/30 hover:bg-white/10 text-white rounded-xl text-sm sm:text-base font-semibold transition-all"
                      >
                        Login
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
    </PublicLayout>
  );
}

export default Landing;
