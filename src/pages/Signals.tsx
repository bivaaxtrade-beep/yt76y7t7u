import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { collection, onSnapshot, query, orderBy } from '../firebase';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, TrendingUp, TrendingDown, Clock, Search, Bell, 
  ChevronRight, Target, Shield, Info, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Signals() {
  const navigate = useNavigate();
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'signals'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
        setSignals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(loading && false); // Only set once
    });
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => { unsub(); clearTimeout(timer); };
  }, []);

  const filteredSignals = filter === 'All' 
    ? signals 
    : signals.filter(s => s.asset.includes(filter));

  return (
    <div className="min-h-screen bg-[#06070a] text-white">
      <SEO title="Signals" description="Manage your Signals on Bivaax Trade Platform." />

        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-[#06070a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div>
                   <h1 className="text-lg font-black tracking-tight">Signal <span className="text-yellow-500">Center</span></h1>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-tight">Professional Trading Insights</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    <Bell size={18} />
                </div>
            </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 pb-32">
            {/* HERO */}
            <div className="relative p-10 rounded-[48px] overflow-hidden bg-gradient-to-br from-[#12141c] to-[#0a0a0f] border border-white/5">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                    <Zap size={400} className="text-yellow-500 transform translate-x-1/4 -translate-y-1/4" />
                </div>
                <div className="relative z-10 space-y-6 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-black uppercase tracking-widest">
                        <TrendingUp size={12} />
                        AI-Powered Analysis
                    </div>
                    <h2 className="text-4xl font-black leading-[1.1] tracking-tight">Trade with the <span className="text-yellow-500 italic">Advantage</span>.</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Access high-probability trading signals curated by our elite mathematical models and senior market analysts.
                    </p>
                </div>
            </div>

            {/* FILTER SCROLL */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar whitespace-nowrap">
                {['All', 'BTC', 'ETH', 'EUR/USD', 'GBP/USD', 'GOLD'].map((f) => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${filter === f ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* SIGNALS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode='popLayout'>
                    {filteredSignals.map((sig, i) => (
                        <motion.div 
                            key={`sig-card-${sig.id || i}-${i}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-8 space-y-6 hover:border-yellow-500/30 transition-all group relative overflow-hidden"
                        >
                            {/* STATUS OVERLAY */}
                            <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest ${sig.status === 'Active' ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-500'}`}>
                                {sig.status}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl ${sig.direction === 'CALL' ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10' : 'bg-rose-500/10 text-rose-500 shadow-rose-500/10'}`}>
                                    {sig.direction === 'CALL' ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-white tracking-tight">{sig.asset}</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{sig.timeframe} Interval</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#15161d] p-5 rounded-3xl border border-white/5 space-y-1">
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Confidence</p>
                                    <p className="text-lg font-black text-white">{sig.accuracy}%</p>
                                </div>
                                <div className="bg-[#15161d] p-5 rounded-3xl border border-white/5 space-y-1">
                                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Probability</p>
                                    <p className={`text-lg font-black uppercase ${sig.direction === 'CALL' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {sig.direction === 'CALL' ? 'Bullish' : 'Bearish'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button className="w-full bg-white/5 group-hover:bg-yellow-500 text-white group-hover:text-black py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                    Market Analysis
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-gray-600 font-bold pt-2">
                                <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    Posted {new Date(sig.createdAt).toLocaleTimeString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Target size={12} />
                                    Verified
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredSignals.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-600">
                            <Search size={32} />
                        </div>
                        <p className="text-gray-500 font-bold uppercase text-[11px] tracking-widest">No active signals found for this pair</p>
                    </div>
                )}
            </div>

            {/* INFO BOX */}
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                    <Shield size={32} />
                </div>
                <div className="space-y-1 text-center md:text-left">
                    <h4 className="text-lg font-black tracking-tight text-indigo-500">Risk Disclosure</h4>
                    <p className="text-xs text-indigo-400/60 leading-relaxed font-medium">
                        Trading involves significant risk. Our signals are generated using advanced algorithms but do not guarantee profit. 
                        Always trade with capital you can afford to lose and follow strict risk management protocols.
                    </p>
                </div>
            </div>
        </main>
    </div>
  );
}
