import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useChains } from '@/hooks/useChains';
import { useAggregateStats } from '@/hooks/useAggregateStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusIndicator } from '@/components/StatusIndicator';
import { ChainService, ValidatorStats, Chain } from '@/types/chain';
import validatorData from '@/data/validator-data.json';
import { Shield, TrendingUp, Users, DollarSign, ExternalLink, Zap, Lock, HeartHandshake, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

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
  <Card className="bg-base-200/70 border-base-300 animate-pulse">
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
    <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-primary/40 hover:border-primary hover:-translate-y-2 hover:scale-[1.03] transition-all duration-500 ease-out bg-base-200/70 border-base-300 before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/0 before:via-primary/0 before:to-primary/0 hover:before:from-primary/10 hover:before:via-primary/5 hover:before:to-transparent before:transition-all before:duration-500">
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 group-hover:drop-shadow-[0_0_15px_rgba(255,101,0,0.5)]">
              <ChainLogo chain={chain} />
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,101,0,0.3)]">{chain.service.chainName}</CardTitle>
              <Badge variant={chain.service.type === 'mainnet' ? 'default' : 'secondary'} className="mt-1 group-hover:scale-110 transition-transform duration-300">
                {chain.service.type || 'network'}
              </Badge>
            </div>
          </div>
          <div className="group-hover:scale-110 transition-transform duration-300">
            <StatusIndicator url={chain.service.rpc} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 rounded-lg bg-base-300/50 group-hover:bg-gradient-to-br group-hover:from-primary/20 group-hover:to-secondary/10 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 border border-transparent group-hover:border-primary/30">
            <p className="text-xs text-muted-foreground mb-1 group-hover:text-primary-foreground transition-colors">Commission</p>
            <p className="font-bold text-sm group-hover:text-lg transition-all duration-300">
              {showPlaceholder ? '-' : `${stats.commission.toFixed(2)}%`}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-base-300/50 group-hover:bg-gradient-to-br group-hover:from-primary/20 group-hover:to-secondary/10 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 border border-transparent group-hover:border-primary/30">
            <p className="text-xs text-muted-foreground mb-1 group-hover:text-primary-foreground transition-colors">Total Stake</p>
            <p className="font-bold text-sm group-hover:text-lg transition-all duration-300">
              {showPlaceholder ? '-' : stats.totalStake.split(' ')[0]}
            </p>
          </div>
          <a href={`${explorerUrl}#uptime`} target="_blank" rel="noopener noreferrer" className="text-center p-3 rounded-lg bg-base-300/50 group-hover:bg-gradient-to-br group-hover:from-primary/20 group-hover:to-secondary/10 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 border border-transparent group-hover:border-primary/30">
            <p className="text-xs text-muted-foreground mb-1 group-hover:text-primary-foreground transition-colors">Uptime</p>
            <p className={`font-bold text-sm group-hover:text-lg transition-all duration-300 ${showPlaceholder ? '' : getUptimeColor(stats.uptime)}`}>
              {showPlaceholder ? '-' : `${stats.uptime.toFixed(2)}%`}
            </p>
          </a>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="relative overflow-hidden hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110 hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700">
            <Link to={`/${chain.slug}/service`}>
              Service
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" disabled={!chain.hasGuide} className="relative overflow-hidden hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110 hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700">
            <Link
              to={`/${chain.slug}/guide`}
              onClick={(e) => !chain.hasGuide && e.preventDefault()}
            >
              Guide
            </Link>
          </Button>
          <Button asChild size="sm" className="flex-1 relative overflow-hidden hover:scale-110 hover:shadow-2xl hover:shadow-primary/60 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700">
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="relative z-10">
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
      <div className="relative z-10">
        {/* Hero Section - Enhanced */}
        <section className="hero min-h-screen bg-transparent relative overflow-hidden">
          {/* Animated gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="hero-content text-center relative z-10">
            <div className="max-w-5xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6 animate-fade-in hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Professional Validator Services</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-bold text-base-content mb-6 animate-fade-in">
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient bg-300%">
                  Crxanode Service
                </span>
                <br />
                <span className="text-4xl md:text-5xl">Validator Network</span>
              </h1>

              <p className="text-xl md:text-2xl text-base-content/70 mb-12 max-w-3xl mx-auto leading-relaxed">
                Secure, reliable, and high-performance validator infrastructure.
                <br />
                <span className="text-primary font-semibold">Stake with confidence and maximize your rewards.</span>
              </p>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
                {heroStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group relative card bg-gradient-to-br from-base-200/80 to-base-300/40 border border-base-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                    <div className="card-body p-6 text-center relative z-10">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                          <stat.icon className="w-6 h-6 text-primary group-hover:drop-shadow-[0_0_8px_rgba(255,101,0,0.8)] transition-all duration-300" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                      <div className="text-sm text-base-content/60 group-hover:text-base-content transition-colors">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="#networks"
                  className="group relative btn btn-primary btn-lg overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/50"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Staking Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </a>
                <a
                  href="#why-stake"
                  className="group btn btn-outline btn-lg hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                >
                  <span className="flex items-center gap-2">
                    Learn More
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Networks Section - Enhanced */}
        <section id="networks" className="py-24 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Multi-Chain Support</span>
              </div>
              <h2 className="text-5xl font-bold text-base-content mb-6">
                Supported <span className="text-primary">Networks</span>
              </h2>
              <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
                Delegate your crypto assets with our trusted and experienced validators across multiple networks
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {chainsLoading ? (
                <>
                  <NetworkCardSkeleton />
                  <NetworkCardSkeleton />
                  <NetworkCardSkeleton />
                </>
              ) : (
                chainsWithService.map((chain, idx) => {
                  const stats = statsMap.get(chain.slug);
                  return (
                    <div
                      key={chain.slug}
                      className="animate-fade-in"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <NetworkCard chain={chain} stats={stats} />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Why Stake Section - Enhanced */}
        <section id="why-stake" className="py-24 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Why Choose Us</span>
              </div>
              <h2 className="text-5xl font-bold text-base-content mb-6">
                Why Stake With <span className="text-primary">{validatorData.validatorInfo.name}</span>?
              </h2>
              <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
                Trust your crypto assets with a professional validator with solid track record and maximum uptime
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {validatorData.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="group card bg-gradient-to-br from-base-100/80 to-base-200/40 border border-base-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-transparent transition-all duration-500"></div>

                  <div className="card-body p-8 text-center relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-primary/50">
                      {feature.icon === 'shield' && <Shield className="w-8 h-8 text-primary group-hover:drop-shadow-[0_0_8px_rgba(255,101,0,0.8)]" />}
                      {feature.icon === 'trending-up' && <TrendingUp className="w-8 h-8 text-primary group-hover:drop-shadow-[0_0_8px_rgba(255,101,0,0.8)]" />}
                      {feature.icon === 'lock' && <Lock className="w-8 h-8 text-primary group-hover:drop-shadow-[0_0_8px_rgba(255,101,0,0.8)]" />}
                      {feature.icon === 'headphones' && <HeartHandshake className="w-8 h-8 text-primary group-hover:drop-shadow-[0_0_8px_rgba(255,101,0,0.8)]" />}
                    </div>
                    <h3 className="text-xl font-bold text-base-content mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-base-content/70 leading-relaxed group-hover:text-base-content/90 transition-colors">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Start Section - Enhanced */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Simple Process</span>
              </div>
              <h2 className="text-5xl font-bold text-base-content mb-6">
                How to Start <span className="text-primary">Staking</span>
              </h2>
              <p className="text-xl text-base-content/70">3 simple steps to start earning passive income</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
              {/* Connection lines */}
              <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-30"></div>

              {validatorData.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="group relative"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="card bg-gradient-to-br from-base-200/80 to-base-300/40 border border-base-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                    <div className="card-body p-8 text-center relative z-10">
                      <div className="relative inline-block mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-3xl font-bold mx-auto group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-primary/50">
                          {idx + 1}
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center group-hover:scale-125 transition-transform">
                          <CheckCircle2 className="w-4 h-4 text-secondary-foreground" />
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-base-content mb-4 group-hover:text-primary transition-colors">{step.title}</h3>
                      <p className="text-base-content/70 leading-relaxed group-hover:text-base-content/90 transition-colors">{step.description}</p>
                    </div>
                  </div>

                  {/* Arrow connector for desktop */}
                  {idx < validatorData.steps.length - 1 && (
                    <div className="hidden md:block absolute top-16 -right-4 z-20">
                      <ArrowRight className="w-8 h-8 text-primary/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section - Enhanced */}
        <section className="py-24 relative overflow-hidden">
          {/* Decorative gradient orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 mb-4">
                <Shield className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">Trusted & Verified</span>
              </div>
              <h2 className="text-5xl font-bold text-base-content mb-6">
                Trusted by the <span className="text-primary">Community</span>
              </h2>
              <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
                Join hundreds of delegators who trust {validatorData.validatorInfo.name} with their assets
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {validatorData.trustIndicators.map((indicator, idx) => (
                <div
                  key={idx}
                  className="group card bg-gradient-to-br from-base-100/80 to-base-200/40 border border-base-300 hover:border-success/50 hover:shadow-2xl hover:shadow-success/20 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-success/0 to-success/0 group-hover:from-success/10 group-hover:to-transparent transition-all duration-500"></div>

                  <div className="card-body p-8 text-center relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-success/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-success/50">
                      <Shield className="w-10 h-10 text-success group-hover:drop-shadow-[0_0_12px_rgba(34,197,94,0.8)] transition-all" />
                    </div>
                    <h3 className="text-xl font-bold text-base-content mb-3 group-hover:text-success transition-colors">{indicator.label}</h3>
                    <p className="text-base-content/70 leading-relaxed group-hover:text-base-content/90 transition-colors">{indicator.description}</p>
                  </div>

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-success/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Enhanced */}
        <section className="py-24 relative overflow-hidden">
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/85 to-secondary/90"></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 mb-6">
                <Zap className="w-4 h-4 text-white animate-pulse" />
                <span className="text-sm font-medium text-white">Get Started Today</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Ready to Start Earning
                <br />
                <span className="bg-gradient-to-r from-white to-secondary-foreground bg-clip-text text-transparent">
                  Rewards?
                </span>
              </h2>

              <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-2xl mx-auto leading-relaxed">
                Join the staking revolution with <span className="font-bold">{validatorData.validatorInfo.name}</span> and maximize your crypto earnings
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a
                  href="#networks"
                  className="group relative btn btn-secondary btn-lg text-lg px-8 hover:scale-110 transition-all duration-300 overflow-hidden shadow-2xl"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Staking Now
                    <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </a>

                <a
                  href="mailto:admin@crxanode.me"
                  className="group btn btn-outline border-2 border-white/50 text-white hover:bg-white/20 hover:border-white btn-lg text-lg px-8 hover:scale-110 transition-all duration-300 shadow-xl"
                >
                  <span className="flex items-center gap-2">
                    Contact Us
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
              </div>

              {/* Trust badges */}
              <div className="mt-16 flex flex-wrap justify-center gap-8 text-white/80">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">Secure & Reliable</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span className="text-sm font-medium">24/7 Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">Professional Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
