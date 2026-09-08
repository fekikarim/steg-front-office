'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {usePathname, Link} from '@/i18n/navigation';
import {ApiError} from '@/lib/api-client';
import type {CandidateProfile, University} from '@/lib/api/candidate';
import {
  classifyInternship,
  DOCUMENT_RULES,
  type ApplicationDocumentResponse,
  type ApplicationResponse,
  type ClassificationResult,
  type DocumentType,
} from '@/lib/api/application';
import {
  attachDocument,
  createDraft,
  getApplicationDocuments,
  updateDraft,
  submit,
  uploadFileWithProgress,
} from '@/lib/api/application-client';
import {fetchUniversities, getProfile} from '@/lib/api/profile-client';
import {extensionsLabel, formatBytes} from '@/lib/files';
import {useToast} from '@/components/ui/Toast';
import {Button} from '@/components/ui/Button';
import {CardSkeleton} from '@/components/feedback/Skeleton';
import {ErrorState} from '@/components/feedback/ErrorState';
import {Card} from '@/components/ui/Card';
import {Stepper, type StepDef} from './Stepper';
import {WelcomeStep} from './WelcomeStep';
import {PersonalStep} from './PersonalStep';
import {DatesStep} from './DatesStep';
import {InfoStep} from './InfoStep';
import {DocumentsStep} from './DocumentsStep';
import {DemoStep} from './DemoStep';
import {ReviewStep} from './ReviewStep';
import {SubmitStep} from './SubmitStep';
import {
  STEPS,
  validateStep,
  type StepId,
  type UploadKind,
  type WizardConfirmation,
} from '@/lib/apply-wizard';
import {idleSlot, type SlotError, type SlotState} from './DocumentSlot';

type Phase = 'loading' | 'anonymous' | 'start' | 'ready' | 'error';

const STEP_DEFS: StepDef[] = STEPS.map((id) => ({id, key: id}));

function docsToUploads(docs: ApplicationDocumentResponse[]) {
  const next = {
    INTERNSHIP_APPLICATION: null,
    ASSIGNMENT_LETTER: null,
    PROJECT_DEMO_IMAGE: null,
  } as Record<UploadKind, ApplicationDocumentResponse | null>;
  for (const d of docs) {
    if (d.document.type === 'INTERNSHIP_APPLICATION') next.INTERNSHIP_APPLICATION = d;
    else if (d.document.type === 'ASSIGNMENT_LETTER') next.ASSIGNMENT_LETTER = d;
    else if (d.document.type === 'PROJECT_DEMO_IMAGE') next.PROJECT_DEMO_IMAGE = d;
  }
  return next;
}

/**
 * B4 — Internship application wizard. Owns all wizard state, syncs the DRAFT
 * to the backend at checkpoints, uploads/attaches documents, and drives the
 * final submission. The backend is the source of truth; client classification
 * is a preview only.
 *
 * Entry flow:
 *   - anonymous → auth prompt
 *   - no DRAFT yet → "start" screen (creates the DRAFT on first step)
 *   - existing DRAFT → "resume" screen (step selected from DRAFT completeness)
 *   - DRAFT already SUBMITTED → confirmation screen
 */
