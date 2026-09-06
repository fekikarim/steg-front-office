'use client';

import type {ButtonHTMLAttributes, ReactNode} from 'react';
import {cx} from '@/lib/cx';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'success' | 'icon';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400',
  secondary:
    'border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-navy-900 dark:text-zinc-100 dark:hover:bg-navy-800',
  tertiary: 'text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-white/5',
  destructive: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500',
  icon: 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  loadingLabel?: string;
  iconOnlyLabel?: string;
  children: ReactNode;
}

/**
 * Shared button (UI_UX §9.1). Verb labels, loading state with aria-busy, and
 * icon-only usage requires `iconOnlyLabel` for screen readers.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel,
  iconOnlyLabel,
  className,
  disabled,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  const isIcon = variant === 'icon';
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={isIcon ? iconOnlyLabel : undefined}
      title={isIcon ? iconOnlyLabel : undefined}
      className={cx(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        isIcon ? 'h-10 w-10 rounded-full' : SIZES[size],
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
