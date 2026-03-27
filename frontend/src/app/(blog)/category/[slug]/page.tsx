import { api } from '@/lib/api';
import { PostCard } from '@/components/blog/PostCard';
import type { Metadata } from 'next';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const cat = await api.categories.getBySlug(slug);
    return { title: cat.name, description: cat.description || `Posts in ${cat.name}` };
  } catch { return { title: 'Category' }; }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  let category: any = null;
  let posts: any[] = [];

  try {
    category = await api.categories.getBySlug(slug);
    const res = await api.posts.list({ categoryId: category.id, limit: '50' });
    posts = res.data;
  } catch {}

  if (!category) {
    return <div className="container-blog py-20 text-center"><h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Category not found</h1></div>;
  }

  return (
    <div className="container-blog py-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-primary-500/10 text-primary-500">Category</div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{category.name}</h1>
        {category.description && <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{category.description}</p>}
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{category.postCount} posts</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
}
