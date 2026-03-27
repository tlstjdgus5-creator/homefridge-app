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
import {
  getSupabaseClient,
  getSupabaseEnvDebugInfo,
  hasSupabaseEnv,
} from "@/lib/supabase";

export type NewFoodInput = Omit<Food, "id">;
export type NewStorageSpaceInput = {
  name: string;
};

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
  removeDiscardLog: (discardLogId: string) => Promise<StoreActionResult>;
  addStorageSpace: (
    input: NewStorageSpaceInput,
  ) => Promise<StoreActionResult<StorageSpace>>;
  updateStorageSpace: (
    storageSpaceId: string,
    updates: Partial<NewStorageSpaceInput>,
  ) => Promise<StoreActionResult<StorageSpace>>;
  reorderStorageSpaces: (
    storageSpaceId: string,
    direction: "up" | "down",
  ) => Promise<StoreActionResult>;
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
  display_order: number | null;
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

function isMissingDisplayOrderColumnError(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string" &&
    /(display_order).*(storage_spaces)|(storage_spaces).*(display_order)/i.test(
      (error as { message: string }).message,
    )
  ) {
    return true;
  }

  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    ((error as { code?: unknown }).code === "42703" ||
      (error as { code?: unknown }).code === "PGRST204")
  );
}

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
    displayOrder: row.display_order ?? Number.MAX_SAFE_INTEGER,
  };
}

