"use client";

import Link from "next/link";
import { FixedBottomActionBar } from "@/components/fixed-bottom-action-bar";
import { SectionHeader } from "@/components/section-header";
import { SummaryCard } from "@/components/summary-card";
import { FoodCard } from "@/components/food-card";
import {
  getFoodStatus,
  getSortedFoodsByUrgency,
  summarizeFoodStatuses,
} from "@/lib/food-status";
import { useFoodStore } from "@/lib/food-store";

export function HomePageClient() {
  const { foods, storageSpaces, getStorageSpaceName, isLoading, error } =
    useFoodStore();
  const summary = summarizeFoodStatuses(foods);
  const urgentFoods = getSortedFoodsByUrgency(foods).filter(
    (food) => getFoodStatus(food) !== "fresh",
  );
  const storageSummaries = storageSpaces.map((space) => ({
    ...space,
    count: foods.filter((food) => food.storageSpaceId === space.id).length,
  }));
  const groupedUrgentFoods = storageSpaces
    .map((space) => ({
      ...space,
      items: urgentFoods.filter((food) => food.storageSpaceId === space.id),
    }))
    .filter((space) => space.items.length > 0);

  return (
    <div className="space-y-7 pb-56">
      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
          냉장고 데이터를 불러오는 중이에요.
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3 text-sm text-[var(--color-today)]">
          {error}
        </div>
      ) : null}
      <section className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[linear-gradient(135deg,#fbfcfb_0%,#f4f8f6_52%,#edf4f0_100%)] px-6 py-7 shadow-[var(--shadow-card)]">
        <p className="font-display text-sm tracking-[0.18em] text-[var(--color-mint-deep)]">
          HOME FRIDGE
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
          우리집냉장고
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          오늘 꼭 확인해야 할 식품은{" "}
          <span className="font-semibold text-[var(--color-today)]">
            {summary.today}개
          </span>
          입니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link
            href="/foods/new"
            className="inline-flex rounded-full bg-[var(--color-mint)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5"
          >
            식품 추가
          </Link>
          <Link
            href="/stats"
            className="inline-flex rounded-full border border-[var(--color-line)] bg-white/80 px-4 py-2.5 text-sm font-semibold text-[var(--color-mint-deep)] hover:-translate-y-0.5"
          >
            통계 보기
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <SummaryCard label="전체" value={summary.total} tone="mint" />
        <SummaryCard label="오늘" value={summary.today} tone="today" />
        <SummaryCard label="3일 이내" value={summary.soon} tone="soon" />
        <SummaryCard label="만료" value={summary.expired} tone="expired" />
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="먼저 먹어야 할 식품"
          subtitle="보관공간별로 소비기한이 임박한 식품을 정리했어요"
        />
        {groupedUrgentFoods.length > 0 ? (
          <div className="space-y-4">
            {groupedUrgentFoods.map((group) => (
              <section
                key={group.id}
                className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-[var(--color-ink)]">
                    {group.name}
                  </h3>
                  <span className="rounded-full bg-[var(--color-bg-strong)] px-3 py-1 text-xs font-semibold text-[var(--color-mint-deep)]">
                    {group.items.length}개
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {group.items.map((food) => (
                    <FoodCard
                      key={food.id}
                      food={food}
                      storageSpaceName={getStorageSpaceName(food.storageSpaceId)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] px-5 py-7 text-sm text-[var(--color-muted)]">
            지금 바로 먹어야 할 식품은 없어요.
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader title="보관공간별 식품 수" />
        <div className="grid gap-3">
          {storageSummaries.map((space) => {
            const foodInSpace = getSortedFoodsByUrgency(
              foods.filter((food) => food.storageSpaceId === space.id),
            );
            const mostUrgent = foodInSpace[0];

            return (
              <Link
                key={space.id}
                href={`/storage-spaces/${space.id}`}
                className="block rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4 shadow-[var(--shadow-card)] outline-none hover:border-[#d5e4dd] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--color-mint)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--color-ink)]">
                      {space.name}
                    </h3>
                    <p className="mt-0.5 text-[13px] text-[var(--color-muted)]">
                      {space.count}개 식품 보관 중
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--color-bg-strong)] px-3 py-1 text-sm font-semibold text-[var(--color-mint-deep)]">
                    {space.count}
                  </span>
                </div>
                <p className="mt-2.5 text-[12px] text-[var(--color-muted)]">
                  {mostUrgent
                    ? `가장 임박한 식품: ${mostUrgent.name}`
                    : "보관 중인 식품이 없어요."}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="폐기 통계"
          subtitle="버린 식품 기록과 패턴을 확인할 수 있어요"
        />
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
          <p className="text-sm leading-6 text-[var(--color-muted)]">
            홈에서는 핵심 식품 정보만 빠르게 보고, 폐기 리포트는 따로 모아서
            확인할 수 있게 정리했어요.
          </p>
          <Link
            href="/stats"
            className="mt-4 inline-flex rounded-full border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--color-mint-deep)] hover:-translate-y-0.5"
          >
            폐기 통계 자세히 보기
          </Link>
        </div>
      </section>

      <FixedBottomActionBar>
        <Link
          href="/foods/new"
          className="flex w-full items-center justify-center rounded-2xl border border-[#8abda9] bg-[linear-gradient(135deg,#87bca9_0%,#72ac98_100%)] px-5 py-4 text-center text-base font-semibold text-white shadow-sm hover:-translate-y-0.5"
        >
          + 식품 추가
        </Link>
      </FixedBottomActionBar>
    </div>
  );
}
