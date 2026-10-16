import { createClient } from "@/lib/supabase/server";
import { CategoryTable } from "@/components/admin/content/category-table";

async function getCategoriesWithCounts() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("course_categories")
    .select("id, name, thumbnail_url, weight")
    .order("weight");

  if (!categories || categories.length === 0) {
    return [];
  }

  const counts = await Promise.all(
    categories.map(async (cat) => {
      const { count } = await supabase
        .from("courses")
        .select("id", { count: "exact", head: true })
        .eq("category_id", cat.id);
      return { ...cat, course_count: count || 0 };
    })
  );

  return counts;
}

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Organize courses into categories. Drag to reorder.
        </p>
      </div>

      <CategoryTable categories={categories} />
    </div>
  );
}
