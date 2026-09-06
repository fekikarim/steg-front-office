import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {HeaderClient} from './HeaderClient';

/** Server shell: translated nav labels; interactivity lives in HeaderClient. */
export async function Header() {
  const t = await getTranslations('nav');
  const th = await getTranslations('header');
  return (
    <HeaderClient
      labels={{
        home: t('home'),
        internships: t('internships'),
        companion: t('companion'),
        apply: t('apply'),
        signIn: t('signIn'),
        createAccount: t('createAccount'),
        skipToContent: th('skipToContent'),
        openMenu: th('openMenu'),
        closeMenu: th('closeMenu'),
      }}
      logo={
        <Image
          src="/logo/logo-steg-1200x327.png"
          alt="STEG"
          width={140}
          height={38}
          priority
          className="h-9 w-auto"
        />
      }
    />
  );
}
