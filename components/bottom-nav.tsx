"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Apple,
  Clock3,
  House,
  LayoutGrid,
  Plus,
  Settings,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/", label: "홈", icon: House },
  { href: "/foods", label: "식품", icon: Apple },
  { href: "/foods/new", label: "추가", icon: Plus },
  { href: "/expiring", label: "임박", icon: Clock3 },
  { href: "/recipes", label: "레시피", icon: Sparkles },
  { href: "/storage-spaces", label: "공간", icon: LayoutGrid },
  { href: "/settings", label: "설정", icon: Settings },
] satisfies Array<{ href: string; label: string; icon: LucideIcon }>;

export function BottomNav() {
  const pathname = usePathname();
  const normalizedPathname =
    pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <nav
        className="pointer-events-auto w-full max-w-md border-t border-white/70 bg-white/78 px-3 pt-3 shadow-[0_-18px_40px_-30px_rgba(15,23,42,0.38)] backdrop-blur-2xl"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 0.85rem)",
          minHeight: "var(--bottom-nav-height)",
        }}
      >
        <ul className="grid grid-cols-7 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? normalizedPathname === item.href
                : normalizedPathname === item.href ||
                  normalizedPathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex min-h-[64px] flex-col items-center justify-center rounded-2xl border px-2 py-2 text-[11px] font-semibold leading-none ${
                    isActive
                      ? item.href === "/foods/new"
                        ? "border-transparent bg-[var(--color-mint)] text-white shadow-sm"
                        : "border-[var(--color-line)] bg-[var(--color-surface-soft)] text-[var(--color-mint-deep)] shadow-sm"
                      : "border-transparent text-[var(--color-muted)] hover:border-[var(--color-line)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-mint-deep)]"
                  }`}
                >
                  <span
                    className={`flex min-h-7 min-w-7 items-center justify-center rounded-full ${
                      isActive && item.href !== "/foods/new"
                        ? "bg-white/80 text-[var(--color-mint-deep)]"
                        : ""
                    }`}
                  >
                    <Icon
                      size={20}
                      strokeWidth={2}
                      className={isActive && item.href === "/foods/new" ? "text-white" : ""}
                    />
                  </span>
                  <span className="mt-1.5 whitespace-nowrap">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
