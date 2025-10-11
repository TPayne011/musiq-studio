// src/app/terms/page.tsx
export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="card space-y-6">
        <h1>Terms of Service</h1>
        <p>
          These Terms govern your use of Musiq-Studio (the “Service”). By using
          the Service you agree to these Terms.
        </p>

        <section className="space-y-3">
          <h2>Use of the Service</h2>
          <ul>
            <li>
              You must be at least 13 and able to form a binding contract.
            </li>
            <li>
              Don’t misuse the Service, attempt to disrupt it, or infringe
              others’ rights.
            </li>
            <li>You’re responsible for content you upload or create.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2>Content & Ownership</h2>
          <p>
            You retain rights to your audio and other content. You must have the
            necessary rights to any content you use.
          </p>
        </section>

        <section className="space-y-3">
          <h2>No Warranties</h2>
          <p>The Service is provided “as is” without warranties of any kind.</p>
        </section>

        <section className="space-y-3">
          <h2>Limitation of Liability</h2>
          <p>
            To the extent permitted by law, we won’t be liable for indirect or
            consequential damages.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Changes</h2>
          <p>We may update these Terms. Continued use means you accept them.</p>
        </section>

        <section className="space-y-3">
          <h2>Contact</h2>
          <p>
            Contact: <a href="mailto:legal@musiq.studio">legal@musiq.studio</a>
          </p>
        </section>

        <p className="text-xs text-neutral-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </main>
  );
}
