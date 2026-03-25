import type { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../../i18n/LanguageProvider';

const routerBasename =
  import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <LanguageProvider>
      <BrowserRouter basename={routerBasename}>{children}</BrowserRouter>
    </LanguageProvider>
  );
}
