import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme, Category, Note } from '../types';

interface AppState {
  themes: Theme[];
  categories: Category[];
  notes: Note[];
  selectedNoteId: string | null;
  selectedThemeId: string | null;
  selectedCategoryId: string | null;

  // Actions
  addTheme: (name: string, icon: string) => void;
  updateTheme: (id: string, name: string, icon: string) => void;
  deleteTheme: (id: string) => void;
  toggleThemeFavorite: (id: string) => void;
  reorderThemes: (themes: Theme[]) => void;

  addCategory: (themeId: string, name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;

  addNote: (categoryId: string, title: string) => string;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
  moveNote: (noteId: string, targetCategoryId: string) => void;
  
  setSelectedNote: (id: string | null) => void;
  setSelectedTheme: (id: string | null) => void;
  setSelectedCategory: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      themes: [],
      categories: [],
      notes: [],
      selectedNoteId: null,
      selectedThemeId: null,
      selectedCategoryId: null,

      addTheme: (name, icon) => set((state) => {
        const id = crypto.randomUUID();
        const maxOrder = state.themes.reduce((max, t) => Math.max(max, t.order || 0), -1);
        return { 
          themes: [...state.themes, { id, name, icon, order: maxOrder + 1, isFavorite: false }] 
        };
      }),
      updateTheme: (id, name, icon) => set((state) => ({
        themes: state.themes.map((t) => (t.id === id ? { ...t, name, icon } : t)),
      })),
      deleteTheme: (id) => set((state) => ({
        themes: state.themes.filter((t) => t.id !== id),
        categories: state.categories.filter((c) => c.themeId !== id),
        notes: state.notes.filter((n) => !state.categories.find(c => c.id === n.categoryId && c.themeId === id)),
        selectedThemeId: state.selectedThemeId === id ? null : state.selectedThemeId
      })),
      toggleThemeFavorite: (id) => set((state) => ({
        themes: state.themes.map((t) => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t)
      })),
      reorderThemes: (themes) => set({ themes }),

      addCategory: (themeId, name) => set((state) => {
        const id = crypto.randomUUID();
        return { categories: [...state.categories, { id, themeId, name }] };
      }),
      updateCategory: (id, name) => set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? { ...c, name } : c)),
      })),
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        notes: state.notes.filter((n) => n.categoryId !== id),
        selectedCategoryId: state.selectedCategoryId === id ? null : state.selectedCategoryId
      })),

      addNote: (categoryId, title) => {
        const id = crypto.randomUUID();
        const now = Date.now();
        const newNote: Note = {
          id,
          categoryId,
          title,
          content: '',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ notes: [...state.notes, newNote] }));
        return id;
      },
      updateNote: (id, title, content) => set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, title, content, updatedAt: Date.now() } : n
        ),
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId
      })),
      moveNote: (noteId, targetCategoryId) => set((state) => ({
        notes: state.notes.map((n) =>
          n.id === noteId ? { ...n, categoryId: targetCategoryId, updatedAt: Date.now() } : n
        ),
      })),

      setSelectedNote: (id) => set({ selectedNoteId: id }),
      setSelectedTheme: (id) => set({ selectedThemeId: id }),
      setSelectedCategory: (id) => set({ selectedCategoryId: id }),
    }),
    {
      name: 'mapp-mental-storage',
    }
  )
);
