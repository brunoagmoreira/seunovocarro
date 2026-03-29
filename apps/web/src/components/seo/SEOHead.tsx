import React from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string[];
  noindex?: boolean;
  children?: React.ReactNode;
}

/**
 * @deprecated In Next.js App Router, SEO should be handled using the Metadata API
 * in your page.tsx or layout.tsx files. 
 * This component no longer uses react-helmet-async to avoid build issues.
 * Use generateMetadata() instead.
 */
export function SEOHead({
  children,
}: SEOHeadProps) {
  return (
    <>
      {children}
    </>
  );
}
