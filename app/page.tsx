import Link from "next/link";
import Navbar from "@/components/Navbar";
import LogoMark from "@/components/LogoMark";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-saqqara-dark">

        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(201,162,39,0.15),_transparent_25%)]" />
          </div>

          <div className="relative z-10 px-4 max-w-3xl mx-auto text-center flex flex-col items-center">
            <div className="mb-6 flex justify-center">
              <LogoMark size={90} showTagline={false} glow={true} />
            </div>
            <h1 className="text-base md:text-lg lg:text-xl font-cinzel font-black tracking-[0.08em] text-saqqara-gold drop-shadow-[0_4px_12px_rgba(0,0,0,0.18)] text-center">
              SAQQARA
            </h1>

            <div className="mb-7 inline-flex items-center justify-center gap-3 px-6 py-2 rounded-full border border-saqqara-gold/60 bg-saqqara-dark/80 backdrop-blur-md text-xs uppercase tracking-[0.35em] text-saqqara-light/80">
              <span className="font-semibold text-saqqara-gold">Live Long</span>
              <span className="h-1 w-1 rounded-full bg-saqqara-gold" />
              <span className="font-semibold">Carolann</span>
            </div>

            <p className="text-base md:text-lg text-saqqara-light mb-4 leading-relaxed text-center">
              Elevating holistic and cosmetic service providers with premium artist-first brand experiences.
            </p>

            <p className="text-xs text-saqqara-light/80 mb-6 max-w-xl mx-auto text-center">
              Founded in 2013, now digital. A modern platform for skilled artists and entrepreneurs to showcase work, connect with clients, and grow their personal brand in a luxurious digital space.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
              <Link href="/login">
                <button className="btn btn-primary px-2 py-1 min-w-[80px]">
                  Get Started
                </button>
              </Link>
              <a href="https://outlook.office.com/book/SaqqaraLongLiveCarolann@Saqqarallc.com/" target="_blank" rel="noopener noreferrer">
                <button className="btn btn-secondary px-2 py-1 min-w-[80px]">
                  Book a Call
                </button>
              </a>
              <Link href="/forms/salon-location">
                <button className="btn btn-ghost px-2 py-1 min-w-[80px]">
                  Salon Application
                </button>
              </Link>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-5 h-5 text-saqqara-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-6 px-2 bg-saqqara-card/50">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-lg font-cinzel mb-6">Why Saqqara</h2>
            <div className="grid md:grid-cols-3 gap-2 justify-center items-center">
              {[
                {
                  icon: "🎨",
                  title: "Artist Recognition",
                  desc: "We celebrate you as a skilled professional and creative entrepreneur, not just a service provider."
                },
                {
                  icon: "🔗",
                  title: "Client Connection",
                  desc: "Connect directly with clients seeking quality services. Build lasting professional relationships."
                },
                {
                  icon: "📈",
                  title: "Business Growth",
                  desc: "Intuitive tools designed to help you grow your personal brand and expand your reach."
                },
                {
                  icon: "🛡️",
                  title: "Secure Platform",
                  desc: "Enterprise-grade security with encrypted payments and protected client information."
                },
                {
                  icon: "💬",
                  title: "Smart Communications",
                  desc: "Segment-based messaging, automated confirmations, and professional notifications."
                },
                {
                  icon: "🌍",
                  title: "Community Driven",
                  desc: "Join a network of professionals committed to professionalism, innovation, and community."
                }
              ].map((feature, idx) => (
                <div key={idx} className="card group hover:border-saqqara-gold p-2">
                  <div className="text-xl mb-2">{feature.icon}</div>
                  <h3 className="text-xs mb-1">{feature.title}</h3>
                  <p className="text-saqqara-light/70 text-xs">{feature.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2 lg:grid-cols-[1.2fr_0.8fr] justify-center items-center">
              <div className="card border-saqqara-gold/30 bg-gradient-to-br from-saqqara-gold/10 via-transparent to-saqqara-card p-2">
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="badge badge-success text-xs">Priority Application</span>
                    <h3 className="text-base font-semibold mt-2">Secure Your Salon Listing</h3>
                    <p className="mt-2 text-saqqara-light/75 text-xs">
                      Submit your salon location and get premium exposure across the Saqqara marketplace. Your application is one click away.
                    </p>
                  </div>
                  <Link href="/forms/salon-location">
                    <button className="btn btn-primary px-2 py-1 text-xs w-full md:w-auto">
                      Apply Now
                    </button>
                  </Link>
                </div>
              </div>
              <div className="card border-saqqara-gold/30 bg-saqqara-dark/95 p-2">
                <div className="flex flex-col gap-2">
                  <div className="text-saqqara-gold text-lg">📞</div>
                  <h3 className="text-sm font-semibold">Talk to Our Team</h3>
                  <p className="text-saqqara-light/70 text-xs">
                    Have questions about joining, licensing, or how Saqqara works? Book a free call with Kenny or Ahasan — we'll walk you through everything.
                  </p>
                  <a href="https://outlook.office.com/book/SaqqaraLongLiveCarolann@Saqqarallc.com/" target="_blank" rel="noopener noreferrer">
                    <button className="btn btn-secondary px-2 py-1 text-xs w-full md:w-auto">
                      Book a Free Call
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Artist Directory CTA */}
        <section className="py-4 px-2 bg-saqqara-card border-b border-saqqara-border">
          <div className="max-w-xs mx-auto text-center">
            <h2 className="text-base font-cinzel mb-2 tracking-[0.08em]">Discover Our Artists</h2>
            <p className="text-xs text-saqqara-light/80 mb-2 leading-relaxed mx-auto max-w-xs">
              Browse profiles of talented professionals, watch their streams, and connect with the expertise you're looking for.
            </p>
            <Link href="/artists">
              <button className="btn btn-primary px-2 py-1 text-xs rounded-full">
                Browse Artist Profiles
              </button>
            </Link>
            <div className="card mt-2 mx-auto max-w-xs rounded-[1rem] border border-saqqara-border/60 bg-saqqara-dark/90 shadow-[0_10px_30px_rgba(0,0,0,0.18)] py-4">
              <span className="text-lg">🎭</span>
              <p className="text-saqqara-light mt-2 text-xs">Meet our community of skilled professionals</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-4 px-2 bg-gradient-to-r from-saqqara-gold/10 to-transparent">
          <div className="max-w-xs mx-auto text-center">
            <div className="grid md:grid-cols-3 gap-2">
              <div>
                <div className="text-base font-bold text-saqqara-gold mb-1">Est. 2013</div>
                <p className="text-saqqara-light/80 text-xs">Over a Decade of Excellence</p>
              </div>
              <div>
                <div className="text-base font-bold text-saqqara-gold mb-1">13 Years</div>
                <p className="text-saqqara-light/80 text-xs">Industry Experience</p>
              </div>
              <div>
                <div className="text-base font-bold text-saqqara-gold mb-1">2026</div>
                <p className="text-saqqara-light/80 text-xs">Platform Launch</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-4 px-2">
          <div className="max-w-xs mx-auto text-center">
            <h2 className="text-base font-cinzel mb-2">Our Mission</h2>
            <p className="text-xs text-saqqara-light/80 leading-relaxed mb-2">
              Saqqara is committed to redefining how holistic and cosmetic services are experienced—transforming them into a curated, accessible, and artist-driven marketplace.
            </p>
            <p className="text-xs text-saqqara-light/80 leading-relaxed">
              By bridging the gap between wellness, beauty, and technology, we provide a structured digital space where professionals can showcase their work, connect with clients, and grow their personal brands with pride and professionalism.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-4 px-2 bg-saqqara-card border-t border-saqqara-border">
          <div className="max-w-xs mx-auto text-center">
            <h2 className="text-base font-cinzel mb-2 tracking-[0.08em]">Ready to Elevate Your Brand?</h2>
            <p className="text-xs text-saqqara-light/80 mb-2 leading-relaxed">Join the Saqqara community of professional artists and service providers.</p>
            <Link href="/login">
              <button className="btn btn-primary px-2 py-1 text-xs rounded-full">
                Get Started Now
              </button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-saqqara-dark border-t border-saqqara-border py-4 px-2">
          <div className="max-w-xs mx-auto text-center">
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 mb-2 text-center">
              <div>
                <h3 className="font-cinzel text-saqqara-gold mb-1 text-xs">Saqqara</h3>
                <p className="text-saqqara-light/60 text-xs">Elevating the beauty and wellness industry.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-xs uppercase tracking-[0.18em] text-saqqara-gold/90">Platform</h4>
                <ul className="space-y-1 text-xs text-saqqara-light/70">
                  <li><Link href="/docs" className="hover:text-saqqara-gold transition-colors">Documentation</Link></li>
                  <li><Link href="#" className="hover:text-saqqara-gold transition-colors">Security</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-xs uppercase tracking-[0.18em] text-saqqara-gold/90">Legal</h4>
                <ul className="space-y-1 text-xs text-saqqara-light/70">
                  <li><Link href="/docs/legal/privacy-policy" className="hover:text-saqqara-gold transition-colors">Privacy</Link></li>
                  <li><Link href="/docs/legal/terms-of-service" className="hover:text-saqqara-gold transition-colors">Terms</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-xs uppercase tracking-[0.18em] text-saqqara-gold/90">Contact</h4>
                <p className="text-xs text-saqqara-light/70">support@saqqarallc.com</p>
              </div>
            </div>
            <div className="border-t border-saqqara-border pt-2 text-center text-xs text-saqqara-light/60">
              <p>&copy; 2013–{new Date().getFullYear()} Saqqara LLC. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
