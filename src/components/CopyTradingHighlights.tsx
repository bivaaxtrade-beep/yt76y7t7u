import React from 'react';
import { motion } from 'motion/react';
import { Users, TrendingUp, ShieldCheck, Zap, ArrowUpRight, Trophy, Star, Sparkles } from 'lucide-react';

export default function CopyTradingHighlights() {
  const highlights = [
    {
      icon: Users,
      title: "Community-Driven Success",
      desc: "Connect with a global network of over 150,000 active copy traders sharing real-time market wins.",
      stat: "150K+",
      label: "Active Copyists"
    },
    {
      icon: TrendingUp,
      title: "Verified Master Win Rates",
      desc: "Browse expert profiles showing complete trading history, win rates up to 92.4%, and verified payout records.",
      stat: "Up to 92.4%",
      label: "Avg. Master Win Rate"
    },
    {
      icon: ShieldCheck,
      title: "Risk-Managed Replication",
      desc: "Maintain absolute control. Set personalized copy ratios, stop-loss limits, and pause copying with a single tap.",
      stat: "100% Secure",
      label: "Risk Allocation Control"
    },
    {
      icon: Zap,
      title: "Instantaneous Execution",
      desc: "Our low-latency matching engine mirrors trade orders within milliseconds of the master trader's action.",
      stat: "< 15ms",
      label: "Replication Speed"
    }
  ];

  const topMasters = [
    {
      name: "ProFX_Alchemist",
      winRate: "91.8%",
      followers: "12,408",
      totalProfit: "+$342,800",
      avatar: "PA",
      avatarColor: "bg-amber-500"
    },
    {
      name: "Alpha_Grid_Trader",
      winRate: "88.5%",
      followers: "8,912",
      totalProfit: "+$215,400",
      avatar: "AG",
      avatarColor: "bg-blue-500"
    },
    {
      name: "Vortex_Scalp",
      winRate: "89.2%",
      followers: "7,340",
      totalProfit: "+$189,200",
      avatar: "VS",
      avatarColor: "bg-emerald-500"
    }
  ];

  // Copy Trading Service Structured Data (SEO JSON-LD Schema)
  const copyTradingSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Bivaax Copy Trading Service",
    "provider": {
      "@type": "Organization",
      "name": "Bivaax",
      "url": "https://bivaax.trade"
    },
    "description": "Copy trading from Bivaax allows users to auto-replicate experienced traders' portfolios in real-time. Boost your performance by connecting with high-yield financial experts.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "12543"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Copy Trading Options",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Social Copy Trading System",
            "description": "Automated order replication with customizable risk percentage limits."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "VIP Dynamic Portfolio Mirroring",
            "description": "Replicate top-tier elite master traders with dedicated support channels."
          }
        }
      ]
    },
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Choose a Master Trader",
        "text": "Analyze the certified performance, win rates, and total followers of verified expert traders."
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Set Investment Amount",
        "text": "Allocate any portion of your available account balance to start copying automatically."
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Mirror Trade Execution",
        "text": "The platform replicates all master trades in your workspace immediately with sub-millisecond precision."
      }
    ]
  };

  return (
    <section id="copy-trading-highlights" className="relative py-24 px-4 bg-[#1C1D22] border-t border-white/5 overflow-hidden">
      {/* Dynamic SEO JSON-LD injection */}
      <script type="application/ld+json">
        {JSON.stringify(copyTradingSchema)}
      </script>

      {/* Aesthetic glowing background lights */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[45vw] h-[45vw] max-w-[400px] bg-[#ffcf00]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[45vw] h-[45vw] max-w-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#ffcf00]/10 px-4 py-1.5 rounded-full border border-[#ffcf00]/20 text-[#ffcf00] mb-4 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} className="animate-pulse" />
            Empower Your Portfolio
          </div>
          <h2 className="text-3.5xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-4">
            Bivaax <span className="text-[#ffcf00]">Copy Trading</span> Highlights: Mirror Community Success
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            No professional trading background required. Join our community-driven ecosystem to discover, replicate, and profit alongside top-performing financial strategy experts.
          </p>
        </div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {highlights.map((item, idx) => (
            <motion.div
              key={`highlight-${idx}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#22232a] border border-white/5 rounded-3xl p-6 hover:border-[#ffcf00]/20 hover:bg-[#26272e] transition-all flex flex-col justify-between group h-full"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#ffcf00] mb-6 group-hover:scale-110 transition-transform">
                  <item.icon size={24} />
                </div>
                <h3 className="font-extrabold text-lg text-white mb-2 leading-tight group-hover:text-[#ffcf00] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>
              <div className="border-t border-white/5 pt-4">
                <div className="text-2xl font-black text-white tracking-tight">
                  {item.stat}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  {item.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Community Proof Section: Top Masters Showcase */}
        <div className="bg-gradient-to-br from-[#22232a] to-[#1e2026] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Trophy size={200} className="text-[#ffcf00]" />
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
            <div className="max-w-md space-y-6">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-widest">
                <Star size={16} fill="currentColor" /> Elite Leaders
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Replicate the Community's Top Financial Masters
              </h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                Check real live win rates and earnings stats from some of our top strategy managers. You can automatically configure your portfolio to mirror their positions.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#1c1d22] bg-amber-500 flex items-center justify-center font-bold text-xs">PA</div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#1c1d22] bg-blue-500 flex items-center justify-center font-bold text-xs">AG</div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#1c1d22] bg-emerald-500 flex items-center justify-center font-bold text-xs">VS</div>
                </div>
                <div className="text-xs text-gray-400">
                  Join <strong className="text-white">12,000+ traders</strong> currently copying these master profiles.
                </div>
              </div>
            </div>

            {/* Masters Performance List */}
            <div className="w-full lg:max-w-md space-y-4">
              {topMasters.map((master, idx) => (
                <div 
                  key={`master-${idx}`}
                  className="bg-[#1c1d22]/80 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${master.avatarColor} text-white font-black flex items-center justify-center shadow-md`}>
                      {master.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5 text-sm md:text-base">
                        {master.name}
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-black uppercase">Verified</span>
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {master.followers} Copiers
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-black text-sm md:text-base">
                      {master.totalProfit}
                    </div>
                    <div className="text-xs text-[#ffcf00] font-bold">
                      {master.winRate} Win Rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
