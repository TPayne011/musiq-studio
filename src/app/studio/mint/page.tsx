// src/app/studio/mint/page.tsx
"use client";

import { useState } from "react";
import { uploadBlobAsFile } from "@/lib/upload";
import { buildTrackMetadata, type NftMetadata } from "@/lib/metadata";
import { ensurePiAuth, createPiPayment } from "@/lib/pi";

function extFromType(t: string) {
  if (t === "audio/mpeg") return ".mp3";
  if (t === "audio/wav" || t === "audio/x-wav") return ".wav";
  if (t === "audio/ogg") return ".ogg";
  if (t === "audio/webm") return ".webm";
  return "";
}

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
      // 1) Upload audio
      setStatus("uploading");
      setMsg("Uploading audio to storage…");
      const audioExt =
        extFromType(selectedFile.type) ||
        selectedFile.name.match(/\.[^.]+$/)?.[0] ||
        ".bin";
      const audioUrl = await uploadBlobAsFile(
        selectedFile,
        `${title.replace(/\s+/g, "-")}${audioExt}`
      );

      // 2) Build + upload metadata JSON
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

      // 3) Pi auth + payment (with base 5–10 π + 2 π fee)
      setStatus("minting");
      setMsg("Authenticating with Pi…");
      await ensurePiAuth();

      const baseCost = Math.floor(Math.random() * 6) + 5; // 5–10 π
      const mintingFee = 2;
      const totalCost = baseCost + mintingFee;

      setMsg(`Creating Pi payment… (${totalCost} π)`);
      const payment = await createPiPayment({
        amount: totalCost,
        memo: `Mint: ${title} (${totalCost} π total, includes ${mintingFee} π fee)`,
        metadata: {
          purpose: "mint",
          title,
          tags,
          metadataUrl: metaUrl,
          baseCost,
          mintingFee,
        },
      });

      // 4) Record the mint server-side (stub ok)
      const rec = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadataUrl: metaUrl,
          title,
          tags,
          piPaymentId: payment?.identifier ?? null,
          amount: totalCost,
          mintingFee,
        }),
      });
      if (!rec.ok) throw new Error(`Mint record failed (${rec.status})`);
      const { tokenId, txId } = await rec.json();

      setStatus("done");
      setMsg(
        `✅ Minted!\n` +
          `Token: ${tokenId}\n` +
          `Tx: ${txId ?? "pending"}\n` +
          `Metadata: ${metaUrl}\n` +
          `Cost: ${baseCost} π + ${mintingFee} π = ${totalCost} π\n` +
          `Payment: ${payment?.identifier ?? "created"}`
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
