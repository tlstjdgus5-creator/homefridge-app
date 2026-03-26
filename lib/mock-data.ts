export type Food = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  storageSpaceId: string;
};

export type StorageSpace = {
  id: string;
  name: string;
};

export type Recipe = {
  id: string;
  title: string;
  ingredients: string[];
  description: string;
};

export const storageSpaces: StorageSpace[] = [
  { id: "fridge-top", name: "냉장실 상단" },
  { id: "fridge-drawer", name: "야채칸" },
  { id: "freezer", name: "냉동실" },
  { id: "door", name: "문칸" },
  { id: "pantry", name: "실온 보관" },
];

export const foods: Food[] = [
  {
    id: "food-1",
    name: "우유",
    quantity: 1,
    unit: "팩",
    expiryDate: "2026-03-26",
    storageSpaceId: "door",
  },
  {
    id: "food-2",
    name: "달걀",
    quantity: 10,
    unit: "개",
    expiryDate: "2026-03-28",
    storageSpaceId: "fridge-top",
  },
  {
    id: "food-3",
    name: "시금치",
    quantity: 1,
    unit: "봉지",
    expiryDate: "2026-03-27",
    storageSpaceId: "fridge-drawer",
  },
  {
    id: "food-4",
    name: "두부",
    quantity: 1,
    unit: "모",
    expiryDate: "2026-03-25",
    storageSpaceId: "fridge-top",
  },
  {
    id: "food-5",
    name: "닭가슴살",
    quantity: 2,
    unit: "팩",
    expiryDate: "2026-03-31",
    storageSpaceId: "freezer",
  },
  {
    id: "food-6",
    name: "양파",
    quantity: 3,
    unit: "개",
    expiryDate: "2026-04-03",
    storageSpaceId: "pantry",
  },
  {
    id: "food-7",
    name: "김치",
    quantity: 1,
    unit: "통",
    expiryDate: "2026-04-10",
    storageSpaceId: "fridge-drawer",
  },
  {
    id: "food-8",
    name: "버섯",
    quantity: 1,
    unit: "팩",
    expiryDate: "2026-03-29",
    storageSpaceId: "fridge-drawer",
  },
  {
    id: "food-9",
    name: "베이컨",
    quantity: 1,
    unit: "팩",
    expiryDate: "2026-03-30",
    storageSpaceId: "fridge-top",
  },
];

export const recipes: Recipe[] = [
  {
    id: "recipe-1",
    title: "시금치 달걀 오믈렛",
    ingredients: ["달걀", "시금치", "우유", "버터"],
    description: "오늘 또는 곧 임박하는 채소와 달걀을 빠르게 소진하기 좋은 한 끼예요.",
  },
  {
    id: "recipe-2",
    title: "두부 김치 볶음",
    ingredients: ["두부", "김치", "양파", "대파"],
    description: "만료 직전 두부와 집에 있는 김치를 같이 써서 만드는 밥반찬입니다.",
  },
  {
    id: "recipe-3",
    title: "버섯 베이컨 크림파스타",
    ingredients: ["버섯", "베이컨", "우유", "파스타면"],
    description: "냉장고에 남은 버섯과 베이컨을 부드럽게 정리할 수 있어요.",
  },
  {
    id: "recipe-4",
    title: "닭가슴살 채소볶음",
    ingredients: ["닭가슴살", "양파", "버섯", "간장"],
    description: "냉동 닭가슴살과 기본 채소를 함께 사용하는 가벼운 단백질 메뉴예요.",
  },
  {
    id: "recipe-5",
    title: "김치 달걀 볶음밥",
    ingredients: ["김치", "달걀", "양파", "밥"],
    description: "보유 식품과의 일치율이 높고 부족 재료가 적어 바로 만들기 좋습니다.",
  },
];

export function getStorageSpaceName(storageSpaceId: string) {
  return (
    storageSpaces.find((space) => space.id === storageSpaceId)?.name ?? "미분류"
  );
}

export function getFoodCountsByStorageSpace() {
  return storageSpaces.map((space) => ({
    ...space,
    count: foods.filter((food) => food.storageSpaceId === space.id).length,
  }));
}
