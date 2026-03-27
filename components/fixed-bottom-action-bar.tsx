"use client";

import type { ReactNode } from "react";

type FixedBottomActionBarProps = {
  children: ReactNode;
};

export function FixedBottomActionBar({
  children,
}: FixedBottomActionBarProps) {
  return (
    <div
      className="fixed inset-x-0 z-30 mx-auto w-full max-w-md px-4"
      style={{
        bottom: "var(--action-bar-bottom)",
      }}
    >
      {/* 콘텐츠가 버튼 뒤로 숨지지 않도록 각 화면 본문에 충분한 bottom padding을 함께 둡니다. */}
      <div className="rounded-[28px] border border-white/70 bg-white/82 p-3 shadow-[0_18px_46px_-24px_rgba(15,23,42,0.38)] backdrop-blur-2xl">
        {children}
      </div>
    </div>
  );
}
