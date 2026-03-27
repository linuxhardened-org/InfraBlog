import { FastifyInstance } from 'fastify';
import prisma from '../../config/database.js';
import { generateSlug, paginationMeta } from '../../utils/helpers.js';
import { z } from 'zod';

const pageSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  sortOrder: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export default async function pageRoutes(fastify: FastifyInstance) {
  // Public: List published pages
  fastify.get('/pages', {
    schema: { description: 'List published pages', tags: ['Pages'] },
    handler: async (request, reply) => {
      const pages = await prisma.page.findMany({
        where: { status: 'PUBLISHED' },
        select: { id: true, title: true, slug: true, sortOrder: true },
        orderBy: { sortOrder: 'asc' },
      });
      reply.send(pages);
    },
  });

  // Public: Get page by slug
  fastify.get('/pages/:slug', {
    schema: { description: 'Get page by slug', tags: ['Pages'] },
    handler: async (request, reply) => {
      const { slug } = request.params as { slug: string };
      const page = await prisma.page.findUnique({ where: { slug } });
      if (!page || page.status !== 'PUBLISHED') {
        return reply.status(404).send({ error: 'Not Found' });
      }
      reply.send(page);
    },
  });

  // Admin: List all pages
  fastify.get('/admin/pages', {
    schema: { description: 'List all pages (admin)', tags: ['Admin Pages'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN', 'EDITOR')],
    handler: async (request, reply) => {
      const pages = await prisma.page.findMany({
        include: { author: { select: { id: true, name: true } } },
        orderBy: { sortOrder: 'asc' },
      });
      reply.send(pages);
    },
  });

  // Admin: Create page
  fastify.post('/admin/pages', {
    schema: { description: 'Create a page', tags: ['Admin Pages'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN', 'EDITOR')],
    handler: async (request, reply) => {
      try {
        const data = pageSchema.parse(request.body);
        const slug = generateSlug(data.title);
        const page = await prisma.page.create({
          data: { ...data, slug, authorId: request.user.id },
        });
        reply.status(201).send(page);
      } catch (error: any) {
        reply.status(400).send({ error: 'Bad Request', message: error.message });
      }
    },
  });

  // Admin: Update page
  fastify.put('/admin/pages/:id', {
    schema: { description: 'Update a page', tags: ['Admin Pages'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN', 'EDITOR')],
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const data = pageSchema.partial().parse(request.body);
        const updateData: any = { ...data };
        if (data.title) updateData.slug = generateSlug(data.title);
        const page = await prisma.page.update({ where: { id }, data: updateData });
        reply.send(page);
      } catch (error: any) {
        reply.status(400).send({ error: 'Bad Request', message: error.message });
      }
    },
  });

  // Admin: Delete page
  fastify.delete('/admin/pages/:id', {
    schema: { description: 'Delete a page', tags: ['Admin Pages'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      await prisma.page.delete({ where: { id } });
      reply.send({ message: 'Page deleted' });
    },
  });
}
