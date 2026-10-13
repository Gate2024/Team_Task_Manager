import React, { useState } from 'react';
import { MemberRow } from './MemberRow';
import { AddMemberModal } from './AddMemberModal';
import { ConfirmModal } from '../common/ConfirmModal';

export function MemberList({
  members = [],
  currentUserRole = 'member',
  currentUserId,
  onAddMember,
  onRemoveMember,
  loading = false,
  error = null,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';

  const filteredMembers = members.filter((m) => {
    const u = m.user || {};
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setRemoving(true);
    try {
      const targetId = memberToRemove.user_id || memberToRemove.id;
      await onRemoveMember(targetId);
      setMemberToRemove(null);
    } catch {
      // Error handled by parent or toast
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Project Members ({members.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Team members with access to tasks and activities in this workspace.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Member</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      {members.length > 3 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter members by name or email..."
            aria-label="Filter members"
            className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Member Rows */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {searchTerm ? 'No members match your filter.' : 'No members found in this project.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <MemberRow
              key={member.id || member.user_id}
              member={member}
              currentUserRole={currentUserRole}
              currentUserId={currentUserId}
              onRemove={(m) => setMemberToRemove(m)}
            />
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddMember={onAddMember}
      />

      {/* Remove Member Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(memberToRemove)}
        title="Remove Team Member?"
        message={`Are you sure you want to remove ${memberToRemove?.user?.name || 'this user'} from the project? Any tasks currently assigned to them will become unassigned.`}
        confirmText="Remove Member"
        isDestructive={true}
        loading={removing}
        onConfirm={handleConfirmRemove}
        onClose={() => setMemberToRemove(null)}
      />
    </div>
  );
}
