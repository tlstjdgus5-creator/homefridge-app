"use client";

import { getSupabaseClient } from "@/lib/supabase";

export type AppSettingsRow = {
  id: string;
  pin_hash: string | null;
  updated_at: string | null;
};

const appSettingsColumns = "id, pin_hash, updated_at";
const APP_SETTINGS_CACHE_KEY = "homefridge.app_settings_cache";

export function readCachedAppSettings() {
  const rawValue = localStorage.getItem(APP_SETTINGS_CACHE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AppSettingsRow | null;
  } catch {
    return null;
  }
}

export function writeCachedAppSettings(settings: AppSettingsRow | null) {
  if (!settings) {
    localStorage.removeItem(APP_SETTINGS_CACHE_KEY);
    return;
  }

  localStorage.setItem(APP_SETTINGS_CACHE_KEY, JSON.stringify(settings));
}

export async function fetchAppSettings() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("app_settings")
    .select(appSettingsColumns)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const nextSettings = (data as AppSettingsRow | null) ?? null;
  writeCachedAppSettings(nextSettings);
  return nextSettings;
}

export async function savePinHash(params: {
  pinHash: string;
  settingsId?: string | null;
}) {
  const client = getSupabaseClient();

  if (params.settingsId) {
    const { data, error } = await client
      .from("app_settings")
      .update({
        pin_hash: params.pinHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.settingsId)
      .select(appSettingsColumns)
      .single();

    if (error) {
      throw error;
    }

    const nextSettings = data as AppSettingsRow;
    writeCachedAppSettings(nextSettings);
    return nextSettings;
  }

  const { data, error } = await client
    .from("app_settings")
    .insert({
      pin_hash: params.pinHash,
    })
    .select(appSettingsColumns)
    .single();

  if (error) {
    throw error;
  }

  const nextSettings = data as AppSettingsRow;
  writeCachedAppSettings(nextSettings);
  return nextSettings;
}
