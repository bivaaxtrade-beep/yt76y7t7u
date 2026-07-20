import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  ArrowRight, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Zap, 
  ChevronDown, 
  ShieldCheck, 
  MessageSquare,
  Globe,
  PieChart,
  Bot,
  Laptop
} from 'lucide-react';
import { Logo } from '../components/Logo';
import SEO from '../components/SEO';

export default function AffiliateLandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqSearch, setFaqSearch] = useState('');

  // Interactive Calculator State
  const [tradersCount, setTradersCount] = useState(50);
  const [avgTradeVolume, setAvgTradeVolume] = useState(5000);

  // Dynamic RevShare Rate based on referrals count
  const getRevShareRate = (count: number) => {
    if (count <= 10) return 50;
    if (count <= 50) return 60;
    if (count <= 100) return 70;
    return 80;
  };

  const revShareRate = getRevShareRate(tradersCount);
  // Estimate platform fee/revenue rate as 2.5% of total traded volume
  const estimatedPlatformRevenue = tradersCount * avgTradeVolume * 0.025;
  const estimatedMonthlyCommission = (estimatedPlatformRevenue * (revShareRate / 100)).toFixed(2);

  const faqs = [
    {
      q: "What is Bivaax Partners and how does it work?",
      a: "Bivaax Partners is our official affiliate marketing program. It enables content creators, community leaders, digital marketers, and trading experts to monetize their traffic. By promoting Bivaax with your unique tracking link, you earn a substantial lifetime commission of up to 80% of platform revenue generated from every trade your referrals make."
    },
    {
      q: "How high is the commission rate?",
      a: "We offer an escalating hybrid Revenue Share structure. You start at 50% flat commission rate of platform revenue, which scales automatically up to 80% based on active referral count. We also support sub-affiliate tiers, allowing you to earn an extra 10% from partners you refer."
    },
    {
      q: "When and how are payouts processed?",
      a: "Affiliate commissions are synchronized instantly in your partner vault. Payout requests are processed every hour with a low minimum threshold of only $10. We support fast withdrawals to verified USDT (TRC-20) addresses as well as other global fiat integrations inside your portal with zero platform charges."
    },
    {
      q: "Do I get dedicated marketing support?",
      a: "Standard, Silver, and VIP affiliates all gain access to our custom promotional hub. This includes landing page builders, interactive analytics dashboards, custom campaign tracking (Sub-IDs), localized brand kits, high-converting banner ads, and a highly responsive 24/7 dedicated partner support team."
    },
    {
      q: "Is there any cost to join?",
      a: "None whatsoever. Bivaax Partners is a completely free program. Registration takes less than 2 minutes, and your partner tracking credentials are generated instantly so you can start converting your audience immediately."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    faq.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white font-sans selection:bg-[#ffcf00]/30 overflow-x-hidden">
      <SEO 
        title="Bivaax Partners | The Elite Trading Affiliate Network"
        description="Join the Bivaax Partner Network and earn industry-leading commissions. Lifetime recurring income, high conversion rates, and dedicated support."
        keywords="Bivaax affiliate, Bivaax partner, trading affiliate program, binary options affiliate, earn money trading"
      />
      {/* HEADER (Simplified) */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#0b0c10]/70 backdrop-blur-2xl border-b border-white/5 z-50 px-6 md:px-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-[#ffcf00] to-[#ff9100] rounded-xl shadow-lg shadow-[#ffcf00]/20 group-hover:scale-110 transition-transform">
              <Logo size={24} color="black" />
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] font-black tracking-tighter leading-none mb-0.5">BIVAAX</span>
              <span className="text-[9px] text-[#ffcf00] font-black uppercase tracking-[0.2em] leading-none">PARTNERS</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2.5 rounded-xl text-[13px] font-black text-gray-300 hover:text-white transition-colors uppercase tracking-widest border border-white/5 hover:border-white/20 bg-white/5">Sign In</Link>
            <Link to="/register" className="bg-[#ffcf00] hover:bg-[#ffcf00]/90 text-black px-6 py-2.5 rounded-xl text-[13px] font-black transition-all shadow-xl shadow-[#ffcf00]/10 hover:shadow-[#ffcf00]/30 flex items-center gap-2 group active:scale-95 uppercase tracking-widest">Join Elite<ArrowRight size={14} strokeWidth={3} /></Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-48 pb-32 px-6 md:px-12 relative">
        <div className="max-w-6xl mx-auto text-center space-y-10">
          <h1 className="text-5xl md:text-8xl font-sans font-black tracking-tighter leading-[0.9] text-white">Earn Up To <span className="text-[#ffcf00]">80% Shares</span> Every Month For Life</h1>
          <p className="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">Transform your traffic into a reliable income stream with the industry's most advanced partner tools.</p>
        </div>
      </section>

      {/* INTERACTIVE CALCULATOR SECTION */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#15171e] to-[#0b0c10] border border-white/5 rounded-[48px] p-8 md:p-20 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">Estimate Your Monthly Earnings</h2>
            <div className="space-y-10">
              <input type="range" min="1" max="1000" value={tradersCount} onChange={(e) => setTradersCount(Number(e.target.value))} className="w-full h-2 bg-[#0b0c10] rounded-full appearance-none cursor-pointer accent-[#ffcf00]" />
              <input type="range" min="1000" max="100000" step="1000" value={avgTradeVolume} onChange={(e) => setAvgTradeVolume(Number(e.target.value))} className="w-full h-2 bg-[#0b0c10] rounded-full appearance-none cursor-pointer accent-indigo-500" />
            </div>
          </div>
          <div className="lg:col-span-5 bg-[#0b0c10]/50 border border-white/10 rounded-[40px] p-10 md:p-14 flex flex-col justify-between min-h-[450px]">
             <div className="text-center">
              <div className="text-7xl font-black text-[#ffcf00]">{revShareRate}%</div>
              <span className="text-gray-400 font-bold uppercase text-xs">RevShare Rate</span>
            </div>
            <div className="py-10 border-y border-white/5 text-center">
              <div className="text-5xl font-black text-white">${Number(estimatedMonthlyCommission).toLocaleString()}</div>
              <span className="text-emerald-500 font-black uppercase text-xs">PER MONTH (USD)</span>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED FAQ ACCORDION */}
      <section className="py-32 px-6 md:px-12 max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">Common Questions</h2>
          <input type="text" placeholder="Search questions..." value={faqSearch} onChange={(e) => setFaqSearch(e.target.value)} className="w-full max-w-lg bg-[#15171e] border border-white/10 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#ffcf00] transition-colors" />
        </div>
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => (
            <div key={idx} className="bg-[#15171e]/50 border border-white/5 rounded-3xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full flex justify-between p-8 text-left">{faq.q}</button>
              <AnimatePresence>
                {openFaq === idx && <motion.div className="px-8 pb-8 text-gray-400">{faq.a}</motion.div>}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b0c10] border-t border-white/5 py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-6 max-w-sm">
              <Link to="/" className="flex items-center gap-3">
                <div className="p-2 bg-[#ffcf00] rounded-xl">
                  <Logo size={20} color="black" />
                </div>
                <span className="font-black text-white text-xl tracking-tighter">BIVAAX PARTNERS</span>
              </Link>
              <p className="text-gray-500 font-medium leading-relaxed">
                The leading fintech partnership network for traders and influencers. We provide the most advanced tools to monetize your audience.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-24">
              <div className="space-y-6">
                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Platform</h4>
                <ul className="space-y-4 text-gray-500 font-bold text-xs uppercase tracking-widest">
                  <li><Link to="/trade" className="hover:text-[#ffcf00] transition-colors">Trade App</Link></li>
                  <li><Link to="/about-us" className="hover:text-[#ffcf00] transition-colors">About Us</Link></li>
                  <li><Link to="/help-center" className="hover:text-[#ffcf00] transition-colors">Help Center</Link></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Resources</h4>
                <ul className="space-y-4 text-gray-500 font-bold text-xs uppercase tracking-widest">
                  <li><Link to="/login" className="hover:text-[#ffcf00] transition-colors">Sign In</Link></li>
                  <li><Link to="/register" className="hover:text-[#ffcf00] transition-colors">Registration</Link></li>
                  <li><button className="hover:text-[#ffcf00] transition-colors">Media Kit</button></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-16 border-t border-white/5 space-y-8 text-center md:text-left">
            <p className="text-[11px] text-gray-600 leading-relaxed font-bold uppercase tracking-widest max-w-4xl">
              Risk Disclaimer: Trading involves high financial risk. Bivaax Partners is a marketing program and does not provide financial advice. Ensure your users understand the risks before trading.
            </p>
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[11px] text-gray-600 font-black tracking-[0.2em] uppercase">
                © {new Date().getFullYear()} BIVAAX PARTNERS INC. ALL RIGHTS RESERVED.
              </p>
              <div className="flex gap-8 text-[11px] text-gray-600 font-black tracking-[0.2em] uppercase">
                <button className="hover:text-white transition-colors">Terms of Service</button>
                <button className="hover:text-white transition-colors">Privacy Policy</button>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

