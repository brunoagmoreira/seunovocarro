import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string[];
  noindex?: boolean;
  children?: React.ReactNode; // Para JSON-LD schemas (renderizados fora do Helmet)
}

const SITE_NAME = 'Kairós Auto';
const DEFAULT_IMAGE = 'https://kairosauto.com.br/og-image.png';
const SITE_URL = 'https://kairosauto.com.br';

export function SEOHead({
  title,
  description,
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = 'website',
  keywords = [],
  noindex = false,
  children,
}: SEOHeadProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;
  const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        {keywords.length > 0 && (
          <meta name="keywords" content={keywords.join(', ')} />
        )}
        <link rel="canonical" href={fullUrl} />
        
        {/* Robots */}
        <meta 
          name="robots" 
          content={noindex ? 'noindex, nofollow' : 'index, follow'} 
        />

        {/* Open Graph */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={fullImage} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:type" content={type} />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content={SITE_NAME} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={fullImage} />
      </Helmet>
      
      {/* JSON-LD Structured Data - rendered outside Helmet */}
      {children}
    </>
  );
}
