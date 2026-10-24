export type Platform = 'web' | 'ios' | 'android';

/** apps/<slug>/factory.json の中身 (+ 収集時に付く slug) */
export interface AppEntry {
  slug: string;
  name: string;
  description: string;
  platforms: Platform[];
  status: 'wip' | 'published';
  publishedAt?: string;
  links?: Partial<Record<Platform, string>>;
  thumbnail?: string | null;
  tags?: string[];
}
