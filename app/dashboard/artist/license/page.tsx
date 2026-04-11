'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { apiGet, apiPost } from '@/lib/api';
import type { LicenseAssistance, LicenseStatus } from '@/lib/types';

const LICENSE_TYPES = [
  'Cosmetology',
  'Esthetics / Esthetician',
  'Nail Technician',
  'Barbering',
  'Electrology',
  'Lash Technician',
  'Makeup Artist (State License)',
  'Other',
];

const STATUS_LABELS: Record<LicenseStatus, string> = {
  NotStarted:      'Not Started',
  EnrolledInSchool: 'Enrolled in School',
  ExamPending:     'Exam Pending',
  ExamFailed:      'Exam — Needs Retry',
  Licensed:        'Licensed ✓',
  Renewal:         'Up for Renewal',
};

const STATUS_COLORS: Record<LicenseStatus, string> = {
  NotStarted:       'rgba(255,255,255,0.1)',
  EnrolledInSchool:  'rgba(59,130,246,0.2)',
  ExamPending:      'rgba(245,158,11,0.2)',
  ExamFailed:       'rgba(239,68,68,0.15)',
  Licensed:         'rgba(16,185,129,0.2)',
  Renewal:          'rgba(201,168,76,0.15)',
};

export default function ArtistLicensePage() {
  const { user } = useCurrentUser();
  const [assistance, setAssistance] = useState<LicenseAssistance | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);

  const [optedIn,      setOptedIn]      = useState(false);
  const [licenseType,  setLicenseType]  = useState('');
  const [state,        setState]        = useState('');

  useEffect(() => {
    if (!user?.artistId) return;
    apiGet(`/api/artists/${user.artistId}/license-assistance`)
      .then((data: LicenseAssistance) => {
        setAssistance(data);
        setOptedIn(data.optedIn);
        setLicenseType(data.licenseType || '');
        setState(data.state || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  async function save() {
    if (!user?.artistId) return;
    setSaving(true);
    try {
      const result = await apiPost(`/api/artists/${user.artistId}/license-assistance`, {
        optedIn,
        licenseType: optedIn ? licenseType : undefined,
        state: optedIn ? state : undefined,
      });
      setAssistance(result);
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  const hasChanges = assistance
    ? (optedIn !== assistance.optedIn || licenseType !== (assistance.licenseType || '') || state !== (assistance.state || ''))
    : true;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center space-y-3">
            <p className="script text-saqqara-gold text-2xl">License Assistance</p>
            <p className="text-saqqara-light/40 text-xs font-cinzel tracking-[0.1em] max-w-md mx-auto">
              Saqqara helps you get licensed so you never miss an opportunity.
              We hold 20% of your service earnings toward licensing costs — no artist left behind.
            </p>
          </div>

          <div className="royal-divider" />

          {/* How It Works */}
          <div className="space-y-3">
            <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">How It Works</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { step: '01', title: 'Opt In',    body: 'Enable license assistance on your account. 20% of your service earnings is set aside.' },
                { step: '02', title: 'We Guide',  body: 'Saqqara coordinates enrollment in accredited programs, exam prep, and scheduling.' },
                { step: '03', title: 'Get Licensed', body: 'Once licensed, opt out. Your earnings return to full rate and your profile gets verified.' },
              ].map(({ step, title, body }) => (
                <div key={step} className="card space-y-2 text-center">
                  <p className="text-saqqara-gold/40 text-xs font-cinzel tracking-[0.15em]">{step}</p>
                  <p className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light">{title}</p>
                  <p className="text-saqqara-light/35 text-xs leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Current Status */}
          {assistance && assistance.optedIn && (
            <div className="card space-y-3">
              <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">Your Progress</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light">{assistance.licenseType || 'License'}</p>
                  <p className="text-saqqara-light/40 text-xs mt-0.5">{assistance.state || 'State not set'}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-cinzel tracking-[0.06em]"
                  style={{ background: STATUS_COLORS[assistance.currentStatus], border: '0.5px solid rgba(255,255,255,0.06)', color: '#EDEDED' }}>
                  {STATUS_LABELS[assistance.currentStatus]}
                </span>
              </div>
              {assistance.adminNotes && (
                <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light/35 mb-1">Note from Saqqara</p>
                  <p className="text-saqqara-light/55 text-xs">{assistance.adminNotes}</p>
                </div>
              )}
              {assistance.examDate && (
                <div className="flex justify-between text-xs py-1">
                  <span className="font-cinzel tracking-[0.08em] text-saqqara-light/35">Exam Date</span>
                  <span className="text-saqqara-light/60">{new Date(assistance.examDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          )}

          {/* Opt In / Settings */}
          <div className="card space-y-5">
            <h2 className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase">Settings</h2>

            {/* Toggle */}
            <div className="flex items-center justify-between py-2" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light">Enable License Assistance</p>
                <p className="text-saqqara-light/30 text-xs mt-0.5">20% of service earnings held toward licensing</p>
              </div>
              <button
                onClick={() => setOptedIn(!optedIn)}
                className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
                style={{
                  background: optedIn ? '#C9A84C' : 'rgba(255,255,255,0.08)',
                  border: '0.5px solid rgba(255,255,255,0.1)',
                }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm"
                  style={{ left: optedIn ? '22px' : '2px' }} />
              </button>
            </div>

            {/* License Type + State (shown when opted in) */}
            {optedIn && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">License Type</label>
                  <select value={licenseType} onChange={e => setLicenseType(e.target.value)}
                    className="w-full bg-saqqara-dark border border-saqqara-border rounded-2xl px-4 py-2.5 text-xs text-saqqara-light focus:outline-none focus:border-saqqara-gold/40">
                    <option value="">Select license type…</option>
                    {LICENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">State</label>
                  <input value={state} onChange={e => setState(e.target.value)}
                    placeholder="e.g. Florida"
                    className="w-full bg-saqqara-dark border border-saqqara-border rounded-2xl px-4 py-2.5 text-xs text-saqqara-light placeholder-saqqara-light/20 focus:outline-none focus:border-saqqara-gold/40" />
                </div>

                <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(201,168,76,0.04)', border: '0.5px solid rgba(201,168,76,0.12)' }}>
                  <p className="text-saqqara-gold/70 text-xs font-cinzel tracking-[0.06em]">
                    By opting in, you agree that 20% of your Saqqara service earnings will be held in a
                    licensing fund managed by Saqqara LLC until your license is obtained. Funds are
                    non-refundable once applied toward licensing costs.
                  </p>
                </div>
              </div>
            )}

            {hasChanges && (
              <button onClick={save} disabled={saving || (optedIn && (!licenseType || !state))}
                className="w-full btn btn-primary disabled:opacity-40">
                {saving ? 'Saving…' : 'Save Settings'}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
