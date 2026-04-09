'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost } from '@/lib/api';

const INDUSTRIES = [
  'Film & Television', 'Fashion & Modeling', 'Events & Weddings',
  'Music & Entertainment', 'Corporate Events', 'Photography',
  'Advertising & Marketing', 'Cosmetics & Beauty', 'Other',
];

export default function CompanyRegisterPage() {
  const router = useRouter();
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    companyName:  '',
    industry:     '',
    websiteUrl:   '',
    description:  '',
    contactEmail: '',
    contactPhone: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiPost('/api/companies/register', form);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-saqqara-dark flex items-center justify-center px-4">
        <div className="w-full max-w-md card text-center">
          <div className="text-3xl mb-4 text-saqqara-gold">✦</div>
          <h1 className="text-xl font-cinzel mb-3 text-saqqara-gold">Application Received</h1>
          <p className="text-saqqara-light/50 text-sm mb-6 leading-relaxed">
            Your company profile is under review. Once approved you can begin booking artists for your events and campaigns.
          </p>
          <Link href="/auth/login" className="btn btn-primary w-full">Continue to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-saqqara-dark flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="script text-saqqara-gold mb-1">For Companies</p>
          <h1 className="text-xl font-cinzel tracking-[0.12em]">Company Registration</h1>
          <p className="text-saqqara-light/35 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
            Book multiple artists for events, campaigns, and productions through the Saqqara platform.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label>Company Name</label>
                <input value={form.companyName} onChange={set('companyName')} required placeholder="Acme Productions LLC" />
              </div>

              <div className="sm:col-span-2">
                <label>Industry</label>
                <select value={form.industry} onChange={set('industry')} required>
                  <option value="">Select your industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div>
                <label>Contact Email</label>
                <input type="email" value={form.contactEmail} onChange={set('contactEmail')} required placeholder="bookings@company.com" />
              </div>

              <div>
                <label>Contact Phone</label>
                <input type="tel" value={form.contactPhone} onChange={set('contactPhone')} placeholder="+1 (555) 000-0000" />
              </div>

              <div className="sm:col-span-2">
                <label>Website</label>
                <input type="url" value={form.websiteUrl} onChange={set('websiteUrl')} placeholder="https://yourcompany.com" />
              </div>

              <div className="sm:col-span-2">
                <label>About Your Company</label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  rows={4}
                  placeholder="Tell artists about your company, the types of projects you produce, and what to expect working with you…"
                  className="resize-none"
                  style={{ borderRadius: '1rem' }}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl px-4 py-3 text-xs text-red-300"
                style={{ background: 'rgba(127,29,29,0.2)', border: '0.5px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Submitting…' : 'Submit Company Application'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-saqqara-light/25"
            style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
            Already registered?{' '}
            <Link href="/auth/login" className="text-saqqara-gold hover:text-saqqara-gold-soft transition-colors">Sign in</Link>
            {' · '}
            <Link href="/auth/register" className="text-saqqara-gold hover:text-saqqara-gold-soft transition-colors">Apply as an Artist</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
