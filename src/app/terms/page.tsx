// src/app/terms/page.tsx
export const metadata = { title: "Terms — Musiq-Studio" };

export default function TermsPage() {
  return (
    <main className="prose prose-slate max-w-3xl mx-auto px-4 py-12">
      <h1>Terms of Use</h1>
      <p>
        <strong>Last updated:</strong> 2025-09-20
      </p>

      <h2>Introduction</h2>
      <p>
        Welcome to <strong>Musiq-Studio</strong>. By using the site, you agree
        to these Terms.
      </p>

      <h2>License</h2>
      <p>
        Personal, non-commercial use only unless otherwise agreed in writing.
      </p>

      <h2>User content</h2>
      <ul>
        <li>You’re responsible for your audio files and rights to use them.</li>
        <li>Don’t upload illegal or infringing content.</li>
      </ul>

      <h2>Disclaimers</h2>
      <ul>
        <li>Provided “as is” without warranties.</li>
        <li>We may change or discontinue features at any time.</li>
      </ul>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Musiq-Studio is not liable for
        indirect or consequential damages.
      </p>

      <h2>Termination</h2>
      <p>We may suspend access if Terms are violated.</p>

      <h2>Governing law</h2>
      <p>Pennsylvania law (if you prefer another, tell me and I’ll adjust).</p>

      <h2>Contact</h2>
      <p>
        Email:{" "}
        <a href="mailto:legal@musiq-studio.example">
          legal@musiq-studio.example
        </a>
      </p>
    </main>
  );
}
