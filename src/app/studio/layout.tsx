import React from "react";
import StudioTabs from "@/components/studio/StudioTabs";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">musiq-studio on Pi</h1>
      </header>
      <StudioTabs />
      <div className="mt-6">{children}</div>
    </main>
  );
}
