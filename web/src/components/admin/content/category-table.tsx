"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/app/admin/(panel)/content/actions";

interface CategoryRow {
  id: string;
  name: string;
  thumbnail_url: string | null;
  weight: number;
  course_count: number;
}

export function CategoryTable({
  categories: initialCategories,
}: {
  categories: CategoryRow[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function openCreate() {
    setEditingId(null);
    setName("");
    setDialogOpen(true);
  }

  function openEdit(cat: CategoryRow) {
    setEditingId(cat.id);
    setName(cat.name);
    setDialogOpen(true);
  }

  function openDelete(cat: CategoryRow) {
    setDeleteTarget(cat);
    setDeleteOpen(true);
  }

  function handleSave() {
    if (!name.trim()) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name.trim());

      const result = editingId
        ? await updateCategory(editingId, formData)
        : await createCategory(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(editingId ? "Category updated" : "Category created");
      setDialogOpen(false);

      if (!editingId) {
        setCategories((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            name: name.trim(),
            thumbnail_url: null,
            weight: prev.length + 1,
            course_count: 0,
          },
        ]);
      } else {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, name: name.trim() } : c))
        );
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteCategory(deleteTarget.id);
      if (result.error) {
        toast.error(result.error);
        setDeleteOpen(false);
        return;
      }

      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteOpen(false);
    });
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    setCategories(reordered);
    setDragIndex(index);
  }

  function handleDragEnd() {
    if (dragIndex === null) return;
    setDragIndex(null);

    startTransition(async () => {
      const ids = categories.map((c) => c.id);
      const result = await reorderCategories(ids);
      if (result.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categories</h2>
        <Button
          size="sm"
          onClick={openCreate}
          className="bg-brand-orange hover:bg-brand-orange-dark text-white"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center">
          <p className="text-sm font-medium">No categories yet</p>
          <p className="text-xs text-muted-foreground">
            Create categories to organize your courses
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={openCreate}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create first category
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Name</TableHead>
                <TableHead className="w-32 text-right">Courses</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat, index) => (
                <TableRow
                  key={cat.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {cat.course_count}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(cat)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-500"
                        onClick={() => openDelete(cat)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mathematics"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending || !name.trim()}
              className="bg-brand-orange hover:bg-brand-orange-dark text-white"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete &ldquo;{deleteTarget?.name}&rdquo;.
            Categories with courses cannot be deleted.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
