import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'LinuxHardened - Modern Infrastructure & DevOps Blog',
    template: '%s | LinuxHardened',
  },
  description: 'LinuxHardened is a modern blogging platform for developers. Read about DevOps, cloud computing, web development, and infrastructure best practices.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    siteName: 'LinuxHardened',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
