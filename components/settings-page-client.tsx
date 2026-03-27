"use client";

import { useState } from "react";
import { Lock, Settings, ShieldCheck } from "lucide-react";
import { useAppPinAccess } from "@/components/app-pin-gate";
import { PinDots, PinPad } from "@/components/pin-pad";

export function SettingsPageClient() {
  const { changePin, lockApp } = useAppPinAccess();
  const [currentPin, setCurrentPin] = useState("");
  const [nextPin, setNextPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [activeField, setActiveField] = useState<"current" | "next" | "confirm">(
    "current",
  );
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitPinChange() {
    setIsSubmitting(true);
    setMessage("");
    setSuccessMessage("");

    const result = await changePin({
      currentPin,
      nextPin,
      confirmPin,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setMessage(result.message ?? "PIN 변경에 실패했어요.");
      return;
    }

    setCurrentPin("");
    setNextPin("");
    setConfirmPin("");
    setActiveField("current");
    setSuccessMessage("새 PIN으로 변경했어요.");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitPinChange();
  }

  const activeValue =
    activeField === "current"
      ? currentPin
      : activeField === "next"
        ? nextPin
        : confirmPin;

  return (
    <div className="space-y-6 pb-32">
      <section className="rounded-[28px] bg-[linear-gradient(135deg,#eef9f4_0%,#f7fffc_55%,#fffaf1_100%)] px-5 py-6 shadow-[var(--shadow-card)]">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-mint-deep)]">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[var(--color-mint-deep)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <Settings size={18} strokeWidth={2} />
          </span>
          설정
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
          PIN 관리
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          현재 PIN을 확인한 뒤 새 4자리 PIN으로 바꿀 수 있어요.
        </p>
      </section>

      <section className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <button
            type="button"
            onClick={() => setActiveField("current")}
            className={`block w-full rounded-[28px] border px-4 py-4 text-left ${
              activeField === "current"
                ? "border-[var(--color-mint)] bg-[#f4fbf8]"
                : "border-[var(--color-line)] bg-white"
            }`}
          >
            <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
              현재 PIN
            </span>
            <PinDots
              value={currentPin}
              tone={activeField === "current" ? "active" : "default"}
            />
          </button>

          <button
            type="button"
            onClick={() => setActiveField("next")}
            className={`block w-full rounded-[28px] border px-4 py-4 text-left ${
              activeField === "next"
                ? "border-[var(--color-mint)] bg-[#f4fbf8]"
                : "border-[var(--color-line)] bg-white"
            }`}
          >
            <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
              새 PIN
            </span>
            <PinDots
              value={nextPin}
              tone={activeField === "next" ? "active" : "default"}
            />
          </button>

          <button
            type="button"
            onClick={() => setActiveField("confirm")}
            className={`block w-full rounded-[28px] border px-4 py-4 text-left ${
              activeField === "confirm"
                ? "border-[var(--color-mint)] bg-[#f4fbf8]"
                : "border-[var(--color-line)] bg-white"
            }`}
          >
            <span className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
              새 PIN 확인
            </span>
            <PinDots
              value={confirmPin}
              tone={activeField === "confirm" ? "active" : "default"}
            />
          </button>

          <PinPad
            value={activeValue}
            disabled={isSubmitting}
            submitLabel="변경"
            onChange={(value) => {
              if (activeField === "current") {
                setCurrentPin(value);
                if (value.length === 4) {
                  setActiveField("next");
                }
              } else if (activeField === "next") {
                setNextPin(value);
                if (value.length === 4) {
                  setActiveField("confirm");
                }
              } else {
                setConfirmPin(value);
              }

              if (message) {
                setMessage("");
              }
              if (successMessage) {
                setSuccessMessage("");
              }
            }}
            onSubmit={() => {
              if (activeField !== "confirm") {
                setActiveField(activeField === "current" ? "next" : "confirm");
                return;
              }

              void submitPinChange();
            }}
          />

          {message ? (
            <p className="rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3 text-sm text-[var(--color-today)]">
              {message}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-2xl border border-[#d7f1e6] bg-[#f3fbf7] px-4 py-3 text-sm text-[var(--color-fresh)]">
              {successMessage}
            </p>
          ) : null}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--color-mint)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-card)] disabled:opacity-70"
            >
              <ShieldCheck size={18} strokeWidth={2} />
              {isSubmitting ? "변경 중..." : "PIN 변경"}
            </button>
            <button
              type="button"
              onClick={lockApp}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-muted)]"
            >
              <Lock size={18} strokeWidth={2} />
              다시 잠그기
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
