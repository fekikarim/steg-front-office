import {setRequestLocale} from 'next-intl/server';
import {ComingSoon} from '@/components/feedback/ComingSoon';
import type {AppLocale} from '@/i18n/routing';

export default async function CompanionPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale as AppLocale);
  return <ComingSoon feature="companion" />;
}