import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="relative bg-white dark:bg-[#0B0F19] border-t border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      {/* Top subtle gradient border line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Product */}
          <div className="space-y-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                TM
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                TeamTask
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Enterprise task orchestrator built with Flask 3 REST API, PostgreSQL 17, and React 18 with granular role-based authorization.
            </p>
          </div>

          {/* Col 2: Architecture & Specs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Architecture
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>Flask 3.1 & SQLAlchemy 2.0</li>
              <li>PostgreSQL 17 Alpine</li>
              <li>Vite 6 & React 18 SPA</li>
              <li>Docker & Nginx Orchestration</li>
            </ul>
          </div>

          {/* Col 3: Security & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Security
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>HttpOnly JWT Cookies</li>
              <li>Double-Submit CSRF Guard</li>
              <li>Hierarchical RBAC (Owner/Admin/Member)</li>
              <li>Zero Client-Side Token Storage</li>
            </ul>
          </div>

          {/* Col 4: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Create Workspace
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Feature Matrix
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Permission Matrix
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-200/80 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p>© {new Date().getFullYear()} Team Task Manager Monorepo. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API Online
            </span>
            <span>Production Grade v2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
