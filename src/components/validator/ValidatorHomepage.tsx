import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useChains } from '@/hooks/useChains';
import { useAggregateStats } from '@/hooks/useAggregateStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusIndicator } from '@/components/StatusIndicator';
import { NetworkBackground } from '@/components/NetworkBackground';
import { ChainService, ValidatorStats, Chain } from '@/types/chain';
import validatorData from '@/data/validator-data.json';
import { Shield, TrendingUp, Users, DollarSign, ExternalLink } from 'lucide-react';

const LOGO_BASE_URL = 'https://explorer.crxanode.me/logos/';
const EXTENSIONS = ['png', 'svg', 'jpg'];

const getUptimeColor = (uptime: number): string => {
  if (uptime >= 90) return 'text-success';
  if (uptime >= 80) return 'text-warning';
  return 'text-error';
};

const ChainLogo: React.FC<{ chain: Chain }> = ({ chain }) => {
  const [imageSrc, setImageSrc] = useState(`${LOGO_BASE_URL}${chain.service!.chainName.toLowerCase()}.${EXTENSIONS[0]}`);
  const [errorCount, setErrorCount] = useState(0);

  const handleError = () => {
    if (errorCount < EXTENSIONS.length - 1) {
      const nextExtension = EXTENSIONS[errorCount + 1];
      setImageSrc(`${LOGO_BASE_URL}${chain.service!.chainName.toLowerCase()}.${nextExtension}`);
      setErrorCount(errorCount + 1);
    } else {
      setErrorCount(errorCount + 1);
    }
  };

  if (!chain.service || errorCount >= EXTENSIONS.length) {
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <span className="text-xl font-bold text-primary">
          {chain.service ? chain.service.chainName.charAt(0) : '#'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      onError={handleError}
      alt={`${chain.service.chainName} logo`}
      className="w-12 h-12 rounded-full"
    />
  );
};

const getExplorerStakingUrl = (service: ChainService): string => {
  const { explorer } = validatorData.validatorInfo;
  if (!explorer) return '#';

  const host = service.type === 'testnet'
    ? `https://testnet-${explorer.baseUrl}`
    : `https://${explorer.baseUrl}`;

  const path = explorer.stakingPath
    .replace('{chainName}', service.chainName.toLowerCase())
    .replace('{valoper}', service.valoper || '');

  return `${host}${path}`;
};

const NetworkCardSkeleton: React.FC = () => (
  <Card className="bg-base-200/80 backdrop-blur-sm border-base-300 animate-pulse">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-base-300"></div>
          <div>
            <div className="h-4 w-24 bg-base-300 rounded mb-2"></div>
            <div className="h-3 w-16 bg-base-300 rounded"></div>
          </div>
        </div>
        <div className="w-4 h-4 bg-base-300 rounded-full"></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center p-2 rounded-lg bg-base-300/50">
            <div className="h-3 w-12 bg-base-300 rounded mx-auto mb-1"></div>
            <div className="h-4 w-10 bg-base-300 rounded mx-auto"></div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-full bg-base-300 rounded"></div>
        <div className="h-9 w-full bg-base-300 rounded"></div>
        <div className="h-9 w-full bg-base-300 rounded"></div>
      </div>
    </CardContent>
  </Card>
);

const NetworkCard: React.FC<{ chain: Chain, stats: ValidatorStats | undefined }> = ({ chain, stats }) => {
  if (!chain.service) {
    return <NetworkCardSkeleton />;
  }
  const explorerUrl = getExplorerStakingUrl(chain.service!);
  const showPlaceholder = !stats || stats.loading || stats.error;

  return (
    <Card className="group hover:shadow-xl hover:border-primary/50 transition-all duration-300 bg-base-200/80 backdrop-blur-sm border-base-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChainLogo chain={chain} />
            <div>
              <CardTitle className="text-lg">{chain.service.chainName}</CardTitle>
              <Badge variant={chain.service.type === 'mainnet' ? 'default' : 'secondary'} className="mt-1">
                {chain.service.type || 'network'}
              </Badge>
            </div>
          </div>
          <StatusIndicator url={chain.service.rpc} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg bg-base-300/50">
            <p className="text-xs text-muted-foreground mb-1">Commission</p>
            <p className="font-bold text-sm">
              {showPlaceholder ? '-' : `${stats.commission.toFixed(2)}%`}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-base-300/50">
            <p className="text-xs text-muted-foreground mb-1">Total Stake</p>
            <p className="font-bold text-sm">
              {showPlaceholder ? '-' : stats.totalStake.split(' ')[0]}
            </p>
            {/* <p className="text-xs text-muted-foreground">
              {showPlaceholder ? '' : stats.totalStake.split(' ')[1]}
            </p> */}
          </div>
          <div className="text-center p-2 rounded-lg bg-base-300/50">
            <p className="text-xs text-muted-foreground mb-1">Uptime</p>
            <p className={`font-bold text-sm ${showPlaceholder ? '' : getUptimeColor(stats.uptime)}`}>
              {showPlaceholder ? '-' : `${stats.uptime.toFixed(2)}%`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/${chain.slug}/service`}
            className="inline-flex items-center justify-center hover:bg-orange-600 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-content"
          >
            Service
          </Link>
          <Link
            to={`/${chain.slug}/guide`}
            className={`inline-flex items-center justify-center hover:bg-orange-600 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-9 px-3 border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-content ${!chain.guide ? 'pointer-events-none opacity-50' : ''}`}
            onClick={(e) => !chain.guide && e.preventDefault()}
          >
            Guide
          </Link>
          <Button asChild size="sm" className="flex-1 hover:outline-orange-600 outline outline-0 hover:outline-1">
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3 mr-1" />
              Stake with Us
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ValidatorHomepage = () => {
  const { chains, loading: chainsLoading } = useChains();
  const { stats: allValidatorStats, loading: statsLoading } = useAggregateStats(chains);

  const aggregateStats = useMemo(() => {
    if (statsLoading || allValidatorStats.length === 0) {
      return {
        totalDelegated: '...',
        totalChains: chains.length,
        avgUptime: 0, // Default to a number for calculation
        avgUptimeDisplay: '...',
        avgCommission: '...',
      };
    }

    const totalStakeRaw = allValidatorStats.reduce((sum, s) => sum + s.totalStakeRaw, 0);
    const avgUptime = allValidatorStats.reduce((sum, s) => sum + s.uptime, 0) / allValidatorStats.length;
    const avgCommission = allValidatorStats.reduce((sum, s) => sum + s.commission, 0) / allValidatorStats.length;

    return {
      totalDelegated: totalStakeRaw.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      totalChains: chains.length,
      avgUptime: avgUptime,
      avgUptimeDisplay: `${avgUptime.toFixed(2)}%`,
      avgCommission: `${avgCommission.toFixed(2)}%`,
    };
  }, [allValidatorStats, statsLoading, chains.length]);

  const heroStats = [
    { label: 'Total Delegated', value: aggregateStats.totalDelegated, icon: DollarSign },
    { label: 'Active Networks', value: aggregateStats.totalChains.toString(), icon: Users },
    {
      label: 'Avg Uptime',
      value: <span className={statsLoading ? '' : getUptimeColor(aggregateStats.avgUptime)}>{aggregateStats.avgUptimeDisplay}</span>,
      icon: Shield
    },
    { label: 'Avg Commission', value: aggregateStats.avgCommission, icon: TrendingUp },
  ];

  const chainsWithService = chains.filter(c => c.service);
  const statsMap = useMemo(() =>
    new Map(allValidatorStats.map(s => [s.slug, s]))
    , [allValidatorStats]);

  return (
    <div className="relative min-h-screen">
      <NetworkBackground />
      <div className="relative z-10">
        <section className="hero min-h-screen bg-transparent">
          <div className="hero-content text-center">
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-7xl font-bold text-base-content mb-6">
                <span className="text-primary">Crxanode</span> Validator
              </h1>
              <p className="text-xl md:text-2xl text-base-content/70 mb-8 max-w-3xl mx-auto">
                Professional Proof-of-Stake validator. Stake your assets with confidence and earn rewards securely.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
                {heroStats.map((stat, index) => (
                  <div key={index} className="card bg-base-200/80 backdrop-blur-sm border border-base-300">
                    <div className="card-body p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <stat.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-sm text-base-content/60">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#networks" className="btn btn-primary btn-lg">Start Staking Now</a>
                <a href="#why-stake" className="btn btn-outline btn-lg">Learn More</a>
              </div>
            </div>
          </div>
        </section>

        <section id="networks" className="py-20 bg-base-100/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-base-content mb-4">Supported Networks</h2>
              <p className="text-xl text-base-content/70">Delegate your crypto assets with our trusted and experienced validators</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {chainsLoading ? (
                <>
                  <NetworkCardSkeleton />
                  <NetworkCardSkeleton />
                  <NetworkCardSkeleton />
                </>
              ) : (
                chainsWithService.map(chain => {
                  const stats = statsMap.get(chain.slug);
                  return <NetworkCard key={chain.slug} chain={chain} stats={stats} />;
                })
              )}
            </div>
          </div>
        </section>

        {/* Other sections remain the same... */}
        <section id="why-stake" className="py-20 bg-base-200/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-base-content mb-4">Why Stake With {validatorData.validatorInfo.name}?</h2>
              <p className="text-xl text-base-content/70 max-w-3xl mx-auto">Trust your crypto assets with a professional validator with solid track record and maximum uptime</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {validatorData.features.map((feature, idx) => (
                <div key={idx} className="card bg-base-100/80 backdrop-blur-sm border border-base-300 hover:shadow-lg transition-shadow">
                  <div className="card-body p-6 text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      {feature.icon === 'shield' && <Shield className="w-6 h-6 text-primary" />}
                      {feature.icon === 'trending-up' && <TrendingUp className="w-6 h-6 text-primary" />}
                      {feature.icon === 'lock' && <Shield className="w-6 h-6 text-primary" />}
                      {feature.icon === 'headphones' && <Users className="w-6 h-6 text-primary" />}
                    </div>
                    <h3 className="text-lg font-bold text-base-content mb-2">{feature.title}</h3>
                    <p className="text-base-content/70 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-base-100/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-base-content mb-4">How to Start Staking</h2>
              <p className="text-xl text-base-content/70">3 simple steps to start earning passive income</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {validatorData.steps.map((step, idx) => (
                <div key={idx} className="card bg-base-200/80 backdrop-blur-sm border border-base-300 hover:shadow-lg transition-shadow">
                  <div className="card-body p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      {idx + 1}
                    </div>
                    <h3 className="text-xl font-bold text-base-content mb-2">{step.title}</h3>
                    <p className="text-base-content/70">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-base-200/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-base-content mb-4">Trusted by the Community</h2>
              <p className="text-xl text-base-content/70">Join hundreds of delegators who trust {validatorData.validatorInfo.name} with their assets</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {validatorData.trustIndicators.map((indicator, idx) => (
                <div key={idx} className="card bg-base-100/80 backdrop-blur-sm border border-base-300">
                  <div className="card-body p-6 text-center">
                    <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-lg font-bold text-base-content mb-2">{indicator.label}</h3>
                    <p className="text-base-content/70 text-sm">{indicator.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

                <section className="py-20 bg-primary dark:text-primary-content">

                  <div className="container mx-auto px-4 text-center">

                    <h2 className="text-4xl font-bold mb-4">

                      Ready to Start Earning Rewards?

                    </h2>

                    <p className="text-xl mb-8 opacity-90">

                      Join the staking revolution with {validatorData.validatorInfo.name}

                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">

                      <a href="#networks" className="btn btn-secondary btn-lg">

                        Start Staking Now

                      </a>

                      <a href="mailto:contact@crxanode.me" className="btn btn-outline btn-lg dark:text-primary-content dark:border-primary-content dark:hover:bg-primary-content dark:hover:text-primary">

                        Contact Us

                      </a>

                    </div>

                  </div>

                </section>
      </div>
    </div>
  );
};