import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { projectsApi, casesApi } from '../api';
import { useToast } from '../context/ToastContext';
import { AppShell } from '../components/layout/AppShell';

export function CreateCase() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const urlProjectId = searchParams.get('project_id');

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(urlProjectId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const res = await projectsApi.list();
        const list = res.projects || (Array.isArray(res) ? res : []);
        setProjects(list);

        if (urlProjectId) {
          setSelectedProjectId(urlProjectId);
        } else if (list.length > 0) {
          setSelectedProjectId(String(list[0].id));
        }
      } catch (err) {
        setError(err.data?.message || err.message || 'Failed to load projects');
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [urlProjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setError('Please select a project to associate with this case');
      return;
    }
    if (!title.trim()) {
      setError('Case title is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      project_id: parseInt(selectedProjectId, 10),
      priority,
      due_date: dueDate || null,
    };

    try {
      const res = await casesApi.create(payload);
      const newCase = res.case || res;
      toast.success(
        `Case ${newCase.ticket_number ? `#${newCase.ticket_number}` : ''} created successfully!`
      );
      if (urlProjectId) {
        navigate(`/projects/${urlProjectId}`);
      } else {
        navigate('/cases');
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to create case');
      toast.error(err.data?.message || 'Could not create case');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelBackUrl = urlProjectId ? `/projects/${urlProjectId}` : '/cases';

  return (
    <AppShell breadcrumb="Create Case">
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn pb-16">
        {/* Top Back Navigation & Header */}
        <div className="space-y-3">
          <Link
            to={cancelBackUrl}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors group"
          >
            <svg
              className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Cases & Tickets</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 mb-2">
                <span>Issue & Ticket Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create New Case & Ticket
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Log operational incidents, user bugs, or support escalations with full lifecycle resolution tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs sm:text-sm p-4 rounded-2xl flex items-start gap-3 animate-fadeIn">
            <svg className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold">Unable to Log Case</p>
              <p className="mt-0.5 text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Main Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Section 1: Associated Project */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Project Workspace
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select which initiative this incident or ticket belongs to.
                </p>
              </div>

              <div>
                <label htmlFor="caseProject" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Workspace <span className="text-rose-500">*</span>
                </label>
                {loadingProjects ? (
                  <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ) : projects.length === 0 ? (
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                    No active projects found. You must{' '}
                    <Link to="/projects/new" className="font-bold underline hover:text-amber-950">
                      create a project
                    </Link>{' '}
                    before logging cases.
                  </div>
                ) : (
                  <select
                    id="caseProject"
                    required
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Section 2: Case Specifications */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Issue Details
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Provide summary details and urgency indicators.
                </p>
              </div>

              <div>
                <label htmlFor="caseTitle" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Case Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="caseTitle"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Session invalidation on Safari mobile browser"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label htmlFor="casePriority" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Priority Level
                  </label>
                  <select
                    id="casePriority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="low">Low (Minor annoyance)</option>
                    <option value="medium">Medium (Standard priority)</option>
                    <option value="high">High (Impacting team work)</option>
                    <option value="urgent">Urgent (Production critical)</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label htmlFor="caseDueDate" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Resolution Date
                  </label>
                  <input
                    id="caseDueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="caseDesc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description & Reproduction Steps
                </label>
                <textarea
                  id="caseDesc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe observed behavior, expected outcome, error messages, and exact steps to reproduce..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm resize-y min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <Link
              to={cancelBackUrl}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !selectedProjectId}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition-all active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Logging Case...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Case</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

export default CreateCase;
