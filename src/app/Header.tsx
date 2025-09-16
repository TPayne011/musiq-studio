// src/app/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b py-4">
      <nav className="max-w-4xl mx-auto flex items-center justify-between px-4">
        <Link href="/" className="font-bold text-lg">
          Musiq-Studio
        </Link>
        <div className="space-x-4 text-sm">
          <Link href="/">Home</Link>
          <Link href="/studio">Studio</Link>
          <Link href="/market">Market</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </nav>
    </header>
  );
}
