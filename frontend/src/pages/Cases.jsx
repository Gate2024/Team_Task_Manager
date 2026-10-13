import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { casesApi, projectsApi } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { AppShell } from '../components/layout/AppShell';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CommentsThread } from '../components/common/CommentsThread';
import { ConfirmModal } from '../components/common/ConfirmModal';

export function Cases() {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const searchParams = new URLSearchParams(location.search);
  const initialAssignedTo = searchParams.get('assigned_to') || 'all';
  const initialCaseId = searchParams.get('id');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState(initialAssignedTo);

  // Create form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    priority: 'medium',
    due_date: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [casesRes, projRes] = await Promise.all([
        casesApi.list({ limit: 100 }),
        projectsApi.list(),
      ]);

      const caseList = casesRes.cases || (Array.isArray(casesRes) ? casesRes : []);
      setCases(caseList);

      const projList = projRes.projects || (Array.isArray(projRes) ? projRes : []);
      setProjects(projList);

      if (projList.length > 0 && !formData.project_id) {
        setFormData((prev) => ({ ...prev, project_id: projList[0].id }));
      }

      // Check if URL specifies an ID to open
      if (initialCaseId) {
        const found = caseList.find((c) => String(c.id) === String(initialCaseId));
        if (found) {
          setSelectedCase(found);
        }
      }
    } catch (err) {
      toast.error(err.data?.message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Case title is required');
      return;
    }
    if (!formData.project_id) {
      toast.error('Please select a project');
      return;
    }

    try {
      setSubmitting(true);
      const res = await casesApi.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        project_id: parseInt(formData.project_id, 10),
        priority: formData.priority,
        due_date: formData.due_date || null,
      });

      const newCase = res.case || res;
      setCases((prev) => [newCase, ...prev]);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        project_id: projects[0]?.id || '',
        priority: 'medium',
        due_date: '',
      });
      toast.success('Case created successfully');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to create case');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelfAssign = async (caseItem) => {
    try {
      const res = await casesApi.selfAssign(caseItem.id);
      const updated = res.case || res;
      setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (selectedCase?.id === updated.id) {
        setSelectedCase(updated);
      }
      toast.success('Case assigned to you');
    } catch (err) {
      toast.error(err.data?.message || 'Could not self-assign case');
    }
  };

  const handleStatusChange = async (caseItem, newStatus) => {
    try {
      const res = await casesApi.update(caseItem.id, { status: newStatus });
      const updated = res.case || res;
      setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (selectedCase?.id === updated.id) {
        setSelectedCase(updated);
      }
      toast.success(`Case status set to ${newStatus}`);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update case status');
    }
  };

  const handleDeleteCase = async () => {
    if (!caseToDelete) return;
    try {
      setDeleting(true);
      await casesApi.delete(caseToDelete.id);
      setCases((prev) => prev.filter((c) => c.id !== caseToDelete.id));
      if (selectedCase?.id === caseToDelete.id) {
        setSelectedCase(null);
      }
      toast.success('Case deleted successfully');
      setCaseToDelete(null);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to delete case');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered list
  const filteredCases = useMemo(() => {
    let result = [...cases];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.ticket_number?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter((c) => c.priority === priorityFilter);
    }

    if (projectFilter !== 'all') {
      result = result.filter((c) => String(c.project_id) === String(projectFilter));
    }

    if (assigneeFilter === 'me') {
      result = result.filter((c) => c.assigned_to === user?.id);
    } else if (assigneeFilter === 'unassigned') {
      result = result.filter((c) => !c.assigned_to);
    }

    return result;
  }, [cases, search, statusFilter, priorityFilter, projectFilter, assigneeFilter, user?.id]);

  const getStatusBadge = (status) => {
    const map = {
      open: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      in_progress: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      resolved: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      closed: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
          map[status] || map.open
        }`}
      >
        {status?.replace('_', ' ') || 'open'}
      </span>
    );
  };

  return (
    <AppShell breadcrumb="Cases & Tickets">
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Cases & Tickets
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track issues, operational tickets, and resolution lifecycles
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Case</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket # or title..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Project */}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Assignee */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Assignees</option>
              <option value="me">Assigned to Me</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        {/* Content Layout: Table/Cards + Optional Detail Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className={`${selectedCase ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3`}>
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400">Loading cases...</div>
            ) : filteredCases.length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">No cases found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  No issues or tickets match your current filters. Create a new case to start tracking.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredCases.map((c) => {
                  const isSelected = selectedCase?.id === c.id;
                  const isOverdue = c.due_date && c.status !== 'closed' && new Date(c.due_date) < new Date();

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex-shrink-0">
                            {c.ticket_number}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {c.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 flex-wrap">
                              <span>Project: {c.project?.name || `#${c.project_id}`}</span>
                              {c.due_date && (
                                <span className={isOverdue ? 'text-rose-500 font-bold' : ''}>
                                  Due: {c.due_date}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
                          <PriorityBadge priority={c.priority} size="small" />
                          {getStatusBadge(c.status)}

                          {/* Assignee / Self Assign */}
                          {c.assignee ? (
                            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              {c.assignee.name}
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelfAssign(c);
                              }}
                              className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800"
                            >
                              Assign to me
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Case Detail Pane */}
          {selectedCase && (
            <div className="lg:col-span-5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg sticky top-20 space-y-5 animate-fadeIn">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {selectedCase.ticket_number}
                    </span>
                    <PriorityBadge priority={selectedCase.priority} size="small" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                    {selectedCase.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Workflow Selector */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Update Lifecycle Status
                </label>
                <div className="grid grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                  {['open', 'in_progress', 'resolved', 'closed'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedCase, st)}
                      className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        selectedCase.status === st
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee & Meta */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Assignee</span>
                  {selectedCase.assignee ? (
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedCase.assignee.name}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelfAssign(selectedCase)}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      Assign to me &rarr;
                    </button>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Project</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {selectedCase.project?.name || `#${selectedCase.project_id}`}
                  </span>
                </div>
              </div>

              {/* Description */}
              {selectedCase.description && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Problem Description
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                    {selectedCase.description}
                  </p>
                </div>
              )}

              {/* Discussion Comments Thread */}
              <CommentsThread caseId={selectedCase.id} title="Resolution Notes & Discussion" />

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-400">
                  Created {new Date(selectedCase.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => setCaseToDelete(selectedCase)}
                  className="text-rose-500 hover:text-rose-600 font-semibold"
                >
                  Delete Case
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Case Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 animate-scaleUp">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Case / Issue</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateCase} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Authentication token expires prematurely"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Project *
                  </label>
                  <select
                    required
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                    </input>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Description & Steps to Reproduce
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide details about the issue or request..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-md transition-all"
                  >
                    {submitting ? 'Creating...' : 'Create Case'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!caseToDelete}
          onClose={() => setCaseToDelete(null)}
          onConfirm={handleDeleteCase}
          loading={deleting}
          title="Delete Case"
          message={`Are you sure you want to permanently delete ticket ${caseToDelete?.ticket_number}? This action cannot be undone.`}
          confirmText="Delete Ticket"
        />
      </div>
    </AppShell>
  );
}
