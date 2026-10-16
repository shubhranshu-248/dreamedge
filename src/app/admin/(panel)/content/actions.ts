"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/auth-guard";
import { courseSchema, categorySchema } from "@/lib/validations/course";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCourse(formData: FormData) {
  try {
    await assertAdmin(["super_admin", "content_creator"]);
    const supabase = await createClient();

    const raw = Object.fromEntries(formData.entries());
    const parsed = courseSchema.safeParse({
      ...raw,
      is_featured: raw.is_featured === "true",
      discount_price: raw.discount_price || undefined,
      category_id: raw.category_id || undefined,
      difficulty: raw.difficulty || undefined,
      meta_title: raw.meta_title || undefined,
      meta_description: raw.meta_description || undefined,
      preview_video_url: raw.preview_video_url || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const values = parsed.data;
    let slug = values.slug || toSlug(values.name);

    const { count } = await supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("slug", slug);

    if (count && count > 0) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const meta: Record<string, string> = {};
    if (values.meta_title) meta.title = values.meta_title;
    if (values.meta_description) meta.description = values.meta_description;
    if (values.preview_video_url) meta.preview_video_url = values.preview_video_url;

    const { data, error } = await supabase
      .from("courses")
      .insert({
        name: values.name,
        slug,
        description: values.description || null,
        short_description: values.short_description || null,
        category_id: values.category_id || null,
        language: values.language,
        price: values.price,
        discount_price: values.discount_price ? Number(values.discount_price) : null,
        validity_days: values.validity_days,
        is_featured: values.is_featured,
        difficulty: values.difficulty || null,
        status: values.status,
        meta: Object.keys(meta).length > 0 ? meta : null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("createCourse failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/content");
    return { success: true, id: data.id };
  } catch (err) {
    console.error("createCourse failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function updateCourse(id: string, formData: FormData) {
  try {
    await assertAdmin(["super_admin", "content_creator"]);
    const supabase = await createClient();

    const raw = Object.fromEntries(formData.entries());
    const parsed = courseSchema.safeParse({
      ...raw,
      is_featured: raw.is_featured === "true",
      discount_price: raw.discount_price || undefined,
      category_id: raw.category_id || undefined,
      difficulty: raw.difficulty || undefined,
      meta_title: raw.meta_title || undefined,
      meta_description: raw.meta_description || undefined,
      preview_video_url: raw.preview_video_url || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const values = parsed.data;

    const { count } = await supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("slug", values.slug)
      .neq("id", id);

    if (count && count > 0) {
      return { error: "This slug is already taken by another course" };
    }

    const meta: Record<string, string> = {};
    if (values.meta_title) meta.title = values.meta_title;
    if (values.meta_description) meta.description = values.meta_description;
    if (values.preview_video_url) meta.preview_video_url = values.preview_video_url;

    const { error } = await supabase
      .from("courses")
      .update({
        name: values.name,
        slug: values.slug,
        description: values.description || null,
        short_description: values.short_description || null,
        category_id: values.category_id || null,
        language: values.language,
        price: values.price,
        discount_price: values.discount_price ? Number(values.discount_price) : null,
        validity_days: values.validity_days,
        is_featured: values.is_featured,
        difficulty: values.difficulty || null,
        status: values.status,
        meta: Object.keys(meta).length > 0 ? meta : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("updateCourse failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/content");
    return { success: true };
  } catch (err) {
    console.error("updateCourse failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function deleteCourse(id: string) {
  try {
    await assertAdmin(["super_admin"]);
    const supabase = await createClient();

    const { count } = await supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("course_id", id);

    if (count && count > 0) {
      return { error: "Cannot delete a course with active enrollments" };
    }

    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) {
      console.error("deleteCourse failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/content");
    return { success: true };
  } catch (err) {
    console.error("deleteCourse failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function duplicateCourse(id: string) {
  try {
    await assertAdmin(["super_admin", "content_creator"]);
    const supabase = await createClient();

    const { data: original, error: fetchError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !original) {
      return { error: "Course not found" };
    }

    const newSlug = `${original.slug}-copy-${Date.now().toString(36)}`;

    const { data, error } = await supabase
      .from("courses")
      .insert({
        name: `${original.name} (Copy)`,
        slug: newSlug,
        description: original.description,
        short_description: original.short_description,
        category_id: original.category_id,
        language: original.language,
        price: original.price,
        discount_price: original.discount_price,
        validity_days: original.validity_days,
        is_featured: false,
        difficulty: original.difficulty,
        status: "draft" as const,
        meta: original.meta,
        thumbnail_url: original.thumbnail_url,
      })
      .select("id")
      .single();

    if (error) {
      console.error("duplicateCourse failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/content");
    return { success: true, id: data.id };
  } catch (err) {
    console.error("duplicateCourse failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function toggleCourseStatus(
  id: string,
  newStatus: "draft" | "published" | "archived"
) {
  try {
    await assertAdmin(["super_admin", "content_creator"]);
    const supabase = await createClient();

    const { error } = await supabase
      .from("courses")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("toggleCourseStatus failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/content");
    return { success: true };
  } catch (err) {
    console.error("toggleCourseStatus failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function uploadCourseThumbnail(courseId: string, formData: FormData) {
  try {
    await assertAdmin(["super_admin", "content_creator"]);
    const supabase = await createClient();

    const file = formData.get("thumbnail") as File;
    if (!file || file.size === 0) {
      return { error: "No file provided" };
    }

    if (file.size > 2 * 1024 * 1024) {
      return { error: "File must be under 2MB" };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `courses/${courseId}/thumbnail.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("course-thumbnails")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error("uploadCourseThumbnail failed:", uploadError);
      return { error: "Something went wrong. Please try again." };
    }

    const { data: urlData } = supabase.storage
      .from("course-thumbnails")
      .getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("courses")
      .update({ thumbnail_url: urlData.publicUrl })
      .eq("id", courseId);

    if (updateError) {
      console.error("uploadCourseThumbnail failed:", updateError);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/content");
    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    console.error("uploadCourseThumbnail failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function createCategory(formData: FormData) {
  try {
    await assertAdmin(["super_admin", "content_creator"]);
    const supabase = await createClient();

    const raw = Object.fromEntries(formData.entries());
    const parsed = categorySchema.safeParse(raw);

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { count } = await supabase
      .from("course_categories")
      .select("id", { count: "exact", head: true });

    const { error } = await supabase.from("course_categories").insert({
      name: parsed.data.name,
      weight: (count ?? 0) + 1,
    });

    if (error) {
      console.error("createCategory failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/content");
    return { success: true };
  } catch (err) {
    console.error("createCategory failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    await assertAdmin(["super_admin", "content_creator"]);
    const supabase = await createClient();

    const raw = Object.fromEntries(formData.entries());
    const parsed = categorySchema.safeParse(raw);

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { error } = await supabase
      .from("course_categories")
      .update({ name: parsed.data.name })
      .eq("id", id);

    if (error) {
      console.error("updateCategory failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/content");
    return { success: true };
  } catch (err) {
    console.error("updateCategory failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function deleteCategory(id: string) {
  try {
    await assertAdmin(["super_admin"]);
    const supabase = await createClient();

    const { count } = await supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if (count && count > 0) {
      return {
        error: `Cannot delete: ${count} course${count > 1 ? "s" : ""} use this category`,
      };
    }

    const { error } = await supabase.from("course_categories").delete().eq("id", id);

    if (error) {
      console.error("deleteCategory failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/content");
    return { success: true };
  } catch (err) {
    console.error("deleteCategory failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function reorderCategories(orderedIds: string[]) {
  try {
    await assertAdmin(["super_admin", "content_creator"]);
    const supabase = await createClient();

    const updates = orderedIds.map((id, index) =>
      supabase
        .from("course_categories")
        .update({ weight: index + 1 })
        .eq("id", id)
    );

    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);

    if (failed?.error) {
      console.error("reorderCategories failed:", failed.error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/content");
    return { success: true };
  } catch (err) {
    console.error("reorderCategories failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}
