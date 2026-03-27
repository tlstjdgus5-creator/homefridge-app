"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { FoodForm } from "@/components/food-form";
import { useFoodStore } from "@/lib/food-store";

type EditFoodPageClientProps = {
  foodId: string;
};

export function EditFoodPageClient({ foodId }: EditFoodPageClientProps) {
  const router = useRouter();
  const { foods, removeFood, consumeFood, discardFood, isLoading, error } =
    useFoodStore();
  const food = foods.find((item) => item.id === foodId);
  const [dialogType, setDialogType] = useState<
    "delete" | "consume" | "discard" | null
  >(null);
  const [message, setMessage] = useState("");
  const [isActionPending, setIsActionPending] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
        식품 정보를 불러오는 중이에요.
      </div>
    );
  }

  if (!food) {
    return (
      <div className="space-y-4">
        <section className="rounded-[28px] bg-[linear-gradient(135deg,#eefaf5_0%,#ffffff_60%,#e5f6ef_100%)] px-5 py-6 shadow-[var(--shadow-card)]">
          <p className="text-sm font-medium text-[var(--color-mint-deep)]">
            식품 정보를 찾지 못했어요
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
            이미 삭제되었거나 존재하지 않는 식품입니다
          </h1>
        </section>
        <Link
          href="/foods"
          className="inline-flex rounded-full bg-[var(--color-mint)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-card)]"
        >
          식품 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  function handleDelete() {
    setDialogType("delete");
  }

  function handleConsume() {
    setDialogType("consume");
  }

  function handleDiscard() {
    setDialogType("discard");
  }

  async function handleConfirmAction() {
    if (!dialogType) {
      return;
    }

    setIsActionPending(true);
    let result;
    if (dialogType === "discard") {
      result = await discardFood(foodId);
    } else if (dialogType === "consume") {
      result = await consumeFood(foodId);
    } else {
      result = await removeFood(foodId);
    }
    setIsActionPending(false);

    if (!result?.ok) {
      setMessage(result?.message ?? "처리 중 문제가 생겼어요.");
      return;
    }

    setDialogType(null);
    router.push("/foods");
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
          식품 정보를 불러오는 중이에요.
        </div>
      ) : null}
      {error || message ? (
        <div className="rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3 text-sm text-[var(--color-today)]">
          {message || error}
        </div>
      ) : null}
      <FoodForm mode="edit" initialFood={food} />
      <section className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-[var(--color-ink)]">빠른 액션</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleConsume}
            className="flex-1 rounded-2xl bg-[var(--color-bg-strong)] px-4 py-3 text-sm font-semibold text-[var(--color-mint-deep)]"
          >
            소비완료
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            className="flex-1 rounded-2xl bg-[#f1f5f9] px-4 py-3 text-sm font-semibold text-[var(--color-expired)]"
          >
            폐기
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 rounded-2xl bg-[#fff3f3] px-4 py-3 text-sm font-semibold text-[var(--color-today)]"
          >
            삭제
          </button>
        </div>
      </section>
      <ConfirmationDialog
        open={dialogType !== null}
        title={
          dialogType === "delete"
            ? "이 식품을 삭제할까요?"
            : dialogType === "discard"
              ? "이 식품을 폐기 처리할까요?"
              : "이 식품을 소비완료 처리할까요?"
        }
        description={
          dialogType === "delete"
            ? "삭제하면 식품 목록에서 바로 사라집니다."
            : dialogType === "discard"
              ? "폐기 기록을 남기고 현재 식품 목록에서는 제거합니다."
              : "소비완료 처리하면 현재 목록에서 제거됩니다."
        }
        tone={
          dialogType === "delete" || dialogType === "discard" ? "danger" : "mint"
        }
        onCancel={() => setDialogType(null)}
        onConfirm={handleConfirmAction}
        isConfirming={isActionPending}
      />
    </div>
  );
}
