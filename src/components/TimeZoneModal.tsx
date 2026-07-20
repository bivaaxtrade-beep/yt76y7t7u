import React, { useState, useMemo } from 'react';
import { Search, X, Clock, Check, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TimeZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTimeZone: string;
  onSelect: (tz: string) => void;
}

export const TimeZoneModal: React.FC<TimeZoneModalProps> = ({ isOpen, onClose, selectedTimeZone, onSelect }) => {
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(50);

  const timeZones = useMemo(() => {
    const zones = typeof Intl.supportedValuesOf === 'function' 
      ? Intl.supportedValuesOf('timeZone') 
      : ["UTC", "Asia/Dhaka", "America/New_York", "Europe/London", "America/Los_Angeles", "Europe/Paris", "Asia/Tokyo"];
    
    return zones.map(tz => {
      const now = new Date();
      let timeStr = "";
      let offset = "";
      try {
        timeStr = now.toLocaleTimeString("en-US", { 
          timeZone: tz, 
          hour: "2-digit", 
          minute: "2-digit", 
          hour12: true 
        });
        offset = now.toLocaleTimeString("en-US", { 
          timeZone: tz, 
          timeZoneName: "short" 
        }).split(' ').pop() || "";
      } catch (e) {
        timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
        offset = "UTC";
      }

      return {
        id: tz,
        label: tz.replace(/_/g, ' '),
        region: tz.split('/')[0],
        time: timeStr,
        offset: offset
      };
    });
  }, []);

  const filteredZones = useMemo(() => {
    if (!search) return timeZones;
    const s = search.toLowerCase();
    return timeZones.filter(tz => 
      tz.label.toLowerCase().includes(s) || 
      tz.id.toLowerCase().includes(s)
    );
  }, [search, timeZones]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (visibleCount < filteredZones.length) {
        setVisibleCount(prev => prev + 50);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex flex-col bg-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col w-full h-full bg-white"
          >
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Globe size={24} className="text-[#3b66f5]" />
                  Select Time Zone
                </h3>
                <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Current: {selectedTimeZone.replace(/_/g, ' ')}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 md:p-6 bg-white border-b border-gray-50">
              <div className="relative max-w-3xl mx-auto">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text"
                  placeholder="Search by city or country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-14 pr-4 text-gray-900 focus:outline-none focus:border-[#3b66f5] focus:ring-4 focus:ring-[#3b66f5]/10 transition-all font-bold text-lg placeholder:font-medium placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* List */}
            <div 
              className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50"
              onScroll={handleScroll}
            >
              <div className="max-w-3xl mx-auto">
                {filteredZones.length === 0 ? (
                  <div className="py-20 text-center text-gray-500">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Search size={32} className="text-gray-300" />
                    </div>
                    <p className="font-black text-xl text-gray-900 mb-2">No results found</p>
                    <p className="text-sm font-medium">Try searching for a different city</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredZones.slice(0, visibleCount).map((tz) => (
                      <button
                        key={tz.id}
                        onClick={() => {
                          onSelect(tz.id);
                          onClose();
                        }}
                        className={`flex items-center justify-between p-4 md:p-5 rounded-2xl transition-all group shadow-sm hover:shadow-md ${
                          selectedTimeZone === tz.id 
                            ? 'bg-blue-50 border-2 border-[#3b66f5]' 
                            : 'bg-white border-2 border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                            selectedTimeZone === tz.id ? 'bg-[#3b66f5] text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-[#3b66f5] group-hover:text-white'
                          }`}>
                            <Clock size={24} />
                          </div>
                          <div>
                            <p className={`font-black text-[16px] md:text-[18px] tracking-tight mb-1 ${selectedTimeZone === tz.id ? 'text-[#3b66f5]' : 'text-gray-900'}`}>
                              {tz.label}
                            </p>
                            <p className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider">{tz.region} • {tz.offset}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                          <p className={`text-base md:text-lg font-black tracking-tighter tabular-nums ${selectedTimeZone === tz.id ? 'text-[#3b66f5]' : 'text-gray-900'}`}>
                            {tz.time}
                          </p>
                          {selectedTimeZone === tz.id && (
                            <div className="bg-[#3b66f5] rounded-full p-1 shadow-md shadow-blue-500/20">
                              <Check size={14} className="text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
