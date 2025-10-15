import { useState, useEffect, useMemo } from 'react';
import { Chain, ValidatorStats } from '@/types/chain';
import { sha256 } from "@cosmjs/crypto";
import { fromBase64, toBech32 } from "@cosmjs/encoding";

const CACHE_KEY = 'validator_stats_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// This hook fetches stats for ALL chains and returns an array of ValidatorStats
export const useAggregateStats = (chains: Chain[]) => {
  const [stats, setStats] = useState<ValidatorStats[]>(() => {
    try {
      const cachedItem = localStorage.getItem(CACHE_KEY);
      if (!cachedItem) return [];
      const cache = JSON.parse(cachedItem);
      if (Date.now() - cache.timestamp < CACHE_TTL) {
        return cache.data;
      }
    } catch (error) {
      console.error("Failed to read stats from cache", error);
    }
    return [];
  });
  
  const [loading, setLoading] = useState(stats.length === 0);

  const chainsWithValidator = useMemo(
    () => chains.filter(c => c.service?.valoper),
    [chains]
  );

  useEffect(() => {
    if (chainsWithValidator.length === 0) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchAllStats = async () => {
      // If we have cached data, we don't need to set loading to true
      // as we are fetching in the background.
      if (stats.length === 0) {
        setLoading(true);
      }

      const promises = chainsWithValidator.map(async (chain): Promise<ValidatorStats | null> => {
        const { service, slug } = chain;
        if (!service || !service.api || !service.valoper) return null;

        try {
          const { api, valoper, decimals = 6, denom = 'token' } = service;

          const validatorRes = await fetch(`${api}/cosmos/staking/v1beta1/validators/${valoper}`);
          if (!validatorRes.ok) throw new Error(`Failed to fetch validator for ${slug}`);
          const validatorData = await validatorRes.json();

          const tokens = parseFloat(validatorData.validator?.tokens || '0');
          const commissionRate = parseFloat(validatorData.validator?.commission?.commission_rates?.rate || '0');
          const totalStakeRaw = tokens / Math.pow(10, decimals);
          const displayDenom = denom.replace(/^u/, '').toUpperCase();
          const totalStake = `${totalStakeRaw.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${displayDenom}`;

          let uptime = 100;
          try {
            let valconsAddress = service.valcons;
            if (!valconsAddress) {
              const consPubkeyB64 = validatorData.validator?.consensus_pubkey?.key;
              if (consPubkeyB64) {
                const pubkeyBytes = fromBase64(consPubkeyB64);
                const addressBytes = sha256(pubkeyBytes).slice(0, 20);
                const hrp = `${service.chainName.toLowerCase()}valcons`;
                valconsAddress = toBech32(hrp, addressBytes);
              }
            }

            if (valconsAddress) {
              const signingInfoRes = await fetch(`${api}/cosmos/slashing/v1beta1/signing_infos/${valconsAddress}`);
              if (signingInfoRes.ok) {
                const signingInfoData = await signingInfoRes.json();
                const missedBlocks = parseInt(signingInfoData.val_signing_info?.missed_blocks_counter || '0');
                const paramsRes = await fetch(`${api}/cosmos/slashing/v1beta1/params`);
                if (paramsRes.ok) {
                  const paramsData = await paramsRes.json();
                  const window = parseInt(paramsData.params?.signed_blocks_window || '10000');
                  if (window > 0) {
                    uptime = ((window - missedBlocks) / window) * 100;
                  }
                }
              }
            }
          } catch (err) {
            console.warn(`Uptime calculation failed for ${slug}, defaulting to 100%`, err);
          }

          return {
            slug,
            commission: commissionRate * 100,
            totalStake,
            totalStakeRaw,
            uptime: Math.max(0, Math.min(100, uptime)),
            loading: false,
            error: null,
          };
        } catch (error) {
          console.error(`Failed to fetch stats for ${slug}:`, error);
          return {
            slug,
            commission: 0,
            totalStake: '0',
            totalStakeRaw: 0,
            uptime: 0,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      const results = await Promise.all(promises);
      const validResults = results.filter((s): s is ValidatorStats => s !== null);

      if (isMounted) {
        setStats(validResults);
        setLoading(false);
        // Update cache
        try {
          const cacheEntry = {
            timestamp: Date.now(),
            data: validResults,
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));
        } catch (error) {
          console.error("Failed to write stats to cache", error);
        }
      }
    };

    fetchAllStats();

    return () => {
      isMounted = false;
    };
  }, [chainsWithValidator]);

  return { stats, loading };
};