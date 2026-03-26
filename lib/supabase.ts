"use client";

import { createClient } from "@supabase/supabase-js";

type SupabaseDatabase = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: ReturnType<typeof createClient<SupabaseDatabase>> | null = null;
let hasLoggedSupabaseEnv = false;

type SupabaseEnvDebugInfo = {
  hasUrl: boolean;
  hasAnonKey: boolean;
  urlHostname: string;
  urlProtocol: string;
  isUrlValid: boolean;
};

function getParsedSupabaseUrl() {
  if (!supabaseUrl) {
    return null;
  }

  try {
    return new URL(supabaseUrl);
  } catch {
    return null;
  }
}

export function hasSupabaseEnv() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseEnvDebugInfo(): SupabaseEnvDebugInfo {
  const parsedUrl = getParsedSupabaseUrl();

  return {
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
    urlHostname: parsedUrl?.hostname ?? "",
    urlProtocol: parsedUrl?.protocol ?? "",
    isUrlValid: Boolean(parsedUrl),
  };
}

export function getSupabaseClient() {
  const envDebugInfo = getSupabaseEnvDebugInfo();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase 환경변수가 비어 있어요. NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 값을 확인해주세요.",
    );
  }

  if (!envDebugInfo.isUrlValid) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL 형식이 올바르지 않아요. Supabase 대시보드의 Project URL을 그대로 넣어주세요.",
    );
  }

  if (!hasLoggedSupabaseEnv && typeof window !== "undefined") {
    console.info("[supabase] client env", {
      ...envDebugInfo,
      anonKeyPreview: `${supabaseAnonKey.slice(0, 12)}...`,
    });
    hasLoggedSupabaseEnv = true;
  }

  if (!browserClient) {
    browserClient = createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: async (input, init) => {
          try {
            return await fetch(input, init);
          } catch (error) {
            console.error("[supabase] fetch failed", {
              input: typeof input === "string" ? input : input.toString(),
              method: init?.method ?? "GET",
              env: getSupabaseEnvDebugInfo(),
              error,
            });
            throw error;
          }
        },
      },
    });
  }

  return browserClient;
}
