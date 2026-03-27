"use client";

type PinDotsProps = {
  value: string;
  length?: number;
  tone?: "default" | "active";
};

type PinPadProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  submitLabel?: string;
  showSubmit?: boolean;
};

const keypadRows = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
];

export function PinDots({
  value,
  length = 4,
  tone = "default",
}: PinDotsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length }).map((_, index) => {
        const isFilled = index < value.length;

        return (
          <div
            key={index}
            className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
              tone === "active"
                ? "border-[var(--color-mint)] bg-[#eef8f4]"
                : "border-[var(--color-line)] bg-white/90"
            }`}
          >
            <div
              className={`rounded-full transition ${
                isFilled
                  ? "h-2.5 w-2.5 bg-[var(--color-mint-deep)]"
                  : "h-2 w-2 bg-transparent"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

function PinPadButton({
  label,
  onClick,
  disabled,
  variant = "number",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "number" | "action" | "ghost";
}) {
  const baseClassName =
    "flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold shadow-[var(--shadow-card)] transition active:scale-95 disabled:opacity-45";
  const variantClassName =
    variant === "number"
      ? "border border-[var(--color-line)] bg-white text-[var(--color-ink)]"
      : variant === "action"
        ? "bg-[var(--color-mint)] text-white"
        : "border border-transparent bg-white/45 text-[var(--color-muted)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClassName} ${variantClassName}`}
    >
      {label}
    </button>
  );
}

export function PinPad({
  value,
  onChange,
  onSubmit,
  disabled = false,
  submitLabel = "확인",
  showSubmit = true,
}: PinPadProps) {
  function handleAppend(digit: string) {
    if (disabled || value.length >= 4) {
      return;
    }

    onChange(`${value}${digit}`);
  }

  function handleDelete() {
    if (disabled || value.length === 0) {
      return;
    }

    onChange(value.slice(0, -1));
  }

  return (
    <div className="space-y-3">
      {keypadRows.map((row) => (
        <div key={row.join("-")} className="flex items-center justify-center gap-4">
          {row.map((digit) => (
            <PinPadButton
              key={digit}
              label={digit}
              disabled={disabled}
              onClick={() => handleAppend(digit)}
            />
          ))}
        </div>
      ))}

      <div className="flex items-center justify-center gap-4">
        {showSubmit ? (
          <PinPadButton
            label={submitLabel}
            variant="action"
            disabled={disabled || value.length !== 4}
            onClick={() => {
              onSubmit?.();
            }}
          />
        ) : (
          <div className="h-16 w-16" />
        )}

        <PinPadButton
          label="0"
          disabled={disabled}
          onClick={() => handleAppend("0")}
        />

        <PinPadButton
          label="지움"
          variant="ghost"
          disabled={disabled || value.length === 0}
          onClick={handleDelete}
        />
      </div>
    </div>
  );
}
