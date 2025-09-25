import { useState } from 'react';
import { Snapshot } from '../types/chain';
import { CodeBlock } from './CodeBlock';

interface SnapshotCommandProps {
  snapshots: Snapshot[];
}

export const SnapshotCommand = ({ snapshots }: SnapshotCommandProps) => {
  const [selectedLabel, setSelectedLabel] = useState('latest');

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
sudo systemctl stop paxid
cp ~/go/bin/paxi/data/priv_validator_state.json ~/go/bin/paxi/priv_validator_state.json.backup
paxid tendermint unsafe-reset-all --home ~/go/bin/paxi --keep-addr-book
curl -L ${selectedSnapshot.url} | lz4 -dc - | tar -xf - -C ~/go/bin/paxi
mv ~/go/bin/paxi/priv_validator_state.json.backup ~/go/bin/paxi/data/priv_validator_state.json
sudo systemctl restart paxid && sudo journalctl -u paxid -fo cat`;

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
      <CodeBlock>{command}</CodeBlock>
    </div>
  );
};
