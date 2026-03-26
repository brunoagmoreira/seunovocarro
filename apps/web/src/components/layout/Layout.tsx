"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { InboxPopup } from '@/components/chat/InboxPopup';
import { useUTM } from '@/hooks/useUTM';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  // Capture UTM parameters on any page entry
  useUTM();
  
  const pathname = usePathname();

  // Scroll to top on route change (in Next.js Link handles this, but kept for full compatibility)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 pb-20 md:pb-8">
        {children}
      </main>
      <Footer />
      <BottomNav />
      {/* InboxPopup could also be moved here if it doesn't conflict */}
      <InboxPopup />
    </div>
  );
}
