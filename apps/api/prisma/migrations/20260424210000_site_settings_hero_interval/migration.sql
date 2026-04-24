-- Intervalo do carrossel de destaques no banner da home (segundos)
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "hero_featured_interval_seconds" INTEGER NOT NULL DEFAULT 5;
