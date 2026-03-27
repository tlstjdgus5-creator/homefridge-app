"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const AppPinGate = dynamic(
  () => import("@/components/app-pin-gate").then((mod) => mod.AppPinGate),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6">
        <div className="w-full rounded-[32px] border border-[var(--color-line)] bg-[linear-gradient(145deg,#fbfcfb_0%,#f5f9f7_55%,#edf5f1_100%)] px-6 py-10 text-center shadow-[var(--shadow-card)]">
          <p className="font-display text-sm tracking-[0.24em] text-[var(--color-mint-deep)]">
            HOME FRIDGE
          </p>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            잠금 화면을 준비하는 중이에요.
          </p>
        </div>
      </div>
    ),
  },
);

export function AppPinGateShell({ children }: { children: ReactNode }) {
  return <AppPinGate>{children}</AppPinGate>;
}
