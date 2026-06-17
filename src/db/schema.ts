import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  integer,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// A reseller shop (xerox shop, visiting-card printer, etc.) that subscribes to
// the platform and creates landing pages on behalf of its own clients.
export const shopStatusEnum = pgEnum("shop_status", ["active", "suspended"]);

export const shops = pgTable(
  "shops",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shopName: varchar("shop_name", { length: 255 }).notNull(),
    ownerName: varchar("owner_name", { length: 255 }).notNull(),
    // PIN used by the shop to log in alongside the owner name. Stored in plain
    // text by design (low-risk, convenience-first MVP). A PIN is only unique
    // per owner name, so the same PIN may be reused for a different owner.
    pin: varchar("pin", { length: 6 }).notNull(),
    status: shopStatusEnum("status").notNull().default("active"),
    // Prepaid credit balance. Each page create or renew consumes 1 credit.
    availableCredits: integer("available_credits").notNull().default(0),
    // Owner contact number, collected at onboarding.
    ownerPhone: varchar("owner_phone", { length: 50 }).notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    ownerPinUnique: uniqueIndex("shops_owner_name_pin_unique").on(
      table.ownerName,
      table.pin
    ),
  })
);

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
  // When the page expires and becomes invisible / eligible for cleanup.
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Kinds of credit ledger entries.
export const creditTxnKindEnum = pgEnum("credit_txn_kind", [
  "purchase",
  "consume_create",
  "consume_renew",
  "adjustment",
]);

// Immutable ledger of every credit movement for a shop.
export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id, { onDelete: "cascade" }),
  kind: creditTxnKindEnum("kind").notNull(),
  // Positive for purchases/credits, negative for consumption.
  creditsDelta: integer("credits_delta").notNull(),
  // Rupee value associated with the movement (purchases only, else 0).
  amountInr: integer("amount_inr").notNull().default(0),
  paymentRef: varchar("payment_ref", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Permanent reservation of every short code ever used, so a slug is never
// reissued even after its page is deleted/expired.
export const usedSlugs = pgTable("used_slugs", {
  shortCode: varchar("short_code", { length: 16 }).primaryKey(),
  firstPageId: uuid("first_page_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Shop = typeof shops.$inferSelect;
export type NewShop = typeof shops.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;
export type UsedSlug = typeof usedSlugs.$inferSelect;
export type NewUsedSlug = typeof usedSlugs.$inferInsert;
