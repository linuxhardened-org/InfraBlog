'use client';

import { useEffect, useState } from 'react';
import { adminApi, type DashboardStats } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      adminApi.stats.get(token).then(setStats).catch(console.error);
    }
  }, []);

  const statCards = stats ? [
    { label: 'Total Posts', value: stats.posts.total, sub: `${stats.posts.published} published`, color: 'from-blue-500 to-blue-600', href: '/admin/posts' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), sub: 'all time', color: 'from-green-500 to-emerald-600', href: '/admin/posts' },
    { label: 'Comments', value: stats.comments.total, sub: `${stats.comments.pending} pending`, color: 'from-amber-500 to-orange-600', href: '/admin/comments' },
    { label: 'Users', value: stats.users, sub: 'registered', color: 'from-purple-500 to-violet-600', href: '/admin/users' },
    { label: 'Media Files', value: stats.media, sub: 'uploaded', color: 'from-pink-500 to-rose-600', href: '/admin/media' },
    { label: 'Drafts', value: stats.posts.drafts, sub: 'unpublished', color: 'from-slate-500 to-slate-600', href: '/admin/posts' },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Welcome to LinuxHardened admin panel</p>
      </div>

      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map(({ label, value, sub, color, href }) => (
            <Link
              key={label}
              href={href}
              className="card-hover p-5 rounded-xl border group"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white text-lg font-bold mb-3`}>
                {String(value).charAt(0)}
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl skeleton" />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/posts/new" className="px-4 py-2.5 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors">
            ✏️ New Post
          </Link>
          <Link href="/admin/categories" className="px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-[var(--bg-tertiary)]" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            📁 Manage Categories
          </Link>
          <Link href="/admin/comments" className="px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-[var(--bg-tertiary)]" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            💬 Moderate Comments
          </Link>
          <Link href="/admin/media" className="px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-[var(--bg-tertiary)]" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            🖼️ Upload Media
          </Link>
        </div>
      </div>
    </div>
  );
}
