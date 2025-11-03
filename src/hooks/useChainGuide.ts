import { getChainGuide, hasChainGuide } from '@/chains/registry';

export interface UseChainGuideResult {
  guide: string | null;
  loading: boolean;
  error: string | null;
  isFetching: boolean;
}

export const useChainGuide = (slug?: string | null): UseChainGuideResult => {
  if (!slug) {
    return {
      guide: null,
      loading: false,
      error: null,
      isFetching: false
    };
  }

  const guide = getChainGuide(slug);
  const exists = hasChainGuide(slug);

  return {
    guide,
    loading: false,
    error: exists && !guide ? `Guide for "${slug}" could not be loaded.` : null,
    isFetching: false
  };
};
