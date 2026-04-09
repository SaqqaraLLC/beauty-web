'use client';

import { useState } from 'react';
import Link from 'next/link';

const serviceOptions = [
  'Cosmetology',
  'Nail Services',
  'Massage / Bodywork',
  'Skin Care / Esthetics',
  'Hair Extensions',
  'Specialty Services'
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
    comments: ''
  });

  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Placeholder: integrate with backend form submission endpoint later
    await new Promise(resolve => setTimeout(resolve, 600));
    setLoading(false);
    setSubmitted(true);
  }

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
            Complete the salon location application using the standard requirements from Rule 61G5-20.002. This form captures ventilation, sanitation, facility, and disinfection compliance for your salon.
          </p>
        </div>

        <section className="card mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-saqqara-gold mb-2">License & Artist Requirements</h2>
              <p className="text-saqqara-light/75">
                Saqqara requires each location and its artists to maintain the appropriate Florida license category, complete continuing education, and keep fees current.
                The following license types are commonly used by cosmetology salons and artists on our platform.
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
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left border-collapse border border-saqqara-border">
              <thead>
                <tr className="bg-saqqara-card/80 text-saqqara-gold">
                  <th className="px-4 py-3 border border-saqqara-border">License Type</th>
                  <th className="px-4 py-3 border border-saqqara-border">Continuing Education Requirements</th>
                  <th className="px-4 py-3 border border-saqqara-border">Fee</th>
                  <th className="px-4 py-3 border border-saqqara-border">Expiration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-saqqara-dark/90 hover:bg-saqqara-card">
                  <td className="px-4 py-3 border border-saqqara-border">Cosmetology Salon</td>
                  <td className="px-4 py-3 border border-saqqara-border">N/A</td>
                  <td className="px-4 py-3 border border-saqqara-border">$45.00</td>
                  <td className="px-4 py-3 border border-saqqara-border">11/30 even year</td>
                </tr>
                <tr className="bg-saqqara-dark/90 hover:bg-saqqara-card">
                  <td className="px-4 py-3 border border-saqqara-border">Cosmetologist</td>
                  <td className="px-4 py-3 border border-saqqara-border">10 hrs CE: 1 hr HIV/AIDS, 3 hrs sanitation, 0.5 hr OSHA, 0.5 hr workers’ comp, 2 hrs laws/rules, 1 hr chemical makeup, 1 hr environmental issues, 1 hr cosmetology-related topic.</td>
                  <td className="px-4 py-3 border border-saqqara-border">$45.00</td>
                  <td className="px-4 py-3 border border-saqqara-border">Group 1: 10/31 odd year<br/>Group 2: 10/31 even year</td>
                </tr>
                <tr className="bg-saqqara-dark/90 hover:bg-saqqara-card">
                  <td className="px-4 py-3 border border-saqqara-border">Nail Specialist</td>
                  <td className="px-4 py-3 border border-saqqara-border">10 hrs CE: 1 hr HIV/AIDS, 3 hrs sanitation, 0.5 hr OSHA, 0.5 hr workers’ comp, 2 hrs laws/rules, 1 hr chemical makeup, 1 hr environmental issues, 1 hr nail practice-related topic.</td>
                  <td className="px-4 py-3 border border-saqqara-border">$45.00</td>
                  <td className="px-4 py-3 border border-saqqara-border">Group 1: 10/31 odd year<br/>Group 2: 10/31 even year</td>
                </tr>
                <tr className="bg-saqqara-dark/90 hover:bg-saqqara-card">
                  <td className="px-4 py-3 border border-saqqara-border">Facial Specialist</td>
                  <td className="px-4 py-3 border border-saqqara-border">10 hrs CE: 1 hr HIV/AIDS, 3 hrs sanitation, 0.5 hr OSHA, 0.5 hr workers’ comp, 2 hrs laws/rules, 1 hr chemical makeup, 1 hr environmental issues, 1 hr facial practice-related topic.</td>
                  <td className="px-4 py-3 border border-saqqara-border">$45.00</td>
                  <td className="px-4 py-3 border border-saqqara-border">Group 1: 10/31 odd year<br/>Group 2: 10/31 even year</td>
                </tr>
                <tr className="bg-saqqara-dark/90 hover:bg-saqqara-card">
                  <td className="px-4 py-3 border border-saqqara-border">Full Specialist</td>
                  <td className="px-4 py-3 border border-saqqara-border">10 hrs CE: 1 hr HIV/AIDS, 3 hrs sanitation, 0.5 hr OSHA, 0.5 hr workers’ comp, 2 hrs laws/rules, 1 hr chemical makeup, 1 hr environmental issues, 1 hr specialty practice-related topic.</td>
                  <td className="px-4 py-3 border border-saqqara-border">$45.00</td>
                  <td className="px-4 py-3 border border-saqqara-border">Group 1: 10/31 odd year<br/>Group 2: 10/31 even year</td>
                </tr>
              </tbody>
            </table>
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
                    A nail specialist is registered to provide manicuring and pedicuring services in Florida. This includes cutting, polishing, tinting, coloring, cleansing, adding or extending nails, and massaging of the hands, as well as shaping, polishing, tinting, and cleansing of the nails of the feet.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-saqqara-light">Facial Specialist</p>
                  <p>
                    A facial specialist is registered to perform facials in Florida. Facial services include massaging or treating the face or scalp with oils, creams, lotions, or other preparations, and these services must be performed in a licensed salon.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-saqqara-light">Full Specialist</p>
                  <p>
                    A full specialist may perform any services allowed by both a facial specialist registration and a nail specialist registration. This includes combined facial and nail services under one professional license.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-saqqara-light">Cosmetology Salon</p>
                  <p>
                    A cosmetology salon is a licensed and inspected facility where cosmetology services are conducted by licensed professionals. The salon must comply with safety, sanitation, and operational regulations.
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
                <input
                  value={form.salonName}
                  onChange={e => updateField('salonName', e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="text-saqqara-light/80">First Name</span>
                <input
                  value={form.firstName}
                  onChange={e => updateField('firstName', e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="text-saqqara-light/80">Last Name</span>
                <input
                  value={form.lastName}
                  onChange={e => updateField('lastName', e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="text-saqqara-light/80">Government ID Number</span>
                <input
                  value={form.idNumber}
                  onChange={e => updateField('idNumber', e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="text-saqqara-light/80">Primary License Type</span>
                <select
                  value={form.licenseType}
                  onChange={e => updateField('licenseType', e.target.value)}
                  required
                >
                  <option value="">Select license type</option>
                  <option value="cosmetologist">Cosmetologist</option>
                  <option value="nail-specialist">Nail Specialist</option>
                  <option value="facial-specialist">Facial Specialist</option>
                  <option value="full-specialist">Full Specialist</option>
                  <option value="cosmetology-salon">Cosmetology Salon</option>
                </select>
              </label>
              <label className="block lg:col-span-2">
                <span className="text-saqqara-light/80">Street Address</span>
                <input
                  value={form.address}
                  onChange={e => updateField('address', e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="text-saqqara-light/80">City</span>
                <input
                  value={form.city}
                  onChange={e => updateField('city', e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="text-saqqara-light/80">State</span>
                <input
                  value={form.state}
                  onChange={e => updateField('state', e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="text-saqqara-light/80">ZIP Code</span>
                <input
                  value={form.zip}
                  onChange={e => updateField('zip', e.target.value)}
                  required
                />
              </label>
            </div>
          </section>

          <section className="card">
            <h2 className="text-base font-semibold text-saqqara-gold mb-4">Facility & Safety Checklist</h2>
            <div className="grid gap-6">
              <div className="grid lg:grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-saqqara-light/80">Total Floor Space (sq ft)</span>
                  <input
                    value={form.totalSquareFeet}
                    onChange={e => updateField('totalSquareFeet', e.target.value)}
                    required
                  />
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
            <h2 className="text-base font-semibold text-saqqara-gold mb-4">Service Types & Pedicure Compliance</h2>
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
              I certify that the salon location described above meets the safety, sanitary, and operational requirements of Rule 61G5-20.002, including ventilation, facility separation, disinfecting practices, toilet and lavatory provisions, and pedicure equipment disinfection.
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
