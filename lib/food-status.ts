import type { Food } from "@/lib/mock-data";

export type FoodStatus = "fresh" | "soon" | "today" | "expired";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function normalizeDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`);
}

function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getDaysUntilExpiry(expiryDate: string) {
  const diff = normalizeDate(expiryDate).getTime() - getToday().getTime();
  return Math.round(diff / MS_PER_DAY);
}

export function getFoodStatus(food: Food): FoodStatus {
  const days = getDaysUntilExpiry(food.expiryDate);

  if (days < 0) {
    return "expired";
  }
  if (days === 0) {
    return "today";
  }
  if (days <= 3) {
    return "soon";
  }
  return "fresh";
}

export function getFoodStatusLabel(status: FoodStatus) {
  switch (status) {
    case "fresh":
      return "여유";
    case "soon":
      return "임박";
    case "today":
      return "오늘";
    case "expired":
      return "만료";
    default:
      return "여유";
  }
}

const statusPriority: Record<FoodStatus, number> = {
  expired: 0,
  today: 1,
  soon: 2,
  fresh: 3,
};

export function getSortedFoodsByUrgency(items: Food[]) {
  return [...items].sort((a, b) => {
    const statusDiff =
      statusPriority[getFoodStatus(a)] - statusPriority[getFoodStatus(b)];

    if (statusDiff !== 0) {
      return statusDiff;
    }

    return getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate);
  });
}

export function summarizeFoodStatuses(items: Food[]) {
  return items.reduce(
    (accumulator, food) => {
      const status = getFoodStatus(food);
      accumulator.total += 1;

      if (status === "today") {
        accumulator.today += 1;
      }
      if (status === "soon" || status === "today") {
        accumulator.soon += 1;
      }
      if (status === "expired") {
        accumulator.expired += 1;
      }

      return accumulator;
    },
    { total: 0, today: 0, soon: 0, expired: 0 },
  );
}
