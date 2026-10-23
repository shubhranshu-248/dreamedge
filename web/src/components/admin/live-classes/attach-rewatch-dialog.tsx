"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  attachRewatchContent,
  listRewatchableContentItems,
  type LiveClassRow,
} from "@/app/admin/(panel)/live-classes/actions";

interface AttachRewatchDialogProps {
  liveClass: LiveClassRow | null;
  onOpenChange: (open: boolean) => void;
}

type ContentItem = Awaited<ReturnType<typeof listRewatchableContentItems>>[number];

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function AttachRewatchDialog({
  liveClass,
  onOpenChange,
}: AttachRewatchDialogProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, startLoadTransition] = useTransition();
  const [saving, startSaveTransition] = useTransition();

  useEffect(() => {
    if (!liveClass) {
      startLoadTransition(() => {
        setItems([]);
        setSelected("");
      });
      return;
    }
    startLoadTransition(async () => {
      const data = await listRewatchableContentItems(liveClass.course_id);
      setItems(data);
      setSelected("");
    });
  }, [liveClass]);

  function handleAttach() {
    if (!liveClass || !selected) return;
    startSaveTransition(async () => {
      const result = await attachRewatchContent(liveClass.id, selected);
      if (!result.ok) {
        toast.error(result.error ?? "Could not attach rewatch");
        return;
      }
      toast.success("Rewatch attached — students can now watch the recording");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={!!liveClass} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Attach rewatch recording</DialogTitle>
          <DialogDescription>
            {liveClass ? (
              <>
                Link an uploaded video to <strong>{liveClass.title}</strong>.
                Students who are enrolled in the course will see it in the
                lesson list immediately.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto rounded-lg border border-border">
          {loading ? (
            <div className="space-y-2 p-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <Film className="mx-auto h-8 w-8 opacity-40" />
              <p className="mt-2">
                No uploaded videos found for this course yet.
              </p>
              <p className="mt-1 text-xs">
                Upload the edited recording via{" "}
                <strong>Content → Manager</strong> first, then come back here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-muted/50">
                    <input
                      type="radio"
                      name="rewatch"
                      value={item.id}
                      checked={selected === item.id}
                      onChange={() => setSelected(item.id)}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Uploaded {dateFmt.format(new Date(item.created_at))}
                      </p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!selected || saving}
            onClick={handleAttach}
            className="bg-brand-orange text-white hover:bg-brand-orange-dark"
          >
            {saving ? "Attaching..." : "Attach rewatch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
