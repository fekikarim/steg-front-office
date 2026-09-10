import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {IconMail, IconPhone} from '@/components/ui/icons';

/**
 * Institutional footer (UI_UX §10.3.8): brand + tagline, quick navigation,
 * contact information, and legal/copyright bar. Links use locale-aware router.
 */
export async function Footer() {
  const tf = await getTranslations('footer');
  const tn = await getTranslations('nav');
  const year = new Date().getFullYear();

  const navLinks = [
    {href: '/', label: tf('linkHome')},
    {href: '/about', label: tf('linkAbout')},
    {href: '/history', label: tf('linkHistory')},
    {href: '/internships', label: tf('linkInternships')},
    {href: '/faq', label: tf('linkFaq')},
    {href: '/contact', label: tf('linkContact')},
  ];

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-navy-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="flex flex-col gap-3">
            <Image
              src="/logo/logo-steg-1200x327.png"
              alt="STEG"
              width={1200}
              height={327}
              className="h-9 w-auto self-start"
            />
            <p className="max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {tf('tagline')}
            </p>
          </div>

          <nav aria-label="footer" className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-900 dark:text-zinc-100">
              {tf('navHeading')}
            </h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-600 hover:text-brand-700 hover:underline dark:text-zinc-300 dark:hover:text-brand-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-900 dark:text-zinc-100">
              {tf('contactHeading')}
            </h2>
            <ul className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <li>
                <a
                  href={`mailto:${tf('contactEmail')}`}
                  className="inline-flex items-center gap-2 hover:text-brand-700 hover:underline dark:hover:text-brand-300"
                  dir="ltr"
                >
                  <IconMail className="h-4 w-4 shrink-0" />
                  <span>{tf('contactEmail')}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${tf('contactPhone').replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-2 hover:text-brand-700 hover:underline dark:hover:text-brand-300"
                  dir="ltr"
                >
                  <IconPhone className="h-4 w-4 shrink-0" />
                  <span>{tf('contactPhone')}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            © {year} STEG — {tf('rights')}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {tn('home')} · {tn('internships')} · {tn('companion')}
          </p>
        </div>
      </div>
    </footer>
  );
}