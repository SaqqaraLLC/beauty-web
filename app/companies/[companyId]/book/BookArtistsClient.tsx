'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtistSelector from '@/components/company/ArtistSelector';
import { apiPost } from '@/lib/api';

type Step = 1 | 2 | 3;

interface ArtistSlot {
  artistId: number;
  artistName?: string;
  serviceRequested: string;
  feeCents: string;
}

interface EventDetails {
  title: string;
  description: string;
  eventDate: string;
  eventEndDate: string;
  location: string;
  ndaRequired: boolean;
  packageLabel: string;
  packageDiscountPercent: string;
}

const STEP_LABELS = ['Select Artists', 'Event Details', 'Review & Submit'];

export default function BookArtistsClient({ params }: { params: { companyId: string } }) {
  const router  = useRouter();
  const [step,        setStep]        = useState<Step>(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [slots,       setSlots]       = useState<Record<number, ArtistSlot>>({});
  const [details,     setDetails]     = useState<EventDetails>({
    title: '', description: '', eventDate: '', eventEndDate: '',
    location: '', ndaRequired: false, packageLabel: '', packageDiscountPercent: '',
  });
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const toggleArtist = (id: number) => {
    setSelectedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      if (!slots[id]) setSlots(s => ({ ...s, [id]: { artistId: id, serviceRequested: '', feeCents: '' } }));
      return next;
    });
  };

  const setDetail = (k: keyof EventDetails) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDetails(prev => ({ ...prev, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const setSlotField = (id: number, k: keyof ArtistSlot) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSlots(prev => ({ ...prev, [id]: { ...prev[id], [k]: e.target.value } }));

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const artistSlots = selectedIds.map(id => ({
        artistId:         id,
        serviceRequested: slots[id]?.serviceRequested || '',
        feeCents:         slots[id]?.feeCents ? Math.round(parseFloat(slots[id].feeCents) * 100) : undefined,
      }));
      await apiPost('/api/company-bookings', {
        ...details,
        companyId: Number(params.companyId),
        packageDiscountPercent: details.packageDiscountPercent ? Number(details.packageDiscountPercent) : undefined,
        artistSlots,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit booking');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-saqqara-dark flex items-center justify-center px-4">
        <div className="w-full max-w-md card text-center">
          <div className="text-3xl mb-4 text-saqqara-gold">✦</div>
          <h1 className="text-xl font-cinzel mb-3">Booking Submitted</h1>
          <p className="text-saqqara-light/50 text-sm mb-6 leading-relaxed">
            Your booking request has been sent to {selectedIds.length} artist{selectedIds.length > 1 ? 's' : ''}.
            You'll be notified as they respond.
          </p>
          <button onClick={() => router.push('/dashboard/company')} className="btn btn-primary w-full">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-saqqara-dark px-4 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEP_LABELS.map((label, i) => {
            const n = (i + 1) as Step;
            const active   = step === n;
            const complete = step > n;
            return (
              <div key={n} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-cinzel text-xs transition-all duration-300"
                    style={{
                      background: complete ? '#C9A84C' : active ? 'rgba(201,168,76,0.15)' : 'transparent',
                      border: complete ? 'none' : active ? '0.5px solid #C9A84C' : '0.5px solid rgba(255,255,255,0.1)',
                      color: complete ? '#080808' : active ? '#C9A84C' : 'rgba(237,237,237,0.25)',
                    }}
                  >
                    {complete ? '✓' : n}
                  </div>
                  <span className="text-xs font-cinzel tracking-[0.08em]"
                    style={{ color: active ? '#C9A84C' : 'rgba(237,237,237,0.25)' }}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className="w-16 h-px mx-3 mb-5"
                    style={{ background: step > n ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.06)' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Artist Selection ── */}
        {step === 1 && (
          <div className="card">
            <h2 className="text-base font-cinzel mb-1">Select Artists</h2>
            <p className="text-saqqara-light/35 text-xs mb-6">Choose one or more artists for your event. Selecting 3+ unlocks bundle discount options.</p>
            <ArtistSelector selected={selectedIds} onToggle={toggleArtist} />
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setStep(2)}
                disabled={selectedIds.length === 0}
                className="btn btn-primary disabled:opacity-40"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Event Details ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="card">
              <h2 className="text-base font-cinzel mb-1">Event Details</h2>
              <p className="text-saqqara-light/35 text-xs mb-6">Tell artists about the event and what you need from each of them.</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="sm:col-span-2">
                  <label>Event Title</label>
                  <input value={details.title} onChange={setDetail('title')} required placeholder="Spring Campaign Shoot" />
                </div>
                <div>
                  <label>Event Date</label>
                  <input type="date" value={details.eventDate} onChange={setDetail('eventDate')} required />
                </div>
                <div>
                  <label>End Date <span className="text-saqqara-light/25">(optional)</span></label>
                  <input type="date" value={details.eventEndDate} onChange={setDetail('eventEndDate')} />
                </div>
                <div className="sm:col-span-2">
                  <label>Venue / Location</label>
                  <input value={details.location} onChange={setDetail('location')} placeholder="Miami Beach Studio, FL" />
                </div>
                <div className="sm:col-span-2">
                  <label>Description</label>
                  <textarea value={details.description} onChange={setDetail('description')} rows={3}
                    placeholder="Describe the event, dress code, expectations…" className="resize-none" style={{ borderRadius: '1rem' }} />
                </div>

                {/* NDA */}
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer normal-case" style={{ textTransform: 'none', fontSize: '0.75rem', letterSpacing: '0.01em' }}>
                    <input
                      type="checkbox"
                      checked={details.ndaRequired}
                      onChange={e => setDetails(prev => ({ ...prev, ndaRequired: e.target.checked }))}
                      className="accent-saqqara-gold"
                      style={{ width: 'auto', borderRadius: '4px' }}
                    />
                    <span className="text-saqqara-light/60">Require NDA signing from all artists</span>
                  </label>
                </div>

                {/* Bundle discount (only show when 3+ selected) */}
                {selectedIds.length >= 3 && (
                  <>
                    <div>
                      <label>Package Label <span className="text-saqqara-light/25">(optional)</span></label>
                      <input value={details.packageLabel} onChange={setDetail('packageLabel')} placeholder="Spring Bundle" />
                    </div>
                    <div>
                      <label>Bundle Discount %</label>
                      <input type="number" min="0" max="50" value={details.packageDiscountPercent}
                        onChange={setDetail('packageDiscountPercent')} placeholder="10" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Per-artist service details */}
            <div className="card">
              <h3 className="text-sm font-cinzel mb-4">Per-Artist Requirements</h3>
              <div className="space-y-4">
                {selectedIds.map(id => (
                  <div key={id} className="grid sm:grid-cols-2 gap-3 pb-4"
                    style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <label>Service for Artist #{id}</label>
                      <input
                        value={slots[id]?.serviceRequested || ''}
                        onChange={setSlotField(id, 'serviceRequested')}
                        placeholder="e.g. Hair & Makeup"
                        required
                      />
                    </div>
                    <div>
                      <label>Proposed Fee (USD)</label>
                      <input
                        type="number" min="0" step="0.01"
                        value={slots[id]?.feeCents || ''}
                        onChange={setSlotField(id, 'feeCents')}
                        placeholder="500.00"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn btn-ghost">← Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={!details.title || !details.eventDate}
                className="btn btn-primary disabled:opacity-40"
              >
                Review Booking →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review & Submit ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="card">
              <h2 className="text-base font-cinzel mb-4">Review Your Booking</h2>

              <div className="space-y-3 mb-5">
                {[
                  ['Event',     details.title],
                  ['Date',      details.eventDate + (details.eventEndDate ? ` → ${details.eventEndDate}` : '')],
                  ['Location',  details.location || '—'],
                  ['Artists',   `${selectedIds.length} selected`],
                  ['NDA',       details.ndaRequired ? 'Required' : 'Not required'],
                  details.packageLabel ? ['Package', `${details.packageLabel}${details.packageDiscountPercent ? ` · ${details.packageDiscountPercent}% discount` : ''}`] : null,
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k as string} className="flex justify-between text-xs py-2"
                    style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                    <span className="font-cinzel tracking-[0.08em] text-saqqara-light/40">{k}</span>
                    <span className="text-saqqara-light/70">{v}</span>
                  </div>
                ))}
              </div>

              {details.description && (
                <div className="rounded-2xl px-4 py-3 mb-5"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-xs text-saqqara-light/40 mb-1 font-cinzel tracking-[0.08em]">Description</p>
                  <p className="text-xs text-saqqara-light/60 leading-relaxed">{details.description}</p>
                </div>
              )}

              <p className="text-xs text-saqqara-light/30 leading-relaxed">
                By submitting, a booking request will be sent to all selected artists. They will have the opportunity to accept or decline individually. You will be notified of each response.
              </p>
            </div>

            {error && (
              <div className="rounded-2xl px-4 py-3 text-xs text-red-300"
                style={{ background: 'rgba(127,29,29,0.2)', border: '0.5px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="btn btn-ghost">← Back</button>
              <button onClick={handleSubmit} disabled={loading} className="btn btn-primary">
                {loading ? 'Submitting…' : `Submit Booking to ${selectedIds.length} Artist${selectedIds.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
