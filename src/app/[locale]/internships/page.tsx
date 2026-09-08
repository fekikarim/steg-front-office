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
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          {t('title')}
        </h2>

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
          <Link href={t('applyPath')} className="text-primary underline">
            {t('ctaApply')}
          </Link>
          <span className="ml-2 rtl:rotate-180">
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      </Card>
    </div>
  );
}