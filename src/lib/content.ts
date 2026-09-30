import type { CollectionEntry } from 'astro:content';
import { sitePath } from './urls';

export type Evidence = CollectionEntry<'evidence'>;
export type Figure = CollectionEntry<'figures'>;
export type Material = CollectionEntry<'materials'>;
export type Project = CollectionEntry<'projects'>;

export const projectUrl = (slug: string) => sitePath(`/projects/${slug}/`);
export const byId = <T extends { id: string; data?: { id?: string } }>(items: T[]) => new Map(items.map((item) => [item.data?.id ?? item.id, item]));
export const ordered = <T extends { id: string; data?: { id?: string } }>(ids: string[], items: T[]) => {
  const map = byId(items);
  return ids.map((id) => map.get(id)).filter((item): item is T => Boolean(item));
};
export const statusLabel: Record<string, string> = {
  SUPPORTED: '支持', INTERNALLY_VERIFIED: '内部核验', NEGATIVE_RESULT: '负结果',
  CORRECTED: '已更正', WITHDRAWN: '已撤回', UNRESOLVED: '尚无定论'
};
