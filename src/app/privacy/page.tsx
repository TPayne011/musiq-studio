// src/app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="card space-y-6">
        <h1>Privacy Policy</h1>
        <p>
          This Privacy Policy explains how Musiq-Studio (“we”, “our”, “us”)
          collects, uses, and shares information when you use our website and
          features (the “Service”).
        </p>

        <section className="space-y-3">
          <h2>Information We Collect</h2>
          <ul>
            <li>
              <strong>Account & contact info</strong> (if you choose to provide
              it).
            </li>
            <li>
              <strong>Usage data</strong> (pages visited, basic analytics).
            </li>
            <li>
              <strong>Local files</strong> you load into the Studio stay on your
              device; we do not upload them.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2>How We Use Information</h2>
          <ul>
            <li>To operate and improve the Service.</li>
            <li>To communicate with you about updates or support.</li>
            <li>To protect the Service from misuse or abuse.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2>Sharing</h2>
          <p>
            We do not sell your personal information. We may share limited data
            with service providers who help us run the Service (subject to
            confidentiality).
          </p>
        </section>

        <section className="space-y-3">
          <h2>Data Retention</h2>
          <p>
            We retain information only as long as necessary for the purposes
            above. Local audio you load in the Studio is not uploaded and does
            not leave your device.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Your Choices</h2>
          <ul>
            <li>You can request access or deletion of your account data.</li>
            <li>
              You can control cookies/analytics via your browser settings.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2>Contact</h2>
          <p>
            Questions? Contact us at{" "}
            <a href="mailto:support@musiq.studio">support@musiq.studio</a>.
          </p>
        </section>

        <p className="text-xs text-neutral-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </main>
  );
}
