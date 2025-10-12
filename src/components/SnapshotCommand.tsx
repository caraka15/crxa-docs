import { useState, useEffect } from 'react';
import { Snapshot, ChainService } from '../types/chain';
import { CodeBlock } from './CodeBlock';

interface SnapshotCommandProps {
  snapshots: Snapshot[];
  service: ChainService;
}

export const SnapshotCommand = ({ snapshots, service }: SnapshotCommandProps) => {
  const [selectedLabel, setSelectedLabel] = useState('latest');
  const chainNameLower = service.chainName.toLowerCase();
  const defaultDir = service.dir || `~/.${chainNameLower}`;
  const [customDir, setCustomDir] = useState(defaultDir);

  useEffect(() => {
    setCustomDir(defaultDir);
  }, [defaultDir]);

  if (!snapshots || snapshots.length === 0) {
    return null;
  }

  const latestSnapshot = snapshots.find(s => s.label === 'latest');
  const oldSnapshot = snapshots.find(s => s.label === 'old');

  const selectedSnapshot =
    (selectedLabel === 'latest' ? latestSnapshot : oldSnapshot) ||
    latestSnapshot ||
    oldSnapshot ||
    snapshots[0];

  if (!selectedSnapshot) {
    return null;
  }

  const command = `sudo apt install lz4 -y
sudo systemctl stop ${chainNameLower}d
cp ${customDir}/data/priv_validator_state.json ${customDir}/priv_validator_state.json.backup
${chainNameLower}d tendermint unsafe-reset-all --home ${customDir} --keep-addr-book
curl -L ${selectedSnapshot.url} | lz4 -dc - | tar -xf - -C ${customDir}
mv ${customDir}/priv_validator_state.json.backup ${customDir}/data/priv_validator_state.json
sudo systemctl restart ${chainNameLower}d && sudo journalctl -u ${chainNameLower}d -fo cat`;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-base-content">Snapshot Command</h2>
        <div className="flex gap-2">
          {latestSnapshot && (
            <button
              className={`btn btn-sm ${selectedLabel === 'latest' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedLabel('latest')}
            >
              Latest
            </button>
          )}
          {oldSnapshot && (
            <button
              className={`btn btn-sm ${selectedLabel === 'old' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedLabel('old')}
            >
              Old
            </button>
          )}
        </div>
      </div>

      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Custom Directory</span>
        </label>
        <input
          type="text"
          value={customDir}
          onChange={(e) => setCustomDir(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>

      <CodeBlock>{command}</CodeBlock>
    </div>
  );
};
