import { useState, useEffect, useMemo, useCallback } from 'react';
import { Chain, ChainService } from '../types/chain';
import { SERVICE_PATH, GUIDE_PATH } from '../constants/cdn';

const extractSlugs = (html: string, extension: string): string[] => {
  const normalizedExt = extension.startsWith('.') ? extension : `.${extension}`;
  const filePattern = new RegExp(`href="([^"]+${normalizedExt})"`, 'gi');
  const slugs = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = filePattern.exec(html)) !== null) {
    const href = match[1];
    const fileName = href.split('/').filter(Boolean).pop();
    if (fileName && fileName.toLowerCase().endsWith(normalizedExt.toLowerCase())) {
      slugs.add(fileName.slice(0, -normalizedExt.length));
    }
  }

  return Array.from(slugs);
};

const fetchSlugsFromCdn = async (
  basePath: string,
  extension: string
): Promise<string[]> => {
  const response = await fetch(`${basePath}/`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load directory listing from ${basePath}`);
  }

  const html = await response.text();
  return extractSlugs(html, extension);
};

const fetchChainServices = async (
  slugs: string[]
): Promise<{ services: Map<string, ChainService>; errors: string[] }> => {
  const serviceEntries = await Promise.allSettled(
    slugs.map(async (slug) => {
      const response = await fetch(`${SERVICE_PATH}/${slug}.json`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load service data for ${slug}`);
      }
      const service = (await response.json()) as ChainService;
      return { slug, service };
    })
  );

  const services = new Map<string, ChainService>();
  const errors: string[] = [];
  for (const entry of serviceEntries) {
    if (entry.status === 'fulfilled') {
      services.set(entry.value.slug, entry.value.service);
    } else {
      errors.push(entry.reason instanceof Error ? entry.reason.message : String(entry.reason));
    }
  }
  return { services, errors };
};

const fetchChainGuides = async (
  slugs: string[]
): Promise<{ guides: Map<string, string>; errors: string[] }> => {
  const guideEntries = await Promise.allSettled(
    slugs.map(async (slug) => {
      const response = await fetch(`${GUIDE_PATH}/${slug}.md`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load guide for ${slug}`);
      }
      const guide = await response.text();
      return { slug, guide };
    })
  );

  const guides = new Map<string, string>();
  const errors: string[] = [];
  for (const entry of guideEntries) {
    if (entry.status === 'fulfilled') {
      guides.set(entry.value.slug, entry.value.guide);
    } else {
      errors.push(entry.reason instanceof Error ? entry.reason.message : String(entry.reason));
    }
  }
  return { guides, errors };
};

interface UseChainsOptions {
  includeGuides?: boolean;
}

export const useChains = (options: UseChainsOptions = {}) => {
  const { includeGuides = false } = options;
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadChains = async () => {
      try {
        setLoading(true);
        setError(null);

        const [serviceSlugs, guideSlugs] = await Promise.all([
          fetchSlugsFromCdn(SERVICE_PATH, '.json'),
          fetchSlugsFromCdn(GUIDE_PATH, '.md')
        ]);

        const [{ services, errors: serviceErrors }, guidesResult] = await Promise.all([
          fetchChainServices(serviceSlugs),
          includeGuides && guideSlugs.length
            ? fetchChainGuides(guideSlugs)
            : Promise.resolve({ guides: new Map<string, string>(), errors: [] as string[] })
        ]);

        const guideSlugSet = new Set(guideSlugs);
        const guides = guidesResult.guides;

        const allSlugs = new Set<string>([
          ...services.keys(),
          ...guideSlugSet
        ]);

        const chainData: Chain[] = Array.from(allSlugs).map((slug) => ({
          slug,
          service: services.get(slug) ?? null,
          guide: includeGuides ? guides.get(slug) ?? null : null,
          hasGuide: guideSlugSet.has(slug)
        }));

        if (!cancelled) {
          const aggregatedErrors = [
            ...serviceErrors,
            ...(guidesResult.errors ?? [])
          ];
          setError(aggregatedErrors.length ? aggregatedErrors.join('; ') : null);
          setChains(chainData.sort((a, b) => a.slug.localeCompare(b.slug)));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load chains');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadChains();

    return () => {
      cancelled = true;
    };
  }, []);

  const memoizedChains = useMemo(() => chains, [chains]);

  const getChain = useCallback((slug: string): Chain | undefined => {
    return memoizedChains.find(chain => chain.slug === slug);
  }, [memoizedChains]);

  return { chains: memoizedChains, loading, error, getChain };
};
