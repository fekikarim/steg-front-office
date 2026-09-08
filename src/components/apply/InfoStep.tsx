'use client';

import {useTranslations} from 'next-intl';
import {Card} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {Input} from '@/components/ui/Input';
import {StepShell} from './StepShell';
import {FieldError} from '@/components/ui/FieldError';
import {cx} from '@/lib/cx';

interface InfoStepProps {
  theme: string;
  classificationType: 'OBSERVATION' | 'PERFECTIONNEMENT' | 'PFE' | null;
  themeRequired: boolean;
  confirmed: boolean;
  onChange: (theme: string) => void;
  onConfirm: (value: boolean) => void;
  errorKey: string | null;
  onContinue: () => void;
}

/**
 * Step 4 — Internship-specific details. For Perfectionnement/PFE the project
 * theme is required; for Observation it is optional.
 */
export function InfoStep({
  theme,
  classificationType,
  themeRequired,
  confirmed,
  onChange,
  onConfirm,
  errorKey,
  onContinue,
}: InfoStepProps) {
  const t = useTranslations('apply.info');
  const td = useTranslations('apply.dates');
  const tn = useTranslations('apply.nav');

  const typeName =
    classificationType === 'PERFECTIONNEMENT'
      ? td('typePerfectionnement')
      : classificationType === 'PFE'
        ? td('typePfe')
        : td('typeObservation');

  return (
    <StepShell eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')}>
      <Card>
        <Input
          id="apply-project-theme"
          label={t('projectTheme')}
          hint={
            themeRequired
              ? t('projectThemeRequired', {type: typeName})
              : t('projectThemeOptional')
          }
          placeholder={t('themePlaceholder')}
          name="proposedTheme"
          required={themeRequired}
          value={theme}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
        {(classificationType === 'OBSERVATION' || classificationType === 'PERFECTIONNEMENT' || classificationType === 'PFE') && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            {t('requirementValue', {
              value:
                classificationType === 'OBSERVATION'
                  ? td('requirementOptional')
                  : td('requirementObligatoire'),
            })}
          </p>
        )}
      </Card>

      <div className="flex flex-col gap-2">
        <label className={cx('flex items-start gap-3 text-sm font-medium text-zinc-800 dark:text-zinc-100', themeRequired && !theme.trim() && 'opacity-50')}>
          <input
            type="checkbox"
            checked={confirmed}
            disabled={themeRequired && !theme.trim()}
            onChange={(e) => onConfirm(e.target.checked)}
            aria-invalid={errorKey ? true : undefined}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-300 accent-brand-600 dark:accent-brand-500"
          />
          <span>{t('confirmLabel')}</span>
        </label>
        <FieldError message={errorKey ?? undefined} />
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          onClick={onContinue}
          disabled={!confirmed || (themeRequired && !theme.trim())}
        >
          {tn('continue')}
        </Button>
      </div>
    </StepShell>
  );
}
