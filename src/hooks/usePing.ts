import { useState, useEffect } from 'react';

interface PingResult {
  latency: number | null;
  status: 'pending' | 'success' | 'error';
}

export const usePing = (url: string) => {
  const [pingResult, setPingResult] = useState<PingResult>({
    latency: null,
    status: 'pending'
  });

  useEffect(() => {
    if (!url) return;

    const pingEndpoint = async () => {
      try {
        const startTime = Date.now();
        
        // Try to ping the API endpoint with a simple status check
        const response = await fetch(url.includes('/status') ? url : `${url}/status`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
          },
        });

        const endTime = Date.now();
        const latency = endTime - startTime;

        if (response.ok) {
          setPingResult({ latency, status: 'success' });
        } else {
          setPingResult({ latency: null, status: 'error' });
        }
      } catch (error) {
        setPingResult({ latency: null, status: 'error' });
      }
    };

    setPingResult({ latency: null, status: 'pending' });
    pingEndpoint();
  }, [url]);

  return pingResult;
};