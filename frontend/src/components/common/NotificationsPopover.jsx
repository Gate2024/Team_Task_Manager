import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationsApi } from '../../api';

export function NotificationsPopover({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.list({ limit: 15 });
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await notificationsApi.markRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }

    onClose();

    // Navigate to target object
    if (notif.case_id) {
      navigate(`/cases?id=${notif.case_id}`);
    } else if (notif.task_id && notif.project_id) {
      navigate(`/projects/${notif.project_id}?task=${notif.task_id}`);
    } else if (notif.project_id) {
      navigate(`/projects/${notif.project_id}`);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-3 z-40 animate-slideDown flex flex-col max-h-[80vh]">
        <div className="px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Workspace activity and assignments
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="p-2 overflow-y-auto custom-scrollbar flex-1 space-y-1.5">
          {loading ? (
            <div className="py-6 text-center text-xs text-slate-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <span className="text-emerald-500 font-bold block mb-1">All caught up!</span>
              No notifications at the moment.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                  !n.is_read
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-800/40'
                    : 'bg-white dark:bg-slate-900/40 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                    {n.title}
                  </span>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                  {n.message}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                  <span>
                    {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  <span className="uppercase tracking-wider font-semibold text-[9px] text-indigo-500">
                    {n.type ? n.type.replace('_', ' ') : ''}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Link
            to="/notifications"
            onClick={onClose}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View all notifications &rarr;
          </Link>
        </div>
      </div>
    </>
  );
}
