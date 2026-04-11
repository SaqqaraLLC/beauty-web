'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { apiGet, apiPost } from '@/lib/api';
import type { LicenseAssistance, LicenseStatus } from '@/lib/types';

const STATUS_LABELS: Record<LicenseStatus, string> = {
  NotStarted:       'Not Started',
  EnrolledInSchool:  'In School',
  ExamPending:      'Exam Pending',
  ExamFailed:       'Exam Failed',
  Licensed:         'Licensed',
  Renewal:          'Renewal',
};

const STATUS_COLORS: Record<LicenseStatus, string> = {
  NotStarted:       'rgba(255,255,255,0.08)',
  EnrolledInSchool:  'rgba(59,130,246,0.2)',
  ExamPending:      'rgba(245,158,11,0.2)',
  ExamFailed:       'rgba(239,68,68,0.15)',
  Licensed:         'rgba(16,185,129,0.2)',
  Renewal:          'rgba(201,168,76,0.15)',
};

const ALL_STATUSES: LicenseStatus[] = [
  'NotStarted', 'EnrolledInSchool', 'ExamPending', 'ExamFailed', 'Licensed', 'Renewal',
];

export default function AdminLicenseAssistancePage() {
  const [artists,   setArtists]   = useState<LicenseAssistance[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<LicenseAssistance | null>(null);
  const [notes,     setNotes]     = useState('');
  const [newStatus, setNewStatus] = useState<LicenseStatus>('NotStarted');
  const [examDate,  setExamDate]  = useState('');
  const [saving,    setSaving]    = useState(false);
  const [filter,    setFilter]    = useState<LicenseStatus | 'All'>('All');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    apiGet('/api/admin/license-assistance')
      .then(setArtists)
      .catch(() => setArtists([]))
      .finally(() => setLoading(false));
  }

  function openArtist(a: LicenseAssistance) {
    setSelected(a);
    setNotes(a.adminNotes || '');
    setNewStatus(a.currentStatus);
    setExamDate(a.examDate ? a.examDate.slice(0, 10) : '');
  }

  async function saveUpdate() {
    if (!selected) return;
    setSaving(true);
    try {
      await apiPost(`/api/admin/license-assistance/${selected.assistanceId}`, {
        currentStatus: newStatus,
        adminNotes: notes,
        examDate: examDate || undefined,
      });
      setSelected(null);
      await load();
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  const filtered = filter === 'All'
    ? artists
    : artists.filter(a => a.currentStatus === filter);

  const licensed = artists.filter(a => a.currentStatus === 'Licensed').length;
  const inProgress = artists.filter(a => !['NotStarted', 'Licensed'].includes(a.currentStatus)).length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <p className="script text-saqqara-gold text-2xl">License Assistance</p>
            <p className="text-saqqara-light/40 text-xs font-cinzel tracking-[0.1em] mt-0.5">
              Track and support artist licensing journeys
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Enrolled',    value: artists.length,  color: 'rgba(237,237,237,0.6)' },
              { label: 'In Progress', value: inProgress,      color: 'rgba(245,158,11,1)' },
              { label: 'Licensed',    value: licensed,         color: 'rgba(16,185,129,1)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card text-center">
                <div className="text-xl font-bold mb-1" style={{ color }}>{value}</div>
                <p className="text-saqqara-light/40 text-xs font-cinzel tracking-[0.08em]">{label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilter('All')}
              className="px-3 py-1 rounded-full text-xs font-cinzel tracking-[0.08em] transition-all"
              style={{
                background: filter === 'All' ? 'rgba(201,168,76,0.12)' : 'transparent',
                border: `0.5px solid ${filter === 'All' ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: filter === 'All' ? '#C9A84C' : 'rgba(237,237,237,0.35)',
              }}>
              All
            </button>
            {ALL_STATUSES.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className="px-3 py-1 rounded-full text-xs font-cinzel tracking-[0.08em] transition-all"
                style={{
                  background: filter === s ? STATUS_COLORS[s] : 'transparent',
                  border: `0.5px solid ${filter === s ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                  color: filter === s ? '#EDEDED' : 'rgba(237,237,237,0.3)',
                }}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Artist List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <p className="text-saqqara-light/30 text-xs font-cinzel">Loading…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-saqqara-light/30 text-xs font-cinzel">No artists in this category</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(a => (
                <div key={a.assistanceId}
                  onClick={() => openArtist(a)}
                  className="card flex items-center justify-between gap-4 cursor-pointer hover:border-saqqara-gold/20 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light truncate">{a.artistName}</p>
                    <p className="text-saqqara-light/35 text-xs mt-0.5">
                      {a.licenseType || 'No license type set'}{a.state ? ` · ${a.state}` : ''}
                    </p>
                    <p className="text-saqqara-light/20 text-xs mt-0.5">{a.artistEmail}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {a.examDate && (
                      <p className="text-saqqara-light/30 text-xs hidden sm:block">
                        Exam {new Date(a.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                    <span className="px-2.5 py-1 rounded-full text-xs font-cinzel tracking-[0.06em]"
                      style={{ background: STATUS_COLORS[a.currentStatus], color: '#EDEDED', border: '0.5px solid rgba(255,255,255,0.05)' }}>
                      {STATUS_LABELS[a.currentStatus]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Update Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md card space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-cinzel tracking-[0.08em] text-saqqara-light">{selected.artistName}</p>
                <p className="text-saqqara-light/40 text-xs mt-0.5">
                  {selected.licenseType || 'No license type'}{selected.state ? ` · ${selected.state}` : ''}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-saqqara-light/30 hover:text-saqqara-light text-lg">×</button>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">Progress Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as LicenseStatus)}
                className="w-full bg-saqqara-dark border border-saqqara-border rounded-2xl px-4 py-2.5 text-xs text-saqqara-light focus:outline-none focus:border-saqqara-gold/40">
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            {/* Exam Date */}
            <div>
              <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">
                Exam Date <span className="text-saqqara-light/20">(optional)</span>
              </label>
              <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
                className="w-full bg-saqqara-dark border border-saqqara-border rounded-2xl px-4 py-2.5 text-xs text-saqqara-light focus:outline-none focus:border-saqqara-gold/40" />
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">Notes to Artist</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                rows={3} placeholder="Updates, next steps, resources…"
                className="w-full bg-saqqara-dark border border-saqqara-border rounded-2xl px-4 py-3 text-xs text-saqqara-light placeholder-saqqara-light/20 focus:outline-none focus:border-saqqara-gold/30 resize-none" />
            </div>

            <button onClick={saveUpdate} disabled={saving} className="w-full btn btn-primary disabled:opacity-40">
              {saving ? 'Saving…' : 'Update Artist'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
