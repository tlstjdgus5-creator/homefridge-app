import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "우리집냉장고",
    short_name: "냉장고",
    description: "냉장고 식품과 소비기한, 레시피를 관리하는 모바일 우선 앱",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8f7",
    theme_color: "#7eb9a5",
    lang: "ko-KR",
    icons: [
      {
        src: "/pwa-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/pwa-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
