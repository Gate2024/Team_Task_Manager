import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { Footer } from '../components/layout/Footer';

export function Landing() {
  const { user } = useAuth();

  // Interactive Kanban demo preview card state
  const [demoStatus, setDemoStatus] = useState('in_progress');
  const [activeTab, setActiveTab] = useState('kanban');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100 flex flex-col transition-colors duration-200 selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200">
      <PublicNavbar />

      <main className="flex-1">
        {/* ======================================================== */}
        {/* HERO SECTION                                             */}
        {/* ======================================================== */}
        <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-violet-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-sky-500/10 blur-[90px] pointer-events-none rounded-full" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-sm shadow-sm hover:border-indigo-500/50 transition-all cursor-default animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
              <span>v2.0 Monorepo Released — Role-Based Team Workspace</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-5xl mx-auto leading-[1.12]">
              Manage Projects with{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-500 dark:from-indigo-400 dark:via-violet-300 dark:to-indigo-200 bg-clip-text text-transparent">
                Absolute Velocity
              </span>
            </h1>

            {/* Subhead */}
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Task orchestration engineered for modern engineering teams. Strict PostgreSQL-enforced roles, HttpOnly CSRF cookie security, and live Kanban status lifecycles.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Go to Dashboard</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Start for Free</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all shadow-sm"
                  >
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>

            {/* ======================================================== */}
            {/* INTERACTIVE MOCK DASHBOARD & LIVE KANBAN PREVIEW CARD     */}
            {/* ======================================================== */}
            <div className="mt-16 max-w-4xl mx-auto">
              <div className="bg-white/85 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl text-left transition-all">
                {/* Mock Card Window Header */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2">
                      Workspace / Core-Infrastructure
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setActiveTab('kanban')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        activeTab === 'kanban'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Interactive Kanban
                    </button>
                    <button
                      onClick={() => setActiveTab('rbac')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        activeTab === 'rbac'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Role Inspector
                    </button>
                  </div>
                </div>

                {/* Tab 1: Live Interactive Task Status Card */}
                {activeTab === 'kanban' ? (
                  <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Column 1: To Do */}
                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">To Do</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          1
                        </span>
                      </div>
                      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Implement Redis Cache Layer</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Due next sprint</p>
                        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Assignee: Alex</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">To Do</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: In Progress (Interactive) */}
                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">In Progress</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {demoStatus === 'in_progress' ? '1' : '0'}
                        </span>
                      </div>

                      {demoStatus === 'in_progress' && (
                        <div className="bg-white dark:bg-slate-900/90 border border-indigo-500/30 rounded-xl p-3 shadow-md animate-fadeIn">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Migrate Schema to PostgreSQL 17</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Alembic revision applied</p>
                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Live Demo Card</span>
                            <button
                              onClick={() => setDemoStatus('done')}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold transition-colors"
                            >
                              Mark Done &rarr;
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Column 3: Done */}
                    <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Done</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          {demoStatus === 'done' ? '2' : '1'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {demoStatus === 'done' && (
                          <div className="bg-white dark:bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3 shadow-md animate-fadeIn">
                            <p className="text-xs font-bold text-slate-900 dark:text-white line-through text-slate-400 dark:text-slate-500">
                              Migrate Schema to PostgreSQL 17
                            </p>
                            <div className="mt-2 flex items-center justify-between text-[10px]">
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Resolved ✓</span>
                              <button
                                onClick={() => setDemoStatus('in_progress')}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                              >
                                Reopen
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Auth CSRF Double Cookie</p>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 inline-block">Done</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Tab 2: Role Architecture Inspector */
                  <div className="pt-6 space-y-3">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Workspace Owner</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Full administrative authority; cannot be removed or demoted.</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        OWNER
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Project Admin</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Can create tasks, update statuses, and remove regular members.</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        ADMIN
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Project Member</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Sees and updates assigned tasks only. No member management rights.</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                        MEMBER
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* FEATURE SHOWCASE & METRICS GRID                          */}
        {/* ======================================================== */}
        <section id="features" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/40 dark:bg-slate-950/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Core Architecture
              </h2>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                Engineered for High-Consequence Team Workflows
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Role RBAC Security</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every workspace enforces scoped roles (Owner, Admin, Member). Access rules are validated at database query level.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Task Lifecycles</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Track progress through To Do, In Progress, and Done lifecycles with foreign key integrity and due dates.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">HttpOnly JWT + CSRF</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tokens never sit in localStorage. Automatic double-submit CSRF cookie protection guards mutation endpoints.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">PostgreSQL 17 Native</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Powered by Alembic schema migrations and Psycopg 3. Fully orchestratable with Docker Compose in seconds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* ROLE PERMISSION ARCHITECTURE BREAKDOWN                   */}
        {/* ======================================================== */}
        <section id="architecture" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Security by Design
              </h2>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
                Documented Authorization Invariants
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Action</th>
                    <th className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">Owner</th>
                    <th className="py-3.5 px-4 font-bold text-purple-600 dark:text-purple-400">Admin</th>
                    <th className="py-3.5 px-4 font-bold text-sky-600 dark:text-sky-400">Member</th>
                    <th className="py-3.5 px-4 font-bold text-slate-400">Outsider</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">Create Workspace Project</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">Create / Assign Tasks</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">Yes</td>
                    <td className="py-3 px-4 text-rose-500 font-semibold">No</td>
                    <td className="py-3 px-4 text-rose-500 font-semibold">No</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">List Project Tasks</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">All Tasks</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">All Tasks</td>
                    <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-semibold">Assigned Only</td>
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
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">Remove Project Owner</td>
                    <td className="py-3 px-4 text-rose-500 font-bold">Never</td>
                    <td className="py-3 px-4 text-rose-500 font-bold">Never</td>
                    <td className="py-3 px-4 text-rose-500 font-bold">Never</td>
                    <td className="py-3 px-4 text-rose-500 font-bold">Never</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
