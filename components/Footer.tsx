import Link from 'next/link';
import LogoMark from './LogoMark';

const legalLinks = [
  { href: '/terms',         label: 'Terms of Service' },
  { href: '/privacy',       label: 'Privacy Policy'   },
  { href: '/refund-policy', label: 'Refund Policy'    },
];

export default function Footer() {
  return (
    <footer
      className="relative z-10 w-full"
      style={{ borderTop: '0.5px solid rgba(201,168,76,0.1)' }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
        <div className="flex flex-col items-center gap-6">

          {/* Logo + tagline */}
          <div className="flex flex-col items-center gap-2">
            <LogoMark size={28} />
            <p className="font-cinzel text-[0.55rem] tracking-[0.18em] uppercase text-saqqara-light/25">
              Beauty &amp; Wellness Platform
            </p>
          </div>

          {/* Royal divider */}
          <hr className="royal-divider w-full max-w-xs" />

          {/* Legal links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {legalLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-cinzel text-[0.58rem] tracking-[0.12em] uppercase text-saqqara-light/30 hover:text-saqqara-gold transition-colors duration-300"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="mailto:support@saqqarallc.com"
              className="font-cinzel text-[0.58rem] tracking-[0.12em] uppercase text-saqqara-light/30 hover:text-saqqara-gold transition-colors duration-300"
            >
              Contact
            </a>
          </nav>

          {/* Copyright */}
          <p className="font-cormorant text-saqqara-light/15 text-xs text-center leading-relaxed">
            &copy; {new Date().getFullYear()} Saqqara LLC, LLC &nbsp;&middot;&nbsp; Florida &nbsp;&middot;&nbsp; All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}
