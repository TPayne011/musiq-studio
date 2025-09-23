// src/app/Footer.tsx
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t py-6 text-sm text-gray-600">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} Musiq-Studio. All rights reserved.
        </p>
        <nav className="flex justify-center sm:justify-end gap-6">
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