export function ApplyWizard() {
  const t = useTranslations('apply');
  const tnav = useTranslations('apply.nav');
  const tError = useTranslations('apply.submit');
  const td = useTranslations('apply.documents');
  const toast = useToast();
  const pathname = usePathname();

  const [phase, setPhase] = useState<Phase>('loading');
  const [app, setApp] = useState<ApplicationResponse | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingError, setLoadingError] = useState(null as null | {title: string; hint: string; traceId?: string | null});

  const [stepIndex, setStepIndex] = useState(0);
  const [confirm, setConfirm] = useState<WizardConfirmation>({
    eligibility: false,
    personal: false,
    dates: false,
    info: false,
  });

  /* wizard form fields */
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [theme, setTheme] = useState('');

  /* documents — one B5 upload slot per kind; attachments double as the
     submit gate (initialized from backend data, updated by user actions). */
  const [slots, setSlots] = useState<Record<UploadKind, SlotState>>({
    INTERNSHIP_APPLICATION: idleSlot(),
    ASSIGNMENT_LETTER: idleSlot(),
    PROJECT_DEMO_IMAGE: idleSlot(),
  });
  /** Files awaiting (re-)upload; kept outside React state (never rendered). */
  const pendingFiles = useRef<Record<UploadKind, File | null>>({
    INTERNSHIP_APPLICATION: null,
    ASSIGNMENT_LETTER: null,
    PROJECT_DEMO_IMAGE: null,
  });
  /** In-flight cancellation handles, one per slot. */
  const aborters = useRef<Record<UploadKind, AbortController | null>>({
    INTERNSHIP_APPLICATION: null,
    ASSIGNMENT_LETTER: null,
    PROJECT_DEMO_IMAGE: null,
  });
  /** Single-flight DRAFT creation shared by concurrent slot uploads. */
  const draftPromise = useRef<Promise<ApplicationResponse> | null>(null);
  /** Latest application mirror for async upload tasks (avoids stale closures). */
  const appRef = useRef<ApplicationResponse | null>(null);

  const uploads: Record<UploadKind, ApplicationDocumentResponse | null> = useMemo(
    () => ({
      INTERNSHIP_APPLICATION: slots.INTERNSHIP_APPLICATION.attachment,
      ASSIGNMENT_LETTER: slots.ASSIGNMENT_LETTER.attachment,
      PROJECT_DEMO_IMAGE: slots.PROJECT_DEMO_IMAGE.attachment,
    }),
    [slots],
  );
  const uploadingStates: Record<UploadKind, boolean> = useMemo(
    () => ({
      INTERNSHIP_APPLICATION: slots.INTERNSHIP_APPLICATION.phase === 'uploading' || slots.INTERNSHIP_APPLICATION.phase === 'attaching',
      ASSIGNMENT_LETTER: slots.ASSIGNMENT_LETTER.phase === 'uploading' || slots.ASSIGNMENT_LETTER.phase === 'attaching',
      PROJECT_DEMO_IMAGE: slots.PROJECT_DEMO_IMAGE.phase === 'uploading' || slots.PROJECT_DEMO_IMAGE.phase === 'attaching',
    }),
    [slots],
  );

  const [stepError, setStepError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const bootstrapDone = useRef(false);

  const classification: ClassificationResult | null = useMemo(() => {
    if (!startDate || !endDate) return null;
    if (endDate < startDate) return null;
    return classifyInternship(startDate, endDate);
  }, [startDate, endDate]);

  const classificationType = classification?.type ?? null;
  const themeRequired = classificationType === 'PERFECTIONNEMENT' || classificationType === 'PFE';

  /* ----- bootstrap: load profile + universities + existing DRAFT ----- */

  const loadAll = useCallback(async () => {
    try {
      const [prof, unis] = await Promise.all([getProfile(), fetchUniversities()]);
      setProfile(prof);
      setUniversities(unis);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setPhase('anonymous');
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

    // check for an existing DRAFT
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
        if (a.desiredStartDate) setStartDate(a.desiredStartDate);
        if (a.desiredEndDate) setEndDate(a.desiredEndDate);
        if (a.proposedTheme) setTheme(a.proposedTheme);
        let docs: ApplicationDocumentResponse[] = [];
        try {
          docs = await getApplicationDocuments(a.id);
          const byKind = docsToUploads(docs);
          setSlots({
            INTERNSHIP_APPLICATION: idleSlot(byKind.INTERNSHIP_APPLICATION),
            ASSIGNMENT_LETTER: idleSlot(byKind.ASSIGNMENT_LETTER),
            PROJECT_DEMO_IMAGE: idleSlot(byKind.PROJECT_DEMO_IMAGE),
          });
        } catch {
          /* documents unavailable — still resume */
        }
        // Resume at the earliest incomplete step.
        const uploadedKinds = new Set(docs.map((d) => d.document.type));
        const hasDocs =
          uploadedKinds.has('INTERNSHIP_APPLICATION') && uploadedKinds.has('ASSIGNMENT_LETTER');
        let resumeStep = 0;
        if (a.desiredStartDate && a.desiredEndDate) resumeStep = Math.max(resumeStep, 2);
        if (a.proposedTheme) resumeStep = Math.max(resumeStep, 3);
        if (hasDocs) resumeStep = Math.max(resumeStep, 4);
        setStepIndex(Math.min(resumeStep, 6));
        setPhase('ready');
        return;
      }
    } catch {
      /* no drafts reachable — proceed to start */
    }

    setPhase('start');
  }, [t]);

  useEffect(() => {
    if (bootstrapDone.current) return;
    bootstrapDone.current = true;
    // async bootstrap; the effect body only calls an async fn, never sets sync
    void loadAll();
  }, [loadAll]);

  /* ----- dirty tracking + beforeunload guard ----- */

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  /* ----- draft sync to backend ----- */

  const persistDraft = useCallback(
    async (fields?: {start?: string; end?: string; theme?: string}) => {
      setSaving(true);
      setStepError(null);
      try {
        const body = {
          desiredStartDate: (fields?.start ?? startDate) || null,
          desiredEndDate: (fields?.end ?? endDate) || null,
          proposedTheme: (fields?.theme ?? theme) || null,
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
        toast.notify({title: t('nav.savedAt'), tone: 'success'});
      } catch (err) {
        setStepError(err instanceof ApiError ? err.message : t('loadErrorHint'));
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [app, startDate, endDate, theme, t, toast],
  );

  /* ----- document upload + attach (B5) ----- */

  const setSlot = useCallback((kind: UploadKind, patch: Partial<SlotState>) => {
    setSlots((prev) => ({...prev, [kind]: {...prev[kind], ...patch}}));
  }, []);

  /** Map a transport/backend failure to a localized, retry-aware slot error. */
  const slotErrorFor = useCallback(
    (kind: UploadKind, err: unknown, stage: 'upload' | 'attach'): SlotError => {
      const units = {b: td('unitB'), kb: td('unitKB'), mb: td('unitMB')};
      const rule = DOCUMENT_RULES[kind];
      const maxLabel = formatBytes(rule.maxBytes, units);
      const accepted = extensionsLabel(rule.extensions);
      const traceId = err instanceof ApiError ? (err.traceId ?? null) : null;
      const fail = (message: string, retryable: boolean): SlotError => ({message, traceId, retryable});
      if (err instanceof ApiError) {
        switch (err.code) {
          case 'UPLOAD_CANCELLED':
            return fail(td('errorCancelled'), true);
          case 'UPLOAD_TIMEOUT':
            return fail(td('errorTimeout'), true);
          case 'UPLOAD_NETWORK':
            return fail(td('errorNetwork'), true);
          case 'FILE_TOO_LARGE':
            // Same file will always fail: not retryable, pick another file.
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

  /**
   * Ensure a DRAFT exists before attaching documents. Single-flight across
   * concurrent slot uploads so rapid multi-slot picks create exactly one DRAFT.
   */
  const ensureDraft = useCallback(async (): Promise<ApplicationResponse> => {
    if (appRef.current) return appRef.current;
    if (!draftPromise.current) {
      draftPromise.current = createDraft({
        desiredStartDate: startDate || null,
        desiredEndDate: endDate || null,
        proposedTheme: theme || null,
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
  }, [startDate, endDate, theme]);

  const startUpload = useCallback(
    async (kind: UploadKind, file: File) => {
      // A new pick supersedes any in-flight transfer for this slot.
      aborters.current[kind]?.abort();
      const controller = new AbortController();
      aborters.current[kind] = controller;
      pendingFiles.current[kind] = file;
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
        const draft = await ensureDraft();
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
        try {
          const attached = await attachDocument(draft.id, {
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
        } catch (attachErr) {
          if (attachErr instanceof ApiError && attachErr.status === 409) {
            // Already attached (e.g. a retry racing a dropped response):
            // re-read backend state and adopt the latest attachment of kind.
            const docs = await getApplicationDocuments(draft.id);
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
              return;
            }
          }
          throw attachErr;
        }
        setDirty(true);
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
    [ensureDraft, setSlot, slotErrorFor, slots, td],
  );

  const cancelUpload = useCallback((kind: UploadKind) => {
    aborters.current[kind]?.abort();
    // The in-flight task observes the abort and flips the slot to cancelled.
  }, []);

  const retryUpload = useCallback(
    (kind: UploadKind) => {
      const file = pendingFiles.current[kind];
      if (file) void startUpload(kind, file);
    },
    [startUpload],
  );

  /**
   * Detach a document from the wizard slot. The backend exposes no detach
   * endpoint, so a superseded attachment stays stored server-side — the slot
   * (and therefore the submit gate) no longer counts it. Replacing uploads
   * a new file whose attachment supersedes the old one the same way.
   */
  const removeUpload = useCallback(
    (kind: UploadKind) => {
      aborters.current[kind]?.abort();
      pendingFiles.current[kind] = null;
      setSlots((prev) => ({...prev, [kind]: idleSlot()}));
      setDirty(true);
    },
    [],
  );

  /* ----- step navigation ----- */

  const goNext = useCallback(async () => {
    const currentStep = STEPS[stepIndex] as StepId;
    const err = validateStep(currentStep, {
      desiredStartDate: startDate,
      desiredEndDate: endDate,
      proposedTheme: theme,
      submittedOnline: true,
    }, confirm, {
      INTERNSHIP_APPLICATION: uploads.INTERNSHIP_APPLICATION,
      ASSIGNMENT_LETTER: uploads.ASSIGNMENT_LETTER,
      PROJECT_DEMO_IMAGE: uploads.PROJECT_DEMO_IMAGE,
    }, uploadingStates);

    if (err) {
      const key = err.replace('apply.', '');
      // key is a known apply.* message key; cast past next-intl's static keys
      // (validateStep returns only keys that exist under the `apply` namespace).
      setStepError((t as (k: string) => string)(key));
      return;
    }
    setStepError(null);

    // Persist the draft before advancing.
    try {
      await persistDraft();
    } catch {
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, [stepIndex, startDate, endDate, theme, confirm, uploads, uploadingStates, persistDraft, t]);

  const goBack = useCallback(() => {
    setStepError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!app) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Backend-data gate (B5 task 11): the backend submit transition does
      // not itself enforce mandatory documents, so re-read the authoritative
      // attachment list. Every mandatory kind must be attached in the wizard
      // AND present server-side; otherwise submission is blocked here.
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
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : t('loadErrorHint');
      setSubmitError(tError('submitError', {message: msg}));
    } finally {
      setSubmitting(false);
    }
  }, [app, t, tError, td, toast, uploads]);

  const startNew = useCallback(() => {
    setPhase('ready');
    setStepIndex(0);
  }, []);

  /* ----- render phases ----- */

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

  if (phase === 'anonymous') {
    return (
      <Card className="mx-auto max-w-md items-center text-center">
        <h2 className="text-lg font-bold text-navy-900 dark:text-zinc-50">{t('authRequiredTitle')}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{t('authRequiredBody')}</p>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Link href={{pathname: '/login', query: pathname ? {returnTo: pathname} : undefined}} className="flex-1">
            <Button variant="primary" size="md" className="w-full">
              {t('authSignIn')}
            </Button>
          </Link>
          <Link href="/register" className="flex-1">
            <Button variant="secondary" size="md" className="w-full">
              {t('authCreate')}
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (phase === 'start') {
    return (
      <Card className="mx-auto max-w-lg items-center text-center">
        <h2 className="text-lg font-bold text-navy-900 dark:text-zinc-50">{t('startTitle')}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{t('startBody')}</p>
        <div className="flex justify-center">
          <Button variant="primary" size="lg" onClick={startNew}>
            {t('startButton')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Stepper steps={STEP_DEFS} current={stepIndex} />

      {stepError && (
        <div role="alert" className="rounded-lg border border-accent-100 bg-accent-50/50 px-4 py-3 text-sm text-accent-700 dark:border-accent-800 dark:bg-accent-600/10 dark:text-accent-100">
          {stepError}
        </div>
      )}

      {stepIndex === 0 && (
        <WelcomeStep
          confirmed={confirm.eligibility}
          onChange={(v) => {
            setConfirm((p) => ({...p, eligibility: v}));
            setDirty(true);
          }}
          errorKey={stepError}
          onContinue={() => void goNext()}
        />
      )}

      {stepIndex === 1 && (
        <PersonalStep
          profile={profile}
          universities={universities}
          confirmed={confirm.personal}
          onChange={(v) => {
            setConfirm((p) => ({...p, personal: v}));
            setDirty(true);
          }}
          errorKey={stepError}
          onContinue={() => void goNext()}
        />
      )}

      {stepIndex === 2 && (
        <DatesStep
          startDate={startDate}
          endDate={endDate}
          classification={classification}
          confirmed={confirm.dates}
          onChange={(s, e) => {
            setStartDate(s);
            setEndDate(e);
            setConfirm((p) => ({...p, dates: false}));
            setDirty(true);
          }}
          onConfirm={(v) => {
            setConfirm((p) => ({...p, dates: v}));
            setDirty(true);
          }}
          errorKey={stepError}
          onContinue={() => void goNext()}
        />
      )}

      {stepIndex === 3 && (
        <InfoStep
          theme={theme}
          classificationType={classificationType}
          themeRequired={themeRequired}
          confirmed={confirm.info}
          onChange={(v) => {
            setTheme(v);
            setConfirm((p) => ({...p, info: false}));
            setDirty(true);
          }}
          onConfirm={(v) => {
            setConfirm((p) => ({...p, info: v}));
            setDirty(true);
          }}
          errorKey={stepError}
          onContinue={() => void goNext()}
        />
      )}

      {stepIndex === 4 && (
        <DocumentsStep
          application={slots.INTERNSHIP_APPLICATION}
          assignment={slots.ASSIGNMENT_LETTER}
          disabled={saving}
          onSelectFiles={(kind, files) => {
            if (files.length > 0) void startUpload(kind, files[0]);
          }}
          onCancel={(kind) => cancelUpload(kind)}
          onRetry={(kind) => retryUpload(kind)}
          onRemove={(kind) => removeUpload(kind)}
          errorKey={stepError}
          onContinue={() => void goNext()}
        />
      )}

      {stepIndex === 5 && (
        <DemoStep
          demo={slots.PROJECT_DEMO_IMAGE}
          disabled={saving}
          onSelectFiles={(kind, files) => {
            if (files.length > 0) void startUpload(kind, files[0]);
          }}
          onCancel={(kind) => cancelUpload(kind)}
          onRetry={(kind) => retryUpload(kind)}
          onRemove={(kind) => removeUpload(kind)}
          onContinue={() => void goNext()}
        />
      )}

      {stepIndex === 6 && (
        <ReviewStep
          profile={profile}
          universities={universities}
          startDate={startDate}
          endDate={endDate}
          classification={classification}
          theme={theme}
          applicationLetter={uploads.INTERNSHIP_APPLICATION}
          assignmentLetter={uploads.ASSIGNMENT_LETTER}
          demo={uploads.PROJECT_DEMO_IMAGE}
          onContinue={() => void goNext()}
        />
      )}

      {stepIndex === 7 && (
        <SubmitStep
          submitting={submitting}
          submittedReference={submittedReference}
          errorKey={submitError}
          onSubmit={() => void handleSubmit()}
        />
      )}

      <div className="flex items-center justify-between">
        {stepIndex > 0 && stepIndex < 7 && (
          <Button variant="secondary" size="md" onClick={goBack} disabled={saving}>
            {tnav('back')}
          </Button>
        )}
      </div>
    </div>
  );
}
