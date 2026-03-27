import { PrismaClient, Role, PostStatus, CommentStatus, PageStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const adminPassword = await argon2.hash('admin123456');
  const editorPassword = await argon2.hash('editor123456');
  const authorPassword = await argon2.hash('author123456');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@infrablog.com' },
    update: {},
    create: {
      email: 'admin@infrablog.com',
      name: 'Admin User',
      password: adminPassword,
      role: Role.ADMIN,
      bio: 'Platform administrator and lead developer.',
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@infrablog.com' },
    update: {},
    create: {
      email: 'editor@infrablog.com',
      name: 'Jane Editor',
      password: editorPassword,
      role: Role.EDITOR,
      bio: 'Senior editor with a passion for clean content.',
    },
  });

  const author = await prisma.user.upsert({
    where: { email: 'author@infrablog.com' },
    update: {},
    create: {
      email: 'author@infrablog.com',
      name: 'John Author',
      password: authorPassword,
      role: Role.AUTHOR,
      bio: 'Full-stack developer and tech writer.',
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'devops' },
      update: {},
      create: { name: 'DevOps', slug: 'devops', description: 'CI/CD, Docker, Kubernetes, and cloud infrastructure.' },
    }),
    prisma.category.upsert({
      where: { slug: 'web-development' },
      update: {},
      create: { name: 'Web Development', slug: 'web-development', description: 'Frontend and backend web technologies.' },
    }),
    prisma.category.upsert({
      where: { slug: 'cloud-computing' },
      update: {},
      create: { name: 'Cloud Computing', slug: 'cloud-computing', description: 'AWS, GCP, Azure and cloud-native patterns.' },
    }),
    prisma.category.upsert({
      where: { slug: 'tutorials' },
      update: {},
      create: { name: 'Tutorials', slug: 'tutorials', description: 'Step-by-step guides and how-tos.' },
    }),
    prisma.category.upsert({
      where: { slug: 'architecture' },
      update: {},
      create: { name: 'Architecture', slug: 'architecture', description: 'System design and software architecture patterns.' },
    }),
  ]);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { slug: 'docker' }, update: {}, create: { name: 'Docker', slug: 'docker' } }),
    prisma.tag.upsert({ where: { slug: 'kubernetes' }, update: {}, create: { name: 'Kubernetes', slug: 'kubernetes' } }),
    prisma.tag.upsert({ where: { slug: 'typescript' }, update: {}, create: { name: 'TypeScript', slug: 'typescript' } }),
    prisma.tag.upsert({ where: { slug: 'react' }, update: {}, create: { name: 'React', slug: 'react' } }),
    prisma.tag.upsert({ where: { slug: 'nextjs' }, update: {}, create: { name: 'Next.js', slug: 'nextjs' } }),
    prisma.tag.upsert({ where: { slug: 'postgresql' }, update: {}, create: { name: 'PostgreSQL', slug: 'postgresql' } }),
    prisma.tag.upsert({ where: { slug: 'redis' }, update: {}, create: { name: 'Redis', slug: 'redis' } }),
    prisma.tag.upsert({ where: { slug: 'nginx' }, update: {}, create: { name: 'Nginx', slug: 'nginx' } }),
    prisma.tag.upsert({ where: { slug: 'performance' }, update: {}, create: { name: 'Performance', slug: 'performance' } }),
    prisma.tag.upsert({ where: { slug: 'security' }, update: {}, create: { name: 'Security', slug: 'security' } }),
  ]);

  // Create posts
  const posts = [
    {
      title: 'Getting Started with Docker: A Comprehensive Guide',
      slug: 'getting-started-with-docker',
      content: `# Getting Started with Docker

Docker has revolutionized the way we build, ship, and run applications. In this comprehensive guide, we'll walk through everything you need to know to get started with containerization.

## What is Docker?

Docker is a platform for developing, shipping, and running applications inside lightweight, portable containers. Containers package an application with all its dependencies, ensuring consistency across different environments.

## Installing Docker

\`\`\`bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify installation
docker --version
docker compose version
\`\`\`

## Your First Container

Let's start with a simple example:

\`\`\`bash
# Run a simple container
docker run hello-world

# Run an interactive container
docker run -it ubuntu bash
\`\`\`

## Building Custom Images

Create a \`Dockerfile\`:

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

Build and run:

\`\`\`bash
docker build -t my-app .
docker run -p 3000:3000 my-app
\`\`\`

## Docker Compose

For multi-container applications, Docker Compose is invaluable:

\`\`\`yaml
version: '3.9'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
\`\`\`

## Best Practices

1. **Use multi-stage builds** to reduce image size
2. **Don't run as root** — use the USER directive
3. **Use .dockerignore** to exclude unnecessary files
4. **Pin versions** for reproducible builds
5. **Use health checks** for production containers

## Conclusion

Docker simplifies deployment and ensures consistency across environments. Start small, containerize one service at a time, and gradually adopt Docker Compose for multi-service applications.`,
      excerpt: 'Learn Docker from scratch — containers, images, Dockerfiles, and Compose for modern application development.',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date('2025-12-15'),
      readingTime: 8,
      categoryId: categories[0].id,
      authorId: admin.id,
      seoTitle: 'Getting Started with Docker - Complete Beginner Guide 2025',
      seoDescription: 'Learn Docker from scratch with this comprehensive guide. Covers containers, Dockerfiles, Docker Compose, and best practices.',
      tagIds: [tags[0].id, tags[1].id],
    },
    {
      title: 'Building Scalable APIs with Fastify and TypeScript',
      slug: 'building-scalable-apis-fastify-typescript',
      content: `# Building Scalable APIs with Fastify and TypeScript

Fastify is one of the fastest web frameworks for Node.js and combined with TypeScript, it creates a powerful foundation for building production-grade APIs.

## Why Fastify?

- **Speed**: Fastify is designed for performance, handling up to 76,000 requests/sec
- **Schema-based**: Built-in JSON Schema validation and serialization
- **Plugin system**: Elegant, encapsulated plugin architecture
- **TypeScript support**: First-class TypeScript support out of the box

## Project Setup

\`\`\`bash
mkdir my-api && cd my-api
npm init -y
npm install fastify @fastify/cors @fastify/jwt
npm install -D typescript @types/node tsx
\`\`\`

## Basic Server

\`\`\`typescript
import Fastify from 'fastify';

const app = Fastify({ logger: true });

app.get('/health', async () => {
  return { status: 'ok' };
});

app.listen({ port: 3001, host: '0.0.0.0' });
\`\`\`

## Route Organization

Use the plugin pattern to organize routes:

\`\`\`typescript
// routes/users.ts
export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/users', async (request, reply) => {
    const users = await prisma.user.findMany();
    return users;
  });
}
\`\`\`

## Authentication with JWT

\`\`\`typescript
import fjwt from '@fastify/jwt';

fastify.register(fjwt, { secret: process.env.JWT_SECRET });

fastify.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});
\`\`\`

## Conclusion

Fastify provides the perfect balance of speed, developer experience, and extensibility for building modern APIs.`,
      excerpt: 'Build high-performance REST APIs with Fastify and TypeScript. Complete guide with authentication, validation, and best practices.',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date('2025-12-20'),
      readingTime: 10,
      categoryId: categories[1].id,
      authorId: editor.id,
      seoTitle: 'Building Scalable APIs with Fastify and TypeScript',
      seoDescription: 'Learn to build high-performance REST APIs with Fastify and TypeScript. Covers JWT auth, validation, plugins, and deployment.',
      tagIds: [tags[2].id],
    },
    {
      title: 'PostgreSQL Performance Tuning: Essential Tips',
      slug: 'postgresql-performance-tuning',
      content: `# PostgreSQL Performance Tuning

PostgreSQL is a powerful database, but getting optimal performance requires understanding its internals and configuration.

## Connection Pooling

Use PgBouncer or built-in pooling:

\`\`\`sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Set optimal pool size
-- Rule of thumb: (core_count * 2) + effective_spindle_count
\`\`\`

## Index Optimization

\`\`\`sql
-- Create targeted indexes
CREATE INDEX CONCURRENTLY idx_posts_status_published 
ON posts (published_at DESC) 
WHERE status = 'PUBLISHED';

-- Analyze query plans
EXPLAIN ANALYZE SELECT * FROM posts WHERE status = 'PUBLISHED';
\`\`\`

## Query Optimization

\`\`\`sql
-- Use CTEs for complex queries
WITH recent_posts AS (
  SELECT * FROM posts 
  WHERE published_at > NOW() - INTERVAL '30 days'
)
SELECT p.*, c.name as category_name
FROM recent_posts p
JOIN categories c ON p.category_id = c.id;
\`\`\`

## Configuration Tuning

Key postgresql.conf settings:

\`\`\`ini
shared_buffers = 256MB        # 25% of RAM
effective_cache_size = 768MB  # 75% of RAM
work_mem = 16MB
maintenance_work_mem = 128MB
random_page_cost = 1.1        # For SSDs
\`\`\`

## Monitoring

\`\`\`sql
-- Slow queries
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
\`\`\`

Tuning PostgreSQL is an iterative process. Monitor, measure, and optimize based on your specific workload.`,
      excerpt: 'Optimize PostgreSQL performance with indexing strategies, query tuning, configuration, and monitoring best practices.',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date('2025-12-28'),
      readingTime: 7,
      categoryId: categories[4].id,
      authorId: admin.id,
      seoTitle: 'PostgreSQL Performance Tuning Guide - Essential Tips',
      seoDescription: 'Master PostgreSQL performance tuning. Covers indexing, query optimization, configuration, and monitoring for production databases.',
      tagIds: [tags[5].id, tags[8].id],
    },
    {
      title: 'Next.js 15: Server Components and Beyond',
      slug: 'nextjs-15-server-components',
      content: `# Next.js 15: Server Components and Beyond

Next.js continues to push the boundaries of React development. Let's explore the latest features in Next.js 15.

## App Router

The App Router uses React Server Components by default:

\`\`\`tsx
// app/blog/page.tsx - This is a Server Component
export default async function BlogPage() {
  const posts = await fetch('http://api/posts').then(r => r.json());
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
\`\`\`

## Server Actions

Direct server-side mutations:

\`\`\`tsx
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  await db.post.create({ data: { title } });
  revalidatePath('/blog');
}
\`\`\`

## Streaming and Suspense

\`\`\`tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <>
      <h1>Blog</h1>
      <Suspense fallback={<PostsSkeleton />}>
        <PostList />
      </Suspense>
    </>
  );
}
\`\`\`

## Image Optimization

Next.js Image component handles optimization automatically:

\`\`\`tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={630}
  priority
  placeholder="blur"
/>
\`\`\`

Next.js 15 represents a major leap forward in full-stack React development.`,
      excerpt: 'Explore Next.js 15 features: App Router, Server Components, Server Actions, Streaming, and the future of React development.',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date('2026-01-05'),
      readingTime: 6,
      categoryId: categories[1].id,
      authorId: author.id,
      seoTitle: 'Next.js 15 Server Components Guide - What\'s New',
      seoDescription: 'Deep dive into Next.js 15. Learn Server Components, Server Actions, Streaming, and modern React patterns.',
      tagIds: [tags[3].id, tags[4].id, tags[2].id],
    },
    {
      title: 'Redis Caching Strategies for Web Applications',
      slug: 'redis-caching-strategies',
      content: `# Redis Caching Strategies for Web Applications

Caching is crucial for performance. Redis provides a blazing-fast in-memory data store that can dramatically improve your application's response times.

## Cache-Aside Pattern

The most common caching strategy:

\`\`\`typescript
async function getPost(slug: string) {
  // Check cache first
  const cached = await redis.get(\`post:\${slug}\`);
  if (cached) return JSON.parse(cached);

  // Cache miss - fetch from database
  const post = await prisma.post.findUnique({ where: { slug } });
  
  // Store in cache with TTL
  await redis.set(\`post:\${slug}\`, JSON.stringify(post), 'EX', 300);
  
  return post;
}
\`\`\`

## Cache Invalidation

\`\`\`typescript
async function updatePost(id: string, data: UpdatePostInput) {
  const post = await prisma.post.update({ where: { id }, data });
  
  // Invalidate related caches
  await redis.del(\`post:\${post.slug}\`);
  await redis.del('posts:list:*');
  
  return post;
}
\`\`\`

## Rate Limiting

\`\`\`typescript
async function rateLimit(ip: string, limit = 100, window = 60) {
  const key = \`rate:\${ip}\`;
  const current = await redis.incr(key);
  if (current === 1) await redis.expire(key, window);
  return current <= limit;
}
\`\`\`

## Session Store

\`\`\`typescript
// Store session in Redis
await redis.set(\`session:\${sessionId}\`, JSON.stringify(userData), 'EX', 86400);

// Retrieve session
const session = await redis.get(\`session:\${sessionId}\`);
\`\`\`

## Best Practices

1. Set appropriate TTLs for different data types
2. Use key prefixes for namespacing
3. Monitor memory usage with \`INFO memory\`
4. Use Redis pub/sub for cache invalidation across instances
5. Consider Redis Cluster for horizontal scaling

Redis caching can reduce database load by 80-90% for read-heavy applications.`,
      excerpt: 'Master Redis caching patterns: cache-aside, invalidation, rate limiting, and session management for high-performance apps.',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date('2026-01-15'),
      readingTime: 7,
      categoryId: categories[4].id,
      authorId: editor.id,
      seoTitle: 'Redis Caching Strategies for Web Applications',
      seoDescription: 'Learn effective Redis caching strategies. Covers cache-aside pattern, invalidation, rate limiting, and production best practices.',
      tagIds: [tags[6].id, tags[8].id],
    },
    {
      title: 'Kubernetes for Beginners: Deploy Your First App',
      slug: 'kubernetes-beginners-deploy-first-app',
      content: `# Kubernetes for Beginners

Kubernetes (K8s) automates deploying, scaling, and managing containerized applications. Let's deploy your first app.

## Core Concepts

- **Pod**: Smallest deployable unit, wraps one or more containers
- **Service**: Exposes pods to network traffic
- **Deployment**: Manages pod replicas and updates
- **Namespace**: Logical separation of resources

## Setting Up

\`\`\`bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Start local cluster with minikube
minikube start
\`\`\`

## Deploying an App

\`\`\`yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:latest
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  type: LoadBalancer
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 3000
\`\`\`

\`\`\`bash
kubectl apply -f deployment.yaml
kubectl get pods
kubectl get services
\`\`\`

Kubernetes provides a solid foundation for running production workloads at scale.`,
      excerpt: 'Learn Kubernetes from scratch. Deploy your first containerized application with pods, services, and deployments.',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date('2026-02-01'),
      readingTime: 9,
      categoryId: categories[0].id,
      authorId: admin.id,
      seoTitle: 'Kubernetes for Beginners - Deploy Your First App',
      seoDescription: 'Learn Kubernetes basics. Step-by-step guide to deploy your first containerized application with K8s.',
      tagIds: [tags[0].id, tags[1].id],
    },
    {
      title: 'Securing Node.js Applications: A Complete Checklist',
      slug: 'securing-nodejs-applications',
      content: `# Securing Node.js Applications

Security is not optional. Here's a comprehensive checklist for securing your Node.js applications.

## Authentication

\`\`\`typescript
import argon2 from 'argon2';

// Hash passwords properly
const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
});

// Verify
const valid = await argon2.verify(hash, password);
\`\`\`

## Input Validation

\`\`\`typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

// Validate all input
const validated = userSchema.parse(req.body);
\`\`\`

## Security Headers

\`\`\`typescript
import helmet from '@fastify/helmet';
fastify.register(helmet);
// Sets: X-Content-Type-Options, X-Frame-Options, etc.
\`\`\`

## Rate Limiting

\`\`\`typescript
import rateLimit from '@fastify/rate-limit';
fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});
\`\`\`

## Security Checklist

- [x] Use HTTPS in production
- [x] Hash passwords with argon2
- [x] Validate all inputs with Zod
- [x] Set security headers with Helmet
- [x] Implement rate limiting
- [x] Use parameterized queries (Prisma handles this)
- [x] Keep dependencies updated
- [x] Use environment variables for secrets
- [x] Implement CORS properly
- [x] Log security events

Security is a continuous process. Regularly audit and update your security practices.`,
      excerpt: 'Complete security checklist for Node.js apps: authentication, validation, headers, rate limiting, and best practices.',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date('2026-02-15'),
      readingTime: 6,
      categoryId: categories[1].id,
      authorId: editor.id,
      seoTitle: 'Securing Node.js Applications - Complete Checklist',
      seoDescription: 'Comprehensive security guide for Node.js. Covers auth, input validation, headers, rate limiting, and production best practices.',
      tagIds: [tags[9].id, tags[2].id],
    },
    {
      title: 'Nginx Configuration for Modern Web Applications',
      slug: 'nginx-configuration-modern-web-apps',
      content: `# Nginx Configuration for Modern Web Apps

Nginx is the go-to reverse proxy and web server for modern applications. Here's how to configure it effectively.

## Basic Reverse Proxy

\`\`\`nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
\`\`\`

## SSL/TLS with Let's Encrypt

\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
}
\`\`\`

## Performance Optimization

\`\`\`nginx
# Gzip compression
gzip on;
gzip_vary on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript;

# Static file caching
location ~* \\.(js|css|png|jpg|gif|ico|svg)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
\`\`\`

Nginx is a battle-tested solution that handles millions of concurrent connections with minimal resources.`,
      excerpt: 'Configure Nginx as a reverse proxy with SSL, gzip, caching, and security headers for production web applications.',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date('2026-03-01'),
      readingTime: 5,
      categoryId: categories[0].id,
      authorId: admin.id,
      seoTitle: 'Nginx Configuration for Modern Web Applications',
      seoDescription: 'Learn to configure Nginx as a reverse proxy. Covers SSL, gzip compression, caching, rate limiting, and security.',
      tagIds: [tags[7].id, tags[8].id, tags[9].id],
    },
    {
      title: 'Infrastructure as Code with Terraform',
      slug: 'infrastructure-as-code-terraform',
      content: `# Infrastructure as Code with Terraform

Terraform by HashiCorp lets you define cloud infrastructure using declarative configuration files.

## Why Terraform?

- **Cloud-agnostic**: Works with AWS, GCP, Azure, and 1000+ providers
- **Declarative**: Describe the desired state, Terraform handles the rest  
- **State management**: Tracks resource changes over time
- **Plan before apply**: Preview changes before making them

## Getting Started

\`\`\`hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "web-server"
  }
}
\`\`\`

## Modules

\`\`\`hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "my-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
}
\`\`\`

Terraform is essential for managing cloud infrastructure at scale.`,
      excerpt: 'Learn Infrastructure as Code with Terraform. Define, plan, and provision cloud resources declaratively.',
      status: PostStatus.DRAFT,
      readingTime: 8,
      categoryId: categories[2].id,
      authorId: author.id,
      seoTitle: 'Infrastructure as Code with Terraform - Getting Started',
      seoDescription: 'Learn Terraform for Infrastructure as Code. Covers providers, resources, modules, and best practices for cloud deployment.',
      tagIds: [tags[0].id],
    },
    {
      title: 'CI/CD Pipeline with GitHub Actions',
      slug: 'cicd-pipeline-github-actions',
      content: `# CI/CD Pipeline with GitHub Actions

Automate your build, test, and deployment workflow with GitHub Actions.

## Basic Workflow

\`\`\`yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
\`\`\`

GitHub Actions makes CI/CD accessible without managing separate infrastructure.`,
      excerpt: 'Set up automated CI/CD pipelines with GitHub Actions for testing, building, and deploying your applications.',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date('2026-03-15'),
      readingTime: 5,
      categoryId: categories[0].id,
      authorId: author.id,
      seoTitle: 'CI/CD Pipeline with GitHub Actions - Complete Guide',
      seoDescription: 'Learn to set up CI/CD pipelines with GitHub Actions. Automate testing, building, and deployment workflows.',
      tagIds: [tags[0].id, tags[9].id],
    },
  ];

  for (const postData of posts) {
    const { tagIds, ...data } = postData;
    const post = await prisma.post.upsert({
      where: { slug: data.slug },
      update: {},
      create: data,
    });

    // Create post-tag relations
    if (tagIds) {
      for (const tagId of tagIds) {
        await prisma.postTag.upsert({
          where: { postId_tagId: { postId: post.id, tagId } },
          update: {},
          create: { postId: post.id, tagId },
        });
      }
    }
  }

  // Create comments
  const firstPost = await prisma.post.findUnique({ where: { slug: 'getting-started-with-docker' } });
  if (firstPost) {
    const comment1 = await prisma.comment.create({
      data: {
        content: 'Great comprehensive guide! The multi-stage build section was particularly helpful for reducing my image sizes.',
        authorName: 'Alex Developer',
        authorEmail: 'alex@example.com',
        postId: firstPost.id,
        status: CommentStatus.APPROVED,
      },
    });

    await prisma.comment.create({
      data: {
        content: 'Thanks Alex! Glad the multi-stage builds tip was useful. You can save even more space with distroless base images.',
        authorName: 'Admin User',
        authorEmail: 'admin@infrablog.com',
        postId: firstPost.id,
        parentId: comment1.id,
        status: CommentStatus.APPROVED,
      },
    });

    await prisma.comment.create({
      data: {
        content: 'How does Docker compare to Podman? Would love a follow-up article on that topic.',
        authorName: 'Sarah K',
        authorEmail: 'sarah@example.com',
        postId: firstPost.id,
        status: CommentStatus.APPROVED,
      },
    });

    await prisma.comment.create({
      data: {
        content: 'Check out my Docker course at spam-link.com',
        authorName: 'Spammer',
        authorEmail: 'spam@example.com',
        postId: firstPost.id,
        status: CommentStatus.SPAM,
      },
    });
  }

  // Create a sample page
  await prisma.page.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      title: 'About InfraBlog',
      slug: 'about',
      content: `# About InfraBlog

InfraBlog is a modern blogging platform built for developers and DevOps engineers. We share practical, in-depth articles about infrastructure, cloud computing, web development, and best practices.

## Our Mission

To make infrastructure knowledge accessible to everyone. We believe in learning by doing, and our articles include real-world examples, code snippets, and step-by-step guides.

## The Team

Our contributors are experienced engineers who work with these technologies daily. We write about what we know and use in production.

## Contact

Have questions or want to contribute? Reach out at hello@infrablog.com.`,
      status: PageStatus.PUBLISHED,
      authorId: admin.id,
      seoTitle: 'About InfraBlog - Developer Blogging Platform',
      seoDescription: 'Learn about InfraBlog, a modern blogging platform for developers and DevOps engineers.',
    },
  });

  console.log('✅ Seeding complete!');
  console.log('📧 Admin:  admin@infrablog.com / admin123456');
  console.log('📧 Editor: editor@infrablog.com / editor123456');
  console.log('📧 Author: author@infrablog.com / author123456');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
