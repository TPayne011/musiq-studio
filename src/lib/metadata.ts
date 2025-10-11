// src/lib/metadata.ts
export type NftMetadata = {
  name: string;
  description?: string;
  image?: string;
  animation_url?: string;
  attributes?: { trait_type: string; value: string | number }[];
  external_url?: string;
  license?: string;
  royalties_bps?: number;
};

export function buildTrackMetadata(params: {
  title: string;
  artist: string;
  tags: string[];
  audioUrl: string; // HTTPS on your domain (Option A)
  coverUrl?: string;
  bpm?: number;
  key?: string;
  durationSec?: number;
}): NftMetadata {
  const { title, artist, tags, audioUrl, coverUrl, bpm, key, durationSec } =
    params;
  return {
    name: `${title} — ${artist}`,
    description: `Track minted via musiq-studio on Pi.`,
    image: coverUrl,
    animation_url: audioUrl,
    attributes: [
      ...(bpm ? [{ trait_type: "BPM", value: bpm }] : []),
      ...(key ? [{ trait_type: "Key", value: key }] : []),
      ...(durationSec
        ? [{ trait_type: "Duration (s)", value: durationSec }]
        : []),
      ...tags.map((t) => ({ trait_type: "Tag", value: t })),
    ],
    external_url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001",
    license: "personal-noncommercial-v1",
    royalties_bps: 500,
  };
}
