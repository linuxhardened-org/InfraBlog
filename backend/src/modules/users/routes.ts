import { FastifyInstance } from 'fastify';
import prisma from '../../config/database.js';
import * as argon2 from 'argon2';
import { paginationMeta } from '../../utils/helpers.js';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'EDITOR', 'AUTHOR']).optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  password: z.string().min(8).optional(),
});

const userQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  role: z.enum(['ADMIN', 'EDITOR', 'AUTHOR']).optional(),
  search: z.string().optional(),
});

export default async function userRoutes(fastify: FastifyInstance) {
  // Admin: List users
  fastify.get('/admin/users', {
    schema: { description: 'List users', tags: ['Admin Users'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN')],
    handler: async (request, reply) => {
      const query = userQuerySchema.parse(request.query);
      const where: any = {};
      if (query.role) where.role = query.role;
      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: { id: true, email: true, name: true, role: true, avatar: true, bio: true, createdAt: true, _count: { select: { posts: true } } },
          orderBy: { createdAt: 'desc' },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        prisma.user.count({ where }),
      ]);

      reply.send({
        data: users.map((u) => ({ ...u, postCount: u._count.posts, _count: undefined })),
        pagination: paginationMeta(total, query.page, query.limit),
      });
    },
  });

  // Admin: Get user
  fastify.get('/admin/users/:id', {
    schema: { description: 'Get user by ID', tags: ['Admin Users'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, name: true, role: true, avatar: true, bio: true, createdAt: true },
      });
      if (!user) return reply.status(404).send({ error: 'Not Found' });
      reply.send(user);
    },
  });

  // Admin: Update user
  fastify.put('/admin/users/:id', {
    schema: { description: 'Update a user', tags: ['Admin Users'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN')],
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const data = updateUserSchema.parse(request.body);
        const updateData: any = { ...data };
        if (data.password) {
          updateData.password = await argon2.hash(data.password);
        }
        const user = await prisma.user.update({
          where: { id },
          data: updateData,
          select: { id: true, email: true, name: true, role: true, avatar: true, bio: true },
        });
        reply.send(user);
      } catch (error: any) {
        reply.status(400).send({ error: 'Bad Request', message: error.message });
      }
    },
  });

  // Admin: Delete user
  fastify.delete('/admin/users/:id', {
    schema: { description: 'Delete a user', tags: ['Admin Users'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      if (id === request.user.id) {
        return reply.status(400).send({ error: 'Cannot delete yourself' });
      }
      await prisma.user.delete({ where: { id } });
      reply.send({ message: 'User deleted' });
    },
  });

  // Update own profile
  fastify.put('/auth/profile', {
    schema: { description: 'Update own profile', tags: ['Auth'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const data = updateUserSchema.omit({ role: true }).parse(request.body);
        const updateData: any = { ...data };
        if (data.password) updateData.password = await argon2.hash(data.password);
        const user = await prisma.user.update({
          where: { id: request.user.id },
          data: updateData,
          select: { id: true, email: true, name: true, role: true, avatar: true, bio: true },
        });
        reply.send(user);
      } catch (error: any) {
        reply.status(400).send({ error: 'Bad Request', message: error.message });
      }
    },
  });
}
