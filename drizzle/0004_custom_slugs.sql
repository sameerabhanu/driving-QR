-- Custom slugs migration.
-- Super admins can choose a page slug, which may be longer than the 16-char
-- limit used for auto-generated codes. Widen the short code columns.
ALTER TABLE "pages" ALTER COLUMN "short_code" TYPE varchar(64);
--> statement-breakpoint
ALTER TABLE "used_slugs" ALTER COLUMN "short_code" TYPE varchar(64);
