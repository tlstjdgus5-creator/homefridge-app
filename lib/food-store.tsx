"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Food, StorageSpace } from "@/lib/mock-data";
import { getFoodStatus } from "@/lib/food-status";
import type { DiscardLog } from "@/lib/discard-log";
import type { ConsumeLog } from "@/lib/consume-log";
import { recordExpiryHistory } from "@/lib/expiry-history";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export type NewFoodInput = Omit<Food, "id">;
export type NewStorageSpaceInput = Omit<StorageSpace, "id">;

type StoreActionResult<T = void> = {
  ok: boolean;
  data?: T;
  message?: string;
};

type FoodStoreValue = {
  foods: Food[];
  storageSpaces: StorageSpace[];
  discardLogs: DiscardLog[];
  consumeLogs: ConsumeLog[];
  isLoading: boolean;
  error: string;
  addFood: (input: NewFoodInput) => Promise<StoreActionResult<Food>>;
  updateFood: (
    foodId: string,
    updates: Partial<NewFoodInput>,
  ) => Promise<StoreActionResult<Food>>;
  removeFood: (foodId: string) => Promise<StoreActionResult>;
  consumeFood: (foodId: string) => Promise<StoreActionResult>;
  discardFood: (foodId: string) => Promise<StoreActionResult>;
  addStorageSpace: (
    input: NewStorageSpaceInput,
  ) => Promise<StoreActionResult<StorageSpace>>;
  updateStorageSpace: (
    storageSpaceId: string,
    updates: Partial<NewStorageSpaceInput>,
  ) => Promise<StoreActionResult<StorageSpace>>;
  removeStorageSpace: (storageSpaceId: string) => Promise<{
    ok: boolean;
    message?: string;
  }>;
  getStorageSpaceName: (storageSpaceId: string) => string;
  refreshData: () => Promise<void>;
};

type FoodItemRow = {
  id: string;
  name: string;
  quantity: number | string;
  unit: string;
  expiry_date: string;
  storage_space_id: string;
  created_at?: string;
};

type StorageSpaceRow = {
  id: string;
  name: string;
  created_at?: string;
};

type DiscardLogRow = {
  id: string;
  food_name: string;
  quantity: number | string;
  unit: string;
  storage_space_id: string | null;
  storage_space_name: string | null;
  expiry_date: string | null;
  discarded_at: string;
  status_at_discard: DiscardLog["statusAtDiscard"] | null;
};

const FoodStoreContext = createContext<FoodStoreValue | null>(null);

function mapFoodRowToFood(row: FoodItemRow): Food {
  return {
    id: row.id,
    name: row.name,
    quantity: Number(row.quantity),
    unit: row.unit,
    expiryDate: row.expiry_date,
    storageSpaceId: row.storage_space_id,
  };
}

function mapStorageSpaceRow(row: StorageSpaceRow): StorageSpace {
  return {
    id: row.id,
    name: row.name,
  };
}

