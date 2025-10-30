import { useQuery } from '@tanstack/react-query';
import { GUIDE_PATH } from '../constants/cdn';

export const chainGuideQueryKey = (slug: string) => ['chain-guide', slug] as const;

export const fetchGuideContent = async (slug: string): Promise<string> => {
  const response = await fetch(`${GUIDE_PATH}/${slug}.md`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load guide for ${slug}`);
  }
  return response.text();
};

export const useChainGuide = (slug?: string | null) => {
  const {
    data,
    error,
    isLoading,
    isFetching
  } = useQuery<string>({
    queryKey: chainGuideQueryKey(slug!),
    queryFn: () => fetchGuideContent(slug!),
    enabled: Boolean(slug),
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 1
  });

  const guide = slug ? data ?? null : null;
  const loading = Boolean(slug) ? (isLoading && !data) : false;
  const fetchError =
    error instanceof Error ? error.message : error ? String(error) : null;

  return { guide, loading, error: fetchError, isFetching: Boolean(slug) && isFetching };
};
