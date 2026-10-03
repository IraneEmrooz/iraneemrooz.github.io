import type { ReactNode } from 'react';
import { pageStack, t } from './ui';

export function InfoPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <article className={pageStack}>
      <header>
        <h1 className={t.title}>{title}</h1>
        {intro && <p className={`mt-4 ${t.bodyLg} text-stone-700`}>{intro}</p>}
      </header>
      {children}
    </article>
  );
}
export const InfoSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="grid gap-4">
    <h2 className={t.heading}>{title}</h2>
    <div className="grid gap-3 text-stone-800">{children}</div>
  </section>
);
