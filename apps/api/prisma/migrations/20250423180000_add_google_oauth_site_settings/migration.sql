-- Google OAuth fields on site_settings (idempotent if reapplied)
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "google_oauth_client_id" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "google_oauth_client_secret" TEXT;
