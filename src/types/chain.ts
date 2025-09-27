export interface Snapshot {
  format: ReactNode;
  label: string;
  height: string;
  type: string;
  sizeBytes: number;
  url: string;
  checksum: string;
  availableAt: string;
}

export interface ChainService {
  [x: string]: string;
  chainName: string;
  api: string;
  rpc: string;
  grpc: string;
  peer: string;
  addrbook: string;
  snapshots: Snapshot[];
}

export interface ChainData {
  slug: string;
  service: ChainService | null;
  guide: string | null;
}