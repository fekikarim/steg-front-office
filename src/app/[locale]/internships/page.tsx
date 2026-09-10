import {Link} from '@/i18n/navigation';
import {Card} from '@/components/ui/Card';
import {getTranslations} from 'next-intl/server';

export default async function InternshipsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations('internships');
  void locale;

  return (
    <div className="mx-auto flex w-full max-w-2xl py-12 px-4 sm:px-6">
      <Card>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          {t('title')}
        </h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {t('typeObservation')}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t('typeObservationDesc')}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {t('typePerfectionnement')}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t('typePerfectionnementDesc')}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {t('typePFE')}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t('typePFEDesc')}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href={t('applyPath')}
            className="inline-flex items-center gap-2 whitespace-nowrap text-primary underline underline-offset-2"
          >
            {t('ctaApply')}
            <svg
              aria-hidden="true"
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="currentColor"
              className="shrink-0 rtl:rotate-180"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </Card>
    </div>
  );
}