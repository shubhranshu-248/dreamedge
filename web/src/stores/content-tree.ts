import { create } from "zustand";
import type { Subject, Topic, ContentItem, ContentType, ContentStatus } from "@/types/database";

export type NodeKind = "subject" | "topic" | "content";

export interface TreeNode {
  id: string;
  kind: NodeKind;
  name: string;
  weight: number;
  status?: string;
  contentType?: string;
  children: TreeNode[];
  data: Subject | Topic | ContentItem;
}

interface SelectedNode {
  id: string;
  kind: NodeKind;
  data: Subject | Topic | ContentItem;
}

interface ContentTreeState {
  courseId: string | null;
  tree: TreeNode[];
  expandedIds: Set<string>;
  selectedNode: SelectedNode | null;
  searchQuery: string;
  typeFilter: ContentType | "all";
  statusFilter: ContentStatus | "all";
  loading: boolean;

  setCourseId: (id: string | null) => void;
  setTree: (tree: TreeNode[]) => void;
  toggleExpand: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  selectNode: (node: SelectedNode | null) => void;
  setSearchQuery: (q: string) => void;
  setTypeFilter: (t: ContentType | "all") => void;
  setStatusFilter: (s: ContentStatus | "all") => void;
  setLoading: (l: boolean) => void;

  addSubject: (subject: Subject) => void;
  updateSubject: (subject: Subject) => void;
  removeSubject: (id: string) => void;

  addTopic: (subjectId: string, topic: Topic) => void;
  updateTopic: (topic: Topic) => void;
  removeTopic: (id: string) => void;

  addContentItem: (topicId: string, item: ContentItem) => void;
  updateContentItem: (item: ContentItem) => void;
  removeContentItem: (id: string) => void;

  reorderChildren: (parentId: string | null, orderedIds: string[]) => void;
}

function collectAllIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    ids.push(node.id);
    if (node.children.length > 0) {
      ids.push(...collectAllIds(node.children));
    }
  }
  return ids;
}

export const useContentTree = create<ContentTreeState>((set, _get) => ({
  courseId: null,
  tree: [],
  expandedIds: new Set<string>(),
  selectedNode: null,
  searchQuery: "",
  typeFilter: "all",
  statusFilter: "all",
  loading: false,

  setCourseId: (id) => set({ courseId: id, tree: [], selectedNode: null }),
  setTree: (tree) => set({ tree }),
  toggleExpand: (id) =>
    set((state) => {
      const next = new Set(state.expandedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expandedIds: next };
    }),
  expandAll: () =>
    set((state) => ({
      expandedIds: new Set(collectAllIds(state.tree)),
    })),
  collapseAll: () => set({ expandedIds: new Set() }),
  selectNode: (node) => set({ selectedNode: node }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setTypeFilter: (t) => set({ typeFilter: t }),
  setStatusFilter: (s) => set({ statusFilter: s }),
  setLoading: (l) => set({ loading: l }),

  addSubject: (subject) =>
    set((state) => ({
      tree: [
        ...state.tree,
        {
          id: subject.id,
          kind: "subject",
          name: subject.name,
          weight: subject.weight,
          children: [],
          data: subject,
        },
      ],
    })),

  updateSubject: (subject) =>
    set((state) => ({
      tree: state.tree.map((node) =>
        node.id === subject.id
          ? { ...node, name: subject.name, data: subject }
          : node
      ),
      selectedNode:
        state.selectedNode?.id === subject.id
          ? { ...state.selectedNode, data: subject }
          : state.selectedNode,
    })),

  removeSubject: (id) =>
    set((state) => ({
      tree: state.tree.filter((n) => n.id !== id),
      selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
    })),

  addTopic: (subjectId, topic) =>
    set((state) => ({
      tree: state.tree.map((subj) =>
        subj.id === subjectId
          ? {
              ...subj,
              children: [
                ...subj.children,
                {
                  id: topic.id,
                  kind: "topic" as const,
                  name: topic.name,
                  weight: topic.weight,
                  children: [],
                  data: topic,
                },
              ],
            }
          : subj
      ),
    })),

  updateTopic: (topic) =>
    set((state) => ({
      tree: state.tree.map((subj) => ({
        ...subj,
        children: subj.children.map((t) =>
          t.id === topic.id ? { ...t, name: topic.name, data: topic } : t
        ),
      })),
      selectedNode:
        state.selectedNode?.id === topic.id
          ? { ...state.selectedNode, data: topic }
          : state.selectedNode,
    })),

  removeTopic: (id) =>
    set((state) => ({
      tree: state.tree.map((subj) => ({
        ...subj,
        children: subj.children.filter((t) => t.id !== id),
      })),
      selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
    })),

  addContentItem: (topicId, item) =>
    set((state) => ({
      tree: state.tree.map((subj) => ({
        ...subj,
        children: subj.children.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                children: [
                  ...topic.children,
                  {
                    id: item.id,
                    kind: "content" as const,
                    name: item.title,
                    weight: item.weight,
                    status: item.status,
                    contentType: item.type,
                    children: [],
                    data: item,
                  },
                ],
              }
            : topic
        ),
      })),
    })),

  updateContentItem: (item) =>
    set((state) => ({
      tree: state.tree.map((subj) => ({
        ...subj,
        children: subj.children.map((topic) => ({
          ...topic,
          children: topic.children.map((c) =>
            c.id === item.id
              ? {
                  ...c,
                  name: item.title,
                  status: item.status,
                  contentType: item.type,
                  data: item,
                }
              : c
          ),
        })),
      })),
      selectedNode:
        state.selectedNode?.id === item.id
          ? { ...state.selectedNode, data: item }
          : state.selectedNode,
    })),

  removeContentItem: (id) =>
    set((state) => ({
      tree: state.tree.map((subj) => ({
        ...subj,
        children: subj.children.map((topic) => ({
          ...topic,
          children: topic.children.filter((c) => c.id !== id),
        })),
      })),
      selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
    })),

  reorderChildren: (parentId, orderedIds) =>
    set((state) => {
      function sortAndWeight(nodes: TreeNode[], ids: string[]): TreeNode[] {
        return ids
          .map((id) => nodes.find((n) => n.id === id)!)
          .filter(Boolean)
          .map((node, idx) => ({ ...node, weight: idx }));
      }

      if (parentId === null) {
        return { tree: sortAndWeight(state.tree, orderedIds) };
      }

      return {
        tree: state.tree.map((subj) => {
          if (subj.id === parentId) {
            return { ...subj, children: sortAndWeight(subj.children, orderedIds) };
          }
          return {
            ...subj,
            children: subj.children.map((topic) => {
              if (topic.id === parentId) {
                return { ...topic, children: sortAndWeight(topic.children, orderedIds) };
              }
              return topic;
            }),
          };
        }),
      };
    }),
}));
