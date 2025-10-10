"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/studio/create", label: "Create" },
  { href: "/studio/mint", label: "Mint" },
  { href: "/studio/discover", label: "Discover" },
  { href: "/studio/profile", label: "Profile" },
];

export default function StudioTabs() {
  const pathname = usePathname();
  return (
    <nav className="grid grid-cols-4 gap-2">
      {tabs.map((t) => {
        const active = pathname?.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`text-center rounded-xl border px-4 py-2 text-sm transition
            ${
              active
                ? "border-neutral-300 bg-neutral-800"
                : "border-neutral-700 hover:border-neutral-500"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
