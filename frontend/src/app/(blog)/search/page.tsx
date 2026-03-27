'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, type Post } from '@/lib/api';
import { PostCard } from '@/components/blog/PostCard';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setPosts([]); return; }
    setLoading(true);
    try {
      const res = await api.posts.list({ search: q, limit: '20' });
      setPosts(res.data);
    } catch { setPosts([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <div className="container-blog py-12">
      <div className="max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>Search</h1>
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-12 pr-4 py-4 rounded-xl border text-base focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      ) : query.trim() ? (
        <p className="text-center py-10" style={{ color: 'var(--text-muted)' }}>No results found for &ldquo;{query}&rdquo;</p>
      ) : (
        <p className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Start typing to search articles...</p>
      )}
    </div>
  );
}
