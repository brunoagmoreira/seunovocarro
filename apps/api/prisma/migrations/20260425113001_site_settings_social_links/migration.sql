-- Redes sociais oficiais da SNC no rodapé (configuráveis no Admin)
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "social_instagram_url" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "social_facebook_url" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "social_linkedin_url" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "social_youtube_url" TEXT;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "social_whatsapp_url" TEXT;
