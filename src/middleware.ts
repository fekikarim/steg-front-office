import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, static assets and files with extensions.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
