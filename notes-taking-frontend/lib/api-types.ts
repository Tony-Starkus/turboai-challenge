export const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8000';

export const NOTE_CATEGORIES = ['Random Thoughts', 'School', 'Personal'] as const;

export type NoteCategory = (typeof NOTE_CATEGORIES)[number];

export type User = {
  id: number;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: number;
  title: string;
  content: string;
  category: NoteCategory;
  user: number;
  created_at: string;
  last_edited_at: string;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type CreateUserPayload = {
  email: string;
  password: string;
};

export type NotePayload = {
  title: string;
  content: string;
  category: NoteCategory;
};

export type LoginResponse = {
  access: string;
  refresh: string;
  user: User;
};

export type RegisterResponse = {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
};

export type RefreshResponse = {
  access: string;
};
