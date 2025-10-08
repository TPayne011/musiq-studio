// src/app/Header.tsx
"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        {/* Logo / Title */}
        <Link href="/" className="font-semibold text-lg tracking-tight">
          Musiq-Studio
        </Link>

        {/* Navigation */}
        <nav className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/studio" className="hover:underline">
            Studio
          </Link>
          <Link href="/studio/pro" className="hover:underline">
            Pro
          </Link>
          <Link href="/docs/quickstart" className="hover:underline">
            Docs
          </Link>
          <Link href="/market" className="hover:underline">
            Market
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

{
  /* optional: quick link to Pro */
}
{
  /* <Link href="/studio/pro">Studio Pro</Link> */
}
