import { Vehicle } from '@/types/vehicle';

interface ItemListSchemaProps {
  vehicles: Vehicle[];
  listName?: string;
}

export function ItemListSchema({ vehicles, listName = 'Veículos Disponíveis' }: ItemListSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": listName,
    "numberOfItems": vehicles.length,
    "itemListElement": vehicles.slice(0, 10).map((vehicle, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Vehicle",
        "name": `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
        "url": `https://kairosauto.com.br/veiculo/${vehicle.slug}`,
        "image": vehicle.images[0]?.url,
        "offers": {
          "@type": "Offer",
          "price": vehicle.price,
          "priceCurrency": "BRL"
        }
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
