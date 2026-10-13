import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksApi } from '../../api';

export function NotificationsPopover({ isOpen, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      tasksApi.listAll()
        .then((res) => {
          const list = Array.isArray(res) ? res : res.tasks || [];
          setTasks(list);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'done' && t.due_date && t.due_date < today
  );
  const dueTodayTasks = tasks.filter(
    (t) => t.status !== 'done' && t.due_date === today
  );

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-3 z-40 animate-slideDown flex flex-col max-h-[80vh]">
        <div className="px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Notifications & Activity
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Deliverables requiring your attention
            </p>
          </div>
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
        </div>

        <div className="p-3 overflow-y-auto custom-scrollbar flex-1 space-y-3">
          {loading ? (
            <div className="py-6 text-center text-xs text-slate-400">Checking task updates...</div>
          ) : overdueTasks.length === 0 && dueTodayTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <span className="text-emerald-500 font-bold block mb-1">All clear!</span>
              No overdue deadlines or urgent items today.
            </div>
          ) : (
            <>
              {overdueTasks.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1.5 px-1">
                    Overdue Deadlines ({overdueTasks.length})
                  </span>
                  <div className="space-y-1.5">
                    {overdueTasks.slice(0, 4).map((t) => (
                      <Link
                        key={t.id}
                        to={`/projects/${t.project_id}`}
                        onClick={onClose}
                        className="block p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 hover:bg-rose-100/60 transition-colors"
                      >
                        <p className="text-xs font-bold text-rose-950 dark:text-rose-200 truncate">
                          {t.title}
                        </p>
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">
                          Was due on {t.due_date} &bull; Status: {t.status}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {dueTodayTasks.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1.5 px-1">
                    Due Today ({dueTodayTasks.length})
                  </span>
                  <div className="space-y-1.5">
                    {dueTodayTasks.slice(0, 4).map((t) => (
                      <Link
                        key={t.id}
                        to={`/projects/${t.project_id}`}
                        onClick={onClose}
                        className="block p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 hover:bg-amber-100/60 transition-colors"
                      >
                        <p className="text-xs font-bold text-amber-950 dark:text-amber-200 truncate">
                          {t.title}
                        </p>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                          Scheduled for completion today
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            to="/dashboard?filter=mine"
            onClick={onClose}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View all my active tasks &rarr;
          </Link>
        </div>
      </div>
    </>
  );
}
