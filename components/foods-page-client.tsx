"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { FoodCard } from "@/components/food-card";
import { SectionHeader } from "@/components/section-header";
import { getFoodStatus, getSortedFoodsByUrgency } from "@/lib/food-status";
import { useFoodStore } from "@/lib/food-store";

const filters = [
  { id: "all", label: "전체" },
  { id: "expiring", label: "임박" },
  { id: "expired", label: "만료" },
] as const;

export function FoodsPageClient() {
  const {
    foods,
    getStorageSpaceName,
    removeFood,
    consumeFood,
    discardFood,
    isLoading,
    error,
  } = useFoodStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [message, setMessage] = useState("");
  const [dialogState, setDialogState] = useState<{
    type: "delete" | "consume" | "discard";
    foodId: string;
  } | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  function handleDelete(foodId: string) {
    setDialogState({ type: "delete", foodId });
  }

  function handleConsume(foodId: string) {
    setDialogState({ type: "consume", foodId });
  }

  function handleDiscard(foodId: string) {
    setDialogState({ type: "discard", foodId });
  }

  async function handleConfirmAction() {
    if (!dialogState) {
      return;
    }

    setIsActionPending(true);
    let result;
    if (dialogState.type === "discard") {
      result = await discardFood(dialogState.foodId);
    } else if (dialogState.type === "consume") {
      result = await consumeFood(dialogState.foodId);
    } else {
      result = await removeFood(dialogState.foodId);
    }
    setIsActionPending(false);

    if (!result?.ok) {
      setMessage(result?.message ?? "처리 중 문제가 생겼어요.");
      return;
    }

    setDialogState(null);
    setMessage("");
  }

  const filteredFoods = getSortedFoodsByUrgency(foods).filter((food) => {
    const matchesQuery = food.name.toLowerCase().includes(query.toLowerCase());
    const status = getFoodStatus(food);
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "expiring"
          ? status === "today" || status === "soon"
          : status === "expired";

    return matchesQuery && matchesFilter;
  });
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
          식품 데이터를 불러오는 중이에요.
        </div>
      ) : null}
      {error || message ? (
        <div className="rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3 text-sm text-[var(--color-today)]">
          {message || error}
        </div>
      ) : null}
      <section className="rounded-[28px] bg-[linear-gradient(135deg,#eefaf5_0%,#ffffff_60%,#e5f6ef_100%)] px-5 py-6 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-[var(--color-mint-deep)]">
          식품 목록
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
          검색과 필터로 냉장고를 빠르게 정리해보세요
        </h1>
        <Link
          href="/foods/new"
          className="mt-4 inline-flex rounded-full bg-[var(--color-mint)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-card)]"
        >
          식품 추가
        </Link>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="식품 검색"
          subtitle="이름으로 찾고 임박 상태로 걸러볼 수 있어요"
        />
        <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="예: 우유, 달걀, 시금치"
            className="w-full rounded-2xl bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none ring-0 placeholder:text-[var(--color-muted)]"
          />
          <div className="mt-3 flex gap-2">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === item.id
                    ? "bg-[var(--color-mint)] text-white"
                    : "bg-[var(--color-surface-soft)] text-[var(--color-muted)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title={`식품 ${filteredFoods.length}개`}
          subtitle="이름, 수량, 소비기한, 상태, 보관공간을 카드에 담았어요"
        />
        {filteredFoods.length > 0 ? (
          <div className="space-y-3">
            {filteredFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                storageSpaceName={getStorageSpaceName(food.storageSpaceId)}
                actions={{
                  onDelete: () => handleDelete(food.id),
                  onConsume: () => handleConsume(food.id),
                  onDiscard: () => handleDiscard(food.id),
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-6 text-sm text-[var(--color-muted)]">
            조건에 맞는 식품이 없습니다.
          </div>
        )}
      </section>
      <ConfirmationDialog
        open={dialogState !== null}
        title={
          dialogState?.type === "delete"
            ? "이 식품을 삭제할까요?"
            : dialogState?.type === "discard"
              ? "이 식품을 폐기 처리할까요?"
              : "이 식품을 소비완료 처리할까요?"
        }
        description={
          dialogState?.type === "delete"
            ? "삭제하면 식품 목록에서 바로 사라집니다."
            : dialogState?.type === "discard"
              ? "폐기 기록을 남기고 현재 식품 목록에서는 제거합니다."
              : "소비완료 처리하면 현재 목록에서 제거됩니다."
        }
        confirmLabel={
          dialogState?.type === "delete"
            ? "삭제"
            : dialogState?.type === "discard"
              ? "폐기"
              : "완료"
        }
        tone={
          dialogState?.type === "delete" || dialogState?.type === "discard"
            ? "danger"
            : "mint"
        }
        onCancel={() => setDialogState(null)}
        onConfirm={handleConfirmAction}
        isConfirming={isActionPending}
      />
    </div>
  );
}
