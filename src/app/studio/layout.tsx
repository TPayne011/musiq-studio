// src/app/studio/layout.tsx
import React from "react";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="max-w-5xl mx-auto px-4 py-6">{children}</section>;
}
