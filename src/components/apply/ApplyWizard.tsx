'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {ApiError} from '@/lib/api-client';
import type {CandidateProfile, University} from '@/lib/api/candidate';
import {
  classifyInternship,
  DOCUMENT_RULES,
  type ApplicationDocumentResponse,
  type ApplicationResponse,
  type ClassificationResult,
  type DocumentAiValidation,
  type DocumentType,
  validatePublicDocumentAi,
  validateStoredDocumentAiBrowser,
} from '@/lib/api/application';
import {
  attachDocument,
  createDraft,
  getApplicationDocuments,
  updateDraft,
  submit,
  uploadFileWithProgress,
} from '@/lib/api/application-client';
import {createProfile, fetchUniversities, getProfile, updateProfile} from '@/lib/api/profile-client';
import {extensionsLabel, formatBytes} from '@/lib/files';
import {useToast} from '@/components/ui/Toast';
import {Button} from '@/components/ui/Button';
import {Link} from '@/i18n/navigation';
import {CardSkeleton} from '@/components/feedback/Skeleton';
import {ErrorState} from '@/components/feedback/ErrorState';
import {Stepper, type StepDef} from './Stepper';
import {PersonalStep} from './PersonalStep';
import {EducationStep} from './EducationStep';
import {DatesStep} from './DatesStep';
import {DocumentsStep} from './DocumentsStep';
import {ReviewStep} from './ReviewStep';
import {SubmitStep} from './SubmitStep';
import {
  INITIAL_WIZARD_DRAFT,
  STEPS,
  validateStep,
  type StepId,
  type UploadKind,
  type WizardDraft,
} from '@/lib/apply-wizard';
import {idleSlot, type SlotError, type SlotState} from './DocumentSlot';

type Phase = 'loading' | 'ready' | 'error' | 'alreadyApplied';

const STEP_DEFS: StepDef[] = STEPS.map((id) => ({id, key: id}));
const STORAGE_KEY = 'steg_apply_wizard_draft_v2';
const STORAGE_STEP_KEY = 'steg_apply_wizard_step_v2';
const STORAGE_FILES_KEY = 'steg_apply_wizard_files_v2';

type PendingFileMeta = Record<UploadKind, {name: string; size: number} | null>;
const EMPTY_META: PendingFileMeta = {INTERNSHIP_APPLICATION: null, ASSIGNMENT_LETTER: null};

function readPendingMeta(): PendingFileMeta {
  try {
    const raw = sessionStorage.getItem(STORAGE_FILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Record<UploadKind, {name: string; size: number}>>;
      return {
        INTERNSHIP_APPLICATION: parsed.INTERNSHIP_APPLICATION ?? null,
        ASSIGNMENT_LETTER: parsed.ASSIGNMENT_LETTER ?? null,
      };
    }
  } catch {
    /* ignore storage errors */
  }
  return {...EMPTY_META};
}

function writePendingMeta(meta: PendingFileMeta) {
  try {
    sessionStorage.setItem(STORAGE_FILES_KEY, JSON.stringify(meta));
  } catch {
    /* ignore storage errors */
  }
}

/** File objects cannot survive reloads or locale navigations — only metadata. */
function setPendingMetaKind(kind: UploadKind, value: {name: string; size: number} | null) {
  const next = {...readPendingMeta(), [kind]: value};
  writePendingMeta(next);
  return next;
}

function clearWizardStorage() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_STEP_KEY);
    sessionStorage.removeItem(STORAGE_FILES_KEY);
  } catch {
    /* ignore storage errors */
  }
}

function docsToUploads(docs: ApplicationDocumentResponse[]) {
  const next = {
    INTERNSHIP_APPLICATION: null,
    ASSIGNMENT_LETTER: null,
  } as Record<UploadKind, ApplicationDocumentResponse | null>;
  for (const d of docs) {
    if (d.document.type === 'INTERNSHIP_APPLICATION') next.INTERNSHIP_APPLICATION = d;
    else if (d.document.type === 'ASSIGNMENT_LETTER') next.ASSIGNMENT_LETTER = d;
  }
  return next;
}

/**
 * 7-step guided Apply wizard.
 *
 * Core Principles:
 * 1. Anonymous candidates are never blocked from completing steps 1 to 6.
 * 2. Authenticated candidates receive intelligent profile prefilling with a notice.
 * 3. Step 3 (Dates) provides live interactive classification preview (backend remains authoritative).
 * 4. Step 5 (Documents) supports client-side queuing for anonymous candidates and live upload for authenticated candidates.
 * 5. Step 7 provides submission tracking or an inline authentication bridge for anonymous candidates.
 */
