import { useCallback, useMemo } from 'react';
import type { Chain } from '@/types/chain';
import { getAllChains, getChainService, getChainGuide, hasChainGuide, getChainSlugs } from '@/chains/registry';

interface UseChainsOptions {
  includeGuides?: boolean;
}

export const useChains = (options: UseChainsOptions = {}) => {
  const { includeGuides = false } = options;

  const chains = useMemo<Chain[]>(() => {
    if (includeGuides) {
      return getAllChains(true);
    }

    const slugs = getChainSlugs();
    return slugs.map((slug) => ({
      slug,
      service: getChainService(slug),
      guide: null,
      hasGuide: hasChainGuide(slug)
    }));
  }, [includeGuides]);

  const getChain = useCallback(
    (slug: string): Chain | undefined => chains.find((chain) => chain.slug === slug),
    [chains]
  );

  return {
    chains,
    loading: false,
    error: null as string | null,
    getChain
  };
};
