import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

export const schoolStatusEnum = pgEnum("school_status", ["active", "expired"]);

export const schools = pgTable("schools", {
  id: uuid("id").primaryKey().defaultRandom(),
  schoolName: varchar("school_name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  whatsappNumber: varchar("whatsapp_number", { length: 50 }).notNull(),
  googleMapsUrl: text("google_maps_url").notNull(),
  qrCodePath: varchar("qr_code_path", { length: 500 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiryDate: date("expiry_date").notNull(),
  status: schoolStatusEnum("status").notNull().default("active"),
});

export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;
