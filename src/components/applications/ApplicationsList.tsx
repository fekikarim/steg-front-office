'use client';

import {useCallback, useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {ApiError} from '@/lib/api-client';
import type {ApplicationDocumentResponse, ApplicationResponse} from '@/lib/api/application';
import {getApplicationDocuments, listApplications} from '@/lib/api/application-client';
import {Button} from '@/components/ui/Button';
import {CardSkeleton} from '@/components/feedback/Skeleton';
import {ErrorState} from '@/components/feedback/ErrorState';
import {EmptyState} from '@/components/feedback/EmptyState';
import {Card} from '@/components/ui/Card';
import {Badge, StatusPill} from '@/components/ui/Badge';

type Phase = 'loading' | 'anonymous' | 'empty' | 'ready' | 'error';

/**
 * Candidate's list of applications at `/[locale]/applications`. Reads from the
 * authenticated `/api/applications` proxy; shows reference, status and dates.
 */
export function ApplicationsList() {
  const t = useTranslations('apply');
  const [phase, setPhase] = useState<Phase>('loading');
  const [apps, setApps] = useState<ApplicationResponse[]>([]);
  const [traceId, setTraceId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await listApplications();
      setApps(list);
      setPhase(list.length === 0 ? 'empty' : 'ready');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setPhase('anonymous');
        return;
      }
      if (err instanceof ApiError) setTraceId(err.traceId ?? null);
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    // async bootstrap on mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (phase === 'loading') {
    return <CardSkeleton />;
  }

  if (phase === 'error') {
    return (
      <ErrorState
        title={t('loadErrorTitle')}
        hint={t('loadErrorHint')}
        traceId={traceId}
        onRetry={() => {
          setPhase('loading');
          void load();
        }}
      />
    );
  }

  if (phase === 'anonymous') {
    return (
      <Card className="mx-auto max-w-md items-center text-center">
        <h2 className="text-lg font-bold text-navy-900 dark:text-zinc-50">{t('authRequiredTitle')}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{t('authRequiredBody')}</p>
        <div className="flex w-full justify-center">
          <Link href="/login">
            <Button variant="primary" size="md">
              {t('authSignIn')}
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (phase === 'empty') {
    return (
      <EmptyState
        title={t('emptyTitle')}
        hint={t('openEmptyHint')}
        action={
          <Link href="/apply">
            <Button variant="primary" size="md">
              {t('startButton')}
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {apps.map((app) => (
        <li key={app.id}>
          <ApplicationCard app={app} />
        </li>
      ))}
    </ul>
  );
}

/**
 * One application row with its dossier verification summary (B5). Documents
 * are fetched lazily per application — the list stays fast while each card
 * shows required-vs-optional verification states when the backend exposes
 * them. Only safe metadata is rendered (file name + verification); never
 * storage keys, paths, checksums or reviewer identities.
 */
function ApplicationCard({app}: {app: ApplicationResponse}) {
  const t = useTranslations('apply');
  const td = useTranslations('apply.documents');
  const [docs, setDocs] = useState<ApplicationDocumentResponse[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getApplicationDocuments(app.id)
      .then((list) => {
        if (!cancelled) setDocs(list);
      })
      .catch(() => {
        if (!cancelled) setDocs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [app.id]);

  function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString();
  }

  const required = (docs ?? []).filter((d) => d.mandatory);
  const flagged = (docs ?? []).filter(
    (d) => d.verificationStatus === 'REJECTED' || d.verificationStatus === 'REQUIRES_CORRECTION',
  );

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-sm font-semibold text-navy-900 dark:text-zinc-50" dir="ltr">
            {app.reference}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t('createdLabel')} {formatDate(app.createdAt)}
            {app.desiredStartDate && app.desiredEndDate && (
              <span className="ms-2">
                {app.desiredStartDate} → {app.desiredEndDate}
              </span>
            )}
          </p>
        </div>
        <StatusPill code={app.status} />
      </div>
      {docs !== null && docs.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {t('review.sectionDocuments')}
          </p>
          <ul className="flex flex-col gap-1.5">
            {required.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-zinc-700 dark:text-zinc-200" dir="auto">
                  {d.document.originalFileName}
                </span>
                <StatusPill code={d.verificationStatus} />
              </li>
            ))}
          </ul>
          {flagged.length > 0 && (
            <p role="note" className="text-xs text-amber-700 dark:text-amber-300">
              <span className="font-semibold">{td('verificationCommentLabel')}: </span>
              <span dir="auto">
                {flagged
                  .map((d) => d.verificationComment)
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </p>
          )}
          {docs.length === 0 && <Badge tone="neutral">{td('missingRequired')}</Badge>}
        </div>
      )}
    </Card>
  );
}
