import Image from 'next/image';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Badge} from '@/components/ui/Badge';
import {Button} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';
import {
  IconArrowRight,
  IconEye,
  IconGraduationCap,
  IconSparkles,
  IconWrench,
} from '@/components/ui/icons';
import type {AppLocale} from '@/i18n/routing';

/**
 * Rebuilt Internship Types Page (Phase B7):
 * - Detailed presentation of the 3 official STEG internship types with illustrations
 * - Observation, Perfectionnement, and PFE requirements
 * - Direct feature comparison matrix table
 * - Modern modalities (onsite, hybrid, remote with motion video)
 * - Strategically positioned "Apply" action buttons
 */
export default async function InternshipsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale as AppLocale);
  const t = await getTranslations('internships');

  const types = [
    {
      id: 'observation',
      title: t('obsTitle'),
      durationBadge: t('obsDurationBadge'),
      tone: 'info' as const,
      image: '/components/intern-types/observation_internship_illustration_2000x1667.png',
      rule: t('obsMandatoryRule'),
      purpose: t('obsPurpose'),
      theme: t('obsThemeRule'),
      deliverables: t('obsDeliverables'),
      companion: t('obsCompanionRole'),
      icon: <IconEye className="h-6 w-6 text-brand-600 dark:text-brand-300" />,
    },
    {
      id: 'perfectionnement',
      title: t('perfTitle'),
      durationBadge: t('perfDurationBadge'),
      tone: 'brand' as const,
      image: '/components/intern-types/Advanced_training_internship_illustraton_626x396.png',
      rule: t('perfMandatoryRule'),
      purpose: t('perfPurpose'),
      theme: t('perfThemeRule'),
      deliverables: t('perfDeliverables'),
      companion: t('perfCompanionRole'),
      icon: <IconWrench className="h-6 w-6 text-brand-600 dark:text-brand-300" />,
    },
    {
      id: 'pfe',
      title: t('pfeTitle'),
      durationBadge: t('pfeDurationBadge'),
      tone: 'success' as const,
      image: '/components/intern-types/PFE_internship_illustration_2000x1334.png',
      rule: t('pfeMandatoryRule'),
      purpose: t('pfePurpose'),
      theme: t('pfeThemeRule'),
      deliverables: t('pfeDeliverables'),
      companion: t('pfeCompanionRole'),
      icon: <IconGraduationCap className="h-6 w-6 text-brand-600 dark:text-brand-300" />,
    },
  ];

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
      {/*  THE THREE INTERNSHIP TYPES (DETAILED CARDS)                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 sm:px-6">
        {types.map((type, idx) => (
          <div
            key={type.id}
            className={`grid grid-cols-1 items-center gap-8 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-md transition-all hover-lift lg:grid-cols-12 lg:p-8 dark:border-zinc-800 dark:bg-navy-900 ${
              idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}
          >
            {/* Visual */}
            <div className={`relative h-64 w-full overflow-hidden rounded-2xl bg-zinc-50 lg:col-span-5 dark:bg-navy-950 ${
              idx % 2 === 1 ? 'lg:order-2' : 'lg:order-1'
            }`}>
              <Image
                src={type.image}
                alt={type.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>

            {/* Content Details */}
            <div className={`flex flex-col gap-4 lg:col-span-7 ${
              idx % 2 === 1 ? 'lg:order-1' : 'lg:order-2'
            }`}>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/40">
                  {type.icon}
                </span>
                <Badge tone={type.tone}>{type.durationBadge}</Badge>
              </div>

              <h2 className="text-2xl font-extrabold text-navy-950 dark:text-zinc-50">{type.title}</h2>

              <div className="flex flex-col gap-2 text-xs leading-relaxed text-zinc-700 sm:text-sm dark:text-zinc-300">
                <p className="font-semibold text-brand-700 dark:text-brand-300">{type.rule}</p>
                <p>{type.purpose}</p>
                <p className="text-zinc-600 dark:text-zinc-400">{type.theme}</p>
                <p className="text-zinc-600 dark:text-zinc-400">{type.deliverables}</p>
                <div className="mt-1 flex items-center gap-2 rounded-lg bg-zinc-50 p-2.5 dark:bg-navy-950">
                  <IconSparkles className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{type.companion}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/apply">
                  <Button size="md" className="hover-lift shadow-sm">
                    {t('applyCtaText')}
                    <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Global Prominent Call to Action */}
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-brand-200 bg-brand-50/70 p-6 sm:flex-row sm:p-8 dark:border-brand-800 dark:bg-brand-950/20">
          <div className="flex items-center gap-4">
            <Image
              src="/components/intern-types/join_us_225x150.svg"
              alt="Rejoignez-nous"
              width={90}
              height={60}
              className="h-16 w-auto shrink-0"
            />
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-navy-900 dark:text-zinc-50">
                Vous avez identifié le stage qui correspond à vos études ?
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Déposez votre candidature dès maintenant. La classification est confirmée automatiquement.
              </p>
            </div>
          </div>
          <Link href="/apply" className="shrink-0">
            <Button size="lg" className="hover-lift shadow-md">
              {t('applyButtonGlobal')}
              <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  COMPARISON MATRIX                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-zinc-200/80 bg-zinc-50/70 py-16 sm:py-20 dark:border-zinc-800/80 dark:bg-navy-900/50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6">
          <div className="flex flex-col items-start gap-2">
            <Badge tone="brand" className="w-fit">Tableau Récapitulatif</Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl dark:text-zinc-50">
              {t('matrixTitle')}
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-navy-900">
            <table className="w-full border-collapse text-left text-xs rtl:text-right sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-navy-950">
                  <th scope="col" className="px-4 py-3 font-bold text-zinc-700 dark:text-zinc-300">{t('matrixColType')}</th>
                  <th scope="col" className="px-4 py-3 font-bold text-zinc-700 dark:text-zinc-300">{t('matrixColDuration')}</th>
                  <th scope="col" className="px-4 py-3 font-bold text-zinc-700 dark:text-zinc-300">{t('matrixColRule')}</th>
                  <th scope="col" className="px-4 py-3 font-bold text-zinc-700 dark:text-zinc-300">{t('matrixColTheme')}</th>
                  <th scope="col" className="px-4 py-3 font-bold text-zinc-700 dark:text-zinc-300">{t('matrixColCompanion')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <tr>
                  <td className="px-4 py-3.5 font-bold text-navy-900 dark:text-zinc-100">{t('obsTitle')}</td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">~ 1 mois (&lt; 42 jours)</td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">Selon cursus (Optionnel ou Obligatoire)</td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">Non exigé à l&apos;inscription</td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">Accueil & Consignes de sécurité</td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold text-navy-900 dark:text-zinc-100">{t('perfTitle')}</td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">6 semaines à 3 mois (42 à 90 jours)</td>
                  <td className="px-4 py-3.5 font-bold text-brand-600 dark:text-brand-400">Automatiquement obligatoire</td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">Discuté avec l&apos;encadrant</td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">Journal quotidien & Validation des tâches</td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold text-navy-900 dark:text-zinc-100">{t('pfeTitle')}</td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">&gt; 3 mois (&gt; 90 jours)</td>
                  <td className="px-4 py-3.5 font-bold text-brand-600 dark:text-brand-400">Automatiquement obligatoire</td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">Projet de fin d&apos;études formel</td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">Jalons, Livrables & Évaluation finale</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  FLEXIBLE MODALITIES (HYBRID & REMOTE)                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-col items-start gap-2">
          <Badge tone="info" className="w-fit">Environnements Modernes</Badge>
          <h2 className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl dark:text-zinc-50">
            {t('modesTitle')}
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
            {t('modesLead')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="hover-lift flex flex-col justify-between">
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-navy-900 dark:text-zinc-50">{t('modeOnsiteTitle')}</h3>
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{t('modeOnsiteDesc')}</p>
            </div>
          </Card>

          <Card className="hover-lift overflow-hidden p-0">
            <div className="relative h-36 w-full bg-zinc-100 dark:bg-navy-950">
              <Image
                src="/components/intern-types/hybrid_internship_illustration_2000x2000.jpg"
                alt="Stage hybride"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-2 p-4">
              <h3 className="text-base font-bold text-navy-900 dark:text-zinc-50">{t('modeHybridTitle')}</h3>
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{t('modeHybridDesc')}</p>
            </div>
          </Card>

          <Card className="hover-lift overflow-hidden p-0">
            <div className="relative h-36 w-full bg-black">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              >
                <source src="/components/intern-types/remote_internship_motion_graphic.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="flex flex-col gap-2 p-4">
              <h3 className="text-base font-bold text-navy-900 dark:text-zinc-50">{t('modeRemoteTitle')}</h3>
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{t('modeRemoteDesc')}</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}