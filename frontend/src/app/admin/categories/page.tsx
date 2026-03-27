'use client';

import { useEffect, useState } from 'react';
import { adminApi, api, type Category } from '@/lib/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [editId, setEditId] = useState('');

  const load = () => api.categories.list().then(setCategories).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token || !name) return;
    if (editId) {
      await adminApi.categories.update(token, editId, { name, description: desc });
    } else {
      await adminApi.categories.create(token, { name, description: desc });
    }
    setName(''); setDesc(''); setEditId('');
    load();
  };

  const handleEdit = (cat: Category) => { setEditId(cat.id); setName(cat.name); setDesc(cat.description || ''); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete category?')) return;
    const token = localStorage.getItem('token');
    if (token) { await adminApi.categories.delete(token, id); load(); }
  };

  const inputStyle = { backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Categories</h1>

      {/* Form */}
      <div className="flex gap-2 mb-6">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="flex-1 px-3 py-2 rounded-lg border text-sm" style={inputStyle} />
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" className="flex-1 px-3 py-2 rounded-lg border text-sm hidden sm:block" style={inputStyle} />
        <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors">
          {editId ? 'Update' : 'Add'}
        </button>
        {editId && <button onClick={() => { setEditId(''); setName(''); setDesc(''); }} className="px-3 py-2 rounded-lg text-sm border" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Cancel</button>}
      </div>

      {/* List */}
      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cat.description} · {cat.postCount} posts</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(cat)} className="px-2 py-1 text-xs text-primary-500 hover:bg-primary-500/10 rounded">Edit</button>
              <button onClick={() => handleDelete(cat.id)} className="px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
