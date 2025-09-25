import { useState } from 'react';

interface CodeBlockProps {
  children: string;
  className?: string;
}

const detectLanguage = (code: string): string => {
  // Simple language detection based on common patterns
  if (code.includes('curl ') || code.includes('wget ')) return 'bash';
  if (code.includes('import ') && code.includes('from ')) return 'python';
  if (code.includes('const ') || code.includes('function ') || code.includes('=>')) return 'javascript';
  if (code.includes('<?php')) return 'php';
  if (code.includes('#include') || code.includes('int main')) return 'c++';
  if (code.includes('public class') || code.includes('System.out')) return 'java';
  if (code.includes('def ') || code.includes('import ')) return 'python';
  if (code.includes('SELECT') || code.includes('FROM')) return 'sql';
  if (code.includes('{') && code.includes('}')) return 'json';
  if (code.includes('<') && code.includes('>')) return 'html';
  return 'text';
};

export const CodeBlock = ({ children, className }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const language = detectLanguage(children);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative group w-full my-4">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between bg-base-200 px-4 py-2 rounded-t-lg border border-b-0">
        <span className="text-xs text-base-content/70 font-mono uppercase tracking-wide">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="btn btn-xs btn-ghost opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          title="Copy to clipboard"
        >
          {copied ? (
            <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
          <span className="ml-1 text-xs hidden sm:inline">
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </button>
      </div>
      
      {/* Code content */}
      <div className="relative">
        <pre className={`bg-base-300 text-base-content p-4 rounded-b-lg overflow-x-auto border border-t-0 ${className || ''}`}>
          <code className="text-base-content text-sm font-mono leading-relaxed">{children}</code>
        </pre>
      </div>
    </div>
  );
};