import React from 'react';
import { StatusBadge } from '../StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';

export function TaskCard({
  task,
  projectName,
  onStatusChange,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = false,
  canUpdateStatus = true,
  updating = false,
  variant = 'default', // 'default' | 'kanban' | 'compact' | 'row'
  isDraggable = false,
  onDragStart,
  onSelfAssign,
}) {
  const isStatusEditable = Boolean(canUpdateStatus && onStatusChange);

  const isOverdue =
    task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date + 'T23:59:59') < new Date();

  // --------------------------------------------------------------------------
  // 1. ROW VARIANT (Desktop horizontal row / Mobile stacked card)
  // --------------------------------------------------------------------------
  if (variant === 'row') {
    return (
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 sm:px-4 sm:py-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Priority Badge + Title + Project Pill */}
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <PriorityBadge priority={task.priority} size="small" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                onClick={() => canEdit && onEdit && onEdit(task)}
                className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
              >
                {task.title}
              </h4>

              {(projectName || task.project_name || task.project?.name) && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                  {projectName || task.project_name || task.project?.name}
                </span>
              )}
            </div>

            {task.description && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 max-w-xl">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Assignee + Due Date + Status + Actions */}
        <div className="flex items-center justify-between md:justify-end gap-3.5 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/80 text-xs">
          {/* Assignee Avatar & Name */}
          <div className="flex items-center gap-1.5 min-w-[100px]">
            {task.assignee ? (
              <>
                <div
                  title={task.assignee.name}
                  className="w-5 h-5 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center uppercase flex-shrink-0"
                >
                  {task.assignee.profile_image_url ? (
                    <img
                      src={task.assignee.profile_image_url}
                      alt={task.assignee.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    task.assignee.name.charAt(0)
                  )}
                </div>
                <span className="truncate max-w-[90px] text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  {task.assignee.name}
                </span>
              </>
            ) : onSelfAssign ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelfAssign(task.id);
                }}
                className="px-2 py-0.5 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition-colors border border-indigo-200 dark:border-indigo-800"
              >
                Assign to me
              </button>
            ) : (
              <span className="text-slate-400 italic text-[11px]">Unassigned</span>
            )}
          </div>

          {/* Due Date & Overdue Tag */}
          <div className="min-w-[85px] text-right">
            {task.due_date ? (
              <div
                className={`text-[11px] font-medium flex items-center gap-1 justify-end ${
                  isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <span>{task.due_date}</span>
                {isOverdue && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="Overdue" />
                )}
              </div>
            ) : (
              <span className="text-slate-400 text-[11px]">No date</span>
            )}
          </div>

          {/* Status Dropdown / Badge */}
          {isStatusEditable ? (
            <select
              value={task.status}
              disabled={updating}
              onChange={(e) => onStatusChange(task.id, e.target.value)}
              aria-label={`Update status for ${task.title}`}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          ) : (
            <StatusBadge status={task.status} size="small" />
          )}

          {/* Edit / Open Action */}
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(task)}
              aria-label={`Edit task ${task.title}`}
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit Task"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. KANBAN VARIANT
  // --------------------------------------------------------------------------
  if (variant === 'kanban') {
    return (
      <div
        draggable={isDraggable && canUpdateStatus}
        onDragStart={(e) => onDragStart && onDragStart(e, task)}
        className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all select-none group relative ${
          (isDraggable && canUpdateStatus) ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        {/* Top: Priority & Overdue / Actions */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <PriorityBadge priority={task.priority} size="small" />

          <div className="flex items-center gap-1.5">
            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                Overdue
              </span>
            )}

            {canEdit && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                aria-label={`Edit task ${task.title}`}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-opacity"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h5
          onClick={() => canEdit && onEdit && onEdit(task)}
          className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-snug line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
        >
          {task.title}
        </h5>

        {/* Description snippet if any */}
        {task.description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Bottom Metadata: Assignee, Due date & mobile status mover */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <div
                title={`Assigned to ${task.assignee.name}`}
                className="flex items-center gap-1.5"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center uppercase">
                  {task.assignee.name.charAt(0)}
                </div>
                <span className="truncate max-w-[80px] font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                  {task.assignee.name.split(' ')[0]}
                </span>
              </div>
            ) : onSelfAssign ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelfAssign(task.id);
                }}
                className="px-1.5 py-0.5 rounded text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition-colors border border-indigo-200 dark:border-indigo-800"
              >
                Assign to me
              </button>
            ) : (
              <span className="text-slate-400 italic text-[10px]">Unassigned</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {task.due_date && (
              <span
                className={`text-[10px] font-medium flex items-center gap-1 ${
                  isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {task.due_date}
              </span>
            )}

            {/* Quick Status Selector for Mobile/Touch & Accessibility */}
            {isStatusEditable && (
              <select
                value={task.status}
                disabled={updating}
                onChange={(e) => onStatusChange(task.id, e.target.value)}
                aria-label={`Change column for ${task.title}`}
                className="bg-slate-100 dark:bg-slate-800 text-[10px] font-medium rounded px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Prog</option>
                <option value="done">Done</option>
              </select>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 3. COMPACT VARIANT
  // --------------------------------------------------------------------------
  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-between gap-3 group">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <PriorityBadge priority={task.priority} size="small" />
          <h5
            onClick={() => canEdit && onEdit && onEdit(task)}
            className="font-medium text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
          >
            {task.title}
          </h5>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <StatusBadge status={task.status} size="small" />

          {task.assignee && (
            <div
              title={task.assignee.name}
              className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center uppercase hidden sm:flex"
            >
              {task.assignee.name.charAt(0)}
            </div>
          )}

          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(task)}
              aria-label={`Edit task ${task.title}`}
              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 4. DEFAULT VARIANT (Card)
  // --------------------------------------------------------------------------
  return (
    <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>

          {isOverdue && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Overdue
            </span>
          )}
        </div>

        {/* Task Title */}
        <h4
          onClick={() => canEdit && onEdit && onEdit(task)}
          className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer"
        >
          {task.title}
        </h4>

        {/* Description preview */}
        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-3 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        {/* Assignee & Due Date Metadata */}
        <div className="flex items-center gap-3 flex-wrap">
          {task.assignee ? (
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center">
                {task.assignee.name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate max-w-[120px]">{task.assignee.name}</span>
            </div>
          ) : onSelfAssign ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelfAssign(task.id);
              }}
              className="px-2 py-0.5 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition-colors border border-indigo-200 dark:border-indigo-800"
            >
              Assign to me
            </button>
          ) : (
            <span className="italic text-slate-400 dark:text-slate-500 text-[11px]">Unassigned</span>
          )}

          {task.due_date && (
            <div className={`flex items-center gap-1 text-[11px] font-medium ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{task.due_date}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isStatusEditable && (
            <select
              value={task.status}
              disabled={updating}
              onChange={(e) => onStatusChange(task.id, e.target.value)}
              aria-label={`Update status for ${task.title}`}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          )}

          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(task)}
              aria-label={`Edit task ${task.title}`}
              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit Task"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}

          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              aria-label={`Delete task ${task.title}`}
              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Task"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
