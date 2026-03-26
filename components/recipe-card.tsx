import type { RecommendedRecipe } from "@/lib/recipe-recommend";

type RecipeCardProps = {
  recipe: RecommendedRecipe;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <article className="rounded-[28px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-5 shadow-[var(--shadow-card-strong)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
            {recipe.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            {recipe.description}
          </p>
        </div>
        <div className="shrink-0 rounded-3xl bg-[var(--color-bg-strong)] px-4 py-3 text-center text-[var(--color-mint-deep)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <p className="text-2xl font-semibold leading-none">{recipe.matchCount}</p>
          <p className="mt-1 text-[11px] font-medium tracking-[0.03em] leading-none">
            재료 일치
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {recipe.matchedIngredients.map((ingredient) => (
          <span
            key={ingredient}
            className="rounded-full border border-[#d4f1e1] bg-[#ecfaf4] px-3 py-1.5 text-xs font-semibold text-[var(--color-fresh)]"
          >
            {ingredient}
          </span>
        ))}
        {recipe.missingIngredients.map((ingredient) => (
          <span
            key={ingredient}
            className="rounded-full border border-[#e5ebf2] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[var(--color-expired)]"
          >
            부족: {ingredient}
          </span>
        ))}
      </div>
    </article>
  );
}
