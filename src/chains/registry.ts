import type { ChainService, Chain } from '@/types/chain';

const serviceModules = import.meta.glob('./service/*.json', {
  eager: true,
  import: 'default'
}) as Record<string, ChainService>;

const guideModules = import.meta.glob('./guide/*.md', {
  eager: true,
  import: 'default',
  query: '?raw'
}) as Record<string, string>;

const extractSlug = (path: string): string | null => {
  const match = path.match(/\/([^/]+)\.[^/]+$/);
  return match ? match[1].toLowerCase() : null;
};

const serviceRegistry = new Map<string, ChainService>();
for (const [path, service] of Object.entries(serviceModules)) {
  const slug = extractSlug(path);
  if (slug) {
    serviceRegistry.set(slug, service);
  }
}

const guideRegistry = new Map<string, string>();
for (const [path, guide] of Object.entries(guideModules)) {
  const slug = extractSlug(path);
  if (slug) {
    guideRegistry.set(slug, guide);
  }
}

const chainSlugs = Array.from(new Set<string>([
  ...serviceRegistry.keys(),
  ...guideRegistry.keys()
])).sort((a, b) => a.localeCompare(b));

export const getChainSlugs = () => chainSlugs;

export const getChainService = (slug: string): ChainService | null => {
  return serviceRegistry.get(slug) ?? null;
};

export const getChainGuide = (slug: string): string | null => {
  return guideRegistry.get(slug) ?? null;
};

export const hasChainGuide = (slug: string): boolean => guideRegistry.has(slug);

export const getAllChains = (includeGuides = false): Chain[] => {
  return chainSlugs.map((slug) => ({
    slug,
    service: getChainService(slug),
    guide: includeGuides ? getChainGuide(slug) : null,
    hasGuide: hasChainGuide(slug)
  }));
};
