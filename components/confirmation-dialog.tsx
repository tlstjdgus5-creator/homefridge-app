"use client";

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
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(15,23,42,0.22)] px-4 pb-28 pt-10">
      <div className="w-full max-w-md rounded-[28px] border border-[var(--color-line)] bg-white p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.5)]">
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
    </div>
  );
}
