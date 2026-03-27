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
                      : "border-transparent text-[var(--color-muted)] hover:border-[var(--color-line)] hover:bg-[var(--color-surface-soft)]"
                  }`}
                >
                  <span
                    className={`flex min-h-6 min-w-6 items-center justify-center ${
                      item.href === "/foods/new"
                        ? "text-[18px] font-semibold"
                        : "text-[17px]"
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
    </div>
  );
}
