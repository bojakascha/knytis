import type { PropsWithChildren, ReactNode } from 'react';
import { LanguageToggle } from '../LanguageToggle';
import { OccasionSwitcher } from '../OccasionSwitcher';

interface AppShellProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  aside?: ReactNode;
}

export function AppShell({ title, subtitle, aside, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <div className="hero-title-row">
            <h1>{title}</h1>
            <OccasionSwitcher />
          </div>
          {subtitle ? <p className="hero-copy">{subtitle}</p> : null}
        </div>
        <div className="hero-side">
          {aside}
          <LanguageToggle />
        </div>
      </header>
      <main className="page-grid">{children}</main>
    </div>
  );
}
