'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/Button';
import {StatusPill, Badge} from '@/components/ui/Badge';
import {Card} from '@/components/ui/Card';
import type {ApplicationResponse} from '@/lib/api/application';
import {IconArrowRight, IconCheckSquare} from '@/components/ui/icons';

interface ActiveSituationBannerProps {
  application: ApplicationResponse | null;
}

export function ActiveSituationBanner({application}: ActiveSituationBannerProps) {
  const t = useTranslations('profile');

  if (!application) {
    return (
      <Card className="border-dashed border-zinc-300 bg-zinc-50/60 p-6 dark:border-zinc-700 dark:bg-navy-900/40">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
              ⚡
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900 dark:text-zinc-50">
                {t('noActiveAppTitle')}
              </h2>
              <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                {t('noActiveAppDesc')}
              </p>
            </div>
          </div>
          <Link href="/apply">
            <Button variant="primary" size="sm" className="whitespace-nowrap">
              {t('noActiveAppCta')}
              <IconArrowRight className="ms-1.5 h-3.5 w-3.5 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  const isAccepted = application.status === 'ACCEPTED';
  const hasSupervisor = Boolean(application.reviewerId);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50/90 via-white to-sky-50/50 p-6 shadow-sm dark:border-brand-800 dark:bg-gradient-to-br dark:from-brand-950/40 dark:via-navy-900 dark:to-sky-950/20">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        {/* Left info column */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand" className="font-semibold uppercase tracking-wider text-[11px]">
              {t('activeSituationTitle')}
            </Badge>
            <StatusPill code={application.status} />
            {isAccepted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <IconCheckSquare className="h-3 w-3" />
                Affectation Validée
              </span>
            )}
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t('activeAppRef')}:
              </span>
              <span className="font-mono text-base font-bold text-navy-900 dark:text-zinc-100">
                #{application.reference}
              </span>
            </div>

            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
              {t('activeSituationLead')}
            </p>
          </div>

          {/* Key metadata grid */}
          <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Internship Type */}
            <div className="rounded-xl border border-white/80 bg-white/70 p-3 shadow-xs dark:border-zinc-800 dark:bg-navy-900/60">
              <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {t('activeAppType')}
              </span>
              <span className="mt-0.5 block text-xs font-bold text-navy-900 dark:text-zinc-100">
                {application.calculatedType ?? 'Stage STEG'}
              </span>
            </div>

            {/* Dates */}
            <div className="rounded-xl border border-white/80 bg-white/70 p-3 shadow-xs dark:border-zinc-800 dark:bg-navy-900/60">
              <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {t('activeAppDates')}
              </span>
              <span className="mt-0.5 block text-xs font-bold text-navy-900 dark:text-zinc-100">
                {application.desiredStartDate && application.desiredEndDate
                  ? `${application.desiredStartDate} → ${application.desiredEndDate}`
                  : 'Dates en cours de confirmation'}
              </span>
            </div>

            {/* Supervisor */}
            <div className="rounded-xl border border-white/80 bg-white/70 p-3 shadow-xs dark:border-zinc-800 dark:bg-navy-900/60">
              <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {t('activeAppSupervisor')}
              </span>
              <span className="mt-0.5 block text-xs font-bold text-navy-900 dark:text-zinc-100">
                {hasSupervisor ? 'Ingénieur Tuteur STEG' : t('activeAppSupervisorNone')}
              </span>
            </div>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
          <Link href={`/applications/${application.id}`}>
            <Button variant="primary" size="md" className="shadow-sm">
              <span>{t('activeAppTrackBtn')}</span>
              <IconArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Dernière mise à jour : {new Date(application.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
