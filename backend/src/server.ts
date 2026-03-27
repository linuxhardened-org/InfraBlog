import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/index.js';
import authPlugin from './plugins/auth.js';
import authRoutes from './modules/auth/routes.js';
import postRoutes from './modules/posts/routes.js';
import categoryRoutes from './modules/categories/routes.js';
import tagRoutes from './modules/tags/routes.js';
import commentRoutes from './modules/comments/routes.js';
import userRoutes from './modules/users/routes.js';
import mediaRoutes from './modules/media/routes.js';
import pageRoutes from './modules/pages/routes.js';
import seoRoutes from './modules/seo/routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug',
    },
    trustProxy: true,
  });

  // Security
  await fastify.register(helmet, { contentSecurityPolicy: false });
  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Allow local development and Vercel deployments
      if (!origin || /localhost/.test(origin) || /vercel\.app/.test(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Multipart for file uploads
  await fastify.register(multipart, {
    limits: { fileSize: config.upload.maxFileSize },
  });

  // Serve uploaded files
  const uploadsDir = path.resolve(config.upload.dir);
  await fastify.register(fastifyStatic, {
    root: uploadsDir,
    prefix: '/uploads/',
    decorateReply: false,
  });

  // Swagger API docs
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'InfraBlog API',
        description: 'Production-ready blogging platform API',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${config.port}`, description: 'Development' }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Auth plugin
  await fastify.register(authPlugin);

  // API Routes (all under /api prefix)
  await fastify.register(async function apiRoutes(api) {
    // Health check
    api.get('/health', {
      schema: { description: 'Health check', tags: ['System'] },
      handler: async () => ({ status: 'ok', timestamp: new Date().toISOString() }),
    });

    await api.register(authRoutes);
    await api.register(postRoutes);
    await api.register(categoryRoutes);
    await api.register(tagRoutes);
    await api.register(commentRoutes);
    await api.register(userRoutes);
    await api.register(mediaRoutes);
    await api.register(pageRoutes);
    await api.register(seoRoutes);
  }, { prefix: '/api' });

  return fastify;
}

// Start server if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = await buildApp();
  try {
    await app.listen({ port: config.port, host: config.host });
    console.log(`🚀 InfraBlog API running at http://localhost:${config.port}`);
    console.log(`📚 Swagger docs at http://localhost:${config.port}/api/docs`);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}
