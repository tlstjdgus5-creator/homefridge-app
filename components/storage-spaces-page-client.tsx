"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { SectionHeader } from "@/components/section-header";
import { getSortedFoodsByUrgency } from "@/lib/food-status";
import { useFoodStore } from "@/lib/food-store";

export function StorageSpacesPageClient() {
  const {
    foods,
    storageSpaces,
    addStorageSpace,
    updateStorageSpace,
    removeStorageSpace,
    isLoading,
    error,
  } = useFoodStore();
  const [newStorageSpaceName, setNewStorageSpaceName] = useState("");
  const [editingStorageSpaceId, setEditingStorageSpaceId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [message, setMessage] = useState("");
  const [dialogState, setDialogState] = useState<{
    type: "create" | "update" | "delete";
    storageSpaceId?: string;
  } | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  function handleAddStorageSpace() {
    if (!newStorageSpaceName.trim()) {
      setMessage("공간 이름을 입력해주세요.");
      return;
    }

    setDialogState({ type: "create" });
  }

  function startEditing(storageSpaceId: string, currentName: string) {
    setEditingStorageSpaceId(storageSpaceId);
    setEditingName(currentName);
    setMessage("");
  }

  function handleUpdateStorageSpace(storageSpaceId: string) {
    if (!editingName.trim()) {
      setMessage("공간 이름을 입력해주세요.");
      return;
    }

    setDialogState({ type: "update", storageSpaceId });
  }

  function handleRemoveStorageSpace(storageSpaceId: string) {
    setDialogState({ type: "delete", storageSpaceId });
  }

  async function handleConfirmStorageSpaceAction() {
    if (!dialogState) {
      return;
    }

    setIsActionPending(true);
    if (dialogState.type === "create") {
      const result = await addStorageSpace({ name: newStorageSpaceName });
      setIsActionPending(false);

      if (!result.ok) {
        setMessage(result.message ?? "보관공간 저장 중 문제가 생겼어요.");
        return;
      }

      setNewStorageSpaceName("");
      setDialogState(null);
      setMessage("");
      return;
    }

    if (dialogState.type === "update" && dialogState.storageSpaceId) {
      const result = await updateStorageSpace(dialogState.storageSpaceId, {
        name: editingName,
      });
      setIsActionPending(false);

      if (!result.ok) {
        setMessage(result.message ?? "보관공간 수정 중 문제가 생겼어요.");
        return;
      }

      setEditingStorageSpaceId("");
      setEditingName("");
      setDialogState(null);
      setMessage("");
      return;
    }

    if (dialogState.type === "delete" && dialogState.storageSpaceId) {
      const result = await removeStorageSpace(dialogState.storageSpaceId);
      setIsActionPending(false);

      if (!result.ok) {
        setMessage(result.message ?? "보관공간을 삭제할 수 없어요.");
        setDialogState(null);
        return;
      }
    }

    setIsActionPending(false);
    setDialogState(null);
    setMessage("");
  }

  return (
    <div className="space-y-7 pb-32">
      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
          보관공간과 식품 정보를 불러오는 중이에요.
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3 text-sm text-[var(--color-today)]">
          {error}
        </div>
      ) : null}
      <section className="rounded-2xl border border-[var(--color-line)] bg-[linear-gradient(135deg,#fbfcfb_0%,#f4f8f6_50%,#eef3f1_100%)] px-6 py-7 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-[var(--color-mint-deep)]">
          확장 가능한 구조
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
          보관공간은 데이터로 관리되고 있어요
        </h1>
        <Link
          href="/stats"
          className="mt-5 inline-flex rounded-full border border-[var(--color-line)] bg-white/80 px-4 py-2.5 text-sm font-semibold text-[var(--color-mint-deep)] hover:-translate-y-0.5"
        >
          통계 보기
        </Link>
      </section>

      <section className="space-y-3">
        <SectionHeader title="공간 추가" />
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex gap-3">
            <input
              value={newStorageSpaceName}
              onChange={(event) => setNewStorageSpaceName(event.target.value)}
              placeholder="예: 냉장실 하단"
              className="flex-1 rounded-2xl bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
            />
            <button
              type="button"
              onClick={handleAddStorageSpace}
              className="rounded-2xl bg-[var(--color-mint)] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5"
            >
              추가
            </button>
          </div>
          {message ? (
            <p className="mt-3 text-sm text-[var(--color-today)]">{message}</p>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="보관공간 리스트"
          subtitle="공간이 늘어나도 같은 UI 구조로 확장됩니다"
        />
        <div className="space-y-3">
          {storageSpaces.map((space) => {
            const items = getSortedFoodsByUrgency(
              foods.filter((food) => food.storageSpaceId === space.id),
            );
            const mostUrgentFood = items[0] ?? null;

            return (
              <article
                key={space.id}
                className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {editingStorageSpaceId === space.id ? (
                      <div className="space-y-3">
                        <input
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          className="w-full rounded-2xl bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateStorageSpace(space.id)}
                            className="rounded-full bg-[var(--color-mint)] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:-translate-y-0.5"
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStorageSpaceId("");
                              setEditingName("");
                              setMessage("");
                            }}
                            className="rounded-full bg-[var(--color-surface-soft)] px-3 py-2 text-xs font-semibold text-[var(--color-muted)] hover:-translate-y-0.5"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={`/storage-spaces/${space.id}`}
                        className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mint)]"
                      >
                        <h2 className="text-lg font-semibold text-[var(--color-ink)]">
                          {space.name}
                        </h2>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          식품 {items.length}개
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-mint-deep)]">
                          눌러서 이 공간 식품만 보기
                        </p>
                      </Link>
                    )}
                  </div>
                  <span className="rounded-full bg-[var(--color-bg-strong)] px-3 py-1 text-sm font-semibold text-[var(--color-mint-deep)]">
                    {items.length}
                  </span>
                </div>
                {editingStorageSpaceId === space.id ? null : (
                  <Link
                    href={`/storage-spaces/${space.id}`}
                    className="mt-4 block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-mint)]"
                  >
                    <div className="flex flex-wrap gap-2">
                      {items.length > 0 ? (
                        items.map((food) => (
                          <span
                            key={food.id}
                            className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-3 py-1 text-xs text-[var(--color-muted)]"
                          >
                            {food.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-[var(--color-muted)]">
                          아직 등록된 식품이 없어요.
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-sm text-[var(--color-muted)]">
                      {mostUrgentFood
                        ? `가장 임박한 식품: ${mostUrgentFood.name}`
                        : "보관 중인 식품이 없어요."}
                    </p>
                  </Link>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(space.id, space.name)}
                    className="rounded-full bg-[var(--color-bg-strong)] px-3 py-2 text-xs font-semibold text-[var(--color-mint-deep)] hover:-translate-y-0.5"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveStorageSpace(space.id)}
                    className="rounded-full bg-[#fff3f3] px-3 py-2 text-xs font-semibold text-[var(--color-today)] hover:-translate-y-0.5"
                  >
                    삭제
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="sticky bottom-24 z-10 pt-2">
        <Link
          href="/foods/new"
          className="flex w-full items-center justify-center rounded-2xl border border-[#8abda9] bg-[linear-gradient(135deg,#87bca9_0%,#72ac98_100%)] px-4 py-4 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5"
        >
          + 식품 추가
        </Link>
      </div>
      <ConfirmationDialog
        open={dialogState !== null}
        title={
          dialogState?.type === "create"
            ? "이 공간을 저장할까요?"
            : dialogState?.type === "update"
              ? "이 공간 이름을 수정할까요?"
              : "이 공간을 삭제할까요?"
        }
        description={
          dialogState?.type === "create"
            ? "입력한 보관공간을 목록에 추가합니다."
            : dialogState?.type === "update"
              ? "변경한 공간 이름을 현재 목록에 반영합니다."
              : "삭제하면 공간 목록에서 바로 사라집니다."
        }
        confirmLabel={
          dialogState?.type === "delete"
            ? "삭제"
            : dialogState?.type === "update"
              ? "수정"
              : "저장"
        }
        tone={dialogState?.type === "delete" ? "danger" : "mint"}
        onCancel={() => setDialogState(null)}
        onConfirm={handleConfirmStorageSpaceAction}
        isConfirming={isActionPending}
      />
    </div>
  );
}
