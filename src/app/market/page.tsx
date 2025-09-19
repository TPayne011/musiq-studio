// src/app/market/page.tsx
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
];

export default function MarketPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Market</h1>
      <p className="text-gray-700 mb-8">
        Browse sample packs, MIDI, and presets. (Demo data for now.)
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Card key={it.title} {...it} />
        ))}
      </div>
    </main>
  );
}
