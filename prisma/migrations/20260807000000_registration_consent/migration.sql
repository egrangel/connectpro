-- Consent agreement text, edited in admin Configuracoes. Defaults to '{}',
-- which the settings service parses back to DEFAULT_TERMS.
ALTER TABLE "SiteSettings" ADD COLUMN "termsJson" TEXT NOT NULL DEFAULT '{}';

-- Nullable: accounts that existed before the agreement never accepted one, and
-- backfilling a timestamp would record a consent that was never given.
ALTER TABLE "User" ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);
