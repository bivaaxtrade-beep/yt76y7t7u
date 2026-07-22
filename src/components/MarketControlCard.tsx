import React, { useState } from 'react';
import { AssetLogo } from './AssetLogo';
import { 
    Snowflake, TrendingUp, RefreshCw, TrendingDown, Activity, ChevronRight, Search, AlertTriangle 
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'react-hot-toast';

export const MarketControlCard = ({ pair, data, updateMarket, appConfig, fetchMarketState }: any) => {
    const [isAdvanced, setIsAdvanced] = useState(false);
    
    return (
        <div className="bg-[#0d0d12] border border-white/5 rounded-[32px] p-6 space-y-5 hover:border-white/10 transition-all group relative overflow-hidden flex flex-col min-h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 opacity-0 group-hover:opacity-100 blur-3xl rounded-full -mr-16 -mt-16 transition-opacity" />
            
            <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                    <AssetLogo name={pair} size={48} />
                    <div className="space-y-0.5">
                        <h4 className="text-base font-black text-white leading-none flex items-center gap-2">
                            {pair}
                            {data.hidden && <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[8px] border border-red-500/20">HIDDEN</span>}
                        </h4>
                        <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] font-mono text-yellow-500 bg-yellow-500/5 px-1.5 py-0.5 rounded border border-yellow-500/10">
                                ৳{data.price.toFixed(data.price < 1 ? 5 : 2)}
                            </span>
                            <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                                data.trend === 'up' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
                                data.trend === 'down' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
                                'bg-gray-500/10 border-gray-500/20 text-gray-500'
                            }`}>
                                {data.trend?.toUpperCase() || 'RANDOM'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => updateMarket(pair, { isFrozen: !data.isFrozen })}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${data.isFrozen ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}
                        title={data.isFrozen ? "Unfreeze Market" : "Freeze Market"}
                    >
                        <Snowflake size={18} />
                    </button>
                </div>
            </div>

            {/* QUICK CONTROLS */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { id: 'up', label: 'Bullish', icon: TrendingUp, color: 'green' },
                    { id: 'random', label: 'Natural', icon: RefreshCw, color: 'gray' },
                    { id: 'down', label: 'Bearish', icon: TrendingDown, color: 'red' }
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => updateMarket(pair, { trend: t.id })}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-1.5 ${
                            data.trend === t.id 
                                ? (t.id === 'up' ? 'bg-green-500 border-green-500 text-black shadow-lg' : t.id === 'down' ? 'bg-red-500 border-red-500 text-white shadow-lg' : 'bg-white border-white text-black shadow-lg')
                                : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                        }`}
                    >
                        <t.icon size={16} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{t.label}</span>
                    </button>
                ))}
            </div>

            {/* PRESSURE SLIDER */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Activity size={12} className="text-gray-500" />
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest pt-0.5">Candle Pressure</p>
                    </div>
                    <span className={`text-[11px] font-black font-mono ${data.pressure > 0 ? 'text-green-500' : data.pressure < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {data.pressure > 0 ? '+' : ''}{data.pressure || 0}%
                    </span>
                </div>
                <input 
                    type="range"
                    min="-100"
                    max="100"
                    step="5"
                    value={data.pressure || 0}
                    onChange={e => updateMarket(pair, { pressure: Number(e.target.value) })}
                    className="w-full h-1 rounded-full bg-white/10 appearance-none cursor-pointer accent-yellow-500"
                />
                <div className="flex justify-between text-[7px] font-black text-gray-700 uppercase tracking-widest">
                    <span>Extreme Dump</span>
                    <span>Neutral</span>
                    <span>Extreme Pump</span>
                </div>
            </div>

            {/* LIMITS SECTION */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Min Stake</label>
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5 focus-within:border-yellow-500/50 transition-colors">
                        <span className="text-[10px] text-gray-500">৳</span>
                        <input 
                            type="number" 
                            value={data.minTrade || appConfig.globalMinTrade || 100}
                            onChange={e => updateMarket(pair, { minTrade: Number(e.target.value) })}
                            className="w-full bg-transparent text-[10px] font-mono text-white outline-none"
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Max Stake</label>
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5 focus-within:border-yellow-500/50 transition-colors">
                        <span className="text-[10px] text-gray-500">৳</span>
                        <input 
                            type="number" 
                            value={data.maxTrade || appConfig.globalMaxTrade || 50000}
                            onChange={e => updateMarket(pair, { maxTrade: Number(e.target.value) })}
                            className="w-full bg-transparent text-[10px] font-mono text-white outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-2 mt-auto">
                <button 
                    onClick={() => setIsAdvanced(!isAdvanced)}
                    className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                    {isAdvanced ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} />}
                    {isAdvanced ? 'Collapse Parameters' : 'Advanced Configuration'}
                </button>
            </div>

            {/* ADVANCED SECTION */}
            <AnimatePresence>
                {isAdvanced && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-4 pt-4 border-t border-white/5"
                    >
                        {/* MANUAL PRICE OVERRIDE */}
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Price Override (Enter to Apply)</label>
                            <div className="relative">
                                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input 
                                    type="number" 
                                    step="0.00001"
                                    placeholder={data.price.toFixed(5)}
                                    onKeyPress={(e: any) => {
                                        if (e.key === 'Enter') {
                                            updateMarket(pair, { setPrice: e.target.value });
                                            e.target.value = '';
                                            toast.success(`${pair} price updated manually`);
                                        }
                                    }}
                                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-[11px] text-white outline-none focus:border-yellow-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* MANIPULATION MODE */}
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Protocol Override</label>
                            <select 
                                value={data.manipulation?.mode || 'percentage'}
                                onChange={e => fetch('/api/admin/market/manipulation', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                        pair, 
                                        targetTrend: data.manipulation?.targetTrend || 'random', 
                                        profitPercentage: data.manipulation?.profitPercentage || 0, 
                                        enabled: data.manipulation?.enabled || false,
                                        mode: e.target.value
                                    })
                                }).then(fetchMarketState)}
                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2.5 text-[10px] text-white outline-none focus:border-yellow-500"
                            >
                                <option value="percentage">Manual Trend Bias</option>
                                <option value="smart_house">Smart House Logic</option>
                                <option value="always_loss">Force Client Loss</option>
                                <option value="always_win">Force Client Win</option>
                            </select>
                        </div>

                        {/* HOUSE EDGE & VISIBILITY */}
                        <div className="grid grid-cols-2 gap-3">
                             <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">House Edge</span>
                                    <span className="text-[9px] font-black text-yellow-500">{data.houseEdge || 10}%</span>
                                </div>
                                <input 
                                    type="number"
                                    placeholder="Set %"
                                    onKeyPress={(e: any) => {
                                        if (e.key === 'Enter') {
                                            updateMarket(pair, { houseEdge: e.target.value });
                                            toast.success(`${pair} house edge set to ${e.target.value}%`);
                                        }
                                    }}
                                    className="w-full bg-transparent text-[10px] border-b border-white/10 outline-none text-white focus:border-yellow-500"
                                />
                             </div>
                             <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col justify-between">
                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Visibility</span>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[9px] font-medium text-gray-400">{data.hidden ? 'Hidden' : 'Visible'}</span>
                                    <button 
                                        onClick={() => updateMarket(pair, { hidden: !data.hidden })}
                                        className={`w-8 h-4 rounded-full transition-all relative flex items-center px-0.5 ${data.hidden ? 'bg-red-500' : 'bg-green-500'}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-all ${data.hidden ? 'ml-auto' : 'mr-auto'}`} />
                                    </button>
                                </div>
                             </div>
                        </div>

                        {/* VOLUME BIAS TRACKING */}
                        <div className="space-y-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <div className="flex justify-between items-center text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                <span>Volume UP</span>
                                <span className="text-green-500 font-mono text-[10px]">৳{(data.totalUp || 0).toLocaleString()}</span>
                            </div>
                            <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500 transition-all duration-500" 
                                    style={{ width: `${(data.totalUp + data.totalDown) > 0 ? (data.totalUp / (data.totalUp + data.totalDown)) * 100 : 50}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                <span>Volume DOWN</span>
                                <span className="text-red-500 font-mono text-[10px]">৳{(data.totalDown || 0).toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={() => {
                                    if (confirm(`Reset volume tracking for ${pair}?`)) {
                                        fetch('/api/admin/market/reset-pressure', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ pair })
                                        }).then(fetchMarketState);
                                    }
                                }}
                                className="w-full py-1.5 rounded-lg bg-white/5 text-[8px] font-black uppercase text-gray-500 hover:text-white transition-colors"
                            >
                                Reset Counters
                            </button>
                        </div>

                        {/* FREEZE SETTINGS */}
                        {data.isFrozen && (
                            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-3">
                                <div className="flex items-center gap-2 text-blue-400">
                                    <AlertTriangle size={14} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Freeze Protocol Active</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {['volatility', 'maintenance'].map((reason) => (
                                        <button
                                            key={reason}
                                            onClick={() => updateMarket(pair, { freezeReason: reason })}
                                            className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                (data.freezeReason || 'volatility') === reason 
                                                    ? 'bg-blue-500 text-white border-blue-500' 
                                                    : 'bg-white/5 border-white/5 text-gray-500'
                                            }`}
                                        >
                                            {reason}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
