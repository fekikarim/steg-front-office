import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Badge} from '@/components/ui/Badge';
import {Button} from '@/components/ui/Button';
import {
  IconArrowRight,
  IconCheck,
  IconFileText,
  IconMessage,
  IconUser,
} from '@/components/ui/icons';
import type {ReactNode} from 'react';

type ComingSoonFeature = 'apply' | 'companion' | 'login';

const FEATURE_ICONS: Record<ComingSoonFeature, ReactNode> = {
  apply: <IconFileText className="h-6 w-6" />,
  companion: <IconMessage className="h-6 w-6" />,
  login: <IconUser className="h-6 w-6" />,
};

/**
 * Temporary informative route for features scheduled in later phases (B2/B3/B4).
 * Replaces a public 404 with a clear, localized explanation and safe CTAs.
 * The real pages replace these routes when their phase is implemented.
 */
export async function ComingSoon({feature}: {feature: ComingSoonFeature}) {
  const t = await getTranslations('comingSoon');
  const tf = await getTranslations(`comingSoon.${feature}`);

  const points = [
    tf('point1'),
    tf('point2'),
    tf('point3'),
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm sm:p-12 dark:border-zinc-800 dark:bg-navy-900 dark:shadow-none">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          {FEATURE_ICONS[feature]}
        </span>
        <Badge tone="info" className="gap-1.5">
          {t('common.eyebrow')}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-navy-900 dark:text-zinc-50">
          {tf('title')}
        </h1>
        <p className="max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
          {tf('intro')}
        </p>

        <div className="flex w-full flex-col gap-3 rounded-2xl bg-zinc-50 p-5 text-start dark:bg-navy-950">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
            {t('common.whatsComing')}
          </h2>
          <ul className="flex flex-col gap-2">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <IconCheck className="h-3 w-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="max-w-xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {t('common.note')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button>{t('common.backHome')}</Button>
          </Link>
          <Link href="/internships">
            <Button variant="secondary">
              {t('common.browseInternships')}
              <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="tertiary">{t('common.contact')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}