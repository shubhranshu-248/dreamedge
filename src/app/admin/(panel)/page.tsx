import { getAdminSession } from "@/lib/admin";

export default async function AdminDashboardPage() {
  const admin = await getAdminSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {admin?.full_name?.split(" ")[0] ?? "Admin"}.
        </p>
      </div>

      {/* KPI Cards — placeholder for Step 8 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Students", value: "—" },
          { label: "Active Courses", value: "—" },
          { label: "Revenue (MTD)", value: "—" },
          { label: "Live Classes", value: "—" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-semibold mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground text-center py-8">
          Dashboard charts and activity feed will be added in the next step.
        </p>
      </div>
    </div>
  );
}
