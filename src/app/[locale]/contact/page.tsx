import {Link} from '@/i18n/navigation';
import {Card} from '@/components/ui/Card';
import {getTranslations} from 'next-intl/server';

export default async function ContactPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations('contact');
  void locale;

  return (
    <div className="mx-auto flex w-full max-w-2xl py-12 px-4 sm:px-6">
      <Card>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          {t('title')}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          {t('description')}
        </p>

        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          <dt className="font-medium text-zinc-900 dark:text-zinc-100">
            {t('contactEmailLabel')}
          </dt>
          <dd className="text-zinc-600 dark:text-zinc-400">
            {t('contactEmail')}
          </dd>

          <dt className="font-medium text-zinc-900 dark:text-zinc-100">
            {t('contactPhoneLabel')}
          </dt>
          <dd className="text-zinc-600 dark:text-zinc-400">
            {t('contactPhone')}
          </dd>

          <dt className="font-medium text-zinc-900 dark:text-zinc-100">
            {t('contactAddressLabel')}
          </dt>
          <dd className="text-zinc-600 dark:text-zinc-400">
            {t('contactAddress')}
          </dd>
        </dl>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t('disclaimer')}
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