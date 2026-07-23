import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Use a persistent socket connection for the ticker
const socket = io('/', { 
  path: '/socket.io',
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity
});

export const PriceTicker: React.FC = () => {
  const [prices, setPrices] = useState<Record<string, { price: number, change: number, lastUpdate: number }>>({});
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    
    const handleMarketTicks = (ticks: any) => {
      setPrices(prev => {
        const next = { ...prev };
        Object.entries(ticks).forEach(([pair, data]: [string, any]) => {
          const oldPrice = prev[pair]?.price || data.price;
          next[pair] = {
            price: data.price,
            change: data.price - oldPrice,
            lastUpdate: Date.now()
          };
        });
        return next;
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('market_ticks', handleMarketTicks);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('market_ticks', handleMarketTicks);
    };
  }, []);

  const pairsToShow = ['BTC/USD', 'ETH/USD', 'EUR/USD', 'GBP/USD', 'Gold (OTC)', 'Crypto IDX'];

  return (
    <div className="w-full bg-[#1c1d22]/80 backdrop-blur-md border-y border-white/5 py-4 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full shrink-0">
             <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
             <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Live Feed</span>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            <motion.div 
              className="flex items-center gap-10 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ 
                duration: 150, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              {/* Duplicate pairs for seamless loop */}
              {[...pairsToShow, ...pairsToShow].map((pair, idx) => {
                const data = prices[pair];
                const price = data?.price || 0;
                const change = data?.change || 0;
                const isUp = change >= 0;
                
                return (
                  <div key={`${pair}-${idx}`} className="flex items-center gap-3 min-w-fit">
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{pair}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-mono font-black ${price === 0 ? 'text-gray-600' : isUp ? 'text-green-500' : 'text-red-500'}`}>
                          {price === 0 ? '---.---' : price.toLocaleString(undefined, { minimumFractionDigits: pair.includes('USD') && !pair.includes('BTC') ? 4 : 2, maximumFractionDigits: 5 })}
                        </span>
                        {price !== 0 && (
                          <div className={`flex items-center ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
