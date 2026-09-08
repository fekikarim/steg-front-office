'use client';

import {useMemo} from 'react';
import {useTranslations} from 'next-intl';
import {Card} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {DatePicker} from '@/components/ui/DatePicker';
import {Badge} from '@/components/ui/Badge';
import {StepShell} from './StepShell';
import {FieldError} from '@/components/ui/FieldError';
import {cx} from '@/lib/cx';
import type {ClassificationResult} from '@/lib/api/application';

interface DatesStepProps {
  startDate: string;
  endDate: string;
  classification: ClassificationResult | null;
  confirmed: boolean;
  onChange: (start: string, end: string) => void;
  onConfirm: (value: boolean) => void;
  errorKey: string | null;
  onContinue: () => void;
}

/**
 * Step 3 — Internship dates + automatic classification. The type is computed
 * client-side from the chosen duration (mirroring the backend rule) and shown
 * to the candidate as an informative preview. The backend remains the
 * authority and will re-classify authoritatively at approval time.
 */
export function DatesStep({
  startDate,
  endDate,
  classification,
  confirmed,
  onChange,
  onConfirm,
  errorKey,
  onContinue,
}: DatesStepProps) {
  const t = useTranslations('apply.dates');
  const tn = useTranslations('apply.nav');

  const startInvalid = Boolean(startDate && endDate && endDate < startDate);

  const typeLabel = useMemo(() => {
    if (!classification) return null;
    switch (classification.type) {
      case 'OBSERVATION':
        return t('typeObservation');
      case 'PERFECTIONNEMENT':
        return t('typePerfectionnement');
      case 'PFE':
        return t('typePfe');
    }
  }, [classification, t]);

  const typeDesc = useMemo(() => {
    if (!classification) return null;
    switch (classification.type) {
      case 'OBSERVATION':
        return t('obsDesc');
      case 'PERFECTIONNEMENT':
        return t('perfDesc');
      case 'PFE':
        return t('pfeDesc');
    }
  }, [classification, t]);

  const durLabel = useMemo(() => {
    if (!classification) return null;
    if (classification.type === 'OBSERVATION') {
      return t('durationDays', {count: classification.durationInDays});
    }
    const months = Math.floor(classification.durationInDays / 30);
    const days = classification.durationInDays % 30;
    return t('durationMonths', {months: Math.max(months, 1), days});
  }, [classification, t]);

  return (
    <StepShell eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')}>
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <DatePicker
            id="apply-start-date"
            label={t('startDate')}
            hint={t('startHint')}
            value={startDate}
            onChange={(e) => onChange(e.target.value, endDate)}
          />
          <DatePicker
            id="apply-end-date"
            label={t('endDate')}
            hint={t('endHint')}
            value={endDate}
            min={startDate}
            error={startInvalid ? t('errorEndBeforeStart') : undefined}
            onChange={(e) => onChange(startDate, e.target.value)}
          />
        </div>
      </Card>

      {classification && !startInvalid && (
        <Card
          title={
            <span className="flex items-center gap-2">
              {t('classificationTitle')}
              <Badge tone={classification.type === 'PFE' ? 'brand' : classification.type === 'PERFECTIONNEMENT' ? 'info' : 'neutral'}>
                {typeLabel}
              </Badge>
            </span>
          }
          subtitle={t('classificationHint')}
        >
          <div className="flex flex-col gap-3">
            <p className="text-sm text-zinc-700 dark:text-zinc-200">{typeDesc}</p>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-zinc-50 p-3 dark:bg-white/5">
                <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t('durationDays', {count: classification.durationInDays})}</dt>
                <dd className="mt-1 font-semibold text-navy-900 dark:text-zinc-50">{durLabel}</dd>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3 dark:bg-white/5">
                <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t('requirementLabel')}</dt>
                <dd className="mt-1 font-semibold text-navy-900 dark:text-zinc-50">
                  {classification.requirement === 'OBLIGATOIRE'
                    ? t('requirementObligatoire')
                    : t('requirementOptional')}
                </dd>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3 dark:bg-white/5">
                <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                  {classification.paymentEligible ? t('paymentEligible') : t('paymentNotEligible')}
                </dt>
                <dd className="mt-1 font-semibold text-navy-900 dark:text-zinc-50">
                  {classification.paymentEligible ? '✓' : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        <label className={cx('flex items-start gap-3 text-sm font-medium text-zinc-800 dark:text-zinc-100', startInvalid && 'opacity-50')}>
          <input
            type="checkbox"
            checked={confirmed}
            disabled={startInvalid}
            onChange={(e) => onConfirm(e.target.checked)}
            aria-invalid={errorKey ? true : undefined}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-300 accent-brand-600 dark:accent-brand-500"
          />
          <span>{t('confirmLabel')}</span>
        </label>
        <FieldError message={errorKey ?? undefined} />
      </div>

      <div className="flex justify-end">
        <Button variant="primary" size="md" onClick={onContinue} disabled={!confirmed || startInvalid}>
          {tn('continue')}
        </Button>
      </div>
    </StepShell>
  );
}
