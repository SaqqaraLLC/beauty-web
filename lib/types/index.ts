// ─── Company ──────────────────────────────────────────────────────────────────

export type CompanyBookingStatus =
  | 'Draft'
  | 'Submitted'
  | 'PartiallyAccepted'
  | 'FullyAccepted'
  | 'Rejected'
  | 'Completed'
  | 'Cancelled';

export interface CompanyProfile {
  companyId: number;
  userId: string;
  companyName: string;
  industry: string;
  websiteUrl?: string;
  logoUrl?: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  isVerified: boolean;
  verifiedAt?: string;
  averageRating: number;
  reviewCount: number;
  totalBookings: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface CompanyBookingArtistSlot {
  slotId: number;
  companyBookingId: number;
  artistId: number;
  artistName: string;
  artistProfileImageUrl?: string;
  serviceRequested: string;
  feeCents?: number;
  artistDecision: 'Pending' | 'Accepted' | 'Declined';
  artistDecidedAt?: string;
  declineReason?: string;
  ndaSigned: boolean;
}

export interface CompanyBooking {
  companyBookingId: number;
  companyId: number;
  companyName: string;
  title: string;
  description?: string;
  eventDate: string;
  eventEndDate?: string;
  location?: string;
  budgetCents?: number;
  status: CompanyBookingStatus;
  contractUrl?: string;
  ndaRequired: boolean;
  packageDiscountPercent?: number;
  packageLabel?: string;
  createdAt: string;
  artistSlots: CompanyBookingArtistSlot[];
}

export interface CompanyInvoiceLineItem {
  description: string;
  artistName?: string;
  amountCents: number;
}

export interface CompanyInvoice {
  invoiceId: number;
  companyBookingId: number;
  issuedAt: string;
  dueDate: string;
  totalCents: number;
  paidAt?: string;
  pdfUrl?: string;
  lineItems: CompanyInvoiceLineItem[];
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export interface AgentProfile {
  agentId: number;
  userId: string;
  fullName: string;
  agencyName?: string;
  profileImageUrl?: string;
  bio?: string;
  specialties: string[];
  websiteUrl?: string;
  contactEmail: string;
  isVerified: boolean;
  averageRating: number;
  reviewCount: number;
  rosterCount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface AgentRosterEntry {
  rosterId: number;
  agentId: number;
  artistId: number;
  artistName: string;
  artistSpecialty?: string;
  artistProfileImageUrl?: string;
  artistRating: number;
  status: 'Active' | 'Pending' | 'Terminated';
  linkedAt: string;
}

export interface AgentRepresentationRequest {
  requestId: number;
  artistId: number;
  artistName: string;
  agentId: number;
  agentName: string;
  initiatedBy: 'Artist' | 'Agent';
  status: 'Pending' | 'Accepted' | 'Declined' | 'Withdrawn';
  message?: string;
  createdAt: string;
  respondedAt?: string;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export type ReviewableEntityType = 'Artist' | 'Client' | 'Company' | 'Agent';

export interface Review {
  reviewId: number;
  bookingId?: number;
  reviewerUserId: string;
  reviewerRole: string;
  reviewerName: string;
  reviewerAvatarUrl?: string;
  subjectEntityType: ReviewableEntityType;
  subjectEntityId: number;
  subjectName: string;
  rating: number;
  title?: string;
  body?: string;
  isVerifiedBooking: boolean;
  status: 'Published' | 'Pending' | 'Removed';
  createdAt: string;
}

export interface RatingSummary {
  entityType: ReviewableEntityType;
  entityId: number;
  averageRating: number;
  totalReviews: number;
  breakdown: {
    stars5: number;
    stars4: number;
    stars3: number;
    stars2: number;
    stars1: number;
  };
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationEventType =
  | 'CompanyBookingSubmitted'
  | 'ArtistAcceptedSlot'
  | 'ArtistDeclinedSlot'
  | 'BookingStatusChanged'
  | 'ReviewPosted'
  | 'RepresentationRequestReceived'
  | 'RepresentationAccepted'
  | 'VerifiedBadgeGranted'
  | 'NewMessage';

export interface NotificationPayload {
  notificationId: string;
  eventType: NotificationEventType;
  title: string;
  body: string;
  entityType?: string;
  entityId?: number;
  actionUrl?: string;
  createdAt: string;
  isRead: boolean;
}

// ─── Featured Slots ───────────────────────────────────────────────────────────

export interface FeaturedSlot {
  slotId: number;
  artistId: number;
  artistName: string;
  artistProfileImageUrl?: string;
  artistSpecialty?: string;
  artistRating: number;
  isVerified: boolean;
  slotType: 'Featured' | 'Sponsored';
  displayPosition: number;
  startsAt: string;
  endsAt: string;
}

// ─── Streams ──────────────────────────────────────────────────────────────────

export interface StreamSummary {
  streamId: number;
  artistId: number;
  artistName: string;
  title: string;
  thumbnailUrl?: string;
  isLive: boolean;
  viewerCount: number;
  commentCount?: number;
  giftCount?: number;
  scheduledAt?: string;
  recordedAt?: string;
  tags: string[];
}

export interface StreamDetail extends StreamSummary {
  acsRoomId?: string;
}

export interface StreamStartResult {
  streamId: number;
  roomId: string;
  acsToken: string;
  acsUserId: string;
  acsEndpoint: string;
}

export interface StreamJoinResult {
  streamId: number;
  roomId: string;
  acsToken: string;
  acsUserId: string;
  acsEndpoint: string;
  title: string;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export type ProductStatus = 'Pending' | 'Approved' | 'Declined';

export interface Product {
  productId: number;
  name: string;
  brand: string;
  category: string;
  description?: string;
  imageUrl?: string;
  sku?: string;
  ingredients?: string;
  vendorName?: string;
  wholesalePriceCents: number;   // what Saqqara pays %PURE
  billedPriceCents: number;      // wholesale × 1.8 (standard, billed to client)
  promoBilledPriceCents: number; // wholesale × 1.6 (with promo code)
  status: ProductStatus;
  isActive: boolean;
  submittedByName?: string;
  submittedAt: string;
  approvedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  averageRating?: number;
  reviewCount: number;
  reviews: ProductReview[];
}

export interface ProductReview {
  reviewId: number;
  productId: number;
  reviewerName: string;
  reviewerRole: string;
  rating: number;
  notes?: string;
  recommendation: 'Approve' | 'Decline' | 'Neutral';
  createdAt: string;
}

// ─── License Assistance ───────────────────────────────────────────────────────

export type LicenseStatus =
  | 'NotStarted'
  | 'EnrolledInSchool'
  | 'ExamPending'
  | 'ExamFailed'
  | 'Licensed'
  | 'Renewal';

export interface LicenseAssistance {
  assistanceId: number;
  artistId: number;
  artistName: string;
  artistEmail: string;
  optedIn: boolean;
  licenseType?: string;
  state?: string;
  currentStatus: LicenseStatus;
  adminNotes?: string;
  enrollmentDeadline?: string;
  examDate?: string;
  licensedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Document Vault ───────────────────────────────────────────────────────────

export type DocumentOwnerType = 'Artist' | 'Location';
export type DocumentStatus    = 'Pending' | 'Verified' | 'Rejected' | 'Expired';

export interface ProfessionalDocument {
  documentId:      number;
  ownerType:       DocumentOwnerType;
  ownerId:         number;
  ownerName:       string;
  documentType:    string;   // 'License' | 'Insurance' | 'HealthPermit' | 'CertOfOccupancy' | 'FireSafety' | 'CECertificate' | 'Other'
  documentName:    string;
  documentNumber?: string;
  fileUrl:         string;
  fileName:        string;
  expiresAt?:      string;
  uploadedAt:      string;
  status:          DocumentStatus;
  verifiedByAdmin?: string;
  verifiedAt?:     string;
  rejectionReason?: string;
  notes?:          string;
}

// ─── CE Tracking ──────────────────────────────────────────────────────────────

export interface CeCompletion {
  ceId:          number;
  artistId:      number;
  artistName:    string;
  courseName:    string;
  provider:      string;
  topic:         string;   // 'HIV/AIDS' | 'OSHA' | 'WorkersComp' | 'Sanitation' | 'General' | 'Other'
  hoursCompleted: number;
  completedAt:   string;
  certificateUrl?: string;
  state:         string;
  licenseType:   string;
  verifiedByAdmin: boolean;
}

export interface StateCeRequirement {
  state:               string;
  stateCode:           string;
  licenseTypes:        string[];
  hoursRequired:       number;
  renewalPeriodMonths: number;
  mandatoryTopics:     { topic: string; hours: number }[];
  notes?:              string;
}

// ─── Availability ─────────────────────────────────────────────────────────────

export interface AvailabilityBlock {
  blockId: number;
  artistId: number;
  date: string;
  startTime?: string;
  endTime?: string;
  isAvailable: boolean;
  note?: string;
}
