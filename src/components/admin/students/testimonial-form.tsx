"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createTestimonial,
  updateTestimonial,
} from "@/app/admin/(panel)/students/actions";
import type { Testimonial } from "@/types/database";

interface TestimonialFormDialogProps {
  open: boolean;
  onClose: () => void;
  editData?: Testimonial | null;
}

export function TestimonialFormDialog({
  open,
  onClose,
  editData,
}: TestimonialFormDialogProps) {
  const [type, setType] = useState(editData?.type ?? "text");
  const [isTopper, setIsTopper] = useState(editData?.is_topper ?? false);
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("type", type);
    formData.set("is_topper", isTopper.toString());

    startTransition(async () => {
      const result = editData
        ? await updateTestimonial(editData.id, formData)
        : await createTestimonial(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(editData ? "Testimonial updated" : "Testimonial added");
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-popover rounded-lg border border-border shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {editData ? "Edit Testimonial" : "Add Testimonial"}
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="t-name">Student Name *</Label>
                  <Input
                    id="t-name"
                    name="student_name"
                    required
                    defaultValue={editData?.student_name ?? ""}
                  />
                </div>

                <div>
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => v && setType(v as "text" | "video")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {type === "text" ? (
                  <div>
                    <Label htmlFor="t-content">Content</Label>
                    <Textarea
                      id="t-content"
                      name="content"
                      rows={4}
                      defaultValue={editData?.content ?? ""}
                      placeholder="What the student said..."
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="t-video">Video URL</Label>
                    <Input
                      id="t-video"
                      name="video_url"
                      defaultValue={editData?.video_url ?? ""}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="t-year">Year</Label>
                    <Input
                      id="t-year"
                      name="year"
                      type="number"
                      defaultValue={editData?.year ?? new Date().getFullYear()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="t-course">Course</Label>
                    <Input
                      id="t-course"
                      name="course_name"
                      defaultValue={editData?.course_name ?? ""}
                      placeholder="e.g. Class 9 Maths"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="t-marks">Marks / Rank</Label>
                  <Input
                    id="t-marks"
                    name="marks_or_rank"
                    defaultValue={editData?.marks_or_rank ?? ""}
                    placeholder="e.g. 98% or AIR 245"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={isTopper}
                    onCheckedChange={setIsTopper}
                  />
                  <Label>Mark as Topper</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-brand-orange hover:bg-brand-orange-dark text-white"
                disabled={isPending}
              >
                {isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
                {editData ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
