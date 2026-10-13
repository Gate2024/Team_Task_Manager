import React, { useState, useEffect } from 'react';
import { reportsApi, projectsApi } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { AppShell } from '../components/layout/AppShell';

export function Reports() {
  const { user } = useAuth();
  const toast = useToast();

  const [summary, setSummary] = useState(null);
  const [workload, setWorkload] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = selectedProjectId !== 'all' ? { project_id: selectedProjectId } : {};
      const [sumRes, workRes, projRes] = await Promise.all([
        reportsApi.getSummary(params),
        reportsApi.getWorkload(params),
        projectsApi.list(),
      ]);

      const sumData = sumRes.summary || sumRes;
      setSummary(sumData);

      const workData = workRes.workload || (Array.isArray(workRes) ? workRes : []);
      setWorkload(workData);

      const pList = projRes.projects || (Array.isArray(projRes) ? projRes : []);
      setProjects(pList);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to load productivity analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedProjectId]);

  const isAdmin = summary?.is_admin ?? (user?.is_admin || user?.role === 'admin' || user?.role === 'owner');

  return (
    <AppShell breadcrumb="Productivity Reports">
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isAdmin
                ? 'Executive overview of workspace completion velocity and team capacity'
                : 'Personal workload metrics, delivery rates, and pending responsibilities'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <label className="text-xs font-semibold text-slate-500">Scope:</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
            >
              <option value="all">All Accessible Workspaces</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Computing server-side productivity aggregations...
          </div>
        ) : !summary ? (
          <div className="py-16 text-center text-xs text-slate-400 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
            No report data available for the chosen scope.
          </div>
        ) : (
          <>
            {/* Top KPIs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isAdmin ? 'Total Tasks' : 'My Tasks'}
                </span>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {summary.total_tasks || 0}
                </p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>To Do: {summary.todo_tasks || 0}</span>
                  <span>Active: {summary.in_progress_tasks || 0}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                  Delivery Rate
                </span>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {summary.completion_rate || 0}%
                </p>
                <div className="mt-2 text-[11px] text-slate-500">
                  {summary.completed_tasks || 0} tasks completed
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                  {isAdmin ? 'Cases & Issues' : 'My Cases'}
                </span>
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                  {summary.total_cases || 0}
                </p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Open: {summary.open_cases || 0}</span>
                  <span>Resolved: {summary.resolved_cases || 0}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                  Overdue Deadlines
                </span>
                <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                  {summary.overdue_tasks || 0}
                </p>
                <div className="mt-2 text-[11px] text-slate-500">
                  {summary.overdue_tasks > 0 ? 'Requires immediate action' : 'Zero overdue items!'}
                </div>
              </div>
            </div>

            {/* Breakdown Visuals: Status & Priority Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Task Status Breakdown
                  </h3>
                  <span className="text-[11px] text-slate-400">Real-time pipeline</span>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Completed (Done)</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {summary.completed_tasks || 0} ({summary.completion_rate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${summary.completion_rate || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600 dark:text-slate-400">In Progress</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {summary.in_progress_tasks || 0}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            summary.total_tasks > 0
                              ? Math.round((summary.in_progress_tasks / summary.total_tasks) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600 dark:text-slate-400">To Do</span>
                      <span className="text-amber-500">{summary.todo_tasks || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            summary.total_tasks > 0
                              ? Math.round((summary.todo_tasks / summary.total_tasks) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority Distribution */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Priority Distribution
                  </h3>
                  <span className="text-[11px] text-slate-400">Urgency allocation</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {Object.entries(summary.priority_distribution || {}).map(([pri, count]) => {
                    const colors = {
                      urgent: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60',
                      high: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
                      medium: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60',
                      low: 'text-slate-600 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800',
                    };
                    return (
                      <div
                        key={pri}
                        className={`p-3.5 rounded-2xl border ${colors[pri] || colors.medium} flex flex-col justify-between`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider">{pri}</span>
                        <p className="text-2xl font-extrabold mt-2">{count}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Team Capacity / Workload Matrix Table */}
            <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {isAdmin ? 'Team Workload & Capacity Matrix' : 'My Contribution Summary'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAdmin
                      ? 'Granular breakdown of workload by team member across active projects'
                      : 'Summary of your assigned deliverables and active contributions'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {workload.length} Member{workload.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-3">Member</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3 text-center">Total Tasks</th>
                      <th className="py-3 px-3 text-center">Done</th>
                      <th className="py-3 px-3 text-center">In Progress</th>
                      <th className="py-3 px-3 text-center">Overdue</th>
                      <th className="py-3 px-3 text-center">Active Cases</th>
                      <th className="py-3 px-3 text-right">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {workload.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-6 text-center text-slate-400">
                          No team workload records found.
                        </td>
                      </tr>
                    ) : (
                      workload.map((m) => (
                        <tr
                          key={m.user_id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
                        >
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                                {m.name ? m.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{m.name}</p>
                                <p className="text-[10px] text-slate-400">{m.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {m.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                            {m.total_tasks}
                          </td>
                          <td className="py-3.5 px-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                            {m.completed_tasks}
                          </td>
                          <td className="py-3.5 px-3 text-center font-semibold text-indigo-600 dark:text-indigo-400">
                            {m.in_progress_tasks}
                          </td>
                          <td className="py-3.5 px-3 text-center font-semibold text-rose-600 dark:text-rose-400">
                            {m.overdue_tasks}
                          </td>
                          <td className="py-3.5 px-3 text-center font-semibold text-violet-600 dark:text-violet-400">
                            {m.active_cases}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <span className="font-extrabold text-slate-900 dark:text-white">
                              {m.completion_rate}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
