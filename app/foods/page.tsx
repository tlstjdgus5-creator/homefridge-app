import type { Metadata } from "next";
import { FoodsPageClient } from "@/components/foods-page-client";

export const metadata: Metadata = {
  title: "식품",
};

export default function FoodsPage() {
  return <FoodsPageClient />;
}
