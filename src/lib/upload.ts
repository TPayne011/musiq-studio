export async function uploadBlobAsFile(
  blob: Blob,
  filename: string
): Promise<string> {
  const form = new FormData();
  form.append("file", blob, filename);
  form.append("name", filename);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error || "Upload failed");
  }
  const { url } = await res.json();
  if (!url) throw new Error("Upload ok but missing URL");
  return url;
}
