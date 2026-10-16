"use client";

import { FolderOpen, BookOpen, FileText, Video } from "lucide-react";
import { useContentTree } from "@/stores/content-tree";
import { SubjectForm } from "./subject-form";
import { TopicForm } from "./topic-form";
import { ContentItemForm } from "./content-item-form";
import type { Subject, Topic, ContentItem } from "@/types/database";

export function DetailPanel() {
  const { selectedNode, courseId } = useContentTree();

  if (!courseId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Select a course from the sidebar
          </p>
        </div>
      </div>
    );
  }

  if (!selectedNode) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Select an item from the tree to edit
          </p>
          <p className="text-xs text-muted-foreground">
            Click any subject, topic, or content item
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl">
        {selectedNode.kind === "subject" && (
          <SubjectForm
            key={selectedNode.id}
            subject={selectedNode.data as Subject}
          />
        )}
        {selectedNode.kind === "topic" && (
          <TopicForm
            key={selectedNode.id}
            topic={selectedNode.data as Topic}
          />
        )}
        {selectedNode.kind === "content" && (
          <ContentItemForm
            key={selectedNode.id}
            item={selectedNode.data as ContentItem}
          />
        )}
      </div>
    </div>
  );
}
