"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import type { Food } from "@/lib/mock-data";
import type { NewFoodInput } from "@/lib/food-store";
import { useFoodStore } from "@/lib/food-store";
import { SectionHeader } from "@/components/section-header";
import {
  finalizeDateInput,
  getExpiryRecommendation,
  normalizeDateInput,
} from "@/lib/expiry-recommend";

type FoodFormProps = {
  mode: "create" | "edit";
  initialFood?: Food;
};

type FormState = {
  name: string;
  quantity: string;
  unit: string;
  expiryDate: string;
  storageSpaceId: string;
};

function getInitialFormState(initialFood?: Food): FormState {
  return {
    name: initialFood?.name ?? "",
    quantity: initialFood ? String(initialFood.quantity) : "1",
    unit: initialFood?.unit ?? "",
    expiryDate: initialFood?.expiryDate ?? "",
    storageSpaceId: initialFood?.storageSpaceId ?? "",
  };
}

function validateFoodForm(form: FormState) {
  if (!form.name.trim()) {
    return "식품명을 입력해주세요.";
  }
  if (!form.quantity.trim() || Number(form.quantity) <= 0) {
    return "수량은 0보다 크게 입력해주세요.";
  }
  if (!form.unit.trim()) {
    return "단위를 입력해주세요.";
  }
  if (!form.expiryDate) {
    return "소비기한을 입력해주세요.";
  }
  if (!finalizeDateInput(form.expiryDate)) {
    return "소비기한은 YYYY-MM-DD 형식으로 입력해주세요.";
  }
  if (!form.storageSpaceId) {
    return "보관공간을 선택해주세요.";
  }

  return "";
}

function toFoodInput(form: FormState): NewFoodInput {
  const finalizedExpiryDate = finalizeDateInput(form.expiryDate) ?? form.expiryDate;

  return {
    name: form.name.trim(),
    quantity: Number(form.quantity),
    unit: form.unit.trim(),
    expiryDate: finalizedExpiryDate,
    storageSpaceId: form.storageSpaceId,
  };
}

