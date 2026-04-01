import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Note, NoteCategory } from '@/lib/api';

type NotesStatus = 'idle' | 'loading' | 'ready' | 'error';

type NotesState = {
  items: Note[];
  status: NotesStatus;
  error: string | null;
  categories: Array<{
    key: string;
    label: string;
    value: NoteCategory;
    color: string;
    count: number;
  }>;
};

const initialState: NotesState = {
  items: [],
  status: 'idle',
  error: null,
  categories: [],
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    beginNotesLoading(state) {
      state.status = 'loading';
      state.error = null;
    },
    setNotes(state, action: PayloadAction<Note[]>) {
      state.items = orderNotes(action.payload);
      state.status = 'ready';
      state.error = null;
    },
    setNotesError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    addNote(state, action: PayloadAction<Note>) {
      state.items = orderNotes([action.payload, ...state.items]);
      // increment category count if present
      const cat = state.categories.find((c) => c.value === action.payload.category);
      if (cat) cat.count = Math.max(0, cat.count + 1);
      state.status = 'ready';
      state.error = null;
    },
    updateNote(state, action: PayloadAction<Note>) {
      // find previous note to adjust category counts if category changed
      const prev = state.items.find((n) => n.id === action.payload.id) ?? null;
      if (prev && prev.category !== action.payload.category) {
        const prevCat = state.categories.find((c) => c.value === prev.category);
        if (prevCat) prevCat.count = Math.max(0, prevCat.count - 1);
        const newCat = state.categories.find((c) => c.value === action.payload.category);
        if (newCat) newCat.count = Math.max(0, newCat.count + 1);
      }

      state.items = orderNotes(state.items.map((note) => (note.id === action.payload.id ? action.payload : note)));
      state.status = 'ready';
      state.error = null;
    },
    removeNote(state, action: PayloadAction<number>) {
      const removed = state.items.find((note) => note.id === action.payload) ?? null;
      state.items = state.items.filter((note) => note.id !== action.payload);
      if (removed) {
        const cat = state.categories.find((c) => c.value === removed.category);
        if (cat) cat.count = Math.max(0, cat.count - 1);
      }
      state.status = 'ready';
      state.error = null;
    },
    clearNotes(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
    setCategories(
      state,
      action: PayloadAction<Array<{ key: string; label: string; value: string; color?: string | null; count: number }>>,
    ) {
      state.categories = action.payload;
    },
    clearCategories(state) {
      state.categories = [];
    },
  },
});

export const {
  addNote,
  beginNotesLoading,
  clearNotes,
  setCategories,
  clearCategories,
  removeNote,
  setNotes,
  setNotesError,
  updateNote,
} = notesSlice.actions;

export default notesSlice.reducer;

export const getCategories = (state: { notes: NotesState }) => state.notes.categories;
export const getNotes = (state: { notes: NotesState }) => state.notes.items;
export const getNotesStatus = (state: { notes: NotesState }) => state.notes.status;
export const getNotesError = (state: { notes: NotesState }) => state.notes.error;

function orderNotes(notes: Note[]) {
  return [...notes].sort(
    (left, right) => new Date(right.last_edited_at).getTime() - new Date(left.last_edited_at).getTime(),
  );
}
