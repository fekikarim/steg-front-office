'use client';

import {useTranslations} from 'next-intl';
import {useLocale} from 'next-intl';
import {cx} from '@/lib/cx';

export interface StepDef {
  id: string;
  key: string;
}

interface StepperProps {
  steps: StepDef[];
  current: number;
}

/**
 * Wizard progress stepper (B4, compacted in B5). Numbered milestones stay
 * readable down to small phones: pills carry number-only badges (labels are
 * screen-reader-only) and a visible caption announces "Step X of 8 — label".
 * Full text labels inside every pill never fit an 8-step row (they overflow
 * even desktop content columns), so they live in the caption instead.
 * RTL-aware (logical flex direction). Each milestone carries aria-current
 * for the active step.
 */
export function Stepper({steps, current}: StepperProps) {
  const t = useTranslations('apply.stepper');
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const label = (k: string) => (t as (key: string) => string)(`steps.${k}`);

  return (
    <nav
      aria-label={t('step')}
      dir={dir}
      className="mb-8 w-full"
    >
      <p className="mb-3 text-sm font-semibold text-navy-900 dark:text-zinc-50">
        {t('step')} {current + 1} {t('of', {total: steps.length})}
        <span className="font-normal text-zinc-500 dark:text-zinc-400"> — {label(steps[current]?.key ?? '')}</span>
      </p>
      <ol className="flex items-center gap-0.5 sm:gap-1">
        {steps.map((step, i) => {
          const state =
            i < current ? 'done' : i === current ? 'current' : 'upcoming';
          const isLast = i === steps.length - 1;
          return (
            <li
              key={step.id}
              aria-current={state === 'current' ? 'step' : undefined}
              className={cx('flex min-w-0 items-center gap-0.5 sm:gap-1', !isLast && 'flex-1')}
            >
              <div
                className={cx(
                  'flex min-w-0 items-center gap-2 rounded-full px-1 py-1 sm:px-2',
                  state === 'current' &&
                    'bg-brand-50 ring-1 ring-brand-600 dark:bg-white/5 dark:ring-brand-400',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold sm:h-6 sm:w-6 sm:text-xs',
                    state === 'done' && 'bg-brand-600 text-white dark:bg-brand-500',
                    state === 'current' &&
                      'border-2 border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300',
                    state === 'upcoming' &&
                      'border-2 border-zinc-300 text-zinc-500 dark:border-zinc-600 dark:text-zinc-400',
                  )}
                >
                  {state === 'done' ? (
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3 sm:h-3.5 sm:w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="sr-only">{label(step.key)}</span>
                {state === 'current' && (
                  <span className="sr-only">
                    {t('of', {total: steps.length})}
                  </span>
                )}
              </div>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cx(
                    'h-0.5 min-w-2 flex-1 rounded',
                    state === 'done' || i + 1 === current
                      ? 'bg-brand-500 dark:bg-brand-400'
                      : 'bg-zinc-200 dark:bg-zinc-700',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
