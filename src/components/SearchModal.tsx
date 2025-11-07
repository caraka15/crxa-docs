import { useState, useEffect } from 'react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

interface SearchResult {
  id: string;
  header: string;
  preview: string;
  type: 'heading' | 'content';
}

export const SearchModal = ({ isOpen, onClose, content }: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];
    
    // Split content into sections by headers
    const lines = content.split('\n');
    let currentHeader = '';
    let currentHeaderId = '';
    let sectionContent: string[] = [];
    
    const processSectionContent = () => {
      if (sectionContent.length === 0) return;
      
      const fullContent = sectionContent.join('\n');
      if (fullContent.toLowerCase().includes(searchQuery)) {
        // Find the specific line(s) that match
        const matchingLines = sectionContent.filter(line => 
          line.toLowerCase().includes(searchQuery)
        );
        
        if (matchingLines.length > 0) {
          // Get context around the match
          let preview = matchingLines[0];
          const queryIndex = preview.toLowerCase().indexOf(searchQuery);
          
          // Get surrounding context
          const start = Math.max(0, queryIndex - 50);
          const end = Math.min(preview.length, queryIndex + searchQuery.length + 100);
          
          if (start > 0) preview = '...' + preview.substring(start, end);
          else preview = preview.substring(start, end);
          
          if (end < matchingLines[0].length) preview += '...';
          
          // Clean up markdown syntax for preview
          preview = preview.replace(/(\*\*|__|\*|_|`|~)/g, '');
          
          searchResults.push({
            id: currentHeaderId,
            header: currentHeader || 'Introduction',
            preview: preview.trim(),
            type: 'content'
          });
        }
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headingMatch) {
        // Process previous section
        processSectionContent();
        
        // Start new section
        const headerText = headingMatch[2].trim();
        currentHeader = headerText;
        currentHeaderId = headerText.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
        sectionContent = [];
        
        // Check if header itself matches
        if (headerText.toLowerCase().includes(searchQuery)) {
          searchResults.push({
            id: currentHeaderId,
            header: headerText,
            preview: headerText,
            type: 'heading'
          });
        }
      } else {
        sectionContent.push(line);
      }
    }
    
    // Process last section
    processSectionContent();

    // Remove duplicates based on id and preview
    const uniqueResults = searchResults.filter((result, index, self) =>
      index === self.findIndex(r => r.id === result.id && r.preview === result.preview)
    );

    setResults(uniqueResults.slice(0, 15));
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
            <div className="max-h-96 overflow-y-auto space-y-1">
              {results.map((result, index) => (
                <div
                  key={`${result.id}-${index}`}
                  onClick={() => scrollToResult(result.id)}
                  className="p-3 hover:bg-base-200 cursor-pointer rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {result.type === 'heading' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      )}
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-primary font-medium mb-1">
                        {result.header}
                      </div>
                      <div className="text-sm text-base-content/80 line-clamp-2">
                        {result.preview}
                      </div>
                    </div>
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