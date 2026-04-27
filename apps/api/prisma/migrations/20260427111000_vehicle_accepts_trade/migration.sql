-- Aceita troca no anúncio de veículo
ALTER TABLE "vehicles"
ADD COLUMN IF NOT EXISTS "accepts_trade" BOOLEAN NOT NULL DEFAULT false;
