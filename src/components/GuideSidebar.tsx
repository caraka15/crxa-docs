import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface GuideSidebarProps {
  content: string;
  isOpen: boolean;
  onClose: () => void;
  onSearchOpen: () => void;
}

export function GuideSidebar({ content, isOpen, onClose, onSearchOpen }: GuideSidebarProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const isMobile = useIsMobile();

  useEffect(() => {
    // Remove code blocks from the content to prevent headings inside them from being parsed
    const contentWithoutCodeBlocks = content.replace(/^```[\s\S]*?^```/gm, '');

    // Extract h1, h2 and h3 headings from markdown content
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const extractedHeadings: HeadingItem[] = [];
    let match;

    while ((match = headingRegex.exec(contentWithoutCodeBlocks)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

      extractedHeadings.push({ id, text, level });
    }

    setHeadings(extractedHeadings);
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element && element.getBoundingClientRect().top <= 120) {
          setActiveId(element.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Set initial active heading

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (isMobile) {
        onClose();
      }
    }
  };

  if (headings.length === 0) return null;

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          onClick={onClose}
        />
        <div
          className={`fixed top-16 left-0 bottom-0 w-80 bg-base-100 border-r border-base-300 z-50 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="h-full overflow-y-auto">
            <div className="sticky top-0 bg-base-100 border-b border-base-300 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base-content">Contents</h3>
                <button
                  onClick={onClose}
                  className="btn btn-ghost btn-sm btn-square"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                onClick={onSearchOpen}
                className="btn btn-ghost btn-sm w-full justify-start gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search...
              </button>
            </div>

            <nav className="p-4">
              {headings.map((heading) => (
                <button
                  key={heading.id}
                  onClick={() => scrollToHeading(heading.id)}
                  className={`block w-full text-left py-2 px-3 rounded-lg text-sm transition-colors ${heading.level === 2 ? 'pl-3' : heading.level === 3 ? 'pl-6' : 'pl-1'
                    } ${activeId === heading.id
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                      : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                    }`}
                >
                  {heading.text}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className="w-80 border-r border-base-300 bg-base-100 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
      <div className="h-full overflow-y-auto">
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-base-content">Contents</h3>
          </div>
          <button
            onClick={onSearchOpen}
            className="btn btn-ghost btn-sm w-full justify-start gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search...
          </button>
        </div>

        <nav className="p-4">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={`block w-full text-left py-2 px-3 rounded-lg text-sm transition-colors ${heading.level === 2 ? 'pl-3' : heading.level === 3 ? 'pl-6' : 'pl-1'
                } ${activeId === heading.id
                  ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                  : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                }`}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}