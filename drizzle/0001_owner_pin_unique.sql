-- A shop PIN is no longer globally unique. Instead it is unique per owner name,
-- so the same PIN may be reused as long as the owner name differs.
ALTER TABLE "shops" DROP CONSTRAINT IF EXISTS "shops_pin_unique";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "shops_owner_name_pin_unique" ON "shops" ("owner_name", "pin");
