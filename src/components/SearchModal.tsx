import { useState, useEffect } from 'react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

interface SearchResult {
  id: string;
  text: string;
  level: number;
}

export const SearchModal = ({ isOpen, onClose, content }: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Extract headings and search through content
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const searchResults: SearchResult[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      
      if (text.toLowerCase().includes(query.toLowerCase())) {
        searchResults.push({ id, text, level });
      }
    }

    // Also search in content paragraphs
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(query.toLowerCase()) && !line.startsWith('#')) {
        const preview = line.substring(0, 100) + (line.length > 100 ? '...' : '');
        const strippedPreview = preview.replace(/(\*\*|__|\*|_|`|~|#)/g, '');
        searchResults.push({
          id: `line-${index + 1}`,
          text: strippedPreview,
          level: 0
        });
      }
    });

    setResults(searchResults.slice(0, 10));
  }, [query, content]);

  const scrollToResult = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80; // Adjusted for extra padding
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-[999]" onClick={onClose}>
      <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search in guide..."
              className="input input-ghost flex-1 text-lg"
              autoFocus
            />
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-square"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {results.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={`${result.id}-${index}`}
                  onClick={() => scrollToResult(result.id)}
                  className="p-3 hover:bg-base-200 cursor-pointer rounded-lg border-b border-base-300 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    {result.level > 0 && (
                      <span className="text-xs text-primary font-mono">
                        {'#'.repeat(result.level)}
                      </span>
                    )}
                    <span className="text-sm">{result.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {query.trim() && results.length === 0 && (
            <div className="p-8 text-center text-base-content/50">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>No results found for "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};