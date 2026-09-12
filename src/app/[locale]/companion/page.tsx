import Image from 'next/image';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Badge} from '@/components/ui/Badge';
import {Button} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';
import {
  IconArrowRight,
  IconBell,
  IconBook,
  IconCheckSquare,
  IconFolder,
  IconLayers,
  IconMessage,
  IconSparkles,
  IconTrendingUp,
} from '@/components/ui/icons';
import type {AppLocale} from '@/i18n/routing';

/**
 * Rebuilt Internship Companion Page (Phase B7):
 * Dedicated product showcase for the Flutter mobile application used during
 * the internship period at STEG:
 * - Device mockup featuring the mobile app screenshot
 * - 7 core capabilities (tasks, planning, journal, feedback, notifications, deliverables, progress)
 * - "A Day in the Life with Internship Companion" timeline
 * - Direct Apply CTA banner
 */
export default async function CompanionPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale as AppLocale);
  const t = await getTranslations('companion');

  const features = [
    {
      title: t('featTasksTitle'),
      desc: t('featTasksDesc'),
      icon: <IconCheckSquare className="h-5 w-5 text-brand-600 dark:text-brand-300" />,
    },
    {
      title: t('featPlanTitle'),
      desc: t('featPlanDesc'),
      icon: <IconLayers className="h-5 w-5 text-brand-600 dark:text-brand-300" />,
    },
    {
      title: t('featJournalTitle'),
      desc: t('featJournalDesc'),
      icon: <IconBook className="h-5 w-5 text-brand-600 dark:text-brand-300" />,
    },
    {
      title: t('featFeedbackTitle'),
      desc: t('featFeedbackDesc'),
      icon: <IconMessage className="h-5 w-5 text-brand-600 dark:text-brand-300" />,
    },
    {
      title: t('featNotifyTitle'),
      desc: t('featNotifyDesc'),
      icon: <IconBell className="h-5 w-5 text-brand-600 dark:text-brand-300" />,
    },
    {
      title: t('featDeliverablesTitle'),
      desc: t('featDeliverablesDesc'),
      icon: <IconFolder className="h-5 w-5 text-brand-600 dark:text-brand-300" />,
    },
    {
      title: t('featProgressTitle'),
      desc: t('featProgressDesc'),
      icon: <IconTrendingUp className="h-5 w-5 text-brand-600 dark:text-brand-300" />,
    },
  ];

  const dayTimeline = [
    {time: t('step1Time'), desc: t('step1Desc'), num: '1'},
    {time: t('step2Time'), desc: t('step2Desc'), num: '2'},
    {time: t('step3Time'), desc: t('step3Desc'), num: '3'},
    {time: t('step4Time'), desc: t('step4Desc'), num: '4'},
  ];

  return (
    <div className="flex w-full flex-col">
      {/* ------------------------------------------------------------------ */}
      {/*  HERO PRODUCT SHOWCASE                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-brand-50/70 via-white to-white py-16 sm:py-24 dark:border-zinc-800/80 dark:from-navy-900/60 dark:via-navy-950 dark:to-navy-950">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12">
          {/* Left copy */}
          <div className="flex flex-col items-start gap-6 lg:col-span-7">
            <Badge tone="brand" className="gap-2 px-3 py-1">
              <IconSparkles className="h-3.5 w-3.5" />
              {t('badge')}
            </Badge>

            <h1 className="text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl lg:text-5xl dark:text-zinc-50">
              {t('title')}
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-300">
              {t('subtitle')}
            </p>

            <div className="pt-2">
              <Link href="/apply">
                <Button size="lg" className="hover-lift shadow-md">
                  {t('ctaApply')}
                  <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Phone Frame Mockup */}
          <div className="relative flex justify-center lg:col-span-5">
            <div className="relative w-64 sm:w-72 overflow-hidden rounded-[2.5rem] border-8 border-zinc-800 bg-zinc-900 shadow-2xl hover-lift dark:border-zinc-700">
              {/* Phone speaker notch */}
              <div className="absolute top-2 start-1/2 h-4 w-20 -translate-x-1/2 rounded-full bg-zinc-800 z-10" />
              <Image
                src="/components/intern-mobile-app/mobile_app_intern_1335x2000.jpg"
                alt="Application Mobile Internship Companion STEG"
                width={600}
                height={900}
                priority
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  FEATURES GRID                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-col items-start gap-2">
          <Badge tone="info" className="w-fit">Outils du Quotidien</Badge>
          <h2 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl dark:text-zinc-50">
            {t('featuresTitle')}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
            {t('featuresLead')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat) => (
            <Card key={feat.title} className="hover-lift">
              <div className="flex flex-col gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {feat.icon}
                </span>
                <h3 className="text-base font-bold text-navy-900 dark:text-zinc-50">{feat.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{feat.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  A DAY IN THE LIFE TIMELINE                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-zinc-200/80 bg-zinc-50/70 py-16 sm:py-20 dark:border-zinc-800/80 dark:bg-navy-900/50">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 sm:px-6">
          <div className="flex flex-col items-start gap-2">
            <Badge tone="brand" className="w-fit">Scénario d&apos;Usage</Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl dark:text-zinc-50">
              {t('dayInLifeTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dayTimeline.map((step) => (
              <div
                key={step.num}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm hover-lift dark:border-zinc-800 dark:bg-navy-900"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {step.num}
                  </span>
                  <span className="text-xs font-bold text-brand-700 dark:text-brand-400">{step.time}</span>
                </div>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  ACTIVATION CTA BANNER                                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto flex w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex w-full flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-navy-900 p-8 text-center text-white shadow-xl sm:p-12 md:flex-row md:text-start dark:from-brand-800 dark:to-navy-950">
          <div className="flex max-w-lg flex-col gap-2">
            <h2 className="text-2xl font-extrabold sm:text-3xl">{t('bannerTitle')}</h2>
            <p className="text-xs leading-relaxed text-brand-100 sm:text-sm">{t('bannerDesc')}</p>
          </div>
          <Link href="/apply" className="shrink-0">
            <Button size="lg" className="border border-white/20 bg-white font-bold text-brand-800 hover:bg-brand-50 dark:bg-white dark:text-navy-950 hover-lift shadow-md">
              {t('bannerButton')}
              <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}