export function FoodForm({ mode, initialFood }: FoodFormProps) {
  const router = useRouter();
  const { addFood, updateFood, storageSpaces, isLoading, error: storeError } =
    useFoodStore();
  const [form, setForm] = useState<FormState>(getInitialFormState(initialFood));
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const calendarInputRef = useRef<HTMLInputElement>(null);
  const selectedStorageSpace = storageSpaces.find(
    (space) => space.id === form.storageSpaceId,
  );
  const expiryRecommendation = getExpiryRecommendation(
    form.name,
    form.storageSpaceId,
    selectedStorageSpace?.name,
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    if (key !== "name" && error) {
      setError("");
    }
  }

  function handleExpiryDateTextChange(value: string) {
    updateField("expiryDate", value);
  }

  function handleExpiryDateTextBlur() {
    const normalizedValue = normalizeDateInput(form.expiryDate);

    if (normalizedValue !== form.expiryDate) {
      updateField("expiryDate", normalizedValue);
    }
  }

  function handleExpiryDateCalendarChange(value: string) {
    // 캘린더에서 고른 값은 이미 완성된 날짜이므로 바로 필드에 반영합니다.
    updateField("expiryDate", value);
  }

  function applyRecommendedExpiry() {
    if (!expiryRecommendation) {
      return;
    }

    updateField("expiryDate", expiryRecommendation.recommendedDate);
  }

  function openCalendarPicker() {
    const input = calendarInputRef.current as HTMLInputElement | null;

    if (!input) {
      return;
    }

    const picker = (input as HTMLInputElement & { showPicker?: () => void })
      .showPicker;

    if (typeof picker === "function") {
      picker.call(input);
      return;
    }

    input.focus();
    input.click();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateFoodForm(form);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setError("");
    setIsConfirmOpen(true);
  }

  async function handleConfirmSave() {
    const nextInput = toFoodInput(form);
    setIsSaving(true);

    let result;
    if (mode === "create") {
      result = await addFood(nextInput);
    } else if (initialFood) {
      result = await updateFood(initialFood.id, nextInput);
    }

    setIsSaving(false);

    if (!result?.ok) {
      setIsConfirmOpen(false);
      setError(result?.message ?? "저장 중 문제가 생겼어요.");
      return;
    }

    setIsConfirmOpen(false);
    router.push("/foods");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-[linear-gradient(135deg,#eefaf5_0%,#ffffff_60%,#e5f6ef_100%)] px-5 py-6 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-[var(--color-mint-deep)]">
          {mode === "create" ? "새 식품 등록" : "식품 정보 수정"}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
          {mode === "create" ? "식품 추가" : "식품 수정"}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          필요한 정보만 입력하면 목록에 바로 반영됩니다.
        </p>
      </section>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {isLoading ? (
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
            보관공간과 식품 정보를 불러오는 중이에요.
          </div>
        ) : null}
        {storeError ? (
          <div className="rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3 text-sm text-[var(--color-today)]">
            {storeError}
          </div>
        ) : null}
        <section className="space-y-3">
          <SectionHeader
            title="기본 정보"
            subtitle="필수 항목만 먼저 입력할 수 있게 구성했어요"
          />
          <div className="space-y-3 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
                식품명
              </span>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="예: 플레인 요거트"
                className="w-full rounded-2xl bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
                  수량
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.quantity}
                  onChange={(event) => updateField("quantity", event.target.value)}
                  placeholder="1"
                  className="w-full rounded-2xl bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
                  단위
                </span>
                <input
                  value={form.unit}
                  onChange={(event) => updateField("unit", event.target.value)}
                  placeholder="예: 개, 팩, 봉지"
                  className="w-full rounded-2xl bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
                소비기한
              </span>
              <div className="flex gap-3">
                <input
                  value={form.expiryDate}
                  onChange={(event) => handleExpiryDateTextChange(event.target.value)}
                  onBlur={handleExpiryDateTextBlur}
                  placeholder="YYYY-MM-DD"
                  inputMode="numeric"
                  className="flex-1 rounded-2xl bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
                />
                <button
                  type="button"
                  onClick={openCalendarPicker}
                  className="rounded-2xl bg-[var(--color-bg-strong)] px-4 py-3 text-sm font-semibold text-[var(--color-mint-deep)]"
                >
                  캘린더
                </button>
                <input
                  ref={calendarInputRef}
                  type="date"
                  value={finalizeDateInput(form.expiryDate) ?? ""}
                  onChange={(event) =>
                    handleExpiryDateCalendarChange(event.target.value)
                  }
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                `20260330`, `2026.03.30`, `2026/03/30`도 자동 정리됩니다.
              </p>
            </label>

            <div className="rounded-2xl bg-[var(--color-surface-soft)] px-4 py-4">
              <p className="text-sm font-medium text-[var(--color-ink)]">
                추천 소비기한
              </p>
              {expiryRecommendation ? (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">
                        추천 소비기한: {expiryRecommendation.recommendedDate}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        오늘 기준 +{expiryRecommendation.recommendedDays}일
                      </p>
                      {expiryRecommendation.sourceType !== "default_rule" ? (
                        <p className="mt-1 text-xs font-medium text-[var(--color-mint-deep)]">
                          최근 입력 패턴을 반영했어요
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={applyRecommendedExpiry}
                      className="rounded-full bg-[var(--color-mint)] px-3 py-2 text-xs font-semibold text-white"
                    >
                      적용
                    </button>
                  </div>
                  <p className="text-xs leading-5 text-[var(--color-muted)]">
                    기준: {expiryRecommendation.reason}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  식품명과 보관공간을 입력하면 추천 소비기한을 보여드릴게요.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader title="보관공간" />
          <div className="grid gap-3">
            {storageSpaces.map((space) => {
              const isSelected = form.storageSpaceId === space.id;

              return (
                <button
                  key={space.id}
                  type="button"
                  onClick={() => updateField("storageSpaceId", space.id)}
                  className={`rounded-3xl border px-4 py-4 text-left shadow-[var(--shadow-card)] transition ${
                    isSelected
                      ? "border-[var(--color-mint)] bg-[var(--color-bg-strong)]"
                      : "border-[var(--color-line)] bg-[var(--color-surface)]"
                  }`}
                >
                  <p className="text-base font-semibold text-[var(--color-ink)]">
                    {space.name}
                  </p>
                  {isSelected ? (
                    <p className="mt-1 text-sm text-[var(--color-muted)]">선택됨</p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3 text-sm text-[var(--color-today)]">
            {error}
          </div>
        ) : null}

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-[var(--color-mint)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-card)]"
          >
            저장
          </button>
          <Link
            href="/foods"
            className="flex-1 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-center text-sm font-semibold text-[var(--color-muted)]"
          >
            취소
          </Link>
        </div>
      </form>
      <ConfirmationDialog
        open={isConfirmOpen}
        title={mode === "create" ? "이 식품을 저장할까요?" : "수정 내용을 저장할까요?"}
        description={
          mode === "create"
            ? "입력한 식품 정보를 냉장고 목록에 추가합니다."
            : "변경한 식품 정보를 현재 목록에 반영합니다."
        }
        confirmLabel="저장"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        isConfirming={isSaving}
      />
    </div>
  );
}
