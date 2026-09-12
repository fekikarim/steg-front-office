import Image from 'next/image';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Badge} from '@/components/ui/Badge';
import {Button} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';
import {
  IconArrowRight,
  IconBuilding,
  IconClipboardList,
  IconFolder,
  IconLayoutGrid,
  IconSparkles,
  IconUser,
  IconGraduationCap,
} from '@/components/ui/icons';
import type {AppLocale} from '@/i18n/routing';

/**
 * Rebuilt About Page (Phase B7):
 * Specifications & Digital Transformation narrative ("Cahier des charges"):
 * 1. Initial observed challenges & pain points
 * 2. Integrated 3-tier digital solution (Front Office, Back Office, Mobile App)
 * 3. Video player showcasing digital services
 * 4. Value and impact for candidates, universities, and STEG
 */
export default async function AboutPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale as AppLocale);
  const t = await getTranslations('about');

  const painPoints = [
    {
      title: t('pain1Title'),
      desc: t('pain1Desc'),
      icon: <IconBuilding className="h-5 w-5 text-accent-600 dark:text-accent-300" />,
    },
    {
      title: t('pain2Title'),
      desc: t('pain2Desc'),
      icon: <IconClipboardList className="h-5 w-5 text-accent-600 dark:text-accent-300" />,
    },
    {
      title: t('pain3Title'),
      desc: t('pain3Desc'),
      icon: <IconFolder className="h-5 w-5 text-accent-600 dark:text-accent-300" />,
    },
    {
      title: t('pain4Title'),
      desc: t('pain4Desc'),
      icon: <IconUser className="h-5 w-5 text-accent-600 dark:text-accent-300" />,
    },
  ];

  const solutionFacets = [
    {
      title: t('facet1Title'),
      desc: t('facet1Desc'),
      badge: "Web Public",
      icon: <IconLayoutGrid className="h-5 w-5 text-brand-600 dark:text-brand-300" />,
    },
    {
      title: t('facet2Title'),
      desc: t('facet2Desc'),
      badge: "Back Office",
      icon: <IconBuilding className="h-5 w-5 text-brand-600 dark:text-brand-300" />,
    },
    {
      title: t('facet3Title'),
      desc: t('facet3Desc'),
      badge: "Flutter Mobile",
      icon: <IconSparkles className="h-5 w-5 text-brand-600 dark:text-brand-300" />,
    },
  ];

  const impacts = [
    {
      title: t('impactCandidateTitle'),
      desc: t('impactCandidateDesc'),
      icon: <IconUser className="h-6 w-6 text-brand-600 dark:text-brand-300" />,
    },
    {
      title: t('impactUniversityTitle'),
      desc: t('impactUniversityDesc'),
      icon: <IconGraduationCap className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />,
    },
    {
      title: t('impactStegTitle'),
      desc: t('impactStegDesc'),
      icon: <IconBuilding className="h-6 w-6 text-navy-700 dark:text-navy-300" />,
    },
  ];

  return (
    <div className="flex w-full flex-col">
      {/* ------------------------------------------------------------------ */}
      {/*  HEADER BANNER                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-brand-50/60 via-white to-white py-14 sm:py-20 dark:border-zinc-800/80 dark:from-navy-900/50 dark:via-navy-950 dark:to-navy-950">
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
      {/*  PART 1: THE INITIAL PROBLEM STATEMENT                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-7">
            <Badge tone="error" className="w-fit">Constat & Problématique</Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl dark:text-zinc-50">
              {t('initialContextTitle')}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
              {t('initialContextLead')}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-md lg:col-span-5 dark:border-zinc-800 dark:bg-navy-900">
            <Image
              src="/components/about/paper_usage_problem_7438x5000.jpg"
              alt="Anciens processus papier"
              width={700}
              height={450}
              className="h-56 w-full rounded-2xl object-cover"
            />
            <div className="mt-3 flex items-center gap-2.5 px-1">
              <span className="h-2 w-2 rounded-full bg-accent-600" />
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Processus historiques papier : lenteur, déplacements et surcharge administrative.
              </span>
            </div>
          </div>
        </div>

        {/* 4 Pain point cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {painPoints.map((p) => (
            <Card key={p.title} className="hover-lift border-accent-100 bg-accent-50/20 dark:border-accent-900/30 dark:bg-accent-950/10">
              <div className="flex flex-col gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-200">
                  {p.icon}
                </span>
                <h3 className="text-sm font-bold text-navy-900 dark:text-zinc-100">{p.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{p.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  PART 2: THE INTEGRATED SOLUTION (3 TIERS)                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-zinc-200/80 bg-zinc-50/70 py-16 sm:py-20 dark:border-zinc-800/80 dark:bg-navy-900/50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6">
          <div className="flex flex-col items-start gap-2">
            <Badge tone="success" className="w-fit">Architecture Unifiée</Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl dark:text-zinc-50">
              {t('solutionTitle')}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
              {t('solutionLead')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {solutionFacets.map((facet) => (
              <Card key={facet.title} className="hover-lift flex flex-col justify-between">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                      {facet.icon}
                    </span>
                    <Badge tone="brand">{facet.badge}</Badge>
                  </div>
                  <h3 className="text-base font-bold text-navy-900 dark:text-zinc-50">{facet.title}</h3>
                  <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{facet.desc}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Multimedia Video Demonstration */}
          <div className="mt-4 flex flex-col gap-4 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-md dark:border-zinc-800 dark:bg-navy-900">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {t('videoSectionTitle')}
              </span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{t('videoSectionDesc')}</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-black shadow-inner">
              <video
                controls
                className="h-auto max-h-[480px] w-full object-contain"
                preload="metadata"
              >
                <source src="/components/about/digital_services_1920x1080.mp4" type="video/mp4" />
                Votre navigateur ne prend pas en charge la lecture de vidéos.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  PART 3: TRIPLE IMPACT & VALUE PROPOSITION                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-col items-start gap-2">
          <Badge tone="brand" className="w-fit">Bénéfices & Valeur</Badge>
          <h2 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl dark:text-zinc-50">
            {t('impactTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {impacts.map((item) => (
            <Card key={item.title} className="hover-lift">
              <div className="flex flex-col gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-navy-800">
                  {item.icon}
                </span>
                <h3 className="text-base font-bold text-navy-900 dark:text-zinc-50">{item.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Footer */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-navy-900">
          <div className="flex items-center gap-4">
            <Image
              src="/components/about/intern_have_idea_illustration_150x150.svg"
              alt="Idée de stage"
              width={60}
              height={60}
              className="h-14 w-14 shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-navy-900 dark:text-zinc-100">
                Vous avez un projet ou une convention de stage ?
              </span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                Déposez votre dossier dès maintenant et recevez un suivi personnalisé.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/apply">
              <Button size="md" className="hover-lift shadow-sm">
                {t('ctaApply')}
                <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}