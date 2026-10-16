"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Subject ───

export async function createSubject(courseId: string, name: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("subjects")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  const { data, error } = await supabase
    .from("subjects")
    .insert({
      course_id: courseId,
      name,
      slug: toSlug(name),
      weight: (count ?? 0) + 1,
      color_code: "#6366f1",
      is_visible: true,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/content/manager");
  return { data };
}

export async function updateSubject(
  id: string,
  fields: { name?: string; color_code?: string; is_visible?: boolean }
) {
  const supabase = await createClient();

  const update: Record<string, unknown> = { ...fields };
  if (fields.name) update.slug = toSlug(fields.name);

  const { data, error } = await supabase
    .from("subjects")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/content/manager");
  return { data };
}

export async function deleteSubject(id: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("topics")
    .select("id", { count: "exact", head: true })
    .eq("subject_id", id);

  if (count && count > 0) {
    return { error: `Cannot delete: ${count} topic${count > 1 ? "s" : ""} exist under this subject` };
  }

  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/content/manager");
  return { success: true };
}

// ─── Topic ───

export async function createTopic(subjectId: string, name: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("topics")
    .select("id", { count: "exact", head: true })
    .eq("subject_id", subjectId);

  const { data, error } = await supabase
    .from("topics")
    .insert({
      subject_id: subjectId,
      name,
      slug: toSlug(name),
      weight: (count ?? 0) + 1,
      is_visible: true,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/content/manager");
  return { data };
}

export async function updateTopic(
  id: string,
  fields: { name?: string; is_visible?: boolean; description?: string }
) {
  const supabase = await createClient();

  const update: Record<string, unknown> = { ...fields };
  if (fields.name) update.slug = toSlug(fields.name);

  const { data, error } = await supabase
    .from("topics")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/content/manager");
  return { data };
}

export async function deleteTopic(id: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("content_items")
    .select("id", { count: "exact", head: true })
    .eq("topic_id", id);

  if (count && count > 0) {
    return { error: `Cannot delete: ${count} content item${count > 1 ? "s" : ""} exist under this topic` };
  }

  const { error } = await supabase.from("topics").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/content/manager");
  return { success: true };
}

// ─── Content Item ───

export async function createContentItem(
  topicId: string,
  title: string,
  type: string
) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("content_items")
    .select("id", { count: "exact", head: true })
    .eq("topic_id", topicId);

  const { data, error } = await supabase
    .from("content_items")
    .insert({
      topic_id: topicId,
      title,
      type,
      weight: (count ?? 0) + 1,
      is_paid: true,
      is_downloadable: false,
      is_printable: false,
      status: "draft",
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/content/manager");
  return { data };
}

export async function updateContentItem(
  id: string,
  fields: Record<string, unknown>
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_items")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/content/manager");
  return { data };
}

export async function deleteContentItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("content_items").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/content/manager");
  return { success: true };
}

// ─── Reorder ───

export async function reorderItems(
  table: "subjects" | "topics" | "content_items",
  orderedIds: string[]
) {
  const supabase = await createClient();

  const updates = orderedIds.map((id, index) =>
    supabase.from(table).update({ weight: index + 1 }).eq("id", id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);

  if (failed?.error) return { error: failed.error.message };
  return { success: true };
}

// ─── Upload ───

export async function uploadContentFile(
  contentId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "No file provided" };
  if (file.size > 50 * 1024 * 1024) return { error: "File must be under 50MB" };

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `content/${contentId}/file.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("content-files")
    .upload(path, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage
    .from("content-files")
    .getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("content_items")
    .update({ file_url: urlData.publicUrl })
    .eq("id", contentId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/content/manager");
  return { success: true, url: urlData.publicUrl };
}

// ─── Fetch tree ───

export async function fetchCourseTree(courseId: string) {
  const supabase = await createClient();

  const { data: subjects, error: sErr } = await supabase
    .from("subjects")
    .select("*")
    .eq("course_id", courseId)
    .order("weight");

  if (sErr) return { error: sErr.message };
  if (!subjects || subjects.length === 0) return { data: [] };

  const subjectIds = subjects.map((s) => s.id);

  const { data: topics, error: tErr } = await supabase
    .from("topics")
    .select("*")
    .in("subject_id", subjectIds)
    .order("weight");

  if (tErr) return { error: tErr.message };

  const topicIds = (topics || []).map((t) => t.id);

  let contentItems: Record<string, unknown>[] = [];
  if (topicIds.length > 0) {
    const { data: items, error: cErr } = await supabase
      .from("content_items")
      .select("*")
      .in("topic_id", topicIds)
      .order("weight");

    if (cErr) return { error: cErr.message };
    contentItems = items || [];
  }

  const topicMap = new Map<string, typeof topics>();
  for (const topic of topics || []) {
    const subId = topic.subject_id as string;
    if (!topicMap.has(subId)) topicMap.set(subId, []);
    topicMap.get(subId)!.push(topic);
  }

  const contentMap = new Map<string, typeof contentItems>();
  for (const item of contentItems) {
    const tId = item.topic_id as string;
    if (!contentMap.has(tId)) contentMap.set(tId, []);
    contentMap.get(tId)!.push(item);
  }

  const tree = subjects.map((subject) => ({
    id: subject.id,
    kind: "subject" as const,
    name: subject.name,
    weight: subject.weight,
    children: (topicMap.get(subject.id) || []).map((topic) => ({
      id: topic.id,
      kind: "topic" as const,
      name: topic.name,
      weight: topic.weight,
      children: (contentMap.get(topic.id) || []).map((item) => ({
        id: item.id as string,
        kind: "content" as const,
        name: item.title as string,
        weight: item.weight as number,
        status: item.status as string,
        contentType: item.type as string,
        children: [],
        data: item,
      })),
      data: topic,
    })),
    data: subject,
  }));

  return { data: tree };
}
