"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "홈", icon: "⌂" },
  { href: "/foods", label: "식품", icon: "▦" },
  { href: "/foods/new", label: "추가", icon: "+" },
  { href: "/expiring", label: "임박", icon: "◔" },
  { href: "/recipes", label: "레시피", icon: "✦" },
  { href: "/storage-spaces", label: "공간", icon: "▤" },
  { href: "/settings", label: "설정", icon: "⚙" },
];

export function BottomNav() {
  const pathname = usePathname();
  const normalizedPathname =
    pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md border-t border-white/60 bg-white/78 px-3 pb-[calc(env(safe-area-inset-bottom)+0.85rem)] pt-3 backdrop-blur-2xl">
      <ul className="grid grid-cols-7 gap-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? normalizedPathname === item.href
              : normalizedPathname === item.href ||
                normalizedPathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex min-h-[64px] flex-col items-center justify-center rounded-2xl border px-1.5 py-2 text-[11px] font-semibold leading-none ${
                  isActive
                    ? item.href === "/foods/new"
                      ? "border-transparent bg-[var(--color-mint)] text-white shadow-sm"
                      : "border-[var(--color-line)] bg-[var(--color-surface-soft)] text-[var(--color-mint-deep)] shadow-sm"
                    : "border-transparent text-[var(--color-muted)] hover:border-[var(--color-line)] hover:bg-[var(--color-surface-soft)]"
                }`}
              >
                <span
                  className={`flex h-5 items-center justify-center ${
                    item.href === "/foods/new"
                      ? "text-[18px] font-semibold"
                      : "text-[16px]"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="mt-1.5 whitespace-nowrap">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
