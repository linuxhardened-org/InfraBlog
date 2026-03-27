'use client';

import { useEffect, useState } from 'react';
import { adminApi, api, type Tag } from '@/lib/api';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState('');

  const load = () => api.tags.list().then(setTags).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token || !name) return;
    if (editId) { await adminApi.tags.update(token, editId, { name }); }
    else { await adminApi.tags.create(token, { name }); }
    setName(''); setEditId(''); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete tag?')) return;
    const token = localStorage.getItem('token');
    if (token) { await adminApi.tags.delete(token, id); load(); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Tags</h1>
      <div className="flex gap-2 mb-6">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tag name" className="flex-1 px-3 py-2 rounded-lg border text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
        <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors">{editId ? 'Update' : 'Add'}</button>
        {editId && <button onClick={() => { setEditId(''); setName(''); }} className="px-3 py-2 rounded-lg text-sm border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Cancel</button>}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div key={tag.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>#{tag.name}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({tag.postCount})</span>
            <button onClick={() => { setEditId(tag.id); setName(tag.name); }} className="text-xs text-primary-500 hover:underline">Edit</button>
            <button onClick={() => handleDelete(tag.id)} className="text-xs text-red-500 hover:underline">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
