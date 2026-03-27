import { FastifyInstance } from 'fastify';
import prisma from '../../config/database.js';
import { getCache, setCache, deleteCache } from '../../config/redis.js';
import { generateSlug } from '../../utils/helpers.js';
import { z } from 'zod';

const tagSchema = z.object({
  name: z.string().min(1),
});

export default async function tagRoutes(fastify: FastifyInstance) {
  // Public: List tags
  fastify.get('/tags', {
    schema: { description: 'List all tags', tags: ['Tags'] },
    handler: async (request, reply) => {
      const cacheKey = 'tags:all';
      const cached = await getCache<any>(cacheKey);
      if (cached) return reply.send(cached);

      const tags = await prisma.tag.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: { name: 'asc' },
      });
      const result = tags.map((t) => ({ ...t, postCount: t._count.posts, _count: undefined }));
      await setCache(cacheKey, result, 300);
      reply.send(result);
    },
  });

  // Public: Get by slug
  fastify.get('/tags/:slug', {
    schema: { description: 'Get tag by slug', tags: ['Tags'] },
    handler: async (request, reply) => {
      const { slug } = request.params as { slug: string };
      const tag = await prisma.tag.findUnique({ where: { slug }, include: { _count: { select: { posts: true } } } });
      if (!tag) return reply.status(404).send({ error: 'Not Found' });
      reply.send({ ...tag, postCount: tag._count.posts, _count: undefined });
    },
  });

  // Admin: Create
  fastify.post('/admin/tags', {
    schema: { description: 'Create a tag', tags: ['Admin Tags'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN', 'EDITOR')],
    handler: async (request, reply) => {
      try {
        const data = tagSchema.parse(request.body);
        const slug = generateSlug(data.name);
        const tag = await prisma.tag.create({ data: { ...data, slug } });
        await deleteCache('tags:*');
        reply.status(201).send(tag);
      } catch (error: any) {
        reply.status(400).send({ error: 'Bad Request', message: error.message });
      }
    },
  });

  // Admin: Update
  fastify.put('/admin/tags/:id', {
    schema: { description: 'Update a tag', tags: ['Admin Tags'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN', 'EDITOR')],
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const data = tagSchema.parse(request.body);
        const tag = await prisma.tag.update({ where: { id }, data: { ...data, slug: generateSlug(data.name) } });
        await deleteCache('tags:*');
        reply.send(tag);
      } catch (error: any) {
        reply.status(400).send({ error: 'Bad Request', message: error.message });
      }
    },
  });

  // Admin: Delete
  fastify.delete('/admin/tags/:id', {
    schema: { description: 'Delete a tag', tags: ['Admin Tags'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      await prisma.tag.delete({ where: { id } });
      await deleteCache('tags:*');
      reply.send({ message: 'Tag deleted' });
    },
  });
}
