'use client';

import {useCallback, useEffect, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {notFound} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import {ApiError} from '@/lib/api-client';
import type {
  ApplicationDocumentResponse,
  ApplicationResponse,
  WorkflowInstanceResponse,
} from '@/lib/api/application';
import {
  getApplication,
  getApplicationDocuments,
  getApplicationWorkflow,
  withdrawApplication,
} from '@/lib/api/application-client';
import {formatDate, formatDateTime} from '@/lib/dates';
import {formatBytes} from '@/lib/files';
import {useToast} from '@/components/ui/Toast';
import {Button} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';
import {StatusPill} from '@/components/ui/Badge';
import {Modal} from '@/components/ui/Modal';
import {FieldError} from '@/components/ui/FieldError';
import {CardSkeleton} from '@/components/feedback/Skeleton';
import {ErrorState} from '@/components/feedback/ErrorState';
import {cx} from '@/lib/cx';

type Phase = 'loading' | 'anonymous' | 'missing' | 'ready' | 'error';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Milestone {
  key: string;
  label: string;
  date: string | null;
  current: boolean;
}

/**
 * Truthful status timeline derived ONLY from backend timestamps. A milestone
 * renders only when its date exists; unknown future states are never shown.
 */
function buildTimeline(
  app: ApplicationResponse,
  t: (k: string) => string,
): Milestone[] {
  const items: Array<{key: string; label: string; date: string | null}> = [
    {key: 'created', label: t('timelineCreated'), date: app.createdAt},
  ];
  if (app.submissionDate) {
    items.push({key: 'submitted', label: t('timelineSubmitted'), date: app.submissionDate});
  }
  if (app.status === 'WITHDRAWN') {
    items.push({key: 'withdrawn', label: t('timelineWithdrawn'), date: app.updatedAt});
  } else if (app.status !== 'DRAFT' && app.status !== 'SUBMITTED') {
    items.push({key: 'current', label: t('timelineCurrent'), date: app.updatedAt});
  }
  return items
    .filter((m) => m.date)
    .map((m, i, arr) => ({...m, current: i === arr.length - 1}));
}

function docTypeLabel(
  type: string,
  td: (k: string) => string,
  tm: (k: string) => string,
): string {
  if (type === 'INTERNSHIP_APPLICATION') return td('applicationLetter');
  if (type === 'ASSIGNMENT_LETTER') return td('assignmentLetter');
  if (type === 'PROJECT_DEMO_IMAGE') return tm('projectDemo');
  return type;
}

/**
 * Candidate dossier detail at `/[locale]/applications/[id]` (B6). Dossier
 * header, truthful timeline, rejection/correction alerts, document checklist
 * with verification states and authorized downloads, and backend-gated
 * withdrawal with an explanatory confirmation dialog.
 */
export function ApplicationDetail({id}: {id: string}) {
  const t = useTranslations('tracking');
  const ta = useTranslations('apply');
  const td = useTranslations('apply.documents');
  const tm = useTranslations('apply.demo');
  const locale = useLocale();
  const toast = useToast();

  const [phase, setPhase] = useState<Phase>('loading');
  const [app, setApp] = useState<ApplicationResponse | null>(null);
  const [docs, setDocs] = useState<ApplicationDocumentResponse[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowInstanceResponse | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [actionError, setActionError] = useState<{message: string; traceId?: string | null} | null>(null);

  const validId = UUID_RE.test(id);

  const load = useCallback(async () => {
    // next/navigation notFound() only takes effect during render, so a
    // missing dossier flips to the `missing` phase here and the render
    // below raises the boundary (same HTTP 404, no data leaked either way).
    try {
      const detail = await getApplication(id);
      setApp(detail);
      const [documents, flow] = await Promise.all([
        getApplicationDocuments(id).catch(() => [] as ApplicationDocumentResponse[]),
        getApplicationWorkflow(id).catch((err: unknown) => {
          // No workflow instance before submit (404) → timestamps-only timeline.
          if (err instanceof ApiError && err.status === 404) return null;
          throw err;
        }),
      ]);
      setDocs(documents);
      setWorkflow(flow);
      setPhase('ready');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setPhase('anonymous');
        return;
      }
      if (err instanceof ApiError && err.status === 404) {
        setPhase('missing');
        return;
      }
      if (err instanceof ApiError) setTraceId(err.traceId ?? null);
      setPhase('error');
    }
  }, [id]);

  useEffect(() => {
    // async bootstrap on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function handleWithdraw() {
    if (!app) return;
    setWithdrawing(true);
    setActionError(null);
    try {
      await withdrawApplication(app.id);
      setConfirmOpen(false);
      toast.notify({title: t('withdrawSuccess'), tone: 'success'});
      await load();
    } catch (err) {
      // Backend owns eligibility: a lost race (e.g. just ACCEPTED) lands here;
      // reload so the UI reflects the authoritative state either way.
      setConfirmOpen(false);
      setActionError({
        message: err instanceof ApiError ? err.message : t('withdrawError'),
        traceId: err instanceof ApiError ? (err.traceId ?? null) : null,
      });
      await load();
    } finally {
      setWithdrawing(false);
    }
  }

  if (!validId || phase === 'missing') notFound();

  if (phase === 'loading') {
    return (
      <div className="flex flex-col gap-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <ErrorState
        title={ta('loadErrorTitle')}
        hint={ta('loadErrorHint')}
        traceId={traceId}
        onRetry={() => {
          setPhase('loading');
          void load();
        }}
      />
    );
  }

  if (phase === 'anonymous' || !app) {
    return (
      <Card className="mx-auto max-w-md items-center text-center">
        <h2 className="text-lg font-bold text-navy-900 dark:text-zinc-50">{ta('authRequiredTitle')}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{ta('authRequiredBody')}</p>
        <div className="flex w-full justify-center">
          <Link href="/login">
            <Button variant="primary" size="md">
              {ta('authSignIn')}
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  const canWithdraw = app.status !== 'ACCEPTED' && app.status !== 'WITHDRAWN';
  const milestones = buildTimeline(app, t as (k: string) => string);
  const statusHelp = (t as (k: string) => string)(`statusHelp.${app.status}`);

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/applications"
        className="text-sm font-semibold text-brand-700 underline-offset-2 hover:underline dark:text-brand-300"
      >
        <span aria-hidden="true" className="inline-block rtl:rotate-180">
          ←
        </span>{' '}
        {t('backToList')}
      </Link>

      {/* Dossier header */}
      <Card
        title={
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono" dir="ltr">
              {t('detailTitle', {reference: app.reference})}
            </span>
            <StatusPill code={app.status} />
          </span>
        }
      >
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {app.calculatedType && <StatusPill code={app.calculatedType} />}
          {app.requirement && <StatusPill code={app.requirement} />}
          {!app.calculatedType && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{t('typeUnclassified')}</span>
          )}
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300" dir="auto">
          {statusHelp}
        </p>
        {workflow?.currentStepName && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400" dir="auto">
            {t('currentStep', {step: workflow.currentStepName})}
          </p>
        )}
      </Card>

      {actionError && (
        <div
          role="alert"
          className="rounded-lg border border-accent-200 bg-accent-50/60 px-4 py-3 text-sm text-accent-800 dark:border-accent-800 dark:bg-accent-600/10 dark:text-accent-100"
        >
          <FieldError message={actionError.message} />
          {actionError.traceId && (
            <p className="mt-1 font-mono text-xs opacity-80" dir="ltr">
              traceId: {actionError.traceId}
            </p>
          )}
        </div>
      )}

      {/* Rejection / correction alerts */}
      {app.status === 'REJECTED' && app.rejectionReason && (
        <div
          role="alert"
          className="rounded-xl border border-accent-200 bg-accent-50/60 p-4 dark:border-accent-800 dark:bg-accent-600/10"
        >
          <h2 className="text-sm font-bold text-accent-800 dark:text-accent-100">{t('rejectedTitle')}</h2>
          <p className="mt-1 text-sm text-accent-700 dark:text-accent-100" dir="auto">
            {app.rejectionReason}
          </p>
        </div>
      )}
      {app.status === 'NEEDS_CORRECTION' && app.correctionComment && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10"
        >
          <h2 className="text-sm font-bold text-amber-800 dark:text-amber-200">{t('correctionTitle')}</h2>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-100" dir="auto">
            {app.correctionComment}
          </p>
        </div>
      )}

      {/* Overview */}
      <Card title={t('sectionOverview')}>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-zinc-100 py-2 dark:border-zinc-800">
            <dt className="text-zinc-500 dark:text-zinc-400">{t('fieldDates')}</dt>
            <dd className="text-end font-medium text-zinc-800 dark:text-zinc-100" dir="ltr">
              {app.desiredStartDate && app.desiredEndDate
                ? `${app.desiredStartDate} → ${app.desiredEndDate}`
                : t('notProvided')}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-zinc-100 py-2 dark:border-zinc-800">
            <dt className="text-zinc-500 dark:text-zinc-400">{t('fieldTheme')}</dt>
            <dd className="text-end font-medium break-words text-zinc-800 dark:text-zinc-100" dir="auto">
              {app.proposedTheme?.trim() ? app.proposedTheme : t('notProvided')}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-zinc-100 py-2 dark:border-zinc-800">
            <dt className="text-zinc-500 dark:text-zinc-400">{t('fieldSubmitted')}</dt>
            <dd className="text-end font-medium text-zinc-800 dark:text-zinc-100">
              {app.submissionDate ? formatDate(app.submissionDate, locale) : t('notProvided')}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-zinc-100 py-2 dark:border-zinc-800">
            <dt className="text-zinc-500 dark:text-zinc-400">{t('fieldUpdated')}</dt>
            <dd className="text-end font-medium text-zinc-800 dark:text-zinc-100">
              {formatDateTime(app.updatedAt, locale)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-zinc-100 py-2 dark:border-zinc-800">
            <dt className="text-zinc-500 dark:text-zinc-400">{t('fieldCreated')}</dt>
            <dd className="text-end font-medium text-zinc-800 dark:text-zinc-100">
              {formatDateTime(app.createdAt, locale)}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Timeline */}
      <Card title={t('sectionTimeline')}>
        <ol className="flex flex-col gap-0">
          {milestones.map((m, i) => (
            <li key={m.key} className="relative flex gap-3 pb-5 last:pb-0">
              {i < milestones.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-6 bottom-0 start-[11px] w-0.5 bg-zinc-200 dark:bg-zinc-700"
                />
              )}
              <span
                aria-hidden="true"
                className={cx(
                  'z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  m.current
                    ? 'border-2 border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300'
                    : 'bg-brand-600 text-white dark:bg-brand-500',
                )}
              >
                {!m.current && (
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <div className="flex flex-col pt-0.5">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {m.label}
                  {m.current && (
                    <span className="ms-2">
                      <StatusPill code={app.status} />
                    </span>
                  )}
                </p>
                {m.date && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    <time dateTime={m.date}>{formatDateTime(m.date, locale)}</time>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {/* Documents */}
      <Card title={t('sectionDocuments')}>
        {docs.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('emptyDocs')}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {docs.map((d) => (
              <li
                key={d.id}
                className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-zinc-700"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-medium text-zinc-800 dark:text-zinc-100" dir="auto">
                    {d.document.originalFileName}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {docTypeLabel(d.document.type, td as (k: string) => string, tm as (k: string) => string)} ·{' '}
                    <span dir="ltr">
                      {d.document.mimeType} ·{' '}
                      {formatBytes(d.document.sizeBytes, {
                        b: td('unitB'),
                        kb: td('unitKB'),
                        mb: td('unitMB'),
                      })}
                    </span>{' '}
                    · {td('uploadedOn', {date: formatDate(d.document.uploadedAt, locale)})}
                  </span>
                  <span>
                    <StatusPill code={d.verificationStatus} />
                  </span>
                  {(d.verificationStatus === 'REJECTED' || d.verificationStatus === 'REQUIRES_CORRECTION') &&
                    d.verificationComment && (
                      <span className="text-xs text-amber-700 dark:text-amber-300" dir="auto">
                        <span className="font-semibold">{td('verificationCommentLabel')}: </span>
                        {d.verificationComment}
                      </span>
                    )}
                </div>
                <a
                  href={`/api/documents/${d.document.id}/download`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-[13px] font-semibold text-navy-900 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-white/5"
                  aria-label={t('docDownload', {name: d.document.originalFileName})}
                >
                  <span aria-hidden="true">⬇</span>
                  {t('docDownload', {name: ''}).trim()}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {app.status === 'DRAFT' && (
          <Link href="/apply">
            <Button variant="primary" size="md">
              {t('continueApplication')}
            </Button>
          </Link>
        )}
        {canWithdraw ? (
          <div>
            <Button variant="secondary" size="md" onClick={() => setConfirmOpen(true)}>
              {t('withdraw')}
            </Button>
          </div>
        ) : (
          app.status === 'ACCEPTED' && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('withdrawClosedNote')}</p>
          )
        )}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!withdrawing) setConfirmOpen(false);
        }}
        title={t('withdrawDialogTitle')}
        description={t('withdrawDialogBody')}
        closeLabel={t('withdrawCancel')}
        size="sm"
        footer={
          <>
            <Button variant="tertiary" size="md" onClick={() => setConfirmOpen(false)} disabled={withdrawing}>
              {t('withdrawCancel')}
            </Button>
            <Button variant="destructive" size="md" onClick={() => void handleWithdraw()} disabled={withdrawing}>
              {withdrawing ? '…' : t('withdrawConfirm')}
            </Button>
          </>
        }
      >
        <p className="font-mono text-sm font-semibold text-navy-900 dark:text-zinc-50" dir="ltr">
          {app.reference}
        </p>
      </Modal>
    </div>
  );
}
