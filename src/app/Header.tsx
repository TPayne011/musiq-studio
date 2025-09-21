// src/app/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="Musiq-Studio Logo" width={32} height={32} />
        <span className="font-bold text-lg">Musiq-Studio</span>
      </div>
      <nav className="flex gap-6 text-sm font-medium">
        <Link href="/">Home</Link>
        <Link href="/studio">Studio</Link>
        <Link href="/market">Market</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
    </header>
  );
}
