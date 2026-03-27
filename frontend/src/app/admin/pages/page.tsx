'use client';

import { useEffect, useState } from 'react';
import { adminApi, type Page } from '@/lib/api';

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [editId, setEditId] = useState('');

  const load = async () => {
    const token = localStorage.getItem('token');
    if (token) { const res = await adminApi.pages.list(token); setPages(res); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token || !title || !content) return;
    if (editId) { await adminApi.pages.update(token, editId, { title, content, status }); }
    else { await adminApi.pages.create(token, { title, content, status }); }
    setTitle(''); setContent(''); setStatus('DRAFT'); setEditId('');
    load();
  };

  const handleEdit = (page: Page) => { setEditId(page.id); setTitle(page.title); setContent(page.content); setStatus(page.status as any); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete page?')) return;
    const token = localStorage.getItem('token');
    if (token) { await adminApi.pages.delete(token, id); load(); }
  };

  const inputStyle = { backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Pages</h1>

      {/* Editor */}
      <div className="p-4 rounded-xl border mb-6 space-y-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title" className="w-full px-3 py-2 rounded-lg border text-sm" style={inputStyle} />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Page content (Markdown)" rows={8} className="w-full px-3 py-2 rounded-lg border text-sm font-mono resize-none" style={inputStyle} />
        <div className="flex items-center gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="px-3 py-2 rounded-lg border text-sm" style={inputStyle}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600">{editId ? 'Update' : 'Create'}</button>
          {editId && <button onClick={() => { setEditId(''); setTitle(''); setContent(''); setStatus('DRAFT'); }} className="px-3 py-2 rounded-lg text-sm border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Cancel</button>}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {pages.map((page) => (
          <div key={page.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{page.title}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>/{page.slug} · <span className={page.status === 'PUBLISHED' ? 'text-green-500' : 'text-amber-500'}>{page.status}</span></p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(page)} className="px-2 py-1 text-xs text-primary-500 hover:bg-primary-500/10 rounded">Edit</button>
              <button onClick={() => handleDelete(page.id)} className="px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
