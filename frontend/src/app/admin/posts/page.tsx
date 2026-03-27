'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, type Post } from '@/lib/api';
import { formatDateShort } from '@/lib/utils';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const loadPosts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '15' };
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.posts.list(token, params);
      setPosts(res.data);
      setPagination(res.pagination);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, [page, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    await adminApi.posts.delete(token, id);
    loadPosts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Posts</h1>
        <Link href="/admin/posts/new" className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors">
          + New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['', 'PUBLISHED', 'DRAFT', 'SCHEDULED'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary-500 text-white' : 'border hover:bg-[var(--bg-tertiary)]'}`}
            style={statusFilter !== s ? { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' } : undefined}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Posts table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Title</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>Author</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>Status</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell" style={{ color: 'var(--text-secondary)' }}>Date</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-4"><div className="h-4 skeleton rounded" /></td></tr>
              ))
            ) : posts.length > 0 ? posts.map((post) => (
              <tr key={post.id} className="border-t hover:bg-[var(--bg-secondary)]" style={{ borderColor: 'var(--border-color)' }}>
                <td className="px-4 py-3">
                  <p className="font-medium truncate max-w-xs" style={{ color: 'var(--text-primary)' }}>{post.title}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{post.slug}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>{post.author.name}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${post.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500' : post.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatDateShort(post.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/posts/${post.id}/edit`} className="px-2.5 py-1 rounded text-xs font-medium text-primary-500 hover:bg-primary-500/10 transition-colors">Edit</Link>
                    <button onClick={() => handleDelete(post.id)} className="px-2.5 py-1 rounded text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-4 py-10 text-center" style={{ color: 'var(--text-muted)' }}>No posts found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button disabled={!pagination.hasPrev} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs rounded-lg border disabled:opacity-30" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>← Prev</button>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Page {pagination.page} of {pagination.totalPages}</span>
          <button disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs rounded-lg border disabled:opacity-30" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Next →</button>
        </div>
      )}
    </div>
  );
}
