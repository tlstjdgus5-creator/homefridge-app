import type { Metadata } from "next";
import { StatsPageClient } from "@/components/stats-page-client";

export const metadata: Metadata = {
  title: "폐기 통계",
};

export default function StatsPage() {
  return <StatsPageClient />;
}
