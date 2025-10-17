import { useEffect, useMemo, useRef, useState } from "react";

interface BlockHeightProps {
  /** Contoh: "http://127.0.0.1:26657" atau "https://rpc.yourdomain.tld" */
  rpcUrl: string;
  /** interval polling ms jika WS gagal (default 5000) */
  pollMs?: number;
  chainSlug: string;
  chainType: 'mainnet' | 'testnet';
}

function toWsUrl(httpUrl: string) {
  try {
    const u = new URL(httpUrl);
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
    u.pathname = "/websocket";
    u.search = "";
    return u.toString();
  } catch {
    // fallback kasar
    return httpUrl.replace(/^http/, "ws") + "/websocket";
  }
}

export const BlockHeight = ({ rpcUrl, pollMs = 5000, chainSlug, chainType }: BlockHeightProps) => {
  const [blockHeight, setBlockHeight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);

  const wsUrl = useMemo(() => toWsUrl(rpcUrl), [rpcUrl]);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let closed = false;

    // --- helper: fetch status via HTTP (no cache)
    const fetchStatus = async () => {
      try {
        setHasAttempted(true);
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;
        const url = `${rpcUrl.replace(/\/+$/, "")}/status?t=${Date.now()}`;
        const res = await fetch(url, {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
            Accept: "application/json",
          },
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const h = data?.result?.sync_info?.latest_block_height;
        if (h) {
          setBlockHeight(String(h));
          setError(null);
        }
      } catch (e: any) {
        // Only show error after some time has passed
        setTimeout(() => {
          if (!blockHeight && hasAttempted) {
            setError(e?.message || "Connection failed");
          }
        }, 3000);
      }
    };

    // --- 1) Coba WebSocket dulu (bebas CORS)
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // subscribe new block event
        const sub = {
          jsonrpc: "2.0",
          method: "subscribe",
          id: "1",
          params: { query: "tm.event='NewBlock'" },
        };
        ws.send(JSON.stringify(sub));
        // ambil status sekali di awal biar langsung tampil
        fetchStatus();
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data as string);
          const block =
            msg?.result?.data?.value?.block || msg?.result?.data?.value?.block?.header
              ? msg.result.data.value.block
              : null;

          // tendermint v0.34/0.37 format:
          const height =
            block?.header?.height ??
            msg?.result?.data?.value?.block?.header?.height ??
            msg?.result?.data?.value?.header?.height;

          if (height) {
            setError(null);
            setBlockHeight(String(height));
          }
        } catch {
          // abaikan parsing error kecil
        }
      };

      ws.onerror = () => {
        // kalau WS error, kita fallback ke polling
        startPolling();
      };

      ws.onclose = () => {
        if (!closed) startPolling(); // kalau tak sengaja terputus, tetap fallback
      };
    } catch {
      // kalau tak bisa inisiasi WS (URL invalid), langsung polling
      startPolling();
    }

    function startPolling() {
      // clear bila ada
      if (pollRef.current) clearInterval(pollRef.current);
      // fetch awal + interval
      fetchStatus();
      pollRef.current = setInterval(fetchStatus, pollMs);
    }

    return () => {
      closed = true;
      wsRef.current?.close();
      wsRef.current = null;
      if (pollRef.current) clearInterval(pollRef.current);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcUrl, wsUrl, pollMs]);

  const explorerUrl = chainType === 'testnet' ? 'testnet-explorer.crxanode.me' : 'explorer.crxanode.me';

  if (error && !blockHeight && hasAttempted) {
    return <span className="text-error text-xs">Offline</span>;
  }
  if (!blockHeight) {
    return <span className="loading loading-spinner loading-xs" />;
  }
  return (
    <a href={`https://${explorerUrl}/${chainSlug}/block`} target="_blank" rel="noopener noreferrer" className="text-lg font-mono hover:text-primary">
      #{blockHeight}
    </a>
  );
};
