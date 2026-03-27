'use client';

import { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: { content: string }) {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const headings = content.match(/^#{1,3}\s+.+$/gm) || [];
    const parsed = headings.map((h) => {
      const level = h.match(/^#+/)![0].length;
      const text = h.replace(/^#+\s+/, '').replace(/[*_`]/g, '');
      const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '');
      return { id, text, level };
    });
    setItems(parsed);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav>
      <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
        On this page
      </h4>
      <ul className="space-y-1">
        {items.map(({ id, text, level }) => (
          <li key={id} style={{ paddingLeft: `${(level - 1) * 0.75}rem` }}>
            <a
              href={`#${id}`}
              className={`block text-xs py-1 transition-colors border-l-2 pl-3 ${
                activeId === id
                  ? 'border-primary-500 text-primary-500 font-medium'
                  : 'border-transparent hover:text-primary-500'
              }`}
              style={{ color: activeId === id ? undefined : 'var(--text-muted)' }}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
