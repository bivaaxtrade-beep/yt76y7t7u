import fs from 'fs';
let code = fs.readFileSync('src/pages/TradeTerminal.tsx', 'utf8');

const target = `        {/* REAL-TIME NEWS MARQUEE */}
        {realtimeNews && realtimeNews.length > 0 && (
          <div className="bg-[#1a1b1f] text-[#a6aeb9] text-[11px] py-1 px-4 font-mono z-50 flex items-center border-b border-white/5 overflow-hidden whitespace-nowrap hidden md:flex shrink-0">
            <span className="text-[#FFE24C] font-bold mr-4 shrink-0 uppercase tracking-wider flex items-center gap-1.5">
              <Megaphone size={12} fill="currentColor" /> MARKET NEWS
            </span>
            <div className="flex whitespace-nowrap overflow-hidden flex-1 relative">
               <motion.div 
                 animate={{ x: [0, -2000] }} 
                 transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                 className="flex gap-16 shrink-0"
               >
                 {realtimeNews.map((newsItem: any, idx: number) => (
                    <span key={\`news-once-marquee-\${idx}-\${newsItem.id || 'noid'}\`} className="hover:text-white transition-colors cursor-pointer flex items-center" onClick={() => window.open(newsItem.url, '_blank')}>
                     <span className="text-[#309cf4] mr-2">[{newsItem.source_info?.name || 'Crypto'}]</span>
                     {newsItem.title}
                   </span>
                 ))}
                 
                 {/* Duplicate items for infinite marquee */}
                 {realtimeNews.map((newsItem: any, idx: number) => (
                  <span key={\`news-dup-marquee-\${idx}-\${newsItem.id || 'noid'}\`} className="hover:text-white transition-colors cursor-pointer flex items-center" onClick={() => window.open(newsItem.url, '_blank')}>
                     <span className="text-[#309cf4] mr-2">[{newsItem.source_info?.name || 'Crypto'}]</span>
                     {newsItem.title}
                   </span>
                 ))}
               </motion.div>
               
               {/* Gradients for smooth fade at edges */}
               <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#1a1b1f] to-transparent z-10 pointer-events-none"></div>
               <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#1a1b1f] to-transparent z-10 pointer-events-none"></div>
            </div>
          </div>
        )}`;

if (code.includes(target)) {
  code = code.replace(target, '');
  fs.writeFileSync('src/pages/TradeTerminal.tsx', code);
  console.log("Success!");
} else {
  console.log("Target not found!");
}
