"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, UserCheck, UserX, ShieldBan } from "lucide-react";

interface AnalyticsData {
  total: number;
  statusDistribution: { name: string; value: number }[];
  cityDistribution: { name: string; value: number }[];
  monthlyGrowth: { month: string; count: number }[];
  courseDistribution: { name: string; value: number }[];
}

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export function StudentAnalytics({ data }: { data: AnalyticsData }) {
  const active = data.statusDistribution.find((s) => s.name === "active")?.value ?? 0;
  const inactive = data.statusDistribution.find((s) => s.name === "inactive")?.value ?? 0;
  const blocked = data.statusDistribution.find((s) => s.name === "blocked")?.value ?? 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users} label="Total Students" value={data.total} />
        <KpiCard icon={UserCheck} label="Active" value={active} color="text-emerald-500" />
        <KpiCard icon={UserX} label="Inactive" value={inactive} color="text-amber-500" />
        <KpiCard icon={ShieldBan} label="Blocked" value={blocked} color="text-red-500" />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Student Growth */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Student Growth Over Time</h3>
          {data.monthlyGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                  tickFormatter={(v) => {
                    const [y, m] = v.split("-");
                    return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]} ${y.slice(2)}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-brand-orange)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-brand-orange)", r: 3 }}
                  name="New Students"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </Card>

        {/* Status Distribution */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Status Distribution</h3>
          {data.total > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.statusDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  formatter={(value: string) => value.charAt(0).toUpperCase() + value.slice(1)}
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </Card>

        {/* Geographic Distribution */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Top Cities</h3>
          {data.cityDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.cityDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" fill="var(--color-brand-orange)" radius={[0, 4, 4, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </Card>

        {/* Course-wise Enrollment */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Course-wise Enrollments</h3>
          {data.courseDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.courseDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" fill="var(--color-brand-blue)" radius={[4, 4, 0, 0]} name="Enrollments" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-muted ${color ?? ""}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
      No data available
    </div>
  );
}
