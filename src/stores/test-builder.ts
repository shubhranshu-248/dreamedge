import { create } from "zustand";
import type { QuestionType, Difficulty } from "@/types/database";
import type { Json } from "@/types/supabase";

export interface QuestionDraft {
  id: string;
  type: QuestionType | string;
  content: string;
  options: Json | null;
  correct_answer: Json | null;
  positive_marks: number;
  negative_marks: number;
  difficulty: Difficulty | string;
  topic_tag: string | null;
  image_url: string | null;
  hint: string | null;
  weight: number;
}

interface TestSettings {
  name: string;
  course_id: string;
  instructions: string;
  duration_minutes: number;
  max_attempts: number;
  pass_percentage: number;
  shuffle_questions: boolean;
  show_results_immediately: boolean;
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
  saveGeneration: number;
  lastSavedGeneration: number;

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
  markSaved: (generation: number) => void;
  reset: () => void;
}

const defaultSettings: TestSettings = {
  name: "Untitled Test",
  course_id: "",
  instructions: "",
  duration_minutes: 60,
  max_attempts: 1,
  pass_percentage: 40,
  shuffle_questions: false,
  show_results_immediately: true,
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
  saveGeneration: 0,
  lastSavedGeneration: 0,

  setTestId: (id) => set({ testId: id }),

  setSettings: (s) =>
    set((state) => ({
      settings: { ...state.settings, ...s },
      dirty: true,
      saveGeneration: state.saveGeneration + 1,
    })),

  setQuestions: (q) => set({ questions: q }),

  addQuestion: (q) =>
    set((state) => ({
      questions: [...state.questions, { ...q, weight: state.questions.length + 1 }],
      dirty: true,
      saveGeneration: state.saveGeneration + 1,
    })),

  updateQuestion: (id, updates) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
      dirty: true,
      saveGeneration: state.saveGeneration + 1,
    })),

  removeQuestion: (id) =>
    set((state) => ({
      questions: state.questions
        .filter((q) => q.id !== id)
        .map((q, i) => ({ ...q, weight: i + 1 })),
      dirty: true,
      saveGeneration: state.saveGeneration + 1,
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
      options: source.options
        ? JSON.parse(JSON.stringify(source.options))
        : null,
      weight: idx + 2,
    };
    const updated = [...state.questions];
    updated.splice(idx + 1, 0, clone);
    set({
      questions: updated.map((q, i) => ({ ...q, weight: i + 1 })),
      dirty: true,
      saveGeneration: state.saveGeneration + 1,
    });
  },

  moveQuestion: (fromIndex, toIndex) =>
    set((state) => {
      if (
        fromIndex < 0 || fromIndex >= state.questions.length ||
        toIndex < 0 || toIndex >= state.questions.length
      ) {
        return state;
      }
      const updated = [...state.questions];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return {
        questions: updated.map((q, i) => ({ ...q, weight: i + 1 })),
        dirty: true,
        saveGeneration: state.saveGeneration + 1,
      };
    }),

  setEditingQuestion: (id) => set({ editingQuestionId: id }),

  markDirty: () =>
    set((state) => ({ dirty: true, saveGeneration: state.saveGeneration + 1 })),

  markSaving: (saving) => set({ saving }),

  markSaved: (generation: number) =>
    set((state) => ({
      dirty: state.saveGeneration !== generation,
      saving: false,
      lastSaved: new Date(),
      lastSavedGeneration: generation,
    })),

  reset: () =>
    set({
      testId: null,
      settings: { ...defaultSettings },
      questions: [],
      dirty: false,
      saving: false,
      lastSaved: null,
      editingQuestionId: null,
      saveGeneration: 0,
      lastSavedGeneration: 0,
    }),
}));
