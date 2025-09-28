"use client";
import { useEffect, useRef } from "react";

type Props = { analyser: AnalyserNode | null };

export default function Visualizer({ analyser }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const data = new Uint8Array(analyser.frequencyBinCount);

    let raf = 0;
    const render = () => {
      analyser.getByteFrequencyData(data);
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const barWidth = Math.max(1, (width / data.length) * 2.2);
      for (let i = 0, x = 0; i < data.length; i++) {
        const v = data[i];
        const barHeight = (v / 255) * height;
        ctx.fillStyle = "#2563eb"; // Tailwind blue-600
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return <canvas ref={canvasRef} className="w-full h-32 rounded bg-gray-100" />;
}
