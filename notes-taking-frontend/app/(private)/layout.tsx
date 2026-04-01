'use client';

import type { ReactNode } from 'react';
import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { getErrorMessage, isUnauthorizedError, listNotes, runWithFreshSession } from '@/lib/api';
import { LoadingState, LogoutIcon, PlusIcon } from '@/components/notes/ui';
import { useSessionSync } from '@/hooks/use-session-sync';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { beginNotesLoading, clearNotes, setNotes, setNotesError } from '@/store/notes-slice';

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const syncSession = useSessionSync();
  const session = useAppSelector((state) => state.auth.session);
  const bootStatus = useAppSelector((state) => state.auth.status);
  const [isRouting, startRouting] = useTransition();

  useEffect(() => {
    if (bootStatus !== 'ready' || session) {
      return;
    }

    startRouting(() => {
      router.replace('/login');
    });
  }, [bootStatus, router, session]);

  useEffect(() => {
    if (!session) {
      dispatch(clearNotes());
      return;
    }

    let isActive = true;
    const activeSession = session;

    async function loadNotes() {
      dispatch(beginNotesLoading());

      try {
        const result = await runWithFreshSession(activeSession, listNotes);

        if (!isActive) {
          return;
        }

        if (result.session.accessToken !== activeSession.accessToken) {
          syncSession(result.session);
        }

        dispatch(setNotes(result.data));
      } catch (error) {
        if (!isActive) {
          return;
        }

        if (isUnauthorizedError(error)) {
          syncSession(null);
          startRouting(() => {
            router.replace('/login');
          });
          return;
        }

        dispatch(setNotesError(getErrorMessage(error)));
      }
    }

    void loadNotes();

    return () => {
      isActive = false;
    };
  }, [dispatch, router, session, syncSession]);

  function handleLogout() {
    syncSession(null);
    startRouting(() => {
      router.replace('/login');
    });
  }

  function handleNewNote() {
    startRouting(() => {
      router.push('/note/new');
    });
  }

  if (bootStatus === 'booting') {
    return <LoadingState label="Warming up your notes workspace..." />;
  }

  if (!session || isRouting) {
    return <LoadingState label="Opening your dashboard..." />;
  }

  return (
    <div className="app-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 md:px-6 md:py-6 xl:px-8">
        <header className="px-5 py-4 md:px-6 md:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4"></div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="btn-base btn-secondary" type="button" onClick={handleNewNote} disabled={isRouting}>
                <PlusIcon />
                New Note
              </button>
              <button className="btn-base btn-ghost" type="button" onClick={handleLogout}>
                <LogoutIcon />
                Log Out
              </button>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
