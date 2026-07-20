import React from 'react';
import { Logo } from '../components/Logo';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#121316] text-gray-300 font-sans p-6 md:p-12">
      <SEO 
        title="About Us"
        description="Learn more about Bivaax Trading, a world-class binary options platform. Discover our mission, values, and commitment to providing high-quality trading services."
        keywords="about Bivaax, Bivaax mission, Bivaax trading history, binary options broker info"
      />
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center gap-4 mb-12">
          <Logo size={48} />
          <h1 className="text-4xl font-black text-white tracking-tight">About Bivaax</h1>
        </header>

        <section className="prose prose-invert prose-lg max-w-none">
          <p className="text-xl text-white">
            Bivaax is a client-oriented company, creating new possibilities in the market of leading trading technologies.
          </p>
          <p>
            At Bivaax, we've thought of everything down to the smallest detail. On the road to creating a world-class trading platform, we feel that it is our priority to offer the highest quality services and support, including professional level tutorials, analytical services, and client support.
          </p>
          <p>
            We know how important the quality of the trading platform is to a trader's success. That's precisely why Bivaax places such emphasis on a high level of service and a wide spectrum of intellectual offers. In addition, the broker dedicates a huge amount of attention to the professional preparation of beginner traders, while at the same time providing for the highest level needs of the most sophisticated traders in the market.
          </p>
          <p>
            Bivaax works with clients all over the world, guaranteeing the most advantageous terms and providing high quality access to the world's financial markets. We build our collaboration with our clients in the form of a conversation: we want to find out your needs and comments, and what you would like to get from working with Bivaax, and we want to hear it directly from you.
          </p>
          <p>
            Our collaboration with our clients is completely transparent, while our high-tech service allows traders to see the actual picture of the world's financial markets, and to evaluate your risk objectively. Bivaax is certified by the IFC and all of the risks of our clients are insured in accordance with the current laws, which makes us one of the safest trading platforms in the world. All of this gives us and our clients the highest level of mutual trust and makes for a pleasant investing climate at Bivaax.
          </p>
        </section>

        <section className="bg-[#1a1b1f] p-8 rounded-2xl border border-white/5">
          <h2 className="text-2xl font-bold text-white mb-6">Our Advantages</h2>
          <ul className="grid md:grid-cols-2 gap-4 text-gray-300">
            {[
              "High-end trading platform with a wide range of financial assets.",
              "Some of the most advantageous trading terms and investment opportunities on the market.",
              "Analytical trading services.",
              "Convenient for both experienced and novice traders.",
              "Helpful high quality tutorials.",
              "Efficient and highly professional client support staff.",
              "Quotes from leading world news agencies.",
              "Credit Cards accepted"
            ].map((adv, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-yellow-500">•</span> {adv}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-white/10 pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Contacts</h2>
            <div className="text-gray-400">
                <p><strong>Dolphin Corp LLC</strong></p>
                <p>Euro House, Richmond Hill Road, Kingstown, St. Vincent and Grenadines</p>
                <p className="mt-2 text-yellow-500">support@bivaax.trade</p>
            </div>
        </section>
      </div>
    </div>
  );
}
