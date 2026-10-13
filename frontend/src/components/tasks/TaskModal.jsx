import React, { useState, useEffect } from 'react';

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  task = null, // null for create, object for edit
  members = [], // list of project members for assignee selection
  isMemberOnly = false, // true if user is regular member (can only edit description & status)
  loading = false,
}) {
  const isEditing = Boolean(task);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      setAssignedTo(task.assigned_to ? String(task.assigned_to) : '');
      setDueDate(task.due_date || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setAssignedTo('');
      setDueDate('');
    }
    setError(null);
  }, [task, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
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
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() && !isMemberOnly) {
      setError('Task title is required');
      return;
    }

    const payload = {};
    if (!isMemberOnly) {
      payload.title = title.trim();
      payload.priority = priority;
      payload.assigned_to = assignedTo ? parseInt(assignedTo, 10) : null;
      payload.due_date = dueDate || null;
    }
    payload.description = description.trim();
    payload.status = status;

    try {
      setError(null);
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to save task');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3
            id="task-modal-title"
            className="text-base font-bold text-slate-900 dark:text-white"
          >
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        {isMemberOnly && isEditing && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs rounded-xl">
            As an assigned member, you can update the task description and status.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Task Title {!isMemberOnly && <span className="text-rose-500">*</span>}
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              disabled={isMemberOnly || loading}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement OAuth Flow"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
              required={!isMemberOnly}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              id="task-desc"
              rows="3"
              value={description}
              disabled={loading}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, acceptance criteria, or technical details..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Grid: Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-status" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                id="task-status"
                value={status}
                disabled={loading}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                disabled={isMemberOnly || loading}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Grid: Assignee & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-assignee" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Assignee
              </label>
              <select
                id="task-assignee"
                value={assignedTo}
                disabled={isMemberOnly || loading}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Unassigned</option>
                {members.map((m) => {
                  const u = m.user || m;
                  const uid = m.user_id || u.id;
                  return (
                    <option key={uid} value={uid}>
                      {u.name} ({m.role || 'member'})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label htmlFor="task-due-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                disabled={isMemberOnly || loading}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
