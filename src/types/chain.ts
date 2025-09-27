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
  chainName: string;
  api: string;
  rpc: string;
  grpc: string;
  peer: string;
  addrbook: string;
  genesis?: string;
  snapshots?: string; // URL to snapshots API
  valoper?: string;
}

export interface ChainData {
  slug: string;
  service: ChainService | null;
  guide: string | null;
}