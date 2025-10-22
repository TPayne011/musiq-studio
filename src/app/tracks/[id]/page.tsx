// src/app/tracks/[id]/page.tsx
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import Player from "../_components/Player";

export default async function TrackPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const track = await prisma.track.findUnique({
      where: { id: params.id },
      // Optional: explicitly select only what you render
      // select: { id: true, title: true, audioUrl: true },
    });

    if (!track) {
      return (
        <main className="max-w-3xl mx-auto p-6 text-center text-gray-400">
          Track not found.
        </main>
      );
    }

    // Use the stored audioUrl (matches your schema)
    const proxiedSrc = `/api/audio?u=${encodeURIComponent(track.audioUrl)}`;

    return (
      <main className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">{track.title}</h1>
        <Player audioUrl={proxiedSrc} />
        <div className="text-sm text-gray-500 break-all">
          Original:{" "}
          <a
            href={track.audioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-piPurple"
          >
            {track.audioUrl}
          </a>
        </div>
      </main>
    );
  } catch (err) {
    console.error("TrackPage error:", err);
    return (
      <main className="max-w-3xl mx-auto p-6 text-center text-red-400">
        Failed to load track.
      </main>
    );
  }
}
