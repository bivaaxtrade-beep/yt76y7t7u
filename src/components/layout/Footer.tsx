import React from 'react';
import NewsletterForm from '../NewsletterForm';

export default function Footer() {
  return (
    <footer className="bg-[#101115] border-t border-white/5 py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        <div className="flex-1">
          <h2 className="text-white font-black text-xl mb-4">Bivaax</h2>
          <p className="text-gray-500 text-sm max-w-xs">
            Dynamic Range Trading and advanced market insights for professional traders.
          </p>
        </div>
        <div className="flex-1">
          <NewsletterForm />
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-gray-500 text-sm text-center">
        © {new Date().getFullYear()} Bivaax. All rights reserved.
      </div>
    </footer>
  );
}
