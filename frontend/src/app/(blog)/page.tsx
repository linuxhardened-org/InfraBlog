import Link from 'next/link';
import { api, type Post, type Category } from '@/lib/api';
import { PostCard } from '@/components/blog/PostCard';

async function getData() {
  try {
    const [postsRes, categories] = await Promise.all([
      api.posts.list({ limit: '9' }),
      api.categories.list(),
    ]);
    return { posts: postsRes.data, categories };
  } catch {
    return { posts: [] as Post[], categories: [] as Category[] };
  }
}

export default async function HomePage() {
  const { posts, categories } = await getData();
  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 7);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary-500/10 to-accent-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-accent-500/10 to-primary-500/10 blur-3xl" />
        </div>
        <div className="container-blog relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 bg-primary-500/10 text-primary-500">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              Linux Security & DevOps Blog
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6" style={{ color: 'var(--text-primary)' }}>
              Harden Your <br />
              <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                Linux Infrastructure
              </span>
            </h1>
            <p className="text-lg md:text-xl max-w-xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
              Practical articles on Linux security, server hardening, DevOps, and infrastructure best practices.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/blog" className="px-6 py-3 rounded-xl text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-all hover:shadow-lg hover:shadow-primary-500/25">
                Read Articles
              </Link>
              <Link href="/categories" className="px-6 py-3 rounded-xl text-sm font-semibold transition-colors border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                Browse Topics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="container-blog py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Featured</h2>
          </div>
          <PostCard post={featuredPost} featured />
        </section>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section className="container-blog pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Latest Articles</h2>
            <Link href="/blog" className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="container-blog">
            <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>Browse by Topic</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="card-hover p-5 rounded-xl border text-center group"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-primary-500 font-bold">{cat.name.charAt(0)}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{cat.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cat.postCount} posts</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="container-blog py-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-accent-600 p-8 md:p-12 text-center text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Stay in the Loop</h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">Get the latest articles on Linux security and DevOps delivered to your inbox.</p>
            <div className="flex items-center gap-2 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-xl text-sm bg-white/10 border border-white/20 placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur"
              />
              <button className="px-6 py-3 rounded-xl text-sm font-semibold bg-white text-primary-600 hover:bg-white/90 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
