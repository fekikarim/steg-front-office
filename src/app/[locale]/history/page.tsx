import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/Button';
import type {AppLocale} from '@/i18n/routing';

/**
 * History of the internship platform initiative (UI_UX §10.5). Content is
 * project/platform content only; the note redirects to the official STEG
 * website for institutional history so no official STEG facts are invented.
 */
export default async function HistoryPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale as AppLocale);
  const t = await getTranslations('history');

  const milestones = [
    {title: t('milestone1'), detail: t('milestone1Detail')},
    {title: t('milestone2'), detail: t('milestone2Detail')},
    {title: t('milestone3'), detail: t('milestone3Detail')},
    {title: t('milestone4'), detail: t('milestone4Detail')},
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-3">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
          {t('timelineHeader')}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl dark:text-zinc-50">
          {t('title')}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
          {t('description')}
        </p>
      </header>

      <ol className="relative flex flex-col gap-8 before:absolute before:start-[19px] before:top-1 before:bottom-1 before:w-px before:bg-zinc-200 sm:before:start-[23px] dark:before:bg-zinc-800">
        {milestones.map((milestone, i) => (
          <li key={milestone.title} className="relative flex items-start gap-5">
            <span
              className="relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-white text-sm font-bold text-brand-700 sm:h-12 sm:w-12 dark:border-brand-500/40 dark:bg-navy-900 dark:text-brand-300"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div className="flex flex-col gap-1 pt-1">
              <h2 className="text-lg font-bold text-navy-900 dark:text-zinc-50">
                {milestone.title}
              </h2>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {milestone.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <aside className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:bg-navy-900 dark:text-zinc-300">
        {t('historyNote')}
      </aside>

      <div>
        <Link href="/">
          <Button variant="secondary">{t('backToHome')}</Button>
        </Link>
      </div>
    </div>
  );
}