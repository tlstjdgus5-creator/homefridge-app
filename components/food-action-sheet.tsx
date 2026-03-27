"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Food } from "@/lib/mock-data";

type FoodActionSheetProps = {
  food: Food | null;
  storageSpaceName: string;
  open: boolean;
  onClose: () => void;
  onConsume: () => void;
  onDiscard: () => void;
  onDelete: () => void;
};

export function FoodActionSheet({
  food,
  storageSpaceName,
  open,
  onClose,
  onConsume,
  onDiscard,
  onDelete,
}: FoodActionSheetProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !food || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-40 bg-[rgba(15,23,42,0.2)] backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="액션 시트 닫기"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-4">
        <section className="relative w-full max-w-md rounded-t-[32px] rounded-b-[28px] border border-[var(--color-line)] bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 shadow-[0_-18px_60px_-28px_rgba(15,23,42,0.35)] motion-safe:animate-[dialog-pop_180ms_ease-out]">
          <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[var(--color-line)]" />
          <p className="text-sm font-medium text-[var(--color-mint-deep)]">
            식품 액션
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--color-ink)]">
            {food.name}
          </h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {food.quantity}
            {food.unit} · {storageSpaceName}
          </p>

          <div className="mt-5 space-y-2.5">
            <Link
              href={`/foods/${food.id}/edit`}
              onClick={onClose}
              className="flex min-h-12 items-center justify-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--color-mint-deep)]"
            >
              수정
            </Link>
            <button
              type="button"
              onClick={onConsume}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#effbf6] px-4 py-3 text-sm font-semibold text-[var(--color-fresh)]"
            >
              소비완료
            </button>
            <button
              type="button"
              onClick={onDiscard}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#fff5e8] px-4 py-3 text-sm font-semibold text-[#d99132]"
            >
              폐기
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#fff3f3] px-4 py-3 text-sm font-semibold text-[var(--color-today)]"
            >
              삭제
            </button>
          </div>
        </section>
      </div>
    </div>,
    document.body,
  );
}
