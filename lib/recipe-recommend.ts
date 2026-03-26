import type { Food, Recipe } from "@/lib/mock-data";
import { recipes } from "@/lib/mock-data";
import { getFoodStatus } from "@/lib/food-status";

export type RecommendedRecipe = Recipe & {
  matchCount: number;
  matchedIngredients: string[];
  missingIngredients: string[];
};

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function rankRecipes(targetIngredients: string[]) {
  const targetSet = new Set(targetIngredients.map(normalizeName));

  return recipes
    .map((recipe) => {
      const matchedIngredients = recipe.ingredients.filter((ingredient) =>
        targetSet.has(normalizeName(ingredient)),
      );
      const missingIngredients = recipe.ingredients.filter(
        (ingredient) => !targetSet.has(normalizeName(ingredient)),
      );

      return {
        ...recipe,
        matchCount: matchedIngredients.length,
        matchedIngredients,
        missingIngredients,
      };
    })
    .filter((recipe) => recipe.matchCount > 0)
    .sort((a, b) => {
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      return a.missingIngredients.length - b.missingIngredients.length;
    });
}

export function getRecipesForExpiringFoods(items: Food[]): RecommendedRecipe[] {
  const expiringIngredients = items
    .filter((food) => {
      const status = getFoodStatus(food);
      return status === "today" || status === "soon" || status === "expired";
    })
    .map((food) => food.name);

  return rankRecipes(expiringIngredients);
}

export function getRecipesForOwnedFoods(items: Food[]): RecommendedRecipe[] {
  return rankRecipes(items.map((food) => food.name));
}
