export interface Note {
  id: string;
  title: string;
  content: string; // Tiptap JSON content as string
  categoryId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  themeId: string;
}

export interface Theme {
  id: string;
  name: string;
  icon: string;
}
