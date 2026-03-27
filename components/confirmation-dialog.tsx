"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "mint" | "danger";
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  tone = "mint",
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
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

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.22)] px-4 py-6 backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="팝업 닫기"
        onClick={() => {
          if (!isConfirming) {
            onCancel();
          }
        }}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <div className="relative z-10 w-full max-w-md rounded-[28px] border border-[var(--color-line)] bg-white p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.5)] transition duration-200 ease-out motion-safe:animate-[dialog-pop_180ms_ease-out]">
        <p className="text-lg font-semibold text-[var(--color-ink)]">{title}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          {description}
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="flex-1 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-muted)]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white ${
              tone === "danger"
                ? "bg-[var(--color-today)]"
                : "bg-[var(--color-mint)]"
            }`}
          >
            {isConfirming ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
