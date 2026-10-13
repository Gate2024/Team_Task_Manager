import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectsApi, tasksApi } from '../api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { AppShell } from '../components/layout/AppShell';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { TaskList } from '../components/tasks/TaskList';
import { MemberList } from '../components/members/MemberList';
import { ConfirmModal } from '../components/common/ConfirmModal';

export function ProjectDetail() {
  const { id } = useParams();
  const projectId = parseInt(id, 10);
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem('project_active_tab') || 'overview'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Task creation/edit modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalLoading, setTaskModalLoading] = useState(false);

  // Task deletion state
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deletingTask, setDeletingTask] = useState(false);

  // Project edit state (Settings tab)
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Project deletion state
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  // Task filtering state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Load project workspace data
  const loadWorkspace = async () => {
    try {
      setError(null);
      const [projRes, tasksRes, membersRes] = await Promise.all([
        projectsApi.get(projectId),
        tasksApi.listByProject(projectId),
        projectsApi.listMembers(projectId),
      ]);

      const pData = projRes.project || projRes;
      setProject(pData);
      setEditName(pData.name || '');
      setEditDesc(pData.description || '');

      setTasks(tasksRes.tasks || (Array.isArray(tasksRes) ? tasksRes : []));
      setMembers(membersRes.members || (Array.isArray(membersRes) ? membersRes : []));
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to load project workspace');
      toast.error(err.data?.message || 'Could not load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [projectId]);

  const userRole = project?.user_role || 'member';
  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin';
  const isOwnerOrAdmin = isOwner || isAdmin;

  // Task Metrics Calculation for Overview
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const overdue = tasks.filter((t) => {
      if (t.status === 'done' || !t.due_date) return false;
      return new Date(t.due_date + 'T23:59:59') < new Date();
    }).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, todo, overdue, percent };
  }, [tasks]);

  // Filtered and Sorted Tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        result = result.filter((t) => !t.assigned_to);
      } else {
        const uid = parseInt(assigneeFilter, 10);
        result = result.filter((t) => t.assigned_to === uid);
      }
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === 'due_date_asc') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      }
      if (sortBy === 'due_date_desc') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(b.due_date) - new Date(a.due_date);
      }
      if (sortBy === 'priority_desc') {
        const rank = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (rank[b.priority] || 2) - (rank[a.priority] || 2);
      }
      if (sortBy === 'priority_asc') {
        const rank = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (rank[a.priority] || 2) - (rank[b.priority] || 2);
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return result;
  }, [tasks, search, statusFilter, priorityFilter, assigneeFilter, sortBy]);

  // Handlers for Tasks
  const handleSaveTask = async (taskData) => {
    setTaskModalLoading(true);
    try {
      if (selectedTask) {
        const updated = await tasksApi.update(selectedTask.id, taskData);
        setTasks((prev) =>
          prev.map((t) => (t.id === selectedTask.id ? (updated.task || updated) : t))
        );
        toast.success('Task updated successfully.');
      } else {
        const created = await tasksApi.create(projectId, taskData);
        setTasks((prev) => [created.task || created, ...prev]);
        toast.success('Task created successfully.');
      }
      setShowTaskModal(false);
      setSelectedTask(null);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save task.');
      throw err;
    } finally {
      setTaskModalLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const originalTask = tasks.find((t) => t.id === taskId);
    if (!originalTask || originalTask.status === newStatus) return;

    const originalStatus = originalTask.status;

    // 1. Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      // 2. Persist to API
      await tasksApi.updateStatus(taskId, newStatus);
      toast.success(`Task marked as ${newStatus.replace('_', ' ')}.`);
    } catch (err) {
      // 3. Rollback on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: originalStatus } : t))
      );
      toast.error(err.data?.message || 'Failed to update task status. Changes reverted.');
    }
  };

  const handleDeleteTaskConfirm = async () => {
    if (!taskToDelete) return;
    setDeletingTask(true);
    try {
      await tasksApi.delete(taskToDelete);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete));
      toast.success('Task deleted successfully.');
      setTaskToDelete(null);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to delete task.');
    } finally {
      setDeletingTask(false);
    }
  };

  // Handlers for Members
  const handleAddMember = async (memberData) => {
    const res = await projectsApi.addMember(projectId, memberData);
    setMembers((prev) => [...prev, res.member]);
    toast.success('Team member added successfully.');
  };

  const handleRemoveMember = async (targetUserId) => {
    await projectsApi.removeMember(projectId, targetUserId);
    setMembers((prev) => prev.filter((m) => (m.user_id || m.id) !== targetUserId));
    // Also unassign locally
    setTasks((prev) =>
      prev.map((t) => (t.assigned_to === targetUserId ? { ...t, assigned_to: null, assignee: null } : t))
    );
    toast.success('Member removed from project.');
  };

  // Handlers for Project Settings
  const handleSaveProjectSettings = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setSavingSettings(true);
    try {
      const res = await projectsApi.update(projectId, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      setProject(res.project);
      toast.success('Project details updated successfully.');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update project.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteProject = async () => {
    setDeletingProject(true);
    try {
      await projectsApi.delete(projectId);
      toast.success('Project deleted successfully.');
      navigate('/projects');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to delete project.');
    } finally {
      setDeletingProject(false);
    }
  };

  if (loading) {
    return (
      <AppShell breadcrumb="Project">
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium mt-3">Loading workspace...</span>
        </div>
      </AppShell>
    );
  }

  if (error || !project) {
    return (
      <AppShell breadcrumb="Project">
        <div className="max-w-xl mx-auto py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Project Unavailable
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            {error || 'The requested project could not be found or you lack permission to view it.'}
          </p>
          <Link
            to="/projects"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md"
          >
            &larr; Back to Projects
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell breadcrumb={project.name}>
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* ======================================================== */}
        {/* 1. PROJECT HEADER                                       */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Role: {userRole}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Owner: {project.owner?.name || 'Self'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>

            {/* Quick Actions & Members preview */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
              {/* Member Avatars */}
              <div className="flex -space-x-2 overflow-hidden mr-2">
                {members.slice(0, 5).map((m) => {
                  const u = m.user || {};
                  return (
                    <div
                      key={m.id || m.user_id}
                      title={`${u.name} (${m.role})`}
                      className="inline-block h-8 w-8 rounded-full overflow-hidden ring-2 ring-white dark:ring-slate-900 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center uppercase flex-shrink-0"
                    >
                      {u.profile_image_url ? (
                        <img
                          src={u.profile_image_url}
                          alt={u.name || 'User'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        (u.name || 'U').charAt(0)
                      )}
                    </div>
                  );
                })}
                {members.length > 5 && (
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center">
                    +{members.length - 5}
                  </div>
                )}
              </div>

              {isOwnerOrAdmin && (
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setShowTaskModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Task</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none">
            {[
              { id: 'overview', label: 'Overview', count: null },
              { id: 'board', label: 'Board', count: tasks.length },
              { id: 'list', label: 'List', count: filteredTasks.length },
              { id: 'members', label: 'Members', count: members.length },
              ...(isOwnerOrAdmin ? [{ id: 'settings', label: 'Settings', count: null }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  localStorage.setItem('project_active_tab', tab.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      activeTab === tab.id
                        ? 'bg-indigo-700/60 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. TAB CONTENT: OVERVIEW                                 */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tasks</span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.total}</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">To Do</span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.todo}</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">In Progress</span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.inProgress}</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Completed</span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.completed}</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl col-span-2 lg:col-span-1">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Overdue</span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.overdue}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Project Health & Completion</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{stats.percent}% Complete</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
            </div>

            {/* Recent Tasks Preview */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Project Tasks</h3>
                <button
                  onClick={() => {
                    setActiveTab('board');
                    localStorage.setItem('project_active_tab', 'board');
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Kanban Board ({tasks.length}) &rarr;
                </button>
              </div>

              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No tasks created for this project yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.slice(0, 3).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      canEdit={isOwnerOrAdmin || task.assigned_to === user?.id}
                      canDelete={isOwnerOrAdmin}
                      onStatusChange={handleStatusChange}
                      onEdit={(t) => {
                        setSelectedTask(t);
                        setShowTaskModal(true);
                      }}
                      onDelete={(tid) => setTaskToDelete(tid)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. TAB CONTENT: KANBAN BOARD                             */}
        {/* ======================================================== */}
        {activeTab === 'board' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Kanban Task Board</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Drag and drop tasks between stages to update status in real time.
                </p>
              </div>

              {/* View Switcher: Board vs List */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => {
                    setActiveTab('board');
                    localStorage.setItem('project_active_tab', 'board');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                >
                  Board
                </button>
                <button
                  onClick={() => {
                    setActiveTab('list');
                    localStorage.setItem('project_active_tab', 'list');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  List
                </button>
              </div>
            </div>

            <KanbanBoard
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onEditTask={(t) => {
                setSelectedTask(t);
                setShowTaskModal(true);
              }}
              onDeleteTask={(tid) => setTaskToDelete(tid)}
              onAddTask={(targetStatus) => {
                setSelectedTask({ status: targetStatus });
                setShowTaskModal(true);
              }}
              canManage={isOwnerOrAdmin}
              currentUserId={user?.id}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. TAB CONTENT: TASK LIST                                */}
        {/* ======================================================== */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Structured Task List</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Filterable and sortable tabular view of all project deliverables.
                </p>
              </div>

              {/* View Switcher: Board vs List */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => {
                    setActiveTab('board');
                    localStorage.setItem('project_active_tab', 'board');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Board
                </button>
                <button
                  onClick={() => {
                    setActiveTab('list');
                    localStorage.setItem('project_active_tab', 'list');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                >
                  List
                </button>
              </div>
            </div>

            {/* Task Controls: Search, Filters, Sort */}
            <TaskFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
              assigneeFilter={assigneeFilter}
              onAssigneeChange={setAssigneeFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              members={members}
              onReset={() => {
                setSearch('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setAssigneeFilter('all');
                setSortBy('newest');
              }}
            />

            <TaskList
              tasks={filteredTasks}
              onStatusChange={handleStatusChange}
              onEditTask={(t) => {
                setSelectedTask(t);
                setShowTaskModal(true);
              }}
              onDeleteTask={(tid) => setTaskToDelete(tid)}
              canManage={isOwnerOrAdmin}
              currentUserId={user?.id}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. TAB CONTENT: MEMBERS                                  */}
        {/* ======================================================== */}
        {activeTab === 'members' && (
          <MemberList
            members={members}
            currentUserRole={userRole}
            currentUserId={user?.id}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
          />
        )}

        {/* ======================================================== */}
        {/* 5. TAB CONTENT: SETTINGS (Owner / Admin only)           */}
        {/* ======================================================== */}
        {activeTab === 'settings' && isOwnerOrAdmin && (
          <div className="space-y-8 max-w-2xl">
            {/* Project Edit Card */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Project Information
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                Update the project title and scope description.
              </p>

              <form onSubmit={handleSaveProjectSettings} className="space-y-4">
                <div>
                  <label htmlFor="edit-pname" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Project Name
                  </label>
                  <input
                    id="edit-pname"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label htmlFor="edit-pdesc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    id="edit-pdesc"
                    rows="3"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings || !editName.trim()}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {savingSettings ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone: Project Deletion (Owner only) */}
            {isOwner && (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6">
                <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 mb-1">
                  Danger Zone
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                  Permanently delete this project. All associated tasks and memberships will be purged.
                </p>
                <button
                  onClick={() => setShowDeleteProjectModal(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/20"
                >
                  Delete Project
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={showTaskModal}
        task={selectedTask}
        members={members}
        isMemberOnly={!isOwnerOrAdmin && selectedTask?.assigned_to === user?.id}
        loading={taskModalLoading}
        onSave={handleSaveTask}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
      />

      {/* Task Deletion Confirmation */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete Task"
        isDestructive={true}
        loading={deletingTask}
        onConfirm={handleDeleteTaskConfirm}
        onClose={() => setTaskToDelete(null)}
      />

      {/* Project Deletion Confirmation */}
      <ConfirmModal
        isOpen={showDeleteProjectModal}
        title="Delete Entire Project?"
        message={`Are you sure you want to delete "${project.name}"? All associated tasks, checklists, and memberships will be permanently deleted.`}
        confirmText="Delete Project"
        isDestructive={true}
        loading={deletingProject}
        onConfirm={handleDeleteProject}
        onClose={() => setShowDeleteProjectModal(false)}
      />
    </AppShell>
  );
}
