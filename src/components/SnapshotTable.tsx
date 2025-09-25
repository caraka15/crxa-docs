import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Snapshot } from '../types/chain';
import { CopyButton } from './CopyButton';

dayjs.extend(relativeTime);

interface SnapshotTableProps {
  snapshots: Snapshot[];
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const SnapshotTable = ({ snapshots }: SnapshotTableProps) => {
  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="card bg-base-200">
        <div className="card-body text-center py-8">
          <p className="text-base-content/70">No snapshots available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200">
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
                      {snapshot.type}
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
                    <a 
                      href={snapshot.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};