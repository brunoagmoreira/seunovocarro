-- Tipo de anúncio: venda ou locação
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ListingType') THEN
    CREATE TYPE "ListingType" AS ENUM ('sale', 'rental');
  END IF;
END
$$;

ALTER TABLE "vehicles"
ADD COLUMN IF NOT EXISTS "listing_type" "ListingType" NOT NULL DEFAULT 'sale';
