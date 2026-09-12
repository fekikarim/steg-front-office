import Image from 'next/image';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Badge} from '@/components/ui/Badge';
import {Button} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';
import {
  IconArrowRight,
  IconBuilding,
  IconSparkles,
  IconTrendingUp,
  IconCheckSquare,
} from '@/components/ui/icons';
import type {AppLocale} from '@/i18n/routing';

/**
 * Rebuilt STEG History Page (Phase B7):
 * - Foundation on April 3, 1962 (Law 62-8), consolidating 7 concessionary companies
 * - 61-year historical statistics evolution (1962 → 2023)
 * - Three strategic business pillars (Generation, Transmission, Distribution)
 * - Green energy transition & renewables
 * - Trilingual Organizational Chart (Organigramme) matching the active locale
 */
export default async function HistoryPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale as AppLocale);
  const t = await getTranslations('history');

  const stats = [
    {label: t('stat1Label'), detail: t('stat1Detail'), value: '99.8%'},
    {label: t('stat2Label'), detail: t('stat2Detail'), value: '99.5%'},
    {label: t('stat3Label'), detail: t('stat3Detail'), value: '5 982 MW'},
    {label: t('stat4Label'), detail: t('stat4Detail'), value: '19 313 GWh'},
    {label: t('stat5Label'), detail: t('stat5Detail'), value: '4.49 M'},
    {label: t('stat6Label'), detail: t('stat6Detail'), value: '1.04 M'},
  ];

  const missions = [
    {
      title: t('mission1Title'),
      desc: t('mission1Desc'),
      icon: <IconTrendingUp className="h-6 w-6 text-brand-600 dark:text-brand-300" />,
    },
    {
      title: t('mission2Title'),
      desc: t('mission2Desc'),
      icon: <IconBuilding className="h-6 w-6 text-brand-600 dark:text-brand-300" />,
    },
    {
      title: t('mission3Title'),
      desc: t('mission3Desc'),
      icon: <IconCheckSquare className="h-6 w-6 text-brand-600 dark:text-brand-300" />,
    },
  ];

  // Pick the localized organigramme
  const organigrammeSrc =
    locale === 'ar'
      ? '/components/history/organizational-chart/org_ar_1024x1536.png'
      : locale === 'en'
        ? '/components/history/organizational-chart/org_eng_1024x1536.png'
        : '/components/history/organizational-chart/org_fr_1024x1536.png';

  return (
    <div className="flex w-full flex-col">
      {/* ------------------------------------------------------------------ */}
      {/*  HEADER BANNER                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-brand-50/70 via-white to-white py-14 sm:py-20 dark:border-zinc-800/80 dark:from-navy-900/60 dark:via-navy-950 dark:to-navy-950">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center sm:px-6">
          <Badge tone="brand" className="gap-1.5 px-3 py-1">
            <IconSparkles className="h-3.5 w-3.5" />
            {t('badge')}
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl lg:text-5xl dark:text-zinc-50">
            {t('title')}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-300">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  SECTION 1: THE FOUNDATION OF STEG (1962)                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <Badge tone="info" className="w-fit">Loi N°62-8 du 3 Avril 1962</Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl dark:text-zinc-50">
              {t('foundationTitle')}
            </h2>
            <div className="flex flex-col gap-3 text-sm leading-relaxed text-zinc-700 sm:text-base dark:text-zinc-300">
              <p>{t('foundationP1')}</p>
              <p>{t('foundationP2')}</p>
              <p>{t('foundationP3')}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-lg lg:col-span-5 dark:border-zinc-800 dark:bg-navy-900">
            <div className="flex items-center gap-4">
              <Image
                src="/components/history/Engineer_working_with_wind_turbines_producing_green_energy_225x150.svg"
                alt="Transition énergétique STEG"
                width={120}
                height={80}
                className="h-20 w-auto shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-navy-900 dark:text-zinc-100">
                  Énergies Renouvelables
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  Développement soutenu des parcs éoliens et des fermes photovoltaïques.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <Image
                src="/components/history/Geothermal_energy_renewable_sources_illustration_225x150.svg"
                alt="Sources géothermiques"
                width={120}
                height={80}
                className="h-20 w-auto shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-navy-900 dark:text-zinc-100">
                  Géothermie & Innovation
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  Recherche avancée et gestion efficiente des ressources gazières et thermiques.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  SECTION 2: 61 YEARS OF EVOLUTION (1962 -> 2023)                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-zinc-200/80 bg-zinc-50/70 py-16 sm:py-20 dark:border-zinc-800/80 dark:bg-navy-900/50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6">
          <div className="flex flex-col items-start gap-2">
            <Badge tone="brand" className="w-fit">Indicateurs Historiques Clés</Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl dark:text-zinc-50">
              {t('statsTitle')}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
              {t('statsLead')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((s) => (
              <Card key={s.label} className="hover-lift border-zinc-200 bg-white dark:border-zinc-800 dark:bg-navy-900">
                <div className="flex flex-col gap-2">
                  <span className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
                    {s.value}
                  </span>
                  <h3 className="text-sm font-bold text-navy-900 dark:text-zinc-100">{s.label}</h3>
                  <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{s.detail}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  SECTION 3: MISSIONS & CORE ACTIVITIES                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-col items-start gap-2">
          <Badge tone="info" className="w-fit">Missions d&apos;Intérêt Général</Badge>
          <h2 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl dark:text-zinc-50">
            {t('missionsTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {missions.map((m) => (
            <Card key={m.title} className="hover-lift">
              <div className="flex flex-col gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-navy-800">
                  {m.icon}
                </span>
                <h3 className="text-base font-bold text-navy-900 dark:text-zinc-50">{m.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{m.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  SECTION 4: ORGANIZATIONAL CHART (ORGANIGRAMME)                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-zinc-200/80 bg-zinc-50/60 py-16 sm:py-20 dark:border-zinc-800/80 dark:bg-navy-900/50">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-6">
          <div className="flex flex-col items-start gap-2">
            <Badge tone="brand" className="w-fit">Gouvernance</Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl dark:text-zinc-50">
              {t('organigrammeTitle')}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
              {t('organigrammeDesc')}
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-navy-900">
            <div className="relative aspect-[3/4] w-full max-w-2xl mx-auto overflow-hidden rounded-2xl bg-zinc-50 dark:bg-navy-950">
              <Image
                src={organigrammeSrc}
                alt={t('organigrammeCaption')}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
            <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {t('organigrammeCaption')}
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <Link href="/apply">
              <Button size="lg" className="hover-lift shadow-md">
                Rejoindre la STEG pour un stage
                <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}