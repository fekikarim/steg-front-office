/**
 * Typed backend DTOs and server-side calls for the internship application
 * module (contract: backend `openapi.json` — ApplicationResponse,
 * ApplicationCreateRequest, ApplicationUpdateRequest, DocumentResponse,
 * ApplicationDocumentResponse, AttachDocumentRequest).
 *
 * These run inside route handlers only: the browser talks to our own
 * `/api/applications` proxy routes, which attach the httpOnly session
 * access token server-side. Tokens never reach client bundles.
 */
import {ApiError, backendFetch, type ErrorEnvelope} from '../api-client';

/* ------------------------------------------------------------------ */
/*  Enums                                                              */
/* ------------------------------------------------------------------ */

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'NEEDS_CORRECTION'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type InternshipType = 'OBSERVATION' | 'PERFECTIONNEMENT' | 'PFE';

export type InternshipRequirement = 'OBLIGATOIRE' | 'OPTIONAL';

export type DocumentType =
  | 'CV'
  | 'MOTIVATION_LETTER'
  | 'UNIVERSITY_CONVENTION'
  | 'TRANSCRIPT'
  | 'INTERNSHIP_APPLICATION'
  | 'ASSIGNMENT_LETTER'
  | 'INTERNSHIP_CONVENTION'
  | 'STEG_INTERNSHIP_REPORT'
  | 'CAHIER_DES_CHARGES'
  | 'PROJECT_DEMO_IMAGE'
  | 'INTERNSHIP_CERTIFICATE'
  | 'INTERNSHIP_LOGBOOK'
  | 'CIN_COPY'
  | 'PAYMENT_RECEIPT'
  | 'OTHER';

export type DocumentVerificationStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'REQUIRES_CORRECTION';

/* ------------------------------------------------------------------ */
/*  Application                                                        */
/* ------------------------------------------------------------------ */

