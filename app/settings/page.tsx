import type { Metadata } from "next";
import { SettingsPageClient } from "@/components/settings-page-client";

export const metadata: Metadata = {
  title: "설정",
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
