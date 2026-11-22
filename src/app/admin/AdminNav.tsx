"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ items }: { items: readonly { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Seções administrativas">
      {items.map(({ href, label }) => {
        const current = pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"));
        return <Link key={href} href={href} aria-current={current ? "page" : undefined}>{label}</Link>;
      })}
    </nav>
  );
}
