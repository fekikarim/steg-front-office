'use client';

import {useTranslations} from 'next-intl';
import {Card} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {Link} from '@/i18n/navigation';
import {StepShell} from './StepShell';
import {FieldError} from '@/components/ui/FieldError';
import {cx} from '@/lib/cx';
import type {CandidateProfile, University} from '@/lib/api/candidate';

interface PersonalStepProps {
  profile: CandidateProfile | null;
  universities: University[];
  confirmed: boolean;
  onChange: (value: boolean) => void;
  errorKey: string | null;
  onContinue: () => void;
}

function Row({label, value}: {label: string; value?: string | null}) {
  const t = useTranslations('apply.personal');
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-zinc-100 py-2 text-sm last:border-0 dark:border-zinc-800">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-end font-medium text-zinc-800 dark:text-zinc-100">
        {value?.trim() ? value : <span className="text-zinc-400 dark:text-zinc-500">{t('emptyValue')}</span>}
      </dd>
    </div>
  );
}

/**
 * Step 2 — Personal & academic confirmation. Loads the candidate's profile
 * from the backend and asks them to confirm the data before continuing.
 */
export function PersonalStep({
  profile,
  universities,
  confirmed,
  onChange,
  errorKey,
  onContinue,
}: PersonalStepProps) {
  const t = useTranslations('apply.personal');
  const tn = useTranslations('apply.nav');

  const universityName =
    profile && universities.length > 0
      ? universities.find((u) => u.id === profile.universityId)?.name ?? null
      : null;

  return (
    <StepShell eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')}>
      <Card>
        <dl>
          <Row label={t('firstName')} value={profile?.firstName} />
          <Row label={t('lastName')} value={profile?.lastName} />
          <Row label={t('email')} value={profile?.email} />
          <Row label={t('phone')} value={profile?.phone} />
          <Row label={t('birthDate')} value={profile?.birthDate} />
          <Row label={t('university')} value={universityName} />
          <Row label={t('speciality')} value={profile?.speciality} />
          <Row label={t('diploma')} value={profile?.diploma} />
        </dl>
        <div className="flex justify-end pt-4">
          <Link href="/profile">
            <Button variant="tertiary" size="sm">
              {t('editProfile')}
            </Button>
          </Link>
        </div>
      </Card>

      <div className="flex flex-col gap-2">
        <label className="flex items-start gap-3 text-sm font-medium text-zinc-800 dark:text-zinc-100">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => onChange(e.target.checked)}
            aria-invalid={errorKey ? true : undefined}
            className={cx(
              'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-300 accent-brand-600 dark:accent-brand-500',
              errorKey && 'border-accent-600',
            )}
          />
          <span>{t('confirmLabel')}</span>
        </label>
        <FieldError message={errorKey ?? undefined} />
      </div>

      <div className="flex justify-end">
        <Button variant="primary" size="md" onClick={onContinue} disabled={!confirmed}>
          {tn('continue')}
        </Button>
      </div>
    </StepShell>
  );
}
