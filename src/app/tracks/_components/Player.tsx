"use client";

import { useEffect, useRef } from "react";
import WaveSurfer, { WaveSurferOptions } from "wavesurfer.js";

export default function Player({ audioUrl }: { audioUrl: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const options: WaveSurferOptions = {
      container: containerRef.current,
      height: 80,
      url: audioUrl,
    };

    const ws = WaveSurfer.create(options);
    wsRef.current = ws;

    return () => {
      ws.destroy();
      wsRef.current = null;
    };
  }, [audioUrl]);

  return (
    <div>
      <div ref={containerRef} className="rounded border overflow-hidden" />
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => wsRef.current?.playPause()}
          className="px-3 py-1 border rounded"
        >
          Play / Pause
        </button>
        <button
          onClick={() => wsRef.current?.stop()}
          className="px-3 py-1 border rounded"
        >
          Stop
        </button>
      </div>
    </div>
  );
}
