"use client";

import { useState, memo } from "react";
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  FileText,
  Video,
  FileCheck,
  Notebook,
  BookMarked,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { TreeNode as TreeNodeType, NodeKind } from "@/stores/content-tree";
import type { ContentType } from "@/types/database";

const contentTypeIcons: Record<ContentType, React.ElementType> = {
  video: Video,
  pdf: FileText,
  note: Notebook,
  ebook: BookMarked,
  pyp: FileCheck,
  quiz: FileCheck,
};

const kindIcons: Record<NodeKind, React.ElementType> = {
  subject: BookOpen,
  topic: FileText,
  content: Video,
};

function getIcon(node: TreeNodeType) {
  if (node.kind === "content" && node.contentType) {
    return contentTypeIcons[node.contentType] || FileText;
  }
  return kindIcons[node.kind];
}

interface TreeNodeProps {
  node: TreeNodeType;
  depth: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onAdd?: (kind: NodeKind) => void;
  onRename?: () => void;
  onDelete?: () => void;
}

export const TreeNodeRow = memo(function TreeNodeRow({
  node,
  depth,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}: TreeNodeProps) {
  const hasChildren = node.kind !== "content";
  const Icon = getIcon(node);
  const isDraft = node.status === "draft";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const childKind: NodeKind | null =
    node.kind === "subject" ? "topic" : node.kind === "topic" ? "content" : null;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group flex items-center gap-1 rounded-md px-1.5 py-1 text-sm transition-colors cursor-pointer select-none",
        isSelected
          ? "bg-brand-orange/10 text-brand-orange"
          : "text-foreground hover:bg-muted",
        isDragging && "opacity-50",
        isDraft && !isSelected && "text-muted-foreground"
      )}
      style={{ ...style, paddingLeft: `${depth * 16 + 4}px` }}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab opacity-0 group-hover:opacity-60 hover:opacity-100 active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Expand/collapse toggle */}
      {hasChildren ? (
        <button
          className="shrink-0 p-0.5"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      ) : (
        <span className="w-5 shrink-0" />
      )}

      {/* Icon */}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          node.kind === "subject" && "text-indigo-500",
          node.kind === "topic" && "text-amber-500",
          node.kind === "content" && "text-sky-500"
        )}
      />

      {/* Name */}
      <span className="min-w-0 flex-1 truncate text-xs font-medium">
        {node.name}
      </span>

      {/* Content count badge */}
      {hasChildren && node.children.length > 0 && (
        <Badge
          variant="secondary"
          className="h-4 px-1 text-[10px] font-normal shrink-0"
        >
          {node.children.length}
        </Badge>
      )}

      {/* Status indicator */}
      {isDraft && (
        <Badge
          variant="outline"
          className="h-4 px-1 text-[10px] border-zinc-400/30 text-zinc-500 shrink-0"
        >
          Draft
        </Badge>
      )}

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 shrink-0"
            />
          }
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4}>
          {childKind && onAdd && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onAdd(childKind);
              }}
            >
              <Plus className="mr-2 h-3.5 w-3.5" />
              Add {childKind === "topic" ? "Topic" : "Content"}
            </DropdownMenuItem>
          )}
          {onRename && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onRename();
              }}
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Rename
            </DropdownMenuItem>
          )}
          {(childKind || onRename) && onDelete && <DropdownMenuSeparator />}
          {onDelete && (
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});
