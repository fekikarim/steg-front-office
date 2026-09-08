'use client';

import {Link} from '@/i18n/navigation';
import {Button} from '../ui/Button';
import {AuthCard, AuthHeader} from './AuthCard';

interface ForgotLabels {
  title: string;
  subtitle: string;
  unavailableTitle: string;
  unavailableBody: string;
  backlink: string;
  contactSupport: string;
}

/**
 * Forgot-password pending flow.
 *
 * The backend does not yet expose a password-reset endpoint (see the IAM
 * contract in the plan). Per B2 task 5, we must NOT pretend an email was sent,
 * so this screen gives honest, professional status: the capability is coming
 * in a later phase and the candidate is pointed to help. It will be replaced
 * by the real flow when the backend endpoint lands.
 *
 * TODO — backend endpoint pending (forgot/reset).
 */
export function ForgotPasswordForm({labels}: {labels: ForgotLabels}) {
  return (
    <AuthCard>
      <AuthHeader title={labels.title} subtitle={labels.subtitle} />
      <div className="flex w-full flex-col gap-5">
        <div
          role="status"
          className="flex w-full flex-col gap-2 rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm dark:border-brand-900/60 dark:bg-brand-950/40"
        >
          <span className="font-semibold text-brand-800 dark:text-brand-200">{labels.unavailableTitle}</span>
          <span className="text-zinc-700 dark:text-zinc-300">{labels.unavailableBody}</span>
        </div>
        <div className="flex w-full flex-col gap-3">
          <Button type="button" variant="secondary" size="lg" disabled aria-disabled="true">
            {labels.title}
          </Button>
          <Link
            href="/login"
            className="text-center text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
          >
            {labels.backlink}
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
