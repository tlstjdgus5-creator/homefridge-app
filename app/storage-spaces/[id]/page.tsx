import type { Metadata } from "next";
import { StorageSpaceDetailPageClient } from "@/components/storage-space-detail-page-client";

export const metadata: Metadata = {
  title: "공간 식품 보기",
};

type StorageSpaceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StorageSpaceDetailPage({
  params,
}: StorageSpaceDetailPageProps) {
  const { id } = await params;

  return <StorageSpaceDetailPageClient storageSpaceId={id} />;
}
