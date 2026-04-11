import Navbar from '@/components/Navbar';

const sections = [
  {
    number: '01',
    title: 'Information We Collect',
    body: `We collect information you provide directly when you create an account or use platform features. This includes: full name; email address; profile photos and portfolio images; payment information (processed securely through our payment provider — Saqqara LLC does not store raw card data); service descriptions and professional credentials; and any other content you submit through forms or messages on the platform. We also collect usage data automatically, including IP address, browser type, pages visited, session duration, clickstream data, device identifiers, and referring URLs. Booking data — including appointment dates, services requested, and transaction history — is also retained.`,
  },
  {
    number: '02',
    title: 'How We Use Your Information',
    body: `We use the information we collect to: operate, maintain, and improve the platform; process bookings and payments; send transactional communications such as booking confirmations, reminders, and receipts; send administrative notices regarding account status, policy changes, or platform updates; provide customer support; detect and prevent fraud, abuse, or security incidents; enforce our Terms of Service; analyze aggregate usage trends to improve platform features; and display your public profile to other platform users when you are an artist. We do not use your personal information to make automated decisions with significant legal effects without your consent.`,
  },
  {
    number: '03',
    title: 'Data Sharing',
    body: `Saqqara LLC does not sell, rent, or trade your personal information to third parties for their marketing purposes. We may share data in the following limited circumstances: with payment processors to complete transactions; with cloud infrastructure and technology service providers who process data on our behalf under confidentiality obligations; with law enforcement or regulatory authorities when required by law or to protect the rights and safety of Saqqara LLC and its users; and in connection with a merger, acquisition, or sale of all or substantially all of our assets, in which case users will be notified. Artist profile information — including name, photo, services, and ratings — is visible to other users as part of the platform's core functionality.`,
  },
  {
    number: '04',
    title: 'Cookies',
    body: `We use cookies and similar tracking technologies to maintain session state, remember preferences, and analyze how users interact with the platform. Essential cookies are required for the platform to function and cannot be disabled. Analytics cookies help us understand usage patterns; you may opt out of analytics tracking by adjusting your browser settings or using available opt-out mechanisms. We do not use third-party advertising cookies. By using the platform, you consent to our use of essential cookies. A cookie banner will be presented where required by applicable law.`,
  },
  {
    number: '05',
    title: 'Data Security',
    body: `We implement industry-standard technical and organizational measures to protect your personal information against unauthorized access, disclosure, alteration, or destruction. These measures include encryption of data in transit (TLS), access controls, and regular security reviews. Payment data is handled by PCI-compliant payment processors. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security. You are responsible for maintaining the security of your account credentials.`,
  },
  {
    number: '06',
    title: 'Data Retention',
    body: `We retain your personal information for as long as your account is active and for a reasonable period thereafter to fulfill legitimate business or legal purposes. Booking records and transaction data may be retained for up to seven years for tax and accounting compliance. You may request deletion of your personal data at any time (see Section 7); however, some information may be retained where required by law, to resolve disputes, or to enforce our agreements.`,
  },
  {
    number: '07',
    title: 'Your Rights',
    body: `You have the right to: access a copy of the personal information we hold about you; request correction of inaccurate or incomplete information; request deletion of your personal data, subject to legal retention requirements; request restriction of processing in certain circumstances; and withdraw consent where processing is based on consent. To exercise any of these rights, contact us at support@saqqarallc.com. We will respond to verified requests within 30 days. If you are a resident of a jurisdiction with specific privacy rights (such as the California Consumer Privacy Act or EU GDPR), those rights apply to you to the extent mandated by applicable law.`,
  },
  {
    number: '08',
    title: "Children's Privacy",
    body: `The Saqqara LLC platform is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a user is under 18, we will promptly terminate their account and delete any associated personal data. If you believe a minor has provided personal information through our platform, please contact us immediately at support@saqqarallc.com.`,
  },
  {
    number: '09',
    title: 'Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. When we make material changes, we will notify registered users via email and post the updated policy on the platform with a revised effective date. Your continued use of the platform after notice of changes constitutes acceptance of the updated policy. We encourage you to review this policy periodically.`,
  },
  {
    number: '10',
    title: 'Contact',
    body: `For questions, concerns, or requests related to this Privacy Policy or your personal data, please contact us at: support@saqqarallc.com. Written correspondence may be directed to: Saqqara LLC, LLC, Florida, Osceola County.`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Header */}
          <div className="text-center space-y-3">
            <p className="script text-saqqara-gold text-2xl">Legal</p>
            <h1 className="font-cinzel text-lg tracking-[0.12em] text-saqqara-light">
              Privacy Policy
            </h1>
            <hr className="royal-divider" />
            <p className="font-cormorant text-saqqara-light/40 text-xs tracking-[0.06em]">
              Saqqara LLC, LLC &nbsp;·&nbsp; Effective May 1, 2026 &nbsp;·&nbsp; Florida, Osceola County
            </p>
            <p className="font-cormorant text-saqqara-light/30 text-xs max-w-lg mx-auto leading-relaxed">
              Your privacy matters to us. This policy explains what information we collect, why we collect it, and how we protect it.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-5">
            {sections.map((s) => (
              <div
                key={s.number}
                className="card"
                style={{ border: '0.5px solid rgba(201,168,76,0.12)' }}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="font-cinzel text-[0.6rem] tracking-[0.16em] shrink-0 mt-0.5"
                    style={{ color: 'rgba(201,168,76,0.35)' }}
                  >
                    {s.number}
                  </span>
                  <div className="space-y-2 min-w-0">
                    <h2 className="font-cinzel text-xs tracking-[0.1em] text-saqqara-gold">
                      {s.title}
                    </h2>
                    <p
                      className="font-cormorant text-saqqara-light/65 leading-relaxed"
                      style={{ fontSize: '0.92rem' }}
                    >
                      {s.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="text-center space-y-2 pt-4 pb-8">
            <hr className="royal-divider" />
            <p className="font-cormorant text-saqqara-light/25 text-xs leading-relaxed">
              This document was last reviewed April 2026. Saqqara LLC reserves the right to update this Privacy Policy at any time with notice as described in Section 9.
            </p>
            <p className="font-cinzel text-[0.55rem] tracking-[0.1em] text-saqqara-light/20 uppercase">
              Saqqara LLC, LLC &nbsp;·&nbsp; EIN 46-3485577 &nbsp;·&nbsp; support@saqqarallc.com
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
