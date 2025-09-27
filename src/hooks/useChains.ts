import { useState, useEffect } from 'react';
import { ChainData, ChainService } from '../types/chain';

export const useChains = () => {
  const [chains, setChains] = useState<ChainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChains = async () => {
      try {
        setLoading(true);
        
        // Auto-index service files
                        const serviceModules = import.meta.glob('./../chains/service/*.json', {
                          eager: true,
                          as: 'json'
                        });
                        
                        // Auto-index guide files  
                        const guideModules = import.meta.glob('./../chains/guide/*.md', {
                          eager: true,
                          as: 'raw'
                        });        const chainData: ChainData[] = [];
        const processedSlugs = new Set<string>();

        // Process service files
        for (const [path, service] of Object.entries(serviceModules)) {
          const slug = path.match(/\/([^/]+)\.json$/)?.[1];
          if (slug) {
            processedSlugs.add(slug);
            chainData.push({
              slug,
              service: service as ChainService,
              guide: null
            });
          }
        }

        // Process guide files
        for (const [path, guide] of Object.entries(guideModules)) {
          const slug = path.match(/\/([^/]+)\.md$/)?.[1];
          if (slug) {
            const existingChain = chainData.find(c => c.slug === slug);
            if (existingChain) {
              existingChain.guide = guide as string;
            } else if (!processedSlugs.has(slug)) {
              chainData.push({
                slug,
                service: null,
                guide: guide as string
              });
            }
            processedSlugs.add(slug);
          }
        }

        setChains(chainData.sort((a, b) => a.slug.localeCompare(b.slug)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chains');
      } finally {
        setLoading(false);
      }
    };

    loadChains();
  }, []);

  const getChain = (slug: string): ChainData | undefined => {
    return chains.find(chain => chain.slug === slug);
  };

  return { chains, loading, error, getChain };
};