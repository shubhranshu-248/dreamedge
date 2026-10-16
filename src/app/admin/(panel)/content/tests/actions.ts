"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { QuestionType, Difficulty, QuestionBankItem } from "@/types/database";

interface QuestionPayload {
  id?: string;
  type: QuestionType;
  content: string;
  options: Record<string, unknown> | null;
  correct_answer: string | null;
  positive_marks: number;
  negative_marks: number;
  difficulty: Difficulty;
  topic_tag: string | null;
  image_url: string | null;
  hint: string | null;
  weight: number;
}

interface TestPayload {
  id?: string;
  name: string;
  course_id?: string;
  instructions?: string;
  duration_min: number;
  max_attempts: number;
  pass_pct: number;
  shuffle: boolean;
  show_results: boolean;
  certificate_enabled: boolean;
  negative_marking: boolean;
  status: "draft" | "published";
  questions: QuestionPayload[];
}

async function upsertTest(payload: TestPayload) {
  const supabase = await createClient();

  const testRow = {
    name: payload.name,
    course_id: payload.course_id || null,
    instructions: payload.instructions || null,
    duration_min: payload.duration_min,
    max_attempts: payload.max_attempts,
    shuffle: payload.shuffle,
    pass_pct: payload.pass_pct,
    show_results: payload.show_results,
    certificate_enabled: payload.certificate_enabled,
    negative_marking: payload.negative_marking,
    status: payload.status,
    updated_at: new Date().toISOString(),
  };

  let testId = payload.id;

  if (testId) {
    const { error } = await supabase
      .from("tests")
      .update(testRow)
      .eq("id", testId);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from("tests")
      .insert({ ...testRow, created_at: new Date().toISOString() })
      .select("id")
      .single();
    if (error) return { error: error.message };
    testId = data.id;
  }

  // replace all questions
  await supabase.from("questions").delete().eq("test_id", testId);

  if (payload.questions.length > 0) {
    const rows = payload.questions.map((q) => ({
      test_id: testId,
      type: q.type,
      content: q.content,
      options: q.options,
      correct_answer: q.correct_answer,
      positive_marks: q.positive_marks,
      negative_marks: q.negative_marks,
      difficulty: q.difficulty,
      topic_tag: q.topic_tag,
      image_url: q.image_url,
      hint: q.hint,
      weight: q.weight,
    }));

    const { error: qError } = await supabase.from("questions").insert(rows);
    if (qError) return { error: qError.message };
  }

  revalidatePath("/admin/content/tests");
  return { data: { id: testId } };
}

export async function saveTest(payload: TestPayload) {
  return upsertTest({ ...payload, status: "draft" });
}

export async function publishTest(payload: TestPayload) {
  return upsertTest({ ...payload, status: "published" });
}

export async function deleteTest(id: string) {
  const supabase = await createClient();

  await supabase.from("questions").delete().eq("test_id", id);
  const { error } = await supabase.from("tests").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/content/tests");
  return { data: true };
}

export async function duplicateTest(id: string) {
  const supabase = await createClient();

  const { data: test, error: tErr } = await supabase
    .from("tests")
    .select("*")
    .eq("id", id)
    .single();
  if (tErr) return { error: tErr.message };

  const { data: questions, error: qErr } = await supabase
    .from("questions")
    .select("*")
    .eq("test_id", id)
    .order("weight");
  if (qErr) return { error: qErr.message };

  const { id: _oldId, created_at, updated_at, ...rest } = test;
  const { data: newTest, error: insertErr } = await supabase
    .from("tests")
    .insert({
      ...rest,
      name: `${rest.name} (Copy)`,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (insertErr) return { error: insertErr.message };

  if (questions && questions.length > 0) {
    const rows = questions.map(({ id: _qId, test_id, ...qRest }) => ({
      ...qRest,
      test_id: newTest.id,
    }));
    await supabase.from("questions").insert(rows);
  }

  revalidatePath("/admin/content/tests");
  return { data: { id: newTest.id } };
}

export async function fetchTests(filters?: {
  course_id?: string;
  status?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("tests")
    .select("*, course:courses(id, name)")
    .order("created_at", { ascending: false });

  if (filters?.course_id) {
    query = query.eq("course_id", filters.course_id);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };

  // get question counts per test
  const testIds = (data || []).map((t) => t.id);
  const counts: Record<string, number> = {};

  if (testIds.length > 0) {
    const { data: qCounts } = await supabase
      .from("questions")
      .select("test_id")
      .in("test_id", testIds);

    if (qCounts) {
      for (const row of qCounts) {
        counts[row.test_id] = (counts[row.test_id] || 0) + 1;
      }
    }
  }

  const enriched = (data || []).map((t) => ({
    ...t,
    question_count: counts[t.id] || 0,
  }));

  return { data: enriched };
}

export async function fetchTestById(id: string) {
  const supabase = await createClient();

  const { data: test, error: tErr } = await supabase
    .from("tests")
    .select("*")
    .eq("id", id)
    .single();
  if (tErr) return { error: tErr.message };

  const { data: questions, error: qErr } = await supabase
    .from("questions")
    .select("*")
    .eq("test_id", id)
    .order("weight");
  if (qErr) return { error: qErr.message };

  return { data: { test, questions: questions || [] } };
}

export async function fetchQuestionBank() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("question_bank")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data: (data || []) as QuestionBankItem[] };
}

export async function addToQuestionBank(question: {
  type: QuestionType;
  content: string;
  options: Record<string, unknown> | null;
  correct_answer: string | null;
  positive_marks: number;
  negative_marks: number;
  difficulty: Difficulty;
  topic_tag: string | null;
  image_url: string | null;
  hint: string | null;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("question_bank")
    .insert({
      ...question,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/content/questions");
  return { data };
}

export async function updateQuestionBankItem(
  id: string,
  updates: Partial<{
    type: QuestionType;
    content: string;
    options: Record<string, unknown> | null;
    correct_answer: string | null;
    positive_marks: number;
    negative_marks: number;
    difficulty: Difficulty;
    topic_tag: string | null;
    image_url: string | null;
    hint: string | null;
  }>
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("question_bank")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/content/questions");
  return { data };
}

export async function deleteQuestionBankItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("question_bank").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/content/questions");
  return { data: true };
}

export async function fetchCourses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, name")
    .order("name");
  if (error) return { error: error.message };
  return { data: data || [] };
}
