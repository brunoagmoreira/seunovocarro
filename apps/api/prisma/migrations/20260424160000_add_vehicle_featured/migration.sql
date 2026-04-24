-- Vehicle.featured (vitrine home); idempotente se reaplicado
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "vehicles_status_featured_idx" ON "vehicles" ("status", "featured");
