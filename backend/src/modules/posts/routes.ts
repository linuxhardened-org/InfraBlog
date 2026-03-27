import { FastifyInstance } from 'fastify';
import { PostService } from './service.js';
import { createPostSchema, updatePostSchema, postQuerySchema } from './schema.js';

const postService = new PostService();

export default async function postRoutes(fastify: FastifyInstance) {
  // Public: List posts
  fastify.get('/posts', {
    schema: { description: 'List published posts', tags: ['Posts'] },
    handler: async (request, reply) => {
      try {
        const query = postQuerySchema.parse(request.query);
        if (!query.status) query.status = 'PUBLISHED';
        const result = await postService.list(query);
        reply.send(result);
      } catch (error: any) {
        reply.status(400).send({ error: 'Bad Request', message: error.message });
      }
    },
  });

  // Public: Get post by slug
  fastify.get('/posts/:slug', {
    schema: { description: 'Get post by slug', tags: ['Posts'] },
    handler: async (request, reply) => {
      try {
        const { slug } = request.params as { slug: string };
        const post = await postService.getBySlug(slug);
        reply.send(post);
      } catch (error: any) {
        reply.status(404).send({ error: 'Not Found', message: error.message });
      }
    },
  });

  // Admin: List all posts (including drafts)
  fastify.get('/admin/posts', {
    schema: { description: 'List all posts (admin)', tags: ['Admin Posts'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const query = postQuerySchema.parse(request.query);
        // Authors can only see their own posts
        if (request.user.role === 'AUTHOR') {
          query.authorId = request.user.id;
        }
        const result = await postService.list(query);
        reply.send(result);
      } catch (error: any) {
        reply.status(400).send({ error: 'Bad Request', message: error.message });
      }
    },
  });

  // Admin: Get post by ID
  fastify.get('/admin/posts/:id', {
    schema: { description: 'Get post by ID (admin)', tags: ['Admin Posts'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const post = await postService.getById(id);
        reply.send(post);
      } catch (error: any) {
        reply.status(404).send({ error: 'Not Found', message: error.message });
      }
    },
  });

  // Create post
  fastify.post('/admin/posts', {
    schema: { description: 'Create a new post', tags: ['Admin Posts'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const data = createPostSchema.parse(request.body);
        const post = await postService.create(data, request.user.id);
        reply.status(201).send(post);
      } catch (error: any) {
        reply.status(400).send({ error: 'Bad Request', message: error.message });
      }
    },
  });

  // Update post
  fastify.put('/admin/posts/:id', {
    schema: { description: 'Update a post', tags: ['Admin Posts'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const data = updatePostSchema.parse(request.body);
        const post = await postService.update(id, data, request.user.id, request.user.role);
        reply.send(post);
      } catch (error: any) {
        if (error.message.includes('Not authorized')) {
          return reply.status(403).send({ error: 'Forbidden', message: error.message });
        }
        reply.status(400).send({ error: 'Bad Request', message: error.message });
      }
    },
  });

  // Delete post
  fastify.delete('/admin/posts/:id', {
    schema: { description: 'Delete a post', tags: ['Admin Posts'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await postService.delete(id, request.user.id, request.user.role);
        reply.send(result);
      } catch (error: any) {
        if (error.message.includes('Not authorized')) {
          return reply.status(403).send({ error: 'Forbidden', message: error.message });
        }
        reply.status(400).send({ error: 'Bad Request', message: error.message });
      }
    },
  });
}
