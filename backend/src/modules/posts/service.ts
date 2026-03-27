import prisma from '../../config/database.js';
import { getCache, setCache, deleteCache } from '../../config/redis.js';
import { generateSlug, calculateReadingTime, paginationMeta } from '../../utils/helpers.js';
import { CreatePostInput, UpdatePostInput, PostQuery } from './schema.js';
import { Prisma } from '@prisma/client';

const POST_INCLUDE = {
  author: { select: { id: true, name: true, avatar: true } },
  category: { select: { id: true, name: true, slug: true } },
  tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
  _count: { select: { comments: true } },
};

export class PostService {
  async list(query: PostQuery) {
    const { page, limit, status, categoryId, tagId, search, authorId } = query;
    const cacheKey = `posts:list:${JSON.stringify(query)}`;
    
    const cached = await getCache<any>(cacheKey);
    if (cached) return cached;

    const where: Prisma.PostWhereInput = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (tagId) where.tags = { some: { tagId } };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: POST_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    const result = {
      data: posts.map(this.formatPost),
      pagination: paginationMeta(total, page, limit),
    };

    await setCache(cacheKey, result, 60);
    return result;
  }

  async getBySlug(slug: string) {
    const cacheKey = `posts:slug:${slug}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) return cached;

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        ...POST_INCLUDE,
        comments: {
          where: { status: 'APPROVED', parentId: null },
          include: {
            replies: {
              where: { status: 'APPROVED' },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) throw new Error('Post not found');

    // Increment view count
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    const result = this.formatPost(post);
    await setCache(cacheKey, result, 120);
    return result;
  }

  async getById(id: string) {
    const post = await prisma.post.findUnique({
      where: { id },
      include: POST_INCLUDE,
    });
    if (!post) throw new Error('Post not found');
    return this.formatPost(post);
  }

  async create(data: CreatePostInput, authorId: string) {
    let slug = generateSlug(data.title);
    
    // Ensure unique slug
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const readingTime = calculateReadingTime(data.content);

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        status: data.status,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : undefined,
        readingTime,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        ogImage: data.ogImage,
        authorId,
        categoryId: data.categoryId || undefined,
        tags: data.tagIds ? {
          create: data.tagIds.map((tagId) => ({ tagId })),
        } : undefined,
      },
      include: POST_INCLUDE,
    });

    await deleteCache('posts:*');
    return this.formatPost(post);
  }

  async update(id: string, data: UpdatePostInput, userId: string, userRole: string) {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new Error('Post not found');
    if (userRole === 'AUTHOR' && post.authorId !== userId) {
      throw new Error('Not authorized to edit this post');
    }

    const updateData: any = { ...data };
    if (data.title) {
      updateData.slug = generateSlug(data.title);
      const existing = await prisma.post.findFirst({
        where: { slug: updateData.slug, id: { not: id } },
      });
      if (existing) updateData.slug = `${updateData.slug}-${Date.now()}`;
    }
    if (data.content) {
      updateData.readingTime = calculateReadingTime(data.content);
    }
    if (data.status === 'PUBLISHED' && !post.publishedAt) {
      updateData.publishedAt = new Date();
    }
    if (data.scheduledAt) {
      updateData.scheduledAt = new Date(data.scheduledAt);
    }

    // Handle tags
    if (data.tagIds) {
      await prisma.postTag.deleteMany({ where: { postId: id } });
      updateData.tags = { create: data.tagIds.map((tagId) => ({ tagId })) };
      delete updateData.tagIds;
    }

    delete updateData.tagIds;

    const updated = await prisma.post.update({
      where: { id },
      data: updateData,
      include: POST_INCLUDE,
    });

    await deleteCache('posts:*');
    return this.formatPost(updated);
  }

  async delete(id: string, userId: string, userRole: string) {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new Error('Post not found');
    if (userRole === 'AUTHOR' && post.authorId !== userId) {
      throw new Error('Not authorized to delete this post');
    }

    await prisma.post.delete({ where: { id } });
    await deleteCache('posts:*');
    return { message: 'Post deleted successfully' };
  }

  private formatPost(post: any) {
    return {
      ...post,
      tags: post.tags?.map((pt: any) => pt.tag) || [],
      commentCount: post._count?.comments || 0,
      _count: undefined,
    };
  }
}
