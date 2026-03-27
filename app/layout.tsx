import type { Metadata, Viewport } from "next";
import { Gowun_Dodum, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { AppPinGateShell } from "@/components/app-pin-gate-shell";
import { BottomNav } from "@/components/bottom-nav";
import { FoodStoreProvider } from "@/lib/food-store";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const gowunDodum = Gowun_Dodum({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "우리집냉장고",
    template: "%s | 우리집냉장고",
  },
  description: "냉장고 식품, 소비기한, 레시피를 한눈에 관리하는 모바일 우선 PWA 웹앱",
  applicationName: "우리집냉장고",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "우리집냉장고",
  },
};

export const viewport: Viewport = {
  themeColor: "#69c3a5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${gowunDodum.variable} h-full`}
    >
      <body className="min-h-full overflow-x-hidden bg-[var(--color-bg)] text-[var(--color-ink)] antialiased">
        <AppPinGateShell>
          <FoodStoreProvider>
            <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white/75 shadow-[0_0_0_1px_rgba(148,163,184,0.08)] backdrop-blur">
              <main
                className="flex-1 px-4 pt-5"
                style={{
                  paddingBottom: "calc(var(--screen-bottom-offset) + 1rem)",
                }}
              >
                {children}
              </main>
            </div>
            <BottomNav />
          </FoodStoreProvider>
        </AppPinGateShell>
      </body>
    </html>
  );
}
