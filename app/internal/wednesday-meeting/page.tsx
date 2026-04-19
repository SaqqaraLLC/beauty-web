'use client';

// Internal planning page — not linked in nav, accessible at /internal/wednesday-meeting

const AVG_INVOICE = 1500_00; // $1,500 in cents

function calcCapOne(cents: number) {
  const interchange = cents * 0.018;
  const markup      = cents * 0.0025;
  const perTxn      = 10; // $0.10 in cents
  return interchange + markup + perTxn;
}

function calcStripe(cents: number) {
  return cents * 0.029 + 30; // $0.30 in cents
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtK(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

// Annual fixed costs (cents)
const capOneYear1Fixed = (2495 * 12) + 19900 + 15900 - 35000; // monthly + annual + compliance - credit
const capOneYear2Fixed = (2495 * 12) + 19900;                  // monthly + annual only
const stripeFixed      = 0;

// Per-transaction savings
const savingsPerTxn = calcStripe(AVG_INVOICE) - calcCapOne(AVG_INVOICE);
const breakEvenY1   = Math.ceil((capOneYear1Fixed) / savingsPerTxn);
const breakEvenY2   = Math.ceil((capOneYear2Fixed) / savingsPerTxn);

const volumes = [10, 25, 50, 100, 200];

export default function WednesdayMeeting() {
  return (
    <div style={{ fontFamily: 'Georgia, serif', maxWidth: 900, margin: '0 auto', padding: '40px 32px', color: '#111', background: '#fff' }}>

      {/* Header */}
      <div style={{ borderBottom: '2px solid #C9A84C', paddingBottom: 20, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: 1, margin: 0 }}>Payment Processor Comparison</h1>
            <p style={{ margin: '4px 0 0', color: '#666', fontSize: 13 }}>Prepared for Wednesday, April 23 · Saqqara LLC</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: '#888' }}>
            <div>CONFIDENTIAL</div>
            <div>Internal Use Only</div>
          </div>
        </div>
      </div>

      {/* Side-by-Side */}
      <h2 style={{ fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', color: '#888', marginBottom: 16 }}>Cost Structure</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 40 }}>
        <thead>
          <tr style={{ background: '#f7f5f0' }}>
            <th style={th('')}>Fee</th>
            <th style={th('#1a3a5c')}>Capital One / Worldpay</th>
            <th style={th('#635bff')}>Stripe</th>
            <th style={th('#3ecf8e')}>Square</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Processing rate',        'Interchange + 0.25%',    '2.90%',        '2.90%'],
            ['Per-transaction fee',    '$0.10',                   '$0.30',        '$0.30'],
            ['Effective rate ($1,500)','~2.05% + $0.10 = ~$30.85','2.9% + $0.30 = $43.80','2.9% + $0.30 = $43.80'],
            ['Monthly fee',            '$24.95 (mandatory)',      '$0',           '$0'],
            ['Annual fee',             '$199 + $159 compliance',  '$0',           '$0'],
            ['First-year fixed total', '$658 (–$350 credit = $308 net)','$0',    '$0'],
            ['Contract',               '3-year minimum',          'None',         'None'],
            ['Settlement speed',       'Next business day',       '2 business days','Next business day'],
            ['Setup',                  'Application required',    'Instant online','Instant online'],
            ['Chargeback fee',         'TBD — confirm Wednesday', '$15',          '$0 (absorbed)'],
            ['Marketplace payouts',    'Via Authvia / CyberSource','Stripe Connect','Limited'],
            ['API quality',            'Enterprise-grade',        'Best-in-class', 'Good'],
          ].map(([label, cap, stripe, square], i) => (
            <tr key={label} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={td(true)}>{label}</td>
              <td style={td(false)}>{cap}</td>
              <td style={td(false)}>{stripe}</td>
              <td style={td(false)}>{square}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Break-Even */}
      <h2 style={{ fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Break-Even Analysis</h2>
      <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
        Based on average invoice of <strong>$1,500</strong>. Capital One/Worldpay saves <strong>{fmt(savingsPerTxn)}</strong> per transaction vs Stripe.
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 40 }}>
        <thead>
          <tr style={{ background: '#f7f5f0' }}>
            <th style={th('')}>Annual Bookings</th>
            <th style={th('')}>Annual Volume</th>
            <th style={th('#1a3a5c')}>Cap One/WP Total Cost</th>
            <th style={th('#635bff')}>Stripe Total Cost</th>
            <th style={th('')}>Winner</th>
          </tr>
        </thead>
        <tbody>
          {volumes.map((txns, i) => {
            const vol       = txns * AVG_INVOICE;
            const capCost   = txns * calcCapOne(AVG_INVOICE) + capOneYear1Fixed;
            const stripeCost= txns * calcStripe(AVG_INVOICE);
            const diff      = capCost - stripeCost;
            const winner    = diff < 0 ? '✅ Cap One/WP' : '✅ Stripe';
            const color     = diff < 0 ? '#15803d' : '#7c3aed';
            return (
              <tr key={txns} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={td(true)}>{txns} bookings</td>
                <td style={td(false)}>{fmtK(vol)}</td>
                <td style={td(false)}>{fmt(capCost)}</td>
                <td style={td(false)}>{fmt(stripeCost)}</td>
                <td style={{ ...td(false), color, fontWeight: 700 }}>{winner} (saves {fmt(Math.abs(diff))})</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Break-even callout */}
      <div style={{ background: '#fffbeb', border: '1px solid #C9A84C', borderRadius: 8, padding: '16px 20px', marginBottom: 40 }}>
        <strong style={{ fontSize: 14 }}>Break-Even Point (Year 1):</strong>
        <span style={{ fontSize: 14 }}> {breakEvenY1} paid invoices &nbsp;·&nbsp; </span>
        <strong style={{ fontSize: 14 }}>Year 2+:</strong>
        <span style={{ fontSize: 14 }}> {breakEvenY2} paid invoices per year</span>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#666' }}>
          If Saqqara processes more than {breakEvenY1} company invoices in year 1 — Capital One/Worldpay is the cost winner.
          At 2 paid bookings per month, you break even in year 1.
        </p>
      </div>

      {/* 3-Account Structure */}
      <h2 style={{ fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', color: '#888', marginBottom: 16 }}>Account Structure (Capital One)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 40 }}>
        <thead>
          <tr style={{ background: '#f7f5f0' }}>
            <th style={th('')}>Role</th>
            <th style={th('')}>Account</th>
            <th style={th('')}>Purpose</th>
            <th style={th('')}>Worldpay Action</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['🟩 Operating', 'Business Enhanced Checking (...0319)', 'All settlements land here', 'Set as primary deposit account'],
            ['🟨 Payout / Liability', 'Business Advantage Savings (...6609)', 'Provider earnings held here until payout day', 'Funded via scheduled transfer from Operating'],
            ['🟦 Expenses / Reserves', 'Business Advantage Savings (...5258)', 'Company margin, taxes, SaaS tools', 'Funded from Operating after provider split'],
          ].map(([role, acct, purpose, action], i) => (
            <tr key={role} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={td(true)}>{role}</td>
              <td style={td(false)}>{acct}</td>
              <td style={td(false)}>{purpose}</td>
              <td style={td(false)}>{action}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Wednesday Agenda */}
      <h2 style={{ fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', color: '#888', marginBottom: 16 }}>Wednesday Meeting Agenda</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
        {[
          {
            title: '1. Confirm early termination fee',
            body: 'The $350 sign-on credit requires a 3-year minimum agreement. Ask: what is the cost to exit in year 1 or 2? This determines your actual downside risk.',
          },
          {
            title: '2. Get Authvia API documentation',
            body: 'The gateway is Authvia (via CyberSource), not Worldpay\'s direct API. Request integration specs, sandbox credentials, and webhook documentation before signing.',
          },
          {
            title: '3. Confirm settlement account',
            body: 'Tell them your settlement/deposit account is Business Enhanced Checking (...0319). Confirm next-day funding timeline and any minimum balance requirements.',
          },
          {
            title: '4. Chargeback fee',
            body: 'Not listed in proposal. Ask the per-chargeback fee (Stripe charges $15; industry standard $20–$25). High dispute rates can materially change the cost model.',
          },
          {
            title: '5. Interchange ceiling on premium cards',
            body: 'Rewards cards and corporate cards carry higher interchange (2.2–2.8%). Ask for the ceiling rate so you can model a worst case. Amex is usually highest.',
          },
          {
            title: '6. Rate review at 1 year',
            body: 'They confirmed rates are reviewed after year 1 based on volume. Get this in writing. Lock a formal review clause into the agreement.',
          },
        ].map(item => (
          <div key={item.title} style={{ background: '#f7f5f0', borderRadius: 6, padding: '14px 16px', borderLeft: '3px solid #C9A84C' }}>
            <strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>{item.title}</strong>
            <p style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.6 }}>{item.body}</p>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div style={{ background: '#f0fdf4', border: '1px solid #15803d', borderRadius: 8, padding: '20px 24px', marginBottom: 40 }}>
        <h2 style={{ fontSize: 15, color: '#15803d', margin: '0 0 12px' }}>✅ Recommendation: Sign on Wednesday</h2>
        <p style={{ fontSize: 13, margin: '0 0 8px', lineHeight: 1.7 }}>
          At Saqqara's price point ($1,500+ invoices), the break-even is only <strong>{breakEvenY1} transactions in year 1</strong> —
          achievable with 2 paid company bookings per month. The 24-hour funding into your Capital One account is a real
          operational advantage with zero transfer delay.
        </p>
        <p style={{ fontSize: 13, margin: 0, lineHeight: 1.7 }}>
          <strong>Condition:</strong> Only sign if early termination fee is reasonable (&lt;$500). If exit is expensive
          and volume is uncertain, start on Stripe — our codebase supports a single config swap to switch processors at any time.
        </p>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #eee', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa' }}>
        <span>Saqqara LLC · Internal Use Only</span>
        <span>Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
      </div>

      {/* Print button */}
      <div style={{ textAlign: 'center', marginTop: 24 }} className="no-print">
        <button
          onClick={() => window.print()}
          style={{ padding: '10px 32px', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, cursor: 'pointer', letterSpacing: 1 }}
        >
          Print / Save as PDF
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; }
        }
      `}</style>
    </div>
  );
}

function th(color: string): React.CSSProperties {
  return {
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: color || '#333',
    borderBottom: '2px solid #e5e5e5',
  };
}

function td(bold: boolean): React.CSSProperties {
  return {
    padding: '9px 12px',
    fontSize: 13,
    fontWeight: bold ? 600 : 400,
    color: bold ? '#333' : '#555',
    borderBottom: '1px solid #f0f0f0',
    verticalAlign: 'top',
  };
}
