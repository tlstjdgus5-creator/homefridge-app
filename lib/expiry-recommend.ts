import { getLearnedExpiryPattern } from "@/lib/expiry-history";

const expiryRecommendationDays: Record<string, number> = {
  우유: 7,
  달걀: 14,
  계란: 14,
  두부: 3,
  버섯: 5,
  시금치: 3,
  베이컨: 7,
  닭가슴살: 2,
  양파: 14,
  김치: 30,
};

const storageAdjustments = [
  { keywords: ["냉동"], days: 21, reason: "냉동 보관" },
  { keywords: ["김치"], days: 10, reason: "김치냉장고 보관" },
  { keywords: ["냉장"], days: 0, reason: "냉장 보관" },
] as const;

const foodNameAdjustments = [
  { keywords: ["개봉", "남은", "잘라놓은"], days: -2, reason: "개봉 상태" },
  { keywords: ["반찬", "조리", "볶음", "국"], days: -2, reason: "조리된 식품" },
  { keywords: ["냉동", "진공", "소분"], days: 3, reason: "추가 보관 처리" },
] as const;

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function getBaseRecommendation(foodName: string) {
  const normalizedFoodName = normalizeName(foodName);

  const matchedEntry = Object.entries(expiryRecommendationDays).find(([name]) =>
    normalizedFoodName.includes(normalizeName(name)),
  );

  return matchedEntry
    ? {
        matchedName: matchedEntry[0],
        days: matchedEntry[1],
      }
    : null;
}

export function addDaysFromToday(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function normalizeDateInput(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  // 숫자 8자리 전체 입력은 YYYYMMDD 형태로 보고 정규화합니다.
  if (/^\d{8}$/.test(trimmedValue)) {
    return `${trimmedValue.slice(0, 4)}-${trimmedValue.slice(4, 6)}-${trimmedValue.slice(6, 8)}`;
  }

  // 완성된 날짜 문자열만 YYYY-MM-DD로 바꿉니다. 입력 중인 값은 그대로 둡니다.
  const normalizedSeparators = trimmedValue.replace(/[./]/g, "-");
  const completeDateMatch = normalizedSeparators.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
  );

  if (completeDateMatch) {
    const [, year, month, day] = completeDateMatch;

    return [year, month.padStart(2, "0"), day.padStart(2, "0")].join("-");
  }

  return trimmedValue;
}

export function finalizeDateInput(value: string) {
  const normalizedValue = normalizeDateInput(value);

  return isValidDateString(normalizedValue) ? normalizedValue : null;
}

export type ExpiryRecommendationResult = {
  recommendedDate: string;
  recommendedDays: number;
  reason: string;
  sourceType:
    | "learned_by_food_and_space"
    | "learned_by_food"
    | "default_rule";
};

export function getExpiryRecommendation(
  foodName: string,
  storageSpaceId?: string,
  storageSpaceName?: string,
): ExpiryRecommendationResult | null {
  const learnedPattern = getLearnedExpiryPattern(
    foodName,
    storageSpaceId,
    storageSpaceName,
  );

  if (learnedPattern) {
    return {
      recommendedDate: addDaysFromToday(learnedPattern.recommendedDays),
      recommendedDays: learnedPattern.recommendedDays,
      reason: learnedPattern.reason,
      sourceType: learnedPattern.sourceType,
    };
  }

  const baseRecommendation = getBaseRecommendation(foodName);

  if (!baseRecommendation) {
    return null;
  }

  let recommendedDays = baseRecommendation.days;
  const reasons = [`${baseRecommendation.matchedName} 기본 ${baseRecommendation.days}일`];

  const normalizedStorageSpaceName = normalizeName(storageSpaceName ?? "");
  const storageAdjustment = storageAdjustments.find((adjustment) =>
    adjustment.keywords.some((keyword) =>
      normalizedStorageSpaceName.includes(normalizeName(keyword)),
    ),
  );

  if (storageAdjustment) {
    recommendedDays += storageAdjustment.days;
    reasons.push(
      storageAdjustment.days >= 0
        ? `+ ${storageAdjustment.reason}`
        : `- ${storageAdjustment.reason}`,
    );
  }

  const normalizedFoodName = normalizeName(foodName);
  foodNameAdjustments.forEach((adjustment) => {
    const isMatched = adjustment.keywords.some((keyword) =>
      normalizedFoodName.includes(normalizeName(keyword)),
    );

    if (!isMatched) {
      return;
    }

    recommendedDays += adjustment.days;
    reasons.push(
      adjustment.days >= 0
        ? `+ ${adjustment.reason}`
        : `- ${adjustment.reason}`,
    );
  });

  const safeRecommendedDays = Math.max(1, recommendedDays);

  return {
    recommendedDate: addDaysFromToday(safeRecommendedDays),
    recommendedDays: safeRecommendedDays,
    reason: reasons.join(" "),
    sourceType: "default_rule",
  };
}
