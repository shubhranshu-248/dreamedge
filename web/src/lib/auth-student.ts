import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getStudent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return student;
}

export async function requireStudent() {
  const student = await getStudent();
  if (!student) redirect("/login");
  return student;
}
