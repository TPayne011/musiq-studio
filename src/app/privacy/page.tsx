// src/app/privacy/page.tsx
export const metadata = { title: "Privacy — Musiq-Studio" };

export default function PrivacyPage() {
  return (
    <main className="prose prose-slate max-w-3xl mx-auto px-4 py-12">
      <h1>Privacy Policy</h1>
      <p>
        <strong>Last updated:</strong> 2025-09-20
      </p>

      <h2>Who we are</h2>
      <p>
        <strong>Musiq-Studio</strong> is an educational/demo project by Anthony
        Payne.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Local data:</strong> Track names and settings saved in your
          browser’s localStorage (stays on your device).
        </li>
        <li>
          <strong>Optional contact:</strong> If you email us, we receive your
          message and address.
        </li>
      </ul>

      <h2>How we use info</h2>
      <ul>
        <li>Provide and improve app features.</li>
        <li>Respond to support requests.</li>
      </ul>

      <h2>What we don’t do</h2>
      <ul>
        <li>No selling of personal data.</li>
        <li>No advertising trackers.</li>
      </ul>

      <h2>Cookies & storage</h2>
      <p>
        We use localStorage to remember your Studio settings. Clearing your
        browser data removes it.
      </p>

      <h2>Data retention</h2>
      <p>
        Local data remains on your device until you clear it or hit{" "}
        <em>Reset</em> in Studio.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>
          Use the in-app <em>Reset</em> to clear local data.
        </li>
        <li>Contact us to request deletion of any messages you sent us.</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Email:{" "}
        <a href="mailto:contact@musiq-studio.example">
          contact@musiq-studio.example
        </a>
      </p>
    </main>
  );
}
