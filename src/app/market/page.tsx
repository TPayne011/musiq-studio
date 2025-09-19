// src/app/market/page.tsx
"use client";

import { useMemo, useState } from "react";
import Card from "../components/Card";

const items = [
  {
    title: "Lo-Fi Drum Kit Vol. 1",
    author: "BeatWorks",
    tag: "Drum Kit",
    href: "#",
  },
  { title: "Ambient Pads Pack", author: "Skyline", tag: "Samples", href: "#" },
  { title: "808 Essentials", author: "LowEnd Labs", tag: "Bass", href: "#" },
  {
    title: "Neo-Soul Chords v2",
    author: "Rhodes&Co",
    tag: "MIDI Chords",
    href: "#",
  },
  {
    title: "Trap Hats Builder",
    author: "HiHatClub",
    tag: "Drum Kit",
    href: "#",
  },
  { title: "Cinematic Risers", author: "AtmosLab", tag: "FX", href: "#" },
];

export default function MarketPage() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => {
      const hay = `${it.title} ${it.author ?? ""} ${
        it.tag ?? ""
      }`.toLowerCase();
      return hay.includes(s);
    });
  }, [q]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Market</h1>
      <p className="text-gray-700 mb-6">
        Browse sample packs, MIDI, and presets. (Demo data for now.)
      </p>

      {/* Search bar */}
      <div className="mb-8">
        <label htmlFor="market-search" className="sr-only">
          Search
        </label>
        <input
          id="market-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, author, or tag…"
          className="w-full rounded-md border px-4 py-2 outline-none focus:ring focus:ring-indigo-200"
        />
        <div className="mt-2 text-sm text-gray-600">
          Showing <strong>{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "result" : "results"}
          {q ? <> for “{q}”</> : null}
        </div>
      </div>

      {/* Results grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((it) => (
          <Card key={`${it.title}-${it.author}`} {...it} />
        ))}
      </div>
    </main>
  );
}
