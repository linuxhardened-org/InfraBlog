'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, api, type Category, type Tag } from '@/lib/api';
import { MarkdownContent } from '@/components/blog/MarkdownContent';

export default function NewPostPage() {
  return <PostEditor />;
}

export function PostEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'SCHEDULED'>('DRAFT');
  const [categoryId, setCategoryId] = useState('');
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  useEffect(() => {
    api.categories.list().then(setCategories).catch(() => {});
    api.tags.list().then(setTags).catch(() => {});
    
    if (postId) {
      const token = localStorage.getItem('token');
      if (token) {
        adminApi.posts.getById(token, postId).then((post) => {
          setTitle(post.title);
          setContent(post.content);
          setExcerpt(post.excerpt || '');
          setStatus(post.status);
          setCategoryId(post.category?.id || '');
          setTagIds(post.tags?.map((t: any) => t.id) || []);
          setSeoTitle(post.seoTitle || '');
          setSeoDescription(post.seoDescription || '');
        }).catch(() => router.push('/admin/posts'));
      }
    }
  }, [postId, router]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token || !title || !content) return;
    setSaving(true);
    try {
      const data = {
        title, content, excerpt: excerpt || undefined,
        status, categoryId: categoryId || undefined,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
      };
      if (postId) {
        await adminApi.posts.update(token, postId, data);
      } else {
        await adminApi.posts.create(token, data);
      }
      router.push('/admin/posts');
    } catch (err: any) {
      alert(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  const toggleTag = (id: string) => {
    setTagIds((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  const inputStyle = { backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {postId ? 'Edit Post' : 'New Post'}
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-2 rounded-lg text-xs font-medium border transition-colors hover:bg-[var(--bg-tertiary)]"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            {showPreview ? '✏️ Editor' : '👁️ Preview'}
          </button>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)}
            className="px-3 py-2 rounded-lg text-xs font-medium border" style={inputStyle}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="SCHEDULED">Scheduled</option>
          </select>
          <button onClick={handleSave} disabled={saving || !title || !content}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : postId ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="w-full px-4 py-3 rounded-xl border text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            style={inputStyle}
          />

          {showPreview ? (
            <div className="p-6 rounded-xl border min-h-[500px] prose-content" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <MarkdownContent content={content} />
            </div>
          ) : (
            <textarea
              value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content in Markdown..."
              rows={25}
              className="w-full px-4 py-3 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
              style={inputStyle}
            />
          )}

          <textarea
            value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief excerpt for post cards..."
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
            style={inputStyle}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Category */}
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Category</h3>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle}
            >
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <button key={t.id} onClick={() => toggleTag(t.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${tagIds.includes(t.id) ? 'bg-primary-500 text-white' : 'border hover:bg-[var(--bg-tertiary)]'}`}
                  style={!tagIds.includes(t.id) ? { borderColor: 'var(--border-color)', color: 'var(--text-secondary)' } : undefined}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <button onClick={() => setShowSeo(!showSeo)} className="text-sm font-semibold w-full text-left flex justify-between" style={{ color: 'var(--text-primary)' }}>
              SEO Settings <span>{showSeo ? '▲' : '▼'}</span>
            </button>
            {showSeo && (
              <div className="mt-3 space-y-3">
                <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO Title"
                  className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} />
                <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="SEO Description" rows={3}
                  className="w-full px-3 py-2 rounded-lg border text-sm resize-none" style={inputStyle} />
              </div>
            )}
          </div>

          {/* Markdown help */}
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Markdown Guide</h3>
            <div className="text-xs space-y-1 font-mono" style={{ color: 'var(--text-muted)' }}>
              <p># Heading 1</p>
              <p>## Heading 2</p>
              <p>**bold** *italic*</p>
              <p>[link](url)</p>
              <p>```lang code```</p>
              <p>- list item</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
