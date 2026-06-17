BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  CREATE TYPE public.shop_status AS ENUM ('active', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  shop_name varchar(255) NOT NULL,
  owner_name varchar(255) NOT NULL,
  pin varchar(6) NOT NULL,
  status public.shop_status NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT shops_pin_unique UNIQUE (pin)
);

CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  shop_id uuid NOT NULL,
  short_code varchar(16) NOT NULL,
  business_name varchar(255) NOT NULL,
  business_type varchar(100) NOT NULL,
  tagline varchar(255) NOT NULL,
  benefits jsonb NOT NULL,
  phone_number varchar(50),
  whatsapp_number varchar(50),
  instagram_url text,
  youtube_url text,
  google_maps_url text,
  custom_buttons jsonb NOT NULL DEFAULT '[]'::jsonb,
  qr_code_path varchar(500) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pages_short_code_unique UNIQUE (short_code)
);

DO $$
BEGIN
  ALTER TABLE public.pages
    ADD COLUMN IF NOT EXISTS business_type varchar(100),
    ADD COLUMN IF NOT EXISTS benefits jsonb,
    ADD COLUMN IF NOT EXISTS instagram_url text,
    ADD COLUMN IF NOT EXISTS youtube_url text,
    ADD COLUMN IF NOT EXISTS custom_buttons jsonb DEFAULT '[]'::jsonb;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pages'
      AND column_name = 'category'
  ) THEN
    EXECUTE $sql$
      UPDATE public.pages
      SET
        business_type = COALESCE(NULLIF(business_type, ''), COALESCE(NULLIF(category, ''), 'Local Business')),
        tagline = COALESCE(NULLIF(tagline, ''), 'Connect with us instantly'),
        benefits = COALESCE(
          benefits,
          CASE
            WHEN services IS NOT NULL AND jsonb_typeof(services) = 'array' AND jsonb_array_length(services) >= 5
              THEN (
                SELECT jsonb_agg(value)
                FROM (
                  SELECT value
                  FROM jsonb_array_elements_text(services)
                  LIMIT 5
                ) picked
              )
            ELSE '["Professional Service","Customer Focused Approach","Fast Response","Easy Communication","Reliable Support"]'::jsonb
          END
        ),
        custom_buttons = COALESCE(custom_buttons, '[]'::jsonb)
      WHERE
        business_type IS NULL
        OR business_type = ''
        OR tagline IS NULL
        OR tagline = ''
        OR benefits IS NULL
        OR custom_buttons IS NULL
    $sql$;

    ALTER TABLE public.pages
      DROP COLUMN IF EXISTS category,
      DROP COLUMN IF EXISTS address,
      DROP COLUMN IF EXISTS services;
  ELSE
    UPDATE public.pages
    SET
      business_type = COALESCE(NULLIF(business_type, ''), 'Local Business'),
      tagline = COALESCE(NULLIF(tagline, ''), 'Connect with us instantly'),
      benefits = COALESCE(
        benefits,
        '["Professional Service","Customer Focused Approach","Fast Response","Easy Communication","Reliable Support"]'::jsonb
      ),
      custom_buttons = COALESCE(custom_buttons, '[]'::jsonb)
    WHERE
      business_type IS NULL
      OR business_type = ''
      OR tagline IS NULL
      OR tagline = ''
      OR benefits IS NULL
      OR custom_buttons IS NULL;
  END IF;

  ALTER TABLE public.pages
    ALTER COLUMN business_type SET NOT NULL,
    ALTER COLUMN tagline SET NOT NULL,
    ALTER COLUMN benefits SET NOT NULL,
    ALTER COLUMN custom_buttons SET NOT NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  shop_id uuid NOT NULL,
  month varchar(7) NOT NULL,
  pages_count integer NOT NULL DEFAULT 0,
  amount_due integer NOT NULL DEFAULT 0,
  paid boolean NOT NULL DEFAULT false,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

DO $$
BEGIN
  ALTER TABLE public.pages
    ADD CONSTRAINT pages_shop_id_shops_id_fk
    FOREIGN KEY (shop_id)
    REFERENCES public.shops(id)
    ON DELETE CASCADE
    ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE public.billing
    ADD CONSTRAINT billing_shop_id_shops_id_fk
    FOREIGN KEY (shop_id)
    REFERENCES public.shops(id)
    ON DELETE CASCADE
    ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS billing_shop_month_unique
  ON public.billing (shop_id, month);

COMMIT;

-- Optional cleanup for old driving-school schema (run only if no old data is needed):
-- BEGIN;
-- DROP TABLE IF EXISTS public.schools CASCADE;
-- DROP TYPE IF EXISTS public.school_status;
-- COMMIT;