export function ApplyWizard() {
  const t = useTranslations('apply');
  const tnav = useTranslations('apply.nav');
  const tError = useTranslations('apply.submit');
  const td = useTranslations('apply.documents');
  const toast = useToast();

  const [phase, setPhase] = useState<Phase>('loading');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [app, setApp] = useState<ApplicationResponse | null>(null);
  const [, setProfile] = useState<CandidateProfile | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingError, setLoadingError] = useState(
    null as null | {title: string; hint: string; traceId?: string | null},
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<WizardDraft>(INITIAL_WIZARD_DRAFT);
  const [pendingMeta, setPendingMeta] = useState<PendingFileMeta>({...EMPTY_META});

  /* AI validation per slot (wizard gate – not the same as backend verification) */
  const [aiValidations, setAiValidations] = useState<Record<UploadKind, DocumentAiValidation | null>>({
    INTERNSHIP_APPLICATION: null,
    ASSIGNMENT_LETTER: null,
  });
  const [aiValidating, setAiValidating] = useState<Record<UploadKind, boolean>>({
    INTERNSHIP_APPLICATION: false,
    ASSIGNMENT_LETTER: false,
  });
  const [aiErrors, setAiErrors] = useState<Record<UploadKind, SlotError | null>>({
    INTERNSHIP_APPLICATION: null,
    ASSIGNMENT_LETTER: null,
  });

  /* documents state */
  const [slots, setSlots] = useState<Record<UploadKind, SlotState>>({
    INTERNSHIP_APPLICATION: idleSlot(),
    ASSIGNMENT_LETTER: idleSlot(),
  });

  const pendingFiles = useRef<Record<UploadKind, File | null>>({
    INTERNSHIP_APPLICATION: null,
    ASSIGNMENT_LETTER: null,
  });

  const aborters = useRef<Record<UploadKind, AbortController | null>>({
    INTERNSHIP_APPLICATION: null,
    ASSIGNMENT_LETTER: null,
  });

  const draftPromise = useRef<Promise<ApplicationResponse> | null>(null);
  const appRef = useRef<ApplicationResponse | null>(null);

  const uploads: Record<UploadKind, ApplicationDocumentResponse | null> = useMemo(
    () => ({
      INTERNSHIP_APPLICATION: slots.INTERNSHIP_APPLICATION.attachment,
      ASSIGNMENT_LETTER: slots.ASSIGNMENT_LETTER.attachment,
    }),
    [slots],
  );

  const uploadingStates: Record<UploadKind, boolean> = useMemo(
    () => ({
      INTERNSHIP_APPLICATION:
        slots.INTERNSHIP_APPLICATION.phase === 'uploading' ||
        slots.INTERNSHIP_APPLICATION.phase === 'attaching',
      ASSIGNMENT_LETTER:
        slots.ASSIGNMENT_LETTER.phase === 'uploading' ||
        slots.ASSIGNMENT_LETTER.phase === 'attaching',
    }),
    [slots],
  );

  const [stepError, setStepError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyAppliedRef, setAlreadyAppliedRef] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const bootstrapDone = useRef(false);

  // Live classification preview
  const classification: ClassificationResult | null = useMemo(() => {
    const s = draft.dates.desiredStartDate;
    const e = draft.dates.desiredEndDate;
    if (!s || !e || e < s) return null;
    return classifyInternship(s, e);
  }, [draft.dates.desiredStartDate, draft.dates.desiredEndDate]);

  const classificationType = classification?.type ?? null;

  /* ----- Draft + step + file-meta persistence (survives locale switches) ----- */
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const storedStep = sessionStorage.getItem(STORAGE_STEP_KEY);
      const meta = readPendingMeta();
      if (stored || storedStep !== null) {
        const parsed = stored ? (JSON.parse(stored) as WizardDraft) : null;
        const step = storedStep !== null ? Number.parseInt(storedStep, 10) : Number.NaN;
        setTimeout(() => {
          if (parsed) setDraft(parsed);
          if (Number.isInteger(step)) {
            setStepIndex(Math.min(Math.max(step, 0), STEPS.length - 1));
          }
          setPendingMeta(meta);
        }, 0);
      }
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const saveStepToStorage = useCallback((index: number) => {
    try {
      sessionStorage.setItem(STORAGE_STEP_KEY, String(index));
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const saveDraftToStorage = useCallback((updated: WizardDraft) => {
    try {
      // Privacy: the national ID must never land in browser storage. It is
      // re-merged from the authoritative profile on every load (see loadAll),
      // so omitting it here keeps resume behavior identical.
      const personal = {...updated.personal, nationalId: ''};
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({...updated, personal}));
    } catch {
      /* ignore storage errors */
    }
  }, []);

  /* ----- Bootstrap: check auth, profile, universities, drafts ----- */
  const loadAll = useCallback(async () => {
    let unis: University[] = [];
    try {
      unis = await fetchUniversities();
      setUniversities(unis);
    } catch {
      // Universities request fallback
    }

    let prof: CandidateProfile | null = null;
    try {
      prof = await getProfile();
      setProfile(prof);
      setIsAuthenticated(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Anonymous user — not an error! They can continue steps 1-6 seamlessly
        setIsAuthenticated(false);
        setPhase('ready');
        return;
      }
      setLoadingError({
        title: t('loadErrorTitle'),
        hint: t('loadErrorHint'),
        traceId: err instanceof ApiError ? err.traceId : null,
      });
      setPhase('error');
      return;
    }

    // If authenticated, check for any existing application (one application only)
    if (prof) {
      try {
        const {listApplications} = await import('@/lib/api/application-client');
        const list = await listApplications();
        if (list.length > 0) {
          const a = list[0];
          setAlreadyAppliedRef(a.reference);
          setPhase('alreadyApplied');
          return;
        }
      } catch {
        /* proceed to profile prefill */
      }

      // No existing application: check for DRAFT or prefill from profile
      try {
        const {listApplications} = await import('@/lib/api/application-client');
        const list = await listApplications();
        const drafts = list
          .filter((a) => a.status === 'DRAFT')
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        if (drafts.length > 0) {
          const a = drafts[0];
          appRef.current = a;
          setApp(a);

          // Update draft from backend data
          setDraft((prev) => {
            const next = {
              ...prev,
              personal: {
                firstName: prof?.firstName || prev.personal.firstName,
                lastName: prof?.lastName || prev.personal.lastName,
                nationalId: prof?.nationalId || prev.personal.nationalId,
                email: prof?.email || prev.personal.email,
                phone: prof?.phone || prev.personal.phone,
                birthDate: prof?.birthDate || prev.personal.birthDate,
              },
              education: {
                educationLevel: prof?.diploma || prev.education.educationLevel || 'LICENCE',
                speciality: prof?.speciality || prev.education.speciality,
                universityId: prof?.universityId || prev.education.universityId,
              },
              dates: {
                desiredStartDate: a.desiredStartDate || prev.dates.desiredStartDate,
                desiredEndDate: a.desiredEndDate || prev.dates.desiredEndDate,
              },
            };
            saveDraftToStorage(next);
            return next;
          });
          setIsPrefilled(true);

          try {
            const docs = await getApplicationDocuments(a.id);
            const byKind = docsToUploads(docs);
            setSlots({
              INTERNSHIP_APPLICATION: idleSlot(byKind.INTERNSHIP_APPLICATION),
              ASSIGNMENT_LETTER: idleSlot(byKind.ASSIGNMENT_LETTER),
            });
          } catch {
            /* ignore document loading failures */
          }

          setPhase('ready');
          return;
        }
      } catch {
        /* proceed to profile prefill */
      }

      // No backend draft: intelligently prefill from candidate profile
      setDraft((prev) => {
        const next = {
          ...prev,
          personal: {
            firstName: prev.personal.firstName || prof?.firstName || '',
            lastName: prev.personal.lastName || prof?.lastName || '',
            nationalId: prev.personal.nationalId || prof?.nationalId || '',
            email: prev.personal.email || prof?.email || '',
            phone: prev.personal.phone || prof?.phone || '',
            birthDate: prev.personal.birthDate || prof?.birthDate || '',
          },
          education: {
            educationLevel: prev.education.speciality
              ? prev.education.educationLevel
              : prof?.diploma || 'LICENCE',
            speciality: prev.education.speciality || prof?.speciality || '',
            universityId: prev.education.universityId || prof?.universityId || '',
          },
        };
        saveDraftToStorage(next);
        return next;
      });
      setIsPrefilled(true);
    }

    setPhase('ready');
  }, [saveDraftToStorage, t]);

  useEffect(() => {
    if (bootstrapDone.current) return;
    bootstrapDone.current = true;
    void loadAll();
  }, [loadAll]);

  /* ----- Dirty tracking guard ----- */
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  /* ----- Draft Sync to Backend (if Authenticated) ----- */
  const persistDraft = useCallback(
    async (overrideDraft?: WizardDraft) => {
      if (!isAuthenticated) return;
      const target = overrideDraft ?? draft;
      setSaving(true);
      setStepError(null);
      try {
        const body = {
          desiredStartDate: target.dates.desiredStartDate || null,
          desiredEndDate: target.dates.desiredEndDate || null,
        };
        if (app) {
          const updated = await updateDraft(app.id, body);
          appRef.current = {...app, ...updated};
          setApp((prev) => (prev ? {...prev, ...updated} : prev));
        } else {
          const created = await createDraft(body);
          appRef.current = created;
          setApp(created);
        }
        setDirty(false);
      } catch (err) {
        setStepError(err instanceof ApiError ? err.message : t('loadErrorHint'));
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [app, draft, isAuthenticated, t],
  );

  /* ----- Document Slot Helpers ----- */
  const setSlot = useCallback((kind: UploadKind, patch: Partial<SlotState>) => {
    setSlots((prev) => ({...prev, [kind]: {...prev[kind], ...patch}}));
  }, []);

  const slotErrorFor = useCallback(
    (kind: UploadKind, err: unknown, stage: 'upload' | 'attach'): SlotError => {
      const units = {b: td('unitB'), kb: td('unitKB'), mb: td('unitMB')};
      const rule = DOCUMENT_RULES[kind];
      const maxLabel = formatBytes(rule.maxBytes, units);
      const accepted = extensionsLabel(rule.extensions);
      const traceId = err instanceof ApiError ? err.traceId ?? null : null;
      const fail = (message: string, retryable: boolean): SlotError => ({
        message,
        traceId,
        retryable,
      });
      if (err instanceof ApiError) {
        switch (err.code) {
          case 'UPLOAD_CANCELLED':
            return fail(td('errorCancelled'), true);
          case 'UPLOAD_TIMEOUT':
            return fail(td('errorTimeout'), true);
          case 'UPLOAD_NETWORK':
            return fail(td('errorNetwork'), true);
          case 'FILE_TOO_LARGE':
            return fail(td('errorTooLarge', {size: maxLabel}), false);
          case 'EMPTY_FILE':
            return fail(td('errorEmpty'), false);
          case 'MIME_TYPE_SPOOFING_DETECTED':
            return fail(td('errorSpoofed', {expected: accepted}), false);
          case 'INVALID_FILE_TYPE':
            return fail(td('errorInvalidType', {accepted}), false);
          default:
            break;
        }
        if (err.status === 429) return fail(td('errorRateLimited'), true);
        if (err.status === 401) return fail(td('errorAuth'), false);
        if (err.status === 504) return fail(td('errorTimeout'), true);
        if (err.status === 502 || err.status === 0) return fail(td('errorNetwork'), true);
        if (stage === 'attach') return fail(td('errorAttach'), true);
      }
      return fail(td('errorGeneric'), true);
    },
    [td],
  );

  const fullNameForAi = useCallback(() => {
    const f = draft.personal.firstName.trim();
    const l = draft.personal.lastName.trim();
    if (!f || !l) return null;
    return `${f} ${l}`;
  }, [draft.personal.firstName, draft.personal.lastName]);

  const aiErrorFor = useCallback(
    (err: unknown): SlotError => {
      const traceId = err instanceof ApiError ? err.traceId ?? null : null;
      const fail = (message: string, retryable: boolean): SlotError => ({message, traceId, retryable});
      if (err instanceof ApiError) {
        if (err.code === 'AI_UNAVAILABLE' || err.code === 'AI_TEMPORARILY_UNAVAILABLE' || err.status === 503) {
          return fail(td('aiErrorUnavailable'), true);
        }
        if (err.code === 'UPLOAD_CANCELLED') return fail(td('errorCancelled'), true);
        if (err.status === 429) return fail(td('errorRateLimited'), true);
        if (err.status === 401) return fail(td('errorAuth'), false);
        return fail(err.message || td('aiErrorGeneric'), err.status === 0 || err.status >= 500);
      }
      return fail(td('aiErrorGeneric'), true);
    },
    [td],
  );

  const runAiValidation = useCallback(
    async (kind: UploadKind, fileForPublic: File | null, storedDocumentId: string | null) => {
      const fullName = fullNameForAi();
      if (!fullName) {
        setAiErrors((prev) => ({
          ...prev,
          [kind]: {message: td('aiErrorNeedName'), traceId: null, retryable: false},
        }));
        return;
      }
      setAiValidating((prev) => ({...prev, [kind]: true}));
      setAiErrors((prev) => ({...prev, [kind]: null}));
      try {
        let result: DocumentAiValidation;
        if (storedDocumentId) {
          result = await validateStoredDocumentAiBrowser(storedDocumentId, {
            expectedType: kind,
            fullName,
          });
        } else if (fileForPublic) {
          result = await validatePublicDocumentAi(fileForPublic, kind as never, fullName);
        } else {
          throw new Error('No document to validate');
        }
        setAiValidations((prev) => ({...prev, [kind]: result}));
        setAiErrors((prev) => ({...prev, [kind]: null}));
      } catch (err) {
        setAiValidations((prev) => ({...prev, [kind]: null}));
        setAiErrors((prev) => ({...prev, [kind]: aiErrorFor(err)}));
      } finally {
        setAiValidating((prev) => ({...prev, [kind]: false}));
      }
    },
    [aiErrorFor, fullNameForAi, td],
  );

  // Name changed after a document was already AI-validated → that validation is stale.
  useEffect(() => {
    // Invalidate so the wizard forces re-validation with the current full name.
    setAiValidations({INTERNSHIP_APPLICATION: null, ASSIGNMENT_LETTER: null});
    setAiErrors({INTERNSHIP_APPLICATION: null, ASSIGNMENT_LETTER: null});
    // Do not clear validating flag – an in-flight call will finish and be discarded.
  }, [draft.personal.firstName, draft.personal.lastName]);

  // Hydrated stored documents (e.g. draft resume) that have attachments but no
  // AI result yet: trigger the gate so Continue stays blocked until verified.
  useEffect(() => {
    if (phase !== 'ready') return;
    const kinds: UploadKind[] = ['INTERNSHIP_APPLICATION', 'ASSIGNMENT_LETTER'];
    for (const k of kinds) {
      const att = slots[k].attachment;
      if (!att || att.id.startsWith('temp-')) continue;
      if (aiValidations[k] || aiValidating[k] || aiErrors[k]) continue;
      const name = fullNameForAi();
      if (!name) continue;
      void runAiValidation(k, null, att.document.id);
    }
  }, [phase, slots, aiValidations, aiValidating, aiErrors, fullNameForAi, runAiValidation]);

  const ensureDraft = useCallback(async (): Promise<ApplicationResponse> => {
    if (appRef.current) return appRef.current;
    if (!draftPromise.current) {
      draftPromise.current = createDraft({
        desiredStartDate: draft.dates.desiredStartDate || null,
        desiredEndDate: draft.dates.desiredEndDate || null,
      })
        .then((created) => {
          appRef.current = created;
          setApp(created);
          return created;
        })
        .finally(() => {
          draftPromise.current = null;
        });
    }
    return draftPromise.current;
  }, [draft.dates.desiredEndDate, draft.dates.desiredStartDate]);

  const startUpload = useCallback(
    async (kind: UploadKind, file: File) => {
      aborters.current[kind]?.abort();
      const controller = new AbortController();
      aborters.current[kind] = controller;
      pendingFiles.current[kind] = file;
      // File objects die on reload/locale navigation — keep metadata so the
      // UI can honestly ask for re-selection instead of failing silently.
      setPendingMeta(setPendingMetaKind(kind, {name: file.name, size: file.size}));

      // If user is anonymous, queue the file locally then run AI validation
      // against the in-memory bytes (Spring Boot → Python, no persistence yet).
      if (!isAuthenticated) {
        // Clear previous AI state before starting a new validation.
        setAiValidations((prev) => ({...prev, [kind]: null}));
        setAiErrors((prev) => ({...prev, [kind]: null}));
        setSlot(kind, {
          phase: 'idle',
          progress: null,
          pendingName: file.name,
          pendingSize: file.size,
          error: null,
          attachment: {
            id: `temp-${kind}`,
            document: {
              id: `temp-${kind}`,
              type: kind as DocumentType,
              fileName: file.name,
              fileSize: file.size,
              contentType: file.type || 'application/pdf',
              createdAt: new Date().toISOString(),
            },
            mandatory: DOCUMENT_RULES[kind].required,
            attachedAt: new Date().toISOString(),
          } as unknown as ApplicationDocumentResponse,
        });
        setDirty(true);
        // Kick off AI validation (non-blocking but gates the Continue button).
        if (!fullNameForAi()) {
          setAiErrors((prev) => ({
            ...prev,
            [kind]: {message: td('aiErrorNeedName'), traceId: null, retryable: false},
          }));
        } else {
          void runAiValidation(kind, file, null);
        }
        return;
      }

      setSlot(kind, {
        phase: 'uploading',
        progress: 0,
        pendingName: file.name,
        pendingSize: file.size,
        error: null,
      });
      setDirty(true);

      const cancelledState = (): SlotState => ({
        phase: 'cancelled',
        progress: null,
        pendingName: file.name,
        pendingSize: file.size,
        error: {message: td('errorCancelled'), traceId: null, retryable: true},
        attachment: slots[kind].attachment,
      });

      let stage: 'upload' | 'attach' = 'upload';
      try {
        const d = await ensureDraft();
        if (controller.signal.aborted) {
          setSlots((prev) => ({...prev, [kind]: cancelledState()}));
          return;
        }
        const doc = await uploadFileWithProgress(file, kind as DocumentType, {
          signal: controller.signal,
          onProgress: (loaded, total) => {
            setSlot(kind, {
              progress: total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : null,
            });
          },
        });
        if (controller.signal.aborted) {
          setSlots((prev) => ({...prev, [kind]: cancelledState()}));
          return;
        }
        stage = 'attach';
        setSlot(kind, {phase: 'attaching'});
        // Reset AI state for this new file; the Continue button stays disabled
        // until the gate passes (loading spinner is shown instead).
        setAiValidations((prev) => ({...prev, [kind]: null}));
        setAiErrors((prev) => ({...prev, [kind]: null}));
        try {
          const attached = await attachDocument(d.id, {
            documentId: doc.id,
            mandatory: DOCUMENT_RULES[kind].required,
          });
          setSlot(kind, {
            phase: 'idle',
            progress: null,
            pendingName: null,
            pendingSize: null,
            error: null,
            attachment: attached,
          });
          pendingFiles.current[kind] = null;
          setPendingMeta(setPendingMetaKind(kind, null));
          setDirty(true);
          void runAiValidation(kind, null, attached.document.id);
        } catch (attachErr) {
          if (attachErr instanceof ApiError && attachErr.status === 409) {
            const docs = await getApplicationDocuments(d.id);
            const latest = docsToUploads(docs)[kind];
            if (latest) {
              setSlot(kind, {
                phase: 'idle',
                progress: null,
                pendingName: null,
                pendingSize: null,
                error: null,
                attachment: latest,
              });
              pendingFiles.current[kind] = null;
              setPendingMeta(setPendingMetaKind(kind, null));
              setDirty(true);
              void runAiValidation(kind, null, latest.document.id);
              return;
            }
          }
          throw attachErr;
        }
      } catch (err) {
        if (controller.signal.aborted) {
          setSlots((prev) => ({...prev, [kind]: cancelledState()}));
          return;
        }
        setSlot(kind, {phase: 'error', progress: null, error: slotErrorFor(kind, err, stage)});
      } finally {
        if (aborters.current[kind] === controller) aborters.current[kind] = null;
      }
    },
    [ensureDraft, fullNameForAi, isAuthenticated, runAiValidation, setSlot, slotErrorFor, slots, td],
  );

  const cancelUpload = useCallback((kind: UploadKind) => {
    aborters.current[kind]?.abort();
    // Cancelling upload also cancels any in-flight AI gate for this slot.
    setAiValidating((prev) => ({...prev, [kind]: false}));
  }, []);

  const retryUpload = useCallback(
    (kind: UploadKind) => {
      const file = pendingFiles.current[kind];
      if (file) void startUpload(kind, file);
    },
    [startUpload],
  );

  const retryAiValidation = useCallback(
    (kind: UploadKind) => {
      const attachment = slots[kind].attachment;
      const file = pendingFiles.current[kind];
      if (attachment && !attachment.id.startsWith('temp-')) {
        void runAiValidation(kind, null, attachment.document.id);
      } else if (file) {
        void runAiValidation(kind, file, null);
      } else if (attachment) {
        // Anonymous slot without bytes left (e.g. after reload). User must re-select.
        setAiErrors((prev) => ({
          ...prev,
          [kind]: {message: td('aiErrorNeedReselect'), traceId: null, retryable: false},
        }));
      }
    },
    [runAiValidation, slots, td],
  );

  const removeUpload = useCallback(
    (kind: UploadKind) => {
      aborters.current[kind]?.abort();
      pendingFiles.current[kind] = null;
      setSlot(kind, idleSlot());
      setPendingMeta(setPendingMetaKind(kind, null));
      setAiValidations((prev) => ({...prev, [kind]: null}));
      setAiErrors((prev) => ({...prev, [kind]: null}));
      setAiValidating((prev) => ({...prev, [kind]: false}));
      setDirty(true);
    },
    [setSlot],
  );

  /* Files queued but never attached (reload / locale switch): ask to re-select. */
  const staleUploads = useMemo(
    () =>
      (Object.keys(EMPTY_META) as UploadKind[])
        .filter((k) => pendingMeta[k] && !slots[k].attachment)
        .map((k) => pendingMeta[k]?.name ?? k),
    [pendingMeta, slots],
  );

  /* ----- Step Navigation ----- */
  const goNext = useCallback(async () => {
    const currentStepId = STEPS[stepIndex] as StepId;
    const validationKey = validateStep(
      currentStepId,
      draft,
      classificationType,
      uploads,
      uploadingStates,
      aiValidations,
      aiValidating,
    );

    if (validationKey) {
      // Guarded lookup: never surface a raw MISSING_MESSAGE key to users.
      const key = validationKey as never;
      setStepError(t.has(key) ? t(key) : t('loadErrorHint'));
      return;
    }

    setStepError(null);

    // If authenticated, persist draft checkpoint to backend when leaving dates or details
    if (isAuthenticated && (currentStepId === 'dates')) {
      try {
        await persistDraft();
      } catch {
        return;
      }
    }

    const nextIndex = Math.min(stepIndex + 1, STEPS.length - 1);
    setStepIndex(nextIndex);
    saveStepToStorage(nextIndex);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, [
    aiValidations,
    aiValidating,
    stepIndex,
    draft,
    classificationType,
    uploads,
    uploadingStates,
    isAuthenticated,
    persistDraft,
    saveStepToStorage,
    t,
  ]);

  const goBack = useCallback(() => {
    setStepError(null);
    setStepIndex((i) => {
      const next = Math.max(i - 1, 0);
      saveStepToStorage(next);
      return next;
    });
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, [saveStepToStorage]);

  const handleJumpToStep = useCallback(
    (targetIndex: number) => {
      setStepError(null);
      const next = Math.min(Math.max(targetIndex, 0), STEPS.length - 1);
      setStepIndex(next);
      saveStepToStorage(next);
      window.scrollTo({top: 0, behavior: 'smooth'});
    },
    [saveStepToStorage],
  );

  /* ----- Final Submissions ----- */
  const handleSubmit = useCallback(async () => {
    if (!app) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const docs = await getApplicationDocuments(app.id);
      const serverKinds = new Set(docs.map((d) => d.document.type));
      const requiredKinds: UploadKind[] = ['INTERNSHIP_APPLICATION', 'ASSIGNMENT_LETTER'];
      const blocked = requiredKinds.some((k) => !uploads[k] || !serverKinds.has(k));
      if (blocked) {
        const msg = td('submitBlockedDocs');
        setSubmitError(tError('submitError', {message: msg}));
        toast.notify({title: msg, tone: 'error'});
        return;
      }
      const updated = await submit(app.id);
      appRef.current = updated;
      setApp(updated);
      setSubmittedReference(updated.reference);
      setDirty(false);
      clearWizardStorage();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : t('loadErrorHint');
      setSubmitError(tError('submitError', {message: msg}));
    } finally {
      setSubmitting(false);
    }
  }, [app, t, tError, td, toast, uploads]);

  /**
   * Anonymous candidate bridge: creates candidate account or signs in,
   * creates the draft, uploads queued files, and submits the dossier.
   * (For account-less submission see handleAnonymousDirect.)
   */
  const handleAnonymousSubmit = useCallback(
    async (password: string, isNewAccount: boolean) => {
      // 1. Authenticate (register or login)
      const authEndpoint = isNewAccount ? '/api/auth/register' : '/api/auth/login';
      const authBody = isNewAccount
        ? {
            email: draft.personal.email,
            password,
            firstName: draft.personal.firstName,
            lastName: draft.personal.lastName,
            phone: draft.personal.phone,
          }
        : {
            email: draft.personal.email,
            password,
          };

      const res = await fetch(authEndpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(authBody),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({message: 'Authentication failed'}));
        throw new Error(errJson.message || 'Authentication failed');
      }

      setIsAuthenticated(true);

      // 2. Update candidate profile with academic details
      try {
        await updateProfile({
          firstName: draft.personal.firstName,
          lastName: draft.personal.lastName,
          email: draft.personal.email,
          nationalId: draft.personal.nationalId,
          universityId: draft.education.universityId,
          phone: draft.personal.phone,
          birthDate: draft.personal.birthDate,
          diploma: draft.education.educationLevel,
          speciality: draft.education.speciality,
        });
      } catch {
        // Fallback to createProfile if profile doesn't exist yet
        try {
          await createProfile({
            firstName: draft.personal.firstName,
            lastName: draft.personal.lastName,
            email: draft.personal.email,
            nationalId: draft.personal.nationalId,
            universityId: draft.education.universityId,
            phone: draft.personal.phone,
            birthDate: draft.personal.birthDate,
            diploma: draft.education.educationLevel,
            speciality: draft.education.speciality,
          });
        } catch {
          /* ignore profile update fallback errors */
        }
      }

      // 3. Create Draft
      const createdDraft = await createDraft({
        desiredStartDate: draft.dates.desiredStartDate || null,
        desiredEndDate: draft.dates.desiredEndDate || null,
      });
      appRef.current = createdDraft;
      setApp(createdDraft);

      // 4. Upload pending files & attach them
      const kinds: UploadKind[] = [
        'INTERNSHIP_APPLICATION',
        'ASSIGNMENT_LETTER',
      ];
      for (const kind of kinds) {
        const file = pendingFiles.current[kind];
        if (file) {
          const doc = await uploadFileWithProgress(file, kind as DocumentType, {});
          await attachDocument(createdDraft.id, {
            documentId: doc.id,
            mandatory: DOCUMENT_RULES[kind].required,
          });
        }
      }

      // 5. Submit application
      const finalApp = await submit(createdDraft.id);
      appRef.current = finalApp;
      setApp(finalApp);
      setSubmittedReference(finalApp.reference);
      setTrackingToken(null);
      setDirty(false);
      clearWizardStorage();
    },
    [draft],
  );

  /**
   * Account-less submission (E3.1): posts the wizard draft + queued files to the
   * public endpoint. Backend owns validation, CIN-uniqueness and classification.
   * The tracking token is shown once — the only credential for `/track`.
   */
  const handleAnonymousDirect = useCallback(async () => {
    const files: File[] = [];
    for (const kind of ['INTERNSHIP_APPLICATION', 'ASSIGNMENT_LETTER'] as UploadKind[]) {
      const file = pendingFiles.current[kind];
      if (!file) {
        setSubmitError(tError('submitError', {message: td('submitBlockedDocs')}));
        return;
      }
      files.push(file);
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const {submitAnonymous} = await import('@/lib/api/anonymous-client');
      const result = await submitAnonymous(
        {
          firstName: draft.personal.firstName,
          lastName: draft.personal.lastName,
          email: draft.personal.email,
          phone: draft.personal.phone || undefined,
          birthDate: draft.personal.birthDate || undefined,
          nationalId: draft.personal.nationalId,
          universityId: draft.education.universityId,
          speciality: draft.education.speciality || undefined,
          diploma: draft.education.educationLevel || undefined,
          desiredStartDate: draft.dates.desiredStartDate,
          desiredEndDate: draft.dates.desiredEndDate,
        },
        files,
      );
      setSubmittedReference(result.reference);
      setTrackingToken(result.trackingToken);
      setDirty(false);
      clearWizardStorage();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('loadErrorHint');
      setSubmitError(tError('submitError', {message: msg}));
    } finally {
      setSubmitting(false);
    }
  }, [draft, t, tError, td]);

  /* ----- Render Loading / Error ----- */
  if (phase === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <ErrorState
        title={loadingError?.title}
        hint={loadingError?.hint}
        traceId={loadingError?.traceId ?? null}
        onRetry={() => {
          setPhase('loading');
          bootstrapDone.current = true;
          setLoadingError(null);
          void loadAll();
        }}
      />
    );
  }

  if (phase === 'alreadyApplied') {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-50/90 p-8 shadow-xl backdrop-blur-sm dark:border-amber-400/30 dark:bg-amber-500/10">
              {/* Icon */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-amber-950 dark:text-amber-50">
                {t('alreadyAppliedTitle')}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-amber-800/80 dark:text-amber-100/80">
                {t('alreadyAppliedBody')}
              </p>

              {/* Reference badge */}
              {alreadyAppliedRef && (
                <div className="mt-5 flex justify-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-100/80 px-5 py-2.5 text-xs font-mono font-semibold text-amber-900 dark:text-amber-200 dark:border-amber-400/50 dark:bg-amber-400/10">
                    <svg className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M3 8h18M3 16h18" />
                    </svg>
                    {t('alreadyAppliedRef', {reference: alreadyAppliedRef})}
                  </span>
                </div>
              )}

              {/* Info text */}
              <p className="mt-5 text-xs text-amber-700/60 dark:text-amber-300/60">
                {t('alreadyAppliedNext')}
              </p>

              {/* CTA Button */}
              <div className="mt-8 flex justify-center">
                <Link
                  href="/track"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-sm font-bold text-amber-950 dark:text-amber-900 shadow-lg shadow-amber-500/30 transition-all duration-300 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-400/40"
                >
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  {t('trackMyApplication')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress Stepper */}
      <Stepper steps={STEP_DEFS} current={stepIndex} />

      {/* Global Step Error */}
      {stepError && (
        <div
          role="alert"
          className="rounded-xl border border-accent-200 bg-accent-50/80 px-4 py-3 text-sm text-accent-800 dark:border-accent-800 dark:bg-accent-950/40 dark:text-accent-200"
        >
          {stepError}
        </div>
      )}

      {/* Step 1: Personal Information */}
      {stepIndex === 0 && (
        <PersonalStep
          data={draft.personal}
          isPrefilled={isPrefilled}
          onChange={(patch) => {
            setStepError(null);
            setDraft((prev) => {
              const next = {...prev, personal: {...prev.personal, ...patch}};
              saveDraftToStorage(next);
              return next;
            });
            setDirty(true);
          }}
          errorKey={stepError}
          onContinue={() => void goNext()}
        />
      )}

      {/* Step 2: Education & University */}
      {stepIndex === 1 && (
        <EducationStep
          data={draft.education}
          universities={universities}
          onChange={(patch) => {
            setStepError(null);
            setDraft((prev) => {
              const next = {...prev, education: {...prev.education, ...patch}};
              saveDraftToStorage(next);
              return next;
            });
            setDirty(true);
          }}
          errorKey={stepError}
          onContinue={() => void goNext()}
        />
      )}

      {/* Step 3: Dates & Interactive Classification */}
      {stepIndex === 2 && (
        <DatesStep
          startDate={draft.dates.desiredStartDate}
          endDate={draft.dates.desiredEndDate}
          classification={classification}
          onChange={(s, e) => {
            setStepError(null);
            setDraft((prev) => {
              const next = {...prev, dates: {desiredStartDate: s, desiredEndDate: e}};
              saveDraftToStorage(next);
              return next;
            });
            setDirty(true);
          }}
          errorKey={stepError}
          onContinue={() => void goNext()}
        />
      )}

      {/* Step 5: Required Documents – gated by AI doc-intel (type + name) */}
      {stepIndex === 3 && (
        <DocumentsStep
          application={slots.INTERNSHIP_APPLICATION}
          assignment={slots.ASSIGNMENT_LETTER}
          disabled={saving}
          staleFileNames={staleUploads}
          aiValidations={aiValidations}
          aiValidating={aiValidating}
          aiErrors={aiErrors}
          fullName={fullNameForAi()}
          onRetryAi={retryAiValidation}
          onSelectFiles={(kind, files) => {
            setStepError(null);
            if (files.length > 0) void startUpload(kind, files[0]);
          }}
          onCancel={(kind) => cancelUpload(kind)}
          onRetry={(kind) => retryUpload(kind)}
          onRemove={(kind) => removeUpload(kind)}
          errorKey={stepError}
          onContinue={() => void goNext()}
        />
      )}

      {/* Step 6: Scannable Review */}
      {stepIndex === 4 && (
        <ReviewStep
          draft={draft}
          universities={universities}
          classification={classification}
          applicationLetter={uploads.INTERNSHIP_APPLICATION}
          assignmentLetter={uploads.ASSIGNMENT_LETTER}
          onJumpToStep={handleJumpToStep}
          onToggleTerms={(val) => {
            setStepError(null);
            setDraft((prev) => {
              const next = {...prev, confirmedTerms: val};
              saveDraftToStorage(next);
              return next;
            });
            setDirty(true);
          }}
          onContinue={() => void goNext()}
        />
      )}

      {/* Step 7: Confirmation & Tracking / Anonymous Bridge */}
      {stepIndex === 5 && (
        <SubmitStep
          isAuthenticated={isAuthenticated}
          submitting={submitting}
          submittedReference={submittedReference}
          trackingToken={trackingToken}
          candidateEmail={draft.personal.email}
          errorKey={submitError}
          onSubmit={() => void handleSubmit()}
          onAnonymousSubmit={handleAnonymousSubmit}
          onAnonymousDirect={() => handleAnonymousDirect()}
        />
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        {stepIndex > 0 && stepIndex < 6 && (
          <Button variant="secondary" size="md" onClick={goBack} disabled={saving}>
            {tnav('back')}
          </Button>
        )}
      </div>
    </div>
  );
}
