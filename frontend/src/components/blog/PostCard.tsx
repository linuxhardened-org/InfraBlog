import Link from 'next/link';
import type { Post } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <article className={`card-hover rounded-xl border overflow-hidden fade-in ${featured ? 'md:col-span-2 md:grid md:grid-cols-2' : ''}`} style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      {/* Cover Image */}
      {post.coverImage ? (
        <Link href={`/blog/${post.slug}`} className={`block overflow-hidden ${featured ? 'h-full min-h-[200px]' : 'aspect-video'}`}>
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        </Link>
      ) : (
        <Link href={`/blog/${post.slug}`} className={`block overflow-hidden ${featured ? 'h-full min-h-[200px]' : 'aspect-video'} bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center`}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-2xl">
            {post.title.charAt(0)}
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="p-5 flex flex-col justify-between">
        <div>
          {/* Meta */}
          <div className="flex items-center gap-3 mb-3">
            {post.category && (
              <Link href={`/category/${post.category.slug}`} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-colors">
                {post.category.name}
              </Link>
            )}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {post.readingTime} min read
            </span>
          </div>

          {/* Title */}
          <Link href={`/blog/${post.slug}`}>
            <h3 className={`font-bold leading-snug mb-2 transition-colors hover:text-primary-500 ${featured ? 'text-xl md:text-2xl' : 'text-lg'}`} style={{ color: 'var(--text-primary)' }}>
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold">
              {post.author.name.charAt(0)}
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{post.author.name}</span>
          </div>
          <time className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
          </time>
        </div>
      </div>
    </article>
  );
}
