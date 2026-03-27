import { FastifyInstance } from 'fastify';
import prisma from '../../config/database.js';
import { paginationMeta } from '../../utils/helpers.js';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  authorName: z.string().min(1),
  authorEmail: z.string().email(),
  postId: z.string(),
  parentId: z.string().optional(),
});

const commentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  status: z.enum(['PENDING', 'APPROVED', 'SPAM']).optional(),
  postId: z.string().optional(),
});

export default async function commentRoutes(fastify: FastifyInstance) {
  // Public: Create comment
  fastify.post('/comments', {
    schema: { description: 'Submit a comment', tags: ['Comments'] },
    handler: async (request, reply) => {
      try {
        const data = commentSchema.parse(request.body);
        const post = await prisma.post.findUnique({ where: { id: data.postId } });
        if (!post) return reply.status(404).send({ error: 'Post not found' });

        const comment = await prisma.comment.create({ data });
        reply.status(201).send({ ...comment, message: 'Comment submitted for moderation' });
      } catch (error: any) {
        reply.status(400).send({ error: 'Bad Request', message: error.message });
      }
    },
  });

  // Public: Get comments for a post
  fastify.get('/posts/:postId/comments', {
    schema: { description: 'Get approved comments for a post', tags: ['Comments'] },
    handler: async (request, reply) => {
      const { postId } = request.params as { postId: string };
      const comments = await prisma.comment.findMany({
        where: { postId, status: 'APPROVED', parentId: null },
        include: {
          replies: {
            where: { status: 'APPROVED' },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      reply.send(comments);
    },
  });

  // Admin: List all comments
  fastify.get('/admin/comments', {
    schema: { description: 'List all comments (admin)', tags: ['Admin Comments'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN', 'EDITOR')],
    handler: async (request, reply) => {
      const query = commentQuerySchema.parse(request.query);
      const where: any = {};
      if (query.status) where.status = query.status;
      if (query.postId) where.postId = query.postId;

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where,
          include: { post: { select: { id: true, title: true, slug: true } } },
          orderBy: { createdAt: 'desc' },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        prisma.comment.count({ where }),
      ]);

      reply.send({ data: comments, pagination: paginationMeta(total, query.page, query.limit) });
    },
  });

  // Admin: Update comment status
  fastify.put('/admin/comments/:id', {
    schema: { description: 'Update comment status', tags: ['Admin Comments'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN', 'EDITOR')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: string };
      if (!['PENDING', 'APPROVED', 'SPAM'].includes(status)) {
        return reply.status(400).send({ error: 'Invalid status' });
      }
      const comment = await prisma.comment.update({ where: { id }, data: { status: status as any } });
      reply.send(comment);
    },
  });

  // Admin: Delete comment
  fastify.delete('/admin/comments/:id', {
    schema: { description: 'Delete a comment', tags: ['Admin Comments'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN', 'EDITOR')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      await prisma.comment.delete({ where: { id } });
      reply.send({ message: 'Comment deleted' });
    },
  });
}
