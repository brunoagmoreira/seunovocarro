-- Dealer.featured (home /dealers/featured); idempotente se reaplicado
ALTER TABLE "dealers" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
