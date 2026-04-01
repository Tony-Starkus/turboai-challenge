import type { Note, NotePayload } from '@/lib/api-types';
import api, { withAccessToken } from '@/services/api';

export async function listNoteRequest(accessToken?: string) {
  const response = await api.get<Note[]>('/notes/', withAccessToken(accessToken));
  return response.data;
}

export async function listCategoriesRequest(accessToken?: string) {
  const response = await api.get<Array<Record<string, unknown>>>('/notes/categories/', withAccessToken(accessToken));

  return response.data;
}

export async function retrieveNoteRequest(noteId: number, accessToken?: string) {
  const response = await api.get<Note>(`/notes/${noteId}/`, withAccessToken(accessToken));
  return response.data;
}

export async function createNoteRequest(payload: NotePayload, accessToken?: string) {
  const response = await api.post<Note>('/notes/', payload, withAccessToken(accessToken));
  return response.data;
}

export async function replaceNoteRequest(noteId: number, payload: NotePayload, accessToken?: string) {
  const response = await api.put<Note>(`/notes/${noteId}/`, payload, withAccessToken(accessToken));

  return response.data;
}

export async function updateNoteRequest(noteId: number, payload: Partial<NotePayload>, accessToken?: string) {
  const response = await api.patch<Note>(`/notes/${noteId}/`, payload, withAccessToken(accessToken));

  return response.data;
}

export async function deleteNoteRequest(noteId: number, accessToken?: string) {
  await api.delete(`/notes/${noteId}/`, withAccessToken(accessToken));
}
