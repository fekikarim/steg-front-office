'use client';

import {useTranslations} from 'next-intl';
import {Card} from '@/components/ui/Card';
import {Input} from '@/components/ui/Input';
import {Button} from '@/components/ui/Button';
import {FieldError} from '@/components/ui/FieldError';
import {StepShell} from './StepShell';
import type {InternshipDetailsDraft} from '@/lib/apply-wizard';
import type {InternshipType} from '@/lib/api/application';

interface DetailsStepProps {
  data: InternshipDetailsDraft;
  classificationType: InternshipType | null;
  onChange: (patch: Partial<InternshipDetailsDraft>) => void;
  errorKey: string | null;
  onContinue: () => void;
}

/**
 * Step 4 — Internship Details & Project Theme.
 * Collects the project theme (mandatory for Perfectionnement and PFE)
 * and optional department preferences.
 */
export function DetailsStep({
  data,
  classificationType,
  onChange,
  errorKey,
  onContinue,
}: DetailsStepProps) {
  const t = useTranslations('apply.details');
  const tn = useTranslations('apply.nav');

  const themeMandatory = classificationType === 'PERFECTIONNEMENT' || classificationType === 'PFE';

  return (
    <StepShell eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')}>
      <Card>
        <div className="flex flex-col gap-4">
          {/* Project Theme */}
          <Input
            id="project-theme"
            label={t('themeLabel')}
            hint={!themeMandatory ? t('themeOptionalNotice') : undefined}
            type="text"
            value={data.proposedTheme}
            onChange={(e) => onChange({proposedTheme: e.target.value})}
            placeholder={t('themePlaceholder')}
            required={themeMandatory}
          />

          {/* Preferred Department / District */}
          <Input
            id="preferred-department"
            label={t('deptLabel')}
            type="text"
            value={data.preferredDepartment ?? ''}
            onChange={(e) => onChange({preferredDepartment: e.target.value})}
            placeholder={t('deptPlaceholder')}
          />
        </div>

        {errorKey && <FieldError message={errorKey} />}

        <div className="mt-4 flex justify-end">
          <Button size="md" onClick={onContinue}>
            {tn('continue')}
          </Button>
        </div>
      </Card>
    </StepShell>
  );
}
