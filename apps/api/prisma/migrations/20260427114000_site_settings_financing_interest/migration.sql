-- Juros médios de financiamento (%) configurável no admin
ALTER TABLE "site_settings"
ADD COLUMN IF NOT EXISTS "avg_financing_interest_rate" DECIMAL(5,2) NOT NULL DEFAULT 1.50;
