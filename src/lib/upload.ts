// src/lib/upload.ts
export async function uploadBlobAsFile(
  blob: Blob,
  filename: string
): Promise<string> {
  const form = new FormData();
  form.append("file", blob, filename);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  const { url } = await res.json(); // return a public URL
  return url;
}
