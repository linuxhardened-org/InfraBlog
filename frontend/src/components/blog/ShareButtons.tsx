'use client';

export function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : '';
  const text = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const links = [
    { label: 'Twitter', href: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`, icon: 'X' },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, icon: 'in' },
    { label: 'Reddit', href: `https://reddit.com/submit?url=${encodedUrl}&title=${text}`, icon: 'R' },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied!');
    } catch {}
  };

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
        Share
      </h4>
      <div className="flex gap-2">
        {links.map(({ label, href, icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold transition-colors hover:bg-primary-500 hover:text-white hover:border-primary-500"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            title={`Share on ${label}`}
          >
            {icon}
          </a>
        ))}
        <button
          onClick={copyLink}
          className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors hover:bg-primary-500 hover:text-white hover:border-primary-500"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          title="Copy link"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>
      </div>
    </div>
  );
}
