import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChains } from '../hooks/useChains';
import { Header } from '../components/Header';
import { Logo } from '../components/Logo';
import { GuideSidebar } from '../components/GuideSidebar';
import { CodeBlock } from '../components/CodeBlock';
import { Footer } from '../components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { SearchModal } from '@/components/SearchModal';

export const GuidePage = () => {
  const { chain: chainSlug } = useParams<{ chain: string }>();
  const { getChain, loading } = useChains();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const chain = chainSlug ? getChain(chainSlug) : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        </div>
      </div>
    );
  }

  if (!chain || !chain.guide) {
    return (
      <div className="min-h-screen bg-base-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-error">
            <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Chain "{chainSlug}" not found or no guide available.</span>
          </div>
          <div className="mt-4">
            <Link to="/" className="btn btn-primary">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const chainName = chain.service?.chainName || chainSlug?.toUpperCase() || 'Unknown';

  return (
    <div className="bg-base-100 flex flex-col">
      <Header />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <GuideSidebar
          content={chain.guide}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSearchOpen={() => setSearchOpen(true)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8">
            {/* Mobile Menu Button & Breadcrumb */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="btn btn-ghost btn-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}
                <div className="breadcrumbs text-sm">
                  <ul>
                    <li><Link to="/" className="text-primary hover:text-secondary">Home</Link></li>
                    <li>{chainName}</li>
                    <li>Guide</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Guide Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div className="flex items-center gap-4">
                <Logo
                  slug={chainSlug || ''}
                  chainName={chainName}
                  className="w-16 h-16"
                />
                <div>
                  <h1 className="text-3xl font-bold text-base-content mb-2">
                    {chainName} Installation Guide
                  </h1>
                  <p className="text-base-content/70">
                    Step-by-step instructions for setting up your node
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 md:mt-0">
                {chain.service && (
                  <Link
                    to={`/${chainSlug}/service`}
                    className="btn btn-primary btn-outline"
                  >
                    🔗 Service Endpoints
                  </Link>
                )}
              </div>
            </div>

            {/* Guide Content */}
            <div className="w-full max-w-none">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom code blocks with copy functionality
                    pre: ({ children, ...props }) => {
                      const codeElement = children as any;
                      const codeText = codeElement?.props?.children || '';
                      if (typeof codeText === 'string') {
                        return <CodeBlock>{codeText}</CodeBlock>;
                      }
                      return (
                        <pre className="bg-base-300 text-base-content p-4 rounded-lg overflow-x-auto border" {...props}>
                          {children}
                        </pre>
                      );
                    },
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-base-300 text-base-content px-2 py-1 rounded text-sm">
                          {children}
                        </code>
                      ) : (
                        <code className="text-base-content">{children}</code>
                      );
                    },
                    // Custom styling for headings with IDs
                    h1: ({ children }) => {
                      const text = children?.toString() || '';
                      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                      return (
                        <h1 id={id} className="text-4xl font-bold text-base-content mb-6 border-b border-base-300 pb-3 scroll-mt-24">
                          {children}
                        </h1>
                      );
                    },
                    h2: ({ children }) => {
                      const text = children?.toString() || '';
                      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                      return (
                        <h2 id={id} className="text-2xl font-semibold text-base-content mt-8 mb-4 scroll-mt-24">
                          {children}
                        </h2>
                      );
                    },
                    h3: ({ children }) => {
                      const text = children?.toString() || '';
                      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                      return (
                        <h3 id={id} className="text-xl font-semibold text-base-content mt-6 mb-3 scroll-mt-24">
                          {children}
                        </h3>
                      );
                    },
                    p: (props) => {
                      const { node } = props as any;
                      const line = node?.position?.start.line;
                      return <p id={`line-${line}`}>{props.children}</p>;
                    },
                    // Custom styling for blockquotes
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary bg-base-200/50 p-4 my-6 rounded-r-lg">
                        {children}
                      </blockquote>
                    ),
                    // Custom styling for links
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="text-primary hover:text-secondary underline"
                        target={href?.startsWith('http') ? '_blank' : undefined}
                        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {children}
                      </a>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6">
                        <table className="table table-zebra w-full">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-base-200">{children}</thead>,
                    th: ({ children }) => <th className="p-4 font-semibold text-left">{children}</th>,
                    td: ({ children }) => <td className="p-4">{children}</td>,
                  }}
                >
                  {chain.guide}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        content={chain.guide}
      />
    </div>
  );
};