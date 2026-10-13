import React, { useState, useEffect } from 'react';
import { commentsApi } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

export function CommentsThread({ taskId = null, caseId = null, title = 'Discussion' }) {
  const { user } = useAuth();
  const toast = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [body, setBody] = useState('');

  const loadComments = async () => {
    try {
      setLoading(true);
      let res;
      if (taskId) {
        res = await commentsApi.listTaskComments(taskId);
      } else if (caseId) {
        res = await commentsApi.listCaseComments(caseId);
      }
      setComments(res?.comments || (Array.isArray(res) ? res : []));
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId || caseId) {
      loadComments();
    }
  }, [taskId, caseId]);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (e?.stopPropagation) e.stopPropagation();
    const cleanBody = body.trim();
    if (!cleanBody) return;

    try {
      setSubmitting(true);
      let res;
      if (taskId) {
        res = await commentsApi.createTaskComment(taskId, { body: cleanBody });
      } else if (caseId) {
        res = await commentsApi.createCaseComment(caseId, { body: cleanBody });
      }
      const newComment = res?.comment || res;
      if (newComment) {
        setComments((prev) => [...prev, newComment]);
      }
      setBody('');
      toast.success('Comment posted successfully');
    } catch (err) {
      toast.error(err.data?.message || err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await commentsApi.delete(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to delete comment');
    }
  };

  const renderCommentBody = (text) => {
    if (!text) return null;
    // Highlight mentions like @Name or @email
    const parts = text.split(/(@[a-zA-Z0-9_\-\.]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 mr-0.5"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {title} ({comments.length})
        </h4>
        <span className="text-[11px] text-slate-400">Type @name to mention a teammate</span>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading conversation...</div>
        ) : comments.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            No comments yet. Start the conversation!
          </div>
        ) : (
          comments.map((comment) => {
            const author = comment.author || {};
            const isMe = author.id === user?.id;
            const timeStr = comment.created_at
              ? new Date(comment.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <div
                key={comment.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs"
              >
                {/* Author Avatar */}
                <div className="w-7 h-7 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  {author.profile_image_url ? (
                    <img
                      src={author.profile_image_url}
                      alt={author.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    getInitials(author.name)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {author.name || 'Team member'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{timeStr}</span>
                      {isMe && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete comment"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 break-words leading-relaxed">
                    {renderCommentBody(comment.body)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <div className="space-y-2 pt-1">
        <textarea
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Write a message or update... Type @name to mention (Ctrl+Enter to send)"
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !body.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all"
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
}
