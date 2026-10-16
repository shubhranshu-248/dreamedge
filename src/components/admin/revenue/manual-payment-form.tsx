"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  searchStudentsForPayment,
  fetchPublishedCourses,
  recordManualPayment,
} from "@/app/admin/(panel)/revenue/actions";
import { formatINR } from "@/lib/format";

interface StudentOption {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
}

interface CourseOption {
  id: string;
  name: string;
  price: number;
  discount_price: number | null;
  validity_days: number;
}

export function ManualPaymentForm() {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [studentQuery, setStudentQuery] = useState("");
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [showStudentList, setShowStudentList] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSearching, startSearchTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const searchDebounce = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startTransition(async () => {
      const result = await fetchPublishedCourses();
      if (result.data) setCourses(result.data as CourseOption[]);
    });
  }, []);

  const searchStudents = useCallback((query: string) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!query.trim()) {
      setStudents([]);
      setShowStudentList(false);
      return;
    }
    searchDebounce.current = setTimeout(() => {
      startSearchTransition(async () => {
        const result = await searchStudentsForPayment(query);
        if (result.data) {
          setStudents(result.data);
          setShowStudentList(true);
        }
      });
    }, 300);
  }, []);

  function handleStudentSearch(value: string) {
    setStudentQuery(value);
    setSelectedStudent(null);
    searchStudents(value);
  }

  function selectStudent(student: StudentOption) {
    setSelectedStudent(student);
    setStudentQuery(student.full_name);
    setShowStudentList(false);
  }

  function handleCourseChange(courseId: string) {
    setSelectedCourse(courseId);
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      setAmount(String(course.discount_price ?? course.price));
    }
  }

  function handleSubmit() {
    if (!selectedStudent) {
      toast.error("Please select a student.");
      return;
    }
    if (!selectedCourse) {
      toast.error("Please select a course.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("student_id", selectedStudent.id);
      formData.set("course_id", selectedCourse);
      formData.set("amount", amount);
      formData.set("payment_method", paymentMethod);
      formData.set("reference", reference);
      formData.set("remarks", remarks);
      formData.set("payment_date", new Date(paymentDate).toISOString());

      const result = await recordManualPayment(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Payment recorded. Order ID: ${result.orderId?.slice(0, 8)}`);
      setSuccess(true);

      // Reset after a moment
      setTimeout(() => {
        setSelectedStudent(null);
        setStudentQuery("");
        setSelectedCourse("");
        setAmount("");
        setPaymentMethod("");
        setReference("");
        setRemarks("");
        setPaymentDate(new Date().toISOString().slice(0, 10));
        setSuccess(false);
      }, 2000);
    });
  }

  if (success) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <p className="text-lg font-semibold">Payment Recorded Successfully</p>
          <p className="text-sm text-muted-foreground">
            The student has been enrolled in the course.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Record Manual Payment</CardTitle>
        <CardDescription>
          Record an offline or cash payment and enroll the student.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Student Search */}
        <div className="space-y-2" ref={containerRef}>
          <Label>Student</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student by name, phone, or email..."
              value={studentQuery}
              onChange={(e) => handleStudentSearch(e.target.value)}
              className="pl-9"
            />
            {isSearching && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {showStudentList && students.length > 0 && (
            <div className="rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
              {students.map((s) => (
                <button
                  key={s.id}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                  onClick={() => selectStudent(s)}
                >
                  <p className="font-medium">{s.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[s.phone, s.email].filter(Boolean).join(" · ")}
                  </p>
                </button>
              ))}
            </div>
          )}
          {showStudentList && students.length === 0 && !isSearching && studentQuery.length >= 2 && (
            <p className="text-xs text-muted-foreground pl-1">No students found.</p>
          )}
          {selectedStudent && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 pl-1">
              Selected: {selectedStudent.full_name}
            </p>
          )}
        </div>

        {/* Course */}
        <div className="space-y-2">
          <Label>Course</Label>
          <Select value={selectedCourse} onValueChange={(v) => v && handleCourseChange(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} — {formatINR(c.discount_price ?? c.price)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="mp-amount">Amount Paid (₹)</Label>
          <Input
            id="mp-amount"
            type="number"
            min={1}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual_cash">Cash</SelectItem>
              <SelectItem value="manual_upi">UPI</SelectItem>
              <SelectItem value="manual_bank">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reference */}
        <div className="space-y-2">
          <Label htmlFor="mp-ref">Transaction Reference (optional)</Label>
          <Input
            id="mp-ref"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="UPI ref / bank transfer ID"
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="mp-date">Date of Payment</Label>
          <Input
            id="mp-date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
        </div>

        {/* Remarks */}
        <div className="space-y-2">
          <Label htmlFor="mp-remarks">Remarks (optional)</Label>
          <Textarea
            id="mp-remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Any additional notes..."
            rows={2}
          />
        </div>

        <Button onClick={handleSubmit} disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          Record Payment & Enroll Student
        </Button>
      </CardContent>
    </Card>
  );
}
