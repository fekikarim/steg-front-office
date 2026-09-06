import Image from 'next/image';
import {getTranslations} from 'next-intl/server';

/** Institutional footer: brand, tagline, locales, rights (UI_UX §10.3). */
export async function Footer() {
  const t = await getTranslations('footer');
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-navy-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logo/logo-steg-1200x327.png"
            alt="STEG"
            width={110}
            height={30}
            className="h-8 w-auto"
          />
          <p className="max-w-sm text-xs text-zinc-500 dark:text-zinc-400">{t('tagline')}</p>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          © {year} STEG — {t('rights')}
        </p>
      </div>
    </footer>
  );
}
