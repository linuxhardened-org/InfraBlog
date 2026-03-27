'use client';

import { useEffect, useState, useRef } from 'react';
import { adminApi, type Media } from '@/lib/api';

export default function AdminMediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    try { const res = await adminApi.media.list(token); setMedia(res.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setUploading(true);
    try { await adminApi.media.upload(token, file); load(); } catch (err: any) { alert(err.message); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete file?')) return;
    const token = localStorage.getItem('token');
    if (token) { await adminApi.media.delete(token, id); load(); }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copied!');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Media Library</h1>
        <label className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors cursor-pointer">
          {uploading ? 'Uploading...' : '+ Upload'}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-square skeleton rounded-xl" />)}
        </div>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <div key={item.id} className="group relative rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
              <div className="aspect-square">
                <img src={item.url} alt={item.originalName} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <div className="w-full">
                  <p className="text-white text-xs truncate mb-2">{item.originalName}</p>
                  <div className="flex gap-1">
                    <button onClick={() => copyUrl(item.url)} className="flex-1 px-2 py-1 rounded text-xs bg-white/20 text-white hover:bg-white/30">Copy URL</button>
                    <button onClick={() => handleDelete(item.id)} className="px-2 py-1 rounded text-xs bg-red-500/80 text-white hover:bg-red-500">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-20 text-sm" style={{ color: 'var(--text-muted)' }}>No media files yet</p>
      )}
    </div>
  );
}
