import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChains } from "../hooks/useChains";
import { useChainGuide } from "../hooks/useChainGuide";
import { Logo } from "../components/Logo";
import { GuideSidebar } from "../components/GuideSidebar";
import { CodeBlock } from "../components/CodeBlock";
import { SearchModal } from "@/components/SearchModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { Seo } from "@/components/Seo";
import { buildCanonicalUrl, SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION } from "@/config/site";

type MarkdownComponents = Parameters<typeof ReactMarkdown>[0]["components"];

const markdownComponents: MarkdownComponents = {
  code({ inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    if (!inline && match) {
      const code = Array.isArray(children)
        ? children.join("")
        : String(children ?? "");
      return (
        <CodeBlock className={className ?? ""}>
          {code.replace(/\n$/, "")}
        </CodeBlock>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto rounded-lg border border-base-200">
        <table className="table w-full">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return <th className="bg-base-200">{children}</th>;
  },
  td({ children }) {
    return <td className="p-4">{children}</td>;
  }
};

const LoadingState = () => (
  <div className="relative min-h-screen bg-transparent">
    <div className="relative z-10 container mx-auto px-4 py-8">
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    </div>
  </div>
);

const ErrorState = ({ message, chainSlug }: { message: string; chainSlug?: string }) => (
  <div className="relative min-h-screen bg-transparent">
    <div className="relative z-10 container mx-auto px-4 py-8">
      <div className="alert alert-error bg-base-200/70">
        <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{message}</span>
      </div>
      <div className="mt-4">
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </div>
  </div>
);

export const GuidePage = () => {
  const { chain: chainSlug } = useParams<{ chain: string }>();
  const { getChain, loading } = useChains();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const chain = chainSlug ? getChain(chainSlug) : undefined;
  const guideSlug = chain?.hasGuide ? chain.slug : null;
  const { guide, loading: guideLoading, error: guideError } = useChainGuide(guideSlug);

  const canonicalPath = chainSlug ? `/${chainSlug}/guide` : "/guide";
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const chainName = chain?.service?.chainName || chainSlug?.toUpperCase() || "Unknown";

  const plainGuide = useMemo(() => {
    if (!guide) return null;
    return guide
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/[#>*`]/g, " ")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }, [guide]);

  const guideDescription = plainGuide
    ? `${plainGuide.slice(0, 150)}${plainGuide.length > 150 ? "..." : ""}`
    : chainSlug
    ? `Step-by-step installation instructions for ${chainName} validator node.`
    : DEFAULT_DESCRIPTION;

  const guideKeywords = useMemo(
    () => (
      chainSlug
        ? [
            chainName,
            `${chainName} guide`,
            `${chainName} installation`,
            `${chainName} validator`,
            "cosmos validator guide",
            "node setup tutorial"
          ]
        : undefined
    ),
    [chainSlug, chainName]
  );

  const structuredGuideData = useMemo(() => {
    if (!guide || !chain?.hasGuide || !plainGuide) return undefined;
    return [
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: `${chainName} Installation Guide`,
        about: chainName,
        description: guideDescription,
        articleBody: plainGuide,
        wordCount: plainGuide.split(/\s+/).length,
        author: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/logo.png`
          }
        },
        mainEntityOfPage: canonicalUrl,
        dateModified: new Date().toISOString()
      }
    ];
  }, [guide, chain?.hasGuide, plainGuide, chainName, guideDescription, canonicalUrl]);

  const ogImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(`${chainName} Guide`)}&subtitle=${encodeURIComponent(guideDescription)}`;

  if (loading || (guideLoading && !guide)) {
    return (
      <>
        <Seo
          title={`${chainSlug?.toUpperCase() ?? "Guide"} Installation Guide`}
          description={guideDescription}
          canonical={canonicalPath}
          noindex
          openGraph={{
            type: "article",
            url: canonicalUrl,
            title: `${chainSlug?.toUpperCase() ?? "Guide"} Installation Guide | ${SITE_NAME}`,
            description: guideDescription,
            image: ogImageUrl
          }}
        />
        <LoadingState />
      </>
    );
  }

  if (!chain) {
    return (
      <>
        <Seo
          title="Guide Not Found"
          description="Requested guide could not be located."
          canonical={canonicalPath}
          noindex
          openGraph={{
            type: "article",
            url: canonicalUrl,
            title: "Guide Not Found | Crxanode Docs",
            description: "Requested guide could not be located.",
            image: ogImageUrl
          }}
        />
        <ErrorState message={`Chain "${chainSlug}" tidak ditemukan.`} chainSlug={chainSlug ?? undefined} />
      </>
    );
  }

  if (!chain.hasGuide || guideError) {
    return (
      <>
        <Seo
          title={`${chainName} Guide`}
          description={guideError ? `Failed to load installation guide for ${chainName}.` : `Installation guide for ${chainName} is not available.`}
          canonical={canonicalPath}
          noindex
          openGraph={{
            type: "article",
            url: canonicalUrl,
            title: `${chainName} Guide | ${SITE_NAME}`,
            description: guideError
              ? `Failed to load installation guide for ${chainName}.`
              : `Installation guide for ${chainName} is not available.`,
            image: ogImageUrl
          }}
        />
        <ErrorState
          message={guideError ? `Gagal memuat panduan untuk "${chainSlug}".` : `Panduan untuk "${chainSlug}" tidak tersedia.`}
          chainSlug={chainSlug ?? undefined}
        />
      </>
    );
  }

  if (!guide) {
    return null;
  }

  return (
    <>
      <Seo
        title={`${chainName} Installation Guide`}
        description={guideDescription}
        canonical={canonicalPath}
        keywords={guideKeywords}
        openGraph={{
          type: "article",
          url: canonicalUrl,
          title: `${chainName} Installation Guide | ${SITE_NAME}`,
          description: guideDescription,
          image: ogImageUrl
        }}
        structuredData={structuredGuideData}
      />
      <div className="relative bg-transparent flex flex-col">
        <div className="relative z-10 flex flex-1">
          <GuideSidebar
            content={guide}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onSearchOpen={() => setSearchOpen(true)}
          />

          <main className="flex-1 overflow-auto">
            <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8">
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
                      Service Overview
                    </Link>
                  )}
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="btn btn-secondary btn-outline"
                  >
                    Search Guide
                  </button>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {guide}
                </ReactMarkdown>
              </div>
            </div>
          </main>
        </div>

        <SearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          content={guide}
        />
      </div>
    </>
  );
};
