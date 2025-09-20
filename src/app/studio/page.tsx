// src/app/studio/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Track = {
  id: string;
  name: string;
  volume: number; // 0–100
  muted: boolean;
};

const STORAGE_KEY = "musiq-studio:tracks:v1";

const initial: Track[] = [
  { id: "t1", name: "Drums", volume: 80, muted: false },
  { id: "t2", name: "Bass", volume: 70, muted: false },
  { id: "t3", name: "Keys", volume: 65, muted: false },
];

export default function StudioPage() {
  const [tracks, setTracks] = useState<Track[]>(initial);
  const [uploadName, setUploadName] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false); // avoid hydration mismatch
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Track[];
        if (Array.isArray(parsed) && parsed.every(isTrack)) {
          setTracks(parsed);
        }
      }
    } catch {
      // ignore corrupt storage
    } finally {
      setLoaded(true);
    }
  }, []);

  // Debounced save to localStorage whenever tracks change (after first load)
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
      } catch {
        // storage could be full/blocked; ignore for now
      }
    }, 250);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [tracks, loaded]);

  const addTrack = (name: string) => {
    const id = crypto.randomUUID();
    setTracks((t) => [...t, { id, name, volume: 75, muted: false }]);
  };

  const removeTrack = (id: string) =>
    setTracks((t) => t.filter((x) => x.id !== id));
  const setVolume = (id: string, volume: number) =>
    setTracks((t) => t.map((x) => (x.id === id ? { ...x, volume } : x)));
  const toggleMute = (id: string) =>
    setTracks((t) =>
      t.map((x) => (x.id === id ? { ...x, muted: !x.muted } : x))
    );

  const resetAll = () => {
    setTracks(initial);
    setUploadName(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const totalTracks = tracks.length;
  const mutedCount = useMemo(
    () => tracks.filter((t) => t.muted).length,
    [tracks]
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Studio</h1>
          <p className="mt-2 text-gray-700">
            Your creative workspace. Add tracks, tweak levels, and upload stems
            (demo only).
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {loaded ? (
              <>
                {totalTracks} {totalTracks === 1 ? "track" : "tracks"}
                {mutedCount ? ` • ${mutedCount} muted` : ""} • saved locally
              </>
            ) : (
              <>Loading…</>
            )}
          </p>
        </div>
        <button
          onClick={resetAll}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          title="Clear local data and restore defaults"
        >
          Reset
        </button>
      </header>

      {/* Upload / Add Track */}
      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Add Track</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={() => addTrack("New Track")}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            + Quick Track
          </button>

          <div className="text-sm text-gray-600">or upload a file:</div>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-gray-50">
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setUploadName(f.name);
                  addTrack(f.name.replace(/\.[^/.]+$/, ""));
                }
              }}
            />
            <span>Choose audio…</span>
          </label>

          {uploadName && (
            <span className="text-sm text-gray-600">
              Selected: {uploadName}
            </span>
          )}
        </div>
      </section>

      {/* Track List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tracks</h2>
          <span className="text-sm text-gray-600">{tracks.length} total</span>
        </div>

        <div className="divide-y rounded-lg border">
          {tracks.map((tr) => (
            <div
              key={tr.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="truncate text-base font-medium">
                  {tr.muted ? "🔇 " : ""}
                  {tr.name}
                </div>
                <div className="text-xs text-gray-500">
                  ID: {tr.id.slice(0, 8)}…
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 w-16">
                    Vol {tr.volume}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={tr.volume}
                    onChange={(e) => setVolume(tr.id, Number(e.target.value))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMute(tr.id)}
                    className="rounded-md border px-3 py-1.5 hover:bg-gray-50"
                    title={tr.muted ? "Unmute" : "Mute"}
                  >
                    {tr.muted ? "Unmute" : "Mute"}
                  </button>
                  <button
                    onClick={() => removeTrack(tr.id)}
                    className="rounded-md border px-3 py-1.5 text-red-600 hover:bg-red-50"
                    title="Remove track"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {tracks.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-600">
              No tracks yet. Use <strong>+ Quick Track</strong> or choose an
              audio file to add one.
            </div>
          )}
        </div>
      </section>

      {/* Mixer Placeholder */}
      <section className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Mixer (Placeholder)</h2>
        <p className="text-sm text-gray-600 mb-4">
          Basic per-track volume & mute controls are active above. A fuller
          mixer (panning, EQ, sends) will land here later.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {tracks.map((tr) => (
            <div key={`m-${tr.id}`} className="rounded-md border p-3">
              <div className="truncate text-sm font-medium">{tr.name}</div>
              <div className="mt-2 text-xs text-gray-500">Vol {tr.volume}</div>
              <div className="mt-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={tr.volume}
                  onChange={(e) => setVolume(tr.id, Number(e.target.value))}
                />
              </div>
              <button
                onClick={() => toggleMute(tr.id)}
                className="mt-3 w-full rounded-md border px-2 py-1.5 text-xs hover:bg-gray-50"
              >
                {tr.muted ? "Unmute" : "Mute"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function isTrack(x: any): x is Track {
  return (
    x &&
    typeof x.id === "string" &&
    typeof x.name === "string" &&
    typeof x.volume === "number" &&
    typeof x.muted === "boolean"
  );
}
