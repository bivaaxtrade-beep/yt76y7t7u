import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Clock, Activity, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Use same socket.io path as PriceTicker to reuse or establish safe connection
const socket = io('/', {
  path: '/socket.io',
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity
});

interface MarketDetails {
  name: string;
  price: number;
  active: boolean;
  payout: number;
  trend: 'up' | 'down' | 'random';
  volatility: number;
  targetPrice: number | null;
  isFrozen: boolean;
  lastChange?: number;
}

interface MarketStateResponse {
  systemActive: boolean;
  globalManipulationMode: string;
  markets: Record<string, MarketDetails>;
}

export const MarketStatusCard: React.FC = () => {
  const navigate = useNavigate();
  const [systemActive, setSystemActive] = useState(true);
  const [markets, setMarkets] = useState<Record<string, MarketDetails>>({});
  const [priceChanges, setPriceChanges] = useState<Record<string, 'up' | 'down' | null>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'crypto' | 'forex' | 'otc'>('all');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Dynamic status check based on UTC calendar trading hours
  const getAssetStatus = (pair: string, isFrozen: boolean) => {
    // If the entire trading platform is turned off by admin
    if (!systemActive) {
      return { open: false, reason: 'Platform Closed' };
    }
    
    // If specific market is frozen for maintenance
    if (isFrozen) {
      return { open: false, reason: 'Maintenance' };
    }

    const isOTC = pair.includes('(OTC)') || pair.includes('Crypto IDX');
    const isCrypto = pair.includes('/USD') && (
      pair.includes('BTC') || pair.includes('ETH') || pair.includes('SOL') || 
      pair.includes('ADA') || pair.includes('XRP') || pair.includes('DOGE') || 
      pair.includes('SHIB') || pair.includes('AVAX') || pair.includes('DOT')
    );

    // Crypto and OTC assets trade 24/7/365
    if (isOTC || isCrypto) {
      return { open: true, reason: '24/7 Live' };
    }

    // Real-world Forex and Stocks are closed on weekends
    const day = currentTime.getUTCDay(); // 0 = Sunday, 6 = Saturday
    const hours = currentTime.getUTCHours();

    // Weekend closed hours: Friday 21:00 UTC to Sunday 22:00 UTC
    if (day === 6) {
      return { open: false, reason: 'Weekend Closed' };
    }
    if (day === 5 && hours >= 21) {
      return { open: false, reason: 'Market Closed' };
    }
    if (day === 0 && hours < 22) {
      return { open: false, reason: 'Weekend Closed' };
    }

    // Specific Stock hours (e.g., Yum Brands): 13:30 to 20:00 UTC Mon-Fri
    if (pair === 'Yum Brands') {
      if (hours < 13 || hours >= 20) {
        return { open: false, reason: 'Market Hours' };
      }
    }

    return { open: true, reason: 'Live Trading' };
  };

  // Fetch initial market states from server API
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await fetch('/api/market/state');
        if (res.ok) {
          const data: MarketStateResponse = await res.json();
          setSystemActive(data.systemActive);
          setMarkets(data.markets || {});
        }
      } catch (err) {
        console.error('Error fetching market states:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();

    // Setup an interval to update current time for calendar calculation
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);

    return () => clearInterval(timeInterval);
  }, []);

  // Sync prices in real time over Socket.IO connection
  useEffect(() => {
    const handleConnect = () => console.log('⚡ Market Status Card connected to live socket');
    
    const handleMarketTicks = (ticks: any) => {
      const priceUpdates: Record<string, 'up' | 'down'> = {};
      let hasPriceChanges = false;

      setMarkets(prev => {
        const next = { ...prev };
        let updated = false;

        Object.entries(ticks).forEach(([pair, data]: [string, any]) => {
          if (next[pair]) {
            const oldPrice = next[pair].price;
            const newPrice = data.price;
            
            if (oldPrice !== newPrice) {
              next[pair] = {
                ...next[pair],
                price: newPrice
              };
              updated = true;
              hasPriceChanges = true;
              priceUpdates[pair] = newPrice > oldPrice ? 'up' : 'down';
            }
          }
        });

        return updated ? next : prev;
      });

      if (hasPriceChanges) {
        setPriceChanges(prev => ({ ...prev, ...priceUpdates }));
        setTimeout(() => {
          setPriceChanges(prev => {
            const reset = { ...prev };
            Object.keys(priceUpdates).forEach(pair => {
              reset[pair] = null;
            });
            return reset;
          });
        }, 800);
      }
    };

    const handleMarketSettingsUpdate = (updatedMarkets: Record<string, MarketDetails>) => {
      setMarkets(prev => {
        const next = { ...prev };
        Object.entries(updatedMarkets).forEach(([pair, details]) => {
          next[pair] = {
            ...next[pair],
            ...details
          };
        });
        return next;
      });
    };

    const handleSystemStatus = (status: boolean) => {
      setSystemActive(status);
    };

    socket.on('connect', handleConnect);
    socket.on('market_ticks', handleMarketTicks);
    socket.on('market_settings_updated', handleMarketSettingsUpdate);
    socket.on('system_status', handleSystemStatus);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('market_ticks', handleMarketTicks);
      socket.off('market_settings_updated', handleMarketSettingsUpdate);
      socket.off('system_status', handleSystemStatus);
    };
  }, []);

  // Selection of highly recognizable trading assets across distinct categories
  const curatedPairs = [
    { pair: 'Crypto IDX', category: 'crypto', displayName: 'Crypto IDX' },
    { pair: 'BTC/USD', category: 'crypto', displayName: 'Bitcoin (BTC/USD)' },
    { pair: 'ETH/USD', category: 'crypto', displayName: 'Ethereum (ETH/USD)' },
    { pair: 'EUR/USD (OTC)', category: 'otc', displayName: 'EUR/USD (OTC)' },
    { pair: 'GBP/USD (OTC)', category: 'otc', displayName: 'GBP/USD (OTC)' },
    { pair: 'EUR/USD', category: 'forex', displayName: 'EUR/USD' },
    { pair: 'GBP/USD', category: 'forex', displayName: 'GBP/USD' },
    { pair: 'Gold (OTC)', category: 'otc', displayName: 'Gold (OTC)' },
    { pair: 'Apple (OTC)', category: 'otc', displayName: 'Apple (OTC)' },
    { pair: 'Yum Brands', category: 'forex', displayName: 'Yum Brands' }
  ];

  const filteredCuratedPairs = curatedPairs.filter(p => {
    if (activeTab === 'all') return true;
    return p.category === activeTab;
  });

  return (
    <div className="w-full max-w-4xl mx-auto" id="live-market-status-widget">
      <div className="bg-[#22232a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow aesthetic backgrounds */}
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-[#ffcf00]/5 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-green-500/5 blur-[60px] rounded-full pointer-events-none" />

        {/* Header and Platform Indicator */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] bg-[#ffcf00]/10 text-[#ffcf00] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#ffcf00]/20 flex items-center gap-1">
                <Sparkles size={10} />
                Real-Time Feeds
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Trading Market Status
            </h3>
            <p className="text-gray-400 text-xs mt-1">
              Select an asset class to view live quotes and open trading sessions.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl shrink-0">
            <div className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${systemActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${systemActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </div>
            <div className="text-left font-sans">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none">PLATFORM STATUS</div>
              <div className="text-xs font-black text-white mt-0.5">{systemActive ? 'ONLINE & RUNNING' : 'SYSTEM OVERLOAD'}</div>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {[
            { id: 'all', label: 'All Asset Pools' },
            { id: 'crypto', label: 'Crypto Assets' },
            { id: 'forex', label: 'Standard Forex' },
            { id: 'otc', label: 'OTC Options' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === tab.id
                  ? 'bg-[#ffcf00] border-[#ffcf00] text-black shadow-lg shadow-yellow-500/10'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Assets Status list */}
        {loading ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#ffcf00] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-400 font-bold">Synchronizing trading registers...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredCuratedPairs.map(item => {
                const liveDetails = markets[item.pair];
                const price = liveDetails?.price || 0;
                const payout = liveDetails?.payout || 80;
                const isFrozen = liveDetails?.isFrozen || false;
                const { open, reason } = getAssetStatus(item.pair, isFrozen);
                const currentChange = priceChanges[item.pair];

                return (
                  <motion.div
                    key={item.pair}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between p-4 bg-[#282932]/40 hover:bg-[#282932]/70 border border-white/5 hover:border-white/10 rounded-2xl transition-all"
                  >
                    {/* Left: Asset details */}
                    <div className="flex flex-col items-start text-left">
                      <span className="text-xs font-black text-white leading-tight">
                        {item.displayName}
                      </span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] font-black uppercase bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/5">
                          {item.category === 'crypto' ? 'Crypto' : item.category === 'otc' ? 'OTC Pair' : 'Forex Pair'}
                        </span>
                        <span className="text-[10px] text-green-400 font-black">
                          {payout}% Payout
                        </span>
                      </div>
                    </div>

                    {/* Right: Price & Open/Closed Status */}
                    <div className="flex flex-col items-end">
                      {/* Price container */}
                      <div className="mb-1">
                        <span
                          className={`font-mono text-sm font-black transition-colors duration-300 ${
                            currentChange === 'up'
                              ? 'text-green-400 bg-green-400/10 px-1 py-0.5 rounded'
                              : currentChange === 'down'
                              ? 'text-red-400 bg-red-400/10 px-1 py-0.5 rounded'
                              : 'text-gray-300'
                          }`}
                        >
                          {price === 0
                            ? '---.---'
                            : price.toLocaleString(undefined, {
                                minimumFractionDigits: item.pair.includes('USD') && !item.pair.includes('BTC') ? 4 : 2,
                                maximumFractionDigits: 5
                              })}
                        </span>
                      </div>

                      {/* Status Indicator Badge */}
                      <div className="flex items-center gap-1.5">
                        {open ? (
                          <div className="flex items-center gap-1 text-[10px] font-black text-green-400 uppercase bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span>{reason}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] font-black text-amber-500 uppercase bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>{reason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Footer actions inside status widget */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={14} className="text-[#ffcf00]" />
            <span>Market states update dynamically in live sessions.</span>
          </div>

          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto bg-[#ffcf00] hover:bg-[#e6bb00] text-black font-black text-xs px-6 py-3 rounded-xl transition-all uppercase tracking-wide flex items-center justify-center gap-2"
          >
            Open Trading Terminal
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};
