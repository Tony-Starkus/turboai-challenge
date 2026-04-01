'use client';

import { useCallback } from 'react';

import { clearStoredSession as removeStoredSession, persistSession, type Session } from '@/lib/api';
import { clearSession, setSession } from '@/store/auth-slice';
import { useAppDispatch } from '@/store/hooks';
import {
  clearNotes,
  setNotes,
  beginNotesLoading,
  setNotesError,
  setCategories,
  clearCategories,
} from '@/store/notes-slice';
import { listNoteRequest, listCategoriesRequest } from '@/services/note';

export function useSessionSync() {
  const dispatch = useAppDispatch();

  return useCallback(
    (nextSession: Session | null) => {
      if (nextSession) {
        dispatch(setSession(nextSession));
        persistSession(nextSession);

        // Fetch notes and categories in background
        void (async () => {
          try {
            dispatch(beginNotesLoading());
            const notes = await listNoteRequest(nextSession.accessToken);
            dispatch(setNotes(notes));
          } catch (err) {
            dispatch(setNotesError(String(err)));
          }

          try {
            const categories = await listCategoriesRequest(nextSession.accessToken);
            dispatch(setCategories(categories as any));
          } catch (e) {
            // don't block on categories; leave empty on error
            console.warn('Failed to load categories', e);
          }
        })();

        return;
      }

      dispatch(clearSession());
      dispatch(clearNotes());
      dispatch(clearCategories());
      removeStoredSession();
    },
    [dispatch],
  );
}
