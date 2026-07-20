import React from 'react';
import SEO from '../components/SEO';
import { BookOpen, ShieldCheck, Wallet, Zap, HelpCircle } from 'lucide-react';

export default function DocsPage() {
  const sections = [
    {
      title: "Platform Overview",
      icon: BookOpen,
      content: "Bivaax is a next-generation trading platform designed for speed, security, and accessibility. Our mission is to provide intuitive tools for market analysis and trade execution."
    },
    {
      title: "Affiliate Program Rules",
      icon: ShieldCheck,
      content: "Our affiliate program rewards partners for bringing active traders. Key rules include no self-referrals, no brand bidding, and maintenance of high-quality traffic. Commissions are paid based on RevShare and Turnover models."
    },
    {
      title: "Revenue Models",
      icon: Wallet,
      content: "We offer multiple ways to earn: RevShare (up to 80% of platform profit), Turnover (up to 5% of trading volume), and Sub-Affiliates (10% of sub-partner earnings)."
    },
    {
      title: "How to Get Started",
      icon: Zap,
      content: "1. Sign up. 2. Verify your account. 3. Get your referral link. 4. Share and earn."
    }
  ];

  return (
    <div className="min-h-screen bg-[#101115] text-white p-6 sm:p-12">
      <SEO 
        title="Documentation"
        description="Learn about Bivaax platform, our trading tools, and affiliate program rules. Detailed guide on RevShare, Turnover models, and how to start earning."
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-12 tracking-tighter">Bivaax Documentation</h1>
        <div className="grid gap-8">
          {sections.map((section, index) => (
            <section key={index} className="bg-[#1c1d22] p-8 rounded-3xl border border-white/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                  <section.icon size={24} />
                </div>
                <h2 className="text-2xl font-black tracking-tight">{section.title}</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
