import React, { useMemo } from 'react';

export function TeamWorkload({ tasks = [] }) {
  const workload = useMemo(() => {
    const map = {};
    let unassigned = 0;

    tasks.forEach((t) => {
      if (!t.assignee) {
        unassigned++;
      } else {
        const id = t.assignee.id;
        if (!map[id]) {
          map[id] = {
            id,
            name: t.assignee.name,
            total: 0,
            todo: 0,
            in_progress: 0,
            done: 0,
          };
        }
        map[id].total++;
        if (t.status === 'todo') map[id].todo++;
        else if (t.status === 'in_progress') map[id].in_progress++;
        else if (t.status === 'done') map[id].done++;
      }
    });

    return {
      members: Object.values(map).sort((a, b) => b.total - a.total),
      unassigned,
    };
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 text-center">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Team Workload Distribution</h3>
        <p className="text-xs text-slate-400">No task assignments recorded across your workspace yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Team Workload Distribution</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Ranked collaborator capacity and deliverable allocation.
          </p>
        </div>
        {workload.unassigned > 0 && (
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {workload.unassigned} unassigned
          </span>
        )}
      </div>

      <div className="space-y-4 pt-1">
        {workload.members.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            All active tasks are currently unassigned.
          </p>
        ) : (
          workload.members.slice(0, 5).map((m) => {
            const pctDone = m.total > 0 ? Math.round((m.done / m.total) * 100) : 0;
            const initials = m.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            // Workload indicator rating
            let workloadBadge = 'Balanced';
            let badgeStyle = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
            if (m.total >= 8) {
              workloadBadge = 'Heavy';
              badgeStyle = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60';
            } else if (m.in_progress >= 4) {
              workloadBadge = 'Active';
              badgeStyle = 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60';
            }

            return (
              <div
                key={m.id || m.name}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-200 dark:hover:border-slate-700/80 transition-all space-y-2.5"
              >
                {/* Header: Collaborator Name + Total Tasks + Capacity Tag */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {m.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {m.total} {m.total === 1 ? 'task' : 'tasks'} assigned
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                      {workloadBadge}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {pctDone}%
                    </span>
                  </div>
                </div>

                {/* Multi-stage Workload Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${(m.done / m.total) * 100}%` }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title={`Done: ${m.done}`}
                  />
                  <div
                    style={{ width: `${(m.in_progress / m.total) * 100}%` }}
                    className="bg-sky-500 h-full transition-all duration-500"
                    title={`In Progress: ${m.in_progress}`}
                  />
                  <div
                    style={{ width: `${(m.todo / m.total) * 100}%` }}
                    className="bg-amber-400 h-full transition-all duration-500"
                    title={`To Do: ${m.todo}`}
                  />
                </div>

                {/* Sub-counts breakdown */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <strong className="text-slate-700 dark:text-slate-300 font-semibold">{m.done}</strong> done
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      <strong className="text-slate-700 dark:text-slate-300 font-semibold">{m.in_progress}</strong> in progress
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <strong className="text-slate-700 dark:text-slate-300 font-semibold">{m.todo}</strong> to do
                    </span>
                  </div>

                  <span className="text-slate-400 hidden sm:inline">
                    {m.done} of {m.total} completed
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
