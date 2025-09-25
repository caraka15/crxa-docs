import { Link } from 'react-router-dom';
import { useChains } from '../hooks/useChains';
import { Header } from '../components/Header';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';

export const Home = () => {
  const { chains, loading, error } = useChains();

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

  if (error) {
    return (
      <div className="min-h-screen bg-base-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-error">
            <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Error loading chains: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Header />

      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-base-content mb-4">
              Crxanode Docs
            </h1>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Cosmos Validator Documentation
            </p>
            <p className="text-lg text-base-content/60 max-w-2xl mx-auto mt-2">
              Access API endpoints, download snapshots, and follow installation guides for Cosmos SDK node validators.
            </p>
          </div>

          {/* Chains Grid */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-base-content mb-6">Available Chains</h2>

            {chains.length === 0 ? (
              <div className="card bg-base-200">
                <div className="card-body text-center py-16">
                  <div className="text-6xl mb-4">🔗</div>
                  <h3 className="text-xl font-semibold text-base-content mb-2">No chains configured</h3>
                  <p className="text-base-content/70">
                    Add chain configuration files to <code>src/chains/service/</code> and <code>src/chains/guide/</code>
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {chains.map((chain) => (
                  <div key={chain.slug} className="card bg-base-200 hover:bg-base-300 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                    <div className="card-body p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Logo
                          slug={chain.slug}
                          chainName={chain.service?.chainName || chain.slug.toUpperCase()}
                          className="w-12 h-12"
                        />
                        <div>
                          <h3 className="text-xl font-bold text-base-content">
                            {chain.service?.chainName || chain.slug.toUpperCase()}
                          </h3>
                          <p className="text-sm text-base-content/60 mt-1">
                            {chain.service && chain.guide ? 'Service & Guide' :
                              chain.service ? 'Service Available' : 'Guide Available'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        {chain.service && (
                          <Link
                            to={`/${chain.slug}/service`}
                            className="btn btn-primary btn-sm flex-1"
                          >
                            Endpoints
                          </Link>
                        )}
                        {chain.guide && (
                          <Link
                            to={`/${chain.slug}/guide`}
                            className="btn btn-secondary btn-sm flex-1"
                          >
                            Guide
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-16 text-center">
            <div className="divider"></div>
            <p className="text-base-content/50">
              Built for Cosmos SDK node validators • Auto-updated from repository data
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};