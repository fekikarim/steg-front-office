'use client';

import {useTranslations} from 'next-intl';
import {Card} from '@/components/ui/Card';
import {Input} from '@/components/ui/Input';
import {Button} from '@/components/ui/Button';
import {FieldError} from '@/components/ui/FieldError';
import {StepShell} from './StepShell';
import type {PersonalInfoDraft} from '@/lib/apply-wizard';

interface PersonalStepProps {
  data: PersonalInfoDraft;
  onChange: (patch: Partial<PersonalInfoDraft>) => void;
  isPrefilled: boolean;
  errorKey: string | null;
  onContinue: () => void;
}

/**
 * Step 1 — Personal Information.
 * Collects candidate's full name, CIN / national ID, contact information,
 * and date of birth. Shows profile prefill note when authenticated.
 */
export function PersonalStep({
  data,
  onChange,
  isPrefilled,
  errorKey,
  onContinue,
}: PersonalStepProps) {
  const t = useTranslations('apply.personal');
  const ta = useTranslations('apply');
  const tn = useTranslations('apply.nav');

  return (
    <StepShell eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')}>
      {isPrefilled && (
        <div
          role="status"
          className="mb-4 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/70 p-4 text-xs leading-relaxed text-brand-900 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-200"
        >
          <span className="text-base">ℹ️</span>
          <span>{ta('prefillNote')}</span>
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* First Name */}
          <Input
            id="first-name"
            label={t('firstName')}
            type="text"
            value={data.firstName}
            onChange={(e) => onChange({firstName: e.target.value})}
            placeholder="Mohamed"
            autoComplete="given-name"
            required
          />

          {/* Last Name */}
          <Input
            id="last-name"
            label={t('lastName')}
            type="text"
            value={data.lastName}
            onChange={(e) => onChange({lastName: e.target.value})}
            placeholder="Ben Ali"
            autoComplete="family-name"
            required
          />

          {/* CIN / National ID */}
          <Input
            id="national-id"
            label={t('cin')}
            type="text"
            value={data.nationalId}
            onChange={(e) => onChange({nationalId: e.target.value})}
            placeholder="09876543"
            required
          />

          {/* Phone Number */}
          <Input
            id="phone"
            label={t('phone')}
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({phone: e.target.value})}
            placeholder="+216 98 123 456"
            autoComplete="tel"
            required
          />

          {/* Email Address */}
          <div className="sm:col-span-2">
            <Input
              id="email"
              label={t('email')}
              type="email"
              value={data.email}
              onChange={(e) => onChange({email: e.target.value})}
              placeholder="mohamed.benali@esprit.tn"
              autoComplete="email"
              required
            />
          </div>

          {/* Birth Date */}
          <Input
            id="birth-date"
            label={t('birthDate')}
            type="date"
            value={data.birthDate}
            onChange={(e) => onChange({birthDate: e.target.value})}
            autoComplete="bday"
            required
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
