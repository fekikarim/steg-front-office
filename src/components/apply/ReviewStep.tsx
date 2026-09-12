'use client';

import {useTranslations} from 'next-intl';
import {Card} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {Badge, StatusPill} from '@/components/ui/Badge';
import {StepShell} from './StepShell';
import type {WizardDraft} from '@/lib/apply-wizard';
import type {University} from '@/lib/api/candidate';
import type {ApplicationDocumentResponse, ClassificationResult} from '@/lib/api/application';

interface ReviewStepProps {
  draft: WizardDraft;
  universities: University[];
  classification: ClassificationResult | null;
  applicationLetter: ApplicationDocumentResponse | null;
  assignmentLetter: ApplicationDocumentResponse | null;
  demo: ApplicationDocumentResponse | null;
  onJumpToStep: (stepIndex: number) => void;
  onToggleTerms: (confirmed: boolean) => void;
  onContinue: () => void;
}

function Section({
  title,
  stepIndex,
  onEdit,
  children,
}: {
  title: string;
  stepIndex: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <Card
      title={title}
      action={
        <button
          type="button"
          onClick={() => onEdit(stepIndex)}
          className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400 cursor-pointer"
        >
          Modifier
        </button>
      }
    >
      <div className="flex flex-col gap-1.5">{children}</div>
    </Card>
  );
}

function Row({label, value}: {label: string; value?: React.ReactNode}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-zinc-100 py-1.5 text-xs last:border-0 sm:text-sm dark:border-zinc-800">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-end font-medium text-zinc-800 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

/**
 * Step 6 — Review and Confirmation.
 * Displays a scannable summary across all previous steps, masked CIN,
 * jump-back edit links, and an explicit confirmation checkbox.
 */
export function ReviewStep({
  draft,
  universities,
  classification,
  applicationLetter,
  assignmentLetter,
  demo,
  onJumpToStep,
  onToggleTerms,
  onContinue,
}: ReviewStepProps) {
  const t = useTranslations('apply.review');
  const ta = useTranslations('apply');
  const td = useTranslations('apply.documents');
  const tn = useTranslations('apply.nav');

  const universityName = universities.find((u) => u.id === draft.education.universityId)?.name;

  // Mask CIN by default
  const maskedCin = draft.personal.nationalId
    ? `•••• ${draft.personal.nationalId.slice(-4)}`
    : t('notProvided');

  const docsComplete = Boolean(applicationLetter) && Boolean(assignmentLetter);

  return (
    <StepShell eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')}>
      {/* 1. Personal Information */}
      <Section title={t('sectionCandidate')} stepIndex={0} onEdit={onJumpToStep}>
        <Row
          label={t('fieldName')}
          value={`${draft.personal.firstName} ${draft.personal.lastName}`.trim() || t('notProvided')}
        />
        <Row label="CIN / Identifiant" value={maskedCin} />
        <Row label={t('fieldEmail')} value={draft.personal.email || t('notProvided')} />
        <Row label="Téléphone" value={draft.personal.phone || t('notProvided')} />
        <Row label="Date de naissance" value={draft.personal.birthDate || t('notProvided')} />
      </Section>

      {/* 2. Education */}
      <Section title="Formation & Établissement" stepIndex={1} onEdit={onJumpToStep}>
        <Row label="Niveau d'études" value={draft.education.educationLevel} />
        {draft.education.speciality && <Row label="Filière" value={draft.education.speciality} />}
        <Row label="Université" value={universityName || t('notProvided')} />
      </Section>

      {/* 3. Dates & Classification */}
      <Section title={t('sectionDates')} stepIndex={2} onEdit={onJumpToStep}>
        <Row
          label={t('fieldDates')}
          value={
            draft.dates.desiredStartDate && draft.dates.desiredEndDate ? (
              <span dir="ltr">
                {draft.dates.desiredStartDate} → {draft.dates.desiredEndDate}
              </span>
            ) : (
              t('notProvided')
            )
          }
        />
        {classification && (
          <>
            <Row
              label={t('classificationType')}
              value={
                <Badge tone={classification.type === 'PFE' ? 'brand' : 'info'}>
                  {classification.type}
                </Badge>
              }
            />
            <Row
              label={t('classificationRequirement')}
              value={classification.requirement === 'OBLIGATOIRE' ? 'Automatiquement obligatoire' : 'Optionnel'}
            />
            <Row
              label={t('classificationDuration')}
              value={`${classification.durationInDays} jours`}
            />
            <Row
              label="Justification"
              value={<span className="text-xs text-zinc-600 dark:text-zinc-400">{classification.appliedRuleDescription}</span>}
            />
          </>
        )}
      </Section>

      {/* 4. Details */}
      <Section title="Détails du stage" stepIndex={3} onEdit={onJumpToStep}>
        <Row
          label={t('fieldTheme')}
          value={draft.details.proposedTheme.trim() ? draft.details.proposedTheme : t('notProvided')}
        />
        {draft.details.preferredDepartment && (
          <Row label="Département souhaité" value={draft.details.preferredDepartment} />
        )}
      </Section>

      {/* 5. Documents */}
      <Section title={t('sectionDocuments')} stepIndex={4} onEdit={onJumpToStep}>
        <Row
          label={t('itemApplicationLetter')}
          value={
            applicationLetter ? (
              <span className="inline-flex items-center gap-2">
                <StatusPill code={applicationLetter.verificationStatus} />
                <span className="max-w-[200px] truncate text-xs text-zinc-500 dark:text-zinc-400">
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
              <span className="inline-flex items-center gap-2">
                <StatusPill code={assignmentLetter.verificationStatus} />
                <span className="max-w-[200px] truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {assignmentLetter.document.originalFileName}
                </span>
              </span>
            ) : (
              <Badge tone="error">{td('missingRequired')}</Badge>
            )
          }
        />
        {demo && (
          <Row
            label="Fichier démo (Optionnel)"
            value={
              <span className="max-w-[200px] truncate text-xs text-zinc-500 dark:text-zinc-400">
                {demo.document.originalFileName}
              </span>
            }
          />
        )}
      </Section>

      {/* Confirmation Checkbox */}
      <Card>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={draft.confirmedTerms}
            onChange={(e) => onToggleTerms(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 accent-brand-600 dark:accent-brand-500 cursor-pointer"
          />
          <span className="text-xs font-medium leading-relaxed text-zinc-800 dark:text-zinc-200 sm:text-sm">
            {ta('reviewAgreeTerms')}
          </span>
        </label>
      </Card>

      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={onContinue}
          disabled={!draft.confirmedTerms || !docsComplete}
          className="shadow-md hover-lift"
        >
          {tn('continue')}
        </Button>
      </div>
    </StepShell>
  );
}
