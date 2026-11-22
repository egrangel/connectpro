import Link from "next/link";
import type { ReactNode } from "react";

interface MemberPageProps {
  title: string;
  description?: string;
  backToListings?: boolean;
  action?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}

export function MemberPage({ title, description, backToListings, action, aside, children }: MemberPageProps) {
  return (
    <div className="site-frame member-page">
      <div className="member-page-panel">
        <header className="member-page-heading">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="section-title">{title}</h1>
              {description && <p className="mt-3 max-w-prose text-sm leading-6 text-[var(--color-muted)]">{description}</p>}
            </div>
            {backToListings && <Link href="/my-listings" className="member-page-back">← Meus anúncios</Link>}
            {action}
          </div>
        </header>
        {children}
      </div>
      {aside}
    </div>
  );
}
