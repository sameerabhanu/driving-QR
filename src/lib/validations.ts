import { z } from "zod";

const optionalPhone = z
  .string()
  .trim()
  .max(50, "Number is too long")
  .regex(/^[+\d\s()-]+$/, "Invalid number format")
  .optional()
  .or(z.literal(""));

const optionalUrl = z
  .string()
  .url("Please enter a valid URL")
  .max(2000, "URL is too long")
  .optional()
  .or(z.literal(""));

const customButtonSchema = z.object({
  label: z
    .string()
    .min(1, "Button label is required")
    .max(50, "Label is too long"),
  url: z
    .string()
    .url("Invalid URL")
    .max(2000, "URL is too long"),
});

export const pageSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(255, "Business name is too long"),
  businessType: z
    .string()
    .min(2, "Please describe your business type")
    .max(100, "Business type is too long"),
  phoneNumber: optionalPhone,
  whatsappNumber: optionalPhone,
  instagramUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  googleMapsUrl: optionalUrl,
  customButtons: z.array(customButtonSchema).optional(),
}).refine(
  (data) => Boolean(data.phoneNumber || data.whatsappNumber || data.googleMapsUrl),
  {
    message: "Add at least one contact method (Phone, WhatsApp, or Maps)",
    path: ["phoneNumber"],
  }
);

export const shopSchema = z.object({
  shopName: z
    .string()
    .min(2, "Shop name must be at least 2 characters")
    .max(255, "Shop name is too long"),
  ownerName: z
    .string()
    .min(2, "Owner name must be at least 2 characters")
    .max(255, "Owner name is too long"),
  ownerPhone: z
    .string()
    .trim()
    .min(6, "Enter a valid phone number")
    .max(50, "Number is too long")
    .regex(/^[+\d\s()-]+$/, "Invalid number format"),
});

export const pinLoginSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, "Enter your PIN"),
});

export const shopLoginSchema = z.object({
  ownerName: z
    .string()
    .trim()
    .min(2, "Enter your name")
    .max(255, "Name is too long"),
  pin: z.string().regex(/^\d{4,6}$/, "Enter your PIN"),
});

export type PageFormData = z.infer<typeof pageSchema>;
export type ShopFormData = z.infer<typeof shopSchema>;
export type CustomButton = z.infer<typeof customButtonSchema>;
