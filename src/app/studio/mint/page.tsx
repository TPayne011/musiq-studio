// src/app/studio/mint/page.tsx
"use client";

import { useState } from "react";
import { uploadBlobAsFile } from "@/lib/upload";
import { buildTrackMetadata, type NftMetadata } from "@/lib/metadata";

export default function MintPage() {
  const [status, setStatus] = useState<
    "idle" | "uploading" | "meta" | "minting" | "done" | "error"
  >("idle");
  const [msg, setMsg] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function onMint(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedFile) {
      setMsg("Choose an audio file first.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const title = String(
      form.get("title") || selectedFile.name.replace(/\.[^.]+$/, "")
    );
    const tags = String(form.get("tags") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setStatus("uploading");
      setMsg("Uploading audio to storage…");
      const audioUrl = await uploadBlobAsFile(
        selectedFile,
        `${title.replace(/\s+/g, "-")}.webm`
      );

      setStatus("meta");
      setMsg("Building + uploading metadata…");
      const meta: NftMetadata = buildTrackMetadata({
        title,
        artist: "musiq-studio creator",
        tags,
        audioUrl,
      });
      const metaBlob = new Blob([JSON.stringify(meta, null, 2)], {
        type: "application/json",
      });
      const metaUrl = await uploadBlobAsFile(
        metaBlob,
        `${title.replace(/\s+/g, "-")}.json`
      );

      setStatus("minting");
      setMsg("Submitting mint transaction (mock) …");
      // TODO: replace with Pi SDK mint call using metadataURI = metaUrl
      await new Promise((r) => setTimeout(r, 700));
      const fakeTokenId = `pi-demo-${Date.now()}`;

      setStatus("done");
      setMsg(
        `Minted! tokenId=${fakeTokenId}\nmetadata=${metaUrl}\npreview=${metaUrl}`
      );
    } catch (e: any) {
      setStatus("error");
      setMsg(e?.message ?? "Mint failed");
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Mint</h1>

      <form onSubmit={onMint} className="space-y-3">
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          className="block w-full rounded border p-2"
        />
        <input
          name="title"
          placeholder="Track title"
          className="w-full rounded border p-2"
        />
        <input
          name="tags"
          placeholder="Tags (comma separated)"
          className="w-full rounded border p-2"
        />
        <button
          disabled={
            !selectedFile ||
            status === "uploading" ||
            status === "minting" ||
            status === "meta"
          }
          className="rounded border px-4 py-2"
        >
          {selectedFile ? "Mint Selected Track" : "Choose a file first"}
        </button>
      </form>

      <pre className="whitespace-pre-wrap text-sm text-gray-700">{msg}</pre>
    </main>
  );
}
