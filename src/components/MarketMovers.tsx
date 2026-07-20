import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Mover {
  symbol: string;
  name: string;
  change: number;
  price: number;
  volatility: number;
}

export const MarketMovers: React.FC = () => {
  const [movers, setMovers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchMovers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/market-movers');
      if (!response.ok) throw new Error('Failed to fetch movers');
      const data = await response.json();
      setMovers(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovers();
    // Poll every 60 seconds for real-time updates
    const interval = setInterval(fetchMovers, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#22232a] border border-white/5 rounded-[32px] p-8 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
        <Activity size={120} className="text-[#ffcf00]" />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <TrendingUp className="text-[#ffcf00]" />
            Market <span className="text-[#ffcf00]">Movers</span>
          </h3>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
            Top 5 High Volatility Assets
          </p>
        </div>
        <button 
          onClick={fetchMovers}
          disabled={loading}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''} text-gray-400`} />
        </button>
      </div>

      <div className="space-y-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {loading && movers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-4">
              <Activity size={48} className="animate-pulse text-[#ffcf00]" />
              <p className="font-bold text-sm">Analyzing market dynamics...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-400 text-sm font-bold bg-red-400/5 rounded-2xl border border-red-400/10">
              {error}
            </div>
          ) : (
            movers.map((mover, index) => (
              <motion.div
                key={mover.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-[#ffcf00]/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm ${mover.change >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {mover.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="font-black tracking-tight">{mover.symbol}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase truncate max-w-[120px]">{mover.name}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-mono font-bold text-sm">${mover.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className={`flex items-center justify-end gap-1 text-xs font-black ${mover.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {mover.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(mover.change).toFixed(2)}%
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-600 font-bold uppercase tracking-widest">
        <span>Powered by FMP API</span>
        <span>Last Update: {lastUpdated.toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
