-- Super admin pages migration.
-- Pages created directly by the super admin have no owning shop, so the
-- shop reference must allow NULL.
ALTER TABLE "pages" ALTER COLUMN "shop_id" DROP NOT NULL;
