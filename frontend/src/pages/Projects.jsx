import React, { useEffect, useState } from 'react';
import { projectsApi } from '../api';
import { useToast } from '../context/ToastContext';
import { AppShell } from '../components/layout/AppShell';
import { ProjectCard } from '../components/ProjectCard';

export function Projects() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadProjects = async () => {
    try {
      setError(null);
      const data = await projectsApi.list();
      setProjects(Array.isArray(data) ? data : data.projects || []);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setError(null);
    try {
      await projectsApi.create({
        name: name.trim(),
        description: description.trim(),
      });
      setName('');
      setDescription('');
      setShowCreateForm(false);
      toast.success('Project created successfully.');
      await loadProjects();
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to create project';
      setError(msg);
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppShell
      breadcrumb="Projects"
      onNewAction={() => setShowCreateForm(true)}
    >
      <div className="space-y-8 animate-fadeIn">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Workspaces & Projects
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Organize team members, assign scoped permissions, and orchestrate initiatives.
            </p>
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Project</span>
          </button>
        </div>

        {/* Inline Create Form Drawer/Card */}
        {showCreateForm && (
          <div className="bg-white dark:bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl animate-slideDown">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Create New Project</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Project Title (e.g. Core Infrastructure Migration)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <textarea
                placeholder="Brief description or purpose..."
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !name.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  {creating ? 'Creating...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm p-4 rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 bg-slate-100 dark:bg-slate-900/40 rounded-2xl animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No projects created yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Get started by creating your first workspace project above.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-md"
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
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
