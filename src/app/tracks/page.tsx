// src/app/tracks/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TracksPage() {
  const tracks = await prisma.track.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, audioUrl: true, createdAt: true },
    take: 50,
  });

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Library</h1>
      <ul className="space-y-3">
        {tracks.map((t) => (
          <li key={t.id} className="rounded border border-white/10 p-3">
            <div className="font-medium">
              <Link href={`/tracks/${t.id}`} className="underline">
                {t.title}
              </Link>
            </div>
            <div className="text-xs text-gray-500 break-all">{t.audioUrl}</div>
          </li>
        ))}
        {tracks.length === 0 && (
          <li className="text-gray-500">No tracks yet.</li>
        )}
      </ul>
    </main>
  );
}
