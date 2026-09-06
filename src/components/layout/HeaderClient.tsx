'use client';

import {useState, type ReactNode} from 'react';
import {Link} from '@/i18n/navigation';
import {LangSwitcher} from './LangSwitcher';
import {ThemeToggle} from './ThemeToggle';
import {Button} from '@/components/ui/Button';

interface Labels {
  home: string;
  internships: string;
  companion: string;
  apply: string;
  signIn: string;
  createAccount: string;
  skipToContent: string;
  openMenu: string;
  closeMenu: string;
}

/**
 * Institutional header: brand mark (never mirrored in RTL), primary nav,
 * language + theme selectors, auth entry points, mobile drawer (UI_UX §10.2).
 */
export function HeaderClient({labels, logo}: {labels: Labels; logo: ReactNode}) {
  const [open, setOpen] = useState(false);

  const links = [
    {href: '/', label: labels.home},
    {href: '/internships', label: labels.internships},
    {href: '/companion', label: labels.companion},
  ];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
      >
        {labels.skipToContent}
      </a>
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-navy-950/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="STEG" className="shrink-0">
            {logo}
          </Link>
          <nav aria-label="primary" className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-navy-900 dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <LangSwitcher />
            <ThemeToggle />
            <Link href="/login">
              <Button variant="tertiary" size="sm">
                {labels.signIn}
              </Button>
            </Link>
            <Link href="/apply">
              <Button variant="primary" size="sm">
                {labels.apply}
              </Button>
            </Link>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100 md:hidden dark:text-zinc-200 dark:hover:bg-white/10"
            aria-expanded={open}
            aria-label={open ? labels.closeMenu : labels.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" className="text-xl">
              {open ? '✕' : '☰'}
            </span>
          </button>
        </div>
        {open && (
          <nav aria-label="mobile" className="border-t border-zinc-200 px-4 py-3 md:hidden dark:border-zinc-800">
            <ul className="flex flex-col gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-white/10"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="flex items-center gap-2 pt-2">
                <LangSwitcher />
                <ThemeToggle />
              </li>
              <li className="flex gap-2 pt-2">
                <Link href="/login" onClick={() => setOpen(false)} className="flex-1">
                  <Button variant="tertiary" size="sm" className="w-full">
                    {labels.signIn}
                  </Button>
                </Link>
                <Link href="/apply" onClick={() => setOpen(false)} className="flex-1">
                  <Button variant="primary" size="sm" className="w-full">
                    {labels.apply}
                  </Button>
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
