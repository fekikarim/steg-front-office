import {Link} from '@/i18n/navigation';
import {Card} from '@/components/ui/Card';
import {getTranslations} from 'next-intl/server';

export default async function AboutPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations('about');
  void locale; // Used by getTranslations

  return (
    <div className="mx-auto flex w-full max-w-2xl py-12 px-4 sm:px-6">
      <Card>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          {t('title')}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          {t('description')}
        </p>

        <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3">
          {t('purposeHeader')}
        </h3>
        <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-2">
          <li>{t('purpose1')}</li>
          <li>{t('purpose2')}</li>
          <li>{t('purpose3')}</li>
        </ul>

        <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3 mt-6">
          {t('applicationsHeader')}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          {t('applicationsDescription')}
        </p>

        <div className="mt-6">
          <Link href="/" className="text-primary underline">
            {t('backToHome')}
          </Link>
        </div>
      </Card>
    </div>
  );
}