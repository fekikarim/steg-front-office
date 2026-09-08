'use client';

import {useTranslations} from 'next-intl';
import {Card} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {Badge, StatusPill} from '@/components/ui/Badge';
import {StepShell} from './StepShell';
import type {CandidateProfile, University} from '@/lib/api/candidate';
import type {ApplicationDocumentResponse, ClassificationResult} from '@/lib/api/application';

interface ReviewStepProps {
  profile: CandidateProfile | null;
  universities: University[];
  startDate: string;
  endDate: string;
  classification: ClassificationResult | null;
  theme: string;
  applicationLetter: ApplicationDocumentResponse | null;
  assignmentLetter: ApplicationDocumentResponse | null;
  demo: ApplicationDocumentResponse | null;
  onContinue: () => void;
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <Card title={title}>
      <div className="flex flex-col gap-2">{children}</div>
    </Card>
  );
}

function Row({label, value}: {label: string; value?: React.ReactNode}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-zinc-100 py-2 text-sm last:border-0 dark:border-zinc-800">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-end font-medium text-zinc-800 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

/**
 * Step 7 — Review the full dossier. Shows every section and a completion
 * checklist; the candidate confirms before moving to submit.
 */
export function ReviewStep({
  profile,
  universities,
  startDate,
  endDate,
  classification,
  theme,
  applicationLetter,
  assignmentLetter,
  demo,
  onContinue,
}: ReviewStepProps) {
  const t = useTranslations('apply.review');
  const td = useTranslations('apply.documents');
  const tn = useTranslations('apply.nav');

  const universityName =
    profile && universities.length > 0
      ? universities.find((u) => u.id === profile.universityId)?.name ?? null
      : null;

  const themeOk = theme.trim().length > 0;
  const docsOk = Boolean(applicationLetter) && Boolean(assignmentLetter);
  const ready = themeOk && docsOk && Boolean(classification);

  return (
    <StepShell eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')}>
      <Section title={t('sectionCandidate')}>
        <Row label={t('fieldName')} value={profile ? `${profile.firstName} ${profile.lastName}` : t('notProvided')} />
        <Row label={t('fieldEmail')} value={profile ? profile.email : t('notProvided')} />
        <Row label={t('fieldUniversity')} value={universityName ?? t('notProvided')} />
      </Section>

      <Section title={t('sectionDates')}>
        <Row
          label={t('fieldDates')}
          value={startDate && endDate ? <span dir="ltr">{startDate} → {endDate}</span> : t('notProvided')}
        />
      </Section>

      {classification && (
        <Section title={t('sectionClassification')}>
          <Row
            label={t('classificationType')}
            value={
              classification.type === 'PFE'
                ? t('typePfe')
                : classification.type === 'PERFECTIONNEMENT'
                  ? t('typePerfectionnement')
                  : t('typeObservation')
            }
          />
          <Row
            label={t('classificationRequirement')}
            value={classification.requirement === 'OBLIGATOIRE' ? t('requirementObligatoire') : t('requirementOptional')}
          />
          <Row
            label={t('classificationDuration')}
            value={String(classification.durationInDays)}
          />
        </Section>
      )}

      <Section title={t('sectionTheme')}>
        <Row label={t('fieldTheme')} value={theme.trim() ? theme : t('notProvided')} />
      </Section>

      <Section title={t('sectionDocuments')}>
        <Row
          label={t('itemApplicationLetter')}
          value={
            applicationLetter ? (
              <span className="inline-flex flex-col items-end gap-1">
                <StatusPill code={applicationLetter.verificationStatus} />
                <span className="max-w-55 truncate text-xs font-normal text-zinc-500 dark:text-zinc-400" dir="auto">
                  {applicationLetter.document.originalFileName}
                </span>
              </span>
            ) : (
              <Badge tone="error">{td('missingRequired')}</Badge>
            )
          }
        />
        <Row
          label={t('itemAssignmentLetter')}
          value={
            assignmentLetter ? (
              <span className="inline-flex flex-col items-end gap-1">
                <StatusPill code={assignmentLetter.verificationStatus} />
                <span className="max-w-55 truncate text-xs font-normal text-zinc-500 dark:text-zinc-400" dir="auto">
                  {assignmentLetter.document.originalFileName}
                </span>
              </span>
            ) : (
              <Badge tone="error">{td('missingRequired')}</Badge>
            )
          }
        />
        {(applicationLetter?.verificationComment || assignmentLetter?.verificationComment) && (
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            <span className="font-semibold">{td('verificationCommentLabel')}: </span>
            <span dir="auto">
              {[applicationLetter?.verificationComment, assignmentLetter?.verificationComment]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </p>
        )}
      </Section>

      <Section title={t('sectionDemo')}>
        <Row
          label={t('sectionDemo')}
          value={
            demo ? (
              <span className="inline-flex flex-col items-end gap-1">
                <StatusPill code={demo.verificationStatus} />
                <span className="max-w-55 truncate text-xs font-normal text-zinc-500 dark:text-zinc-400" dir="auto">
                  {demo.document.originalFileName}
                </span>
              </span>
            ) : (
              <Badge tone="neutral">—</Badge>
            )
          }
        />
      </Section>

      <Card title={t('checklistTitle')}>
        <p className={`text-sm ${ready ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
          {ready ? t('checkComplete') : t('checkIncomplete')}
        </p>
        <ul className="flex flex-col gap-1.5 text-sm">
          <li className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${profile ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            {t('itemCandidateConfirmed')}
          </li>
          <li className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${classification ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            {t('itemDatesConfirmed')}
          </li>
          <li className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${themeOk ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            {t('itemThemeProvided')}
          </li>
          <li className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${applicationLetter ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            {t('itemApplicationLetter')}
          </li>
          <li className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${assignmentLetter ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            {t('itemAssignmentLetter')}
          </li>
        </ul>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" size="md" onClick={onContinue} disabled={!ready}>
          {ready ? tn('continue') : t('itemNotReady')}
        </Button>
      </div>
    </StepShell>
  );
}
