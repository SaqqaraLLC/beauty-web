'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiPost } from '@/lib/api';

const SPECIALTIES = [
  'Hair Styling', 'Makeup Artistry', 'Nail Artistry', 'Esthetics & Skincare',
  'Massage & Bodywork', 'Hair Extensions', 'Cosmetology', 'Holistic Wellness', 'Multi-Specialty',
];

export default function AgentRegisterPage() {
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [selected,  setSelected]  = useState<string[]>([]);
  const [form, setForm] = useState({
    fullName:     '',
    agencyName:   '',
    bio:          '',
    websiteUrl:   '',
    contactEmail: '',
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const toggleSpecialty = (s: string) =>
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiPost('/api/agents/register', { ...form, specialties: selected });
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
            Your agent profile is under review. Once approved you can begin building your artist roster and submitting booking proposals.
          </p>
          <Link href="/login" className="btn btn-primary w-full">Continue to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-saqqara-dark flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <p className="script text-saqqara-gold mb-1">For Agents</p>
          <h1 className="text-xl font-cinzel tracking-[0.12em]">Agent Registration</h1>
          <p className="text-saqqara-light/35 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
            Represent talented artists, build your roster, and submit proposals on their behalf.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label>Your Full Name</label>
                <input value={form.fullName} onChange={set('fullName')} required placeholder="First Last" />
              </div>

              <div>
                <label>Agency Name <span className="text-saqqara-light/25">(optional)</span></label>
                <input value={form.agencyName} onChange={set('agencyName')} placeholder="Elite Talent Agency" />
              </div>

              <div>
                <label>Contact Email</label>
                <input type="email" value={form.contactEmail} onChange={set('contactEmail')} required placeholder="agent@agency.com" />
              </div>

              <div>
                <label>Website <span className="text-saqqara-light/25">(optional)</span></label>
                <input type="url" value={form.websiteUrl} onChange={set('websiteUrl')} placeholder="https://youragency.com" />
              </div>

              {/* Specialty Tags */}
              <div className="sm:col-span-2">
                <label>Artist Specialties You Represent</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {SPECIALTIES.map(s => (
                    <button
                      key={s} type="button"
                      onClick={() => toggleSpecialty(s)}
                      className="px-3 py-1.5 rounded-full text-xs font-cinzel tracking-[0.08em] transition-all duration-200"
                      style={{
                        border: selected.includes(s)
                          ? '0.5px solid rgba(201,168,76,0.6)'
                          : '0.5px solid rgba(255,255,255,0.08)',
                        background: selected.includes(s)
                          ? 'rgba(201,168,76,0.1)'
                          : 'transparent',
                        color: selected.includes(s) ? '#C9A84C' : 'rgba(237,237,237,0.35)',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label>About You</label>
                <textarea
                  value={form.bio}
                  onChange={set('bio')}
                  rows={4}
                  placeholder="Describe your background, the artists you work with, and your approach to representation…"
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
              {loading ? 'Submitting…' : 'Submit Agent Application'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-saqqara-light/25"
            style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
            Already registered?{' '}
            <Link href="/login" className="text-saqqara-gold hover:text-saqqara-gold-soft transition-colors">Sign in</Link>
            {' · '}
            <Link href="/register" className="text-saqqara-gold hover:text-saqqara-gold-soft transition-colors">Apply as an Artist</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
