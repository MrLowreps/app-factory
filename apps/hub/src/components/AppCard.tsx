import type { AppEntry, Platform } from '../types';

const PLATFORM_LABEL: Record<Platform, string> = {
  web: 'Web',
  ios: 'iOS',
  android: 'Android',
};

export function AppCard({ app }: { app: AppEntry }) {
  const primaryLink = app.links?.web ?? app.links?.ios ?? app.links?.android;
  const date = app.publishedAt?.replaceAll('-', '.');

  return (
    <article className="app-card">
      <div className="app-card-thumb" aria-hidden={!app.thumbnail}>
        {app.thumbnail ? (
          <img src={app.thumbnail} alt={`${app.name} のスクリーンショット`} loading="lazy" />
        ) : (
          <span className="app-card-initial">{app.name.slice(0, 1)}</span>
        )}
      </div>
      <div className="app-card-body">
        <div className="app-card-meta">
          {app.status === 'wip' && <span className="badge badge-wip">制作中</span>}
          {app.platforms.map((p) => (
            <span key={p} className="badge">
              {PLATFORM_LABEL[p]}
            </span>
          ))}
          {date && <time dateTime={app.publishedAt}>{date}</time>}
        </div>
        <h2 className="app-card-title">
          {primaryLink ? (
            <a href={primaryLink} target="_blank" rel="noreferrer">
              {app.name}
            </a>
          ) : (
            app.name
          )}
        </h2>
        <p className="app-card-desc">{app.description}</p>
        {app.links && Object.keys(app.links).length > 1 && (
          <div className="app-card-links">
            {(Object.entries(app.links) as [Platform, string][]).map(([p, href]) => (
              <a key={p} href={href} target="_blank" rel="noreferrer">
                {PLATFORM_LABEL[p]}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
