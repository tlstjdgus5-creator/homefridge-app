"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { FixedBottomActionBar } from "@/components/fixed-bottom-action-bar";
import { FoodCard } from "@/components/food-card";
import { SectionHeader } from "@/components/section-header";
import { getSortedFoodsByUrgency } from "@/lib/food-status";
import { useFoodStore } from "@/lib/food-store";

type StorageSpaceDetailPageClientProps = {
  storageSpaceId: string;
};

export function StorageSpaceDetailPageClient({
  storageSpaceId,
}: StorageSpaceDetailPageClientProps) {
  const {
    foods,
    storageSpaces,
    removeFood,
    consumeFood,
    discardFood,
    isLoading,
    error,
  } = useFoodStore();
  const [dialogState, setDialogState] = useState<{
    type: "delete" | "consume" | "discard";
    foodId: string;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [isActionPending, setIsActionPending] = useState(false);
  const storageSpace = storageSpaces.find((space) => space.id === storageSpaceId);
  const otherStorageSpaces = storageSpaces.filter(
    (space) => space.id !== storageSpaceId,
  );
  const filteredFoods = getSortedFoodsByUrgency(
    foods.filter((food) => food.storageSpaceId === storageSpaceId),
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
        공간 식품 정보를 불러오는 중이에요.
      </div>
    );
  }

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

  if (!storageSpace) {
    return (
      <div className="space-y-6">
        <section className="rounded-[28px] bg-[linear-gradient(135deg,#eefaf5_0%,#ffffff_60%,#e5f6ef_100%)] px-5 py-6 shadow-[var(--shadow-card)]">
          <p className="text-sm font-medium text-[var(--color-mint-deep)]">
            보관공간 상세
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
            공간 정보를 찾을 수 없어요
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            삭제되었거나 잘못된 경로일 수 있어요.
          </p>
          <Link
            href="/storage-spaces"
            className="mt-4 inline-flex rounded-full bg-[var(--color-mint)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-card)]"
          >
            공간 목록으로 돌아가기
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-72">
      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
          공간 식품 정보를 불러오는 중이에요.
        </div>
      ) : null}
      {error || message ? (
        <div className="rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3 text-sm text-[var(--color-today)]">
          {message || error}
        </div>
      ) : null}
      <section className="rounded-[28px] bg-[linear-gradient(135deg,#eefaf5_0%,#ffffff_60%,#e5f6ef_100%)] px-5 py-6 shadow-[var(--shadow-card)]">
        <Link
          href="/storage-spaces"
          className="text-sm font-medium text-[var(--color-mint-deep)]"
        >
          ← 공간 목록으로
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">
          {storageSpace.name}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          이 공간에 등록된 식품 {filteredFoods.length}개를 모아봤어요.
        </p>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title={`${storageSpace.name} 식품`}
          subtitle="이 공간에 있는 식품만 따로 확인할 수 있어요"
        />
        {filteredFoods.length > 0 ? (
          <div className="space-y-3">
            {filteredFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                storageSpaceName={storageSpace.name}
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
            이 공간에 등록된 식품이 없어요.
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="다른 칸 보기"
          subtitle="다른 보관공간도 바로 이동해서 확인할 수 있어요"
        />
        {otherStorageSpaces.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {otherStorageSpaces.map((space) => (
              <Link
                key={space.id}
                href={`/storage-spaces/${space.id}`}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-mint-deep)] shadow-[var(--shadow-card)] transition active:scale-[0.98]"
              >
                {space.name}
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-5 text-sm text-[var(--color-muted)]">
            다른 보관공간이 아직 없어요.
          </div>
        )}
      </section>

      <FixedBottomActionBar>
        <div className="space-y-2.5">
          <Link
            href="/foods/new"
            className="flex w-full items-center justify-center rounded-2xl bg-[var(--color-mint)] px-4 py-4 text-sm font-semibold text-white shadow-[var(--shadow-card)]"
          >
            + 식품 추가
          </Link>
          <Link
            href="/"
            className="flex w-full items-center justify-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4 text-sm font-semibold text-[var(--color-mint-deep)] shadow-[var(--shadow-card)]"
          >
            홈으로 돌아가기
          </Link>
          <Link
            href="/storage-spaces"
            className="flex w-full items-center justify-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4 text-sm font-semibold text-[var(--color-mint-deep)] shadow-[var(--shadow-card)]"
          >
            공간 목록으로 돌아가기
          </Link>
        </div>
      </FixedBottomActionBar>

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
