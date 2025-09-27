import { useState, useEffect } from 'react';
import { SnapshotResponse } from '../types/chain';

export const useSnapshots = (snapshotsUrl?: string) => {
  const [snapshots, setSnapshots] = useState<SnapshotResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!snapshotsUrl) return;

    const fetchSnapshots = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(snapshotsUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch snapshots: ${response.status}`);
        }
        
        let text = await response.text();
        
        // Fix invalid JSON by properly quoting peer strings
        // This handles the case where peers array contains unquoted strings
        text = text.replace(
          /"peers":\s*\[\s*([^"\]]+)\s*\]/g, 
          (match, peerContent) => {
            // Split peers by whitespace and wrap each in quotes
            const peers = peerContent.trim().split(/\s+/).filter(p => p.length > 0);
            const quotedPeers = peers.map(peer => `"${peer.trim()}"`).join(', ');
            return `"peers": [${quotedPeers}]`;
          }
        );
        
        const data = JSON.parse(text);
        setSnapshots(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load snapshots');
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshots();
  }, [snapshotsUrl]);

  return { snapshots, loading, error };
};