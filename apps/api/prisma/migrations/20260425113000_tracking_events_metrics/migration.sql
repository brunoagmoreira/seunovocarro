-- Tracking de home views e cliques de WhatsApp por veículo
CREATE TABLE IF NOT EXISTS "tracking_events" (
  "id" TEXT PRIMARY KEY,
  "event_type" TEXT NOT NULL,
  "page" TEXT,
  "vehicle_id" TEXT,
  "viewer_id" TEXT,
  "session_id" TEXT,
  "referrer" TEXT,
  "utm_source" TEXT,
  "utm_medium" TEXT,
  "utm_campaign" TEXT,
  "utm_content" TEXT,
  "utm_term" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "tracking_events_event_type_idx" ON "tracking_events" ("event_type");
CREATE INDEX IF NOT EXISTS "tracking_events_vehicle_id_idx" ON "tracking_events" ("vehicle_id");
CREATE INDEX IF NOT EXISTS "tracking_events_created_at_idx" ON "tracking_events" ("created_at");

DO $$ BEGIN
  ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
