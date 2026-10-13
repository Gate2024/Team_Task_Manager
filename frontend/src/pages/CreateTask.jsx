import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { projectsApi, tasksApi } from '../api';
import { useToast } from '../context/ToastContext';
import { AppShell } from '../components/layout/AppShell';

export function CreateTask() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const urlProjectId = searchParams.get('project_id');
  const urlStatus = searchParams.get('status');

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(urlProjectId || '');
  const [members, setMembers] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(urlStatus || 'todo');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 1. Load accessible projects
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

  // 2. Load members whenever selected project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setMembers([]);
      return;
    }
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const res = await projectsApi.listMembers(selectedProjectId);
        const list = res.members || (Array.isArray(res) ? res : []);
        setMembers(list);
      } catch (err) {
        // Members list may fail if user does not have permission, gracefully handle
        setMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, [selectedProjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setError('Please select a project for this task');
      return;
    }
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigned_to: assignedTo ? parseInt(assignedTo, 10) : null,
      due_date: dueDate || null,
    };

    try {
      await tasksApi.create(selectedProjectId, payload);
      toast.success('Task created successfully!');
      navigate(`/projects/${selectedProjectId}`);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to create task');
      toast.error(err.data?.message || 'Could not create task');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProject = projects.find((p) => String(p.id) === String(selectedProjectId));
  const cancelBackUrl = selectedProjectId ? `/projects/${selectedProjectId}` : '/dashboard';

  return (
    <AppShell breadcrumb="Create Task">
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
            <span>
              Back to {selectedProject ? selectedProject.name : 'Workspace'}
            </span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 mb-2">
                <span>Task Orchestration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create New Task
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Define deliverables, assign ownership, establish priorities, and schedule deadlines for your team.
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
              <p className="font-semibold">Unable to Create Task</p>
              <p className="mt-0.5 text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Main Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Section 1: Project Association */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Target Project
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose which initiative this deliverable belongs to.
                </p>
              </div>

              <div>
                <label htmlFor="taskProject" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
                    before adding tasks.
                  </div>
                ) : (
                  <select
                    id="taskProject"
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

            {/* Section 2: Task Details */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Task Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  State clear objectives and requirements for whoever executes this work.
                </p>
              </div>

              <div>
                <label htmlFor="taskTitle" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="taskTitle"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement resilient token refresh middleware"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>

              <div>
                <label htmlFor="taskDesc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description & Acceptance Criteria
                </label>
                <textarea
                  id="taskDesc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline expected deliverables, edge cases, technical links, and testing verification..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm resize-y min-h-[100px]"
                />
              </div>
            </div>

            {/* Section 3: Scheduling, Priority & Assignment */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Scheduling & Ownership
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure assignment, initial column status, priority level, and target due date.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Assignee */}
                <div>
                  <label htmlFor="taskAssignee" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Assignee
                  </label>
                  <select
                    id="taskAssignee"
                    value={assignedTo}
                    disabled={loadingMembers}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => {
                      const memberId = m.user_id || m.id;
                      return (
                        <option key={memberId} value={memberId}>
                          {m.name || m.user?.name || `User #${memberId}`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Initial Status */}
                <div>
                  <label htmlFor="taskStatus" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Initial Status
                  </label>
                  <select
                    id="taskStatus"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label htmlFor="taskPriority" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Priority
                  </label>
                  <select
                    id="taskPriority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label htmlFor="taskDueDate" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Due Date
                  </label>
                  <input
                    id="taskDueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
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
                  <span>Creating Task...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

export default CreateTask;
