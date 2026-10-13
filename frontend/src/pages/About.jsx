import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PublicLayout } from '../components/layout/PublicLayout';

export function About() {
  const { user } = useAuth();

  const coreValues = [
    {
      title: 'Actionable Transparency',
      description:
        'Every project deliverable and operational ticket has an explicit status, assigned owner, and priority level. Teams always know who is doing what and by when.',
      icon: (
        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      title: 'Strict Role-Based Governance',
      description:
        'Built with robust server-side RBAC. Project Owners retain deletion and management rights, Admins control tasks and memberships, and Members focus purely on execution.',
      icon: (
        <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Contextual Collaboration',
      description:
        'Discussions, notifications, and @mentions happen directly on tasks and tickets, eliminating scattered email threads and disconnected messaging apps.',
      icon: (
        <svg className="w-6 h-6 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      title: 'Enterprise Session Security',
      description:
        'Protected by HttpOnly JWT cookie architecture, dual-token sliding refresh intervals, and double-submit CSRF verification without exposing tokens to client scripts.',
      icon: (
        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];

  return (
    <PublicLayout>
      <div className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        {/* Ambient Radial Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-gradient-to-tr from-indigo-500/15 via-violet-500/15 to-transparent blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-sky-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-16 sm:space-y-20">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
              <span>About TeamTask Platform</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Empowering Teams to Collaborate with{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-500 dark:from-indigo-400 dark:via-violet-300 dark:to-indigo-200 bg-clip-text text-transparent">
                Clarity and Velocity
              </span>
            </h1>
            <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              TeamTask was engineered to solve the operational friction that teams face when coordinating complex work across fragmented tools, spreadsheets, and informal chat threads.
            </p>
          </div>

          {/* Problem & Solution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  The Problem: Siloed & Unaligned Work
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  As teams expand, managing deliverables through disparate chat channels or ad-hoc documents creates ambiguity. Due dates slip, priority boundaries blur, and team members lack visibility into where roadblocks reside.
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-5">
                <li className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">•</span> Unclear deliverable accountability
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">•</span> Missing resolution trails on critical issues
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-500 font-bold">•</span> Lack of centralized project governance
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900/70 border border-indigo-200/80 dark:border-indigo-900/40 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  The Solution: Centralized Orchestration
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  TeamTask unifies project workspaces, visual Kanban workflows, operational case tracking, and role-based permissions into a single interface. Every team member operates with clear expectations and real-time clarity.
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-5">
                <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Interactive Kanban board with live status updates</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Dedicated ticket numbers and resolution lifecycles</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Enforced permissions for Owners, Admins, and Members</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Core Values Section */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Our Engineering & Design Pillars
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Architectural principles that guide every feature we ship.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {coreValues.map((val, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-4">
                    {val.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {val.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {val.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Developer / Creator Spotlight Card */}
          <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="relative max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-indigo-600 text-white font-extrabold text-3xl sm:text-4xl flex items-center justify-center shadow-xl flex-shrink-0 ring-4 ring-indigo-500/30">
                NA
              </div>
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                  Engineering & Architecture
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold">
                  Designed & Developed by Narayan Adhude
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Engineered with modern full-stack web standards: Flask REST APIs, PostgreSQL with Alembic migrations, React, Vite, and Tailwind CSS. Built to deliver a responsive, performant, and reliable company task management SaaS application.
                </p>
                <div className="pt-2">
                  <a
                    href="https://narayan-portfolio-snkx.onrender.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-950 hover:bg-indigo-50 font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all hover:scale-105"
                  >
                    <span>View Developer Portfolio</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default About;
