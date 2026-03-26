import type { Metadata } from "next";
import { RecipesPageClient } from "@/components/recipes-page-client";

export const metadata: Metadata = {
  title: "레시피",
};

export default function RecipesPage() {
  return <RecipesPageClient />;
}
