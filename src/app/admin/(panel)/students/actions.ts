"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/auth-guard";

function sanitizeSearch(input: string): string {
  return input.replace(/[,().%_*]/g, "");
}

interface StudentFilters {
  search?: string;
  status?: string;
  city?: string;
  courseId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchStudents(filters: StudentFilters = {}) {
  try {
    await assertAdmin(["super_admin", "teacher", "support_staff"]);
    const supabase = await createClient();
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("students")
      .select("id, full_name, email, phone, avatar_url, class, city, is_active, created_at, enrollments(id)", { count: "exact" });

    if (filters.search) {
      const safe = sanitizeSearch(filters.search);
      if (safe.length > 0) {
        query = query.or(
          `full_name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`
        );
      }
    }

    if (filters.status && filters.status !== "all") {
      if (filters.status === "active") {
        query = query.eq("is_active", true);
      } else {
        query = query.eq("is_active", false);
      }
    }

    if (filters.city) {
      const safeCity = sanitizeSearch(filters.city);
      if (safeCity.length > 0) {
        query = query.ilike("city", `%${safeCity}%`);
      }
    }

    if (filters.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }

    if (filters.courseId) {
      const { data: enrolled } = await supabase
        .from("enrollments")
        .select("student_id")
        .eq("course_id", filters.courseId);

      const ids = enrolled?.map((e) => e.student_id) ?? [];
      if (ids.length === 0) {
        return { data: [], count: 0 };
      }
      query = query.in("id", ids);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("fetchStudents failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    const students = (data ?? []).map((s: Record<string, unknown>) => ({
      ...s,
      status: s.is_active === true ? "active" : "inactive",
      is_active: undefined,
      enrollment_count: Array.isArray(s.enrollments)
        ? s.enrollments.length
        : 0,
      enrollments: undefined,
    }));

    return { data: students, count: count ?? 0 };
  } catch (err) {
    console.error("fetchStudents failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function fetchStudentDetail(studentId: string) {
  try {
    await assertAdmin(["super_admin", "teacher", "support_staff"]);
    const supabase = await createClient();

    const { data: student, error } = await supabase
      .from("students")
      .select("id, user_id, full_name, email, phone, avatar_url, class, school_name, city, state, is_active, referral_code, created_at, updated_at")
      .eq("id", studentId)
      .single();

    if (error) {
      console.error("fetchStudentDetail failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    const studentRecord = {
      ...student,
      status: student.is_active === true ? "active" : "inactive",
    } as Record<string, unknown>;

    const [enrollments, testAttempts, orders, auditLog] = await Promise.all([
      supabase
        .from("enrollments")
        .select("*, course:courses(id, title)")
        .eq("student_id", studentId)
        .order("purchased_at", { ascending: false }),
      supabase
        .from("test_attempts")
        .select("*, test:tests(name)")
        .eq("student_id", studentId)
        .order("submitted_at", { ascending: false })
        .limit(50),
      supabase
        .from("orders")
        .select("*, course:courses(title)")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false }),
      supabase
        .from("audit_log")
        .select("id, action, entity_type, entity_id, created_at")
        .eq("user_id", student.user_id)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    // Map course.title → course.name for component compatibility
    const mappedEnrollments = (enrollments.data ?? []).map((e) => {
      const course = e.course as { id: string; title: string } | null;
      return { ...e, course: course ? { id: course.id, name: course.title } : null };
    });
    const mappedOrders = (orders.data ?? []).map((o) => {
      const course = o.course as { title: string } | null;
      return { ...o, course: course ? { name: course.title } : null };
    });

    return {
      data: {
        student: studentRecord,
        enrollments: mappedEnrollments,
        testAttempts: testAttempts.data ?? [],
        orders: mappedOrders,
        auditLog: auditLog.data ?? [],
      },
    };
  } catch (err) {
    console.error("fetchStudentDetail failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function updateStudentStatus(
  studentId: string,
  status: "active" | "inactive" | "blocked"
) {
  try {
    await assertAdmin(["super_admin", "support_staff"]);
    const supabase = await createClient();

    const { error } = await supabase
      .from("students")
      .update({ is_active: status === "active" })
      .eq("id", studentId);

    if (error) {
      console.error("updateStudentStatus failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/students");
    return { success: true };
  } catch (err) {
    console.error("updateStudentStatus failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function bulkUpdateStudentStatus(
  studentIds: string[],
  status: "active" | "inactive" | "blocked"
) {
  try {
    await assertAdmin(["super_admin", "support_staff"]);
    const supabase = await createClient();

    const { error } = await supabase
      .from("students")
      .update({ is_active: status === "active" })
      .in("id", studentIds);

    if (error) {
      console.error("bulkUpdateStudentStatus failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/students");
    return { success: true };
  } catch (err) {
    console.error("bulkUpdateStudentStatus failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function fetchStudentAnalytics() {
  try {
    await assertAdmin(["super_admin", "teacher", "support_staff"]);
    const supabase = await createClient();

    const [
      { data: students },
      { data: enrollments },
    ] = await Promise.all([
      supabase.from("students").select("id, is_active, city, created_at"),
      supabase.from("enrollments").select("course_id, courses(title)"),
    ]);

    const statusDist: Record<string, number> = { active: 0, inactive: 0, blocked: 0 };
    const cityDist: Record<string, number> = {};
    const monthlyGrowth: Record<string, number> = {};

    (students ?? []).forEach((s: Record<string, unknown>) => {
      const status = s.is_active === true ? "active" : "inactive";
      statusDist[status] = (statusDist[status] || 0) + 1;

      const city = (s.city as string) || "Unknown";
      cityDist[city] = (cityDist[city] || 0) + 1;

      const month = (s.created_at as string).slice(0, 7);
      monthlyGrowth[month] = (monthlyGrowth[month] || 0) + 1;
    });

    const courseDist: Record<string, number> = {};
    (enrollments ?? []).forEach((e: Record<string, unknown>) => {
      const course = e.courses as { title: string } | null;
      const name = course?.title ?? "Unknown";
      courseDist[name] = (courseDist[name] || 0) + 1;
    });

    return {
      data: {
        total: students?.length ?? 0,
        statusDistribution: Object.entries(statusDist).map(([name, value]) => ({
          name,
          value,
        })),
        cityDistribution: Object.entries(cityDist)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, value]) => ({ name, value })),
        monthlyGrowth: Object.entries(monthlyGrowth)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([month, count]) => ({ month, count })),
        courseDistribution: Object.entries(courseDist)
          .sort((a, b) => b[1] - a[1])
          .map(([name, value]) => ({ name, value })),
      },
    };
  } catch (err) {
    console.error("fetchStudentAnalytics failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function fetchCoursesList() {
  try {
    await assertAdmin();
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("id, title")
      .eq("is_published", true)
      .order("title");
    return (data ?? []).map((c) => ({ id: c.id, name: c.title }));
  } catch (err) {
    console.error("fetchCoursesList failed:", err);
    return [];
  }
}

// --- Leads ---

export async function fetchLeads(filters: { search?: string; status?: string; source?: string } = {}) {
  try {
    await assertAdmin(["super_admin", "support_staff"]);
    const supabase = await createClient();

    let query = supabase
      .from("leads")
      .select("id, name, email, phone, source, status, remarks, created_at", { count: "exact" });

    if (filters.search) {
      const safe = sanitizeSearch(filters.search);
      if (safe.length > 0) {
        query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`);
      }
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters.source && filters.source !== "all") {
      query = query.eq("source", filters.source);
    }

    const { data, count, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("fetchLeads failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
    return { data: data ?? [], count: count ?? 0 };
  } catch (err) {
    console.error("fetchLeads failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function createLead(formData: FormData) {
  try {
    await assertAdmin(["super_admin", "support_staff"]);
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const source = formData.get("source") as string;
    const remarks = formData.get("remarks") as string;

    if (!name?.trim()) return { error: "Name is required" };

    const { error } = await supabase.from("leads").insert({
      name: name.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      source: source || "other",
      status: "new",
      remarks: remarks?.trim() || null,
    });

    if (error) {
      console.error("createLead failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/students/leads");
    return { success: true };
  } catch (err) {
    console.error("createLead failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function updateLead(
  id: string,
  updates: { status?: string; remarks?: string }
) {
  try {
    await assertAdmin(["super_admin", "support_staff"]);
    const supabase = await createClient();

    const { error } = await supabase
      .from("leads")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("updateLead failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/students/leads");
    return { success: true };
  } catch (err) {
    console.error("updateLead failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function deleteLead(id: string) {
  try {
    await assertAdmin(["super_admin"]);
    const supabase = await createClient();
    const { error } = await supabase.from("leads").delete().eq("id", id);

    if (error) {
      console.error("deleteLead failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/students/leads");
    return { success: true };
  } catch (err) {
    console.error("deleteLead failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function convertLeadToStudent(leadId: string) {
  try {
    await assertAdmin(["super_admin", "support_staff"]);
    const supabase = await createClient();

    const { data: lead, error: fetchError } = await supabase
      .from("leads")
      .select("id, name, email, phone, source, status")
      .eq("id", leadId)
      .single();

    if (fetchError || !lead) return { error: "Lead not found" };

    const { error: insertError } = await supabase.from("students").insert({
      user_id: crypto.randomUUID(),
      full_name: lead.name ?? "",
      phone: lead.phone,
      email: lead.email ?? "",
      is_active: true,
    });

    if (insertError) {
      console.error("convertLeadToStudent failed:", insertError);
      return { error: "Something went wrong. Please try again." };
    }

    await supabase
      .from("leads")
      .update({ status: "converted", updated_at: new Date().toISOString() })
      .eq("id", leadId);

    revalidatePath("/admin/students/leads");
    revalidatePath("/admin/students");
    return { success: true };
  } catch (err) {
    console.error("convertLeadToStudent failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

// --- Testimonials ---

export async function fetchTestimonials() {
  try {
    await assertAdmin(["super_admin", "support_staff"]);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("testimonials")
      .select("id, student_name, student_photo_url, content, video_url, rating, class, type, year, is_visible, weight, created_at")
      .order("weight", { ascending: true });

    if (error) {
      console.error("fetchTestimonials failed:", error);
      return { error: "Something went wrong. Please try again." };
    }
    // Map DB columns to match Testimonial interface from database.ts
    const mapped = (data ?? []).map((t) => ({
      ...t,
      photo_url: t.student_photo_url,
      course_name: null,
      marks_or_rank: null,
      is_topper: false,
    }));
    return { data: mapped };
  } catch (err) {
    console.error("fetchTestimonials failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function createTestimonial(formData: FormData) {
  try {
    await assertAdmin(["super_admin", "support_staff"]);
    const supabase = await createClient();

    const studentName = formData.get("student_name") as string;
    if (!studentName?.trim()) return { error: "Student name is required" };

    const { count } = await supabase
      .from("testimonials")
      .select("id", { count: "exact", head: true });

    const yearVal = formData.get("year") as string;

    const { error } = await supabase.from("testimonials").insert({
      student_name: studentName.trim(),
      content: (formData.get("content") as string)?.trim() || null,
      video_url: (formData.get("video_url") as string)?.trim() || null,
      type: (formData.get("type") as string) || "text",
      year: yearVal?.trim() || String(new Date().getFullYear()),
      is_visible: true,
      weight: (count ?? 0) + 1,
    });

    if (error) {
      console.error("createTestimonial failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/students/testimonials");
    return { success: true };
  } catch (err) {
    console.error("createTestimonial failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function updateTestimonial(id: string, formData: FormData) {
  try {
    await assertAdmin(["super_admin", "support_staff"]);
    const supabase = await createClient();

    const yearVal = formData.get("year") as string;

    const { error } = await supabase
      .from("testimonials")
      .update({
        student_name: (formData.get("student_name") as string)?.trim(),
        content: (formData.get("content") as string)?.trim() || null,
        video_url: (formData.get("video_url") as string)?.trim() || null,
        type: (formData.get("type") as string) || "text",
        year: yearVal?.trim() || String(new Date().getFullYear()),
      })
      .eq("id", id);

    if (error) {
      console.error("updateTestimonial failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/students/testimonials");
    return { success: true };
  } catch (err) {
    console.error("updateTestimonial failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function toggleTestimonialVisibility(id: string, visible: boolean) {
  try {
    await assertAdmin(["super_admin", "support_staff"]);
    const supabase = await createClient();

    const { error } = await supabase
      .from("testimonials")
      .update({ is_visible: visible })
      .eq("id", id);

    if (error) {
      console.error("toggleTestimonialVisibility failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/students/testimonials");
    return { success: true };
  } catch (err) {
    console.error("toggleTestimonialVisibility failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function deleteTestimonial(id: string) {
  try {
    await assertAdmin(["super_admin"]);
    const supabase = await createClient();
    const { error } = await supabase.from("testimonials").delete().eq("id", id);

    if (error) {
      console.error("deleteTestimonial failed:", error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/students/testimonials");
    return { success: true };
  } catch (err) {
    console.error("deleteTestimonial failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}

export async function reorderTestimonials(orderedIds: string[]) {
  try {
    await assertAdmin(["super_admin", "support_staff"]);
    const supabase = await createClient();

    const updates = orderedIds.map((id, index) =>
      supabase.from("testimonials").update({ weight: index + 1 }).eq("id", id)
    );

    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);

    if (failed?.error) {
      console.error("reorderTestimonials failed:", failed.error);
      return { error: "Something went wrong. Please try again." };
    }

    revalidatePath("/admin/students/testimonials");
    return { success: true };
  } catch (err) {
    console.error("reorderTestimonials failed:", err);
    return { error: "You don't have permission to perform this action." };
  }
}
