// src/app/tracks/page.tsx
export const runtime = "nodejs"; // ensure Prisma runs on Node, not Edge
export const dynamic = "force-dynamic"; // avoid prerender crashes

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TracksPage() {
  try {
    // If DATABASE_URL is missing in Netlify, this will throw—caught below.
    const tracks = await prisma.track.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, audioUrl: true, createdAt: true },
      take: 100,
    });

    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Your Library</h1>

        {tracks.length === 0 ? (
          <p className="text-gray-500">
            No tracks yet. Try{" "}
            <Link href="/upload" className="underline">
              uploading
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-3">
            {tracks.map((t) => (
              <li key={t.id} className="rounded border border-white/10 p-3">
                <div className="font-medium">
                  <Link href={`/tracks/${t.id}`} className="underline">
                    {t.title}
                  </Link>
                </div>
                <div className="text-xs text-gray-500 break-all">
                  {t.audioUrl}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(t.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    );
  } catch (err) {
    console.error("[/tracks] server error:", err);
    // Don’t crash the route—render a soft failure and guide next steps.
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Your Library</h1>
        <div className="rounded border border-red-500/40 bg-red-500/10 p-4">
          <div className="font-medium text-red-300">Couldn’t load tracks.</div>
          <p className="text-sm text-red-200/90 mt-1">
            Check Netlify env <code>DATABASE_URL</code> (must point to
            Supabase), and that Prisma migrations ran on Supabase.
          </p>
        </div>
      </main>
    );
  }
}
