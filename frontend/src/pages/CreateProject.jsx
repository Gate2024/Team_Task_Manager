import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsApi } from '../api';
import { useToast } from '../context/ToastContext';
import { AppShell } from '../components/layout/AppShell';

export function CreateProject() {
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await projectsApi.create({
        name: name.trim(),
        description: description.trim(),
      });
      const newProj = res.project || res;
      toast.success(`Project "${newProj.name || name.trim()}" created successfully!`);
      if (newProj.id) {
        navigate(`/projects/${newProj.id}`);
      } else {
        navigate('/projects');
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to create project');
      toast.error(err.data?.message || 'Could not create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell breadcrumb="Create Project">
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn pb-16">
        {/* Top Back Navigation & Header */}
        <div className="space-y-3">
          <Link
            to="/projects"
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
            <span>Back to Projects</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 mb-2">
                <span>New Initiative</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create New Project
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Establish a collaborative workspace, organize team members, and orchestrate project milestones.
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
              <p className="font-semibold">Creation Error</p>
              <p className="mt-0.5 text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Main Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Section 1: Project Identity */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Project Details
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Provide a distinctive title and clear objectives for this initiative.
                </p>
              </div>

              <div>
                <label htmlFor="projectName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="projectName"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q4 Cloud Infrastructure Migration"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>

              <div>
                <label htmlFor="projectDesc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description & Objectives
                </label>
                <textarea
                  id="projectDesc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the core deliverables, target goals, and background context for your team..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm resize-y min-h-[100px]"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Optional. This summary appears on the workspace overview and helps team members stay aligned.
                </p>
              </div>
            </div>

            {/* Section 2: Workspace Governance Note */}
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Automatic Ownership Assignment</span>
                As the project creator, you will automatically be designated as the Project Owner. You can invite team members and designate project admins once the workspace is created.
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <Link
              to="/projects"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition-all active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Creating Project...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

export default CreateProject;
