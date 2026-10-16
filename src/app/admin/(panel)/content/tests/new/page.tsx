import { TestBuilder } from "@/components/admin/tests/test-builder";
import { fetchCourses } from "../actions";

export const metadata = { title: "New Test — Dream Edge Admin" };

export default async function NewTestPage() {
  const result = await fetchCourses();
  const courses = result.data || [];

  return <TestBuilder courses={courses} />;
}
