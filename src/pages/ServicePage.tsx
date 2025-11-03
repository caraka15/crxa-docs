import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CopyButton } from '../components/CopyButton';
import { BlockHeight } from '../components/BlockHeight';
import { useChains } from '../hooks/useChains';
import { EndpointCard } from '../components/EndpointCard';
import { SnapshotTable } from '../components/SnapshotTable';
import { Logo } from '../components/Logo';
import { PingBadge } from '../components/PingBadge';
import { Badge } from '../components/ui/badge';
import { Seo } from '../components/Seo';
import { buildCanonicalUrl, SITE_NAME, SITE_URL } from '../config/site';

const LoadingState = () => (
  <div className="relative min-h-screen flex flex-col bg-transparent">
    <div className="relative z-10 flex-1 container mx-auto px-4 py-8">
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    </div>
  </div>
);

const EmptyState = ({ chainSlug }: { chainSlug?: string }) => (
  <div className="relative min-h-screen flex flex-col bg-transparent">
    <div className="relative z-10 flex-1 container mx-auto px-4 py-8">
      <div className="alert alert-error bg-base-200/70">
        <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Chain "{chainSlug}" not found or no service configuration available.</span>
      </div>
      <div className="mt-4">
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </div>
  </div>
);

export const ServicePage = () => {
  const { chain: chainSlug } = useParams<{ chain: string }>();
  const { getChain, loading } = useChains();

  const chain = chainSlug ? getChain(chainSlug) : undefined;
  const service = chain?.service;

  const canonicalPath = chainSlug ? `/${chainSlug}/service` : '/service';
  const canonicalUrl = buildCanonicalUrl(canonicalPath);

  const metaTitle = service
    ? `${service.chainName} Service`
    : chainSlug
    ? `${chainSlug.toUpperCase()} Service`
    : 'Validator Service';

  const metaDescription = service
    ? `Public RPC, API, and snapshot endpoints for the ${service.chainName} validator infrastructure.`
    : 'Validator service overview, RPC endpoints, and infrastructure details.';
  const ogImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(metaTitle)}&subtitle=${encodeURIComponent(metaDescription)}`;

  const metaKeywords = service
    ? [
        service.chainName,
        `${service.chainName} validator`,
        `${service.chainName} RPC`,
        `${service.chainName} API`,
        `${service.chainName} snapshots`,
        'cosmos validator infrastructure'
      ]
    : undefined;

  const structuredData = useMemo(() => {
    if (!service) return undefined;
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `${service.chainName} Validator Infrastructure`,
        serviceType: service.type || 'validator infrastructure',
        url: canonicalUrl,
        provider: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: canonicalUrl
        },
        areaServed: service.chainName,
        availableChannel: [
          service.api
            ? {
                '@type': 'ServiceChannel',
                serviceUrl: service.api,
                name: 'REST API'
              }
            : null,
          service.rpc
            ? {
                '@type': 'ServiceChannel',
                serviceUrl: service.rpc,
                name: 'RPC Endpoint'
              }
            : null,
          service.grpc
            ? {
                '@type': 'ServiceChannel',
                serviceUrl: service.grpc,
                name: 'gRPC Endpoint'
              }
            : null
        ].filter(Boolean)
      }
    ];
  }, [service, canonicalUrl]);

  if (loading) {
    return (
      <>
        <Seo
          title={metaTitle}
          description={metaDescription}
          canonical={canonicalPath}
          noindex
          openGraph={{
            type: 'website',
            url: canonicalUrl,
            title: `${metaTitle} | ${SITE_NAME}`,
            description: metaDescription,
            image: ogImageUrl
          }}
        />
        <LoadingState />
      </>
    );
  }

  if (!chain || !service) {
    return (
      <>
        <Seo
          title={metaTitle}
          description={metaDescription}
          canonical={canonicalPath}
          noindex
          openGraph={{
            type: 'website',
            url: canonicalUrl,
            title: `${metaTitle} | ${SITE_NAME}`,
            description: metaDescription,
            image: ogImageUrl
          }}
        />
        <EmptyState chainSlug={chainSlug} />
      </>
    );
  }

  return (
    <>
      <Seo
        title={metaTitle}
        description={metaDescription}
        canonical={canonicalPath}
        keywords={metaKeywords}
        openGraph={{
          type: 'website',
          url: canonicalUrl,
          title: `${metaTitle} | ${SITE_NAME}`,
          description: metaDescription,
          image: ogImageUrl
        }}
        structuredData={structuredData}
      />
      <div className="relative min-h-screen flex flex-col bg-transparent">
        <div className="relative z-10 flex-1">
          <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <div className="breadcrumbs text-sm mb-6">
              <ul>
                <li><Link to="/" className="text-primary hover:text-secondary">Home</Link></li>
                <li>{service.chainName}</li>
                <li>Service</li>
              </ul>
            </div>

            {/* Chain Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div className="flex items-center gap-4">
                <Logo
                  slug={chainSlug || ''}
                  chainName={service.chainName}
                  className="w-16 h-16"
                />
                <div>
                  {service.type && (
                    <Badge
                      variant={service.type === 'mainnet' ? 'mainnet' : 'testnet'}
                      className="mb-2"
                    >
                      {service.type}
                    </Badge>
                  )}
                  <h1 className="text-3xl font-bold text-base-content">
                    {service.chainName} Service
                  </h1>
                  <p className="text-base-content/70">
                    API endpoints, snapshots, and network information
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 md:mt-0">
                {service.valoper && (
                  <a
                    href={`https://cdn.crxanode.me/${chainSlug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-outline"
                  >
                    CDN
                  </a>
                )}
                {chain.hasGuide && (
                  <Link
                    to={`/${chainSlug}/guide`}
                    className="btn btn-secondary btn-outline"
                  >
                    Installation Guide
                  </Link>
                )}
              </div>
            </div>

            {/* Endpoints Grid */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-base-content">Network Endpoints</h2>
                <BlockHeight rpcUrl={service.rpc} chainSlug={chainSlug || ''} chainType={service.type as 'mainnet' | 'testnet'} />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="card bg-base-200/70 hover:bg-base-300/70 transition-colors group">
                  <div className="card-body p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-primary">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-base-content">API</h3>
                            <PingBadge url={service.api} label="API" />
                          </div>
                          <p className="text-sm text-base-content/70 font-mono break-all">{service.api}</p>
                        </div>
                      </div>
                      <CopyButton text={service.api} />
                    </div>
                  </div>
                </div>

                <div className="card bg-base-200/70 hover:bg-base-300/70 transition-colors group">
                  <div className="card-body p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-primary">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-base-content">RPC</h3>
                            <PingBadge url={service.rpc} label="RPC" />
                          </div>
                          <p className="text-sm text-base-content/70 font-mono break-all">{service.rpc}</p>
                        </div>
                      </div>
                      <CopyButton text={service.rpc} />
                    </div>
                  </div>
                </div>

                <EndpointCard
                  label="gRPC"
                  value={service.grpc}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                    </svg>
                  }
                />

                <EndpointCard
                  label="Peer"
                  value={service.peer}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                />

                <EndpointCard
                  label="Address Book"
                  value={service.addrbook}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  }
                />

                <EndpointCard
                  label="Genesis"
                  value={service.genesis}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* Snapshots Section */}
            <div>
              <h2 className="text-2xl font-bold text-base-content mb-6">Snapshots</h2>
              <SnapshotTable chain={chain} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