function mapDiscardLogRow(row: DiscardLogRow): DiscardLog {
  return {
    id: row.id,
    foodName: row.food_name,
    quantity: Number(row.quantity),
    unit: row.unit,
    storageSpaceId: row.storage_space_id ?? "",
    storageSpaceName: row.storage_space_name ?? "미분류",
    expiryDate: row.expiry_date ?? "",
    discardedAt: row.discarded_at,
    statusAtDiscard: row.status_at_discard ?? "expired",
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error instanceof TypeError &&
    /(load failed|fetch failed|network)/i.test(error.message)
  ) {
    return "Supabase 서버에 연결하지 못했어요. .env.local의 NEXT_PUBLIC_SUPABASE_URL 값을 Supabase 대시보드의 프로젝트 URL로 다시 확인해주세요.";
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const supabaseError = error as {
      message: string;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };
    if (/(load failed|fetch failed|network)/i.test(supabaseError.message)) {
      return "Supabase 서버에 연결하지 못했어요. .env.local의 NEXT_PUBLIC_SUPABASE_URL 값을 Supabase 대시보드의 프로젝트 URL로 다시 확인해주세요.";
    }
    const details =
      typeof supabaseError.details === "string" && supabaseError.details
        ? ` (${supabaseError.details})`
        : "";
    const hint =
      typeof supabaseError.hint === "string" && supabaseError.hint
        ? ` 힌트: ${supabaseError.hint}`
        : "";
    const code =
      typeof supabaseError.code === "string" && supabaseError.code
        ? ` [${supabaseError.code}]`
        : "";

    return `${supabaseError.message}${details}${hint}${code}`;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function FoodStoreProvider({ children }: { children: ReactNode }) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [storageSpaces, setStorageSpaces] = useState<StorageSpace[]>([]);
  const [discardLogs, setDiscardLogs] = useState<DiscardLog[]>([]);
  const [consumeLogs, setConsumeLogs] = useState<ConsumeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshData() {
    if (!hasSupabaseEnv()) {
      setError(
        "Supabase 환경변수가 설정되지 않았어요. .env.local 값을 먼저 확인해주세요.",
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const client = getSupabaseClient();
      const [storageSpacesResult, foodsResult, discardLogsResult] = await Promise.all([
        client
          .from("storage_spaces")
          .select("id, name, created_at")
          .order("created_at", { ascending: true }),
        client
          .from("food_items")
          .select("id, name, quantity, unit, expiry_date, storage_space_id, created_at")
          .order("created_at", { ascending: false }),
        client
          .from("discard_logs")
          .select(
            "id, food_name, quantity, unit, storage_space_id, storage_space_name, expiry_date, discarded_at, status_at_discard",
          )
          .order("discarded_at", { ascending: false }),
      ]);

      if (storageSpacesResult.error) {
        throw storageSpacesResult.error;
      }
      if (foodsResult.error) {
        throw foodsResult.error;
      }
      if (discardLogsResult.error) {
        throw discardLogsResult.error;
      }

      setStorageSpaces(
        ((storageSpacesResult.data ?? []) as StorageSpaceRow[]).map(
          mapStorageSpaceRow,
        ),
      );
      setFoods(((foodsResult.data ?? []) as FoodItemRow[]).map(mapFoodRowToFood));
      setDiscardLogs(
        ((discardLogsResult.data ?? []) as DiscardLogRow[]).map(mapDiscardLogRow),
      );
      setError("");
    } catch (nextError) {
      console.error("refreshData error", nextError);
      setError(
        getErrorMessage(nextError, "Supabase 데이터를 불러오는 중 문제가 생겼어요."),
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refreshData();
  }, []);

  async function addFood(input: NewFoodInput): Promise<StoreActionResult<Food>> {
    try {
      const client = getSupabaseClient();
      const { data, error: insertError } = await client
        .from("food_items")
        .insert({
          name: input.name.trim(),
          quantity: input.quantity,
          unit: input.unit.trim(),
          expiry_date: input.expiryDate,
          storage_space_id: input.storageSpaceId,
        })
        .select("id, name, quantity, unit, expiry_date, storage_space_id, created_at")
        .single();

      if (insertError) {
        throw insertError;
      }

      const newFood = mapFoodRowToFood(data as FoodItemRow);
      setFoods((current) => [newFood, ...current]);
      setError("");

      recordExpiryHistory({
        foodName: newFood.name,
        storageSpaceId: newFood.storageSpaceId,
        storageSpaceName:
          storageSpaces.find((space) => space.id === newFood.storageSpaceId)?.name ??
          "미분류",
        expiryDate: newFood.expiryDate,
      });

      return { ok: true, data: newFood };
    } catch (nextError) {
      const message = getErrorMessage(nextError, "식품 저장 중 문제가 생겼어요.");
      setError(message);
      return { ok: false, message };
    }
  }

  async function updateFood(
    foodId: string,
    updates: Partial<NewFoodInput>,
  ): Promise<StoreActionResult<Food>> {
    try {
      const client = getSupabaseClient();
      const { data, error: updateError } = await client
        .from("food_items")
        .update({
          ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
          ...(updates.quantity !== undefined ? { quantity: updates.quantity } : {}),
          ...(updates.unit !== undefined ? { unit: updates.unit.trim() } : {}),
          ...(updates.expiryDate !== undefined
            ? { expiry_date: updates.expiryDate }
            : {}),
          ...(updates.storageSpaceId !== undefined
            ? { storage_space_id: updates.storageSpaceId }
            : {}),
        })
        .eq("id", foodId)
        .select("id, name, quantity, unit, expiry_date, storage_space_id, created_at")
        .single();

      if (updateError) {
        throw updateError;
      }

      const nextFood = mapFoodRowToFood(data as FoodItemRow);
      setFoods((current) =>
        current.map((food) => (food.id === foodId ? nextFood : food)),
      );
      setError("");

      recordExpiryHistory({
        foodName: nextFood.name,
        storageSpaceId: nextFood.storageSpaceId,
        storageSpaceName:
          storageSpaces.find((space) => space.id === nextFood.storageSpaceId)?.name ??
          "미분류",
        expiryDate: nextFood.expiryDate,
      });

      return { ok: true, data: nextFood };
    } catch (nextError) {
      const message = getErrorMessage(nextError, "식품 수정 중 문제가 생겼어요.");
      setError(message);
      return { ok: false, message };
    }
  }

  async function removeFood(foodId: string): Promise<StoreActionResult> {
    try {
      const client = getSupabaseClient();
      const { error: deleteError } = await client
        .from("food_items")
        .delete()
        .eq("id", foodId);

      if (deleteError) {
        throw deleteError;
      }

      setFoods((current) => current.filter((food) => food.id !== foodId));
      setError("");
      return { ok: true };
    } catch (nextError) {
      const message = getErrorMessage(nextError, "식품 삭제 중 문제가 생겼어요.");
      setError(message);
      return { ok: false, message };
    }
  }

  async function consumeFood(foodId: string): Promise<StoreActionResult> {
    const targetFood = foods.find((food) => food.id === foodId);

    if (!targetFood) {
      return { ok: false, message: "식품 정보를 찾을 수 없어요." };
    }

    try {
      const result = await removeFood(foodId);

      if (!result.ok) {
        return result;
      }

      const storageSpaceName =
        storageSpaces.find((space) => space.id === targetFood.storageSpaceId)?.name ??
        "미분류";

      // consume_logs 테이블은 아직 스키마가 없어서 현재는 세션 상태에만 남깁니다.
      setConsumeLogs((current) => [
        {
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `consume-${Date.now()}`,
          foodName: targetFood.name,
          quantity: targetFood.quantity,
          unit: targetFood.unit,
          storageSpaceId: targetFood.storageSpaceId,
          storageSpaceName,
          expiryDate: targetFood.expiryDate,
          consumedAt: new Date().toISOString(),
        },
        ...current,
      ]);

      return { ok: true };
    } catch (nextError) {
      const message = getErrorMessage(
        nextError,
        "소비완료 처리 중 문제가 생겼어요.",
      );
      setError(message);
      return { ok: false, message };
    }
  }

  async function discardFood(foodId: string): Promise<StoreActionResult> {
    const targetFood = foods.find((food) => food.id === foodId);

    if (!targetFood) {
      return { ok: false, message: "식품 정보를 찾을 수 없어요." };
    }

    try {
      const client = getSupabaseClient();
      const storageSpaceName =
        storageSpaces.find((space) => space.id === targetFood.storageSpaceId)?.name ??
        "미분류";

      const { data, error: insertError } = await client
        .from("discard_logs")
        .insert({
          food_name: targetFood.name,
          quantity: targetFood.quantity,
          unit: targetFood.unit,
          storage_space_id: targetFood.storageSpaceId,
          storage_space_name: storageSpaceName,
          expiry_date: targetFood.expiryDate,
          status_at_discard: getFoodStatus(targetFood),
        })
        .select(
          "id, food_name, quantity, unit, storage_space_id, storage_space_name, expiry_date, discarded_at, status_at_discard",
        )
        .single();

      if (insertError) {
        throw insertError;
      }

      const removeResult = await removeFood(foodId);

      if (!removeResult.ok) {
        return removeResult;
      }

      setDiscardLogs((current) => [
        mapDiscardLogRow(data as DiscardLogRow),
        ...current,
      ]);
      setError("");
      return { ok: true };
    } catch (nextError) {
      const message = getErrorMessage(nextError, "폐기 처리 중 문제가 생겼어요.");
      setError(message);
      return { ok: false, message };
    }
  }

  async function addStorageSpace(
    input: NewStorageSpaceInput,
  ): Promise<StoreActionResult<StorageSpace>> {
    try {
      const client = getSupabaseClient();
      const { data, error: insertError } = await client
        .from("storage_spaces")
        .insert({ name: input.name.trim() })
        .select("id, name, created_at")
        .single();

      if (insertError) {
        throw insertError;
      }

      const newStorageSpace = mapStorageSpaceRow(data as StorageSpaceRow);
      setStorageSpaces((current) => [...current, newStorageSpace]);
      setError("");
      return { ok: true, data: newStorageSpace };
    } catch (nextError) {
      console.error("addStorageSpace error", {
        payload: { name: input.name.trim() },
        error: nextError,
      });
      const message = getErrorMessage(
        nextError,
        "보관공간 저장 중 문제가 생겼어요.",
      );
      setError(message);
      return { ok: false, message };
    }
  }

  async function updateStorageSpace(
    storageSpaceId: string,
    updates: Partial<NewStorageSpaceInput>,
  ): Promise<StoreActionResult<StorageSpace>> {
    try {
      const client = getSupabaseClient();
      const { data, error: updateError } = await client
        .from("storage_spaces")
        .update({
          ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
        })
        .eq("id", storageSpaceId)
        .select("id, name, created_at")
        .single();

      if (updateError) {
        throw updateError;
      }

      const nextStorageSpace = mapStorageSpaceRow(data as StorageSpaceRow);
      setStorageSpaces((current) =>
        current.map((space) =>
          space.id === storageSpaceId ? nextStorageSpace : space,
        ),
      );
      setError("");
      return { ok: true, data: nextStorageSpace };
    } catch (nextError) {
      console.error("updateStorageSpace error", {
        storageSpaceId,
        payload: updates,
        error: nextError,
      });
      const message = getErrorMessage(
        nextError,
        "보관공간 수정 중 문제가 생겼어요.",
      );
      setError(message);
      return { ok: false, message };
    }
  }

  async function removeStorageSpace(storageSpaceId: string) {
    const hasLinkedFoods = foods.some((food) => food.storageSpaceId === storageSpaceId);

    if (hasLinkedFoods) {
      return {
        ok: false,
        message: "이 공간을 사용하는 식품이 있어 삭제할 수 없어요.",
      };
    }

    try {
      const client = getSupabaseClient();
      const { error: deleteError } = await client
        .from("storage_spaces")
        .delete()
        .eq("id", storageSpaceId);

      if (deleteError) {
        throw deleteError;
      }

      setStorageSpaces((current) =>
        current.filter((space) => space.id !== storageSpaceId),
      );
      setError("");
      return { ok: true };
    } catch (nextError) {
      console.error("removeStorageSpace error", {
        storageSpaceId,
        error: nextError,
      });
      const message = getErrorMessage(
        nextError,
        "보관공간 삭제 중 문제가 생겼어요.",
      );
      setError(message);
      return { ok: false, message };
    }
  }

  const value: FoodStoreValue = {
    foods,
    storageSpaces,
    discardLogs,
    consumeLogs,
    isLoading,
    error,
    addFood,
    updateFood,
    removeFood,
    consumeFood,
    discardFood,
    addStorageSpace,
    updateStorageSpace,
    removeStorageSpace,
    getStorageSpaceName: (storageSpaceId) =>
      storageSpaces.find((space) => space.id === storageSpaceId)?.name ?? "미분류",
    refreshData,
  };

  return (
    <FoodStoreContext.Provider value={value}>{children}</FoodStoreContext.Provider>
  );
}

export function useFoodStore() {
  const context = useContext(FoodStoreContext);

  if (!context) {
    throw new Error("useFoodStore must be used within FoodStoreProvider");
  }

  return context;
}
