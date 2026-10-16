import { z } from "zod";

export const testSettingsSchema = z.object({
  name: z
    .string()
    .min(3, "Test name must be at least 3 characters")
    .max(200, "Test name must be under 200 characters"),
  course_id: z.string().optional().default(""),
  instructions: z.string().optional().default(""),
  duration_min: z.coerce.number().int().min(1, "Minimum 1 minute").max(600),
  max_attempts: z.coerce.number().int().min(1).max(100).default(1),
  pass_pct: z.coerce.number().min(0).max(100).default(40),
  shuffle: z.boolean().default(false),
  show_results: z.boolean().default(true),
  certificate_enabled: z.boolean().default(false),
  negative_marking: z.boolean().default(false),
});

export type TestSettingsValues = z.infer<typeof testSettingsSchema>;

export const questionSchema = z.object({
  type: z.enum([
    "mcq_single",
    "mcq_multiple",
    "true_false",
    "short_answer",
    "match_pair",
    "subjective",
    "image_based",
  ]),
  content: z.string().min(1, "Question text is required"),
  options: z.record(z.string(), z.unknown()).nullable().default(null),
  correct_answer: z.string().nullable().default(null),
  positive_marks: z.coerce.number().min(0).default(1),
  negative_marks: z.coerce.number().min(0).default(0),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  topic_tag: z.string().nullable().default(null),
  image_url: z.string().nullable().default(null),
  hint: z.string().nullable().default(null),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;
