"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { readStoredSession, rehydrateSession } from "@/lib/api";
import { useSessionSync } from "@/hooks/use-session-sync";
import { finishBoot } from "@/store/auth-slice";
import { useAppDispatch } from "@/store/hooks";

export default function SessionBootstrap({
  children,
}: {
  children: ReactNode;
}) {
  const dispatch = useAppDispatch();
  const syncSession = useSessionSync();

  useEffect(() => {
    let isActive = true;
    const storedSession = readStoredSession();

    if (!storedSession) {
      dispatch(finishBoot());
      return;
    }

    const activeStoredSession = storedSession;

    async function restoreSession() {
      try {
        const hydratedSession = await rehydrateSession(activeStoredSession);

        if (!isActive) {
          return;
        }

        syncSession(hydratedSession);
      } catch {
        if (!isActive) {
          return;
        }

        syncSession(null);
      } finally {
        if (isActive) {
          dispatch(finishBoot());
        }
      }
    }

    void restoreSession();

    return () => {
      isActive = false;
    };
  }, [dispatch, syncSession]);

  return <>{children}</>;
}
