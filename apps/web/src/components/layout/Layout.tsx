"use client";

import { useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { InboxPopup } from '@/components/chat/InboxPopup';
import { useUTM } from '@/hooks/useUTM';

// Isolated component for UTM tracking to satisfy Next.js Suspense requirement
function UTMTracker() {
  useUTM();
  return null;
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Scroll to top on route change (in Next.js Link handles this, but kept for full compatibility)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 pb-20 md:pb-8">
        {children}
      </main>
      <Footer />
      <BottomNav />
      {/* Tracker wrapped in Suspense because useUTM uses useSearchParams */}
      <Suspense fallback={null}>
        <UTMTracker />
      </Suspense>
      <InboxPopup />
    </div>
  );
}
