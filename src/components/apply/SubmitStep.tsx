'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Card} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {Input} from '@/components/ui/Input';
import {StepShell} from './StepShell';
import {FieldError} from '@/components/ui/FieldError';
import {Link} from '@/i18n/navigation';
import {IconArrowRight, IconSparkles} from '@/components/ui/icons';

interface SubmitStepProps {
  isAuthenticated: boolean;
  submitting: boolean;
  submittedReference: string | null;
  candidateEmail: string;
  errorKey: string | null;
  onSubmit: () => void;
  onAnonymousSubmit: (password: string, isNewAccount: boolean) => Promise<void>;
}

/**
 * Step 7 — Submission Result & Anonymous Bridge.
 * If authenticated: Submits the draft to the backend and displays the official reference code.
 * If anonymous: Bridges seamlessly via account creation or login without losing any entered data.
 *
 * // TODO — BACKEND SUPPORT REQUIRED: Anonymous application submission endpoint without prior authentication.
 */
export function SubmitStep({
  isAuthenticated,
  submitting,
  submittedReference,
  candidateEmail,
  errorKey,
  onSubmit,
  onAnonymousSubmit,
}: SubmitStepProps) {
  const t = useTranslations('apply.submit');
  const ta = useTranslations('apply');
  const [password, setPassword] = useState('');
  const [isNewAccount, setIsNewAccount] = useState(true);
  const [bridgeSubmitting, setBridgeSubmitting] = useState(false);
  const [bridgeError, setBridgeError] = useState<string | null>(null);

  async function handleBridgeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || password.length < 6) {
      setBridgeError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    setBridgeError(null);
    setBridgeSubmitting(true);
    try {
      await onAnonymousSubmit(password, isNewAccount);
    } catch (err: unknown) {
      setBridgeError(err instanceof Error ? err.message : 'Erreur lors de la finalisation.');
    } finally {
      setBridgeSubmitting(false);
    }
  }

  return (
    <StepShell eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')}>
      {submittedReference ? (
        /* SUCCESS CONFIRMATION STATE */
        <Card className="items-center text-center">
          <div className="flex flex-col items-center gap-4 py-6">
            <span
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 animate-in zoom-in-50"
            >
              ✓
            </span>

            <h2 className="text-xl font-extrabold text-navy-900 sm:text-2xl dark:text-zinc-50">
              {ta('submitSuccessTitle')}
            </h2>

            <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-300">
              {ta('submitSuccessSubtitle')}
            </p>

            <div className="rounded-2xl border border-brand-200 bg-brand-50/70 px-6 py-4 dark:border-brand-800 dark:bg-brand-950/40">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {ta('submitRefLabel')}
              </span>
              <p className="font-mono text-xl font-extrabold tracking-wider text-brand-700 dark:text-brand-300" dir="ltr">
                {submittedReference}
              </p>
            </div>

            {/* Next Steps Guidance */}
            <div className="mt-2 w-full max-w-lg rounded-2xl border border-zinc-200 bg-zinc-50/80 p-5 text-start dark:border-zinc-800 dark:bg-navy-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 dark:text-zinc-100">
                {ta('submitNextStepsTitle')}
              </h3>
              <ul className="mt-3 flex flex-col gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-emerald-600">✓</span>
                  <span>{ta('submitNextStep1')}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-emerald-600">✓</span>
                  <span>{ta('submitNextStep2')}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-emerald-600">✓</span>
                  <span>{ta('submitNextStep3')}</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link href="/applications">
                <Button variant="primary" size="md" className="hover-lift shadow-sm">
                  {ta('submitTrackBtn')}
                  <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
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
      ) : isAuthenticated ? (
        /* AUTHENTICATED SUBMISSION */
        <Card className="items-center text-center">
          <div className="flex flex-col items-center gap-5 py-6">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <IconSparkles className="h-7 w-7" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-navy-900 dark:text-zinc-50">
                Prêt pour la transmission officielle
              </h3>
              <p className="max-w-md text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Votre dossier est complet et vos pièces justificatives sont attachées. Cliquez ci-dessous pour transmettre votre candidature aux équipes de la STEG.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={onSubmit}
              loading={submitting}
              loadingLabel={t('submitting')}
              className="shadow-md hover-lift"
            >
              {t('submitButton')}
              <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>

            {errorKey && <FieldError message={errorKey} />}
          </div>
        </Card>
      ) : (
        /* ANONYMOUS CANDIDATE BRIDGING */
        <Card>
          <form onSubmit={(e) => void handleBridgeSubmit(e)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-bold text-navy-900 dark:text-zinc-50">
                {ta('anonymousAuthBridgeTitle')}
              </h3>
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {ta('anonymousAuthBridgeDesc')}
              </p>
            </div>

            <div className="flex gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsNewAccount(true)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  isNewAccount
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                }`}
              >
                Créer un compte
              </button>
              <button
                type="button"
                onClick={() => setIsNewAccount(false)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  !isNewAccount
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                }`}
              >
                Se connecter
              </button>
            </div>

            <Input
              label="Adresse e-mail"
              type="email"
              value={candidateEmail}
              disabled
              className="bg-zinc-100 dark:bg-zinc-800"
            />

            <Input
              id="bridge-password"
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {bridgeError && <FieldError message={bridgeError} />}
            {errorKey && <FieldError message={errorKey} />}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={bridgeSubmitting}
                className="w-full justify-center shadow-md"
              >
                {isNewAccount ? ta('anonymousCreateAccountBtn') : ta('anonymousSignInBtn')}
                <IconArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </StepShell>
  );
}
