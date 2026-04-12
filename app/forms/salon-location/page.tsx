'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { STATE_CE_REQUIREMENTS } from '@/lib/data/stateceRequirements';

interface LicenseEntry {
  id: string;
  licenseType: string;
  licenseNumber: string;
  expiresAt: string;
  file: File | null;
}

const LICENSE_TYPE_OPTIONS = [
  'Cosmetology Salon / Establishment',
  'Cosmetologist',
  'Nail Specialist',
  'Facial / Esthetics Specialist',
  'Full Specialist',
  'Business License',
  'Health Permit',
  'Other',
];

function newEntry(): LicenseEntry {
  return { id: crypto.randomUUID(), licenseType: '', licenseNumber: '', expiresAt: '', file: null };
}

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','Washington DC','West Virginia','Wisconsin','Wyoming',
];

const serviceOptions = [
  'Cosmetology',
  'Nail Services',
  'Massage / Bodywork',
  'Skin Care / Esthetics',
  'Hair Extensions',
  'Specialty Services',
];

export default function SalonLocationApplicationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [showLicenseInfo, setShowLicenseInfo] = useState(true);
  const [form, setForm] = useState({
    salonName: '',
    firstName: '',
    lastName: '',
    idNumber: '',
    licenseType: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    totalSquareFeet: '',
    separateEntrance: 'yes',
    permanentWall: 'yes',
    separateLuxSpace: 'yes',
    shampooBowl: 'yes',
    toiletFacilities: 'yes',
    ventilation: 'yes',
    animalsAllowed: 'no',
    disinfectantType: 'epa',
    linensPractice: 'closed',
    pedicureLogs: 'yes',
    comments: '',
  });

  const [services, setServices] = useState<string[]>([]);
  const [licenses, setLicenses] = useState<LicenseEntry[]>([newEntry()]);
  const [loading, setLoading] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleService(service: string) {
    setServices(prev =>
      prev.includes(service)
        ? prev.filter(item => item !== service)
        : [...prev, service]
    );
  }

  function updateLicense(id: string, field: keyof Omit<LicenseEntry, 'id' | 'file'>, value: string) {
    setLicenses(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  }

  function setLicenseFile(id: string, file: File | null) {
    setLicenses(prev => prev.map(l => l.id === id ? { ...l, file } : l));
  }

  function removeLicense(id: string) {
    setLicenses(prev => prev.length > 1 ? prev.filter(l => l.id !== id) : prev);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setLoading(false);
    setSubmitted(true);
  }

  const selectedStateCe = form.state
    ? STATE_CE_REQUIREMENTS.find(r => r.state === form.state)
    : null;

  if (submitted) {
    return (
      <main className="min-h-screen bg-saqqara-dark px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-16">
            <h1 className="text-xl font-cinzel text-saqqara-gold mb-3">Salon Location Application Submitted</h1>
            <p className="text-saqqara-light/70 mb-8">
              Your application has been captured with the Saqqara compliance workflow. A member of our team will review the submission and contact you with next steps.
            </p>
            <Link href="/dashboard/admin">
              <button className="btn btn-primary">Return to Dashboard</button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-saqqara-dark px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <p className="text-saqqara-gold uppercase tracking-[0.4em] text-sm mb-4">Salon Compliance Application</p>
          <h1 className="text-2xl font-cinzel text-saqqara-light mb-3">Location Registration</h1>
          <p className="text-saqqara-light/70 max-w-3xl mx-auto">
            Complete the salon location application using the standard requirements for your state. This form captures ventilation, sanitation, facility, and disinfection compliance for your salon.
          </p>
        </div>

        <section className="card mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-saqqara-gold mb-2">License &amp; Artist Requirements</h2>
              <p className="text-saqqara-light/75">
                Saqqara requires each location and its artists to maintain the appropriate state license category, complete continuing education, and keep fees current.
                Requirements vary by state — select your state below to see the applicable requirements.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLicenseInfo(prev => !prev)}
              className="btn btn-secondary self-start sm:self-auto px-4 py-2 text-sm"
            >
              {showLicenseInfo ? 'Hide details' : 'Show details'}
            </button>
          </div>

          {showLicenseInfo && (
            <>
              {/* State-specific CE requirements */}
              <div className="mt-6">
                {!form.state ? (
                  <div className="rounded-lg px-4 py-6 text-center text-saqqara-light/40 text-xs font-cinzel tracking-[0.08em]"
                    style={{ border: '0.5px solid rgba(201,168,76,0.15)' }}>
                    Select your state in the Business Information section to see applicable license &amp; CE requirements.
                  </div>
                ) : selectedStateCe ? (
                  <div className="rounded-xl p-5 space-y-3"
                    style={{ background: 'rgba(201,168,76,0.04)', border: '0.5px solid rgba(201,168,76,0.18)' }}>
                    <p className="text-xs font-cinzel tracking-[0.1em] text-saqqara-gold">{selectedStateCe.state} — Continuing Education Requirements</p>
                    <div className="grid sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-saqqara-light/40 mb-0.5">CE Hours Required</p>
                        <p className="text-saqqara-light font-semibold">
                          {selectedStateCe.hoursRequired > 0 ? `${selectedStateCe.hoursRequired} hrs` : 'None required'}
                        </p>
                      </div>
                      <div>
                        <p className="text-saqqara-light/40 mb-0.5">Renewal Period</p>
                        <p className="text-saqqara-light font-semibold">
                          Every {selectedStateCe.renewalPeriodMonths / 12} {selectedStateCe.renewalPeriodMonths === 12 ? 'year' : 'years'}
                        </p>
                      </div>
                      <div>
                        <p className="text-saqqara-light/40 mb-0.5">License Types</p>
                        <p className="text-saqqara-light font-semibold">{selectedStateCe.licenseTypes.join(', ')}</p>
                      </div>
                    </div>
                    {selectedStateCe.mandatoryTopics.length > 0 && (
                      <div className="text-xs">
                        <p className="text-saqqara-light/40 mb-1">Mandatory Topics</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedStateCe.mandatoryTopics.map(t => (
                            <span key={t.topic} className="px-2 py-0.5 rounded-full text-saqqara-gold/70"
                              style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.2)' }}>
                              {t.topic}{t.hours ? ` · ${t.hours} hr` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedStateCe.notes && (
                      <p className="text-xs text-saqqara-light/50 italic">{selectedStateCe.notes}</p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg px-4 py-4 text-xs text-saqqara-light/50"
                    style={{ border: '0.5px solid rgba(255,255,255,0.07)' }}>
                    CE requirements for {form.state} are not yet on file. Contact <a href="mailto:support@saqqarallc.com" className="text-saqqara-gold/70">support@saqqarallc.com</a> for guidance.
                  </div>
                )}
              </div>

              <p className="text-saqqara-light/70 mt-6">
                Artists working at a Saqqara salon location must hold the appropriate license type for their service area and stay current on continuing education. This helps protect both your clients and your business.
              </p>

              <div className="mt-8 space-y-6">
                <div className="bg-saqqara-card border border-saqqara-border rounded-xl p-6">
                  <h3 className="text-base font-semibold text-saqqara-gold mb-3">License Type Definitions</h3>
                  <div className="space-y-5 text-saqqara-light/75">
                    <div>
                      <p className="font-semibold text-saqqara-light">Cosmetologist</p>
                      <p>
                        A cosmetologist is licensed to provide cosmetology services including mechanical and chemical treatment of the head, face, and scalp for aesthetic purposes. This includes hair cutting, shampooing, hair arranging, hair coloring, permanent waving, hair relaxing, hair removing, pedicuring, and manicuring.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-saqqara-light">Nail Specialist</p>
                      <p>
                        A nail specialist is licensed to provide manicuring and pedicuring services. This includes cutting, polishing, tinting, coloring, cleansing, adding or extending nails, and massaging of the hands and feet. Specific scope of practice varies by state board.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-saqqara-light">Facial / Esthetics Specialist</p>
                      <p>
                        A facial or esthetics specialist is licensed to perform facial services including massaging or treating the face or scalp with oils, creams, lotions, or other preparations. Services must be performed in a licensed salon or establishment. Scope varies by state.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-saqqara-light">Full Specialist</p>
                      <p>
                        A full specialist may perform any services allowed by both a facial specialist registration and a nail specialist registration. This includes combined facial and nail services under one professional license (where available by state).
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-saqqara-light">Cosmetology Salon / Establishment</p>
                      <p>
                        A cosmetology salon is a licensed and inspected facility where cosmetology services are conducted by licensed professionals. The salon must comply with safety, sanitation, and operational regulations as defined by the applicable state board.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="card">
            <h2 className="text-base font-semibold text-saqqara-gold mb-4">Business Information</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              <label className="block">
                <span className="text-saqqara-light/80">Salon Name</span>
                <input value={form.salonName} onChange={e => updateField('salonName', e.target.value)} required />
              </label>
              <label className="block">
                <span className="text-saqqara-light/80">First Name</span>
                <input value={form.firstName} onChange={e => updateField('firstName', e.target.value)} required />
              </label>
              <label className="block">
                <span className="text-saqqara-light/80">Last Name</span>
                <input value={form.lastName} onChange={e => updateField('lastName', e.target.value)} required />
              </label>
              <label className="block">
                <span className="text-saqqara-light/80">Government ID Number</span>
                <input value={form.idNumber} onChange={e => updateField('idNumber', e.target.value)} required />
              </label>
              <label className="block lg:col-span-2">
                <span className="text-saqqara-light/80">Street Address</span>
                <input value={form.address} onChange={e => updateField('address', e.target.value)} required />
              </label>
              <label className="block">
                <span className="text-saqqara-light/80">City</span>
                <input value={form.city} onChange={e => updateField('city', e.target.value)} required />
              </label>
              <label className="block">
                <span className="text-saqqara-light/80">State</span>
                <select value={form.state} onChange={e => updateField('state', e.target.value)} required>
                  <option value="">Select state</option>
                  {US_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-saqqara-light/80">ZIP Code</span>
                <input value={form.zip} onChange={e => updateField('zip', e.target.value)} required />
              </label>
            </div>
          </section>

          {/* ── Salon Licenses ─────────────────────────────────── */}
          <section className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-saqqara-gold">Salon Licenses</h2>
                <p className="text-saqqara-light/40 text-xs mt-0.5">Add every license held by this location. Upload a clear copy of each.</p>
              </div>
              <button
                type="button"
                onClick={() => setLicenses(prev => [...prev, newEntry()])}
                className="px-3 py-1.5 text-xs font-cinzel tracking-[0.08em] text-saqqara-gold/70 hover:text-saqqara-gold rounded-full transition-colors"
                style={{ border: '0.5px solid rgba(201,168,76,0.3)' }}>
                + Add License
              </button>
            </div>

            <div className="space-y-4">
              {licenses.map((lic, idx) => (
                <div key={lic.id} className="rounded-xl p-4 space-y-4"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(201,168,76,0.1)' }}>

                  <div className="flex items-center justify-between">
                    <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40">License {idx + 1}</p>
                    {licenses.length > 1 && (
                      <button type="button" onClick={() => removeLicense(lic.id)}
                        className="text-saqqara-light/20 hover:text-red-400 text-sm leading-none transition-colors">×</button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <label className="block">
                      <span className="text-saqqara-light/70 text-xs">License Type</span>
                      <select
                        value={lic.licenseType}
                        onChange={e => updateLicense(lic.id, 'licenseType', e.target.value)}
                        required>
                        <option value="">Select type</option>
                        {LICENSE_TYPE_OPTIONS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-saqqara-light/70 text-xs">License Number</span>
                      <input
                        value={lic.licenseNumber}
                        onChange={e => updateLicense(lic.id, 'licenseNumber', e.target.value)}
                        placeholder="e.g. CE1234567"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="text-saqqara-light/70 text-xs">Expiration Date</span>
                      <input
                        type="date"
                        value={lic.expiresAt}
                        onChange={e => updateLicense(lic.id, 'expiresAt', e.target.value)}
                        required
                      />
                    </label>
                  </div>

                  {/* File upload */}
                  <div>
                    <span className="block text-saqqara-light/70 text-xs mb-1.5">License Copy <span className="text-saqqara-light/30">(PDF, JPG, or PNG)</span></span>
                    <input
                      ref={el => { fileInputRefs.current[lic.id] = el; }}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={e => setLicenseFile(lic.id, e.target.files?.[0] ?? null)}
                    />
                    {lic.file ? (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-saqqara-light/60 truncate max-w-xs">{lic.file.name}</span>
                        <button type="button"
                          onClick={() => { setLicenseFile(lic.id, null); if (fileInputRefs.current[lic.id]) fileInputRefs.current[lic.id]!.value = ''; }}
                          className="text-xs text-red-400/60 hover:text-red-400 transition-colors">Remove</button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[lic.id]?.click()}
                        className="px-4 py-2 text-xs font-cinzel tracking-[0.08em] text-saqqara-light/50 hover:text-saqqara-light rounded-lg transition-colors"
                        style={{ border: '0.5px dashed rgba(201,168,76,0.25)' }}>
                        Upload Copy
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="text-base font-semibold text-saqqara-gold mb-4">Facility &amp; Safety Checklist</h2>
            <div className="grid gap-6">
              <div className="grid lg:grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-saqqara-light/80">Total Floor Space (sq ft)</span>
                  <input value={form.totalSquareFeet} onChange={e => updateField('totalSquareFeet', e.target.value)} required />
                </label>
                <label className="block">
                  <span className="text-saqqara-light/80">Separate Entrance?</span>
                  <select value={form.separateEntrance} onChange={e => updateField('separateEntrance', e.target.value)}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-saqqara-light/80">Permanent Wall Separation?</span>
                  <select value={form.permanentWall} onChange={e => updateField('permanentWall', e.target.value)}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
              </div>

              <div className="grid lg:grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-saqqara-light/80">Shampoo Bowl Available?</span>
                  <select value={form.shampooBowl} onChange={e => updateField('shampooBowl', e.target.value)}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-saqqara-light/80">Toilet / Lavatory Facilities?</span>
                  <select value={form.toiletFacilities} onChange={e => updateField('toiletFacilities', e.target.value)}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-saqqara-light/80">Adequate Ventilation?</span>
                  <select value={form.ventilation} onChange={e => updateField('ventilation', e.target.value)}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
              </div>

              <div className="grid lg:grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-saqqara-light/80">Animals Allowed?</span>
                  <select value={form.animalsAllowed} onChange={e => updateField('animalsAllowed', e.target.value)}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-saqqara-light/80">Disinfectant Type</span>
                  <select value={form.disinfectantType} onChange={e => updateField('disinfectantType', e.target.value)}>
                    <option value="epa">EPA Approved</option>
                    <option value="hospital">Hospital Grade</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-saqqara-light/80">Linen Handling</span>
                  <select value={form.linensPractice} onChange={e => updateField('linensPractice', e.target.value)}>
                    <option value="closed">Closed Cabinet</option>
                    <option value="separated">Separated Area</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="text-base font-semibold text-saqqara-gold mb-4">Service Types &amp; Pedicure Compliance</h2>
            <div className="grid gap-4 mb-6">
              <span className="text-saqqara-light/80">Select the services offered at this location:</span>
              <div className="grid md:grid-cols-2 gap-3">
                {serviceOptions.map(option => (
                  <label key={option} className="flex items-center gap-3 rounded-lg border border-saqqara-border p-4 cursor-pointer hover:bg-saqqara-border/40">
                    <input
                      type="checkbox"
                      checked={services.includes(option)}
                      onChange={() => toggleService(option)}
                      className="accent-saqqara-gold"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <label className="block">
                <span className="text-saqqara-light/80">Pedicure Equipment Logs Maintained?</span>
                <select value={form.pedicureLogs} onChange={e => updateField('pedicureLogs', e.target.value)}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              <label className="block">
                <span className="text-saqqara-light/80">Comments on Air Flow / Odor Control</span>
                <textarea
                  value={form.comments}
                  onChange={e => updateField('comments', e.target.value)}
                  rows={6}
                  className="min-h-[136px] resize-none"
                />
              </label>
            </div>
          </section>

          <section className="card">
            <h2 className="text-base font-semibold text-saqqara-gold mb-4">Declaration</h2>
            <p className="text-saqqara-light/80 mb-4">
              I certify that the salon location described above meets the safety, sanitary, and operational requirements applicable to my state, including ventilation, facility separation, disinfecting practices, toilet and lavatory provisions, and pedicure equipment disinfection.
            </p>
            <button type="submit" disabled={loading} className="btn btn-primary w-full text-lg">
              {loading ? 'Submitting Application...' : 'Submit Salon Application'}
            </button>
          </section>
        </form>
      </div>
    </main>
  );
}
