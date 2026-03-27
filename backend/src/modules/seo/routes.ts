import { FastifyInstance } from 'fastify';
import prisma from '../../config/database.js';

export default async function seoRoutes(fastify: FastifyInstance) {
  // Sitemap.xml
  fastify.get('/sitemap.xml', {
    schema: { description: 'Generate sitemap.xml', tags: ['SEO'] },
    handler: async (request, reply) => {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      const [posts, categories, tags, pages] = await Promise.all([
        prisma.post.findMany({
          where: { status: 'PUBLISHED' },
          select: { slug: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
        prisma.tag.findMany({ select: { slug: true, updatedAt: true } }),
        prisma.page.findMany({
          where: { status: 'PUBLISHED' },
          select: { slug: true, updatedAt: true },
        }),
      ]);

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // Home page
      xml += `  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
      xml += `  <url><loc>${baseUrl}/blog</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;

      // Posts
      for (const post of posts) {
        xml += `  <url><loc>${baseUrl}/blog/${post.slug}</loc><lastmod>${post.updatedAt.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
      }

      // Categories
      for (const cat of categories) {
        xml += `  <url><loc>${baseUrl}/category/${cat.slug}</loc><lastmod>${cat.updatedAt.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
      }

      // Tags
      for (const tag of tags) {
        xml += `  <url><loc>${baseUrl}/tag/${tag.slug}</loc><lastmod>${tag.updatedAt.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>\n`;
      }

      // Pages
      for (const page of pages) {
        xml += `  <url><loc>${baseUrl}/${page.slug}</loc><lastmod>${page.updatedAt.toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
      }

      xml += '</urlset>';

      reply.header('Content-Type', 'application/xml').send(xml);
    },
  });

  // Robots.txt
  fastify.get('/robots.txt', {
    schema: { description: 'Generate robots.txt', tags: ['SEO'] },
    handler: async (request, reply) => {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const content = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
      reply.header('Content-Type', 'text/plain').send(content);
    },
  });

  // RSS Feed
  fastify.get('/feed.xml', {
    schema: { description: 'Generate RSS feed', tags: ['SEO'] },
    handler: async (request, reply) => {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const siteName = 'InfraBlog';

      const posts = await prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        include: { author: { select: { name: true } } },
        orderBy: { publishedAt: 'desc' },
        take: 20,
      });

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
      xml += '  <channel>\n';
      xml += `    <title>${siteName}</title>\n`;
      xml += `    <link>${baseUrl}</link>\n`;
      xml += `    <description>Latest posts from ${siteName}</description>\n`;
      xml += `    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>\n`;

      for (const post of posts) {
        xml += '    <item>\n';
        xml += `      <title><![CDATA[${post.title}]]></title>\n`;
        xml += `      <link>${baseUrl}/blog/${post.slug}</link>\n`;
        xml += `      <guid>${baseUrl}/blog/${post.slug}</guid>\n`;
        xml += `      <description><![CDATA[${post.excerpt || ''}]]></description>\n`;
        xml += `      <author>${post.author.name}</author>\n`;
        xml += `      <pubDate>${(post.publishedAt || post.createdAt).toUTCString()}</pubDate>\n`;
        xml += '    </item>\n';
      }

      xml += '  </channel>\n</rss>';
      reply.header('Content-Type', 'application/xml').send(xml);
    },
  });

  // Stats for admin dashboard
  fastify.get('/admin/stats', {
    schema: { description: 'Get dashboard stats', tags: ['Admin'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const [
        totalPosts, publishedPosts, draftPosts,
        totalComments, pendingComments,
        totalUsers, totalMedia, totalViews,
      ] = await Promise.all([
        prisma.post.count(),
        prisma.post.count({ where: { status: 'PUBLISHED' } }),
        prisma.post.count({ where: { status: 'DRAFT' } }),
        prisma.comment.count(),
        prisma.comment.count({ where: { status: 'PENDING' } }),
        prisma.user.count(),
        prisma.media.count(),
        prisma.post.aggregate({ _sum: { viewCount: true } }),
      ]);

      reply.send({
        posts: { total: totalPosts, published: publishedPosts, drafts: draftPosts },
        comments: { total: totalComments, pending: pendingComments },
        users: totalUsers,
        media: totalMedia,
        totalViews: totalViews._sum.viewCount || 0,
      });
    },
  });
}
