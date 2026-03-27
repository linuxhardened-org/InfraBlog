import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MarkdownContent } from '@/components/blog/MarkdownContent';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { CommentSection } from '@/components/blog/CommentSection';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await api.posts.getBySlug(slug);
    return {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      openGraph: {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt || '',
        images: post.ogImage || post.coverImage ? [{ url: post.ogImage || post.coverImage! }] : [],
        type: 'article',
        publishedTime: post.publishedAt,
        authors: [post.author.name],
      },
    };
  } catch {
    return { title: 'Post Not Found' };
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  let post;
  try {
    post = await api.posts.getBySlug(slug);
  } catch {
    return (
      <div className="container-blog py-20 text-center">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Post Not Found</h1>
        <Link href="/blog" className="text-primary-500 hover:text-primary-600">← Back to blog</Link>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.author.name },
    publisher: { '@type': 'Organization', name: 'LinuxHardened' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="container-blog py-12">
        {/* Header */}
        <header className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center gap-3 mb-5">
            {post.category && (
              <Link href={`/category/${post.category.slug}`} className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-colors">
                {post.category.name}
              </Link>
            )}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{post.readingTime} min read</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{post.viewCount} views</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-5" style={{ color: 'var(--text-primary)' }}>
            {post.title}
          </h1>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
              {post.author.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{post.author.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
              </p>
            </div>
          </div>
        </header>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="max-w-3xl mx-auto mb-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag.id} href={`/tag/${tag.slug}`} className="text-xs px-3 py-1 rounded-full border transition-colors hover:bg-[var(--bg-tertiary)]" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Two column layout: TOC + Content */}
        <div className="max-w-5xl mx-auto flex gap-10">
          {/* TOC */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <TableOfContents content={post.content} />
              <div className="mt-6">
                <ShareButtons title={post.title} slug={post.slug} />
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            <div className="prose-content">
              <MarkdownContent content={post.content} />
            </div>

            {/* Mobile share */}
            <div className="lg:hidden mt-10">
              <ShareButtons title={post.title} slug={post.slug} />
            </div>

            {/* Comments */}
            <div className="mt-16">
              <CommentSection postId={post.id} comments={post.comments || []} />
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
