import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Badge} from '@/components/ui/Badge';
import {Button} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';
import type {AppLocale} from '@/i18n/routing';

/**
 * B0 empty shell home (UI_UX §10.3 outline). Feature sections arrive with
 * phases B1–B3; this page proves locale rendering, theme, and brand.
 */
export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale as AppLocale);
  const t = await getTranslations('home');

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <section className="flex flex-col items-start gap-5">
        <Badge tone="brand">{t('badge')}</Badge>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl dark:text-zinc-50">
          {t('title')}
        </h1>
        <p className="max-w-xl text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-300">
          {t('subtitle')}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/apply">
            <Button variant="primary" size="lg">
              {t('ctaApply')}
            </Button>
          </Link>
          <Link href="/internships">
            <Button variant="secondary" size="lg">
              {t('ctaDiscover')}
            </Button>
          </Link>
        </div>
      </section>

      <Card title={t('shellNote')}>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          STEG — Société Tunisienne de l&apos;Électricité et du Gaz.
        </p>
      </Card>
    </div>
  );
}
