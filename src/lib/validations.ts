import { z } from "zod";

export const schoolSchema = z.object({
  schoolName: z
    .string()
    .min(2, "School name must be at least 2 characters")
    .max(255, "School name is too long"),
  phoneNumber: z
    .string()
    .min(7, "Phone number is required")
    .max(50, "Phone number is too long")
    .regex(/^[+\d\s()-]+$/, "Invalid phone number format"),
  whatsappNumber: z
    .string()
    .min(7, "WhatsApp number is required")
    .max(50, "WhatsApp number is too long")
    .regex(/^[+\d\s()-]+$/, "Invalid WhatsApp number format"),
  googleMapsUrl: z
    .string()
    .url("Please enter a valid Google Maps URL")
    .max(2000, "URL is too long"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(255, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
});

export const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type SchoolFormData = z.infer<typeof schoolSchema>;
