const MAX_EXPIRY_HISTORY_ITEMS = 200;
const ONE_DAY_MS = 1000 * 60 * 60 * 24;
let expiryHistoryStore: ExpiryHistoryRecord[] = [];

export type ExpiryHistoryRecord = {
  foodName: string;
  storageSpaceId: string;
  storageSpaceName: string;
  expiryDays: number;
  savedAt: string;
};

export type LearnedExpiryPattern = {
  recommendedDays: number;
  reason: string;
  sourceType: "learned_by_food_and_space" | "learned_by_food";
  sampleCount: number;
};

function normalizePatternText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDateString(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = parseDateString(value);
  const [year, month, day] = value.split("-").map(Number);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function normalizeDateInput(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  if (/^\d{8}$/.test(trimmedValue)) {
    return `${trimmedValue.slice(0, 4)}-${trimmedValue.slice(4, 6)}-${trimmedValue.slice(6, 8)}`;
  }

  const normalizedSeparators = trimmedValue.replace(/[./]/g, "-");
  const completeDateMatch = normalizedSeparators.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
  );

  if (!completeDateMatch) {
    return trimmedValue;
  }

  const [, year, month, day] = completeDateMatch;
  return [year, month.padStart(2, "0"), day.padStart(2, "0")].join("-");
}

function finalizeDateInput(value: string) {
  const normalizedValue = normalizeDateInput(value);
  return isValidDateString(normalizedValue) ? normalizedValue : null;
}

export function getExpiryDaysFromToday(expiryDate: string, baseDate = new Date()) {
  const finalizedDate = finalizeDateInput(expiryDate);

  if (!finalizedDate) {
    return null;
  }

  const targetDate = startOfLocalDay(parseDateString(finalizedDate));
  const today = startOfLocalDay(baseDate);

  return Math.round((targetDate.getTime() - today.getTime()) / ONE_DAY_MS);
}

function readExpiryHistory() {
  return expiryHistoryStore;
}

function writeExpiryHistory(nextHistory: ExpiryHistoryRecord[]) {
  expiryHistoryStore = nextHistory;
}

export function recordExpiryHistory(input: {
  foodName: string;
  storageSpaceId: string;
  storageSpaceName: string;
  expiryDate: string;
}) {
  const foodName = input.foodName.trim();
  const storageSpaceId = input.storageSpaceId.trim();
  const storageSpaceName = input.storageSpaceName.trim();
  const expiryDays = getExpiryDaysFromToday(input.expiryDate);

  if (!foodName || !storageSpaceId || !storageSpaceName || expiryDays === null) {
    return;
  }

  const nextRecord: ExpiryHistoryRecord = {
    foodName,
    storageSpaceId,
    storageSpaceName,
    expiryDays,
    savedAt: new Date().toISOString(),
  };

  const nextHistory = [...readExpiryHistory(), nextRecord].slice(
    -MAX_EXPIRY_HISTORY_ITEMS,
  );
  writeExpiryHistory(nextHistory);
}

export function getMedianValue(values: number[]) {
  if (!values.length) {
    return null;
  }

  const sortedValues = [...values].sort((left, right) => left - right);
  const middleIndex = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 1) {
    return sortedValues[middleIndex];
  }

  return Math.round(
    (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2,
  );
}

export function getLearnedExpiryPattern(
  foodName: string,
  storageSpaceId?: string,
  storageSpaceName?: string,
): LearnedExpiryPattern | null {
  const normalizedFoodName = normalizePatternText(foodName);

  if (!normalizedFoodName) {
    return null;
  }

  const history = readExpiryHistory();
  const matchedFoodRecords = history.filter(
    (record) => normalizePatternText(record.foodName) === normalizedFoodName,
  );

  const matchedFoodAndSpaceRecords = storageSpaceId
    ? matchedFoodRecords.filter(
        (record) => record.storageSpaceId === storageSpaceId,
      )
    : [];

  if (matchedFoodAndSpaceRecords.length >= 2) {
    const medianDays = getMedianValue(
      matchedFoodAndSpaceRecords.map((record) => record.expiryDays),
    );

    if (medianDays !== null) {
      return {
        recommendedDays: Math.max(1, medianDays),
        reason: `최근 ${foodName.trim()} + ${(storageSpaceName ?? matchedFoodAndSpaceRecords.at(-1)?.storageSpaceName ?? "선택 공간").trim()} 입력 패턴 기준 ${Math.max(1, medianDays)}일`,
        sourceType: "learned_by_food_and_space",
        sampleCount: matchedFoodAndSpaceRecords.length,
      };
    }
  }

  if (matchedFoodRecords.length >= 2) {
    const medianDays = getMedianValue(
      matchedFoodRecords.map((record) => record.expiryDays),
    );

    if (medianDays !== null) {
      return {
        recommendedDays: Math.max(1, medianDays),
        reason: `최근 ${foodName.trim()} 입력 패턴 기준 ${Math.max(1, medianDays)}일`,
        sourceType: "learned_by_food",
        sampleCount: matchedFoodRecords.length,
      };
    }
  }

  return null;
}
