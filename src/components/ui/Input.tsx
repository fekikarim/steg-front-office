'use client';

import {useId, type InputHTMLAttributes} from 'react';
import {cx} from '@/lib/cx';
import {FieldError} from './FieldError';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
}

const CONTROL =
  'h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 placeholder:text-zinc-400 hover:border-zinc-400 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-70 dark:border-zinc-700 dark:bg-navy-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:disabled:bg-white/5';

/**
 * Accessible text input: associated label, helper text, and error message
 * wired via aria-describedby (UI_UX §9.2, §7).
 */
export function Input({label, hint, error, hideLabel = false, id, required, ...rest}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className={cx('text-sm font-semibold text-zinc-800 dark:text-zinc-100', hideLabel && 'sr-only')}
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ms-1 text-accent-600 dark:text-accent-100">
            *
          </span>
        )}
      </label>
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={cx(hintId, errorId) || undefined}
        className={cx(CONTROL, error && 'border-accent-600 dark:border-accent-100')}
        {...rest}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}
