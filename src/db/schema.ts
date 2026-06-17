import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// A reseller shop (xerox shop, visiting-card printer, etc.) that subscribes to
// the platform and creates landing pages on behalf of its own clients.
export const shopStatusEnum = pgEnum("shop_status", ["active", "suspended"]);

export const shops = pgTable("shops", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopName: varchar("shop_name", { length: 255 }).notNull(),
  ownerName: varchar("owner_name", { length: 255 }).notNull(),
  // Globally unique PIN used by the shop to log in. Stored in plain text by
  // design (low-risk, convenience-first MVP).
  pin: varchar("pin", { length: 6 }).notNull().unique(),
  status: shopStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export interface CustomButton {
  label: string;
  url: string;
}

// A generic business landing page (the master template). Belongs to a shop.
// Visibility follows the parent shop's subscription status.
// AI-generated tagline and benefits are created on page creation.
export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  shortCode: varchar("short_code", { length: 16 }).notNull().unique(),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  businessType: varchar("business_type", { length: 100 }).notNull(),
  tagline: varchar("tagline", { length: 255 }).notNull(),
  benefits: jsonb("benefits").$type<string[]>().notNull(),
  phoneNumber: varchar("phone_number", { length: 50 }),
  whatsappNumber: varchar("whatsapp_number", { length: 50 }),
  instagramUrl: text("instagram_url"),
  youtubeUrl: text("youtube_url"),
  googleMapsUrl: text("google_maps_url"),
  customButtons: jsonb("custom_buttons").$type<CustomButton[]>().notNull().default([]),
  qrCodePath: varchar("qr_code_path", { length: 500 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Per-shop, per-month billing snapshot. Lets the super admin mark a month as
// paid/unpaid. The amount is derived from the shop's page activity that month.
export const billing = pgTable(
  "billing",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopId: uuid("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    // Billing period in "YYYY-MM" form.
    month: varchar("month", { length: 7 }).notNull(),
    pagesCount: integer("pages_count").notNull().default(0),
    amountDue: integer("amount_due").notNull().default(0),
    paid: boolean("paid").notNull().default(false),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    shopMonthUnique: uniqueIndex("billing_shop_month_unique").on(
      table.shopId,
      table.month
    ),
  })
);

export type Shop = typeof shops.$inferSelect;
export type NewShop = typeof shops.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type Billing = typeof billing.$inferSelect;
export type NewBilling = typeof billing.$inferInsert;
