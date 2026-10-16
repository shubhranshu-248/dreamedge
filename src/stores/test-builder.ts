import { create } from "zustand";
import type { QuestionType, Difficulty } from "@/types/database";

export interface QuestionDraft {
  id: string;
  type: QuestionType;
  content: string;
  options: Record<string, unknown> | null;
  correct_answer: string | null;
  positive_marks: number;
  negative_marks: number;
  difficulty: Difficulty;
  topic_tag: string | null;
  image_url: string | null;
  hint: string | null;
  weight: number;
}

interface TestSettings {
  name: string;
  course_id: string;
  instructions: string;
  duration_min: number;
  max_attempts: number;
  pass_pct: number;
  shuffle: boolean;
  show_results: boolean;
  certificate_enabled: boolean;
  negative_marking: boolean;
}

interface TestBuilderState {
  testId: string | null;
  settings: TestSettings;
  questions: QuestionDraft[];
  dirty: boolean;
  saving: boolean;
  lastSaved: Date | null;
  editingQuestionId: string | null;

  setTestId: (id: string | null) => void;
  setSettings: (s: Partial<TestSettings>) => void;
  setQuestions: (q: QuestionDraft[]) => void;
  addQuestion: (q: QuestionDraft) => void;
  updateQuestion: (id: string, updates: Partial<QuestionDraft>) => void;
  removeQuestion: (id: string) => void;
  duplicateQuestion: (id: string) => void;
  moveQuestion: (fromIndex: number, toIndex: number) => void;
  setEditingQuestion: (id: string | null) => void;
  markDirty: () => void;
  markSaving: (saving: boolean) => void;
  markSaved: () => void;
  reset: () => void;
}

const defaultSettings: TestSettings = {
  name: "Untitled Test",
  course_id: "",
  instructions: "",
  duration_min: 60,
  max_attempts: 1,
  pass_pct: 40,
  shuffle: false,
  show_results: true,
  certificate_enabled: false,
  negative_marking: false,
};

function generateId() {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useTestBuilder = create<TestBuilderState>((set, get) => ({
  testId: null,
  settings: { ...defaultSettings },
  questions: [],
  dirty: false,
  saving: false,
  lastSaved: null,
  editingQuestionId: null,

  setTestId: (id) => set({ testId: id }),

  setSettings: (s) =>
    set((state) => ({
      settings: { ...state.settings, ...s },
      dirty: true,
    })),

  setQuestions: (q) => set({ questions: q }),

  addQuestion: (q) =>
    set((state) => ({
      questions: [...state.questions, { ...q, weight: state.questions.length + 1 }],
      dirty: true,
    })),

  updateQuestion: (id, updates) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
      dirty: true,
    })),

  removeQuestion: (id) =>
    set((state) => ({
      questions: state.questions
        .filter((q) => q.id !== id)
        .map((q, i) => ({ ...q, weight: i + 1 })),
      dirty: true,
      editingQuestionId:
        state.editingQuestionId === id ? null : state.editingQuestionId,
    })),

  duplicateQuestion: (id) => {
    const state = get();
    const source = state.questions.find((q) => q.id === id);
    if (!source) return;
    const idx = state.questions.indexOf(source);
    const clone: QuestionDraft = {
      ...source,
      id: generateId(),
      weight: idx + 2,
    };
    const updated = [...state.questions];
    updated.splice(idx + 1, 0, clone);
    set({
      questions: updated.map((q, i) => ({ ...q, weight: i + 1 })),
      dirty: true,
    });
  },

  moveQuestion: (fromIndex, toIndex) =>
    set((state) => {
      const updated = [...state.questions];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return {
        questions: updated.map((q, i) => ({ ...q, weight: i + 1 })),
        dirty: true,
      };
    }),

  setEditingQuestion: (id) => set({ editingQuestionId: id }),

  markDirty: () => set({ dirty: true }),
  markSaving: (saving) => set({ saving }),
  markSaved: () => set({ dirty: false, saving: false, lastSaved: new Date() }),
  reset: () =>
    set({
      testId: null,
      settings: { ...defaultSettings },
      questions: [],
      dirty: false,
      saving: false,
      lastSaved: null,
      editingQuestionId: null,
    }),
}));
