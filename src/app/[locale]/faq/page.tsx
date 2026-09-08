import {Link} from '@/i18n/navigation';
import {Card} from '@/components/ui/Card';
import {getTranslations} from 'next-intl/server';

export default async function FaqPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations('faq');
  void locale;

  return (
    <div className="mx-auto flex w-full max-w-2xl py-12 px-4 sm:px-6">
      <Card>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          {t('title')}
        </h2>

        <details>
          <div className="cursor-pointer select-none py-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {t('faqQuestion1')}
            </span>
          </div>
          <div className="pl-4 mt-1 text-zinc-600 dark:text-zinc-400">
            {t('faqAnswer1')}
          </div>
        </details>

        <details>
          <div className="cursor-pointer select-none py-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {t('faqQuestion2')}
            </span>
          </div>
          <div className="pl-4 mt-1 text-zinc-600 dark:text-zinc-400">
            {t('faqAnswer2')}
          </div>
        </details>

        <details>
          <div className="cursor-pointer select-none py-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {t('faqQuestion3')}
            </span>
          </div>
          <div className="pl-4 mt-1 text-zinc-600 dark:text-zinc-400">
            {t('faqAnswer3')}
          </div>
        </details>

        <details>
          <div className="cursor-pointer select-none py-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {t('faqQuestion4')}
            </span>
          </div>
          <div className="pl-4 mt-1 text-zinc-600 dark:text-zinc-400">
            {t('faqAnswer4')}
          </div>
        </details>

        <details>
          <div className="cursor-pointer select-none py-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {t('faqQuestion5')}
            </span>
          </div>
          <div className="pl-4 mt-1 text-zinc-600 dark:text-zinc-400">
            {t('faqAnswer5')}
          </div>
        </details>

        <details>
          <div className="cursor-pointer select-none py-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {t('faqQuestion6')}
            </span>
          </div>
          <div className="pl-4 mt-1 text-zinc-600 dark:text-zinc-400">
            {t('faqAnswer6')}
          </div>
        </details>

        <div className="mt-6">
          <Link href="/" className="text-primary underline">
            {t('backToHome')}
          </Link>
        </div>
      </Card>
    </div>
  );
}