DO $$ BEGIN
 CREATE TYPE "public"."school_status" AS ENUM('active', 'expired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"phone_number" varchar(50) NOT NULL,
	"whatsapp_number" varchar(50) NOT NULL,
	"google_maps_url" text NOT NULL,
	"qr_code_path" varchar(500) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expiry_date" date NOT NULL,
	"status" "school_status" DEFAULT 'active' NOT NULL,
	CONSTRAINT "schools_slug_unique" UNIQUE("slug")
);
