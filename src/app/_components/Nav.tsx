"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pro", label: "Pro" },
  { href: "/docs", label: "Docs" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-sm">
        {/* Brand */}
        <Link
          href="/"
          className="font-semibold tracking-wide text-white hover:text-piPurple transition-colors"
        >
          Musiq Studio
        </Link>

        {/* Links */}
        <div className="flex gap-5">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`transition-colors ${
                  isActive
                    ? "text-piPurple font-medium"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
