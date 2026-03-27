"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDownUp, PackageOpen, Plus, Search } from "lucide-react";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { FoodActionSheet } from "@/components/food-action-sheet";
import { FoodCard } from "@/components/food-card";
import {
  getDaysUntilExpiry,
  getSortedFoodsByUrgency,
} from "@/lib/food-status";
import { useFoodStore } from "@/lib/food-store";
import type { Food } from "@/lib/mock-data";

const filters = [
  { id: "all", label: "전체" },
  { id: "today", label: "오늘" },
  { id: "within3", label: "3일 이내" },
  { id: "within7", label: "7일 이내" },
  { id: "expired", label: "만료" },
] as const;

const sorts = [
  { id: "expiry", label: "소비기한순" },
  { id: "name", label: "이름순" },
  { id: "recent", label: "최근 추가순" },
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
  const [sort, setSort] = useState<(typeof sorts)[number]["id"]>("expiry");
  const [message, setMessage] = useState("");
  const [dialogState, setDialogState] = useState<{
    type: "delete" | "consume" | "discard";
    foodId: string;
  } | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  function handleDelete(foodId: string) {
    setSelectedFood(null);
    setDialogState({ type: "delete", foodId });
  }

  function handleConsume(foodId: string) {
    setSelectedFood(null);
    setDialogState({ type: "consume", foodId });
  }

  function handleDiscard(foodId: string) {
    setSelectedFood(null);
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

  const filteredFoods = foods.filter((food) => {
    const matchesQuery = food.name.toLowerCase().includes(query.toLowerCase());
    const daysUntilExpiry = getDaysUntilExpiry(food.expiryDate);
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "today"
          ? daysUntilExpiry === 0
          : filter === "within3"
            ? daysUntilExpiry > 0 && daysUntilExpiry <= 3
            : filter === "within7"
              ? daysUntilExpiry > 3 && daysUntilExpiry <= 7
              : daysUntilExpiry < 0;

    return matchesQuery && matchesFilter;
  });

  const sortedFoods =
    sort === "expiry"
      ? getSortedFoodsByUrgency(filteredFoods)
      : sort === "name"
        ? [...filteredFoods].sort((a, b) =>
            a.name.localeCompare(b.name, "ko-KR"),
          )
        : [...filteredFoods];

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
      <section className="sticky top-3 z-20 space-y-3 rounded-[28px] border border-white/70 bg-white/88 px-4 py-4 shadow-[var(--shadow-card)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-mint-deep)]">
              <PackageOpen size={18} strokeWidth={2} />
              전체 식품 관리
            </p>
            <h1 className="mt-1 text-xl font-semibold text-[var(--color-ink)]">
              식품 {sortedFoods.length}개
            </h1>
          </div>
          <Link
            href="/foods/new"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[var(--color-mint)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-card)]"
          >
            <Plus size={16} strokeWidth={2.25} />
            추가
          </Link>
        </div>

        <label className="flex items-center gap-2 rounded-2xl bg-[var(--color-surface-soft)] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <Search size={18} strokeWidth={2} className="text-[var(--color-muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="식품명으로 검색"
            className="w-full bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
          />
        </label>

        <div className="space-y-2.5">
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  filter === item.id
                    ? "bg-[var(--color-mint)] text-white shadow-sm"
                    : "bg-[var(--color-surface-soft)] text-[var(--color-muted)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted)]">
              <ArrowDownUp size={14} strokeWidth={2} />
              정렬
            </span>
            {sorts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSort(item.id)}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  sort === item.id
                    ? "border border-[var(--color-line)] bg-white text-[var(--color-mint-deep)] shadow-sm"
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
        {sortedFoods.length > 0 ? (
          <div className="space-y-2.5">
            {sortedFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                storageSpaceName={getStorageSpaceName(food.storageSpaceId)}
                onClick={() => setSelectedFood(food)}
                compact
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-6 text-sm text-[var(--color-muted)]">
            조건에 맞는 식품이 없습니다.
          </div>
        )}
      </section>
      <FoodActionSheet
        food={selectedFood}
        storageSpaceName={
          selectedFood ? getStorageSpaceName(selectedFood.storageSpaceId) : ""
        }
        open={selectedFood !== null}
        onClose={() => setSelectedFood(null)}
        onConsume={() => {
          if (selectedFood) {
            handleConsume(selectedFood.id);
          }
        }}
        onDiscard={() => {
          if (selectedFood) {
            handleDiscard(selectedFood.id);
          }
        }}
        onDelete={() => {
          if (selectedFood) {
            handleDelete(selectedFood.id);
          }
        }}
      />
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
