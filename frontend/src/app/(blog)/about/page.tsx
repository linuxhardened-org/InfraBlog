import { api } from '@/lib/api';
import { MarkdownContent } from '@/components/blog/MarkdownContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about LinuxHardened, a modern blogging platform for Linux security and DevOps.',
};

export default async function AboutPage() {
  let page: any = null;
  try { page = await api.pages.getBySlug('about'); } catch {}

  return (
    <div className="container-blog py-12">
      <div className="max-w-3xl mx-auto">
        {page ? (
          <div className="prose-content">
            <MarkdownContent content={page.content} />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>About LinuxHardened</h1>
            <div className="prose-content">
              <p>LinuxHardened is a modern, production-ready blogging platform focused on Linux security, server hardening, DevOps, and infrastructure best practices.</p>
              <p>Built with Next.js, Fastify, PostgreSQL, and Redis — battle-tested technologies for production workloads.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
