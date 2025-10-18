// src/app/_components/Nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/studio", label: "Studio" },
  { href: "/studio/pro", label: "Pro" },
  { href: "/upload", label: "Upload" },
  { href: "/tracks", label: "Library" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          Musiq Studio
        </Link>

        <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
          {links.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded px-3 py-1 transition ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
