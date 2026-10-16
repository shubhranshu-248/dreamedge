"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search, Download, ChevronLeft, ChevronRight,
  Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAuditLog,
  exportAuditLog,
} from "@/app/admin/(panel)/settings/actions";
import type { AuditLogRow, AdminUserOption } from "@/app/admin/(panel)/settings/actions";
import { formatRelativeTime } from "@/lib/format";
import { DateRangeFilter } from "@/components/admin/revenue/date-range-filter";

interface AuditLogTableProps {
  initialData: AuditLogRow[];
  initialCount: number;
  adminUsers: AdminUserOption[];
}

const ENTITY_TYPES = [
  "course",
  "student",
  "order",
  "admin_user",
  "content_item",
  "test",
  "refund",
  "referral_code",
  "enrollment",
  "live_class",
  "role",
] as const;

const PAGE_SIZE = 20;

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) return `'${str}`;
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function AuditLogTable({
  initialData,
  initialCount,
  adminUsers,
}: AuditLogTableProps) {
  const [data, setData] = useState(initialData);
  const [count, setCount] = useState(initialCount);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userId, setUserId] = useState("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const requestIdRef = useRef(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const userMap = useRef<Record<string, string>>({});
  useEffect(() => {
    const map: Record<string, string> = {};
    adminUsers.forEach((u) => {
      map[u.user_id] = u.full_name;
    });
    userMap.current = map;
  }, [adminUsers]);

  const loadData = useCallback(
    (p: number, s: string, et: string, df: string, dt: string, uid: string) => {
      const requestId = ++requestIdRef.current;
      startTransition(async () => {
        const result = await getAuditLog(p, s, et, df, dt, uid);
        if (requestIdRef.current !== requestId) return;
        if (result.error) {
          toast.error(result.error);
          return;
        }
        setData(result.data ?? []);
        setCount(result.count);
      });
    },
    []
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      loadData(1, search, entityType, dateFrom, dateTo, userId);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, entityType, dateFrom, dateTo, userId, loadData]);

  function handlePageChange(newPage: number) {
    setPage(newPage);
    loadData(newPage, search, entityType, dateFrom, dateTo, userId);
  }

  async function handleExport() {
    const result = await exportAuditLog(search, entityType, dateFrom, dateTo, userId);
    if (result.error || !result.data) {
      toast.error(result.error ?? "Export failed");
      return;
    }

    const headers = [
      "Timestamp",
      "User",
      "Action",
      "Entity Type",
      "Entity ID",
      "IP Address",
      "Old Data",
      "New Data",
    ];
    const rows = result.data.map((r) =>
      [
        escapeCSV(new Date(r.created_at).toLocaleString("en-IN")),
        escapeCSV(r.user_id ? userMap.current[r.user_id] ?? r.user_id : "System"),
        escapeCSV(r.action),
        escapeCSV(r.entity_type),
        escapeCSV(r.entity_id),
        escapeCSV(r.ip_address),
        escapeCSV(r.old_data ? JSON.stringify(r.old_data) : ""),
        escapeCSV(r.new_data ? JSON.stringify(r.new_data) : ""),
      ].join(",")
    );

    const csv = "﻿" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  }

  const totalPages = Math.ceil(count / PAGE_SIZE);
  const showFrom = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showTo = Math.min(page * PAGE_SIZE, count);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by action or entity type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={entityType} onValueChange={(v) => v && setEntityType(v)}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Entity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ENTITY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={userId} onValueChange={(v) => v && setUserId(v)}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="User" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {adminUsers.map((u) => (
              <SelectItem key={u.id} value={u.user_id}>
                {u.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangeFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          presets={false}
        />
        <Button variant="outline" size="sm" onClick={handleExport} className="h-9">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead className="hidden md:table-cell">Entity ID</TableHead>
              <TableHead className="hidden lg:table-cell">IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <p className="text-muted-foreground">No audit log entries found.</p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((entry) => {
                const isExpanded = expandedRow === entry.id;
                const hasDetails = entry.old_data || entry.new_data;

                return (
                  <TableRow
                    key={entry.id}
                    className={hasDetails ? "cursor-pointer" : ""}
                    onClick={() => {
                      if (hasDetails) {
                        setExpandedRow(isExpanded ? null : entry.id);
                      }
                    }}
                  >
                    <TableCell className="w-10 px-2">
                      {hasDetails && (
                        isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )
                      )}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      <span title={new Date(entry.created_at).toLocaleString("en-IN")}>
                        {formatRelativeTime(entry.created_at)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.user_id
                        ? userMap.current[entry.user_id] ?? entry.user_id.slice(0, 8)
                        : "System"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal">
                        {entry.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.entity_type?.replace(/_/g, " ") ?? "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-mono">
                      {entry.entity_id?.slice(0, 8) ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {entry.ip_address ?? "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {expandedRow && (() => {
        const entry = data.find((e) => e.id === expandedRow);
        if (!entry) return null;
        return (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <p className="text-sm font-medium">Change Details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entry.old_data && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Previous Data
                  </p>
                  <pre className="text-xs bg-background rounded-md p-3 overflow-x-auto border max-h-64 overflow-y-auto">
                    {JSON.stringify(entry.old_data, null, 2)}
                  </pre>
                </div>
              )}
              {entry.new_data && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    New Data
                  </p>
                  <pre className="text-xs bg-background rounded-md p-3 overflow-x-auto border max-h-64 overflow-y-auto">
                    {JSON.stringify(entry.new_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {count > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {showFrom}–{showTo} of {count}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
