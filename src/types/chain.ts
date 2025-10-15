import { ReactNode } from 'react';

export interface Snapshot {
  format: string;
  label: string;
  height: string | number;
  type?: string;
  sizeBytes: number;
  url: string;
  checksum: string;
  availableAt: string;
}

export interface SnapshotResponse {
  generated_at: string;
  items: Snapshot[];
  peers: string | string[];
}

export interface ChainService {
  valcons: any;
  chainName: string;
  api: string;
  rpc: string;
  grpc: string;
  peer: string;
  addrbook: string;
  genesis?: string;
  snapshots?: string; // URL to snapshots API
  valoper?: string;
  dir?: string;
  type?: string;
  denom?: string; // e.g., "upaxi"
  decimals?: number; // e.g., 6
}

export interface Chain {
  slug: string;
  service: ChainService | null;
  guide: string | null;
}

export interface ValidatorStats {
  slug: string;
  commission: number;
  totalStake: string;
  totalStakeRaw: number;
  uptime: number;
  loading: boolean;
  error: string | null;
}