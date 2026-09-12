import Image from 'next/image';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Badge} from '@/components/ui/Badge';
import {Button} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';
import {
  IconArrowRight,
  IconCheckSquare,
  IconEye,
  IconGraduationCap,
  IconSparkles,
  IconWrench,
  IconTrendingUp,
  IconBook,
  IconMessage,
  IconLayers,
} from '@/components/ui/icons';
import type {AppLocale} from '@/i18n/routing';

/**
 * Rebuilt Public Home Page (Phase B7):
 * - Hero introducing STEG internships with primary & secondary CTAs + illustration
 * - Trust metrics banner (99.8% electrification, 5,982 MW capacity, 60+ years)
 * - Candidate Journey Roadmap (6 steps)
 * - Internship Types preview cards with official illustrations
 * - Platform Genesis & "Why it exists" section (About preview)
 * - Institutional History & 1962 Heritage section (History preview)
 * - Mobile Internship Companion showcase with app visual
 * - High-impact final call to action banner
 */
export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale as AppLocale);
  const t = await getTranslations('home');
  const ttypes = await getTranslations('internships');

  const roadmapSteps = [
    {title: t('road1Title'), desc: t('road1Desc'), number: '01'},
    {title: t('road2Title'), desc: t('road2Desc'), number: '02'},
    {title: t('road3Title'), desc: t('road3Desc'), number: '03'},
    {title: t('road4Title'), desc: t('road4Desc'), number: '04'},
    {title: t('road5Title'), desc: t('road5Desc'), number: '05'},
    {title: t('road6Title'), desc: t('road6Desc'), number: '06'},
  ];

  return (
    <div className="flex w-full flex-col overflow-hidden">
      {/* ------------------------------------------------------------------ */}
      {/*  HERO SECTION                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-brand-50/70 via-white to-white py-16 sm:py-24 lg:py-28 dark:border-zinc-800/80 dark:from-navy-900/60 dark:via-navy-950 dark:to-navy-950">
        {/* Ambient background glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 end-[-6rem] h-96 w-96 rounded-full bg-brand-200/50 blur-3xl dark:bg-brand-600/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 start-[-8rem] h-80 w-80 rounded-full bg-brand-100/60 blur-3xl dark:bg-brand-800/10"
        />

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8">
          {/* Left Hero Content */}
          <div className="flex flex-col items-start gap-6 lg:col-span-7">
            <Badge tone="brand" className="gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <IconSparkles className="h-3.5 w-3.5 text-brand-600 dark:text-brand-300" />
              {t('heroBadge')}
            </Badge>

            <h1 className="text-3xl font-extrabold tracking-tight text-navy-950 sm:text-5xl sm:leading-tight lg:text-5xl dark:text-zinc-50">
              {t('heroTitle')}
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-300">
              {t('heroSubtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link href="/apply">
                <Button size="lg" className="shadow-md hover-lift">
                  {t('heroCtaApply')}
                  <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </Link>
              <Link href="/internships">
                <Button variant="secondary" size="lg" className="hover-lift">
                  {t('heroCtaTypes')}
                </Button>
              </Link>
              <Link href="/companion">
                <Button variant="tertiary" size="lg" className="text-brand-700 dark:text-brand-300">
                  {t('heroCtaCompanion')}
                </Button>
              </Link>
            </div>

            {/* Micro stats banner */}
            <div className="mt-4 grid w-full grid-cols-3 gap-3 rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:gap-6 dark:border-zinc-800 dark:bg-navy-900/80">
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-brand-600 sm:text-2xl dark:text-brand-400">
                  {t('statsElectrification')}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t('statsElectrificationLabel')}
                </span>
              </div>
              <div className="flex flex-col border-x border-zinc-200/80 px-2 sm:px-4 dark:border-zinc-800">
                <span className="text-xl font-extrabold text-navy-900 sm:text-2xl dark:text-zinc-100">
                  {t('statsCapacity')}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t('statsCapacityLabel')}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-accent-600 sm:text-2xl dark:text-accent-100">
                  {t('statsExperience')}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t('statsExperienceLabel')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual */}
          <div className="relative flex justify-center lg:col-span-5">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200/70 bg-white p-3 shadow-xl hover-lift dark:border-zinc-700/60 dark:bg-navy-900">
              <Image
                src="/components/home/internship_opportunity_2000x2000.png"
                alt="Opportunités de stages à la STEG"
                width={800}
                height={800}
                priority
                className="h-auto w-full rounded-2xl object-cover"
              />
              <div className="absolute bottom-6 start-6 end-6 rounded-2xl border border-white/40 bg-white/90 p-3.5 shadow-lg backdrop-blur-md dark:border-zinc-700/80 dark:bg-navy-950/90">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                    <IconSparkles className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">
                      STEG Innovation & Talents
                    </span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      Observation • Perfectionnement • PFE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  CANDIDATE JOURNEY ROADMAP                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 lg:py-24">
        <header className="flex flex-col items-start gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            {t('roadmapEyebrow')}
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl dark:text-zinc-50">
            {t('roadmapTitle')}
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
            {t('roadmapLead')}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {roadmapSteps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all hover-lift dark:border-zinc-800 dark:bg-navy-900"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-extrabold text-brand-600 dark:text-brand-400">
                  {step.number}
                </span>
                <span className="h-2 w-2 rounded-full bg-brand-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-bold text-navy-900 dark:text-zinc-100">{step.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  INTERNSHIP TYPES SHOWCASE                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-zinc-200/80 bg-zinc-50/60 py-16 sm:py-20 lg:py-24 dark:border-zinc-800/80 dark:bg-navy-900/50">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {t('typesEyebrow')}
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl dark:text-zinc-50">
                {t('typesTitle')}
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
                {t('typesLead')}
              </p>
            </div>
            <Link href="/internships" className="shrink-0">
              <Button variant="secondary" size="md">
                {t('typesCta')}
                <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Observation Card */}
            <Card className="hover-lift overflow-hidden p-0">
              <div className="relative h-48 w-full bg-zinc-100 dark:bg-navy-950">
                <Image
                  src="/components/intern-types/observation_internship_illustration_2000x1667.png"
                  alt="Stage d'Observation"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-3 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                    <IconEye className="h-4 w-4" />
                  </span>
                  <Badge tone="info">{ttypes('obsDurationBadge')}</Badge>
                </div>
                <h3 className="text-lg font-bold text-navy-900 dark:text-zinc-50">{ttypes('obsTitle')}</h3>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {ttypes('obsPurpose')}
                </p>
                <div className="pt-2">
                  <Link href="/apply" className="text-xs font-bold text-brand-700 hover:underline dark:text-brand-400">
                    {t('ctaApply')} →
                  </Link>
                </div>
              </div>
            </Card>

            {/* Perfectionnement Card */}
            <Card className="hover-lift overflow-hidden p-0 border-brand-300 dark:border-brand-700">
              <div className="relative h-48 w-full bg-zinc-100 dark:bg-navy-950">
                <Image
                  src="/components/intern-types/Advanced_training_internship_illustraton_626x396.png"
                  alt="Stage de Perfectionnement"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-3 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                    <IconWrench className="h-4 w-4" />
                  </span>
                  <Badge tone="brand">{ttypes('perfDurationBadge')}</Badge>
                </div>
                <h3 className="text-lg font-bold text-navy-900 dark:text-zinc-50">{ttypes('perfTitle')}</h3>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {ttypes('perfPurpose')}
                </p>
                <div className="pt-2">
                  <Link href="/apply" className="text-xs font-bold text-brand-700 hover:underline dark:text-brand-400">
                    {t('ctaApply')} →
                  </Link>
                </div>
              </div>
            </Card>

            {/* PFE Card */}
            <Card className="hover-lift overflow-hidden p-0">
              <div className="relative h-48 w-full bg-zinc-100 dark:bg-navy-950">
                <Image
                  src="/components/intern-types/PFE_internship_illustration_2000x1334.png"
                  alt="Projet de Fin d'Études"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-3 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-white dark:bg-navy-700">
                    <IconGraduationCap className="h-4 w-4" />
                  </span>
                  <Badge tone="success">{ttypes('pfeDurationBadge')}</Badge>
                </div>
                <h3 className="text-lg font-bold text-navy-900 dark:text-zinc-50">{ttypes('pfeTitle')}</h3>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {ttypes('pfePurpose')}
                </p>
                <div className="pt-2">
                  <Link href="/apply" className="text-xs font-bold text-brand-700 hover:underline dark:text-brand-400">
                    {t('ctaApply')} →
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  ABOUT TEASER — WHY THIS PLATFORM EXISTS                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="flex flex-col items-start gap-4 lg:col-span-7">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              {t('aboutTeaserEyebrow')}
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl dark:text-zinc-50">
              {t('aboutTeaserTitle')}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
              {t('aboutTeaserDesc')}
            </p>

            <ul className="mt-2 flex flex-col gap-3">
              {[t('aboutTeaserPoint1'), t('aboutTeaserPoint2'), t('aboutTeaserPoint3')].map((pt) => (
                <li key={pt} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <IconCheckSquare className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{pt}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Link href="/about">
                <Button variant="secondary">
                  {t('aboutTeaserCta')}
                  <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-navy-900">
              <Image
                src="/components/about/paper_usage_problem_7438x5000.jpg"
                alt="Fin du papier et passage au tout numérique"
                width={700}
                height={500}
                className="h-64 w-full rounded-2xl object-cover"
              />
              <div className="mt-4 flex items-center gap-3">
                <Image
                  src="/components/about/digitalize_paper_usage_solution_150x150.svg"
                  alt="Solution de numérisation"
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0"
                />
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Dématérialisation complète, archivage sécurisé et traçabilité 100% STEG.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  STEG HISTORY TEASER                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-zinc-200/80 bg-gradient-to-r from-navy-900 to-navy-950 py-16 text-white sm:py-20 dark:border-zinc-800">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12">
          <div className="flex flex-col items-start gap-4 lg:col-span-7">
            <Badge tone="info" className="bg-brand-500/20 text-brand-200">
              {t('historyTeaserEyebrow')}
            </Badge>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
              {t('historyTeaserTitle')}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">
              {t('historyTeaserDesc')}
            </p>

            <ul className="flex flex-col gap-2.5 pt-2">
              {[t('historyTeaserPoint1'), t('historyTeaserPoint2'), t('historyTeaserPoint3')].map((pt) => (
                <li key={pt} className="flex items-center gap-3 text-sm text-zinc-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Link href="/history">
                <Button
                  variant="secondary"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20 dark:border-zinc-600 dark:bg-white/10 dark:text-zinc-50 dark:hover:bg-white/20"
                >
                  {t('historyTeaserCta')}
                  <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:col-span-5">
            <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <Image
                  src="/components/history/Engineer_working_with_wind_turbines_producing_green_energy_225x150.svg"
                  alt="Énergie éolienne et verte"
                  width={120}
                  height={80}
                  className="h-20 w-auto shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">Transition Énergétique</span>
                  <span className="text-xs text-zinc-300">
                    Solaire photovoltaïque, éolien et géothermie au cœur des projets STEG.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                <Image
                  src="/components/history/Geothermal_energy_renewable_sources_illustration_225x150.svg"
                  alt="Énergie géothermique"
                  width={120}
                  height={80}
                  className="h-20 w-auto shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">Infrastructures Gazières</span>
                  <span className="text-xs text-zinc-300">
                    Plus de 1 million d&apos;abonnés gaz naturel et réseau national interconnecté.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  INTERNSHIP COMPANION MOBILE APP PREVIEW                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Phone Frame Mockup */}
          <div className="relative flex justify-center lg:col-span-5">
            <div className="relative w-64 overflow-hidden rounded-[2.5rem] border-8 border-zinc-800 bg-zinc-900 shadow-2xl hover-lift dark:border-zinc-700">
              {/* Phone speaker notch */}
              <div className="absolute top-2 start-1/2 h-4 w-20 -translate-x-1/2 rounded-full bg-zinc-800 z-10" />
              <Image
                src="/components/intern-mobile-app/mobile_app_intern_1335x2000.jpg"
                alt="Application Mobile Internship Companion STEG"
                width={500}
                height={750}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>

          {/* Text & Points */}
          <div className="flex flex-col items-start gap-4 lg:col-span-7">
            <Badge tone="brand">{t('compTeaserEyebrow')}</Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl dark:text-zinc-50">
              {t('compTeaserTitle')}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
              {t('compTeaserDesc')}
            </p>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
              {[
                {title: t('compPoint1'), icon: <IconTrendingUp className="h-4 w-4" />},
                {title: t('compPoint2'), icon: <IconCheckSquare className="h-4 w-4" />},
                {title: t('compPoint3'), icon: <IconBook className="h-4 w-4" />},
                {title: t('compPoint4'), icon: <IconMessage className="h-4 w-4" />},
                {title: t('compPoint5'), icon: <IconLayers className="h-4 w-4" />},
              ].map((pt) => (
                <div
                  key={pt.title}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-navy-900"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {pt.icon}
                  </span>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{pt.title}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link href="/companion">
                <Button size="md" className="hover-lift">
                  {t('compTeaserCta')}
                  <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  FINAL CALL TO ACTION                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto flex w-full max-w-7xl px-4 pb-20 sm:px-6 lg:pb-28">
        <div className="relative flex w-full flex-col items-center justify-between gap-8 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-navy-900 px-6 py-14 text-center text-white shadow-xl sm:px-12 md:flex-row md:text-start dark:from-brand-800 dark:to-navy-950">
          <div className="flex max-w-xl flex-col gap-3">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl">{t('finalCtaTitle')}</h2>
            <p className="text-sm leading-relaxed text-brand-100 sm:text-base">{t('finalCtaDesc')}</p>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-3 sm:flex-row">
            <Link href="/apply">
              <Button
                size="lg"
                className="border border-white/20 bg-white font-bold text-brand-800 shadow-md hover:bg-brand-50 dark:bg-white dark:text-navy-950 hover-lift"
              >
                {t('finalCtaButton')}
                <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}