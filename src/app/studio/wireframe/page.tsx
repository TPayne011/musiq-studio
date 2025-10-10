// src/app/studio/wireframe/page.tsx
import PiWireframes from "@/components/PiWireframes";

export default function StudioWireframePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <PiWireframes initialTab="studio" />
    </main>
  );
}
