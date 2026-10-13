import React from 'react';
import { StatusBadge } from '../StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { TaskCard } from './TaskCard';

export function TaskList({
  tasks = [],
  onStatusChange,
  onEditTask,
  onDeleteTask,
  onSelfAssign,
  canManage = true,
  currentUserId,
}) {
  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <p className="text-xs text-slate-400">No tasks found matching the criteria.</p>
      </div>
    );
  }

  return (
    <div>
      {/* 1. Mobile Stacked View (< md screens) */}
      <div className="md:hidden space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            variant="default"
            canEdit={canManage || task.assigned_to === currentUserId}
            canDelete={canManage}
            canUpdateStatus={canManage || task.assigned_to === currentUserId}
            onStatusChange={onStatusChange}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onSelfAssign={onSelfAssign}
          />
        ))}
      </div>

      {/* 2. Desktop Structured Table View (>= md screens) */}
      <div className="hidden md:block bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Task</th>
              <th className="py-3 px-3">Priority</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Assignee</th>
              <th className="py-3 px-3">Due Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
            {tasks.map((task) => {
              const isOverdue =
                task.due_date &&
                task.status !== 'done' &&
                new Date(task.due_date + 'T23:59:59') < new Date();
              const canEditThis = canManage || task.assigned_to === currentUserId;
              const canUpdateStatus = canManage || task.assigned_to === currentUserId;

              return (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Task Title & Description Preview */}
                  <td className="py-3 px-4 max-w-xs">
                    <div
                      onClick={() => onEditTask && onEditTask(task)}
                      className="cursor-pointer"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <PriorityBadge priority={task.priority} size="small" />
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {canUpdateStatus && onStatusChange ? (
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value)}
                        aria-label={`Change status for ${task.title}`}
                        className="bg-slate-100 dark:bg-slate-800 text-[11px] font-medium rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    ) : (
                      <StatusBadge status={task.status} size="small" />
                    )}
                  </td>

                  {/* Assignee */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {task.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center uppercase">
                          {task.assignee.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                          {task.assignee.name}
                        </span>
                      </div>
                    ) : onSelfAssign ? (
                      <button
                        onClick={() => onSelfAssign(task.id)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition-colors border border-indigo-200 dark:border-indigo-800"
                      >
                        Assign to me
                      </button>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                    )}
                  </td>

                  {/* Due Date */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {task.due_date ? (
                      <span
                        className={`font-medium flex items-center gap-1 ${
                          isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {task.due_date}
                        {isOverdue && (
                          <span className="px-1 py-0.2 rounded text-[9px] bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-extrabold uppercase">
                            Overdue
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {canEditThis && onEditTask && (
                        <button
                          onClick={() => onEditTask(task)}
                          aria-label="Edit task"
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                      {canManage && onDeleteTask && (
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          aria-label="Delete task"
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
