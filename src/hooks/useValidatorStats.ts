import { useState, useEffect } from 'react';
import { ChainService } from '@/types/chain';

export interface ValidatorStats {
  commission: number;        // dalam persen, e.g., 5.00
  totalStake: string;        // formatted, e.g., "1,234,567 PAXI"
  totalStakeRaw: number;     // raw number untuk sorting
  uptime: number;            // dalam persen, e.g., 99.87
  loading: boolean;
  error: string | null;
}

export const useValidatorStats = (service: ChainService | null) => {
  const [stats, setStats] = useState<ValidatorStats>({
    commission: 0,
    totalStake: '0',
    totalStakeRaw: 0,
    uptime: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!service || !service.valoper || !service.api) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        const LCD = service.api;
        const VALOPER = service.valoper!;
        const DECIMALS = service.decimals || 6;
        const DENOM = service.denom || 'token';

        // 1. Fetch validator info (commission & tokens)
        const validatorRes = await fetch(`${LCD}/cosmos/staking/v1beta1/validators/${VALOPER}`);
        if (!validatorRes.ok) throw new Error('Failed to fetch validator info');
        const validatorData = await validatorRes.json();

        const tokens = parseFloat(validatorData.validator?.tokens || '0');
        const commissionRate = parseFloat(validatorData.validator?.commission?.commission_rates?.rate || '0');

        // Convert tokens to main denom
        const totalStakeRaw = tokens / Math.pow(10, DECIMALS);
        const displayDenom = DENOM.replace(/^u/, '').toUpperCase(); // upaxi -> PAXI
        const totalStake = `${totalStakeRaw.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${displayDenom}`;

        // 2. Fetch uptime using valcons from service.json
        let uptime = 100; // Default to 100%
        if (service.valcons) {
          try {
            const signingInfoRes = await fetch(`${LCD}/cosmos/slashing/v1beta1/signing_infos/${service.valcons}`);
            if (signingInfoRes.ok) {
              const signingInfoData = await signingInfoRes.json();
              const missedBlocks = parseInt(signingInfoData.val_signing_info?.missed_blocks_counter || '0');

              const paramsRes = await fetch(`${LCD}/cosmos/slashing/v1beta1/params`);
              if (paramsRes.ok) {
                const paramsData = await paramsRes.json();
                const window = parseInt(paramsData.params?.signed_blocks_window || '10000');
                if (window > 0) {
                  uptime = ((window - missedBlocks) / window) * 100;
                }
              }
            }
          } catch (err) {
            console.warn(`Failed to calculate uptime for ${service.chainName}, defaulting to 100%.`, err);
          }
        }

        setStats({
          commission: commissionRate * 100, // convert to percentage
          totalStake,
          totalStakeRaw,
          uptime: Math.max(0, Math.min(100, uptime)), // clamp 0-100
          loading: false,
          error: null
        });

      } catch (err) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch stats'
        }));
      }
    };

    fetchStats();

    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [service]);

  return stats;
};