export interface ApplicationResponse {
  id: string;
  reference: string;
  status: ApplicationStatus;
  candidateId: string;
  candidateName: string;
  desiredStartDate: string | null;
  desiredEndDate: string | null;
  proposedTheme: string | null;
  submittedOnline: boolean;
  submissionDate: string | null;
  calculatedType: InternshipType | null;
  requirement: InternshipRequirement | null;
  rejectionReason: string | null;
  correctionComment: string | null;
  reviewerId: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ApplicationCreateRequest {
  desiredStartDate?: string | null;
  desiredEndDate?: string | null;
  proposedTheme?: string | null;
  submittedOnline?: boolean;
}

export interface ApplicationUpdateRequest {
  desiredStartDate?: string | null;
  desiredEndDate?: string | null;
  proposedTheme?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Documents                                                          */
/* ------------------------------------------------------------------ */

export interface DocumentResponse {
  id: string;
  reference: string;
  type: DocumentType;
  restrictedAccess: boolean;
  generatedAutomatically: boolean;
  latestVersionNumber: number;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
  uploadedAt: string;
  createdAt: string;
}

export interface ApplicationDocumentResponse {
  id: string;
  applicationId: string;
  document: DocumentResponse;
  mandatory: boolean;
  verificationStatus: DocumentVerificationStatus;
  verificationComment: string | null;
  verifiedById: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export interface AttachDocumentRequest {
  documentId: string;
  mandatory?: boolean;
}

/** Backend workflow instance state (contract: WorkflowInstanceResponse). */
export type WorkflowStatus = 'CREATED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';

export interface WorkflowInstanceResponse {
  id: string;
  definitionCode: string;
  definitionName: string;
  currentStepCode: string | null;
  currentStepName: string | null;
  status: WorkflowStatus;
  startedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
}

export interface DocumentRule {
  /** MIME types accepted by the backend (Tika-verified, not just the extension). */
  mimes: readonly string[];
  /** File extensions accepted as a client-side pre-check hint (UX only). */
  extensions: readonly string[];
  /** Maximum file size in bytes enforced by the backend. */
  maxBytes: number;
  /** Whether the wizard treats this slot as mandatory. */
  required: boolean;
}

/**
 * Backend-confirmed upload rules per DocumentType (authority: backend
 * `document/domain/service/DocumentValidationService` — `SIZE_LIMITS` and
 * `ALLOWED_MIME_TYPES`). INTERNSHIP_APPLICATION and ASSIGNMENT_LETTER are
 * absent from `SIZE_LIMITS`, so they fall under `DEFAULT_MAX_SIZE` (10 MB).
 * PROJECT_DEMO_IMAGE is capped at 15 MB with jpeg/png/jpg MIMEs.
 *
 * These constants drive client-side pre-validation and slot chrome (accepted
 * formats, max size) as UX feedback only — the backend (Tika content
 * inspection + per-type caps) remains the authoritative gate and its error
 * codes (FILE_TOO_LARGE, INVALID_FILE_TYPE, MIME_TYPE_SPOOFING_DETECTED,
 * EMPTY_FILE) are surfaced verbatim to the user.
 */
export const DOCUMENT_RULES: Record<
  'INTERNSHIP_APPLICATION' | 'ASSIGNMENT_LETTER' | 'PROJECT_DEMO_IMAGE',
  DocumentRule
> = {
  INTERNSHIP_APPLICATION: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    maxBytes: 10 * 1024 * 1024,
    required: true,
  },
  ASSIGNMENT_LETTER: {
    mimes: ['application/pdf'],
    extensions: ['.pdf'],
    maxBytes: 10 * 1024 * 1024,
    required: true,
  },
  PROJECT_DEMO_IMAGE: {
    mimes: ['image/jpeg', 'image/png', 'image/jpg'],
    extensions: ['.jpg', '.jpeg', '.png'],
    maxBytes: 15 * 1024 * 1024,
    required: false,
  },
};

/* ------------------------------------------------------------------ */
/*  Classification                                                     */
/* ------------------------------------------------------------------ */

export interface ClassificationResult {
  type: InternshipType;
  requirement: InternshipRequirement;
  paymentEligible: boolean;
  durationInDays: number;
  appliedRuleDescription: string;
}

/* ------------------------------------------------------------------ */
/*  Server-side fetches                                                */
/* ------------------------------------------------------------------ */

export function createApplication(token: string, body: ApplicationCreateRequest) {
  return backendFetch<ApplicationResponse>('/api/applications', {
    method: 'POST',
    token,
    body,
  });
}

export function getApplication(token: string, id: string) {
  return backendFetch<ApplicationResponse>(`/api/applications/${id}`, {
    method: 'GET',
    token,
  });
}

export function listApplications(token: string) {
  return backendFetch<ApplicationResponse[]>('/api/applications', {
    method: 'GET',
    token,
  });
}

export function updateApplication(token: string, id: string, body: ApplicationUpdateRequest) {
  return backendFetch<ApplicationResponse>(`/api/applications/${id}`, {
    method: 'PUT',
    token,
    body,
  });
}

export function submitApplication(token: string, id: string) {
  return backendFetch<ApplicationResponse>(`/api/applications/${id}/submit`, {
    method: 'POST',
    token,
  });
}

/**
 * Withdraw an own application (→ WITHDRAWN). The backend refuses ACCEPTED
 * and already-WITHDRAWN dossiers; those rejections surface as ApiError.
 */
export function withdrawApplication(token: string, id: string) {
  return backendFetch<ApplicationResponse>(`/api/applications/${id}/withdraw`, {
    method: 'POST',
    token,
  });
}

/**
 * Current workflow state for an application. Only exists once the workflow
 * instance is spawned (at submit); DRAFTs yield backend 404, which callers
 * must treat as "no workflow yet", not as an error.
 */
export function getApplicationWorkflow(token: string, id: string) {
  return backendFetch<WorkflowInstanceResponse>(`/api/applications/${id}/workflow`, {
    method: 'GET',
    token,
  });
}

export function getApplicationDocuments(token: string, applicationId: string) {
  return backendFetch<ApplicationDocumentResponse[]>(
    `/api/applications/${applicationId}/documents`,
    {method: 'GET', token},
  );
}

export function attachApplicationDocument(
  token: string,
  applicationId: string,
  body: AttachDocumentRequest,
) {
  return backendFetch<ApplicationDocumentResponse>(
    `/api/applications/${applicationId}/documents`,
    {method: 'POST', token, body},
  );
}

/**
 * Upload a file to `/api/documents` (multipart). Returns the created
 * DocumentResponse. Rate-limited to 10 uploads/minute on the backend.
 *
 * Server-side proxy use: gives large files (up to 15 MB) plus Tika/malware
 * scanning time a generous 120 s budget instead of hanging forever, and
 * preserves the backend error `code` (FILE_TOO_LARGE, INVALID_FILE_TYPE,
 * MIME_TYPE_SPOOFING_DETECTED, EMPTY_FILE) so the browser can localize it.
 * Proxy semantics: 504 = upstream timed out, 502 = upstream unreachable.
 */
export async function uploadDocument(
  token: string,
  file: File,
  type: DocumentType,
): Promise<DocumentResponse> {
  const baseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  const form = new FormData();
  form.append('file', file);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/documents?type=${type}`, {
      method: 'POST',
      headers: {Authorization: `Bearer ${token}`},
      body: form,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(504, {error: 'UPSTREAM_TIMEOUT', message: 'Document upload timed out.'}, 'Document upload failed.');
    }
    throw new ApiError(502, {error: 'UPSTREAM_UNREACHABLE', message: 'Cannot reach the server.'}, 'Document upload failed.');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let envelope: ErrorEnvelope | null = null;
    try {
      envelope = (await res.json()) as ErrorEnvelope;
    } catch {
      /* empty */
    }
    throw new ApiError(res.status, envelope ?? null, 'Document upload failed.');
  }

  return (await res.json()) as DocumentResponse;
}

/* ------------------------------------------------------------------ */
/*  Client-side classification (mirrors backend logic)                  */
/* ------------------------------------------------------------------ */

function daysBetween(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00Z');
  const e = new Date(end + 'T00:00:00Z');
  return Math.floor((e.getTime() - s.getTime()) / 86_400_000) + 1;
}

function monthsBetween(start: string, end: string): {months: number; days: number} {
  const s = new Date(start + 'T00:00:00Z');
  const e = new Date(end + 'T00:00:00Z');
  let months = e.getUTCMonth() - s.getUTCMonth() + (e.getUTCFullYear() - s.getUTCFullYear()) * 12;
  const days = e.getUTCDate() - s.getUTCDate();
  if (days < 0) {
    months--;
  }
  return {months, days: days < 0 ? days + 30 : days};
}

/**
 * Client-side classification mirroring `InternshipClassificationService`.
 * The backend is the authority; this provides instant UI feedback while
 * the candidate is selecting dates.
 */
export function classifyInternship(startDate: string, endDate: string): ClassificationResult {
  if (endDate < startDate) {
    return {
      type: 'OBSERVATION',
      requirement: 'OPTIONAL',
      paymentEligible: false,
      durationInDays: 0,
      appliedRuleDescription: 'Invalid date range.',
    };
  }

  const durationInDays = daysBetween(startDate, endDate);
  const period = monthsBetween(startDate, endDate);

  if (durationInDays < 42) {
    return {
      type: 'OBSERVATION',
      requirement: 'OPTIONAL',
      paymentEligible: false,
      durationInDays,
      appliedRuleDescription: `Duration is ${durationInDays} day${durationInDays === 1 ? '' : 's'} (< 42 days).`,
    };
  }

  if (period.months < 3 || (period.months === 3 && period.days === 0)) {
    return {
      type: 'PERFECTIONNEMENT',
      requirement: 'OBLIGATOIRE',
      paymentEligible: true,
      durationInDays,
      appliedRuleDescription: `Duration is ${period.months} month${period.months === 1 ? '' : 's'} and ${period.days} day${period.days === 1 ? '' : 's'}.`,
    };
  }

  return {
    type: 'PFE',
    requirement: 'OBLIGATOIRE',
    paymentEligible: true,
    durationInDays,
    appliedRuleDescription: `Duration is ${period.months} month${period.months === 1 ? '' : 's'} and ${period.days} day${period.days === 1 ? '' : 's'} (> 3 months).`,
  };
}

/**
 * Check whether a date range falls in the "gap" between Observation and
 * Perfectionnement (exactly 42 days is Perfectionnement, so no gap exists
 * for valid ranges). Also validates that end >= start.
 */
export function validateDateRange(startDate: string, endDate: string): string | null {
  if (!startDate || !endDate) return null;
  if (endDate < startDate) return 'apply.wizard.dates.errorEndBeforeStart';
  return null;
}
