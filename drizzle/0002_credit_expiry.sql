-- Credit model + page expiry migration.

-- 1. Shops gain a prepaid credit balance and an owner phone number.
ALTER TABLE "shops" ADD COLUMN IF NOT EXISTS "available_credits" integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN IF NOT EXISTS "owner_phone" varchar(50) NOT NULL DEFAULT '';
--> statement-breakpoint

-- 2. Pages gain an expiry date. Add nullable, backfill, then enforce NOT NULL.
ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "expires_at" timestamp with time zone;
--> statement-breakpoint
UPDATE "pages"
SET "expires_at" = date_trunc(
  'month',
  CASE
    WHEN extract(day FROM "created_at") = 1 THEN "created_at"
    ELSE "created_at" + interval '1 month'
  END
) + interval '2 years'
WHERE "expires_at" IS NULL;
--> statement-breakpoint
ALTER TABLE "pages" ALTER COLUMN "expires_at" SET NOT NULL;
--> statement-breakpoint

-- 3. Credit ledger.
DO $$ BEGIN
 CREATE TYPE "public"."credit_txn_kind" AS ENUM('purchase', 'consume_create', 'consume_renew', 'adjustment');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credit_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"kind" "credit_txn_kind" NOT NULL,
	"credits_delta" integer NOT NULL,
	"amount_inr" integer DEFAULT 0 NOT NULL,
	"payment_ref" varchar(255),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- 4. Permanent slug registry so short codes are never reused. Backfill existing.
CREATE TABLE IF NOT EXISTS "used_slugs" (
	"short_code" varchar(16) PRIMARY KEY NOT NULL,
	"first_page_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "used_slugs" ("short_code", "first_page_id", "created_at")
SELECT "short_code", "id", "created_at" FROM "pages"
ON CONFLICT ("short_code") DO NOTHING;
--> statement-breakpoint

-- 5. The old monthly billing model is replaced by credits.
DROP TABLE IF EXISTS "billing";
