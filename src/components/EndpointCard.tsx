import { CopyButton } from './CopyButton';

interface EndpointCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export const EndpointCard = ({ label, value, icon }: EndpointCardProps) => {
  return (
    <div className="card bg-base-200 hover:bg-base-300 transition-colors group">
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="text-primary">
                {icon}
              </div>
            )}
            <div>
              <h3 className="font-medium text-base-content">{label}</h3>
              <p className="text-sm text-base-content/70 font-mono break-all">{value}</p>
            </div>
          </div>
          <CopyButton text={value} />
        </div>
      </div>
    </div>
  );
};