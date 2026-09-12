import type {
  ApplicationDocumentResponse,
  InternshipType,
} from '@/lib/api/application';

/**
 * 7-step guided Apply wizard identifiers conforming to Phase B7 specification:
 * 1. personal (Full name, CIN, Phone, Email, Birth date)
 * 2. education (Level, University)
 * 3. dates (Start date, End date, automatic live classification preview)
 * 4. details (Internship-specific details, project theme for Perf/PFE)
 * 5. documents (Required PDF uploads + optional demo)
 * 6. review (Full scannable summary + confirmation checkbox)
 * 7. result (Submission success reference and tracking)
 */
export const STEPS = [
  'personal',
  'education',
  'dates',
  'details',
  'documents',
  'review',
  'result',
] as const;

export type StepId = (typeof STEPS)[number];

export interface PersonalInfoDraft {
  firstName: string;
  lastName: string;
  nationalId: string;
  email: string;
  phone: string;
  birthDate: string;
}

export interface EducationDraft {
  educationLevel: string;
  speciality: string;
  universityId: string;
}

export interface InternshipDatesDraft {
  desiredStartDate: string;
  desiredEndDate: string;
}

export interface InternshipDetailsDraft {
  proposedTheme: string;
  preferredDepartment?: string;
}

export interface WizardDraft {
  personal: PersonalInfoDraft;
  education: EducationDraft;
  dates: InternshipDatesDraft;
  details: InternshipDetailsDraft;
  confirmedTerms: boolean;
}

export type UploadKind = 'INTERNSHIP_APPLICATION' | 'ASSIGNMENT_LETTER' | 'PROJECT_DEMO_IMAGE';

export const INITIAL_WIZARD_DRAFT: WizardDraft = {
  personal: {
    firstName: '',
    lastName: '',
    nationalId: '',
    email: '',
    phone: '',
    birthDate: '',
  },
  education: {
    educationLevel: 'LICENCE',
    speciality: '',
    universityId: '',
  },
  dates: {
    desiredStartDate: '',
    desiredEndDate: '',
  },
  details: {
    proposedTheme: '',
    preferredDepartment: '',
  },
  confirmedTerms: false,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate each step in the wizard.
 * Returns null if valid, or a localized message key for UI display.
 */
export function validateStep(
  step: StepId,
  draft: WizardDraft,
  classificationType: InternshipType | null,
  uploads: Record<UploadKind, ApplicationDocumentResponse | null>,
  uploadingStates: Record<UploadKind, boolean>,
): string | null {
  switch (step) {
    case 'personal': {
      const p = draft.personal;
      if (!p.firstName.trim() || !p.lastName.trim()) return 'apply.personal.nameRequired';
      if (!p.nationalId.trim() || p.nationalId.trim().length < 5) return 'apply.personal.cinRequired';
      if (!p.email.trim() || !EMAIL_RE.test(p.email.trim())) return 'apply.personal.emailInvalid';
      if (!p.phone.trim()) return 'apply.personal.phoneRequired';
      if (!p.birthDate) return 'apply.personal.birthDateRequired';
      return null;
    }
    case 'education': {
      const e = draft.education;
      if (!e.universityId) return 'apply.education.universityRequired';
      return null;
    }
    case 'dates': {
      const d = draft.dates;
      if (!d.desiredStartDate || !d.desiredEndDate) return 'apply.dates.errorBothRequired';
      if (d.desiredEndDate < d.desiredStartDate) return 'apply.dates.errorEndBeforeStart';
      return null;
    }
    case 'details': {
      // Perfectionnement and PFE require a project theme
      if (classificationType === 'PERFECTIONNEMENT' || classificationType === 'PFE') {
        if (!draft.details.proposedTheme.trim()) return 'apply.info.projectThemeRequired';
      }
      return null;
    }
    case 'documents': {
      const requiredKinds: UploadKind[] = ['INTERNSHIP_APPLICATION', 'ASSIGNMENT_LETTER'];
      for (const k of requiredKinds) {
        if (!uploads[k]) return 'apply.documents.allRequired';
        if (uploadingStates[k]) return 'apply.documents.allRequired';
      }
      return null;
    }
    case 'review': {
      if (!draft.confirmedTerms) return 'apply.reviewAgreeTerms';
      return null;
    }
    case 'result':
      return null;
  }
}
