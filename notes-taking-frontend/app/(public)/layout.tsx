"use client";

import type { ReactNode } from "react";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/notes/ui";
import { useAppSelector } from "@/store/hooks";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const session = useAppSelector((state) => state.auth.session);
  const bootStatus = useAppSelector((state) => state.auth.status);
  const [isRouting, startRouting] = useTransition();

  useEffect(() => {
    if (bootStatus !== "ready" || !session) {
      return;
    }

    startRouting(() => {
      router.replace("/");
    });
  }, [bootStatus, router, session]);

  if (bootStatus === "booting") {
    return <LoadingState label="Checking your session..." />;
  }

  if (session || isRouting) {
    return <LoadingState label="Opening your dashboard..." />;
  }

  return <>{children}</>;
}
