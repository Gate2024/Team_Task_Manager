import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
