import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment, addDoc, getDoc, serverTimestamp, deleteDoc } from '../firebase';
import { db, auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, TrendingUp, TrendingDown, Clock, Search, Bell, 
  ChevronRight, Target, Shield, Info, ArrowLeft, Star, Heart,
  Zap, Share2, Award, UserCheck, X, CheckCircle2, AlertTriangle, Activity,
  ChevronDown, Minus, Plus, Wallet, History, Trophy, RefreshCw, List, LayoutGrid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatWithCurrency, convertFromBase, convertToBase } from '../lib/currencies';
import { tutorialTranslations } from '../lib/tutorialTranslations';

export default function CopyTrading({ hideHeader = false }: { hideHeader?: boolean }) {
  const navigate = useNavigate();
  const [masters, setMasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrader, setSelectedTrader] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'traders' | 'my-card'>('traders');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('winRate'); // 'winRate' | 'followers' | 'totalProfit'
  const [userBalance, setUserBalance] = useState(0);
  const [userCurrency, setUserCurrency] = useState(() => {
    try {
      return localStorage.getItem('user_display_currency') || 'BDT';
    } catch (e) {
      return 'BDT';
    }
  });
  const [userLanguage, setUserLanguage] = useState('en');
  const [activeCopies, setActiveCopies] = useState<any[]>([]);
  const [liveCopyProfit, setLiveCopyProfit] = useState<{[key: string]: number}>({});
  const [viewMode, setViewMode] = useState<'leaderboard' | 'grid'>('leaderboard');
  const [accountType, setAccountType] = useState<"demo" | "real" | "tournament">(() => {
    try {
      return (localStorage.getItem('bivax_account_type') as any) || 'real';
    } catch (e) {
      return 'real';
    }
  });
  const [liveFeedText, setLiveFeedText] = useState(`User *7392 just allocated ${formatWithCurrency(1500, userCurrency)} to CRISHTTRADER (Auto-sync connected)`);

  // Live activity ticker updates
  useEffect(() => {
    const feeds = [
      `User *1849 just allocated ${formatWithCurrency(1000, userCurrency)} to CRISHTTRADER`,
      "User *9320 completed a CALL deal with 88% payout via ALBERT",
      `User *8391 stopped contract with OBOROTEN (+${formatWithCurrency(12490, userCurrency)} net profit earned)`,
      `User *7050 setup a new Copy-Allocation of ${formatWithCurrency(5000, userCurrency)} with BINANCE WHALE`,
      "TRADEMINATOR weekly gain rate increased to +135.2% in live sessions",
      "ALEX FOREX secured continuous 112 wins in standard VIP pool",
      "User *4401 initialized copy option: limit 100 deals on ELENA_RU",
      `User *3201 earned +${formatWithCurrency(450, userCurrency)} from SANJAY FX news-straddle session`,
      `User *6682 copied VIP contract OBOROTEN (Result: SUCCESS +${formatWithCurrency(92, userCurrency)})`
    ];
    const feedInterval = setInterval(() => {
      const randomFeed = feeds[Math.floor(Math.random() * feeds.length)];
      setLiveFeedText(randomFeed);
    }, 4500);
    return () => clearInterval(feedInterval);
  }, []);

  // Copy Settings State
  const [copyingAmount, setCopyingAmount] = useState(200);
  const [tradesLimit, setTradesLimit] = useState(50);
  const [maxTradeAmount, setMaxTradeAmount] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Setup Auth & Dynamic Balance & Active Portfolio sub collection snapshots
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
        if (user) {
            // Live User Balance and Currency Subscription
            const userSub = onSnapshot(doc(db, 'users', user.uid), (userDoc) => {
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    const newBalance = data.balance || 0;
                    setUserBalance(prev => prev !== newBalance ? newBalance : prev);
                    if (data.currency) {
                        setUserCurrency(prev => prev !== data.currency ? data.currency : prev);
                        try {
                            localStorage.setItem('user_display_currency', data.currency);
                        } catch(e) {}
                    }
                    if (data.language) {
                        setUserLanguage(prev => prev !== data.language ? data.language : prev);
                    }
                }
            });

            // Live Copied Portfolios Subscription from API
            const fetchCopies = async () => {
                try {
                    const response = await fetch(`/api/users/${user.uid}/activeCopies`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('bivax_token')}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        // Map SQL names to frontend names if needed
                        const mapped = data.map((c: any) => ({
                            ...c,
                            masterName: c.master_name,
                            masterId: c.master_id,
                            tradesLimit: c.trades_limit,
                            maxTradeAmount: c.max_trade_amount,
                            startedAt: c.started_at
                        }));
                        setActiveCopies(mapped);
                    }
                } catch (err) {
                    console.error("Error loading active portfolios:", err);
                }
            };
            fetchCopies();
            const copiesInterval = setInterval(fetchCopies, 5000);

            return () => {
                userSub();
                clearInterval(copiesInterval);
            };
        } else {
            setUserBalance(0);
            setActiveCopies([]);
        }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Fetch Master Traders List from API
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const response = await fetch('/api/masterTraders');
        if (response.ok) {
          const data = await response.json();
          // Transform if needed to match frontend expectation
          const transformed = data.map((t: any) => ({
            ...t,
            id: t.id,
            name: t.name,
            copiersCount: t.followers || 0,
            totalProfit: t.profit || 0,
            winRate: t.win_rate || 0,
            gainPerWeek: '≥ 80%',
            commission: '10%',
            isVip: t.win_rate > 85,
            profitRate: t.win_rate || 75,
            lossRate: 100 - (t.win_rate || 75),
            history: generateHistory(),
            performanceData: generatePerformance()
          }));
          setMasters(transformed);
        }
      } catch (err) {
        console.error("Error loading master traders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMasters();
    const interval = setInterval(fetchMasters, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // 3. Simulated Active Portfolio profit fluctuations to make the client space look professional and live
  useEffect(() => {
    if (activeCopies.length === 0) return;

    // Initialize profits
    setLiveCopyProfit(prev => {
        const next = { ...prev };
        activeCopies.forEach(copy => {
            if (next[copy.id] === undefined) {
                // Initialize based on copied amount - can start slightly negative or positive
                const startBias = (Math.random() > 0.4) ? 0.01 : -0.01;
                next[copy.id] = parseFloat((copy.amount * (startBias + (Math.random() - 0.5) * 0.04)).toFixed(2));
            }
        });
        return next;
    });

    const profitInterval = setInterval(() => {
        setLiveCopyProfit(prev => {
            const next = { ...prev };
            activeCopies.forEach(copy => {
                if (next[copy.id] !== undefined) {
                    // Use the master's rates to influence the bias
                    // If profitRate is 75, offset is 0.42 -> avg increase
                    // If profitRate is 50, offset is 0.5 -> neutral
                    const profitRate = copy.profitRate || 75;
                    const bias = 1 - (profitRate / 100) * 0.8; // e.g., 75% -> 0.4, 50% -> 0.6
                    const fluctuation = (Math.random() - bias) * (copy.amount * 0.005); 
                    next[copy.id] = parseFloat((next[copy.id] + fluctuation).toFixed(2));
                }
            });
            return next;
        });
    }, 4500);

    return () => clearInterval(profitInterval);
  }, [activeCopies]);

  const generateHistory = () => {
    const assets = ['Crypto IDX', 'EUR/USD', 'GBP/JPY', 'Gold', 'BTC/USD'];
    return Array.from({ length: 15 }).map((_, i) => ({
      id: `history-${i}`,
      asset: assets[Math.floor(Math.random() * assets.length)],
      type: Math.random() > 0.5 ? 'CALL' : 'PUT',
      amount: (Math.random() * 500 + 100).toFixed(2),
      payout: 82,
      result: Math.random() > 0.3 ? 'won' : 'lost',
      time: '20:23:00',
      profit: (Math.random() * 1000 + 200).toFixed(2)
    }));
  };

  const generatePerformance = () => {
    return Array.from({ length: 8 }).map((_, i) => ({
        name: (i + 1).toString(),
        value: 400 + Math.random() * 1100
    }));
  };

  // 5. Deduct balance from Wallet, add active copy item, increment copiers
  const handleStartCopying = async () => {
    if (!auth.currentUser) {
        toast.error("Please login to start copy trading");
        return;
    }
    if (userBalance < copyingAmount) {
        toast.error("Insufficient balance to copy. Please deposit funds first.");
        return;
    }

    setIsSubmitting(true);
    try {
        const token = localStorage.getItem('bivax_token');
        const response = await fetch(`/api/users/${auth.currentUser.uid}/activeCopies`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                masterId: selectedTrader.id,
                masterName: selectedTrader.name,
                country: selectedTrader.country || '🌍',
                amount: copyingAmount,
                maxTradeAmount: maxTradeAmount,
                tradesLimit: tradesLimit
            })
        });

        if (!response.ok) throw new Error('Failed to start copying');

        // Also update local balance
        await fetch(`/api/users/${auth.currentUser.uid}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ balance: { increment: -copyingAmount } })
        });

        // Increment follower count on master
        await fetch(`/api/masterTraders/${selectedTrader.id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ copiersCount: { increment: 1 } })
        });

        toast.success(`Active! Successfully copying ${selectedTrader.name}`);
        setSelectedTrader(null);
        setActiveTab('my-card');
    } catch (err) {
        console.error(err);
        toast.error("Failed to start copy trading");
    } finally {
        setIsSubmitting(false);
    }
  };

  // 6. Return balance to Wallet, delete copied reference, decrement copiers
  const handleStopCopying = async (copyId: string, masterId: string, returnAmount: number, name: string) => {
    if (!auth.currentUser) return;
    const confirmStop = window.confirm(`Stop copy contract with ${name}? Your invested budget of ${formatWithCurrency(returnAmount, userCurrency)} will be instantly refunded to your wallet.`);
    if (!confirmStop) return;

    try {
        const token = localStorage.getItem('bivax_token');
        const response = await fetch(`/api/users/${auth.currentUser.uid}/activeCopies/${copyId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to stop copying');

        // Refund funds to main wallet balance
        await fetch(`/api/users/${auth.currentUser.uid}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ balance: { increment: returnAmount } })
        });

        // Decrement copier count of master
        if (masterId) {
            await fetch(`/api/masterTraders/${masterId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ copiersCount: { increment: -1 } })
            });
        }

        toast.success(`Subscription ended. Refunded ${formatWithCurrency(returnAmount, userCurrency)} to your wallet.`);
    } catch (err) {
        console.error(err);
        toast.error("Could not stop copying. Please try again.");
    }
  };

  // Filter and Sort master list
  const filteredMasters = masters
    .filter(m => 
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id?.includes(searchQuery)
    )
    .sort((a, b) => {
      if (sortBy === 'winRate') return (b.winRate || 0) - (a.winRate || 0);
      if (sortBy === 'followers') return (b.copiersCount || 0) - (a.copiersCount || 0);
      if (sortBy === 'totalProfit') return (b.totalProfit || 0) - (a.totalProfit || 0);
      return 0;
    });

  // Calculate stats overview for My Portfolio
  const totalInvestedFunds = activeCopies.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalLiveGain = Object.getOwnPropertyNames(liveCopyProfit).reduce((sum, key) => sum + (liveCopyProfit[key] || 0), 0);

  if (loading) {
    return (
      <div className={`${hideHeader ? 'h-full' : 'min-h-screen'} bg-[#131417] text-white font-sans selection:bg-[#FFE24C]/30 overflow-hidden`}>
          <SEO title="Copy Trading" description="Manage your Copy Trading on Bivaax Trade Platform." />
          
          {/* SKELETON HEADER */}
          {!hideHeader && (
            <div className="sticky top-0 z-[100] bg-[#1C1D22] border-b border-white/5 px-4 h-[60px] flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/5 rounded-lg" />
                    <div className="w-32 h-5 bg-white/5 rounded-md" />
                </div>
                <div className="w-10 h-10 bg-white/5 rounded-full" />
            </div>
          )}

          {/* SKELETON TABS */}
          <div className="sticky z-[90] bg-[#1C1D22] border-b border-white/5 flex px-2 gap-2 py-2 animate-pulse">
              <div className="w-24 h-10 bg-white/5 rounded-xl" />
              <div className="w-24 h-10 bg-white/5 rounded-xl" />
          </div>

          <main className={`${hideHeader ? 'px-2' : 'max-w-4xl mx-auto px-4'} py-6 pb-32 space-y-6`}>
              {/* SKELETON INTRO */}
              <div className="space-y-2 animate-pulse">
                  <div className="w-full h-4 bg-white/5 rounded-md" />
                  <div className="w-3/4 h-4 bg-white/5 rounded-md" />
                  <div className="w-24 h-4 bg-white/5 rounded-md ml-auto" />
              </div>

              {/* SKELETON SEARCH */}
              <div className="space-y-3 animate-pulse">
                  <div className="w-full h-12 bg-[#1C1D22] border border-white/10 rounded-xl" />
                  <div className="w-full h-14 bg-[#1C1D22] border border-white/10 rounded-xl" />
              </div>

              {/* SKELETON CARDS */}
              <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                      <div key={`skeleton-trader-${i}`} className="bg-[#1C1D22] border border-white/5 rounded-2xl p-4 space-y-6 animate-pulse">
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-white/10" />
                                  <div className="w-8 h-5 bg-white/5 rounded" />
                                  <div className="w-32 h-5 bg-white/5 rounded" />
                              </div>
                              <div className="w-12 h-6 bg-white/5 rounded-full" />
                          </div>

                          <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-white/5 rounded" />
                              <div className="w-24 h-4 bg-white/5 rounded" />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                              {[1, 2, 3].map((j) => (
                                  <div key={j} className="space-y-2 text-center">
                                      <div className="w-12 h-3 bg-white/5 rounded mx-auto" />
                                      <div className="w-16 h-5 bg-white/5 rounded mx-auto" />
                                  </div>
                              ))}
                          </div>

                          <div className="space-y-2">
                              <div className="w-full h-2 bg-white/5 rounded-full" />
                              <div className="flex justify-between">
                                  <div className="w-16 h-3 bg-white/5 rounded" />
                                  <div className="w-16 h-3 bg-white/5 rounded" />
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </main>
      </div>
    );
  }

  return (
    <div id="copy-trading-container" className={`${hideHeader ? 'h-full overflow-y-auto custom-scrollbar relative' : 'min-h-screen'} bg-[#131417] text-white font-sans selection:bg-[#FFE24C]/30`}>
        {/* HEADER */}
        {!hideHeader && (
          <header id="copy-trading-header" className="sticky top-0 z-[100] bg-[#1C1D22] border-b border-white/5 px-4 h-[60px] flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <button id="back-btn" onClick={() => navigate(-1)} className="p-1.5 hover:bg-white/5 rounded-lg transition-all -ml-1">
                      <ArrowLeft size={20} className="text-[#9ca3af]" />
                  </button>
                  <h1 className="text-[18px] font-bold tracking-tight text-left">Copy trading</h1>
              </div>
              <div className="flex items-center gap-4">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Bell size={22} />
                  </button>
              </div>
          </header>
        )}

        {/* TABS */}
        <div id="navigation-tabs" className={`sticky ${hideHeader ? 'top-0' : 'top-[60px]'} z-[90] bg-[#1C1D22] border-b border-white/5 flex px-2 overflow-x-auto scrollbar-hide`}>
            {[
                { id: 'traders', label: 'Traders' },
                { id: 'my-card', label: `My card` }
            ].map(tab => (
                <button 
                    id={`tab-${tab.id}`}
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-6 text-[14px] font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-white' : 'text-[#9ca3af] hover:text-white'}`}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FFE24C]" />
                    )}
                </button>
            ))}
        </div>

        <main className={`${hideHeader ? 'px-2' : 'max-w-4xl mx-auto px-4'} py-6 pb-32 space-y-6`}>
            {accountType === 'demo' ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 bg-[#1C1D22] border border-white/5 rounded-2xl text-center">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={32} className="text-[#FFE24C]" />
                    </div>
                    <p className="text-[14px] font-bold text-gray-300 mb-2">Unavailable on a demo account</p>
                    <button 
                        onClick={() => {
                            localStorage.setItem('bivax_account_type', 'real');
                            setAccountType('real');
                            window.location.reload();
                        }}
                        className="text-[#FFE24C] text-[14px] font-bold underline"
                    >
                        Switch to the real one
                    </button>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    {activeTab === 'traders' ? (
                        <motion.div 
                            key="traders-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            {/* INTRO TEXT */}
                            <div className="space-y-1">
                                <p className="text-[14px] text-gray-300 leading-tight text-left">
                                    Copy top traders to learn and grow. Easy way for newbies to get started!
                                </p>
                                <button className="text-[#FFE24C] text-[13px] font-bold underline block text-right w-full">
                                    How it works?
                                </button>
                            </div>
                            {/* FILTERS */}
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Search" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-12 bg-[#1C1D22] border border-white/10 rounded-xl pl-12 pr-4 text-[14px] focus:border-[#FFE24C]/30 transition-all outline-none text-white placeholder-gray-500"
                                    />
                                </div>
                                
                                <div className="relative">
                                    <div className="absolute left-4 top-2 text-[10px] text-gray-500 font-bold uppercase">Sort</div>
                                    <select 
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full h-14 bg-[#1C1D22] border border-white/10 rounded-xl pl-4 pr-10 pt-4 text-[14px] font-bold text-white appearance-none outline-none focus:border-[#FFE24C]/30 transition-all text-left"
                                    >
                                        <option value="winRate">Gain (highest first)</option>
                                        <option value="followers">Most Copiers</option>
                                        <option value="totalProfit">Total Profit</option>
                                    </select>
                                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* TRADERS LIST */}
                            <div className="space-y-3">
                                {filteredMasters.map((trader) => (
                                    <motion.div 
                                        key={trader.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedTrader(trader)}
                                        className="bg-[#1C1D22] border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-[#25262B] transition-colors relative text-left"
                                    >
                                        {/* Status & Name */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-[#00C980]"></div>
                                                <span className="text-[18px]">{trader.country}</span>
                                                <span className="text-[14px] font-bold text-white">{trader.name}</span>
                                            </div>
                                            {trader.isVip && (
                                                <div className="bg-[#004D99] text-white px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">
                                                    VIP
                                                </div>
                                            )}
                                        </div>

                                        {/* Copiers */}
                                        <div className="flex items-center gap-2 text-gray-400 mb-6">
                                            <Users size={16} />
                                            <span className="text-[12px] font-bold uppercase tracking-tight">Copiers: <span className="text-white">{trader.copiersCount}/100</span></span>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-2 mb-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[11px] text-gray-500 font-bold uppercase">Gain</span>
                                                    <Info size={12} className="text-gray-600" />
                                                </div>
                                                <p className="text-[10px] text-gray-500 leading-none">per week</p>
                                                <p className="text-[16px] font-black text-[#FFE24C]">{trader.gainPerWeek || '10%'}</p>
                                            </div>
                                            <div className="space-y-1 text-center">
                                                <span className="text-[11px] text-gray-500 font-bold uppercase">Copied trades</span>
                                                <p className="text-[16px] font-black text-white">{trader.copiedTrades || 0}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <span className="text-[11px] text-gray-500 font-bold uppercase">Commission</span>
                                                <p className="text-[16px] font-black text-white">{trader.commission || '10%'}</p>
                                            </div>
                                        </div>

                                        {/* Performance Bar */}
                                        <div className="space-y-2">
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                                                <div style={{ width: `${trader.profitRate || 75}%` }} className="h-full bg-[#00C980]" />
                                                <div style={{ width: `${trader.lossRate || 25}%` }} className="h-full bg-[#FF4D4D]" />
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-bold">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[#00C980]">{trader.profitRate || 75}%</span>
                                                    <span className="text-gray-500">Profit</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-500">Loss</span>
                                                    <span className="text-[#FF4D4D]">{trader.lossRate || 25}%</span>
                                                    <Info size={12} className="text-gray-600" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="my-card-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            {/* MY PORTFOLIO CONTENT */}
                            {activeCopies.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                        <Users size={32} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-[16px] font-bold text-gray-400">You don't follow any traders</p>
                                        <p className="text-[12px] text-gray-500">Select a master trader to start copy trading</p>
                                    </div>
                                    <button 
                                        onClick={() => setActiveTab('traders')}
                                        className="px-6 py-3 bg-[#FFE24C] text-black font-black uppercase text-[12px] rounded-xl"
                                    >
                                        Find Traders
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeCopies.map((copy) => (
                                        <div key={copy.id} className="bg-[#1C1D22] border border-white/5 rounded-2xl p-4 text-left">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[18px]">{copy.country}</span>
                                                    <span className="text-[14px] font-bold text-white">{copy.masterName}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[14px] font-black ${liveCopyProfit[copy.id] >= 0 ? 'text-[#00C980]' : 'text-[#FF4D4D]'}`}>
                                                        {liveCopyProfit[copy.id] >= 0 ? '+' : ''}{formatWithCurrency(liveCopyProfit[copy.id] || 0, userCurrency)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tight mb-1">Allocated</p>
                                                    <p className="text-[14px] font-bold text-white">{formatWithCurrency(copy.amount, userCurrency)}</p>
                                                </div>
                                                <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-right">
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tight mb-1">Trades Limit</p>
                                                    <p className="text-[14px] font-bold text-white">{copy.tradesLimit || 50}</p>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => handleStopCopying(copy.id, copy.masterId, copy.amount, copy.masterName)}
                                                className="w-full py-3 border border-red-500/30 text-red-400 font-black uppercase text-[11px] rounded-xl hover:bg-red-500/5 transition-colors"
                                            >
                                                Stop Copying
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
            {/* INFO & SEO SECTION */}
            <section id="copy-trading-seo-info" className="bg-[#1C1D22] border border-white/5 rounded-2xl p-6 mt-8 space-y-6">
                <h1 className="text-2xl font-black text-white">{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).title}</h1>
                
                <div className="space-y-4 text-gray-300">
                    <p>{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).p1}</p>

                    <h2 className="text-xl font-bold text-white mt-6">{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).h1}</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).l1_1}</li>
                        <li>{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).l1_2}</li>
                        <li>{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).l1_3}</li>
                        <li>{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).l1_4}</li>
                    </ul>

                    <h2 className="text-xl font-bold text-white mt-6">{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).h2}</h2>
                    <p>{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).p2}</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).l2_1}</li>
                        <li>{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).l2_2}</li>
                        <li>{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).l2_3}</li>
                    </ul>

                    <h2 className="text-xl font-bold text-white mt-6">{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).h3}</h2>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).l3_1}</li>
                        <li>{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).l3_2}</li>
                        <li>{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).l3_3}</li>
                        <li>{(tutorialTranslations[userLanguage] || tutorialTranslations['en']).l3_4}</li>
                    </ol>
                </div>
            </section>
        </main>

        <AnimatePresence>
            {selectedTrader && (
                <motion.div 
                    id="copy-overlay-wrapper"
                    initial={{ x: hideHeader ? "100%" : 0, y: hideHeader ? 0 : "100%" }}
                    animate={{ x: 0, y: 0 }}
                    exit={{ x: hideHeader ? "100%" : 0, y: hideHeader ? 0 : "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className={`${hideHeader ? 'absolute' : 'fixed'} inset-0 z-[200] flex flex-col bg-[#131417]`}
                >
                    {/* MODAL HEADER */}
                    <div className="px-4 h-[60px] flex items-center justify-between border-b border-white/5 bg-[#1C1D22] shrink-0">
                        <button id="close-overlay-back" onClick={() => setSelectedTrader(null)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                            <ArrowLeft size={22} className="text-gray-400" />
                        </button>
                        <h2 className="text-[16px] font-bold tracking-tight">Copying details</h2>
                        <div className="w-10"></div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-32">
                            {/* TRADER INFO */}
                            <div className="bg-[#1C1D22] rounded-2xl p-4 border border-white/5 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-black/20 flex items-center justify-center text-[28px]">
                                    {selectedTrader.country}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-[16px] font-bold text-white">{selectedTrader.name}</h3>
                                        <div className="bg-[#004D99] text-white px-2 py-0.5 rounded text-[9px] font-black uppercase">VIP</div>
                                    </div>
                                    <p className="text-[12px] text-gray-500">Master trader since 2023</p>
                                </div>
                            </div>

                            {/* STATS */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#1C1D22] p-4 rounded-2xl border border-white/5 text-left">
                                    <p className="text-[11px] text-gray-500 font-bold uppercase mb-1">Copiers</p>
                                    <p className="text-[18px] font-bold text-white">{selectedTrader.copiersCount}</p>
                                </div>
                                <div className="bg-[#1C1D22] p-4 rounded-2xl border border-white/5 text-left">
                                    <p className="text-[11px] text-gray-500 font-bold uppercase mb-1">Profitability</p>
                                    <p className="text-[18px] font-bold text-[#00C980]">{selectedTrader.profitRate || 75}%</p>
                                </div>
                            </div>

                            {/* FORM */}
                            <div className="space-y-6">
                                <div className="space-y-3 text-left">
                                    <label className="text-[14px] font-bold text-gray-400">Total investment</label>
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            value={copyingAmount}
                                            onChange={(e) => setCopyingAmount(Number(e.target.value))}
                                            className="w-full h-14 bg-[#1C1D22] border border-white/10 rounded-xl px-4 text-[18px] font-bold text-white focus:border-[#FFE24C]/30 transition-all outline-none"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                                            {userCurrency}
                                        </div>
                                    </div>
                                    <p className="text-[12px] text-gray-500">Available: {formatWithCurrency(userBalance, userCurrency)}</p>
                                </div>

                                <div className="space-y-3 text-left">
                                    <label className="text-[14px] font-bold text-gray-400">Stop loss</label>
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            placeholder="Optional"
                                            className="w-full h-14 bg-[#1C1D22] border border-white/10 rounded-xl px-4 text-[18px] font-bold text-white focus:border-[#FFE24C]/30 transition-all outline-none"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                                            {userCurrency}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button 
                                        id="confirm-copy-submit"
                                        onClick={handleStartCopying}
                                        disabled={isSubmitting || userBalance < copyingAmount}
                                        className={`w-full h-14 bg-[#FFE24C] hover:bg-[#ffe05d] text-black font-bold uppercase text-[14px] rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${isSubmitting || userBalance < copyingAmount ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        ) : 'Start copying'}
                                    </button>
                                    {userBalance < copyingAmount && (
                                        <p className="mt-2 text-[12px] text-red-500 font-bold text-center">Insufficient funds. Please deposit.</p>
                                    )}
                                </div>
                            </div>

                            {/* HISTORY */}
                            <div className="space-y-4 text-left">
                                <h4 className="text-[14px] font-bold text-gray-400 uppercase tracking-wider">Trading history</h4>
                                <div className="space-y-3">
                                    {selectedTrader.history?.map((h: any, idx: number) => (
                                        <div key={idx} className="bg-[#1C1D22] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${h.result === 'won' ? 'bg-[#00C980]/10 text-[#00C980]' : 'bg-red-500/10 text-red-500'}`}>
                                                    {h.type === 'CALL' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-white">{h.asset}</p>
                                                    <p className="text-[11px] text-gray-500">{h.time}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-[14px] font-bold ${h.result === 'won' ? 'text-[#00C980]' : 'text-gray-400'}`}>
                                                    {h.result === 'won' ? `+${formatWithCurrency(h.profit, userCurrency)}` : `-${formatWithCurrency(h.amount, userCurrency)}`}
                                                </p>
                                                <p className="text-[11px] text-gray-600">{h.payout}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
