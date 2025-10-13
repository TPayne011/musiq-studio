export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="card space-y-6">
        <h1>Musiq Studio on Pi — Privacy Policy</h1>
        <p>
          This Privacy Policy explains how Musiq Studio on Pi (“we”, “our”,
          “us”) collects, uses, and protects your information when you use our
          platform and related services (the “Service”). Musiq Studio operates
          within the Pi Network ecosystem and follows Pi Network’s privacy and
          data handling standards.
        </p>

        <section className="space-y-3">
          <h2>Information We Collect</h2>
          <ul>
            <li>
              <strong>Pi Network Account Info</strong> – Your basic Pioneer
              profile (username, wallet ID) is used for authentication and
              transaction verification through the official Pi SDK.
            </li>
            <li>
              <strong>Uploaded Media</strong> – Audio files and metadata you
              upload when minting NFTs are stored securely in Supabase storage.
            </li>
            <li>
              <strong>Usage Data</strong> – Basic app analytics and performance
              logs to improve stability and user experience.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2>How We Use Information</h2>
          <ul>
            <li>To enable track uploads, NFT minting, and playback.</li>
            <li>To verify transactions via Pi Network’s blockchain APIs.</li>
            <li>To enhance app reliability and improve creator tools.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2>Sharing</h2>
          <p>
            We never sell your personal information. Limited technical data may
            be shared with service providers like Supabase or Pi Network solely
            to enable authentication, uploads, and minting features.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Data Retention</h2>
          <p>
            Uploaded media and metadata remain stored for as long as your
            account is active. You may request deletion of specific assets or
            data by contacting our support team.
          </p>
        </section>

        <section className="space-y-3">
          <h2>Your Rights</h2>
          <ul>
            <li>Request access, export, or deletion of your data.</li>
            <li>
              Control analytics and cookie preferences via browser settings.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2>Contact</h2>
          <p>
            Questions or privacy concerns? Contact us at{" "}
            <a href="mailto:support@musiq.studio">support@musiq.studio</a>.
          </p>
        </section>

        <p className="text-xs text-neutral-500">
          Last updated: {new Date().toLocaleDateString()} · Musiq Studio on Pi
        </p>
      </div>
    </main>
  );
}
