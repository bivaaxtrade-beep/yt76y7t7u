const fs = require('fs');
let code = fs.readFileSync('src/pages/TradeTerminal.tsx', 'utf8');

// I will just replace the whole section starting from <aside to </aside> with the correct layout.
const startIndex = code.indexOf('<aside className="hidden md:flex w-[76px] bg-[#222329] flex-col border-r border-[#2C2D33] shrink-0 z-50">');
const endIndex = code.indexOf('</aside>', startIndex) + '</aside>'.length;

const correctAside = `<aside className="hidden md:flex w-[76px] bg-[#222329] flex-col border-r border-[#2C2D33] shrink-0 z-50">
        <div className="flex flex-col items-center py-4 border-b border-[#2C2D33] cursor-pointer" onClick={() => setShowSidebar(!showSidebar)}>
            <Menu size={26} className="text-[#a6aeb9] hover:text-white transition-colors" strokeWidth={2} />
        </div>
        
        <div className="flex-1 flex flex-col pt-3 pb-2 gap-[18px] px-1 overflow-y-auto scrollbar-hide items-center">
          {[
            { icon: Icons.Package, label: "Activities", tab: "activities" },
            { icon: Clock, label: "Trades", tab: "history" },
            { icon: Icons.Briefcase, label: "Market", tab: "market" },
            { icon: Icons.Users, label: "Copy trading", onClick: () => navigate('/copytrading') },
            { icon: Icons.Trophy, label: "Ball Rush", tab: "ball-rush" },
          ].map((item, idx) => {
            const isActive = activeTab === item.tab || (item.tab === 'history' && activeTab === 'trade'); // highlight trades if active
            return (
            <button
              key={\`desktop-sidebar-\${item.label}\`}
              onClick={() => {
                if ('onClick' in item && typeof item.onClick === 'function') {
                  item.onClick();
                } else if ('tab' in item) {
                  setActiveTab(item.tab);
                }
              }}
              className={\`w-full flex flex-col items-center justify-center group relative \${('tab' in item && activeTab === item.tab) ? "text-[#309cf4]" : "text-[#a6aeb9] hover:text-white transition-colors"}\`}
            >
              <div className="relative flex flex-col items-center">
                 <item.icon size={22} strokeWidth={isActive ? 2 : 1.5} className="mb-1.5" />
                 {item.hasDot && (
                    <div className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-[#f44336] rounded-full border-[1.5px] border-[#222329]"></div>
                 )}
                 {('tab' in item) && (item.tab === 'history' || item.tab === 'education') && visibleActiveTrades.length > 0 && (
                    <div className="absolute -top-1.5 -right-2.5 bg-[#f44336] text-white text-[9px] font-black h-[17px] min-w-[17px] px-1 rounded-full flex items-center justify-center border border-[#222329] shadow-md animate-pulse">
                      {visibleActiveTrades.length}
                    </div>
                 )}
                 <span className={\`text-[10px] tracking-tight text-center leading-tight font-medium \${isActive ? "text-[#309cf4]" : "text-[#7b8390] group-hover:text-gray-300 transition-colors"}\`}>{item.label}</span>
              </div>
            </button>
          )})}
        </div>

        <div className="flex flex-col items-center gap-4 py-4 h-auto shrink-0 bg-[#222329] border-t border-[#2C2D33]">
            <button onClick={() => setShowLiveSupport(true)} className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-[#ff5252] to-[#d50000] flex items-center justify-center text-white shadow-[0_3px_10px_rgba(255,82,82,0.4)] cursor-pointer hover:scale-105 transition-all relative border border-[#ff8a80]">
                <Icons.MessageCircleQuestion size={24} className="text-white drop-shadow-md" strokeWidth={2} />
            </button>
            {/* Chat Support - Keep mounted but hidden to preserve state */}
            <div style={{ display: showLiveSupport ? 'block' : 'none' }}>
                <LiveSupport onClose={() => setShowLiveSupport(false)} />
            </div>
        </div>
      </aside>`;

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + correctAside + code.substring(endIndex);
  fs.writeFileSync('src/pages/TradeTerminal.tsx', code);
  console.log("Success!");
} else {
  console.log("Failed to find boundaries");
}
