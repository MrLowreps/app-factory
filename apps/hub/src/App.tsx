import { useMemo, useState } from 'react';
import appsData from './generated/apps.json';
import { site } from './site.config';
import type { AppEntry, Platform } from './types';
import { AppCard } from './components/AppCard';
import { ThemeToggle } from './components/ThemeToggle';

type Filter = 'all' | 'web' | 'mobile';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'スマホ' },
];

const matches = (platforms: Platform[], filter: Filter) =>
  filter === 'all' ||
  (filter === 'web' ? platforms.includes('web') : platforms.some((p) => p !== 'web'));

// 制作中 (wip) のアプリは開発サーバーでだけ表示する
const allApps = (appsData as AppEntry[]).filter(
  (app) => app.status === 'published' || import.meta.env.DEV,
);

export function App() {
  const [filter, setFilter] = useState<Filter>('all');
  const apps = useMemo(() => allApps.filter((a) => matches(a.platforms, filter)), [filter]);
  const publishedCount = allApps.filter((a) => a.status === 'published').length;

  return (
    <div className="page">
      <header className="site-header">
        <a className="brand" href="/">
          <img src="/favicon.svg" alt="" width={28} height={28} />
          <span>{site.title}</span>
        </a>
        <nav className="site-nav">
          {site.links.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
          <ThemeToggle />
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1 className="hero-title">{site.tagline}</h1>
          <p className="hero-meta">
            公開済み <strong>{publishedCount}</strong> 本 · by {site.author}
          </p>
        </section>

        <div className="filters" role="tablist" aria-label="種類で絞り込む">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              className="chip"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {apps.length > 0 ? (
          <ul className="app-grid">
            {apps.map((app) => (
              <li key={app.slug}>
                <AppCard app={app} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">
            <p className="empty-title">最初のアプリを準備中です</p>
            <p className="empty-body">公開したらここに並びます。お楽しみに。</p>
          </div>
        )}
      </main>

      <footer className="site-footer">© {new Date().getFullYear()} {site.author}</footer>
    </div>
  );
}
