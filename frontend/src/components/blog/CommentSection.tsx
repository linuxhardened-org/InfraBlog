'use client';

import { useState } from 'react';
import { api, type Comment } from '@/lib/api';
import { formatDate } from '@/lib/utils';

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
          {comment.authorName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{comment.authorName}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(comment.createdAt)}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{comment.content}</p>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pl-4 border-l-2 space-y-3" style={{ borderColor: 'var(--border-color)' }}>
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({ postId, comments }: { postId: string; comments: Comment[] }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !content) return;
    setSubmitting(true);
    try {
      await api.comments.create({ content, authorName: name, authorEmail: email, postId });
      setSuccess(true);
      setContent('');
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  return (
    <section>
      <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        Comments ({comments.length})
      </h3>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="space-y-4 mb-10">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      ) : (
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>No comments yet. Be the first!</p>
      )}

      {/* Comment form */}
      <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Leave a Comment</h4>
        {success ? (
          <p className="text-sm text-green-500">Your comment has been submitted for moderation. Thank you!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="px-4 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-4 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
            <textarea
              placeholder="Write your comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Post Comment'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
