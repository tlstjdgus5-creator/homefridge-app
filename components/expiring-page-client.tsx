"use client";

import { FoodCard } from "@/components/food-card";
import { SectionHeader } from "@/components/section-header";
import { getFoodStatus, getSortedFoodsByUrgency } from "@/lib/food-status";
import { useFoodStore } from "@/lib/food-store";

const sections = [
  { key: "today", title: "오늘 먹어야 해요", subtitle: "오늘까지인 식품" },
  { key: "soon", title: "곧 임박해요", subtitle: "3일 이내 식품" },
  { key: "expired", title: "이미 만료됐어요", subtitle: "빠른 확인이 필요해요" },
] as const;

export function ExpiringPageClient() {
  const { foods, getStorageSpaceName, isLoading, error } = useFoodStore();
  const sortedFoods = getSortedFoodsByUrgency(foods);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
          임박 식품 데이터를 불러오는 중이에요.
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3 text-sm text-[var(--color-today)]">
          {error}
        </div>
      ) : null}
      <section className="rounded-[28px] bg-[linear-gradient(135deg,#fff4eb_0%,#fffaf0_52%,#f4fbf8_100%)] px-5 py-6 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-[var(--color-soon)]">
          임박 식품 관리
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
          소비기한 상태별로 빠르게 확인하세요
        </h1>
      </section>

      {sections.map((section) => {
        const items = sortedFoods.filter(
          (food) => getFoodStatus(food) === section.key,
        );

        return (
          <section key={section.key} className="space-y-3">
            <SectionHeader title={section.title} subtitle={section.subtitle} />
            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((food) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    storageSpaceName={getStorageSpaceName(food.storageSpaceId)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-6 text-sm text-[var(--color-muted)]">
                해당 상태의 식품이 없습니다.
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
