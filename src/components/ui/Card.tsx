'use client';

import type {ReactNode} from 'react';
import {cx} from '@/lib/cx';

interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}

/** Content card (UI_UX §9.5): purpose, concise title, consistent padding. */
export function Card({title, subtitle, action, children, className, labelledBy}: CardProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cx(
        'flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6',
        'dark:border-zinc-800 dark:bg-navy-900 dark:shadow-none',
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            {title && (
              <h2 id={labelledBy} className="text-base font-bold text-navy-900 dark:text-zinc-50">
                {title}
              </h2>
            )}
            {subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
