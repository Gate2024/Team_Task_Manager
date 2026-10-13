import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { activityApi, projectsApi } from '../api';
import { useToast } from '../context/ToastContext';
import { AppShell } from '../components/layout/AppShell';

export function Activity() {
  const toast = useToast();
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      const [actRes, projRes] = await Promise.all([
        selectedProjectId === 'all'
          ? activityApi.listGlobal({ limit: 60 })
          : activityApi.listProject(selectedProjectId, { limit: 60 }),
        projectsApi.list(),
      ]);

      const actList = actRes.activity || actRes.activities || (Array.isArray(actRes) ? actRes : []);
      setActivities(actList);

      const pList = projRes.projects || (Array.isArray(projRes) ? projRes : []);
      setProjects(pList);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivityData();
  }, [selectedProjectId]);

  const formatAction = (action) => {
    const map = {
      project_created: { text: 'created project', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
      project_updated: { text: 'updated project', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
      member_added: { text: 'added member to', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
      member_removed: { text: 'removed member from', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
      task_created: { text: 'created task', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
      task_status_changed: { text: 'updated task status on', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
      task_completed: { text: 'completed task', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
      task_self_assigned: { text: 'self-assigned task', color: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
      task_deleted: { text: 'deleted task', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
      case_created: { text: 'opened case', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
      case_status_changed: { text: 'updated case status on', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
      case_resolved: { text: 'resolved case', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
      case_closed: { text: 'closed case', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
      case_self_assigned: { text: 'self-assigned case', color: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
      comment_added: { text: 'commented on', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
    };
    return map[action] || { text: action.replace('_', ' '), color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' };
  };

  const getRelativeTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <AppShell breadcrumb="Audit & Activity Log">
      <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Activity Stream
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Immutable audit timeline of deliverables, assignments, and ticket progress
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <label className="text-xs font-semibold text-slate-500">Filter:</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
            >
              <option value="all">Global Workspace Stream</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading audit history...</div>
          ) : activities.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No recent activity recorded for this workspace.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-6">
              {activities.map((item) => {
                const actor = item.actor || {};
                const actionInfo = formatAction(item.action);
                const metadata = item.metadata || {};

                return (
                  <div key={item.id} className="relative pl-6 sm:pl-8 group">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500" />

                    <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {/* Actor Avatar */}
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {actor.name ? actor.name.charAt(0).toUpperCase() : 'U'}
                          </div>

                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {actor.name || 'Team member'}
                          </span>

                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {actionInfo.text}
                          </span>

                          {/* Object Name */}
                          {metadata.title && (
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                              "{metadata.title}"
                            </span>
                          )}

                          {metadata.name && (
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                              "{metadata.name}"
                            </span>
                          )}

                          {metadata.ticket_number && (
                            <Link
                              to={`/cases?id=${item.case_id}`}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:underline"
                            >
                              {metadata.ticket_number}
                            </Link>
                          )}
                        </div>

                        <span className="text-[11px] font-medium text-slate-400 flex-shrink-0">
                          {getRelativeTime(item.created_at)}
                        </span>
                      </div>

                      {/* Additional Context or Sub-details */}
                      {(metadata.new_status || metadata.old_status) && (
                        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                          <span className="uppercase text-[9px] font-bold text-slate-400">Transition:</span>
                          <span className="line-through">{metadata.old_status}</span>
                          <span>&rarr;</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {metadata.new_status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
