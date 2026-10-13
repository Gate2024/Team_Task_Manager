import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { projectsApi, tasksApi, dashboardApi } from '../api';
import { useToast } from '../context/ToastContext';
import { AppShell } from '../components/layout/AppShell';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { ProjectHealth } from '../components/dashboard/ProjectHealth';
import { TeamWorkload } from '../components/dashboard/TeamWorkload';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';
import { ProjectCard } from '../components/ProjectCard';
import { DashboardSkeleton } from '../components/common/Skeleton';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter'); // e.g. 'mine'

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    active_projects: 0,
    total_tasks: 0,
    todo: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
    unassigned: 0,
    my_tasks: 0,
    my_due_today: 0,
    my_in_progress: 0,
    my_completed: 0,
    my_overdue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View state: 'admin' or 'member'
  const [currentView, setCurrentView] = useState('admin');

  // Interactive stat card task filter ('all', 'todo', 'in_progress', 'done', 'overdue', 'due_today')
  const [taskFilter, setTaskFilter] = useState('all');

  // Task modal & state (for editing existing tasks)
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalLoading, setTaskModalLoading] = useState(false);

  const loadDashboardData = async () => {
    try {
      setError(null);
      const [statsRes, projectsRes, tasksRes] = await Promise.allSettled([
        dashboardApi.getStats(),
        projectsApi.list(),
        tasksApi.listAll(),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }

      let loadedProjects = [];
      if (projectsRes.status === 'fulfilled') {
        const pData = projectsRes.value;
        loadedProjects = Array.isArray(pData) ? pData : pData.projects || [];
        setProjects(loadedProjects);
      }

      let loadedTasks = [];
      if (tasksRes.status === 'fulfilled') {
        const tData = tasksRes.value;
        loadedTasks = Array.isArray(tData) ? tData : tData.tasks || [];
        setTasks(loadedTasks);
      }

      // Role check: if filter is 'mine', view is member.
      // If user is owner/admin of any project, default to admin view. Otherwise, default to member.
      const hasAdminRights = loadedProjects.some(
        (p) => p.user_role === 'owner' || p.user_role === 'admin'
      );
      if (filterParam === 'mine' || !hasAdminRights) {
        setCurrentView('member');
      } else {
        setCurrentView('admin');
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to load workspace data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [filterParam]);

  const isWorkspaceAdmin = useMemo(() => {
    return projects.some((p) => p.user_role === 'owner' || p.user_role === 'admin');
  }, [projects]);

  // Handle task status changes
  const handleTaskStatusChange = async (taskId, newStatus) => {
    const originalTask = tasks.find((t) => t.id === taskId);
    if (!originalTask || originalTask.status === newStatus) return;

    const originalStatus = originalTask.status;

    // 1. Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await tasksApi.updateStatus(taskId, newStatus);
      // Refresh stats in background
      dashboardApi.getStats().then((s) => setStats(s)).catch(() => {});
      toast.success(`Task moved to ${newStatus.replace('_', ' ')}.`);
    } catch (err) {
      // Rollback on error
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: originalStatus } : t))
      );
      toast.error(err.data?.message || 'Failed to update task status. Changes rolled back.');
    }
  };

  // Handle task save
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
        const targetProjectId = taskData.project_id || projects[0]?.id;
        if (!targetProjectId) {
          throw new Error('Please select or create a project first.');
        }
        const created = await tasksApi.create(targetProjectId, taskData);
        setTasks((prev) => [created.task || created, ...prev]);
        toast.success('Task created successfully.');
      }
      setShowTaskModal(false);
      setSelectedTask(null);
      dashboardApi.getStats().then((s) => setStats(s)).catch(() => {});
    } catch (err) {
      toast.error(err.data?.message || err.message || 'Failed to save task.');
      throw err;
    } finally {
      setTaskModalLoading(false);
    }
  };

  // Filter tasks for Member View:
  const memberTasks = useMemo(() => {
    return tasks.filter((t) => t.assigned_to === user?.id);
  }, [tasks, user?.id]);

  const priorityTasks = useMemo(() => {
    return memberTasks.filter(
      (t) => t.status !== 'done' && (t.priority === 'urgent' || t.priority === 'high')
    );
  }, [memberTasks]);

  const todayTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return memberTasks.filter((t) => t.status !== 'done' && t.due_date === today);
  }, [memberTasks]);

  // Clickable stat card filter logic
  const handleStatFilterClick = (key) => {
    if (key === 'projects') {
      const el = document.getElementById('dashboard-projects-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setTaskFilter((prev) => (prev === key ? 'all' : key));
  };

  const displayedAdminTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let list = tasks;
    if (taskFilter === 'todo') list = list.filter((t) => t.status === 'todo');
    else if (taskFilter === 'in_progress') list = list.filter((t) => t.status === 'in_progress');
    else if (taskFilter === 'done') list = list.filter((t) => t.status === 'done');
    else if (taskFilter === 'overdue') list = list.filter((t) => t.status !== 'done' && t.due_date && t.due_date < today);
    return list;
  }, [tasks, taskFilter]);

  const displayedMemberTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let list = memberTasks;
    if (taskFilter === 'due_today') list = list.filter((t) => t.status !== 'done' && t.due_date === today);
    else if (taskFilter === 'in_progress') list = list.filter((t) => t.status === 'in_progress');
    else if (taskFilter === 'done') list = list.filter((t) => t.status === 'done');
    else if (taskFilter === 'overdue') list = list.filter((t) => t.status !== 'done' && t.due_date && t.due_date < today);
    return list;
  }, [memberTasks, taskFilter]);

  if (loading) {
    return (
      <AppShell breadcrumb="Dashboard">
        <DashboardSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell
      breadcrumb="Dashboard"
      onNewAction={isWorkspaceAdmin ? () => navigate('/projects/new') : null}
    >
      <div className="space-y-8 animate-fadeIn pb-12">
        {/* 1. Dashboard Header */}
        <DashboardHeader
          userName={user?.name}
          isWorkspaceAdmin={isWorkspaceAdmin}
          currentView={currentView}
          onViewChange={setCurrentView}
          onCreateProject={() => navigate('/projects/new')}
          onCreateTask={() => navigate('/tasks/new')}
        />

        {/* Error Alert with Retry Action */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadDashboardData}
              className="underline font-semibold ml-4 hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        {/* 2. KPI / Stats Row with Click-to-Filter */}
        <StatsGrid
          stats={stats}
          view={currentView}
          activeFilter={taskFilter}
          onFilterClick={handleStatFilterClick}
        />

        {/* ======================================================== */}
        {/* ADMIN VIEW COMPOSITION                                   */}
        {/* ======================================================== */}
        {currentView === 'admin' && (
          <div className="space-y-8">
            {/* 3. Primary Analytics: Project Health (6 cols) & Team Workload (6 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <ProjectHealth projects={projects} tasks={tasks} />
              </div>
              <div className="lg:col-span-6">
                <TeamWorkload tasks={tasks} />
              </div>
            </div>

            {/* 4. Workspace Activity: Recent Tasks (8 cols) & Recent Activity (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Recent Tasks (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Recent Team Tasks
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {taskFilter !== 'all'
                          ? `Filtered by: ${taskFilter.replace('_', ' ')}`
                          : 'Latest deliverables and status updates across your projects.'}
                      </p>
                    </div>
                    {taskFilter !== 'all' && (
                      <button
                        onClick={() => setTaskFilter('all')}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-100 transition-colors"
                      >
                        Clear filter &times;
                      </button>
                    )}
                  </div>

                  {projects.length > 0 && (
                    <Link
                      to={`/projects/${projects[0].id}`}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Manage project &rarr;
                    </Link>
                  )}
                </div>

                {displayedAdminTasks.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {taskFilter !== 'all'
                        ? 'No tasks match the selected filter.'
                        : 'No tasks created across your workspace yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedAdminTasks.slice(0, 5).map((task) => {
                      const proj = projects.find((p) => p.id === task.project_id);
                      const isProjAdmin = isWorkspaceAdmin && (proj?.user_role === 'owner' || proj?.user_role === 'admin');
                      const canUpdateStatus = isProjAdmin || task.assigned_to === user?.id;
                      return (
                        <TaskCard
                          key={task.id}
                          task={task}
                          projectName={proj?.name}
                          variant="row"
                          canEdit={isProjAdmin || task.assigned_to === user?.id}
                          canDelete={isProjAdmin}
                          canUpdateStatus={canUpdateStatus}
                          onStatusChange={handleTaskStatusChange}
                          onEdit={(t) => {
                            setSelectedTask(t);
                            setShowTaskModal(true);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Activity Timeline (4 cols) */}
              <div className="lg:col-span-4">
                <RecentActivity tasks={tasks} />
              </div>
            </div>

            {/* 5. Active Projects Grid (Full Width) */}
            <div id="dashboard-projects-section" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Projects</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Collaborative initiatives and deliverable workspaces.
                  </p>
                </div>
                <Link
                  to="/projects"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View all ({projects.length}) &rarr;
                </Link>
              </div>

              {projects.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">No projects found</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                    Get started by creating your first team initiative.
                  </p>
                  <button
                    onClick={() => setShowNewProjectModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md"
                  >
                    Create Project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      userRole={project.user_role || 'member'}
                      projectTasks={tasks.filter((t) => t.project_id === project.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MEMBER VIEW COMPOSITION                                  */}
        {/* ======================================================== */}
        {currentView === 'member' && (
          <div className="space-y-8">
            {/* Priority Tasks for Current User */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    High Priority Action Items
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Urgent and high priority tasks assigned specifically to you.
                  </p>
                </div>
              </div>

              {priorityTasks.length === 0 ? (
                <div className="p-6 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    You have no outstanding high-priority tasks.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {priorityTasks.map((task) => {
                    const proj = projects.find((p) => p.id === task.project_id);
                    return (
                      <TaskCard
                        key={task.id}
                        task={task}
                        projectName={proj?.name}
                        variant="row"
                        canEdit={true}
                        canDelete={false}
                        onStatusChange={handleTaskStatusChange}
                        onEdit={(t) => {
                          setSelectedTask(t);
                          setShowTaskModal(true);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* My Assigned Tasks with Filter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      My Assigned Tasks ({displayedMemberTasks.length})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {taskFilter !== 'all'
                        ? `Filtered by: ${taskFilter.replace('_', ' ')}`
                        : 'Tasks across all projects that require your execution.'}
                    </p>
                  </div>
                  {taskFilter !== 'all' && (
                    <button
                      onClick={() => setTaskFilter('all')}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-100 transition-colors"
                    >
                      Clear filter &times;
                    </button>
                  )}
                </div>
              </div>

              {displayedMemberTasks.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {taskFilter !== 'all'
                      ? 'No tasks match the selected filter.'
                      : 'You currently have no tasks assigned to you.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedMemberTasks.map((task) => {
                    const proj = projects.find((p) => p.id === task.project_id);
                    return (
                      <TaskCard
                        key={task.id}
                        task={task}
                        projectName={proj?.name}
                        variant="row"
                        canEdit={true}
                        canDelete={false}
                        onStatusChange={handleTaskStatusChange}
                        onEdit={(t) => {
                          setSelectedTask(t);
                          setShowTaskModal(true);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Member Secondary Grid: Today Deadlines & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-4">
                <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Today's Deadlines ({todayTasks.length})
                    </h4>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  {todayTasks.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">
                      No deliverables scheduled for completion today.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {todayTasks.map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-amber-950 dark:text-amber-200 truncate">
                            {t.title}
                          </span>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-6">
                <RecentActivity tasks={memberTasks} />
              </div>
            </div>

            {/* My Project Workspaces */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                My Projects ({projects.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    userRole={project.user_role || 'member'}
                    projectTasks={tasks.filter((t) => t.project_id === project.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Task Modal for Dashboard */}
      <TaskModal
        isOpen={showTaskModal}
        task={selectedTask}
        members={[]}
        isMemberOnly={!isWorkspaceAdmin && selectedTask?.assigned_to === user?.id}
        isReadOnly={!isWorkspaceAdmin && Boolean(selectedTask) && selectedTask?.assigned_to !== user?.id}
        loading={taskModalLoading}
        onSave={handleSaveTask}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
      />
    </AppShell>
  );
}
