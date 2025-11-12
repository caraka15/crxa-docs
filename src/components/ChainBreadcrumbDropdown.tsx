import { useMemo } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

export interface ChainOption {
  slug: string;
  label: string;
  disabled?: boolean;
}

interface ChainBreadcrumbDropdownProps {
  items: ChainOption[];
  currentSlug?: string | null;
  currentLabel: string;
  onSelect: (slug: string) => void;
  triggerClassName?: string;
}

export const ChainBreadcrumbDropdown = ({
  items,
  currentLabel,
  currentSlug,
  onSelect,
  triggerClassName
}: ChainBreadcrumbDropdownProps) => {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.label.localeCompare(b.label));
  }, [items]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1 rounded-lg border border-base-300/60 bg-base-200/90 px-3 py-1 text-sm font-medium text-base-content shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 hover:bg-base-100',
            triggerClassName
          )}
          aria-label="Pilih chain lain"
        >
          {currentLabel}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[14rem] max-h-72 overflow-y-auto rounded-xl border border-base-300/60 bg-base-100/95 text-base-content shadow-xl backdrop-blur-sm"
      >
        <DropdownMenuLabel className="text-[0.65rem] font-semibold uppercase tracking-wide text-base-content/70">
          Pilih chain
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-base-300/60" />
        {sortedItems.length === 0 ? (
          <DropdownMenuItem disabled className="text-base-content/60">
            Tidak ada chain
          </DropdownMenuItem>
        ) : (
          sortedItems.map((item) => (
            <DropdownMenuItem
              key={item.slug}
              disabled={item.disabled}
              onSelect={(event) => {
                event.preventDefault();
                if (item.disabled || item.slug === currentSlug) {
                  return;
                }
                onSelect(item.slug);
              }}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg text-sm text-base-content',
                item.slug === currentSlug
                  ? 'bg-primary/10 text-primary focus:bg-primary/20'
                  : 'hover:bg-base-200/80 focus:bg-base-200/80'
              )}
            >
              <span>{item.label}</span>
              {item.slug === currentSlug && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
