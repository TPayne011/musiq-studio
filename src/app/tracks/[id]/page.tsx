import { prisma } from "../../../lib/prisma";
import Player from "../_components/Player";

export default async function TrackPage({
  params,
}: {
  params: { id: string };
}) {
  const track = await prisma.track.findUnique({ where: { id: params.id } });
  if (!track) return <main className="max-w-3xl mx-auto p-6">Not found.</main>;

  // Pipe external audio through our proxy to avoid 403s/CORS
  const src = `/api/audio?u=${encodeURIComponent(track.audioUrl)}`;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{track.title}</h1>
      <Player audioUrl={src} />
      <div className="text-sm opacity-60 break-all">
        Original: {track.audioUrl}
      </div>
    </main>
  );
}
