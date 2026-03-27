'use client';

import { useEffect, useState } from 'react';
import { adminApi, type Comment } from '@/lib/api';
import { formatDateShort } from '@/lib/utils';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const load = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '50' };
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.comments.list(token, params);
      setComments(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('token');
    if (token) { await adminApi.comments.update(token, id, status); load(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete comment?')) return;
    const token = localStorage.getItem('token');
    if (token) { await adminApi.comments.delete(token, id); load(); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Comments</h1>
      <div className="flex gap-2 mb-4">
        {['PENDING', 'APPROVED', 'SPAM', ''].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary-500 text-white' : 'border hover:bg-[var(--bg-tertiary)]'}`}
            style={statusFilter !== s ? { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' } : undefined}
          >{s || 'All'}</button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="h-20 skeleton rounded-lg" />) :
          comments.length > 0 ? comments.map((c) => (
            <div key={c.id} className="p-4 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.authorName}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.authorEmail}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${c.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : c.status === 'SPAM' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>{c.status}</span>
                  </div>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{c.content}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    on <strong>{c.post?.title}</strong> · {formatDateShort(c.createdAt)}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {c.status !== 'APPROVED' && <button onClick={() => updateStatus(c.id, 'APPROVED')} className="px-2 py-1 text-xs rounded text-green-500 hover:bg-green-500/10">✓</button>}
                  {c.status !== 'SPAM' && <button onClick={() => updateStatus(c.id, 'SPAM')} className="px-2 py-1 text-xs rounded text-amber-500 hover:bg-amber-500/10">⚠</button>}
                  <button onClick={() => handleDelete(c.id)} className="px-2 py-1 text-xs rounded text-red-500 hover:bg-red-500/10">✕</button>
                </div>
              </div>
            </div>
          )) : <p className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>No comments</p>
        }
      </div>
    </div>
  );
}
