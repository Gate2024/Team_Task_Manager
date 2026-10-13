import React from 'react';

const ROLE_BADGES = {
  owner: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  admin: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  member: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
};

export function MemberRow({
  member,
  currentUserRole = 'member',
  currentUserId,
  onRemove,
  isRemoving = false,
}) {
  const user = member.user || {};
  const role = member.role || 'member';
  const roleBadgeStyle = ROLE_BADGES[role] || ROLE_BADGES.member;

  // Determine if current user can remove this member:
  // - Project owner can remove anyone except themselves
  // - Admin can remove members, but NOT owner or another admin
  // - Regular member cannot remove anyone
  const isOwner = currentUserRole === 'owner';
  const isAdmin = currentUserRole === 'admin';
  const isTargetOwner = role === 'owner';
  const isTargetAdmin = role === 'admin';
  const isSelf = (member.user_id || user.id) === currentUserId;

  const canRemove =
    !isSelf &&
    !isTargetOwner &&
    (isOwner || (isAdmin && !isTargetAdmin));

  const initials = user.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h5 className="font-bold text-slate-900 dark:text-white text-sm truncate">
              {user.name || 'Workspace Member'}
            </h5>
            {isSelf && (
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                You
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {user.email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wider ${roleBadgeStyle}`}
        >
          {role}
        </span>

        {canRemove && onRemove && (
          <button
            onClick={() => onRemove(member)}
            disabled={isRemoving}
            aria-label={`Remove ${user.name || 'member'} from project`}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50"
            title="Remove member"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
