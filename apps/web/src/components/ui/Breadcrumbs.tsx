import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { BreadcrumbSchema } from '@/components/seo/schemas/BreadcrumbSchema';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const schemaItems = [
    { name: 'Início', url: 'https://kairosauto.com.br' },
    ...items.map(item => ({
      name: item.label,
      url: item.href ? `https://kairosauto.com.br${item.href}` : ''
    }))
  ].filter(item => item.url);

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />
      <nav className={`container mx-auto px-4 py-4 ${className}`} aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 sm:gap-2 text-sm text-muted-foreground flex-wrap">
          <li className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
              aria-label="Página inicial"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Início</span>
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1.5 sm:gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              {item.href ? (
                <Link 
                  href={item.href}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
