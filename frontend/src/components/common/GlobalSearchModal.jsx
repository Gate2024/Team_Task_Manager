import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi, tasksApi } from '../../api';
import { StatusBadge } from '../StatusBadge';
import { PriorityBadge } from './PriorityBadge';

export function GlobalSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load real workspace data when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setLoading(true);
      Promise.allSettled([projectsApi.list(), tasksApi.listAll()])
        .then(([pRes, tRes]) => {
          if (pRes.status === 'fulfilled') {
            const data = pRes.value;
            setProjects(Array.isArray(data) ? data : data.projects || []);
          }
          if (tRes.status === 'fulfilled') {
            const data = tRes.value;
            setTasks(Array.isArray(data) ? data : data.tasks || []);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Filtered results
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        projects: projects.slice(0, 4),
        tasks: tasks.slice(0, 6),
      };
    }

    const matchedProjects = projects.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
    );

    const matchedTasks = tasks.filter(
      (t) =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
    );

    return {
      projects: matchedProjects.slice(0, 6),
      tasks: matchedTasks.slice(0, 10),
    };
  }, [query, projects, tasks]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global search dialog"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-950/50">
          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search projects, tasks, deliverables..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="p-3 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading workspace indexed items...</div>
          ) : filtered.projects.length === 0 && filtered.tasks.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No matching projects or tasks found for "{query}".
            </div>
          ) : (
            <>
              {/* Projects Group */}
              {filtered.projects.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 block">
                    Projects ({filtered.projects.length})
                  </span>
                  <div className="space-y-1">
                    {filtered.projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onClose();
                          navigate(`/projects/${p.id}`);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            P
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                              {p.name}
                            </p>
                            {p.description && (
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">{p.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
                          Open &rarr;
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Group */}
              {filtered.tasks.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 block">
                    Tasks ({filtered.tasks.length})
                  </span>
                  <div className="space-y-1">
                    {filtered.tasks.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onClose();
                          navigate(`/projects/${t.project_id}`);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-3">
                          <PriorityBadge priority={t.priority} size="small" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                              {t.title}
                            </p>
                            {t.assignee && (
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                Assigned to: {t.assignee.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={t.status} size="small" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-[10px] text-slate-400 flex items-center justify-between px-4">
          <span>Navigate with click or Enter</span>
          <span>TeamTask Workspace</span>
        </div>
      </div>
    </div>
  );
}
