import type {
  ApplicationStatus,
  ApplicationDocumentResponse,
  DocumentType,
} from '@/lib/api/application';

/**
 * Wizard step identifiers (B4). The order mirrors the product spec: welcome →
 * personal → dates → info → documents → demo → review → submit.
 */
export const STEPS = [
  'welcome',
  'personal',
  'dates',
  'info',
  'documents',
  'demo',
  'review',
  'submit',
] as const;

export type StepId = (typeof STEPS)[number];

/** Local form state for the whole wizard, synced to the backend DRAFT. */
export interface WizardDraft {
  desiredStartDate: string;
  desiredEndDate: string;
  proposedTheme: string;
  submittedOnline: boolean;
}

/** candidateConfirmed: confirmed personal info / eligibility flags. */
export interface WizardConfirmation {
  eligibility: boolean;
  personal: boolean;
  dates: boolean;
  info: boolean;
}

/** Document upload tracking by DocumentType for the documents step. */
export interface UploadState {
  kind: DocumentType;
  labelKey: string;
  hintKey: string;
  accept: string;
  maxSizeMb: number;
  required: boolean;
  document: ApplicationDocumentResponse | null;
  uploading: boolean;
  errorKey: string | null;
}

export type UploadKind = 'INTERNSHIP_APPLICATION' | 'ASSIGNMENT_LETTER' | 'PROJECT_DEMO_IMAGE';

export interface ApplicationRuntime {
  id: string;
  reference: string;
  status: ApplicationStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  submissionDate: string | null;
}

/**
 * Validate a step before advancing. Returns null when valid, otherwise a
 * translated-agnostic error key that the UI localizes.
 */
export function validateStep(
  step: StepId,
  draft: WizardDraft,
  confirm: WizardConfirmation,
  uploads: Record<UploadKind, ApplicationDocumentResponse | null>,
  uploadingStates: Record<UploadKind, boolean>,
): string | null {
  switch (step) {
    case 'welcome':
      return confirm.eligibility ? null : 'apply.welcome.confirmRequired';
    case 'personal':
      return confirm.personal ? null : 'apply.personal.confirmRequired';
    case 'dates': {
      if (!draft.desiredStartDate || !draft.desiredEndDate) {
        return 'apply.dates.errorBothRequired';
      }
      if (draft.desiredEndDate < draft.desiredStartDate) {
        return 'apply.dates.errorEndBeforeStart';
      }
      return confirm.dates ? null : 'apply.dates.confirmRequired';
    }
    case 'info': {
      if (!draft.proposedTheme.trim()) {
        return 'apply.info.projectThemeRequired';
      }
      return confirm.info ? null : 'apply.info.confirmRequired';
    }
    case 'documents': {
      // required uploads must be attached
      const requiredKinds: UploadKind[] = ['INTERNSHIP_APPLICATION', 'ASSIGNMENT_LETTER'];
      for (const k of requiredKinds) {
        if (!uploads[k]) return 'apply.documents.allRequired';
        if (uploadingStates[k]) return 'apply.documents.allRequired';
      }
      return null;
    }
    case 'demo':
    case 'review':
    case 'submit':
      return null;
  }
}
