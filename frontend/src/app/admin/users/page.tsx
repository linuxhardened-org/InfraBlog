'use client';

import { useEffect, useState } from 'react';
import { adminApi, type User } from '@/lib/api';
import { formatDateShort } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    try { const res = await adminApi.users.list(token); setUsers(res.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateRole = async (id: string, role: string) => {
    const token = localStorage.getItem('token');
    if (token) { await adminApi.users.update(token, id, { role }); load(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete user?')) return;
    const token = localStorage.getItem('token');
    if (token) { await adminApi.users.delete(token, id).catch((e: any) => alert(e.message)); load(); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Users</h1>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>User</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>Role</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>Posts</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell" style={{ color: 'var(--text-secondary)' }}>Joined</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(3)].map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-4"><div className="h-4 skeleton rounded" /></td></tr>) :
              users.map((user) => (
                <tr key={user.id} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">{user.name.charAt(0)}</div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <select value={user.role} onChange={(e) => updateRole(user.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="EDITOR">Editor</option>
                      <option value="AUTHOR">Author</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>{user.postCount || 0}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateShort(user.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(user.id)} className="px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 rounded">Delete</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
