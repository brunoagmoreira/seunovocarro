import { Vehicle, FUEL_TYPES, TRANSMISSION_TYPES } from '@/types/vehicle';

interface VehicleSchemaProps {
  vehicle: Vehicle;
}

function getFuelTypeSchema(fuel: string): string {
  const map: Record<string, string> = {
    gasoline: 'https://schema.org/Gasoline',
    ethanol: 'Ethanol',
    flex: 'Flex (Gasoline/Ethanol)',
    diesel: 'https://schema.org/Diesel',
    electric: 'https://schema.org/Electricity',
    hybrid: 'Hybrid'
  };
  return map[fuel] || fuel;
}

export function VehicleSchema({ vehicle }: VehicleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "name": `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    "description": vehicle.description || `${vehicle.brand} ${vehicle.model} ${vehicle.version || ''} ${vehicle.year}`,
    "brand": {
      "@type": "Brand",
      "name": vehicle.brand
    },
    "model": vehicle.model,
    "vehicleModelDate": vehicle.year.toString(),
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": vehicle.mileage,
      "unitCode": "KMT"
    },
    "fuelType": getFuelTypeSchema(vehicle.fuel),
    "vehicleTransmission": vehicle.transmission === 'automatic' ? 'AutomaticTransmission' : 'ManualTransmission',
    "color": vehicle.color,
    "numberOfDoors": vehicle.doors,
    "image": vehicle.images.map(img => img.url),
    "offers": {
      "@type": "Offer",
      "price": vehicle.price,
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Person",
        "name": vehicle.seller.name,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": vehicle.city,
          "addressRegion": vehicle.state,
          "addressCountry": "BR"
        }
      }
    },
    ...(vehicle.displayId && { "vehicleIdentificationNumber": vehicle.displayId })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
