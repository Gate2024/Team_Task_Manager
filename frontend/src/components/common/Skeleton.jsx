import React from 'react';

export function StatSkeleton() {
  return (
    <div className="p-4.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm animate-pulse space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
      <div className="h-7 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-4.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="p-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm animate-pulse flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-2.5 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
      <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
    </div>
  );
}

export function KanbanColumnSkeleton() {
  return (
    <div className="flex-1 min-w-[280px] bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-7 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-3.5 w-80 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="flex gap-2.5">
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>

      {/* Primary Analytics (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks & Activity (8 cols + 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-3">
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
          {[...Array(3)].map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
        <div className="lg:col-span-4 p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-full flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-2.5 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
