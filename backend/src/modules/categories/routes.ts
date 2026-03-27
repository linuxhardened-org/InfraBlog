import { FastifyInstance } from 'fastify';
import prisma from '../../config/database.js';
import { getCache, setCache, deleteCache } from '../../config/redis.js';
import { generateSlug, paginationMeta } from '../../utils/helpers.js';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export default async function categoryRoutes(fastify: FastifyInstance) {
  // Public: List categories
  fastify.get('/categories', {
    schema: { description: 'List all categories', tags: ['Categories'] },
    handler: async (request, reply) => {
      const cacheKey = 'categories:all';
      const cached = await getCache<any>(cacheKey);
      if (cached) return reply.send(cached);

      const categories = await prisma.category.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: { name: 'asc' },
      });
      const result = categories.map((c) => ({ ...c, postCount: c._count.posts, _count: undefined }));
      await setCache(cacheKey, result, 300);
      reply.send(result);
    },
  });

  // Public: Get category by slug
  fastify.get('/categories/:slug', {
    schema: { description: 'Get category by slug', tags: ['Categories'] },
    handler: async (request, reply) => {
      const { slug } = request.params as { slug: string };
      const category = await prisma.category.findUnique({
        where: { slug },
        include: { _count: { select: { posts: true } } },
      });
      if (!category) return reply.status(404).send({ error: 'Not Found' });
      reply.send({ ...category, postCount: category._count.posts, _count: undefined });
    },
  });

  // Admin: Create category
  fastify.post('/admin/categories', {
    schema: { description: 'Create a category', tags: ['Admin Categories'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN', 'EDITOR')],
    handler: async (request, reply) => {
      try {
        const data = categorySchema.parse(request.body);
        const slug = generateSlug(data.name);
        const category = await prisma.category.create({ data: { ...data, slug } });
        await deleteCache('categories:*');
        reply.status(201).send(category);
      } catch (error: any) {
        reply.status(400).send({ error: 'Bad Request', message: error.message });
      }
    },
  });

  // Admin: Update category
  fastify.put('/admin/categories/:id', {
    schema: { description: 'Update a category', tags: ['Admin Categories'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN', 'EDITOR')],
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const data = categorySchema.partial().parse(request.body);
        const updateData: any = { ...data };
        if (data.name) updateData.slug = generateSlug(data.name);
        const category = await prisma.category.update({ where: { id }, data: updateData });
        await deleteCache('categories:*');
        reply.send(category);
      } catch (error: any) {
        reply.status(400).send({ error: 'Bad Request', message: error.message });
      }
    },
  });

  // Admin: Delete category
  fastify.delete('/admin/categories/:id', {
    schema: { description: 'Delete a category', tags: ['Admin Categories'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      await prisma.category.delete({ where: { id } });
      await deleteCache('categories:*');
      reply.send({ message: 'Category deleted' });
    },
  });
}
