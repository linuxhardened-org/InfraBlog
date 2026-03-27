'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSlug]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;
          
          if (!isInline && match) {
            return (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                customStyle={{ borderRadius: '0.75rem', margin: '1.5em 0', fontSize: '0.875rem' }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          }

          return <code className={className} {...props}>{children}</code>;
        },
        a({ href, children }) {
          const isExternal = href?.startsWith('http');
          return (
            <a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>
              {children}
            </a>
          );
        },
        img({ src, alt }) {
          return (
            <figure className="my-6">
              <img src={src} alt={alt || ''} className="rounded-xl w-full" loading="lazy" />
              {alt && <figcaption className="text-center text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{alt}</figcaption>}
            </figure>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
