import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChains } from '../hooks/useChains';
import { Header } from '../components/Header';

export const GuidePage = () => {
  const { chain: chainSlug } = useParams<{ chain: string }>();
  const { getChain, loading } = useChains();
  
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
    <div className="min-h-screen bg-base-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="breadcrumbs text-sm mb-6">
          <ul>
            <li><Link to="/" className="text-primary hover:text-secondary">Home</Link></li>
            <li>{chainName}</li>
            <li>Guide</li>
          </ul>
        </div>

        {/* Guide Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-content mb-2">
              {chainName} Installation Guide
            </h1>
            <p className="text-base-content/70">
              Step-by-step instructions for setting up your node
            </p>
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
        <div className="max-w-4xl">
          <div className="card bg-base-200">
            <div className="card-body">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom styling for code blocks
                    pre: ({ children }) => (
                      <pre className="bg-base-300 text-base-content p-4 rounded-lg overflow-x-auto">
                        {children}
                      </pre>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="bg-base-300 text-base-content px-1 py-0.5 rounded text-sm">
                          {children}
                        </code>
                      ) : (
                        <code className="text-base-content">{children}</code>
                      );
                    },
                    // Custom styling for headings
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-base-content mb-4 border-b border-base-300 pb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-semibold text-base-content mt-8 mb-4">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-semibold text-base-content mt-6 mb-3">
                        {children}
                      </h3>
                    ),
                    // Custom styling for blockquotes
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary bg-base-300 p-4 my-4 rounded-r-lg">
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
                  }}
                >
                  {chain.guide}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};