import { api } from '@/lib/api';
import { PostCard } from '@/components/blog/PostCard';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const tag = await api.tags.getBySlug(slug);
    return { title: `#${tag.name}`, description: `Posts tagged with ${tag.name}` };
  } catch { return { title: 'Tag' }; }
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  let tag: any = null;
  let posts: any[] = [];

  try {
    tag = await api.tags.getBySlug(slug);
    const res = await api.posts.list({ tagId: tag.id, limit: '50' });
    posts = res.data;
  } catch {}

  if (!tag) {
    return <div className="container-blog py-20 text-center"><h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Tag not found</h1></div>;
  }

  return (
    <div className="container-blog py-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-accent-500/10 text-accent-500">Tag</div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>#{tag.name}</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{tag.postCount} posts</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
}
