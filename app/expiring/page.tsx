import type { Metadata } from "next";
import { ExpiringPageClient } from "@/components/expiring-page-client";

export const metadata: Metadata = {
  title: "임박",
};

export default function ExpiringPage() {
  return <ExpiringPageClient />;
}
