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

const baseQuestion = z.object({
  content: z.string().min(1, "Question text is required"),
  positive_marks: z.coerce.number().min(0).default(1),
  negative_marks: z.coerce.number().min(0).default(0),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  topic_tag: z.string().nullable().default(null),
  image_url: z.string().nullable().default(null),
  hint: z.string().nullable().default(null),
});

const mcqOption = z.object({
  id: z.string(),
  text: z.string().min(1, "Option text is required"),
  is_correct: z.boolean(),
});

const mcqSingleQuestion = baseQuestion.extend({
  type: z.literal("mcq_single"),
  options: z.array(mcqOption).min(2).max(6),
  correct_answer: z.string().nullable().default(null),
});

const mcqMultipleQuestion = baseQuestion.extend({
  type: z.literal("mcq_multiple"),
  options: z.array(mcqOption).min(2).max(6),
  correct_answer: z.string().nullable().default(null),
});

const trueFalseQuestion = baseQuestion.extend({
  type: z.literal("true_false"),
  options: z.record(z.string(), z.unknown()).nullable().default(null),
  correct_answer: z.string().nullable().default(null),
});

const shortAnswerQuestion = baseQuestion.extend({
  type: z.literal("short_answer"),
  options: z.record(z.string(), z.unknown()).nullable().default(null),
  correct_answer: z.string().nullable().default(null),
});

const matchPairQuestion = baseQuestion.extend({
  type: z.literal("match_pair"),
  options: z.record(z.string(), z.unknown()).nullable().default(null),
  correct_answer: z.string().nullable().default(null),
});

const subjectiveQuestion = baseQuestion.extend({
  type: z.literal("subjective"),
  options: z.record(z.string(), z.unknown()).nullable().default(null),
  correct_answer: z.string().nullable().default(null),
});

const imageBasedQuestion = baseQuestion.extend({
  type: z.literal("image_based"),
  options: z.record(z.string(), z.unknown()).nullable().default(null),
  correct_answer: z.string().nullable().default(null),
});

export const questionSchema = z.discriminatedUnion("type", [
  mcqSingleQuestion,
  mcqMultipleQuestion,
  trueFalseQuestion,
  shortAnswerQuestion,
  matchPairQuestion,
  subjectiveQuestion,
  imageBasedQuestion,
]);

export type QuestionFormValues = z.infer<typeof questionSchema>;
