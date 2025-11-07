import { useState, useEffect, useRef } from 'react';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import python from 'highlight.js/lib/languages/python';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import 'highlight.js/styles/atom-one-dark.css';

// Register languages
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);

interface CodeBlockProps {
  children: string;
  className?: string;
  language?: string;
}

export const CodeBlock = ({ children, className, language }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const displayLanguage = language || 'bash';

  useEffect(() => {
    if (codeRef.current) {
      // Remove any existing highlighting
      codeRef.current.removeAttribute('data-highlighted');
      // Apply syntax highlighting
      hljs.highlightElement(codeRef.current);
    }
  }, [children, displayLanguage]);

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
          {displayLanguage}
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
      
      {/* Code content with syntax highlighting */}
      <div className="relative">
        <pre className={`bg-base-300 m-0 rounded-b-lg overflow-x-auto border border-t-0 ${className || ''}`}>
          <code 
            ref={codeRef}
            className={`hljs language-${displayLanguage} block p-4 text-sm font-mono leading-relaxed`}
          >
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};