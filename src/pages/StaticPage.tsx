import React, { useEffect } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';

const PAGE_CONTENT: Record<string, { title: string; category: string; content: React.ReactNode }> = {
  'contact': {
    title: 'Contact Us',
    category: 'Company',
    content: (
      <div className="space-y-6 text-gray-400">
        <p>We are here to help you 24/7. Whether you have a question about your account, need technical assistance, or want to provide feedback, our global support team is ready to assist you.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-[#1a1b1f] p-6 rounded-2xl border border-white/5">
            <h4 className="text-white font-bold mb-2">General Support</h4>
            <p>support@bivaax.trade</p>
          </div>
          <div className="bg-[#1a1b1f] p-6 rounded-2xl border border-white/5">
            <h4 className="text-white font-bold mb-2">Partnerships</h4>
            <p>partners@bivaax.trade</p>
          </div>
          <div className="bg-[#1a1b1f] p-6 rounded-2xl border border-white/5">
            <h4 className="text-white font-bold mb-2">Compliance & Legal</h4>
            <p>legal@bivaax.trade</p>
          </div>
          <div className="bg-[#1a1b1f] p-6 rounded-2xl border border-white/5">
            <h4 className="text-white font-bold mb-2">Headquarters</h4>
            <p>Bivaax Financial Services Ltd.<br/>Global Trade Center, Suite 100</p>
          </div>
        </div>
      </div>
    )
  },
  'legal-agreement': {
    title: 'Legal Agreement',
    category: 'Company',
    content: (
      <div className="space-y-6 text-gray-400">
        <p>This Client Legal Agreement ("Agreement") constitutes a legally binding contract between Bivaax ("Company", "we", or "us") and you ("Client", "Trader", or "you"). By opening an account and using our trading services, you acknowledge that you have read, understood, and agree to be bound by these terms.</p>
        <h3 className="text-xl text-white font-bold mt-8">1. Account Responsibilities</h3>
        <p>Clients must be at least 18 years of age and provide accurate, up-to-date information during the registration process. You are solely responsible for maintaining the security of your account credentials.</p>
        <h3 className="text-xl text-white font-bold mt-8">2. Execution Policy</h3>
        <p>Bivaax acts as an execution-only venue. We do not provide investment advice or portfolio management services. All trades executed on the platform are final and subject to market volatility and liquidity conditions.</p>
      </div>
    )
  },
  'risk-disclosure': {
    title: 'Risk Disclosure',
    category: 'Company',
    content: (
      <div className="space-y-6 text-gray-400">
        <p>Trading complex financial products, including Contracts for Difference (CFDs), cryptocurrencies, and foreign exchange, carries a high level of risk and may not be suitable for all investors.</p>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 my-8">
          <h4 className="text-red-400 font-bold mb-2">High-Risk Investment Warning</h4>
          <p className="text-red-200/80 text-sm leading-relaxed">CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage. A significant percentage of retail investor accounts lose money when trading CFDs. You should consider whether you understand how CFDs work and whether you can afford to take the high risk of losing your money.</p>
        </div>
        <h3 className="text-xl text-white font-bold mt-8">Market Volatility</h3>
        <p>Financial markets can be highly volatile. Prices may move rapidly against your positions, resulting in losses that exceed your initial deposits. Bivaax is not liable for losses incurred due to severe market gaps, liquidity shortages, or macroeconomic events.</p>
      </div>
    )
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    category: 'Legal',
    content: (
      <div className="space-y-6 text-gray-400">
        <p>At Bivaax, we are committed to safeguarding your privacy and protecting the personal and financial information you entrust to us. This Privacy Policy details how we collect, use, and store your data in compliance with global data protection regulations.</p>
        <h3 className="text-xl text-white font-bold mt-8">Data Collection</h3>
        <p>We collect personal information such as your name, contact details, identification documents, and financial history during account registration and verification (KYC/AML procedures). We also collect non-identifiable technical data related to your device and usage of our platform.</p>
        <h3 className="text-xl text-white font-bold mt-8">Data Utilization</h3>
        <p>Your data is used strictly for providing trading services, executing transactions, ensuring platform security, and complying with international anti-money laundering regulations. We do not sell your personal data to third-party marketing agencies.</p>
      </div>
    )
  },
  'terms-of-service': {
    title: 'Terms of Service',
    category: 'Legal',
    content: (
      <div className="space-y-6 text-gray-400">
        <p>Welcome to Bivaax. These Terms of Service govern your access to and use of our trading platform, APIs, mobile applications, and related services.</p>
        <h3 className="text-xl text-white font-bold mt-8">Prohibited Activities</h3>
        <p>Users are strictly prohibited from engaging in market manipulation, algorithmic abuse, latency arbitrage, or attempting to exploit platform vulnerabilities. Bivaax reserves the right to suspend accounts or cancel trades associated with malicious behavior without prior notice.</p>
        <h3 className="text-xl text-white font-bold mt-8">Service Availability</h3>
        <p>While Bivaax strives for 99.99% uptime, access to the platform may occasionally be interrupted for critical maintenance or due to unforeseen network congestion. We are not liable for trading losses that result from connectivity issues beyond our direct control.</p>
      </div>
    )
  },
  'aml-policy': {
    title: 'AML Policy',
    category: 'Legal',
    content: (
      <div className="space-y-6 text-gray-400">
        <p>Bivaax enforces a strict Anti-Money Laundering (AML) and Know Your Customer (KYC) policy as required by international financial regulatory bodies. We are committed to preventing our platform from being used to facilitate money laundering, terrorist financing, or other illegal activities.</p>
        <h3 className="text-xl text-white font-bold mt-8">Identity Verification</h3>
        <p>All clients must undergo mandatory KYC verification before initiating withdrawals or accessing advanced trading features. This includes providing a government-issued ID and recent proof of address. Bivaax utilizes advanced biometric and documentary analysis to ensure document authenticity.</p>
        <h3 className="text-xl text-white font-bold mt-8">Transaction Monitoring</h3>
        <p>We actively monitor fiat and cryptocurrency deposits and withdrawals. Large or anomalous transactions may trigger manual compliance reviews. Suspicious activity will be reported to the relevant authorities.</p>
      </div>
    )
  },
  'payment-methods': {
    title: 'Payment Methods',
    category: 'Legal',
    content: (
      <div className="space-y-6 text-gray-400">
        <p>Bivaax supports a diverse array of global and regional payment methods to ensure seamless funding and withdrawals for our clients worldwide.</p>
        <div className="bg-[#1a1b1f] rounded-2xl border border-white/5 overflow-hidden mt-8">
           <table className="w-full text-left">
             <thead className="bg-[#222329] text-gray-400 text-sm border-b border-white/5">
                <tr>
                   <th className="p-4 font-medium" align="left">Method</th>
                   <th className="p-4 font-medium" align="left">Processing Time</th>
                   <th className="p-4 font-medium" align="left">Fee</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                <tr>
                   <td className="p-4 flex items-center gap-3"><span className="text-white">Bank Wire Transfer</span></td>
                   <td className="p-4">1-3 Business Days</td>
                   <td className="p-4">Free*</td>
                </tr>
                <tr>
                   <td className="p-4 flex items-center gap-3"><span className="text-white">Credit / Debit Cards</span></td>
                   <td className="p-4">Instant</td>
                   <td className="p-4">2.5%</td>
                </tr>
                <tr>
                   <td className="p-4 flex items-center gap-3"><span className="text-white">Cryptocurrency (BTC, USDT, ETH)</span></td>
                   <td className="p-4">Network Dependent (Usually ~5 mins)</td>
                   <td className="p-4">Network Fee Only</td>
                </tr>
                <tr>
                   <td className="p-4 flex items-center gap-3"><span className="text-white">Regional E-Wallets</span></td>
                   <td className="p-4">Instant</td>
                   <td className="p-4">Varies by provider</td>
                </tr>
             </tbody>
           </table>
        </div>
        <p className="text-xs text-gray-500 mt-4">*Note: Your local bank may charge intermediary fees outside of Bivaax's control.</p>
      </div>
    )
  }
};

export default function StaticPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (slug === 'about-us') {
    return <Navigate to="/about-us" replace />;
  }

  if (!slug || !PAGE_CONTENT[slug]) {
    return <Navigate to="/" replace />;
  }

  const page = PAGE_CONTENT[slug];

  return (
    <div className="min-h-screen bg-[#121316] font-sans selection:bg-yellow-500/30">
      <SEO 
        title={page.title} 
        description={`Read about ${page.title} on Bivaax Trade Platform.`}
        url={`https://market.bivaax.trade/page/${slug}`}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#121316]/80 backdrop-blur-md border-b border-white/5 h-[72px] flex items-center px-4 md:px-8">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="hidden md:block w-[1px] h-6 bg-white/10 mx-2"></div>
          <Logo size={28} withBackground={false} />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-12 pb-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12">
          
          {/* Sidebar Nav */}
          <aside className="w-full md:w-[240px] shrink-0">
            <div className="sticky top-[104px]">
              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 px-3">Company</h4>
                  <div className="flex flex-col gap-1">
                    {['contact', 'legal-agreement', 'risk-disclosure'].map(id => (
                      <Link 
                        key={`nav-${id}`} 
                        to={`/page/${id}`} 
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${slug === id ? 'bg-yellow-500/10 text-yellow-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                      >
                        {PAGE_CONTENT[id].title}
                        {slug === id && <ChevronRight size={14} className="opacity-70" />}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 px-3">Legal</h4>
                  <div className="flex flex-col gap-1">
                    {['privacy-policy', 'terms-of-service', 'aml-policy', 'payment-methods'].map(id => (
                      <Link 
                        key={`nav-${id}`} 
                        to={`/page/${id}`} 
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${slug === id ? 'bg-yellow-500/10 text-yellow-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                      >
                        {PAGE_CONTENT[id].title}
                        {slug === id && <ChevronRight size={14} className="opacity-70" />}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <section className="flex-1 min-w-0">
            <div className="mb-10">
              <div className="text-yellow-500 font-bold tracking-wider uppercase text-xs mb-3">{page.category}</div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{page.title}</h1>
            </div>
            <div className="prose prose-invert max-w-none text-gray-300 prose-headings:text-white hover:prose-a:text-yellow-400 prose-a:text-[#ffcf00] prose-p:leading-relaxed">
              {page.content}
            </div>
          </section>

        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-gray-500 text-sm">
         Bivaax © {new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  );
}
