"use client";

import { TreeView } from "./tree-view";
import { DetailPanel } from "./detail-panel";
import type { Course } from "@/types/database";

interface Props {
  courses: Pick<Course, "id" | "name" | "status">[];
}

export function ContentManagerClient({ courses }: Props) {
  return (
    <div className="flex h-[calc(100vh-65px)] -m-4 lg:-m-6">
      {/* Tree panel */}
      <div className="w-72 shrink-0 lg:w-80">
        <TreeView courses={courses} />
      </div>

      {/* Detail panel */}
      <div className="flex-1 border-l border-border bg-background">
        <DetailPanel />
      </div>
    </div>
  );
}
