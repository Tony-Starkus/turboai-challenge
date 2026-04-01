import type { CreateUserPayload, LoginPayload, NotePayload, Session } from '@/lib/api-types';
import { NOTE_CATEGORIES, type Note, type NoteCategory, type User } from '@/lib/api-types';
import { ApiError, getErrorMessage, isUnauthorizedError, isApiError } from '@/lib/api-error';
import { clearStoredSession, persistSession, readStoredSession } from '@/lib/session-storage';
import { createNoteRequest, deleteNoteRequest, listNoteRequest, updateNoteRequest } from '@/services/note';
import { createUserRequest, getCurrentUserRequest, loginUserRequest, refreshTokenRequest } from '@/services/user';

export const API_BASE_URL = '/api';

export {
  ApiError,
  NOTE_CATEGORIES,
  clearStoredSession,
  getErrorMessage,
  isUnauthorizedError,
  isApiError,
  persistSession,
  readStoredSession,
};

export type { Note, NoteCategory, Session, User };

export async function loginUser(payload: LoginPayload): Promise<Session> {
  const response = await loginUserRequest(payload);

  return {
    accessToken: response.access,
    refreshToken: response.refresh,
    user: response.user,
  };
}

export async function registerUser(payload: CreateUserPayload): Promise<Session> {
  const response = await createUserRequest(payload);

  return {
    accessToken: response.tokens.access,
    refreshToken: response.tokens.refresh,
    user: response.user,
  };
}

export function getCurrentUser(accessToken?: string) {
  return getCurrentUserRequest(accessToken);
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await refreshTokenRequest(refreshToken);
  return response.access;
}

export function listNotes(accessToken?: string) {
  return listNoteRequest(accessToken);
}

export function createNote(accessToken: string, payload: NotePayload) {
  return createNoteRequest(payload, accessToken);
}

export function updateNote(accessToken: string, noteId: number, payload: Partial<NotePayload>) {
  return updateNoteRequest(noteId, payload, accessToken);
}

export function deleteNote(accessToken: string, noteId: number) {
  return deleteNoteRequest(noteId, accessToken);
}

export async function rehydrateSession(session: Session): Promise<Session> {
  try {
    const user = await getCurrentUser(session.accessToken);
    return { ...session, user };
  } catch (error) {
    if (!isUnauthorizedError(error)) {
      throw error;
    }
  }

  const nextAccessToken = await refreshAccessToken(session.refreshToken);
  const user = await getCurrentUser(nextAccessToken);

  return {
    ...session,
    accessToken: nextAccessToken,
    user,
  };
}

export async function runWithFreshSession<T>(
  session: Session,
  request: (accessToken: string) => Promise<T>,
): Promise<{ data: T; session: Session }> {
  try {
    return {
      data: await request(session.accessToken),
      session,
    };
  } catch (error) {
    if (!isUnauthorizedError(error)) {
      throw error;
    }
  }

  const nextAccessToken = await refreshAccessToken(session.refreshToken);
  const nextSession = {
    ...session,
    accessToken: nextAccessToken,
  };

  return {
    data: await request(nextAccessToken),
    session: nextSession,
  };
}
