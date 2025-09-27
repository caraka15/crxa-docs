import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Snapshot } from '../types/chain';
import { SnapshotCopyButton } from './SnapshotCopyButton';
import { CopyButton } from './CopyButton';
import { SnapshotCommand } from './SnapshotCommand';

dayjs.extend(relativeTime);

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const SnapshotTable = () => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://files.crxanode.me/paxi/index.json?t=${new Date().getTime()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // const correctedText = text.replace(/("peers":\s*\[\s*)([^"\s\]]+)(\s*\])/g, '$1"$2"$3');
        // const data = JSON.parse(correctedText);
        setSnapshots(data.items.map((item: any) => ({
          ...item,
          sizeBytes: item.size_bytes,
          availableAt: item.mtime,
          url: `https://files.crxanode.me${item.download}`,
          checksum: `sha256:${item.checksum_sha256}`
        })));
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshots();
  }, []);

  

  
  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="card bg-base-200/80 backdrop-blur-sm">
        <div className="card-body text-center py-8">
          <p className="text-base-content/70">No snapshots available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card bg-base-200/80 backdrop-blur-sm">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="bg-base-300">
                  <th>Type</th>
                  <th>Height</th>
                  <th>Size</th>
                  <th>Format</th>
                  <th>Available</th>
                  <th>Checksum</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snapshot, index) => (
                  <tr key={index} className="hover:bg-base-100">
                    <td>
                      <span className="badge badge-primary badge-outline">
                        {snapshot.label}
                      </span>
                    </td>
                    <td className="font-mono">{snapshot.height}</td>
                    <td>{formatBytes(snapshot.sizeBytes)}</td>
                    <td>
                      <span className="badge badge-secondary badge-outline">
                        {snapshot.format}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div>{dayjs(snapshot.availableAt).format('MMM D, YYYY HH:mm')}</div>
                        <div className="text-base-content/50">
                          {dayjs(snapshot.availableAt).fromNow()}
                        </div>
                      </div>
                    </td>
                    <td>
                      {snapshot.checksum && (
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <a
                            href={`${snapshot.url}.sha256`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-hover"
                          >
                            {snapshot.checksum.split(':')[1].substring(0, 12)}...
                          </a>
                          <CopyButton text={snapshot.checksum.split(':')[1]} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <a
                          href={snapshot.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          Download
                        </a>
                        <SnapshotCopyButton text={snapshot.url} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <SnapshotCommand snapshots={snapshots} />
    </>
  );
};