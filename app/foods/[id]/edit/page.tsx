import type { Metadata } from "next";
import { EditFoodPageClient } from "@/components/edit-food-page-client";

export const metadata: Metadata = {
  title: "식품 수정",
};

type EditFoodPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditFoodPage({ params }: EditFoodPageProps) {
  const { id } = await params;

  return <EditFoodPageClient foodId={id} />;
}
