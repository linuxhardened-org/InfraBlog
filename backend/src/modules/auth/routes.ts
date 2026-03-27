import { FastifyInstance } from 'fastify';
import { AuthService } from './service.js';
import { registerSchema, loginSchema } from './schema.js';

const authService = new AuthService();

export default async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/auth/register', {
    schema: {
      description: 'Register a new user',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email', 'name', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string', minLength: 2 },
          password: { type: 'string', minLength: 8 },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const data = registerSchema.parse(request.body);
        const user = await authService.register(data);
        const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });
        reply.status(201).send({ user, token });
      } catch (error: any) {
        if (error.message === 'Email already registered') {
          return reply.status(409).send({ error: 'Conflict', message: error.message });
        }
        return reply.status(400).send({ error: 'Bad Request', message: error.message });
      }
    },
  });

  // Login
  fastify.post('/auth/login', {
    schema: {
      description: 'Login with email and password',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const data = loginSchema.parse(request.body);
        const user = await authService.login(data);
        const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });
        reply.send({ user, token });
      } catch (error: any) {
        return reply.status(401).send({ error: 'Unauthorized', message: error.message });
      }
    },
  });

  // Get Profile
  fastify.get('/auth/me', {
    schema: {
      description: 'Get current user profile',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const user = await authService.getProfile(request.user.id);
        reply.send(user);
      } catch (error: any) {
        return reply.status(404).send({ error: 'Not Found', message: error.message });
      }
    },
  });
}
