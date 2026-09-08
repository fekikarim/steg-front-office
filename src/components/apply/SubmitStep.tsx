'use client';

import {useTranslations} from 'next-intl';
import {Card} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {StepShell} from './StepShell';
import {FieldError} from '@/components/ui/FieldError';
import {Link} from '@/i18n/navigation';

interface SubmitStepProps {
  submitting: boolean;
  submittedReference: string | null;
  errorKey: string | null;
  onSubmit: () => void;
}

/**
 * Step 8 — Final submission. Confirmation screen after the application has
 * been submitted, showing the reference number and next steps.
 */
export function SubmitStep({
  submitting,
  submittedReference,
  errorKey,
  onSubmit,
}: SubmitStepProps) {
  const t = useTranslations('apply.submit');

  return (
    <StepShell eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')}>
      {submittedReference ? (
        <Card>
          <div className="flex flex-col items-center gap-3 text-center">
            <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              ✓
            </span>
            <h2 className="text-lg font-bold text-navy-900 dark:text-zinc-50">{t('successTitle')}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{t('successBody')}</p>
            <p className="rounded-lg bg-zinc-50 px-4 py-2 font-mono text-sm font-semibold text-navy-900 dark:bg-white/5 dark:text-zinc-50" dir="ltr">
              {t('successReference', {reference: submittedReference})}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{t('successNext')}</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Link href="/applications">
                <Button variant="primary" size="md">
                  {t('viewApplications')}
                </Button>
              </Link>
              <Link href="/">
                <Button variant="secondary" size="md">
                  {t('goHome')}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-300">{t('intro')}</p>
            <Button
              variant="success"
              size="lg"
              onClick={onSubmit}
              loading={submitting}
              loadingLabel={t('submitting')}
            >
              {t('submitButton')}
            </Button>
            {errorKey && <FieldError message={errorKey} />}
          </div>
        </Card>
      )}
    </StepShell>
  );
}
