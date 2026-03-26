import type { FoodStatus } from "@/lib/food-status";
import { getDaysUntilExpiry } from "@/lib/food-status";
import type { ConsumeLog } from "@/lib/consume-log";

export type DiscardLog = {
  id: string;
  foodName: string;
  quantity: number;
  unit: string;
  storageSpaceId: string;
  storageSpaceName: string;
  expiryDate: string;
  discardedAt: string;
  statusAtDiscard: FoodStatus;
};

export type DiscardStats = {
  totalCount: number;
  currentMonthCount: number;
  mostDiscardedFoodName: string | null;
  topDiscardedFoods: Array<{
    foodName: string;
    count: number;
  }>;
  storageSpaceCounts: Array<{
    storageSpaceId: string;
    storageSpaceName: string;
    count: number;
  }>;
  recentDiscards: DiscardLog[];
  dailyDiscardCounts: Array<{
    dateKey: string;
    label: string;
    count: number;
  }>;
  consumeCount: number;
  discardRatio: number;
  consumeRatio: number;
  avoidableDiscards: Array<
    DiscardLog & {
      daysUntilExpiry: number;
    }
  >;
};

function formatDayLabel(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
}

function getRecentDateBuckets(days: number) {
  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return {
      dateKey: `${year}-${month}-${day}`,
      label: formatDayLabel(date),
    };
  });
}

export function getDiscardStats(
  discardLogs: DiscardLog[],
  consumeLogs: ConsumeLog[] = [],
): DiscardStats {
  const now = new Date();
  const foodCounts = new Map<string, number>();
  const storageCounts = new Map<
    string,
    { storageSpaceId: string; storageSpaceName: string; count: number }
  >();
  let currentMonthCount = 0;

  discardLogs.forEach((log) => {
    foodCounts.set(log.foodName, (foodCounts.get(log.foodName) ?? 0) + 1);

    const currentStorageCount = storageCounts.get(log.storageSpaceId);
    storageCounts.set(log.storageSpaceId, {
      storageSpaceId: log.storageSpaceId,
      storageSpaceName: log.storageSpaceName,
      count: (currentStorageCount?.count ?? 0) + 1,
    });

    const discardedDate = new Date(log.discardedAt);
    if (
      discardedDate.getFullYear() === now.getFullYear() &&
      discardedDate.getMonth() === now.getMonth()
    ) {
      currentMonthCount += 1;
    }
  });

  const topDiscardedFoods = [...foodCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([foodName, count]) => ({ foodName, count }));

  const mostDiscardedFoodName = topDiscardedFoods[0]?.foodName ?? null;

  const storageSpaceCounts = [...storageCounts.values()].sort(
    (left, right) => right.count - left.count,
  );

  const recentDiscards = [...discardLogs]
    .sort(
      (left, right) =>
        new Date(right.discardedAt).getTime() - new Date(left.discardedAt).getTime(),
    )
    .slice(0, 5);
  const dailyDiscardCounts = getRecentDateBuckets(7).map((bucket) => ({
    ...bucket,
    count: discardLogs.filter((log) => log.discardedAt.startsWith(bucket.dateKey))
      .length,
  }));
  const totalHandledCount = consumeLogs.length + discardLogs.length;
  const discardRatio =
    totalHandledCount > 0 ? Math.round((discardLogs.length / totalHandledCount) * 100) : 0;
  const consumeRatio =
    totalHandledCount > 0 ? Math.round((consumeLogs.length / totalHandledCount) * 100) : 0;
  const avoidableDiscards = [...discardLogs]
    .filter(
      (log) => log.statusAtDiscard === "fresh" || log.statusAtDiscard === "soon",
    )
    .map((log) => ({
      ...log,
      daysUntilExpiry: getDaysUntilExpiry(log.expiryDate),
    }))
    .sort(
      (left, right) =>
        new Date(right.discardedAt).getTime() - new Date(left.discardedAt).getTime(),
    )
    .slice(0, 5);

  return {
    totalCount: discardLogs.length,
    currentMonthCount,
    mostDiscardedFoodName,
    topDiscardedFoods,
    storageSpaceCounts,
    recentDiscards,
    dailyDiscardCounts,
    consumeCount: consumeLogs.length,
    discardRatio,
    consumeRatio,
    avoidableDiscards,
  };
}
