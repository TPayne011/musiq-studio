// Simple 16-bit WAV encoder for a stereo Float32 PCM buffer
export function encodeWavStereo(
  left: Float32Array,
  right: Float32Array,
  sampleRate = 44100
): Blob {
  const numFrames = Math.min(left.length, right.length);
  const bytesPerSample = 2;
  const blockAlign = 2 * bytesPerSample; // 2 ch * 2 bytes
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;

  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  function writeString(off: number, s: string) {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  }

  let offset = 0;
  writeString(offset, "RIFF");
  offset += 4;
  view.setUint32(offset, 36 + dataSize, true);
  offset += 4;
  writeString(offset, "WAVE");
  offset += 4;

  writeString(offset, "fmt ");
  offset += 4;
  view.setUint32(offset, 16, true);
  offset += 4; // PCM chunk size
  view.setUint16(offset, 1, true);
  offset += 2; // PCM format
  view.setUint16(offset, 2, true);
  offset += 2; // channels = 2
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, byteRate, true);
  offset += 4;
  view.setUint16(offset, blockAlign, true);
  offset += 2;
  view.setUint16(offset, 16, true);
  offset += 2; // bits per sample

  writeString(offset, "data");
  offset += 4;
  view.setUint32(offset, dataSize, true);
  offset += 4;

  // write PCM interleaved
  let idx = 0;
  for (let i = 0; i < numFrames; i++) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset + idx, Math.round(l * 0x7fff), true);
    idx += 2;
    view.setInt16(offset + idx, Math.round(r * 0x7fff), true);
    idx += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}
