'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useParams} from 'next/navigation';
import {routing, type AppLocale} from '@/i18n/routing';
import {useRouter, usePathname} from '@/i18n/navigation';
import {Select} from '@/components/ui/Select';

const LOCALE_LABELS: Record<AppLocale, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
};

/** Language selector persisted via the locale-prefixed URL (UI_UX §8). */
export function LangSwitcher() {
  const t = useTranslations('header');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <Select
      hideLabel
      label={t('language')}
      aria-label={t('language')}
      value={locale}
      onChange={(e) => {
        const next = e.target.value as AppLocale;
        // @ts-expect-error next-intl types pathname params loosely here
        router.replace({pathname, params}, {locale: next});
      }}
      options={routing.locales.map((l) => ({value: l, label: LOCALE_LABELS[l]}))}
      wrapperClassName="w-auto"
      className="!h-9 cursor-pointer pe-8 text-[13px]"
    />
  );
}
