import { useParams, Link } from 'react-router-dom';
import { useChains } from '../hooks/useChains';
import { Header } from '../components/Header';
import { EndpointCard } from '../components/EndpointCard';
import { SnapshotTable } from '../components/SnapshotTable';

export const ServicePage = () => {
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

  if (!chain || !chain.service) {
    return (
      <div className="min-h-screen bg-base-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-error">
            <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Chain "{chainSlug}" not found or no service configuration available.</span>
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

  const service = chain.service;

  return (
    <div className="min-h-screen bg-base-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
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
          <div>
            <h1 className="text-3xl font-bold text-base-content mb-2">
              {service.chainName} Service
            </h1>
            <p className="text-base-content/70">
              API endpoints, snapshots, and network information
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            {chain.guide && (
              <Link 
                to={`/${chainSlug}/guide`}
                className="btn btn-secondary btn-outline"
              >
                📖 Installation Guide
              </Link>
            )}
          </div>
        </div>

        {/* Endpoints Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-base-content mb-6">Network Endpoints</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <EndpointCard
              label="API"
              value={service.api}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <EndpointCard
              label="RPC"
              value={service.rpc}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              }
            />
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
          </div>
        </div>

        {/* Snapshots Section */}
        <div>
          <h2 className="text-2xl font-bold text-base-content mb-6">Snapshots</h2>
          <SnapshotTable snapshots={service.snapshots} />
        </div>
      </div>
    </div>
  );
};