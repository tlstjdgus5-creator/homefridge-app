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
const supabasePublishableDefaultKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabaseLegacyAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseClientKey =
  supabasePublishableDefaultKey ?? supabaseLegacyAnonKey;

let browserClient: ReturnType<typeof createClient<SupabaseDatabase>> | null = null;
let hasLoggedSupabaseEnv = false;

type SupabaseEnvDebugInfo = {
  hasUrl: boolean;
  hasPublishableDefaultKey: boolean;
  hasLegacyAnonKey: boolean;
  hasClientKey: boolean;
  clientKeySource: "publishable_default" | "anon_fallback" | "missing";
  urlHostname: string;
  urlProtocol: string;
  isUrlValid: boolean;
};

function getRequestUrl(input: RequestInfo | URL) {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  if ("url" in input && typeof input.url === "string") {
    return input.url;
  }

  return String(input);
}

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
  return Boolean(supabaseUrl && supabaseClientKey);
}

export function getSupabaseEnvDebugInfo(): SupabaseEnvDebugInfo {
  const parsedUrl = getParsedSupabaseUrl();

  return {
    hasUrl: Boolean(supabaseUrl),
    hasPublishableDefaultKey: Boolean(supabasePublishableDefaultKey),
    hasLegacyAnonKey: Boolean(supabaseLegacyAnonKey),
    hasClientKey: Boolean(supabaseClientKey),
    clientKeySource: supabasePublishableDefaultKey
      ? "publishable_default"
      : supabaseLegacyAnonKey
        ? "anon_fallback"
        : "missing",
    urlHostname: parsedUrl?.hostname ?? "",
    urlProtocol: parsedUrl?.protocol ?? "",
    isUrlValid: Boolean(parsedUrl),
  };
}

export function getSupabaseClient() {
  const envDebugInfo = getSupabaseEnvDebugInfo();

  if (!supabaseUrl || !supabaseClientKey) {
    throw new Error(
      "Supabase 환경변수가 비어 있어요. NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY 값을 확인해주세요. 이전 키인 NEXT_PUBLIC_SUPABASE_ANON_KEY도 fallback으로 지원해요.",
    );
  }

  if (!envDebugInfo.isUrlValid) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL 형식이 올바르지 않아요. Supabase 대시보드의 Project URL을 그대로 넣어주세요.",
    );
  }

  if (!hasLoggedSupabaseEnv && typeof window !== "undefined") {
    console.log("[supabase] client env", {
      hasUrl: envDebugInfo.hasUrl,
      hasPublishableDefaultKey: envDebugInfo.hasPublishableDefaultKey,
      hasLegacyAnonKey: envDebugInfo.hasLegacyAnonKey,
      clientKeySource: envDebugInfo.clientKeySource,
      supabaseUrl,
      urlHostname: envDebugInfo.urlHostname,
      urlProtocol: envDebugInfo.urlProtocol,
      isUrlValid: envDebugInfo.isUrlValid,
      clientKeyPreview: `${supabaseClientKey.slice(0, 12)}...`,
    });
    hasLoggedSupabaseEnv = true;
  }

  if (!browserClient) {
    browserClient = createClient<SupabaseDatabase>(
      supabaseUrl,
      supabaseClientKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          fetch: async (input, init) => {
            const requestUrl = getRequestUrl(input);
            try {
              return await fetch(input, init);
            } catch (error) {
              console.error("[supabase] fetch failed", {
                requestUrl,
                method: init?.method ?? "GET",
                supabaseUrl,
                env: getSupabaseEnvDebugInfo(),
                error,
              });
              throw error;
            }
          },
        },
      },
    );
  }

  return browserClient;
}
