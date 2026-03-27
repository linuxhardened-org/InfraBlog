const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const INTERNAL_API = process.env.INTERNAL_API_URL || API_BASE;

function getBaseUrl() {
  if (typeof window === 'undefined') return INTERNAL_API;
  return API_BASE;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  publishedAt?: string;
  readingTime?: number;
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  author: { id: string; name: string; avatar?: string };
  category?: { id: string; name: string; slug: string };
  tags: { id: string; name: string; slug: string }[];
  commentCount: number;
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  status: string;
  createdAt: string;
  replies?: Comment[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
  postCount?: number;
  createdAt: string;
}

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface DashboardStats {
  posts: { total: number; published: number; drafts: number };
  comments: { total: number; pending: number };
  users: number;
  media: number;
  totalViews: number;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${getBaseUrl()}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'API request failed');
  }

  return res.json();
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ---- Public API ----
export const api = {
  posts: {
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchApi<ApiResponse<Post[]>>(`/posts${query}`);
    },
    getBySlug: (slug: string) => fetchApi<Post>(`/posts/${slug}`),
  },
  categories: {
    list: () => fetchApi<Category[]>('/categories'),
    getBySlug: (slug: string) => fetchApi<Category>('/categories/' + slug),
  },
  tags: {
    list: () => fetchApi<Tag[]>('/tags'),
    getBySlug: (slug: string) => fetchApi<Tag>('/tags/' + slug),
  },
  comments: {
    create: (data: { content: string; authorName: string; authorEmail: string; postId: string; parentId?: string }) =>
      fetchApi<Comment>('/comments', { method: 'POST', body: JSON.stringify(data) }),
    getByPost: (postId: string) => fetchApi<Comment[]>(`/posts/${postId}/comments`),
  },
  pages: {
    list: () => fetchApi<Page[]>('/pages'),
    getBySlug: (slug: string) => fetchApi<Page>('/pages/' + slug),
  },
};

// ---- Admin API ----
export const adminApi = {
  auth: {
    login: (data: { email: string; password: string }) =>
      fetchApi<{ user: User; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: (token: string) =>
      fetchApi<User>('/auth/me', { headers: authHeaders(token) }),
    updateProfile: (token: string, data: Partial<User>) =>
      fetchApi<User>('/auth/profile', { method: 'PUT', body: JSON.stringify(data), headers: authHeaders(token) }),
  },
  stats: {
    get: (token: string) => fetchApi<DashboardStats>('/admin/stats', { headers: authHeaders(token) }),
  },
  posts: {
    list: (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchApi<ApiResponse<Post[]>>(`/admin/posts${query}`, { headers: authHeaders(token) });
    },
    getById: (token: string, id: string) =>
      fetchApi<Post>(`/admin/posts/${id}`, { headers: authHeaders(token) }),
    create: (token: string, data: any) =>
      fetchApi<Post>('/admin/posts', { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token) }),
    update: (token: string, id: string, data: any) =>
      fetchApi<Post>(`/admin/posts/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: authHeaders(token) }),
    delete: (token: string, id: string) =>
      fetchApi<{ message: string }>(`/admin/posts/${id}`, { method: 'DELETE', headers: authHeaders(token) }),
  },
  categories: {
    create: (token: string, data: { name: string; description?: string }) =>
      fetchApi<Category>('/admin/categories', { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token) }),
    update: (token: string, id: string, data: any) =>
      fetchApi<Category>(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: authHeaders(token) }),
    delete: (token: string, id: string) =>
      fetchApi<{ message: string }>(`/admin/categories/${id}`, { method: 'DELETE', headers: authHeaders(token) }),
  },
  tags: {
    create: (token: string, data: { name: string }) =>
      fetchApi<Tag>('/admin/tags', { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token) }),
    update: (token: string, id: string, data: any) =>
      fetchApi<Tag>(`/admin/tags/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: authHeaders(token) }),
    delete: (token: string, id: string) =>
      fetchApi<{ message: string }>(`/admin/tags/${id}`, { method: 'DELETE', headers: authHeaders(token) }),
  },
  comments: {
    list: (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchApi<ApiResponse<Comment[]>>(`/admin/comments${query}`, { headers: authHeaders(token) });
    },
    update: (token: string, id: string, status: string) =>
      fetchApi<Comment>(`/admin/comments/${id}`, { method: 'PUT', body: JSON.stringify({ status }), headers: authHeaders(token) }),
    delete: (token: string, id: string) =>
      fetchApi<{ message: string }>(`/admin/comments/${id}`, { method: 'DELETE', headers: authHeaders(token) }),
  },
  users: {
    list: (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchApi<ApiResponse<User[]>>(`/admin/users${query}`, { headers: authHeaders(token) });
    },
    getById: (token: string, id: string) =>
      fetchApi<User>(`/admin/users/${id}`, { headers: authHeaders(token) }),
    update: (token: string, id: string, data: any) =>
      fetchApi<User>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: authHeaders(token) }),
    delete: (token: string, id: string) =>
      fetchApi<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE', headers: authHeaders(token) }),
  },
  media: {
    list: (token: string, params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return fetchApi<ApiResponse<Media[]>>(`/admin/media${query}`, { headers: authHeaders(token) });
    },
    upload: async (token: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const url = `${getBaseUrl()}/admin/media`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json() as Promise<Media>;
    },
    delete: (token: string, id: string) =>
      fetchApi<{ message: string }>(`/admin/media/${id}`, { method: 'DELETE', headers: authHeaders(token) }),
  },
  pages: {
    list: (token: string) =>
      fetchApi<Page[]>('/admin/pages', { headers: authHeaders(token) }),
    create: (token: string, data: any) =>
      fetchApi<Page>('/admin/pages', { method: 'POST', body: JSON.stringify(data), headers: authHeaders(token) }),
    update: (token: string, id: string, data: any) =>
      fetchApi<Page>(`/admin/pages/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: authHeaders(token) }),
    delete: (token: string, id: string) =>
      fetchApi<{ message: string }>(`/admin/pages/${id}`, { method: 'DELETE', headers: authHeaders(token) }),
  },
};
