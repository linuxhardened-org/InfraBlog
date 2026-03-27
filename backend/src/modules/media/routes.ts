import { FastifyInstance } from 'fastify';
import prisma from '../../config/database.js';
import { config } from '../../config/index.js';
import path from 'path';
import fs from 'fs/promises';
import { paginationMeta } from '../../utils/helpers.js';
import { z } from 'zod';

const mediaQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export default async function mediaRoutes(fastify: FastifyInstance) {
  // Ensure upload directory exists
  await fs.mkdir(config.upload.dir, { recursive: true });

  // Upload media
  fastify.post('/admin/media', {
    schema: { description: 'Upload a media file', tags: ['Admin Media'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const file = await request.file();
        if (!file) return reply.status(400).send({ error: 'No file uploaded' });

        if (!config.upload.allowedMimeTypes.includes(file.mimetype)) {
          return reply.status(400).send({ error: 'File type not allowed' });
        }

        const ext = path.extname(file.filename);
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
        const filepath = path.join(config.upload.dir, filename);
        
        const buffer = await file.toBuffer();
        if (buffer.length > config.upload.maxFileSize) {
          return reply.status(400).send({ error: 'File too large (max 10MB)' });
        }

        // Try to optimize image with sharp
        let finalBuffer = buffer;
        let width: number | undefined;
        let height: number | undefined;
        
        try {
          const sharp = (await import('sharp')).default;
          if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
            const metadata = await sharp(buffer).metadata();
            width = metadata.width;
            height = metadata.height;
            
            // Resize if too large
            if (width && width > 2000) {
              finalBuffer = await sharp(buffer).resize(2000, undefined, { withoutEnlargement: true }).toBuffer();
              const newMeta = await sharp(finalBuffer).metadata();
              width = newMeta.width;
              height = newMeta.height;
            }
          }
        } catch {
          // sharp not available, use original buffer
        }

        await fs.writeFile(filepath, finalBuffer);

        const media = await prisma.media.create({
          data: {
            filename,
            originalName: file.filename,
            url: `/uploads/${filename}`,
            mimeType: file.mimetype,
            size: finalBuffer.length,
            width,
            height,
            uploadedById: request.user.id,
          },
        });

        reply.status(201).send(media);
      } catch (error: any) {
        reply.status(500).send({ error: 'Upload failed', message: error.message });
      }
    },
  });

  // List media
  fastify.get('/admin/media', {
    schema: { description: 'List media files', tags: ['Admin Media'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const query = mediaQuerySchema.parse(request.query);
      const [media, total] = await Promise.all([
        prisma.media.findMany({
          include: { uploadedBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        prisma.media.count(),
      ]);
      reply.send({ data: media, pagination: paginationMeta(total, query.page, query.limit) });
    },
  });

  // Delete media
  fastify.delete('/admin/media/:id', {
    schema: { description: 'Delete a media file', tags: ['Admin Media'], security: [{ bearerAuth: [] }] },
    preHandler: [fastify.authorizeRoles('ADMIN', 'EDITOR')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const media = await prisma.media.findUnique({ where: { id } });
      if (!media) return reply.status(404).send({ error: 'Not Found' });

      try {
        await fs.unlink(path.join(config.upload.dir, media.filename));
      } catch { /* file might not exist */ }

      await prisma.media.delete({ where: { id } });
      reply.send({ message: 'Media deleted' });
    },
  });
}
