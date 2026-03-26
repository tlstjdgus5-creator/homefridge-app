import type { Metadata } from "next";
import { StorageSpacesPageClient } from "@/components/storage-spaces-page-client";

export const metadata: Metadata = {
  title: "보관공간",
};

export default function StorageSpacesPage() {
  return <StorageSpacesPageClient />;
}
