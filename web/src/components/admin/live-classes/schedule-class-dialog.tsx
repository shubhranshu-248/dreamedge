"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { scheduleLiveClass } from "@/app/admin/(panel)/live-classes/actions";

interface ScheduleClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: { id: string; title: string; slug: string }[];
  teachers: { id: string; full_name: string; role: string }[];
}

function defaultScheduledAt(): string {
  // Default to next hour, local time, in the format <input type="datetime-local"> expects
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ScheduleClassDialog({
  open,
  onOpenChange,
  courses,
  teachers,
}: ScheduleClassDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [courseId, setCourseId] = useState("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [platform, setPlatform] = useState<"in_app" | "zoom" | "google_meet" | "youtube">("in_app");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (courseId) fd.set("course_id", courseId);
    if (teacherId) fd.set("teacher_id", teacherId);
    fd.set("platform", platform);

    startTransition(async () => {
      const result = await scheduleLiveClass(fd);
      if (!result.ok) {
        toast.error(result.error ?? "Could not schedule class");
        return;
      }
      toast.success("Class scheduled");
      form.reset();
      setCourseId("");
      setTeacherId("");
      setPlatform("in_app");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule a live class</DialogTitle>
          <DialogDescription>
            Enrolled students will see this in their upcoming classes list.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="course_id">Course</Label>
              <Select value={courseId} onValueChange={(v) => setCourseId(v ?? "")}>
                <SelectTrigger id="course_id">
                  <SelectValue placeholder="Pick a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                maxLength={200}
                placeholder="Lesson 3 — Linear equations"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                maxLength={2000}
                placeholder="What will you cover?"
              />
            </div>

            <div>
              <Label htmlFor="scheduled_at">Start time (IST)</Label>
              <Input
                id="scheduled_at"
                name="scheduled_at"
                type="datetime-local"
                required
                defaultValue={defaultScheduledAt()}
              />
            </div>

            <div>
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min={5}
                max={600}
                defaultValue={60}
                required
              />
            </div>

            <div>
              <Label htmlFor="teacher_id">Teacher</Label>
              <Select value={teacherId} onValueChange={(v) => setTeacherId(v ?? "")}>
                <SelectTrigger id="teacher_id">
                  <SelectValue placeholder="Pick a teacher (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={platform}
                onValueChange={(v) => setPlatform(v as typeof platform)}
              >
                <SelectTrigger id="platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_app">In-app</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="google_meet">Google Meet</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="meeting_url">Meeting URL (optional)</Label>
              <Input
                id="meeting_url"
                name="meeting_url"
                type="url"
                placeholder="https://meet.google.com/xxx-yyyy-zzz"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Leave blank for in-app classes. For Zoom / Meet, paste the full
                invite URL — students will see it when they join.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !courseId}
              className="bg-brand-orange text-white hover:bg-brand-orange-dark"
            >
              {isPending ? "Scheduling..." : "Schedule class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
