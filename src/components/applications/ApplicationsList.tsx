'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {ApiError} from '@/lib/api-client';
import type {ApplicationResponse} from '@/lib/api/application';
import {listApplications} from '@/lib/api/application-client';
import {Button} from '@/components/ui/Button';
import {CardSkeleton} from '@/components/feedback/Skeleton';
import {ErrorState} from '@/components/feedback/ErrorState';
import {EmptyState} from '@/components/feedback/EmptyState';
import {Card} from '@/components/ui/Card';
import {StatusPill} from '@/components/ui/Badge';
import {formatDateTime} from '@/lib/dates';

type Phase = 'loading' | 'anonymous' | 'empty' | 'ready' | 'error';

/**
 * Candidate's applications at `/[locale]/applications` (B6). Newest first;
 * compact cards on phones, an accessible data table on larger screens —
 * never a forced desktop table on mobile (UI_UX §5.3). Each row links to
 * the dossier detail page; per-document verification lives there.
 */
export function ApplicationsList() {
  const t = useTranslations('tracking');
  const ta = useTranslations('apply');
  const locale = useLocale();
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

  const sorted = useMemo(
    () => [...apps].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [apps],
  );

  /** Incremental reveal (same pattern as the notification center): the
   *  backend list endpoint is unpaginated, so long histories render in
   *  bounded chunks instead of one giant DOM (UI_UX §10.11, §12.12). */
  const PAGE_SIZE = 10;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = sorted.slice(0, visibleCount);

  if (phase === 'loading') {
    return <CardSkeleton />;
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

  if (phase === 'anonymous') {
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

  if (phase === 'empty') {
    return (
      <EmptyState
        title={t('emptyTitle')}
        hint={t('emptyHint')}
        action={
          <Link href="/apply">
            <Button variant="primary" size="md">
              {ta('startButton')}
            </Button>
          </Link>
        }
      />
    );
  }

  const dateRange = (app: ApplicationResponse) =>
    app.desiredStartDate && app.desiredEndDate
      ? `${app.desiredStartDate} → ${app.desiredEndDate}`
      : t('notProvided');

  return (
    <>
      {/* Mobile: stacked cards */}
      <ul className="flex flex-col gap-3 md:hidden">
        {visible.map((app) => (
          <li key={app.id}>
            <Card>
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/applications/${app.id}`}
                  className="font-mono text-sm font-semibold whitespace-nowrap text-brand-700 underline-offset-2 hover:underline dark:text-brand-300"
                  dir="ltr"
                >
                  {app.reference}
                </Link>
                <StatusPill code={app.status} />
              </div>
              <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-zinc-500 dark:text-zinc-400">{t('colType')}</dt>
                  <dd className="text-end font-medium text-zinc-800 dark:text-zinc-100">
                    {app.calculatedType ? <StatusPill code={app.calculatedType} /> : t('typeUnclassified')}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-zinc-500 dark:text-zinc-400">{t('colDates')}</dt>
                  <dd className="text-end font-medium text-zinc-800 dark:text-zinc-100" dir="ltr">
                    {dateRange(app)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-zinc-500 dark:text-zinc-400">{t('colUpdated')}</dt>
                  <dd className="text-end font-medium text-zinc-800 dark:text-zinc-100">
                    {formatDateTime(app.updatedAt, locale)}
                  </dd>
                </div>
              </dl>
              <div className="mt-3 flex justify-end">
                <Link
                  href={`/applications/${app.id}`}
                  className="text-sm font-semibold text-brand-700 underline-offset-2 hover:underline dark:text-brand-300"
                >
                  {t('open')}
                </Link>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {/* Larger screens: data table */}
      <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 md:block dark:border-zinc-800">
        <table className="w-full border-collapse bg-white text-left text-sm rtl:text-right dark:bg-navy-900">
          <caption className="sr-only">{t('title')}</caption>
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th scope="col" className="px-4 py-3 text-xs font-bold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                {t('colReference')}
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-bold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                {t('colType')}
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-bold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                {t('colDates')}
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-bold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                {t('colStatus')}
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-bold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                {t('colUpdated')}
              </th>
              <th scope="col" className="px-4 py-3 text-end text-xs font-bold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                <span className="sr-only">{t('colActions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((app) => (
              <tr
                key={app.id}
                className="border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-white/5"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/applications/${app.id}`}
                    className="font-mono text-[13px] font-semibold whitespace-nowrap text-brand-700 underline-offset-2 hover:underline dark:text-brand-300"
                    dir="ltr"
                  >
                    {app.reference}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {app.calculatedType ? <StatusPill code={app.calculatedType} /> : t('typeUnclassified')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-zinc-700 dark:text-zinc-200" dir="ltr">
                  {dateRange(app)}
                </td>
                <td className="px-4 py-3">
                  <StatusPill code={app.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-zinc-700 dark:text-zinc-200">
                  {formatDateTime(app.updatedAt, locale)}
                </td>
                <td className="px-4 py-3 text-end">
                  <Link
                    href={`/applications/${app.id}`}
                    className="text-[13px] font-semibold text-brand-700 underline-offset-2 hover:underline dark:text-brand-300"
                  >
                    {t('open')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visible.length < sorted.length && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" size="md" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            {t('showMore', {remaining: sorted.length - visible.length})}
          </Button>
        </div>
      )}
    </>
  );
}
