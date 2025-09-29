// src/app/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          Musiq-Studio
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/studio">Studio</Link>
          <Link href="/studio/pro">Pro</Link>
          <Link href="/market">Market</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
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
