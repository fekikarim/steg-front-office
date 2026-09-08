import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Badge} from '@/components/ui/Badge';
import {Button} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';
import {
  IconArrowRight,
  IconBell,
  IconBook,
  IconBuilding,
  IconCheckSquare,
  IconClipboardList,
  IconEye,
  IconFileText,
  IconFolder,
  IconGraduationCap,
  IconLayers,
  IconLayoutGrid,
  IconMessage,
  IconRocket,
  IconSearch,
  IconSparkles,
  IconTrendingUp,
  IconUpload,
  IconUser,
  IconWrench,
} from '@/components/ui/icons';
import type {ReactNode} from 'react';
import type {AppLocale} from '@/i18n/routing';

/**
 * Public home page (UI_UX §10.3): hero, internship types, application journey,
 * platform value proposition, Companion preview, About preview and final CTA.
 * All copy is localized; nothing is invented beyond approved platform content.
 */
export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale as AppLocale);
  const t = await getTranslations('home');

  const types: Array<{title: string; duration: string; desc: string; icon: ReactNode}> = [
    {
      title: t('obsTitle'),
      duration: t('obsDuration'),
      desc: t('obsDesc'),
      icon: <IconEye className="h-5 w-5" />,
    },
    {
      title: t('perfTitle'),
      duration: t('perfDuration'),
      desc: t('perfDesc'),
      icon: <IconWrench className="h-5 w-5" />,
    },
    {
      title: t('pfeTitle'),
      duration: t('pfeDuration'),
      desc: t('pfeDesc'),
      icon: <IconGraduationCap className="h-5 w-5" />,
    },
  ];

  const steps: Array<{title: string; desc: string; icon: ReactNode}> = [
    {title: t('step1Title'), desc: t('step1Desc'), icon: <IconUser className="h-5 w-5" />},
    {title: t('step2Title'), desc: t('step2Desc'), icon: <IconFileText className="h-5 w-5" />},
    {title: t('step3Title'), desc: t('step3Desc'), icon: <IconUpload className="h-5 w-5" />},
    {title: t('step4Title'), desc: t('step4Desc'), icon: <IconSearch className="h-5 w-5" />},
    {title: t('step5Title'), desc: t('step5Desc'), icon: <IconRocket className="h-5 w-5" />},
  ];

  const benefits: Array<{title: string; desc: string; icon: ReactNode}> = [
    {title: t('why1Title'), desc: t('why1Desc'), icon: <IconLayoutGrid className="h-5 w-5" />},
    {title: t('why2Title'), desc: t('why2Desc'), icon: <IconClipboardList className="h-5 w-5" />},
    {title: t('why3Title'), desc: t('why3Desc'), icon: <IconBell className="h-5 w-5" />},
    {title: t('why4Title'), desc: t('why4Desc'), icon: <IconFolder className="h-5 w-5" />},
  ];

  const companionPoints: Array<{label: string; icon: ReactNode}> = [
    {label: t('compPoint1'), icon: <IconTrendingUp className="h-5 w-5" />},
    {label: t('compPoint2'), icon: <IconCheckSquare className="h-5 w-5" />},
    {label: t('compPoint3'), icon: <IconBook className="h-5 w-5" />},
    {label: t('compPoint4'), icon: <IconMessage className="h-5 w-5" />},
    {label: t('compPoint5'), icon: <IconLayers className="h-5 w-5" />},
  ];

  return (
    <div className="flex w-full flex-col">
      {/* Hero (UI_UX §10.3.1) */}
      <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-brand-50 via-white to-white dark:border-zinc-800 dark:from-navy-900 dark:via-navy-950 dark:to-navy-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 end-[-6rem] hidden h-80 w-80 rounded-full bg-brand-100/60 blur-3xl lg:block dark:bg-brand-500/10"
        />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <Badge tone="brand" className="gap-1.5">
            <IconSparkles className="h-3.5 w-3.5" />
            {t('badge')}
          </Badge>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl lg:text-6xl dark:text-zinc-50">
            {t('title')}
          </h1>
          <p className="max-w-xl text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-300">
            {t('subtitle')}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/apply">
              <Button size="lg">
                {t('ctaApply')}
                <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
            <Link href="/internships">
              <Button variant="secondary" size="lg">
                {t('ctaDiscover')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Internship types overview (UI_UX §10.3.2) */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:py-20">
        <header className="flex flex-col items-start gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
            {t('typesEyebrow')}
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl dark:text-zinc-50">
            {t('typesTitle')}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base dark:text-zinc-300">
            {t('typesLead')}
          </p>
        </header>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {types.map(({title, duration, desc, icon}, i) => (
            <Card key={title} className="group transition-shadow hover:shadow-md dark:hover:shadow-none">
              <div className="flex flex-col gap-4">
                <span
                  className={
                    i === 0
                      ? 'inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                      : i === 2
                        ? 'inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-white dark:bg-navy-700'
                        : 'inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100/70 text-brand-700 dark:bg-white/10 dark:text-brand-200'
                  }
                >
                  {icon}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-lg font-bold text-navy-900 dark:text-zinc-50">{title}</h3>
                  <Badge tone="info" className="w-fit">
                    {duration}
                  </Badge>
                  <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{desc}</p>
                </div>
                <Link
                  href="/internships"
                  className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
                >
                  {t('typesCta')}
                  <IconArrowRight className="ms-1 inline h-3.5 w-3.5 rtl:rotate-180" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works (UI_UX §10.3.3) */}
      <section className="border-y border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-navy-900">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:py-20">
          <header className="flex flex-col items-start gap-3">
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
              {t('howEyebrow')}
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl dark:text-zinc-50">
              {t('howTitle')}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base dark:text-zinc-300">
              {t('howLead')}
            </p>
          </header>
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map(({title, desc, icon}, i) => (
              <li
                key={title}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-navy-950"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                    {icon}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-2xl font-bold text-zinc-200 dark:text-zinc-700"
                  >
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-navy-900 dark:text-zinc-50">{title}</h3>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why apply (UI_UX §10.3.4) */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:py-20">
        <header className="flex flex-col items-start gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
            {t('whyEyebrow')}
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl dark:text-zinc-50">
            {t('whyTitle')}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base dark:text-zinc-300">
            {t('whyLead')}
          </p>
        </header>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({title, desc, icon}) => (
            <Card key={title}>
              <div className="flex flex-col gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-700 dark:bg-accent-600/15 dark:text-accent-100">
                  {icon}
                </span>
                <h3 className="text-base font-bold text-navy-900 dark:text-zinc-50">{title}</h3>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Internship Companion preview (UI_UX §10.3.5) */}
      <section className="border-y border-zinc-200 bg-navy-900 dark:border-zinc-800 dark:bg-navy-950">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:py-20">
          <header className="flex flex-col items-start gap-3">
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-300">
              {t('compEyebrow')}
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {t('compTitle')}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">{t('compLead')}</p>
          </header>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {companionPoints.map(({label, icon}) => (
              <li
                key={label}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/20 text-brand-200">
                  {icon}
                </span>
                <span className="text-sm font-medium leading-6 text-zinc-100">{label}</span>
              </li>
            ))}
          </ul>
          <div>
            <Link href="/companion">
              <Button
                variant="secondary"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 dark:border-zinc-600 dark:bg-white/10 dark:text-zinc-50 dark:hover:bg-white/20"
              >
                {t('compCta')}
                <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About preview (UI_UX §10.3.6) */}
      <section className="mx-auto flex w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <Card className="w-full">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-start gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                <IconBuilding className="h-6 w-6" />
              </span>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                  {t('aboutEyebrow')}
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl dark:text-zinc-50">
                  {t('aboutTitle')}
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base dark:text-zinc-300">
                  {t('aboutDesc')}
                </p>
              </div>
            </div>
            <Link href="/about" className="shrink-0">
              <Button variant="secondary">
                {t('aboutCta')}
                <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Final call to action (UI_UX §10.3.7) */}
      <section className="mx-auto flex w-full max-w-6xl px-4 pb-20 sm:px-6 lg:pb-24">
        <div className="flex w-full flex-col items-center gap-5 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-14 text-center text-white dark:from-brand-600 dark:to-navy-900">
          <h2 className="max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">{t('ctaTitle')}</h2>
          <p className="max-w-lg text-sm leading-6 text-brand-50 sm:text-base">{t('ctaDesc')}</p>
          <Link href="/apply">
            <Button className="border border-brand-50/60 bg-white text-brand-700 hover:bg-brand-50 dark:bg-white dark:text-brand-800 dark:hover:bg-brand-100">
              {t('ctaButton')}
              <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}