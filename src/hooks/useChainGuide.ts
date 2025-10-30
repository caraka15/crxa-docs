import { useEffect, useState } from 'react';
import { GUIDE_PATH } from '../constants/cdn';

export const useChainGuide = (slug?: string | null) => {
  const [guide, setGuide] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(slug));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setGuide(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadGuide = async () => {
      try {
        setLoading(true);
        setError(null);
        setGuide(null);

        const response = await fetch(`${GUIDE_PATH}/${slug}.md`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load guide for ${slug}`);
        }
        const text = await response.text();

        if (!cancelled) {
          setGuide(text);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load guide');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadGuide();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { guide, loading, error };
};
