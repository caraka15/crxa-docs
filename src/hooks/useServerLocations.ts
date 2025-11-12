import { useEffect, useState } from 'react';

export interface ServerLocation {
  name: string;
  coordinates: [number, number];
  city: string;
  country: string;
  endpoint: string;
  ip?: string;
  services?: string[];
}

interface ApiResponse {
  locations: ServerLocation[];
  errors?: string[];
  error?: string;
}

export const useServerLocations = () => {
  const [locations, setLocations] = useState<ServerLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadLocations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/server-locations', {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as ApiResponse;
        setLocations(Array.isArray(data.locations) ? data.locations : []);

        if (data.error) {
          setError(data.error);
        } else if (data.errors && data.errors.length > 0) {
          setError(`Beberapa domain gagal dimuat (${data.errors.length}).`);
          console.warn('Server location warnings:', data.errors);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Error fetching server locations:', err);
        setLocations([]);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadLocations();

    return () => controller.abort();
  }, []);

  return { locations, loading, error };
};
