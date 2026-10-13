import React, { useState } from 'react';
import { TaskCard } from './TaskCard';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'border-amber-500/60 text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' },
  { id: 'in_progress', label: 'In Progress', color: 'border-indigo-500/60 text-indigo-600 dark:text-indigo-400', badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300' },
  { id: 'done', label: 'Done', color: 'border-emerald-500/60 text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' },
];

export function KanbanBoard({
  tasks = [],
  onStatusChange,
  onEditTask,
  onDeleteTask,
  onAddTask,
  onSelfAssign,
  canManage = true,
  currentUserId,
}) {
  const [activeMobileCol, setActiveMobileCol] = useState('todo');
  const [dragOverCol, setDragOverCol] = useState(null);

  // Drag handlers
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, originStatus: task.status }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (e, colId) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverCol === colId) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.taskId && data.originStatus !== targetStatus) {
        const targetTask = tasks.find((t) => t.id === data.taskId);
        if (targetTask && !canManage && targetTask.assigned_to !== currentUserId) {
          return;
        }
        onStatusChange(data.taskId, targetStatus);
      }
    } catch {
      // Ignored
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile Column Tab Switcher (< md screens) */}
      <div className="flex md:hidden bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
        {COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.status === col.id).length;
          return (
            <button
              key={col.id}
              onClick={() => setActiveMobileCol(col.id)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeMobileCol === col.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>{col.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${col.badge}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const isMobileHidden = activeMobileCol !== col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col min-h-[460px] transition-colors ${
                dragOverCol === col.id ? 'kanban-column-dragover border-indigo-500' : ''
              } ${isMobileHidden ? 'hidden md:flex' : 'flex'}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${col.badge}`}>
                    {colTasks.length}
                  </span>
                </div>

                {canManage && onAddTask && (
                  <button
                    onClick={() => onAddTask(col.id)}
                    aria-label={`Add task to ${col.label}`}
                    title={`Add task to ${col.label}`}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Task Cards Container */}
              <div className="flex-1 space-y-3 custom-scrollbar overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-400">Drop tasks here or create new</p>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const canUpdateStatus = canManage || task.assigned_to === currentUserId;
                    return (
                      <TaskCard
                        key={task.id}
                        task={task}
                        variant="kanban"
                        isDraggable={canUpdateStatus}
                        onDragStart={handleDragStart}
                        canEdit={canManage || task.assigned_to === currentUserId}
                        canDelete={canManage}
                        canUpdateStatus={canUpdateStatus}
                        onStatusChange={onStatusChange}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onSelfAssign={onSelfAssign}
                      />
                    );
                  })
                )}
              </div>

              {/* Quick bottom add task */}
              {canManage && onAddTask && (
                <button
                  onClick={() => onAddTask(col.id)}
                  className="mt-3 w-full py-2 px-3 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Task</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
