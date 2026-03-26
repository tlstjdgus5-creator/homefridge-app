"use client";

import { RecipeCard } from "@/components/recipe-card";
import { SectionHeader } from "@/components/section-header";
import { getRecipesForExpiringFoods, getRecipesForOwnedFoods } from "@/lib/recipe-recommend";
import { useFoodStore } from "@/lib/food-store";

export function RecipesPageClient() {
  const { foods, isLoading, error } = useFoodStore();
  const expiringRecipes = getRecipesForExpiringFoods(foods);
  const ownedRecipes = getRecipesForOwnedFoods(foods);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
          추천에 필요한 식품 데이터를 불러오는 중이에요.
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3 text-sm text-[var(--color-today)]">
          {error}
        </div>
      ) : null}
      <section className="rounded-[28px] bg-[linear-gradient(135deg,#eef9f4_0%,#f8fffc_55%,#fff9ef_100%)] px-5 py-6 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-[var(--color-mint-deep)]">
          재료 기반 추천
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
          지금 있는 재료로 만들 수 있는 메뉴를 골라보세요
        </h1>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="임박 식품용"
          subtitle="먼저 소진해야 하는 식품을 중심으로 추천합니다"
        />
        <div className="space-y-3">
          {expiringRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="보유 식품용"
          subtitle="현재 보유 식품과의 재료 일치도를 기준으로 정렬합니다"
        />
        <div className="space-y-3">
          {ownedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>
    </div>
  );
}
