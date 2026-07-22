import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Menu, ArrowRight, Award, Trophy, Landmark, TrendingUp, ShieldCheck, Star, Calculator, Calendar, Smartphone, MessageCircle, BookOpen, UserPlus, FileText, Activity, Zap, Globe, Shield, Headphones, PieChart, Check, Users, HelpCircle, ChevronDown } from 'lucide-react';
import { Logo } from '../components/Logo';
import { AuthModal } from '../components/AuthModal';
import { PriceTicker } from '../components/PriceTicker';
import { MarketStatusCard } from '../components/MarketStatusCard';
import { MarketMovers } from '../components/MarketMovers';
import NewsletterForm from '../components/NewsletterForm';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import SEO from '../components/SEO';
import CopyTradingHighlights from '../components/CopyTradingHighlights';
import MarketTicker from '../components/MarketTicker';

export default function Homepage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authModal, setAuthModal] = useState<{isOpen: boolean, view: 'login' | 'register'}>({
    isOpen: false,
    view: 'login'
  });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [faqSearch, setFaqSearch] = useState('');

  const faqData = [
    {
      question: "What is Bivaax and how does it work?",
      answer: "Bivaax is a modern high-performance trading platform that allows you to speculate on price movements of various assets (including major currency pairs, commodities, and synthetic indices) with high speed and payout yields up to 95%."
    },
    {
      question: "What is the minimum deposit and minimum investment amount?",
      answer: "You can start trading with a minimum deposit of only $10. The minimum investment allowed for any single trade is just $1, making our platform highly accessible for beginners as well as professional traders."
    },
    {
      question: "How does the Copy Trading system work?",
      answer: "Our built-in Copy Trading feature allows you to see profiles of expert traders, analyze their statistical win-rates, and mirror their trades automatically on your workspace in real-time."
    },
    {
       question: "How secure is my account and funds with Bivaax?",
       answer: "We employ banking-grade security mechanisms. All user accounts can enforce 2-Factor Authentication (2FA), and user balances are stored separately in modern, protected safe accounts."
    },
    {
       question: "Can I try trading with virtual money first?",
       answer: "Absolutely! Every single user receives a fully-functional Demo Account loaded with virtual currency upon free sign-up. You can practice strategies and master your skills before switching to real-money setups with a single toggle."
    }
  ];

  const filteredFaqs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
    faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  // Generate FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  useEffect(() => {
    const refCode = searchParams.get('ref');
    const sub = searchParams.get('sub');
    const type = searchParams.get('type');
    
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
      if (sub) localStorage.setItem('referralSub', sub);
      if (type) localStorage.setItem('referralType', type);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#1c1d22] text-white font-sans selection:bg-[#ffcf00]/30 overflow-x-hidden">
      <SEO 
        title="Bivaax Trade | High Yield Binary Options Trading"
        description="Bivaax is the most reliable binary options platform. Trade global markets with up to 95% payout, secure withdrawals, and 24/7 expert support. Join Bivaax trading today."
        keywords="Bivaax, Bivaax trade, Bivaax trading, binary options, binary trade, online trading platform, bivaax login, binary trading signals, affiliate program, earn money online"
      />
      
      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify([
          faqSchema,
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Bivaax Trading Platform",
            "operatingSystem": "Web, Android, iOS",
            "applicationCategory": "FinanceApplication",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "983104"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Bivaax",
            "url": "https://bivaax.trade",
            "logo": "https://bivaax.trade/logo.png",
            "sameAs": [
              "https://www.facebook.com/bivaaxtrade",
              "https://www.instagram.com/bivaaxtrade",
              "https://t.me/bivaaxtrade"
            ],
            "description": "Bivaax is a premium high-performance binary options trading platform offering global market access."
          },
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Bivaax Affiliate Program",
            "description": "Join the Bivaax partnership program and earn up to 80% revenue share from referred traders.",
            "provider": {
              "@type": "Organization",
              "name": "Bivaax"
            }
          }
        ])}
      </script>
      <AuthModal 
        isOpen={authModal.isOpen} 
        initialView={authModal.view} 
        onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
        onSuccess={() => navigate('/trade')} 
      />

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 sticky top-0 bg-[#1c1d22] z-50 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
          <div className="flex items-center">
            <Logo size={28} withBackground={false} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/login')}
            className="text-gray-300 hover:text-white font-bold text-sm px-3.5 py-2 rounded-lg transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="bg-[#ffcf00] text-[#1c1d22] font-black text-sm px-4 py-2 rounded-lg hover:bg-[#e6bb00] transition-colors shadow-lg shadow-yellow-500/5 select-none"
          >
            Registration
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 pt-12 pb-20 relative">
        {/* Background lines/curves simulation with safe integer scaling */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
          <svg className="absolute w-full h-[150%] -top-20" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <path d="M0 1000 C 200 0 500 0 1000 1000" fill="none" stroke="#ffcf00" strokeWidth="2" />
            <path d="M0 1000 C 300 200 600 200 1000 1000" fill="none" stroke="#ffcf00" strokeWidth="2" />
            <path d="M0 1000 C 400 400 700 400 1000 1000" fill="none" stroke="#ffcf00" strokeWidth="2" />
            <path d="M0 1000 C 500 600 800 600 1000 1000" fill="none" stroke="#ffcf00" strokeWidth="2" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10 text-white">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-[1.1]">
              Unlock your <span className="text-[#ffcf00]">financial potential</span>
            </h1>
            <p className="text-gray-300 text-xl mb-10 leading-relaxed font-normal">
              Bivaax provides advanced tools for trading with confidence. Experience a platform built for speed, precision, and reliable growth.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => navigate('/register')}
                className="bg-[#ffcf00] hover:bg-[#e6bb00] text-[#1c1d22] font-black text-lg px-10 py-5 rounded-2xl transition-all shadow-xl shadow-yellow-500/20"
              >
                Start Trading Now
              </button>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-[#ffcf00] font-bold text-sm bg-white/5 px-4 py-2 rounded-full border border-[#ffcf00]/20">
              <TrendingUp size={16} />
              Min Entry: $1
            </div>
            <div className="flex items-center gap-2 text-green-500 font-bold text-sm bg-white/5 px-4 py-2 rounded-full border border-green-500/20">
              <ShieldCheck size={16} />
              Regulated & Secure
            </div>
          </div>

          <div className="mt-12">
            <PriceTicker />
            <div className="mt-4">
              <MarketTicker />
            </div>
          </div>

          <div className="mt-12 flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 w-full">
              <MarketStatusCard />
            </div>
            <div className="lg:w-[400px] w-full shrink-0">
              <MarketMovers />
            </div>
          </div>

          {/* Payment & Security Partners */}
          <div className="mt-14 pt-8 border-t border-white/5 flex flex-col items-center">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-6">Trusted payments & security</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {/* Visa */}
              <div className="text-2xl font-black italic tracking-tighter text-blue-100 hover:text-blue-500 transition-colors">VISA</div>
              {/* Mastercard */}
              <div className="flex items-center relative">
                <div className="w-7 h-7 rounded-full bg-red-500 opacity-90 mix-blend-screen" />
                <div className="w-7 h-7 rounded-full bg-yellow-500 opacity-90 mix-blend-screen -ml-3" />
                <span className="ml-2 font-bold text-sm text-gray-300">mastercard</span>
              </div>
              {/* Bitcoin */}
              <div className="flex items-center gap-1.5 text-gray-300 font-bold text-lg hover:text-[#F7931A] transition-colors">
                <span className="text-xl">₿</span>
                Bitcoin
              </div>
              {/* Ethereum */}
              <div className="flex items-center gap-1.5 text-gray-300 font-bold hover:text-[#627EEA] transition-colors">
                <div className="w-4 h-6 border-[2px] border-current rounded-[3px] flex items-center justify-center">
                  <div className="w-0.5 h-3 bg-current" />
                </div>
                Ethereum
              </div>
              {/* PCI DSS */}
              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-gray-300 border border-gray-600 px-3 py-1.5 rounded bg-black/20 hover:border-green-500 hover:text-green-400 transition-colors">
                <ShieldCheck size={14} className="text-current" />
                PCI DSS Secure
              </div>
            </div>
          </div>

          {/* Awards List */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {[
              { icon: Award, title: "IAIR Awards" },
              { icon: Trophy, title: "FE Awards" },
              { icon: Landmark, title: "Financial Commission" },
              { icon: TrendingUp, title: "Market Data" },
              { icon: ShieldCheck, title: "Secure Platform" }
            ].map((award, i) => (
              <div key={`award-${award.title}`} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-[#ffcf00] shadow-lg border border-white/5">
                  <award.icon size={28} />
                </div>
                <div className="font-bold text-sm tracking-tight text-gray-300">{award.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-24 bg-[#1a1b20]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter">Professional <span className="text-[#ffcf00]">Trading Tools</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to succeed in the financial markets, all in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: "Technical Indicators", desc: "Access 20+ professional indicators including RSI, MACD, and Bollinger Bands." },
              { icon: Zap, title: "Instant Execution", desc: "Execute trades in milliseconds with our high-frequency trading infrastructure." },
              { icon: Globe, title: "Global Markets", desc: "Trade major currency pairs, commodities, and the exclusive Crypto IDX." },
              { icon: Shield, title: "Asset Protection", desc: "Your funds are protected by multi-layer security protocols and encryption." },
              { icon: Headphones, title: "24/7 Priority Support", desc: "Our expert team is available around the clock to assist with your needs." },
              { icon: PieChart, title: "Advanced Analytics", desc: "Track your performance with detailed history and profit analytics." }
            ].map((f, i) => (
              <div key={`feature-${f.title}`} className="bg-[#22232a] p-8 rounded-[32px] border border-white/5 hover:border-[#ffcf00]/20 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#ffcf00] mb-6 group-hover:scale-110 transition-transform">
                  <f.icon size={28} />
                </div>
                <h3 className="font-bold text-xl mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Copy Trading Highlights Section */}
      <CopyTradingHighlights />

      {/* Why Choose Bivaax Section */}
      <section className="px-4 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
             <div className="flex-1 space-y-8">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">Ready to join the <span className="text-[#ffcf00]">elite?</span></h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                   Join thousands of traders who have already chosen Bivaax as their primary partner. Our Commitment is to provide the most stable environment for your growth.
                </p>
                <div className="space-y-4">
                  {[
                    "Over 1,000,000 active users globally",
                    "Regulated by International Financial Commission",
                    "Advanced Copy Trading system for beginners",
                    "Highest profit percentages in the market (up to 95%)",
                    "Instant withdrawals to mobile wallets"
                  ].map((item, idx) => (
                    <div key={`benefit-item-${idx}`} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span className="font-bold text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  Create Free Account <ArrowRight size={20} />
                </button>
             </div>
             <div className="flex-1 relative">
                <div className="absolute inset-0 bg-[#ffcf00]/20 blur-[100px] rounded-full" />
                <div className="bg-[#22232a] border border-white/10 rounded-[40px] p-8 relative z-10 shadow-2xl">
                   <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#ffcf00]/10 flex items-center justify-center text-[#ffcf00]">
                          <Trophy size={20} />
                        </div>
                        <span className="font-black tracking-widest text-[10px] uppercase text-gray-500">Top Performance</span>
                      </div>
                      <div className="text-green-500 font-black">+95.2%</div>
                   </div>
                   <div className="space-y-6">
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-[#ffcf00] shadow-[0_0_15px_rgba(255,207,0,0.5)]" />
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[65%] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[92%] bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                      </div>
                   </div>
                   <div className="mt-12 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Weekly Profit</p>
                        <p className="text-3xl font-black text-white tracking-tighter">৳1,245,600</p>
                      </div>
                      <TrendingUp size={48} className="text-[#ffcf00] opacity-20" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* All sections here */}
      <section className="bg-white text-black py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-8">The highest profitability on the market</h2>
          
          <div className="relative inline-block mb-8">
            <h3 className="text-[120px] md:text-[160px] font-black text-[#ffcf00] leading-none drop-shadow-xl" style={{ textShadow: '2px 4px 10px rgba(0,0,0,0.1)' }}>
              99<span className="text-[70px] md:text-[100px] text-[#2c2d32]">%</span>
            </h3>
            <div className="absolute bottom-4 -right-4 bg-white border-2 border-gray-100 shadow-xl px-4 py-1 rounded-sm rotate-[-5deg]">
              <span className="font-bold text-xl tracking-wider text-[#2c2d32]">PROFIT</span>
            </div>
          </div>

          <p className="text-gray-500 text-lg md:text-xl font-medium mb-10 max-w-sm mx-auto leading-relaxed">
            Available only on Bivaax with Dynamic Range Trading (DRT) for VIP users
          </p>

          <button 
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto bg-[#ffcf00] hover:bg-[#e6bb00] text-[#1c1d22] font-bold text-xl px-12 py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 mx-auto"
          >
            Join us <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Referral Program */}
      <section className="bg-[#1c1d22] py-20 px-4">
        <div className="max-w-md mx-auto bg-[#2c2d32] rounded-3xl overflow-hidden shadow-2xl">
          <div className="h-48 bg-gradient-to-br from-green-500/20 to-[#ffcf00]/20 flex items-center justify-center relative overflow-hidden">
            <UserPlus size={100} className="text-white/20 absolute -right-6 -bottom-6" />
            <TrendingUp size={80} className="text-[#ffcf00] z-10" />
          </div>
          <div className="p-8">
            <span className="text-[#ffcf00] font-medium text-sm">Bivaax referral program</span>
            <h2 className="text-2xl font-bold mt-3 mb-8">Invite friends and get up to $100 to your real account</h2>
            <button className="w-full bg-[#ffcf00] hover:bg-[#e6bb00] text-black font-bold text-lg py-4 rounded-xl transition-colors">
              Learn more
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-white py-20 px-4 text-black text-center">
        <div className="max-w-md mx-auto space-y-16">
          <div>
            <div className="text-5xl font-black mb-2">983 104</div>
            <div className="text-gray-500 font-medium">Active traders daily</div>
          </div>
          
          <div className="w-16 h-1 bg-[#ffcf00] mx-auto rounded-full"></div>

          <div>
            <div className="text-5xl font-black mb-2">133</div>
            <div className="text-gray-500 font-medium">Countries of presence</div>
          </div>

          <div className="w-16 h-1 bg-[#ffcf00] mx-auto rounded-full"></div>

          <div>
            <div className="text-5xl font-black mb-2">29 974 955</div>
            <div className="text-gray-500 font-medium">Successful trades in the past week</div>
          </div>

          <div className="w-16 h-1 bg-[#ffcf00] mx-auto rounded-full"></div>

          <div>
            <div className="text-5xl font-black mb-3">4.8 <span className="text-xl font-medium text-gray-500">out of 5</span></div>
            <div className="flex items-center justify-center gap-1 text-[#ffcf00] mb-2">
              <Star fill="currentColor" size={28} />
              <Star fill="currentColor" size={28} />
              <Star fill="currentColor" size={28} />
              <Star fill="currentColor" size={28} />
              <Star fill="currentColor" size={28} opacity={0.5} />
            </div>
            <div className="font-bold text-indigo-600 text-xl tracking-tight">hellopeter</div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white pb-20 px-4 text-black text-center">
        <h2 className="text-3xl font-extrabold mb-16">The benefits of the platform</h2>
        <div className="max-w-md mx-auto space-y-20 relative">
          
          {/* Benefit 1 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mb-6 flex justify-center items-center">
              <Calculator size={70} strokeWidth={1} className="text-[#ffcf00]" />
            </div>
            <h3 className="text-2xl font-bold mb-4 px-8">Minimum account balance from $10</h3>
            <p className="text-gray-600">Start making trades with minimum investments.</p>
          </div>

          {/* Benefit 2 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mb-6 flex justify-center items-center">
              <ShieldCheck size={70} strokeWidth={1} className="text-[#ffcf00]" />
            </div>
            <h3 className="text-2xl font-bold mb-4 px-8">Trade amount starting from $1</h3>
            <p className="text-gray-600">The minimum cost of a trade is quite low. You won't lose a large amount of funds while you're still learning how to trade.</p>
          </div>

          {/* Benefit 3 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mb-6 flex justify-center items-center">
              <div className="flex items-end h-full gap-1">
                <div className="w-1 h-12 bg-[#ffcf00] mb-1"></div>
                <div className="w-1 h-16 bg-[#ffcf00] mb-1"></div>
                <div className="w-1 h-8 bg-[#ffcf00] mb-1"></div>
                <div className="w-1 h-14 bg-[#ffcf00] mb-1"></div>
                <div className="w-1 h-20 bg-[#ffcf00] mb-1"></div>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 px-8">A unique mode of trading: 'Non-stop'</h3>
            <p className="text-gray-600">There are no restrictions on the platform regarding the number of trades that can be concluded simultaneously. You can open several positions at the same time and continue trading.</p>
          </div>

          {/* Benefit 4 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mb-6 flex justify-center items-center">
              <Calendar size={70} strokeWidth={1} className="text-[#ffcf00]" />
            </div>
            <h3 className="text-2xl font-bold mb-4 px-8">Work also on the weekends</h3>
            <p className="text-gray-600">Some quotes sources are available only on working days. We combined various options for your convenience: trade even on weekends choosing the most suitable assets.</p>
          </div>

        </div>
      </section>

      {/* Transparent Deposit Section */}
      <section className="bg-gray-100/50 py-20 px-4 text-black">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-extrabold mb-6 text-center">Transparent deposit, fast withdrawal</h2>
          <p className="text-center text-gray-700 mb-8 font-medium">Transfers safely via familiar payment methods</p>
          
          <div className="space-y-4 mb-10">
             {[
               { icon: Landmark, name: "Bank cards" },
               { icon: Smartphone, name: "E-wallets" },
               { icon: TrendingUp, name: "Crypto methods" },
               { icon: Landmark, name: "Bank transfer" }
             ].map((method, i) => (
                <div key={`pay-method-${method.name}`} className="bg-white rounded-2xl p-6 flex items-center shadow-sm">
                  <method.icon size={32} className="text-[#ffcf00] mr-6" strokeWidth={1.5} />
                  <span className="font-bold text-[17px]">{method.name}</span>
                </div>
             ))}
          </div>

          <button 
            onClick={() => navigate('/register')}
            className="w-full bg-[#ffcf00] hover:bg-[#e6bb00] text-black font-bold text-xl py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-colors"
          >
            Try Bivaax <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Trade From Anywhere */}
      <section className="bg-white py-20 px-4 text-black text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-extrabold mb-4">Trade<br/>from anywhere!</h2>
          <p className="text-gray-600 mb-12">
            You can trade anytime and anywhere with the Bivaax app for iOS and Android. Stay in the know: instant information on trade closings, promotions and tournaments.
          </p>
          
          <div className="space-y-4 max-w-[280px] mx-auto">
            {/* Fake App Store Button */}
            <div className="bg-black text-white rounded-xl py-3 px-6 flex items-center cursor-pointer hover:bg-gray-900 transition-colors">
               <div className="text-3xl mr-4 px-1">🍏</div>
               <div className="text-left flex-1">
                 <div className="text-[10px] text-gray-300">Download on the</div>
                 <div className="text-xl font-semibold leading-none">App Store</div>
               </div>
            </div>
            
             {/* Fake GP Button */}
             <div className="bg-black text-white rounded-xl py-3 px-6 flex items-center cursor-pointer hover:bg-gray-900 transition-colors">
               <div className="text-3xl mr-4 px-1">▶</div>
               <div className="text-left flex-1">
                 <div className="text-[10px] text-gray-300">GET IT ON</div>
                 <div className="text-xl font-semibold leading-none">Google Play</div>
               </div>
            </div>
            
             <div className="bg-black text-white rounded-xl py-3 px-6 flex items-center cursor-pointer hover:bg-gray-900 transition-colors justify-center font-bold">
               <span className="text-blue-400 mr-2 text-xl">🚀</span> TG Mini App
            </div>
          </div>
        </div>
      </section>

      {/* Simple and Convenient */}
      <section className="bg-white py-20 px-4 text-black border-t border-gray-100">
        <div className="max-w-md mx-auto text-center space-y-16">
          <h2 className="text-3xl font-extrabold mb-8">Simple and convenient</h2>
          
          <div>
            <div className="w-24 h-24 bg-[#ffcf00] rounded-full mx-auto flex items-center justify-center mb-6 shadow-xl shadow-yellow-500/20">
               <Award size={40} className="text-black" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Demo account</h3>
            <p className="text-gray-600 font-medium">You can always improve your trading skills on the demo account. When you're ready, switch to your real account.</p>
          </div>

          <div>
            <div className="w-24 h-24 bg-[#ffcf00] rounded-full mx-auto flex items-center justify-center mb-6 shadow-xl shadow-yellow-500/20">
               <MessageCircle size={40} className="text-black" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Online support</h3>
            <p className="text-gray-600 font-medium">You can send a message anytime via chat and get feedback right away!</p>
          </div>

          <div>
            <div className="w-24 h-24 bg-[#ffcf00] rounded-full mx-auto flex items-center justify-center mb-6 shadow-xl shadow-yellow-500/20">
               <BookOpen size={40} className="text-black" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Free training</h3>
            <p className="text-gray-600 font-medium">By studying the extensive knowledge base, you will be able to improve your trading skills for better results.</p>
          </div>

          <div>
            <div className="w-24 h-24 bg-[#ffcf00] rounded-full mx-auto flex items-center justify-center mb-6 shadow-xl shadow-yellow-500/20">
               <Users size={40} className="text-black" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Copy trading</h3>
            <p className="text-gray-600 font-medium">Follow professional traders and copy their trades automatically. It's the best way to earn while you learn.</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20 px-4 text-black text-center">
         <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-extrabold mb-4">Put your trading<br/>helmet on</h2>
            <p className="text-gray-600 mb-12">
              Trading on Bivaax is an exciting process. But to really enjoy it, you need to keep yourself safe. Use Bivaax features that protect your accounts and funds:
            </p>

            <div className="space-y-8 mb-12">
              <div>
                <p className="font-semibold text-lg max-w-[250px] mx-auto">AI-verification of identity and payment methods in less than 2 mins on average</p>
                <div className="w-24 h-1 bg-[#ffcf00] mx-auto mt-6"></div>
              </div>
              <div>
                <p className="font-semibold text-lg max-w-[250px] mx-auto">2-factor authentication of access to the account</p>
                <div className="w-24 h-1 bg-[#ffcf00] mx-auto mt-6"></div>
              </div>
              <div>
                <p className="font-semibold text-lg max-w-[250px] mx-auto">Payment card data protection under PCI international standard</p>
              </div>
            </div>

            <p className="text-gray-600 mb-8 font-medium">Turn on 2FA and make your breathtaking trading journey safer with Bivaax</p>
            
            <button 
               onClick={() => navigate('/register')}
               className="w-full bg-[#ffcf00] hover:bg-[#e6bb00] text-black font-bold text-xl py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-colors mb-6"
            >
              Put helmet on <ArrowRight size={24} />
            </button>
            <p className="text-sm font-bold underline cursor-pointer">Step-by-step tutorial on activating 2FA is here</p>
         </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="bg-[#1c1d22] py-24 px-4 border-t border-white/5 relative overflow-hidden">
        {/* Subtle decorative glow for premium alignment */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#ffcf00]/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-left">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#ffcf00]/10 px-4 py-1.5 rounded-full border border-[#ffcf00]/20 text-[#ffcf00] mb-4 text-xs font-semibold uppercase tracking-wider">
              <HelpCircle size={14} />
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
              Have <span className="text-[#ffcf00]">questions?</span> We've got answers.
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed mb-8">
              Find answers to common questions about setting up your account, deposits, copy trading, security protocols, and managing trades on Bivaax.
            </p>
            <input
              type="text"
              placeholder="Search questions..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full max-w-lg bg-[#22232a] border border-white/10 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#ffcf00] transition-colors"
            />
          </div>

          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div 
                    key={`faq-item-${index}`} 
                    className="bg-[#22232a] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-white transition-colors hover:text-[#ffcf00] focus:outline-none"
                    >
                      <span className="text-[16px] md:text-lg tracking-tight leading-tight">{faq.question}</span>
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 transition-all duration-300 ${isOpen ? 'rotate-180 bg-[#ffcf00]/10 text-[#ffcf00]' : ''}`}>
                        <ChevronDown size={18} />
                      </span>
                    </button>
                    <div 
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-60 opacity-100 border-t border-white/5' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="px-6 py-5 text-gray-400 text-sm leading-relaxed font-normal bg-[#1e2026]">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">No questions found matching your search.</p>
            )}
          </div>
        </div>
      </section>

      <TestimonialsCarousel />

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#17181d]">
        <div className="px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <Logo size={32} withBackground={false} />
                <p className="mt-6 text-gray-500 max-w-sm leading-relaxed mb-8">
                  Bivaax is a modern trading platform designed for high-performance financial execution. Join our global network today.
                </p>
                <div className="max-w-sm border-t border-white/5 pt-8">
                  <NewsletterForm />
                </div>
                <div className="mt-8 flex gap-4">
                  {['youtube', 'instagram', 'telegram', 'facebook', 'tiktok'].map((social, i) => (
                    <div key={`social-${social}`} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer text-white transition-colors">
                      <div className="w-3 h-3 bg-white rounded-sm opacity-50"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-widest text-white mb-6">Company</h4>
                <ul className="space-y-4 text-gray-500 text-sm font-bold">
                  <li><Link to="/about-us" className="hover:text-[#ffcf00] transition-colors">About Us</Link></li>
                  <li><Link to="/page/contact" className="hover:text-[#ffcf00] transition-colors">Contact</Link></li>
                  <li><Link to="/page/legal-agreement" className="hover:text-[#ffcf00] transition-colors">Legal Agreement</Link></li>
                  <li><Link to="/page/risk-disclosure" className="hover:text-[#ffcf00] transition-colors">Risk Disclosure</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-widest text-white mb-6">Legal</h4>
                <ul className="space-y-4 text-gray-500 text-sm font-bold">
                  <li><Link to="/page/privacy-policy" className="hover:text-[#ffcf00] transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/page/terms-of-service" className="hover:text-[#ffcf00] transition-colors">Terms of Service</Link></li>
                  <li><Link to="/page/aml-policy" className="hover:text-[#ffcf00] transition-colors">AML Policy</Link></li>
                  <li><Link to="/page/payment-methods" className="hover:text-[#ffcf00] transition-colors">Payment Methods</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="text-[#ffcf00] font-black text-xs uppercase tracking-widest">Regulatory Status</div>
                <p className="text-gray-500 text-xs leading-relaxed max-w-md">
                  Bivaax is a category A member of the International Financial Commission, which guarantees the company's customers quality of service, transparency of relations, and protection from a neutral and independent dispute resolution organization.
                </p>
              </div>
              <div className="flex flex-col md:items-end gap-6">
                <div className="flex gap-6 text-white/50">
                  <span className="font-black text-2xl tracking-tighter">VISA</span>
                  <span className="font-black text-2xl tracking-tighter">MASTERCARD</span>
                  <span className="font-black text-2xl tracking-tighter">BITCOIN</span>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Corporate Address</div>
                  <div className="text-gray-400 text-xs font-medium">
                    Dolphin Corp LLC, Euro House, Richmond Hill Road,<br/>Kingstown, St. Vincent and Grenadines
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/20 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-gray-600 text-xs font-medium">© 2014-2026 Bivaax Trading Platform. All rights reserved.</p>
            <div className="flex items-center gap-8">
              <Link to="/page/privacy-policy" className="text-gray-600 hover:text-white text-xs font-bold transition-colors">Privacy Policy</Link>
              <Link to="/page/terms-of-service" className="text-gray-600 hover:text-white text-xs font-bold transition-colors">Terms Conditions</Link>
              <div className="flex gap-4 ml-4">
                <Smartphone size={16} className="text-gray-600 hover:text-white cursor-pointer transition-colors" />
                <MessageCircle size={16} className="text-gray-600 hover:text-white cursor-pointer transition-colors" />
                <Globe size={16} className="text-gray-600 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
          <p className="text-[10px] text-gray-600 leading-relaxed text-center opacity-50 uppercase tracking-widest font-black">
            Risk Warning: The financial operations offered on this site may involve increased risk. By using the financial services and tools this site offers, you may suffer serious financial loss, or completely lose the funds in your guaranteed trading account. Please evaluate all the financial risks and seek advice from an independent financial advisor before trading.
          </p>
        </div>
      </footer>
    </div>
  );
}

