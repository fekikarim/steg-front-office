import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/Button';

/** Localized 404 (UI_UX §9.7, §14). */
export default async function NotFound() {
  const t = await getTranslations('states');
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center sm:px-6">
      <p aria-hidden="true" className="text-6xl font-bold text-zinc-200 dark:text-zinc-800">
        404
      </p>
      <h1 className="text-xl font-bold text-navy-900 dark:text-zinc-50">{t('notFoundTitle')}</h1>
      <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{t('notFoundHint')}</p>
      <Link href="/">
        <Button variant="primary">{t('notFoundAction')}</Button>
      </Link>
    </div>
  );
}
