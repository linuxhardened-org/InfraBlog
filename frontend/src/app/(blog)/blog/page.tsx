import { api } from '@/lib/api';
import { PostCard } from '@/components/blog/PostCard';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read the latest articles on DevOps, cloud computing, web development, and infrastructure.',
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string; tag?: string }> }) {
  const params = await searchParams;
  const page = params.page || '1';
  const query: Record<string, string> = { page, limit: '12' };
  if (params.category) query.categoryId = params.category;
  if (params.tag) query.tagId = params.tag;

  let posts: any[] = [];
  let pagination: any = { total: 0, page: 1, totalPages: 1, hasNext: false, hasPrev: false };

  try {
    const res = await api.posts.list(query);
    posts = res.data;
    pagination = res.pagination;
  } catch {}

  return (
    <div className="container-blog py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Blog</h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Latest articles and tutorials</p>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>No posts found.</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {pagination.hasPrev && (
            <Link href={`/blog?page=${pagination.page - 1}`} className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-[var(--bg-tertiary)]" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
              ← Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          {pagination.hasNext && (
            <Link href={`/blog?page=${pagination.page + 1}`} className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-[var(--bg-tertiary)]" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
