import type { Metadata } from "next";
import { AddFoodForm } from "@/components/add-food-form";

export const metadata: Metadata = {
  title: "식품 추가",
};

export default function NewFoodPage() {
  return <AddFoodForm />;
}
