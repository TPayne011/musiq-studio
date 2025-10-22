// src/app/upload/page.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

async function jsonOrThrow(res: Response, label: string) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data = await res.json();
    if (!res.ok)
      throw new Error(data?.error || `${label} failed (${res.status})`);
    return data;
  } else {
    const text = await res.text();
    throw new Error(`${label} non-JSON (${res.status}): ${text.slice(0, 200)}`);
  }
}

export default function UploadPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function handleUpload() {
    setError("");
    setStatus("");
    setProgress(0);

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please choose an audio file.");
      return;
    }
    const safeTitle = title.trim() || file.name.replace(/\.[^.]+$/, "");
    setStatus("Requesting upload URL…");

    // 1) Ask our signer for a signed URL + destination path
    const signRes = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        bucket: "media",
        contentType: file.type || "audio/mpeg",
      }),
    });
    const sign = await jsonOrThrow(signRes, "Upload signer"); // { url, method, headers, path, publicUrl }

    // 2) PUT the file to Supabase Storage (signed URL)
    setStatus("Uploading to storage…");
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(sign.method || "PUT", sign.url, true);

      // headers from signer (e.g. content-type)
      if (sign.headers) {
        for (const [k, v] of Object.entries(
          sign.headers as Record<string, string>
        )) {
          xhr.setRequestHeader(k, v);
        }
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Storage upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(file);
    });

    // 3) Create Track row
    setStatus("Saving to library…");
    const saveRes = await fetch("/api/tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: safeTitle,
        description: "",
        publicUrl: sign.publicUrl, // server maps publicUrl -> audioUrl
        storagePath: sign.path,
        durationSec: null, // (optional) compute later in player
        // userId is ignored server-side (demo user upserted)
      }),
    });
    const saved = await jsonOrThrow(saveRes, "Create track"); // { track }

    setStatus("Done!");
    setTimeout(() => {
      router.push(`/tracks/${saved.track.id}`);
    }, 300);
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Upload to Library</h1>

      <div className="space-y-3 rounded border border-white/10 p-4">
        <label className="block text-sm">Title (optional)</label>
        <input
          className="w-full rounded border border-white/20 bg-black/30 p-2 outline-none"
          placeholder="Song title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="block text-sm mt-4">Audio file</label>
        <input ref={fileRef} type="file" accept="audio/*" className="w-full" />

        <button
          onClick={handleUpload}
          className="mt-4 rounded bg-indigo-600 px-4 py-2 hover:bg-indigo-500 transition disabled:opacity-50"
          disabled={status.startsWith("Uploading")}
        >
          Upload & Save
        </button>

        {status && <div className="text-sm text-gray-400 mt-2">{status}</div>}
        {progress > 0 && progress < 100 && (
          <div className="w-full h-2 bg-white/10 rounded overflow-hidden">
            <div
              className="h-2 bg-indigo-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {error && <div className="text-sm text-red-400">❌ {error}</div>}
      </div>

      <p className="text-xs text-gray-500">
        Files go to Supabase bucket <code>media/uploads/…</code> and a Track row
        is created.
      </p>
    </main>
  );
}
