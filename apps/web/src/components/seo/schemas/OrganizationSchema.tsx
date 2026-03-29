export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Seu Novo Carro",
    "url": "https://seunovocarro.com.br",
    "logo": "https://seunovocarro.com.br/logo.png",
    "description": "A melhor plataforma para comprar e vender carros usados e seminovos no Brasil. Qualidade, segurança e o melhor preço.",
    "sameAs": [
      "https://instagram.com/seunovocarro",
      "https://facebook.com/seunovocarro"
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
