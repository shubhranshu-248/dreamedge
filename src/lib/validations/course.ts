import { z } from "zod";

const optionalString = z.string().optional().default("");
const optionalUrl = z
  .string()
  .transform((v) => (v === "" ? undefined : v))
  .pipe(z.string().url().optional());

export const courseSchema = z.object({
  name: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be under 120 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
  description: optionalString,
  short_description: optionalString,
  category_id: optionalString,
  language: z.enum(["hindi", "english", "hinglish"]),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  discount_price: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.coerce.number().min(0).optional()
  ),
  validity_days: z.coerce.number().int().min(1, "Minimum 1 day").max(3650),
  is_featured: z.boolean().default(false),
  difficulty: z.enum(["easy", "medium", "hard"]).nullable().catch(null),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  meta_title: optionalString,
  meta_description: optionalString,
  preview_video_url: optionalString,
});

export type CourseFormValues = z.infer<typeof courseSchema>;

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be under 50 characters"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
