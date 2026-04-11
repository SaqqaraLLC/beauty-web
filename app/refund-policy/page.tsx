import Navbar from '@/components/Navbar';

const policies = [
  {
    icon: '✦',
    title: 'Client Cancels 48+ Hours Before',
    badge: 'Full Refund',
    badgeColor: 'rgba(110,231,183,0.12)',
    badgeBorder: 'rgba(110,231,183,0.25)',
    badgeText: '#6ee7b7',
    body: `If you cancel your booking 48 or more hours before the scheduled appointment start time, you will receive a full refund to your original payment method. Refunds are typically processed within 5–10 business days depending on your bank or card issuer.`,
  },
  {
    icon: '✦',
    title: 'Client Cancels Under 48 Hours Before',
    badge: 'No Refund',
    badgeColor: 'rgba(252,165,165,0.08)',
    badgeBorder: 'rgba(252,165,165,0.22)',
    badgeText: '#fca5a5',
    body: `Cancellations made fewer than 48 hours before the scheduled appointment are not eligible for a refund. This policy exists to protect artists' time and livelihoods. We encourage clients to review their schedule carefully before confirming a booking.`,
  },
  {
    icon: '✦',
    title: 'Artist Cancels',
    badge: 'Full Refund',
    badgeColor: 'rgba(110,231,183,0.12)',
    badgeBorder: 'rgba(110,231,183,0.25)',
    badgeText: '#6ee7b7',
    body: `If an artist cancels a confirmed booking for any reason, a full refund will be issued to the client automatically. Saqqara LLC processes this refund on the artist's behalf without requiring client action. Artists who repeatedly cancel confirmed bookings may have their accounts reviewed or suspended.`,
  },
  {
    icon: '✦',
    title: 'Company Bookings',
    badge: 'Per Contract',
    badgeColor: 'rgba(147,197,253,0.08)',
    badgeBorder: 'rgba(147,197,253,0.22)',
    badgeText: '#93c5fd',
    body: `Cancellation and refund terms for company-level bookings are governed by the individual service contract executed between the company and Saqqara LLC. Please refer to your contract or contact support@saqqarallc.com for assistance with company booking adjustments.`,
  },
  {
    icon: '✦',
    title: 'Live Stream Purchases',
    badge: 'No Refund',
    badgeColor: 'rgba(252,165,165,0.08)',
    badgeBorder: 'rgba(252,165,165,0.22)',
    badgeText: '#fca5a5',
    body: `Access fees or ticket purchases for live streams are non-refundable once the stream has commenced. If a stream is cancelled by the artist before it begins, a full refund will be issued. Technical issues on the platform side that prevent access to a stream will be assessed on a case-by-case basis — contact support@saqqarallc.com promptly.`,
  },
];

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Header */}
          <div className="text-center space-y-3">
            <p className="script text-saqqara-gold text-2xl">Policies</p>
            <h1 className="font-cinzel text-lg tracking-[0.12em] text-saqqara-light">
              Refund &amp; Cancellation Policy
            </h1>
            <hr className="royal-divider" />
            <p className="font-cormorant text-saqqara-light/40 text-xs tracking-[0.06em]">
              Saqqara LLC, LLC &nbsp;·&nbsp; Effective May 1, 2026
            </p>
            <p className="font-cormorant text-saqqara-light/30 text-xs max-w-lg mx-auto leading-relaxed">
              We strive to be fair to both clients and artists. Please review these policies before making a booking.
            </p>
          </div>

          {/* Policy cards */}
          <div className="space-y-4">
            {policies.map((p, i) => (
              <div
                key={i}
                className="card"
                style={{ border: '0.5px solid rgba(201,168,76,0.12)' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-start shrink-0">
                    <span className="text-saqqara-gold/20 text-lg leading-none">{p.icon}</span>
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-cinzel text-xs tracking-[0.1em] text-saqqara-light">
                        {p.title}
                      </h2>
                      <span
                        className="font-cinzel text-[0.55rem] tracking-[0.1em] uppercase px-2.5 py-0.5 rounded-full"
                        style={{
                          background: p.badgeColor,
                          border: `0.5px solid ${p.badgeBorder}`,
                          color: p.badgeText,
                        }}
                      >
                        {p.badge}
                      </span>
                    </div>
                    <p
                      className="font-cormorant text-saqqara-light/65 leading-relaxed"
                      style={{ fontSize: '0.92rem' }}
                    >
                      {p.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick reference table */}
          <div className="card" style={{ border: '0.5px solid rgba(201,168,76,0.12)' }}>
            <h2 className="font-cinzel text-xs tracking-[0.1em] text-saqqara-gold mb-4">
              Quick Reference
            </h2>
            <div className="space-y-0" style={{ border: '0.5px solid rgba(201,168,76,0.1)', borderRadius: '0.5rem', overflow: 'hidden' }}>
              {[
                { scenario: 'Client cancels 48+ hours prior',     outcome: 'Full refund' },
                { scenario: 'Client cancels under 48 hours',       outcome: 'No refund' },
                { scenario: 'Artist cancels',                       outcome: 'Full refund to client' },
                { scenario: 'Company booking cancellation',        outcome: 'Per contract' },
                { scenario: 'Live stream (completed)',             outcome: 'No refund' },
                { scenario: 'Live stream (cancelled before start)', outcome: 'Full refund' },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{
                    borderTop: i === 0 ? 'none' : '0.5px solid rgba(255,255,255,0.04)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  }}
                >
                  <span className="font-cormorant text-saqqara-light/50" style={{ fontSize: '0.85rem' }}>
                    {row.scenario}
                  </span>
                  <span
                    className="font-cinzel text-[0.6rem] tracking-[0.08em] shrink-0 ml-4"
                    style={{ color: row.outcome.startsWith('Full') ? '#6ee7b7' : row.outcome === 'No refund' ? '#fca5a5' : '#C9A84C' }}
                  >
                    {row.outcome}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div
            className="card text-center space-y-3"
            style={{ border: '0.5px solid rgba(201,168,76,0.12)' }}
          >
            <p className="font-cinzel text-xs tracking-[0.1em] text-saqqara-gold">
              Questions?
            </p>
            <p className="font-cormorant text-saqqara-light/50 leading-relaxed" style={{ fontSize: '0.92rem' }}>
              If you have a question about a specific booking or need help initiating a refund, contact our support team and we will respond within one business day.
            </p>
            <a
              href="mailto:support@saqqarallc.com"
              className="btn btn-secondary inline-flex"
            >
              support@saqqarallc.com
            </a>
          </div>

          {/* Footer */}
          <div className="text-center pb-8">
            <hr className="royal-divider" />
            <p className="font-cinzel text-[0.55rem] tracking-[0.1em] text-saqqara-light/20 uppercase">
              Saqqara LLC, LLC &nbsp;·&nbsp; EIN 46-3485577 &nbsp;·&nbsp; Florida
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
