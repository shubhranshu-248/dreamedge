import type { Metadata } from "next";
import { requireStudent } from "@/lib/auth-student";
import { ProfileContent } from "@/components/student/profile/profile-content";

export const instant = false;

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function ProfilePage() {
  const student = await requireStudent();

  return <ProfileContent student={student} />;
}
