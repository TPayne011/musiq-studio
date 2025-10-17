import { prisma } from "../../lib/prisma";

export default async function TracksPage() {
  const tracks = await prisma.track.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
    take: 50,
  });

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Tracks</h1>
      {tracks.length === 0 && (
        <p>
          No tracks yet. (Run <code>pnpm db:seed</code>)
        </p>
      )}
      <ul className="space-y-3">
        {tracks.map((t) => (
          <li key={t.id} className="border rounded p-3">
            <a className="font-semibold underline" href={`/tracks/${t.id}`}>
              {t.title}
            </a>
            <div className="text-sm opacity-70">
              by {t.user?.name ?? "Unknown"} ·{" "}
              {new Date(t.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
