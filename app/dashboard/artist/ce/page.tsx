'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { apiGet, apiPost } from '@/lib/api';
import { STATE_CE_REQUIREMENTS } from '@/lib/data/stateceRequirements';

interface CeEntry {
  id: string;
  courseName: string;
  provider: string;
  topic: string;
  hours: number;
  dateCompleted: string;
  verified: boolean;
}

interface LogForm {
  courseName: string;
  provider: string;
  topic: string;
  hours: string;
  dateCompleted: string;
}

const TOPICS = ['HIV/AIDS', 'OSHA', "Worker's Comp", 'Sanitation', 'General', 'Other'];

export default function ArtistCEPage() {
  const [selectedState, setSelectedState] = useState('');
  const [entries, setEntries] = useState<CeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<LogForm>({
    courseName: '',
    provider: '',
    topic: 'General',
    hours: '',
    dateCompleted: '',
  });

  const requirement = STATE_CE_REQUIREMENTS.find(r => r.stateCode === selectedState);

  const completedHours = entries.reduce((sum, e) => sum + e.hours, 0);
  const requiredHours = requirement?.hoursRequired ?? 0;
  const progressPct = requiredHours > 0 ? Math.min(100, (completedHours / requiredHours) * 100) : 0;

  useEffect(() => {
    setLoading(true);
    apiGet('/api/artists/me/ce')
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newEntry = await apiPost('/api/artists/me/ce', {
        courseName: form.courseName,
        provider: form.provider,
        topic: form.topic,
        hours: parseFloat(form.hours),
        dateCompleted: form.dateCompleted,
      });
      setEntries(prev => [newEntry, ...prev]);
      setShowModal(false);
      setForm({ courseName: '', provider: '', topic: 'General', hours: '', dateCompleted: '' });
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <p className="text-xs font-cinzel tracking-[0.18em] text-saqqara-gold/60 uppercase mb-1">Artist Portal</p>
            <h1 className="text-xl font-cinzel tracking-[0.1em] text-saqqara-light">CE Tracking</h1>
            <p className="text-saqqara-light/30 text-xs mt-1">Track your continuing education hours and maintain compliance.</p>
          </div>

          {/* State Selector */}
          <div className="card" style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}>
            <p className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase mb-3">Your State</p>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="w-full bg-black/40 text-saqqara-light text-xs font-cinzel tracking-[0.08em] px-3 py-2 rounded-lg outline-none"
              style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}
            >
              <option value="">— Select your state —</option>
              {STATE_CE_REQUIREMENTS.map(r => (
                <option key={r.stateCode} value={r.stateCode}>{r.state}</option>
              ))}
            </select>
          </div>

          {/* Requirement Card */}
          {requirement && (
            <div className="card space-y-4" style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase mb-1">Requirement</p>
                  <h2 className="text-sm font-cinzel tracking-[0.08em] text-saqqara-light">{requirement.state}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-saqqara-light/40">Renewal every</p>
                  <p className="text-xs font-cinzel text-saqqara-gold">
                    {requirement.renewalPeriodMonths >= 12
                      ? `${requirement.renewalPeriodMonths / 12} yr${requirement.renewalPeriodMonths > 12 ? 's' : ''}`
                      : `${requirement.renewalPeriodMonths} mo`}
                  </p>
                </div>
              </div>

              {requirement.notes && (
                <div className="rounded-lg px-4 py-3 text-xs text-saqqara-gold/80 font-cinzel tracking-[0.06em]"
                  style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.2)' }}>
                  ℹ {requirement.notes}
                </div>
              )}

              {requirement.hoursRequired > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-saqqara-light/40 mb-0.5">Hours Required</p>
                      <p className="text-lg font-bold text-saqqara-gold">{requirement.hoursRequired}</p>
                    </div>
                    <div>
                      <p className="text-xs text-saqqara-light/40 mb-0.5">Hours Logged</p>
                      <p className="text-lg font-bold text-saqqara-light">{completedHours}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-saqqara-light/40 mb-1.5">
                      <span>Progress</span>
                      <span>{completedHours} / {requirement.hoursRequired} hrs ({Math.round(progressPct)}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, rgba(201,168,76,0.7), rgba(201,168,76,1))' }}
                      />
                    </div>
                  </div>

                  {/* Mandatory Topics */}
                  {requirement.mandatoryTopics.length > 0 && (
                    <div>
                      <p className="text-xs font-cinzel tracking-[0.1em] text-saqqara-light/40 uppercase mb-2">Mandatory Topics</p>
                      <div className="flex flex-wrap gap-2">
                        {requirement.mandatoryTopics.map(t => (
                          <span key={t.topic}
                            className="px-2.5 py-1 rounded-full text-xs font-cinzel tracking-[0.06em] text-saqqara-gold"
                            style={{ border: '0.5px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.06)' }}>
                            {t.topic} — {t.hours} hr{t.hours !== 1 ? 's' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Log CE Button */}
          <div className="flex justify-end">
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              + Log CE Course
            </button>
          </div>

          {/* Completions Table */}
          <div className="card" style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}>
            <p className="text-xs font-cinzel tracking-[0.12em] text-saqqara-light/40 uppercase mb-4">Logged Completions</p>

            {loading ? (
              <p className="text-xs text-saqqara-light/30 font-cinzel py-6 text-center">Loading…</p>
            ) : entries.length === 0 ? (
              <p className="text-xs text-saqqara-light/30 font-cinzel py-6 text-center">No CE courses logged yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '0.5px solid rgba(201,168,76,0.1)' }}>
                      {['Date', 'Course', 'Provider', 'Topic', 'Hours', 'Verified'].map(col => (
                        <th key={col} className="text-left py-2 px-3 font-cinzel tracking-[0.08em] text-saqqara-light/30 uppercase text-[0.6rem]">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(entry => (
                      <tr key={entry.id} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.03)' }}>
                        <td className="py-2.5 px-3 text-saqqara-light/60">
                          {new Date(entry.dateCompleted).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 text-saqqara-light">{entry.courseName}</td>
                        <td className="py-2.5 px-3 text-saqqara-light/60">{entry.provider}</td>
                        <td className="py-2.5 px-3 text-saqqara-light/60">{entry.topic}</td>
                        <td className="py-2.5 px-3 text-saqqara-gold font-bold">{entry.hours}</td>
                        <td className="py-2.5 px-3">
                          {entry.verified ? (
                            <span className="text-emerald-400">✓ Verified</span>
                          ) : (
                            <span className="text-saqqara-light/30">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log CE Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5"
            style={{ background: '#0c0c0c', border: '0.5px solid rgba(201,168,76,0.2)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-cinzel tracking-[0.1em] text-saqqara-light">Log CE Course</h2>
              <button onClick={() => setShowModal(false)} className="text-saqqara-light/30 hover:text-saqqara-light text-lg leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Course Name */}
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 uppercase mb-1.5">Course Name</label>
                <input
                  type="text"
                  required
                  value={form.courseName}
                  onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))}
                  className="w-full bg-black/40 text-saqqara-light text-xs px-3 py-2 rounded-lg outline-none"
                  style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}
                  placeholder="e.g. Advanced Sanitation Protocols"
                />
              </div>

              {/* Provider */}
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 uppercase mb-1.5">Provider</label>
                <input
                  type="text"
                  required
                  value={form.provider}
                  onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
                  className="w-full bg-black/40 text-saqqara-light text-xs px-3 py-2 rounded-lg outline-none"
                  style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}
                  placeholder="e.g. Florida Board of Cosmetology"
                />
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 uppercase mb-1.5">Topic</label>
                <select
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  className="w-full bg-black/40 text-saqqara-light text-xs px-3 py-2 rounded-lg outline-none"
                  style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}
                >
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Hours */}
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 uppercase mb-1.5">Hours</label>
                <input
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  value={form.hours}
                  onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                  className="w-full bg-black/40 text-saqqara-light text-xs px-3 py-2 rounded-lg outline-none"
                  style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}
                  placeholder="e.g. 4"
                />
              </div>

              {/* Date Completed */}
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 uppercase mb-1.5">Date Completed</label>
                <input
                  type="date"
                  required
                  value={form.dateCompleted}
                  onChange={e => setForm(f => ({ ...f, dateCompleted: e.target.value }))}
                  className="w-full bg-black/40 text-saqqara-light text-xs px-3 py-2 rounded-lg outline-none"
                  style={{ border: '0.5px solid rgba(201,168,76,0.2)' }}
                />
              </div>

              {/* Certificate Upload */}
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 uppercase mb-1.5">
                  Certificate Upload <span className="text-saqqara-light/20 normal-case">(coming soon)</span>
                </label>
                <div className="w-full bg-black/20 text-saqqara-light/20 text-xs px-3 py-2 rounded-lg text-center"
                  style={{ border: '0.5px solid rgba(201,168,76,0.1)' }}>
                  File upload launching soon
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 rounded-full transition-colors hover:text-saqqara-light"
                  style={{ border: '0.5px solid rgba(255,255,255,0.08)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 btn btn-primary">
                  {submitting ? 'Saving…' : 'Log Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
