import { api } from '@/lib/api';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse all blog categories',
};

export default async function CategoriesPage() {
  let categories: any[] = [];
  try { categories = await api.categories.list(); } catch {}

  return (
    <div className="container-blog py-12">
      <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="card-hover p-6 rounded-xl border group"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-primary-500 font-bold text-lg">{cat.name.charAt(0)}</span>
            </div>
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{cat.name}</h2>
            {cat.description && <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{cat.description}</p>}
            <p className="text-xs font-medium text-primary-500">{cat.postCount} posts →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
