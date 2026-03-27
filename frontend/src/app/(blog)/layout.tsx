import { Header } from '@/components/blog/Header';
import { Footer } from '@/components/blog/Footer';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
