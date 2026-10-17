"use server";

import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

interface ActionResult<T = unknown> {
  data?: T;
  error?: string;
}

async function getAuthenticatedStudent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Please log in to continue" };

  const { data: student } = await supabase
    .from("students")
    .select("id, user_id, email")
    .eq("user_id", user.id)
    .single();

  if (!student) return { error: "Student profile not found" };

  return { user, student };
}

export async function enrollFree(
  courseId: string
): Promise<ActionResult<{ enrolled: boolean }>> {
  try {
    const auth = await getAuthenticatedStudent();
    if ("error" in auth) return { error: auth.error };
    const { student } = auth;

    const service = createServiceClient();

    const { data: course, error: courseError } = await service
      .from("courses")
      .select("id, price, is_published")
      .eq("id", courseId)
      .single();

    if (courseError) return { error: "Course not found" };
    if (!course) return { error: "Course not found" };
    if (!course.is_published) return { error: "Course is not available" };
    if (Number(course.price) !== 0) return { error: "This is a paid course" };

    const { data: existing } = await service
      .from("enrollments")
      .select("id")
      .eq("student_id", student.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existing) return { error: "Already enrolled in this course" };

    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    const { error: insertError } = await service.from("enrollments").insert({
      student_id: student.id,
      course_id: courseId,
      status: "active",
      valid_until: validUntil.toISOString(),
    });

    if (insertError) {
      return { error: "Failed to enroll. Please try again." };
    }

    const { data: courseData } = await service
      .from("courses")
      .select("student_count")
      .eq("id", courseId)
      .single();

    if (courseData) {
      await service
        .from("courses")
        .update({ student_count: (courseData.student_count || 0) + 1 })
        .eq("id", courseId);
    }

    return { data: { enrolled: true } };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

export async function createPaymentOrder(
  courseId: string
): Promise<
  ActionResult<{
    orderId: string;
    amount: number;
    currency: string;
    key: string;
  }>
> {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!keyId || !keySecret || !publicKey) {
      return { error: "Payment system is not configured yet." };
    }

    const auth = await getAuthenticatedStudent();
    if ("error" in auth) return { error: auth.error };
    const { student } = auth;

    const service = createServiceClient();

    const { data: course } = await service
      .from("courses")
      .select("id, title, price, is_published")
      .eq("id", courseId)
      .single();

    if (!course) return { error: "Course not found" };
    if (!course.is_published) return { error: "Course is not available" };
    if (Number(course.price) <= 0) return { error: "This course is free" };

    const { data: existing } = await service
      .from("enrollments")
      .select("id")
      .eq("student_id", student.id)
      .eq("course_id", courseId)
      .eq("status", "active")
      .maybeSingle();

    if (existing) return { error: "Already enrolled in this course" };

    const amountInPaise = Math.round(Number(course.price) * 100);
    const receipt = `enroll_${student.id.slice(0, 8)}_${courseId.slice(0, 8)}`;

    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt,
        notes: {
          student_id: student.id,
          course_id: courseId,
          student_email: student.email || "",
        },
      }),
    });

    if (!response.ok) {
      return { error: "Could not create payment order. Please try again." };
    }

    const order = await response.json();

    const paidValidUntil = new Date();
    paidValidUntil.setFullYear(paidValidUntil.getFullYear() + 1);

    await service
      .from("enrollments")
      .upsert(
        {
          student_id: student.id,
          course_id: courseId,
          status: "active",
          payment_status: "pending",
          payment_order_id: order.id,
          payment_amount: Number(course.price),
          valid_until: paidValidUntil.toISOString(),
        },
        { onConflict: "student_id,course_id" }
      );

    return {
      data: {
        orderId: order.id,
        amount: amountInPaise,
        currency: "INR",
        key: publicKey,
      },
    };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

export async function verifyPayment(paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  courseId: string;
}): Promise<ActionResult<{ enrolled: boolean }>> {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const keyId = process.env.RAZORPAY_KEY_ID;

    if (!keySecret || !keyId) {
      return { error: "Payment system is not configured." };
    }

    const auth = await getAuthenticatedStudent();
    if ("error" in auth) return { error: auth.error };

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${paymentData.razorpay_order_id}|${paymentData.razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== paymentData.razorpay_signature) {
      return { error: "Payment verification failed. Please contact support." };
    }

    const service = createServiceClient();

    // Fetch payment method from Razorpay
    let paymentMethod: string | null = null;
    try {
      const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const res = await fetch(
        `https://api.razorpay.com/v1/payments/${paymentData.razorpay_payment_id}`,
        { headers: { Authorization: `Basic ${credentials}` } }
      );
      if (res.ok) {
        const paymentInfo = await res.json();
        paymentMethod = paymentInfo.method || null;
      }
    } catch {
      // Non-critical — enrollment still succeeds
    }

    const { error: updateError } = await service
      .from("enrollments")
      .update({
        status: "active",
        payment_status: "paid",
        payment_id: paymentData.razorpay_payment_id,
        payment_method: paymentMethod,
        purchased_at: new Date().toISOString(),
      })
      .eq("student_id", auth.student.id)
      .eq("course_id", paymentData.courseId);

    if (updateError) {
      return { error: "Failed to confirm enrollment. Please contact support." };
    }

    const { data: courseData } = await service
      .from("courses")
      .select("student_count")
      .eq("id", paymentData.courseId)
      .single();

    if (courseData) {
      await service
        .from("courses")
        .update({ student_count: (courseData.student_count || 0) + 1 })
        .eq("id", paymentData.courseId);
    }

    return { data: { enrolled: true } };
  } catch {
    return { error: "Something went wrong. Please contact support." };
  }
}
