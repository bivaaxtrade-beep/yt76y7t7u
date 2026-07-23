import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function MarketTicker() {
  const [news, setNews] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && Array.isArray(data.news)) setNews(data.news); })
      .catch(err => console.error("Failed to fetch news:", err));
  }, []);

  if (news.length === 0) return null;

  return (
    <div className="w-full bg-[#111111] border-y border-white/10 py-3 overflow-hidden">
      <motion.div 
        className="flex gap-16 whitespace-nowrap"
        initial={{ x: '100%' }}
        animate={{ x: '-100%' }}
        transition={{ repeat: Infinity, duration: 150, ease: 'linear' }}
      >
        {[...news, ...news].map((headline, i) => (
          <span key={i} className="text-sm font-medium text-gray-400">
            • {headline}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
