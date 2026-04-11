import Navbar from '@/components/Navbar';

const sections = [
  {
    number: '01',
    title: 'Acceptance of Terms',
    body: `By accessing or using the Saqqara LLC platform (saqqarallc.com), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services. These Terms constitute a legally binding agreement between you and Saqqara LLC, LLC, a Florida limited liability company (EIN: 46-3485577).`,
  },
  {
    number: '02',
    title: 'Description of Service',
    body: `Saqqara LLC operates a SaaS marketplace platform serving the beauty and wellness industry. We provide technology infrastructure that connects independent beauty and wellness artists with clients, companies, and agents. Our services include artist profile hosting, appointment booking, live streaming, ratings and reviews, and related platform tools. Saqqara LLC is a technology intermediary and is not itself a provider of beauty or wellness services.`,
  },
  {
    number: '03',
    title: 'User Accounts & Eligibility',
    body: `You must be at least 18 years of age to create an account or use the platform. By registering, you represent that all information you provide is accurate and current. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Saqqara LLC reserves the right to suspend or terminate accounts that violate these Terms or that we believe, in our sole discretion, pose a risk to the platform or its users.`,
  },
  {
    number: '04',
    title: 'Artist Accounts',
    body: `Artists who register on the platform accept additional obligations. You agree to: (a) maintain an accurate and professional profile that reflects your actual services and qualifications; (b) honor all confirmed bookings or provide timely notice of cancellation; (c) conduct yourself professionally in all communications with clients, companies, and platform staff; (d) comply with all applicable professional licensing and regulatory requirements in your jurisdiction; (e) accurately represent your availability so clients may book reliably. Saqqara LLC reserves the right to remove or suspend any artist profile at its discretion.`,
  },
  {
    number: '05',
    title: 'Client Bookings & Payments',
    body: `All bookings made through the platform are subject to payment at the time of booking confirmation unless otherwise specified. Saqqara LLC processes payments as a technology facilitator; artist earnings are subject to the platform commission structure disclosed at the time of artist onboarding. Clients agree that payment information provided is accurate and that they authorize the applicable charges. All transactions are final at the time of booking confirmation unless a cancellation is initiated within the window described in Section 6.`,
  },
  {
    number: '06',
    title: 'Cancellation & Refund Policy',
    body: `Clients who cancel a booking 48 or more hours before the scheduled appointment will receive a full refund to their original payment method, typically within 5–10 business days. Clients who cancel fewer than 48 hours before the scheduled appointment are not entitled to a refund. If an artist cancels a confirmed booking for any reason, the client will receive a full refund automatically. Company bookings are subject to the cancellation and refund terms negotiated in the applicable service contract. No refunds are issued for live stream access once the stream has commenced. See our standalone Refund & Cancellation Policy page for complete details.`,
  },
  {
    number: '07',
    title: 'Live Streaming Content Policy',
    body: `Artists who broadcast live content through the Saqqara LLC platform agree to the following content standards: (a) all content must be directly related to beauty, wellness, cosmetics, holistic health, or associated professional topics; (b) nudity, sexually explicit content, or content that is obscene under applicable law is strictly prohibited; (c) harassment, hate speech, threats, or discriminatory language targeting any individual or group is prohibited; (d) artists may not broadcast content that infringes third-party intellectual property rights; (e) Saqqara LLC reserves the right to terminate any stream and suspend the broadcasting artist's account without prior notice for violations of this policy.`,
  },
  {
    number: '08',
    title: 'Reviews & Ratings',
    body: `The platform allows clients to leave ratings and reviews for artists following completed bookings. You agree that any review you submit reflects your honest personal experience. Submitting false, fabricated, or incentivized reviews is strictly prohibited. Artists may not solicit reviews in exchange for discounts, gifts, or other compensation. Saqqara LLC reserves the right to remove any review that we determine, in our sole discretion, is fraudulent, abusive, or in violation of these Terms. Reviews are not edited by Saqqara LLC; they reflect the opinions of the submitting user and not the views of Saqqara LLC.`,
  },
  {
    number: '09',
    title: 'Intellectual Property',
    body: `All platform software, design, trademarks, logos, and proprietary content are the intellectual property of Saqqara LLC, LLC. Artists retain ownership of the creative work and content they upload to the platform but grant Saqqara LLC a non-exclusive, royalty-free, worldwide license to display, distribute, and promote that content for purposes of operating and marketing the platform. You may not reproduce, distribute, or create derivative works from Saqqara LLC's proprietary materials without express written consent.`,
  },
  {
    number: '10',
    title: 'Prohibited Conduct',
    body: `You agree not to: (a) use the platform for any unlawful purpose or in violation of any applicable regulations; (b) attempt to gain unauthorized access to any portion of the platform or its systems; (c) scrape, harvest, or collect data from the platform without authorization; (d) impersonate any person or entity; (e) transmit spam, viruses, or any code of a destructive nature; (f) use the platform to facilitate transactions outside the platform to circumvent our fee structure; (g) engage in any conduct that disrupts or interferes with the proper functioning of the platform.`,
  },
  {
    number: '11',
    title: 'Termination',
    body: `Saqqara LLC may suspend or terminate your access to the platform at any time, with or without cause, and with or without notice, for conduct that we believe violates these Terms or is harmful to other users, Saqqara LLC, third parties, or the public. Upon termination, your right to use the platform ceases immediately. Provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.`,
  },
  {
    number: '12',
    title: 'Limitation of Liability',
    body: `To the fullest extent permitted by applicable law, Saqqara LLC, LLC and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or business interruption, arising from your use of or inability to use the platform. The platform is provided "as is" and "as available" without warranties of any kind, express or implied. Our total liability to you for any claim arising under these Terms shall not exceed the amount you paid to Saqqara LLC in the twelve months preceding the claim.`,
  },
  {
    number: '13',
    title: 'Governing Law',
    body: `These Terms of Service shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in Osceola County, Florida. You consent to personal jurisdiction in those courts and waive any objection to venue.`,
  },
  {
    number: '14',
    title: 'Contact',
    body: `If you have questions about these Terms of Service, please contact us at: support@saqqarallc.com. Written correspondence may be directed to: Saqqara LLC, LLC, Florida, Osceola County.`,
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Header */}
          <div className="text-center space-y-3">
            <p className="script text-saqqara-gold text-2xl">Legal</p>
            <h1 className="font-cinzel text-lg tracking-[0.12em] text-saqqara-light">
              Terms of Service
            </h1>
            <hr className="royal-divider" />
            <p className="font-cormorant text-saqqara-light/40 text-xs tracking-[0.06em]">
              Saqqara LLC, LLC &nbsp;·&nbsp; Effective May 1, 2026 &nbsp;·&nbsp; Florida, Osceola County
            </p>
            <p className="font-cormorant text-saqqara-light/30 text-xs max-w-lg mx-auto leading-relaxed">
              Please read these terms carefully before using the platform. By accessing any portion of saqqarallc.com you agree to be bound by the provisions below.
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
                    <p className="font-cormorant text-saqqara-light/65 leading-relaxed"
                      style={{ fontSize: '0.92rem' }}>
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
              This document was last reviewed April 2026. Saqqara LLC reserves the right to update these Terms at any time. Continued use of the platform following notice of changes constitutes acceptance of the updated Terms.
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
