export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kairós Auto",
    "url": "https://kairosauto.com.br",
    "logo": "https://kairosauto.com.br/logo.png",
    "description": "Marketplace de carros usados e seminovos com vendedores verificados",
    "sameAs": [
      "https://instagram.com/kairosauto",
      "https://facebook.com/kairosauto"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Portuguese"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
