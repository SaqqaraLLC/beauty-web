import type { StateCeRequirement } from '@/lib/types';

// National CE requirements for cosmetology / esthetics / nail tech license renewal
// Sources: each state's board of cosmetology. Updated April 2026.
export const STATE_CE_REQUIREMENTS: StateCeRequirement[] = [
  { state: 'Alabama',        stateCode: 'AL', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 8,  renewalPeriodMonths: 24, mandatoryTopics: [{ topic: 'Sanitation', hours: 2 }] },
  { state: 'Alaska',         stateCode: 'AK', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 6,  renewalPeriodMonths: 24, mandatoryTopics: [] },
  { state: 'Arizona',        stateCode: 'AZ', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 8,  renewalPeriodMonths: 24, mandatoryTopics: [{ topic: 'Sanitation', hours: 2 }] },
  { state: 'Arkansas',       stateCode: 'AR', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 6,  renewalPeriodMonths: 12, mandatoryTopics: [] },
  { state: 'California',     stateCode: 'CA', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 24, mandatoryTopics: [], notes: 'California does not require CE for renewal, but requires proof of current practice.' },
  { state: 'Colorado',       stateCode: 'CO', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 24, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Connecticut',    stateCode: 'CT', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 12, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Delaware',       stateCode: 'DE', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 24, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Florida',        stateCode: 'FL', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 16, renewalPeriodMonths: 24, mandatoryTopics: [{ topic: 'HIV/AIDS', hours: 4 }, { topic: 'OSHA', hours: 2 }, { topic: "Worker's Comp", hours: 1 }], notes: 'Governed by Florida Board of Cosmetology. 16 hours every 2 years.' },
  { state: 'Georgia',        stateCode: 'GA', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 6,  renewalPeriodMonths: 24, mandatoryTopics: [] },
  { state: 'Hawaii',         stateCode: 'HI', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 6,  renewalPeriodMonths: 24, mandatoryTopics: [] },
  { state: 'Idaho',          stateCode: 'ID', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 12, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Illinois',       stateCode: 'IL', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 14, renewalPeriodMonths: 24, mandatoryTopics: [{ topic: 'Sanitation', hours: 4 }] },
  { state: 'Indiana',        stateCode: 'IN', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 24, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Iowa',           stateCode: 'IA', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 8,  renewalPeriodMonths: 24, mandatoryTopics: [] },
  { state: 'Kansas',         stateCode: 'KS', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 24, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Kentucky',       stateCode: 'KY', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 6,  renewalPeriodMonths: 12, mandatoryTopics: [] },
  { state: 'Louisiana',      stateCode: 'LA', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 8,  renewalPeriodMonths: 12, mandatoryTopics: [{ topic: 'Sanitation', hours: 2 }] },
  { state: 'Maine',          stateCode: 'ME', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 6,  renewalPeriodMonths: 12, mandatoryTopics: [] },
  { state: 'Maryland',       stateCode: 'MD', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 4,  renewalPeriodMonths: 24, mandatoryTopics: [] },
  { state: 'Massachusetts',  stateCode: 'MA', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 8,  renewalPeriodMonths: 24, mandatoryTopics: [] },
  { state: 'Michigan',       stateCode: 'MI', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 24, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Minnesota',      stateCode: 'MN', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 24, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Mississippi',    stateCode: 'MS', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 12, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Missouri',       stateCode: 'MO', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 24, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Montana',        stateCode: 'MT', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 12, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Nebraska',       stateCode: 'NE', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 24, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Nevada',         stateCode: 'NV', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 12, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'New Hampshire',  stateCode: 'NH', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 24, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'New Jersey',     stateCode: 'NJ', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 8,  renewalPeriodMonths: 24, mandatoryTopics: [] },
  { state: 'New Mexico',     stateCode: 'NM', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 12, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'New York',       stateCode: 'NY', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 24, renewalPeriodMonths: 48, mandatoryTopics: [] },
  { state: 'North Carolina', stateCode: 'NC', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 8,  renewalPeriodMonths: 12, mandatoryTopics: [] },
  { state: 'North Dakota',   stateCode: 'ND', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 12, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Ohio',           stateCode: 'OH', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 8,  renewalPeriodMonths: 12, mandatoryTopics: [{ topic: 'Sanitation', hours: 2 }] },
  { state: 'Oklahoma',       stateCode: 'OK', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 12, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Oregon',         stateCode: 'OR', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 24, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Pennsylvania',   stateCode: 'PA', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 4,  renewalPeriodMonths: 24, mandatoryTopics: [] },
  { state: 'Rhode Island',   stateCode: 'RI', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 12, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'South Carolina', stateCode: 'SC', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 6,  renewalPeriodMonths: 24, mandatoryTopics: [] },
  { state: 'South Dakota',   stateCode: 'SD', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 24, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Tennessee',      stateCode: 'TN', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 8,  renewalPeriodMonths: 12, mandatoryTopics: [] },
  { state: 'Texas',          stateCode: 'TX', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 4,  renewalPeriodMonths: 12, mandatoryTopics: [] },
  { state: 'Utah',           stateCode: 'UT', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 12, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Vermont',        stateCode: 'VT', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 12, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Virginia',       stateCode: 'VA', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 6,  renewalPeriodMonths: 24, mandatoryTopics: [] },
  { state: 'Washington',     stateCode: 'WA', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 8,  renewalPeriodMonths: 12, mandatoryTopics: [] },
  { state: 'West Virginia',  stateCode: 'WV', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 12, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Wisconsin',      stateCode: 'WI', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 24, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Wyoming',        stateCode: 'WY', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 0,  renewalPeriodMonths: 12, mandatoryTopics: [], notes: 'No CE required.' },
  { state: 'Washington DC',  stateCode: 'DC', licenseTypes: ['Cosmetology','Esthetics','Nail Tech'], hoursRequired: 6,  renewalPeriodMonths: 24, mandatoryTopics: [] },
];

export function getCeRequirement(stateCode: string, licenseType?: string): StateCeRequirement | undefined {
  return STATE_CE_REQUIREMENTS.find(r => r.stateCode === stateCode);
}

// Document types required by owner type
export const ARTIST_REQUIRED_DOCS = [
  { type: 'GovernmentID',   label: 'Government-Issued Photo ID',            required: true },
  { type: 'License',        label: 'State Cosmetology / Esthetics License', required: true },
  { type: 'Insurance',      label: 'Liability Insurance',                   required: true },
  { type: 'CECertificate',  label: 'CE Completion Certificate',             required: false },
  { type: 'HealthCard',     label: 'Health / Sanitation Card',              required: false },
  { type: 'Other',          label: 'Other Document',                        required: false },
];

export const LOCATION_REQUIRED_DOCS = [
  { type: 'LocationPhoto',      label: 'Current Location Photo',                required: true,  note: 'Must be a phone photo taken within the last 30 days. Phone embeds GPS coordinates and timestamp — used to verify your address and that the space is currently operational.' },
  { type: 'BusinessLicense',    label: 'Business License',                      required: true },
  { type: 'HealthPermit',       label: 'Health Department Permit',              required: true },
  { type: 'SalonLicense',       label: 'Salon / Establishment License',         required: true },
  { type: 'Insurance',          label: 'General Liability Insurance',           required: true },
  { type: 'CertOfOccupancy',    label: 'Certificate of Occupancy',              required: false },
  { type: 'FireSafety',         label: 'Fire Safety Certificate',               required: false },
  { type: 'WorkersComp',        label: "Worker's Compensation",                 required: false },
  { type: 'Other',              label: 'Other Document',                        required: false },
];
