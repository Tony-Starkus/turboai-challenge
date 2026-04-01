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
      state.status = 'ready';
      state.error = null;
    },
    updateNote(state, action: PayloadAction<Note>) {
      state.items = orderNotes(state.items.map((note) => (note.id === action.payload.id ? action.payload : note)));
      state.status = 'ready';
      state.error = null;
    },
    removeNote(state, action: PayloadAction<number>) {
      state.items = state.items.filter((note) => note.id !== action.payload);
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

function orderNotes(notes: Note[]) {
  return [...notes].sort(
    (left, right) => new Date(right.last_edited_at).getTime() - new Date(left.last_edited_at).getTime(),
  );
}