function sortStorageSpaces(items: StorageSpace[]) {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
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
    return "Supabase 서버에 연결하지 못했어요. 배포 환경의 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY와 네트워크 요청 상태를 확인해주세요. 이전 키인 NEXT_PUBLIC_SUPABASE_ANON_KEY도 fallback으로 지원해요.";
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
      return "Supabase 서버에 연결하지 못했어요. 배포 환경의 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY와 네트워크 요청 상태를 확인해주세요. 이전 키인 NEXT_PUBLIC_SUPABASE_ANON_KEY도 fallback으로 지원해요.";
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

function logSupabaseActionError(params: {
  action: string;
  stage: string;
  tables: string[];
  details?: Record<string, unknown>;
  error: unknown;
}) {
  console.error(`[food-store] ${params.action} failed`, {
    action: params.action,
    stage: params.stage,
    tables: params.tables,
    env: getSupabaseEnvDebugInfo(),
    ...params.details,
    error: params.error,
  });
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
      console.error("[food-store] refreshData missing env", {
        action: "refreshData",
        stage: "before_request",
        tables: ["storage_spaces", "food_items", "discard_logs"],
        env: getSupabaseEnvDebugInfo(),
      });
      setError(
        "Supabase 환경변수가 설정되지 않았어요. Vercel 또는 .env.local의 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY 값을 확인해주세요. 이전 키인 NEXT_PUBLIC_SUPABASE_ANON_KEY도 fallback으로 지원해요.",
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const client = getSupabaseClient();
      console.log("[food-store] refreshData start", {
        action: "refreshData",
        stage: "query",
        tables: ["storage_spaces", "food_items", "discard_logs"],
      });
      const [storageSpacesResult, foodsResult, discardLogsResult] = await Promise.all([
        client
          .from("storage_spaces")
          .select("id, name, display_order, created_at")
          .order("display_order", { ascending: true })
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

      let storageSpacesData = (storageSpacesResult.data ?? []) as StorageSpaceRow[];

      if (
        storageSpacesResult.error &&
        isMissingDisplayOrderColumnError(storageSpacesResult.error)
      ) {
        console.warn("[food-store] display_order column missing, fallback to created_at order");
        const fallbackStorageSpacesResult = await client
          .from("storage_spaces")
          .select("id, name, created_at")
          .order("created_at", { ascending: true });
        storageSpacesData = (fallbackStorageSpacesResult.data ?? []).map(
          (row, index) =>
            ({
              ...(row as Omit<StorageSpaceRow, "display_order">),
              display_order: index,
            }) as StorageSpaceRow,
        );
      } else if (storageSpacesResult.error) {
        logSupabaseActionError({
          action: "refreshData",
          stage: "storage_spaces.select",
          tables: ["storage_spaces"],
          details: {
            failedTable: "storage_spaces",
            query:
              "select id, name, display_order, created_at order by display_order asc, created_at asc",
          },
          error: storageSpacesResult.error,
        });
        throw storageSpacesResult.error;
      }

      if (foodsResult.error) {
        logSupabaseActionError({
          action: "refreshData",
          stage: "food_items.select",
          tables: ["food_items"],
          details: {
            failedTable: "food_items",
            query:
              "select id, name, quantity, unit, expiry_date, storage_space_id, created_at order by created_at desc",
          },
          error: foodsResult.error,
        });
        throw foodsResult.error;
      }
      if (discardLogsResult.error) {
        logSupabaseActionError({
          action: "refreshData",
          stage: "discard_logs.select",
          tables: ["discard_logs"],
          details: {
            failedTable: "discard_logs",
            query:
              "select id, food_name, quantity, unit, storage_space_id, storage_space_name, expiry_date, discarded_at, status_at_discard order by discarded_at desc",
          },
          error: discardLogsResult.error,
        });
        throw discardLogsResult.error;
      }

      setStorageSpaces(
        sortStorageSpaces(
          storageSpacesData.map(
            (row, index) =>
              mapStorageSpaceRow({
                ...row,
                display_order: row.display_order ?? index,
              }),
          ),
        ),
      );
      setFoods(((foodsResult.data ?? []) as FoodItemRow[]).map(mapFoodRowToFood));
      setDiscardLogs(
        ((discardLogsResult.data ?? []) as DiscardLogRow[]).map(mapDiscardLogRow),
      );
      setError("");
    } catch (nextError) {
      logSupabaseActionError({
        action: "refreshData",
        stage: "catch",
        tables: ["storage_spaces", "food_items", "discard_logs"],
        error: nextError,
      });
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
      logSupabaseActionError({
        action: "addFood",
        stage: "food_items.insert",
        tables: ["food_items"],
        details: {
          payload: {
            name: input.name.trim(),
            quantity: input.quantity,
            unit: input.unit.trim(),
            expiry_date: input.expiryDate,
            storage_space_id: input.storageSpaceId,
          },
        },
        error: nextError,
      });
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
      logSupabaseActionError({
        action: "updateFood",
        stage: "food_items.update",
        tables: ["food_items"],
        details: {
          foodId,
          payload: updates,
        },
        error: nextError,
      });
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
      logSupabaseActionError({
        action: "removeFood",
        stage: "food_items.delete",
        tables: ["food_items"],
        details: {
          foodId,
        },
        error: nextError,
      });
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
      logSupabaseActionError({
        action: "consumeFood",
        stage: "removeFood delegation",
        tables: ["food_items"],
        details: {
          foodId,
        },
        error: nextError,
      });
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
      logSupabaseActionError({
        action: "discardFood",
        stage: "discard_logs.insert",
        tables: ["discard_logs", "food_items"],
        details: {
          foodId,
        },
        error: nextError,
      });
      const message = getErrorMessage(nextError, "폐기 처리 중 문제가 생겼어요.");
      setError(message);
      return { ok: false, message };
    }
  }

  async function removeDiscardLog(discardLogId: string): Promise<StoreActionResult> {
    try {
      const client = getSupabaseClient();
      const { error: deleteError } = await client
        .from("discard_logs")
        .delete()
        .eq("id", discardLogId);

      if (deleteError) {
        throw deleteError;
      }

      setDiscardLogs((current) => current.filter((log) => log.id !== discardLogId));
      setError("");
      return { ok: true };
    } catch (nextError) {
      logSupabaseActionError({
        action: "removeDiscardLog",
        stage: "discard_logs.delete",
        tables: ["discard_logs"],
        details: {
          discardLogId,
        },
        error: nextError,
      });
      const message = getErrorMessage(
        nextError,
        "폐기 내역 삭제 중 문제가 생겼어요.",
      );
      setError(message);
      return { ok: false, message };
    }
  }

  async function addStorageSpace(
    input: NewStorageSpaceInput,
  ): Promise<StoreActionResult<StorageSpace>> {
    const nextDisplayOrder =
      storageSpaces.length > 0
        ? Math.max(...storageSpaces.map((space) => space.displayOrder)) + 1
        : 0;

    try {
      const client = getSupabaseClient();
      const { data, error: insertError } = await client
        .from("storage_spaces")
        .insert({
          name: input.name.trim(),
          display_order: nextDisplayOrder,
        })
        .select("id, name, display_order, created_at")
        .single();

      let nextRow = data as StorageSpaceRow | null;
      let nextInsertError = insertError;

      if (insertError && isMissingDisplayOrderColumnError(insertError)) {
        const fallbackResult = await client
          .from("storage_spaces")
          .insert({ name: input.name.trim() })
          .select("id, name, created_at")
          .single();
        nextRow = fallbackResult.data
          ? ({
              ...(fallbackResult.data as Omit<StorageSpaceRow, "display_order">),
              display_order: nextDisplayOrder,
            } as StorageSpaceRow)
          : null;
        nextInsertError = fallbackResult.error;
      }

      if (nextInsertError) {
        throw nextInsertError;
      }

      const newStorageSpace = mapStorageSpaceRow({
        ...(nextRow as StorageSpaceRow),
        display_order: (nextRow as StorageSpaceRow).display_order ?? nextDisplayOrder,
      });
      setStorageSpaces((current) => sortStorageSpaces([...current, newStorageSpace]));
      setError("");
      return { ok: true, data: newStorageSpace };
    } catch (nextError) {
      logSupabaseActionError({
        action: "addStorageSpace",
        stage: "storage_spaces.insert",
        tables: ["storage_spaces"],
        details: {
          payload: {
            name: input.name.trim(),
            display_order: nextDisplayOrder,
          },
        },
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
        .select("id, name, display_order, created_at")
        .single();

      let nextRow = data as StorageSpaceRow | null;
      let nextUpdateError = updateError;

      if (updateError && isMissingDisplayOrderColumnError(updateError)) {
        const fallbackResult = await client
          .from("storage_spaces")
          .update({
            ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
          })
          .eq("id", storageSpaceId)
          .select("id, name, created_at")
          .single();
        nextRow = fallbackResult.data
          ? ({
              ...(fallbackResult.data as Omit<StorageSpaceRow, "display_order">),
              display_order:
                storageSpaces.find((space) => space.id === storageSpaceId)
                  ?.displayOrder ?? 0,
            } as StorageSpaceRow)
          : null;
        nextUpdateError = fallbackResult.error;
      }

      if (nextUpdateError) {
        throw nextUpdateError;
      }

      const currentStorageSpace = storageSpaces.find(
        (space) => space.id === storageSpaceId,
      );
      const nextStorageSpace = mapStorageSpaceRow({
        ...(nextRow as StorageSpaceRow),
        display_order:
          (nextRow as StorageSpaceRow).display_order ??
          currentStorageSpace?.displayOrder ??
          0,
      });
      setStorageSpaces((current) =>
        sortStorageSpaces(
          current.map((space) =>
            space.id === storageSpaceId ? nextStorageSpace : space,
          ),
        ),
      );
      setError("");
      return { ok: true, data: nextStorageSpace };
    } catch (nextError) {
      logSupabaseActionError({
        action: "updateStorageSpace",
        stage: "storage_spaces.update",
        tables: ["storage_spaces"],
        details: {
          storageSpaceId,
          payload: updates,
        },
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

  async function reorderStorageSpaces(
    storageSpaceId: string,
    direction: "up" | "down",
  ): Promise<StoreActionResult> {
    const currentSpaces = sortStorageSpaces(storageSpaces);
    const currentIndex = currentSpaces.findIndex(
      (space) => space.id === storageSpaceId,
    );

    if (currentIndex === -1) {
      return { ok: false, message: "보관공간 정보를 찾을 수 없어요." };
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= currentSpaces.length) {
      return { ok: false, message: "더 이상 이동할 수 없어요." };
    }

    const reordered = [...currentSpaces];
    const [movedSpace] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, movedSpace);

    const payload = reordered.map((space, index) => ({
      id: space.id,
      display_order: index,
    }));

    try {
      const client = getSupabaseClient();
      for (const item of payload) {
        const { error: updateError } = await client
          .from("storage_spaces")
          .update({ display_order: item.display_order })
          .eq("id", item.id);

        if (updateError) {
          if (isMissingDisplayOrderColumnError(updateError)) {
            return {
              ok: false,
              message:
                "보관공간 순서 변경을 쓰려면 먼저 storage_spaces.display_order 컬럼을 추가해야 해요.",
            };
          }
          throw updateError;
        }
      }

      setStorageSpaces(
        reordered.map((space, index) => ({
          ...space,
          displayOrder: index,
        })),
      );
      setError("");
      return { ok: true };
    } catch (nextError) {
      logSupabaseActionError({
        action: "reorderStorageSpaces",
        stage: "storage_spaces.update",
        tables: ["storage_spaces"],
        details: {
          storageSpaceId,
          direction,
          payload,
        },
        error: nextError,
      });
      const message = getErrorMessage(
        nextError,
        "보관공간 순서를 변경하는 중 문제가 생겼어요.",
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
      logSupabaseActionError({
        action: "removeStorageSpace",
        stage: "storage_spaces.delete",
        tables: ["storage_spaces"],
        details: {
          storageSpaceId,
        },
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
    removeDiscardLog,
    addStorageSpace,
    updateStorageSpace,
    reorderStorageSpaces,
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
