import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Copy, 
  ExternalLink, 
  BarChart3, 
  Wallet, 
  HelpCircle, 
  MessageSquare, 
  Menu,
  ChevronDown,
  Calendar,
  MousePointer2,
  Plus,
  UserPlus,
  ArrowRight,
  ChevronRight,
  Edit3,
  Info,
  Zap,
  History,
  X,
  Activity,
  Award,
  Trophy,
  Check,
  CheckCircle2,
  Clock,
  Calculator,
  Bell,
  Settings,
  Globe,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Gift,
  Briefcase,
  Link,
  Image,
  Undo2,
  CreditCard,
  User,
  Bot,
  Headphones,
  LayoutDashboard,
  Banknote,
  AlertTriangle,
  ShieldAlert,
  Send,
  Trash2
} from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot, doc, getDoc, updateDoc, increment, addDoc, deleteDoc } from '../firebase';
import toast from 'react-hot-toast';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import SEO from '../components/SEO';


const StatCard = ({ title, value, subtext, color = "blue", icon: Icon }: { title: string, value: string | number, subtext: string, color?: string, icon?: any }) => {
  const colorMap: Record<string, string> = {
    blue: "border-blue-500/20 text-blue-400 bg-[#15171e]/50",
    green: "border-emerald-500/20 text-emerald-400 bg-[#15171e]/50",
    purple: "border-indigo-500/20 text-indigo-400 bg-[#15171e]/50",
    orange: "border-orange-500/20 text-orange-400 bg-[#15171e]/50",
    cyan: "border-cyan-500/20 text-cyan-400 bg-[#15171e]/50"
  };

  return (
    <div className={`rounded-[32px] p-8 border ${colorMap[color] || colorMap.blue} backdrop-blur-sm shadow-2xl hover:border-white/20 transition-all duration-500 group relative overflow-hidden`}>
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-gray-500 font-black text-[10px] uppercase tracking-[0.3em] leading-tight">{title}</h3>
        <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 ${colorMap[color].split(' ')[1]}`}>
          {Icon && <Icon size={18} strokeWidth={2.5} />}
        </div>
      </div>
      <div>
        <div className="text-[36px] font-black text-white leading-none mb-3 tracking-tighter tabular-nums">{value}</div>
        <div className="flex items-center gap-2">
           <div className="w-1 h-1 rounded-full bg-current opacity-40"></div>
           <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{subtext}</span>
        </div>
      </div>
    </div>
  );
};

const FastLink = ({ icon: Icon, title, iconColor, bgColor, onClick }: { icon: any, title: string, iconColor: string, bgColor: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`bg-[#15171e]/50 hover:bg-[#1a1c25] transition-all rounded-[40px] p-8 md:p-10 flex flex-col items-start gap-5 text-left group h-full shadow-2xl border border-white/5 hover:border-white/10 relative overflow-hidden`}
  >
    <div className="absolute -right-8 -bottom-8 text-white/5 group-hover:text-white/10 transition-colors pointer-events-none">
       <Icon size={160} strokeWidth={1} />
    </div>
    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center bg-white/5 shadow-xl border border-white/5 transition-transform group-hover:scale-110 group-active:scale-95 duration-500 mb-2 z-10`}>
      <Icon className={iconColor} size={32} strokeWidth={2.5} />
    </div>
    <div className="z-10">
      <span className={`text-[20px] md:text-[24px] font-black tracking-tighter text-white block mb-1 group-hover:${iconColor} transition-colors`}>{title}</span>
      <div className="flex items-center gap-2">
         <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Launch Terminal</span>
         <ArrowRight size={12} strokeWidth={3} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </button>
);

const SectionHeading = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex flex-col gap-2 mb-12">
     <div className="flex items-center gap-5">
       <div className="w-14 h-14 flex items-center justify-center bg-[#ffcf00] rounded-2xl text-black shadow-2xl shadow-[#ffcf00]/10">
         <Icon size={28} strokeWidth={2.5} />
       </div>
       <div>
         <h2 className="text-[32px] font-black tracking-tighter text-[#1a2233] leading-none mb-1">{title}</h2>
         <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.25em] ml-0.5">{desc}</p>
       </div>
     </div>
  </div>
);

const BivaaxSidebar = ({ isOpen, onClose, activeTab, onTabChange, initials }: any) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-[110] lg:hidden"
        />
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 left-0 w-[280px] bg-[#1a2233] text-white z-[120] flex flex-col shadow-2xl"
        >
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b66f5] rounded-xl flex items-center justify-center font-bold text-xl">B</div>
              <div>
                <div className="text-lg font-bold leading-none">Bivaax</div>
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">Affiliate center</div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors lg:hidden">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
            {menuItems.map((item: any) => (
              <button 
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                  activeTab === item.id 
                    ? 'bg-[#3b66f5] text-white shadow-lg shadow-blue-900/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} strokeWidth={item.id === activeTab ? 2.5 : 2} />
                  <span className="text-[15px] font-semibold">{item.label}</span>
                </div>
                {item.isNew && (
                  <span className="bg-[#10b981] text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">New</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6 border-t border-white/5 space-y-4">
            <button className="flex items-center gap-4 px-4 py-3 w-full text-gray-400 hover:text-white transition-colors">
              <Globe size={20} />
              <span className="text-[15px] font-semibold">English</span>
            </button>
            <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl">
              <div className="w-9 h-9 rounded-full bg-[#dbeafe] text-[#3b82f6] flex items-center justify-center font-bold text-sm">
                {initials}
              </div>
              <div className="text-sm font-bold text-white truncate">Profile Settings</div>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const BivaaxHeader = ({ email, initials, onMenuClick }: { email: string, initials: string, onMenuClick: () => void }) => (
  <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-[100] shadow-sm">
    <div className="flex items-center gap-4">
      <button onClick={onMenuClick} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
        <Menu size={24} className="text-gray-500" />
      </button>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end mr-1">
        <span className="text-[13px] font-bold text-[#1a2233] leading-none mb-1">
          {email.length > 20 ? `${email.substring(0, 3)}***${email.split('@')[0].slice(-1)}@${email.split('@')[1]}` : email}
        </span>
      </div>
      <div className="w-9 h-9 rounded-full bg-[#dbeafe] text-[#3b82f6] flex items-center justify-center font-bold text-sm shadow-sm">
        {initials}
      </div>
    </div>
  </header>
);

const BivaaxBalanceCard = ({ availableBalance, heldBalance, onPaymentClick }: { availableBalance: number, heldBalance: number, onPaymentClick: () => void }) => (
  <div className="bg-[#1a2233] rounded-[24px] p-7 md:p-8 text-white shadow-xl relative overflow-hidden">
    <div className="relative z-10">
      <span className="text-sm font-medium text-gray-400 opacity-90 mb-2 block">Available to withdraw</span>
      <div className="text-[48px] font-bold mb-8 leading-none tracking-tight">${availableBalance.toFixed(2)}</div>
      <button 
        onClick={onPaymentClick}
        className="w-full bg-[#3b66f5] hover:bg-[#3256d1] transition-all py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95"
      >
        <Wallet size={20} />
        Withdraw Available
      </button>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/5">
           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Held (1 week)</span>
           <span className="text-sm font-bold text-white">${heldBalance.toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>
);

const BivaaxStatCard = ({ label, values, icon: Icon, timeRange = "This week" }: any) => (
  <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
          <Icon size={20} />
        </div>
        <span className="text-base font-bold text-[#1a2233]">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 cursor-pointer">
        {timeRange} <ChevronDown size={10} strokeWidth={3} />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-6">
      {values.map((v: any, i: number) => (
        <div key={i} className="space-y-1">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">{v.label}</div>
          <div className="text-[20px] font-bold text-[#1a2233] tracking-tight">{v.val}</div>
        </div>
      ))}
    </div>
  </div>
);

const BivaaxLinkCard = ({ links, onCopy, onCreate }: any) => (
  <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-base font-bold text-[#1a2233] tracking-tight">Links to attract traders</h3>
      <button onClick={onCreate} className="flex items-center gap-1.5 text-[13px] font-bold text-[#3b66f5] hover:opacity-80 transition-opacity">
        <Plus size={18} />
        Create new link
      </button>
    </div>
    <div className="space-y-5">
      {links.map((link: any, i: number) => (
        <div key={i} className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">ID #{link.id} - {link.name}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
          <div className="flex items-center gap-3 bg-[#f8f9fb] border border-gray-100 rounded-2xl px-5 py-4 transition-all hover:bg-[#f0f2f5]">
            <div className="flex-1 text-[13px] font-bold text-gray-700 truncate tracking-tight">{link.url}</div>
            <button onClick={() => onCopy(link.url)} className="p-2 text-[#3b66f5] hover:bg-blue-50 rounded-xl transition-all active:scale-90">
              <Copy size={20} />
            </button>
          </div>
        </div>
      ))}
      <button className="flex items-center gap-2 text-[13px] font-bold text-[#3b66f5] pt-2 group">
        <ExternalLink size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        View all links
      </button>
    </div>
  </div>
);

const BivaaxProgramCard = ({ title, level, rate, nextLevel, progress, progressText }: any) => (
  <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
    <h3 className="text-base font-bold text-[#1a2233] mb-6 tracking-tight">{title}</h3>
    <div className="grid grid-cols-2 gap-4 mb-5">
      <div className="bg-[#f8f9fb] rounded-2xl p-4 border border-gray-100">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Current Level</span>
        <span className="text-[17px] font-bold text-[#1a2233]">{level}</span>
      </div>
      <div className="bg-[#f8f9fb] rounded-2xl p-4 border border-gray-100">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Rate</span>
        <span className="text-[17px] font-bold text-[#1a2233]">{rate}</span>
      </div>
    </div>
    <div className="bg-[#f8f9fb] rounded-[24px] p-5 border border-gray-100">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Next Level</span>
      <span className="text-[17px] font-bold text-[#1a2233]">{nextLevel}</span>
      <div className="mt-5">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">{progressText}</div>
        <div className="h-2.5 bg-white rounded-full overflow-hidden border border-gray-100">
          <div 
            className="h-full bg-[#34c759] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(52,199,89,0.3)]" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[10px] font-black text-[#34c759] text-center mt-3 uppercase tracking-widest">{Math.floor(progress)} of 30 FTD</div>
      </div>
    </div>
  </div>
);

const AffiliateAnalytics = ({ referrals, commissions, affiliateBalance }: any) => {
  const currency = '$';
  const data = [
    { name: 'Directs', value: referrals.length, label: 'Total Referrals', color: '#ffcf00' },
    { name: 'Active', value: referrals.filter((r: any) => (r.tradeVolume || 0) > 0).length, label: 'Live Users', color: '#10b981' },
    { name: 'Locked', value: Number(affiliateBalance.toFixed(2)), label: `Pending ${currency}`, color: '#6366f1' }
  ];

  return (
    <div className="bg-[#15171e]/30 backdrop-blur-xl rounded-[48px] p-8 md:p-12 border border-white/5 shadow-3xl relative overflow-hidden h-full">
      <SectionHeading icon={BarChart3} title="Performance Index" desc="Ecosystem revenue & growth metrics" />
      
      <div className="h-[300px] md:h-[350px] w-full mt-12 md:mt-16">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#4b5563', fontSize: 11, fontWeight: 900}} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#4b5563', fontSize: 10, fontWeight: 700}} 
            />
            <Tooltip 
               cursor={{fill: 'rgba(255,255,255,0.02)'}}
               content={({ active, payload }) => {
                 if (active && payload && payload.length) {
                   const item = payload[0].payload;
                   return (
                     <div className="bg-[#1c1d22] p-8 rounded-[32px] shadow-3xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-3">{item.label}</p>
                       <div className="flex items-center gap-4">
                          <div className="w-2.5 h-8 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <p className="text-[32px] font-black text-white leading-none tracking-tighter tabular-nums">
                             {item.name === 'Locked' ? `${currency}${item.value}` : item.value}
                          </p>
                       </div>
                     </div>
                   );
                 }
                 return null;
               }}
            />
            <Bar dataKey="value" radius={[16, 16, 0, 0]} barSize={80}>
              {data.map((entry, index) => (
                <Cell key={`cell-analytics-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-8 pt-12 border-t border-white/5">
         {data.map((item, idx) => (
            <div key={`summary-item-${idx}`} className="space-y-2">
               <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{item.name}</div>
               <div className="text-[18px] font-black text-white tabular-nums tracking-tight">{item.name === 'Locked' ? `${currency}${item.value}` : item.value}</div>
            </div>
         ))}
      </div>
    </div>
  );
};


const EXCHANGE_RATES: Record<string, number> = {
  '৳': 1.0,      // BDT (Base)
  '$': 0.00833,  // 1/120 (USD)
  '€': 0.00769   // 1/130 (EUR)
};

const getConvertedBalance = (val: number, curr: string) => {
  const rate = EXCHANGE_RATES[curr] || 1.0;
  return val * rate;
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'promo-perks', label: 'Promo Perks', icon: Gift, isNew: true },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'offers', label: 'Offers', icon: Briefcase },
  { id: 'links', label: 'Links', icon: Link },
  { id: 'promo', label: 'Promo', icon: Image },
  { id: 'postbacks', label: 'Postbacks', icon: Undo2 },
  { id: 'payouts', label: 'Payments', icon: CreditCard },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'partner-bot', label: 'Partner Bot', icon: Bot, isNew: true },
  { id: 'rules', label: 'Rules', icon: ShieldAlert },
  { id: 'support', label: 'Support', icon: Headphones },
];

export default function AffiliatePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const userCurrency = '$';
  const [activeTab, setActiveTab] = useState<'dashboard' | 'promo-perks' | 'statistics' | 'offers' | 'links' | 'promo' | 'postbacks' | 'payouts' | 'profile' | 'partner-bot' | 'support' | 'support-detail' | 'rules' | 'sub-affiliates'>('dashboard');
  const [subAffiliates, setSubAffiliates] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<{ id: string, name: string, subId: string }[]>([]);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignSubId, setNewCampaignSubId] = useState('');
  const [newCampaignType, setNewCampaignType] = useState('revshare');
  const [selectedLandingPage, setSelectedLandingPage] = useState('/');

  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutGateway, setPayoutGateway] = useState('USDT (TRC-20)');
  const [payoutDetails, setPayoutDetails] = useState({
    mobileNumber: '',
    walletAddress: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountName: '',
  });
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [customAffShare, setCustomAffShare] = useState<number | null>(null);
  const [affId, setAffId] = useState<string | number>('');
  const [impressions, setImpressions] = useState(0);

  const [campaignTab, setCampaignTab] = useState<'live' | 'archived'>('live');
  const [postbacks, setPostbacks] = useState<any[]>([]);
  const [isAddingPostback, setIsAddingPostback] = useState(false);
  const [showAddPostback, setShowAddPostback] = useState(false);
  const [newPostback, setNewPostback] = useState({ name: '', url: '', event: 'registration', method: 'GET' });


  const referralCode = affId || ((currentUser?.uid ? String(currentUser.uid).substring(0, 5).toUpperCase() : 'USER') + Math.floor(Math.random() * 1000 + 1000));
  const referralLink = `${window.location.protocol}//${window.location.host}?ref=${referralCode}`;

  const addCampaign = async () => {
    if (!currentUser) return;
    if (!newCampaignName || !newCampaignSubId) return toast.error('Enter campaign details');
    
    // Check for duplicate subId
    const isDuplicate = campaigns.some(c => c.subId.toLowerCase() === newCampaignSubId.trim().toLowerCase());
    if (isDuplicate) return toast.error('This Sub-ID already exists!');

    try {
      await addDoc(collection(db, 'affiliate_campaigns'), {
        userId: currentUser.uid,
        name: newCampaignName,
        subId: newCampaignSubId.trim(),
        linkType: newCampaignType,
        landingPage: selectedLandingPage,
        isArchived: false,
        createdAt: new Date()
      });
      setNewCampaignName('');
      setNewCampaignSubId('');
      setNewCampaignType('revshare');
      toast.success('Campaign successfully created and saved!');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to save campaign: ' + error.message);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'affiliate_campaigns', id));
      toast.success('Campaign removed');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to remove campaign');
    }
  };

  const getCampaignLink = (subId: string, landingPage: string = '/', linkType: string = 'revshare') => {
    const base = window.location.origin + (landingPage === '/' ? '' : landingPage);
    const connector = base.includes('?') ? '&' : '?';
    return `${base}${connector}ref=${referralCode}&sub=${subId}&type=${linkType}`;
  };
  const [balance, setBalance] = useState(0.00);
  const [affiliateBalance, setAffiliateBalance] = useState(0.00);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [appConfig, setAppConfig] = useState<any>({});
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcValues, setCalcValues] = useState({ referrals: 10, volumePerRef: 1000 });

  const [promoMaterials, setPromoMaterials] = useState<any[]>([]);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [ticketReply, setTicketReply] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");

  // Partner Bot State
  const [botMessages, setBotMessages] = useState<{sender: 'bot' | 'user', text: string, time: number}[]>([
    { sender: 'bot', text: 'Hello! I am your Partner Bot. How can I help you today? Try typing /stats, /signals, or /link.', time: Date.now() }
  ]);
  const [botInput, setBotInput] = useState('');
  const botEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (botEndRef.current) {
       botEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [botMessages]);

  const handleBotSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!botInput.trim()) return;

    const userText = botInput.trim();
    const newMsgs: {sender: 'bot' | 'user', text: string, time: number}[] = [...botMessages, { sender: 'user', text: userText, time: Date.now() }];
    setBotMessages(newMsgs);
    setBotInput('');
    setIsBotTyping(true);

    // Simulate bot response
    setTimeout(() => {
       let reply = "I didn't understand that command. Try /stats, /signals, or /link.";
       const lower = userText.toLowerCase();
       if (lower.includes('/stats')) {
          reply = `📊 Your Stats:\nClicks: ${impressions}\nRegistrations: ${stats.leads}\nFTD: ${stats.conversions}\nProfit: $${getConvertedBalance(affiliateBalance, '$').toFixed(2)}`;
       } else if (lower.includes('/signals')) {
          reply = "🚀 Signal Alert: BUY EUR/USD at 1.0950\nTarget: 1.0980\nStop: 1.0930\nValid for 15 mins.";
       } else if (lower.includes('/link')) {
          reply = `🔗 Your Affiliate Link:\n${referralLink}`;
       } else if (lower.includes('hello') || lower.includes('hi')) {
          reply = "Hello! Type /stats for your statistics or /signals for trading signals.";
       }
       setIsBotTyping(false);
       setBotMessages(prev => [...prev, { sender: 'bot', text: reply, time: Date.now() }]);
    }, 600);
  };

  useEffect(() => {
    if (!currentUser) return;

    // Listen for current user balance
    const userUnsub = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
       if (snap.exists()) {
          const userData = snap.data();
          setBalance(userData.balance || 0);
          setAffiliateBalance(userData.affiliateBalance || 0);
          // if (userData.currency) setUserCurrency(userData.currency);
          setCustomAffShare(userData.customAffiliateShare || null);
          if (userData.affiliateId) {
             setAffId(userData.affiliateId);
          } else {
             // Retroactively assign numeric ID for old users
             import('../lib/affiliate').then(async ({ getNextAffiliateId }) => {
                 try {
                     const newId = await getNextAffiliateId();
                     await updateDoc(doc(db, 'users', currentUser.uid), { affiliateId: newId });
                     setAffId(newId);
                 } catch (e) {
                     console.error("Failed to retroactively give affiliate ID", e);
                 }
             });
          }
          setImpressions(userData.impressions || 0);
       }
    }, (error) => {
       if (auth.currentUser) {
         handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
       }
    });

    // Fetch real referrals stats
    // We try to match by referredBy (numeric code) or referredByUid (UID)
    const q = query(collection(db, 'users'), where('referredByUid', '==', currentUser.uid), limit(50));
    const referUnsub = onSnapshot(q, (snap) => {
       const list = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
       }));
       // Sort client-side by createdAt desc
       list.sort((a: any, b: any) => {
          const tA = (a.createdAt && typeof a.createdAt.toDate === 'function') ? a.createdAt.toDate().getTime() : (a.createdAt || 0);
          const tB = (b.createdAt && typeof b.createdAt.toDate === 'function') ? b.createdAt.toDate().getTime() : (b.createdAt || 0);
          return tB - tA;
       });
       setReferrals(list);
       setLoadingStats(false);
    }, (error) => {
       if (auth.currentUser) {
         handleFirestoreError(error, OperationType.GET, 'users');
       }
    });

    const unsubConfig = onSnapshot(doc(db, 'app_config', 'settings'), (docSnap) => {
        if (docSnap.exists()) setAppConfig(docSnap.data());
    }, (error) => {
       if (auth.currentUser) {
         handleFirestoreError(error, OperationType.GET, 'app_config/settings');
       }
    });

    const unsubPromo = onSnapshot(collection(db, 'promoMaterials'), (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (list.length === 0) {
           setPromoMaterials([
              { id: 'm1', label: 'Global Leader Banner', size: '1080 x 1080', color: 'bg-indigo-600' },
              { id: 'm2', label: 'Pro Trading Hub', size: '1200 x 628', color: 'bg-emerald-600' },
              { id: 'm3', label: 'Trust & Security', size: '728 x 90', color: 'bg-rose-600' }
           ]);
        } else {
           setPromoMaterials(list);
        }
    }, (error) => {
       if (auth.currentUser) {
         handleFirestoreError(error, OperationType.GET, 'promoMaterials');
       }
    });

    const unsubCampaigns = onSnapshot(
      query(collection(db, 'affiliate_campaigns'), where('userId', '==', currentUser.uid)),
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        if (list.length === 0) {
          setCampaigns([{ id: 'default', name: 'Main Campaign', subId: 'default' }]);
        } else {
          setCampaigns(list);
        }
      },
      (error) => {
        if (auth.currentUser) {
          handleFirestoreError(error, OperationType.GET, 'affiliate_campaigns');
        }
      }
    );

    const unsubPostbacks = onSnapshot(
      query(collection(db, 'affiliate_postbacks'), where('userId', '==', currentUser.uid)),
      (snap) => {
        setPostbacks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (error) => {
        if (auth.currentUser) {
          handleFirestoreError(error, OperationType.GET, 'affiliate_postbacks');
        }
      }
    );

    const unsubPayouts = onSnapshot(
      query(collection(db, 'affiliate_payouts'), where('userId', '==', currentUser.uid)),
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a: any, b: any) => {
          const tA = (a.createdAt && typeof a.createdAt.toDate === 'function') ? a.createdAt.toDate().getTime() : (a.createdAt || 0);
          const tB = (b.createdAt && typeof b.createdAt.toDate === 'function') ? b.createdAt.toDate().getTime() : (b.createdAt || 0);
          return tB - tA;
        });
        setPayoutRequests(list);
      },
      (error) => {
        if (auth.currentUser) {
          handleFirestoreError(error, OperationType.GET, 'affiliate_payouts');
        }
      }
    );

    const unsubTickets = onSnapshot(query(collection(db, 'tickets'), where('userId', '==', currentUser.uid)), (snap) => {
      const tickets = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      tickets.sort((a: any, b: any) => {
        const tA = (a.updatedAt && typeof a.updatedAt.toDate === 'function') ? a.updatedAt.toDate().getTime() : (a.updatedAt || 0);
        const tB = (b.updatedAt && typeof b.updatedAt.toDate === 'function') ? b.updatedAt.toDate().getTime() : (b.updatedAt || 0);
        return tB - tA;
      });
      setUserTickets(tickets);
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, 'tickets');
      }
    });

    const unsubCommissions = onSnapshot(
      query(collection(db, 'affiliate_commissions'), where('referrerUid', '==', currentUser.uid)),
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a: any, b: any) => {
          const tA = (a.createdAt && typeof a.createdAt.toDate === 'function') ? a.createdAt.toDate().getTime() : (a.createdAt || 0);
          const tB = (b.createdAt && typeof b.createdAt.toDate === 'function') ? b.createdAt.toDate().getTime() : (b.createdAt || 0);
          return tB - tA;
        });
        setCommissions(list.slice(0, 50)); // Last 50 commissions
      },
      (error) => {
        if (auth.currentUser) {
          handleFirestoreError(error, OperationType.GET, 'affiliate_commissions');
        }
      }
    );

    return () => {
       userUnsub();
       referUnsub();
       unsubConfig();
       unsubPromo();
       unsubCampaigns();
       unsubPostbacks();
       unsubPayouts();
       unsubTickets();
       unsubCommissions();
    };
  }, [currentUser]);

  useEffect(() => {
    if (selectedTicket) {
      const unsub = onSnapshot(query(collection(db, 'tickets', selectedTicket.id, 'messages'), orderBy('createdAt', 'asc')), (snap) => {
        setTicketMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsub();
    }
  }, [selectedTicket]);

  const getAIReply = async (ticketId: string, message: string) => {
    if (selectedTicket?.aiDisabled) return;
    setIsBotTyping(true);
    try {
      const res = await fetch('/api/support/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      let aiReply = "I'm sorry, I am having trouble processing your request. Please wait for a human representative.";
      if (res.ok) {
        const data = await res.json();
        if (data.reply) aiReply = data.reply;
      } else {
        return;
      }
      
      const lowerMsg = message.toLowerCase();
      const needsEscalation = lowerMsg.includes('agent') || lowerMsg.includes('representative');

      await addDoc(collection(db, 'tickets', ticketId, 'messages'), {
        senderId: 'ai-bot',
        senderName: 'Support Bot',
        senderType: 'support',
        text: aiReply,
        createdAt: Date.now()
      });

      await updateDoc(doc(db, 'tickets', ticketId), {
        lastMessage: aiReply,
        updatedAt: Date.now(),
        ...(needsEscalation ? { aiDisabled: true, status: 'pending' } : {})
      });
    } catch (e) {
      console.error("AI reply failed:", e);
    } finally {
      setIsBotTyping(false);
    }
  };

  const createSupportTicket = async (subject: string, message: string) => {
    if (!currentUser) {
      toast.error("Please log in to contact support");
      return;
    }
    try {
      const ticketRef = await addDoc(collection(db, 'tickets'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || "Partner",
        subject: subject,
        status: 'open',
        priority: 'medium',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        category: 'affiliate'
      });

      const ticketId = ticketRef.id;
      await addDoc(collection(db, 'tickets', ticketId, 'messages'), {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.split('@')[0] || "Partner",
        senderType: 'user',
        text: message,
        createdAt: Date.now()
      });

      toast.success("Support ticket created!");
      getAIReply(ticketId, message);
      return ticketId;
    } catch (e) {
      console.error("Error creating ticket:", e);
      toast.error("Failed to create ticket");
    }
  };

  const sendTicketMessage = async () => {
    if (!selectedTicket || !ticketReply.trim() || !currentUser) return;
    const tid = selectedTicket.id;
    try {
      await addDoc(collection(db, 'tickets', tid, 'messages'), {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.split('@')[0] || "Partner",
        senderType: 'user',
        text: ticketReply,
        createdAt: Date.now()
      });
      
      await updateDoc(doc(db, 'tickets', tid), {
        lastMessage: ticketReply,
        updatedAt: Date.now()
      });

      const msg = ticketReply;
      setTicketReply("");
      getAIReply(tid, msg);
    } catch (e) {
      console.error("Error sending message:", e);
      toast.error("Failed to send message");
    }
  };

  const now = Date.now();
  const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
  
  const availableCommissions = commissions.filter(c => {
     const commissionDate = (c.createdAt && typeof c.createdAt.toDate === 'function') ? c.createdAt.toDate().getTime() : (c.createdAt || 0);
     return (now - commissionDate) >= oneWeekInMs;
  });
  
  const heldCommissions = commissions.filter(c => {
     const commissionDate = (c.createdAt && typeof c.createdAt.toDate === 'function') ? c.createdAt.toDate().getTime() : (c.createdAt || 0);
     return (now - commissionDate) < oneWeekInMs;
  });

  const availableBalance = availableCommissions.reduce((acc, c) => acc + (c.amount || 0), 0);
  const heldBalance = heldCommissions.reduce((acc, c) => acc + (c.amount || 0), 0);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    toast.success('Affiliate link copied!', {
      style: { border: '1px solid #10b981', padding: '16px', color: '#10b981', background: '#fff' }
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleTransferEarnings = async () => {
    if (!currentUser) return;
    if (availableBalance < 1) {
      toast.error(`Minimum transfer amount is $1.00 (USDT)`);
      return;
    }
    const amountToTransfer = availableBalance;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        affiliateBalance: increment(-amountToTransfer),
        balance: increment(amountToTransfer)
      });
      toast.success(`Successfully transferred $${getConvertedBalance(amountToTransfer, '$').toFixed(2)} to Main Live Balance!`);
    } catch (error) {
      console.error(error);
      toast.error('Transfer failed. Please try again or contact support.');
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const amountNum = parseFloat(payoutAmount); // Input in USDT
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid payout amount');
      return;
    }

    const amountInBase = amountNum / EXCHANGE_RATES['$']; // Convert USDT to BDT base

    if (amountInBase > affiliateBalance) {
      toast.error('Insufficient affiliate balance');
      return;
    }

    const minAmountUSDT = 10;
    if (amountNum < minAmountUSDT) {
      toast.error(`Minimum payout withdrawal amount is $${minAmountUSDT.toFixed(2)} (USDT)`);
      return;
    }

    // Strictly enforce USDT TRC-20 for affiliate payouts
    if (payoutGateway !== 'USDT (TRC-20)') {
      toast.error('Only USDT (TRC-20) is supported for partner payouts.');
      return;
    }

    if (!payoutDetails.walletAddress) {
      toast.error('Please enter your USDT TRC-20 Wallet Address');
      return;
    }
    const detailsStr = `USDT TRC-20: ${payoutDetails.walletAddress}`;

    setIsSubmittingPayout(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) throw new Error('User data profile not found');

      const liveAffBalance = userDoc.data().affiliateBalance || 0;
      if (amountNum > liveAffBalance) {
        toast.error('Insufficient affiliate balance (real-time check failed)');
        setIsSubmittingPayout(false);
        return;
      }

      // Add to payouts logs
      await addDoc(collection(db, 'affiliate_payouts'), {
        userId: currentUser.uid,
        email: currentUser.email || 'partner@bivaax.local',
        amount: amountNum,
        currency: '$',
        gateway: payoutGateway,
        details: detailsStr,
        status: 'pending',
        createdAt: new Date(),
        processedAt: null,
        rejectReason: null
      });

      // Deduct immediately to prevent double spend (using base currency)
      await updateDoc(userRef, {
        affiliateBalance: increment(-amountInBase)
      });

      toast.success('Your payout request has been queued! Processing normally takes under 2 hours.', {
        duration: 5000
      });
      setPayoutAmount('');
      setPayoutDetails({
        mobileNumber: '',
        walletAddress: '',
        bankName: '',
        branchName: '',
        accountNumber: '',
        accountName: '',
      });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to dispatch payout request: ' + err.message);
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const handleAddPostback = async () => {
    if (!currentUser) return;
    if (!newPostback.name || !newPostback.url) {
      toast.error('Name and URL are required for a postback.');
      return;
    }
    
    try {
      setIsAddingPostback(true);
      await addDoc(collection(db, 'affiliate_postbacks'), {
         userId: currentUser.uid,
         name: newPostback.name,
         url: newPostback.url,
         event: newPostback.event,
         method: newPostback.method,
         createdAt: new Date(),
         status: 'active'
      });
      toast.success('Postback created successfully!');
      setNewPostback({ name: '', url: '', event: 'registration', method: 'GET' });
      setShowAddPostback(false);
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to create postback: ' + e.message);
    } finally {
      setIsAddingPostback(false);
    }
  };

  const handleDeletePostback = async (id: string) => {
    try {
       await deleteDoc(doc(db, 'affiliate_postbacks', id));
       toast.success('Postback deleted.');
    } catch (e: any) {
       console.error(e);
       toast.error('Failed to delete postback.');
    }
  };

  const stats = {
     leads: referrals.length,
     conversions: referrals.filter(r => (r.balance || 0) > 0 || (r.demoBalance || 0) > 0).length,
     totalVolume: referrals.reduce((acc, r) => acc + (r.tradeVolume || 0), 0)
  };

  const getTier = () => {
    const count = stats.leads;
    if (count >= 201) return { name: 'Elite Master', share: appConfig.affiliate_share_elite || 80, color: 'text-amber-500', bg: 'bg-amber-500/10', next: null, icon: Trophy };
    if (count >= 51) return { name: 'VIP Partner', share: appConfig.affiliate_share_vip || 70, color: 'text-indigo-500', bg: 'bg-indigo-500/10', next: 201, icon: Star };
    if (count >= 11) return { name: 'Pro Partner', share: appConfig.affiliate_share_pro || 60, color: 'text-emerald-500', bg: 'bg-emerald-500/10', next: 51, icon: Zap };
    return { name: 'Starter', share: appConfig.affiliate_share_starter || 50, color: 'text-rose-500', bg: 'bg-rose-500/10', next: 11, icon: Activity };
  };

  const currentTier = getTier();
  const progressToNext = currentTier.next ? (stats.leads / currentTier.next) * 100 : 100;

  const Milestone = ({ title, requirement, bonus, isReached }: { title: string, requirement: string, bonus: string, isReached: boolean }) => (
    <div className={`p-5 rounded-3xl border transition-all ${isReached ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/5 opacity-50'}`}>
       <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isReached ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
             {isReached ? <CheckCircle2 size={20} /> : <Clock size={20} />}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${isReached ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'}`}>
             {isReached ? 'Unlocked' : 'Locked'}
          </span>
       </div>
       <h4 className="text-[15px] font-black text-white mb-1 tracking-tight">{title}</h4>
       <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">{requirement}</p>
       <div className="flex items-center gap-2 text-[12px] font-black text-emerald-400">
          <Award size={14} />
          {bonus}
       </div>
    </div>
  );

  const dynamicChartData = React.useMemo(() => {
    const last7Days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      
      const dayRegs = referrals.filter(r => {
        const regDate = (r.createdAt && typeof r.createdAt.toDate === 'function') ? r.createdAt.toDate() : new Date(r.createdAt || 0);
        return regDate.toDateString() === d.toDateString();
      }).length;

      last7Days.push({ 
        day: dateStr, 
        registrations: dayRegs,
        clicks: 0, 
        ftds: 0 
      });
    }
    return last7Days;
  }, [referrals]);

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-[#1a2233] font-sans selection:bg-[#3b66f5]/20 pb-24 lg:pb-0">
      <SEO title="Affiliate Program" description="Join the Bivaax Affiliate Program and earn high commissions." />
      <BivaaxSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        initials={currentUser?.email ? currentUser.email.substring(0, 2).toUpperCase() : "HA"}
      />
      <BivaaxHeader 
        email={currentUser?.email || "user@bivaax.trade"} 
        initials={currentUser?.email ? currentUser.email.substring(0, 2).toUpperCase() : "HA"}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        
        {activeTab === 'dashboard' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <h2 className="text-[26px] font-bold text-[#1a2233] tracking-tight px-1">Dashboard</h2>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                   <BivaaxBalanceCard 
                     availableBalance={availableBalance}
                     heldBalance={heldBalance}
                     onPaymentClick={() => setActiveTab('payouts')}
                   />
                   
                   <BivaaxLinkCard 
                     links={campaigns.length > 0 ? campaigns.slice(0, 1).map(c => ({
                        id: c.subId,
                        name: c.name,
                        url: getCampaignLink(c.subId, c.landingPage, c.linkType)
                     })) : [{ id: 'MAIN', name: 'Main Link', url: referralLink }]}
                     onCopy={(url: string) => {
                        navigator.clipboard.writeText(url);
                        toast.success('Link copied!');
                     }}
                     onCreate={() => setActiveTab('links')}
                   />
                </div>

                <div className="space-y-6">
                   <BivaaxProgramCard 
                     title="Revenue Share"
                     level={customAffShare >= 70 ? "PRO" : "Standard"}
                     rate={`${customAffShare || 80}%`}
                     nextLevel={customAffShare >= 70 ? "MAX" : "PRO"}
                     progress={stats.conversions > 0 ? Math.min((stats.conversions / 30) * 100, 100) : 0}
                     progressText="FTD UNTIL NEXT LEVEL"
                   />

                   <div className="grid grid-cols-1 gap-6">
                       <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                          <h3 className="text-base font-bold text-[#1a2233] mb-5 tracking-tight flex items-center justify-between">
                            Turnover Commission
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">Active</span>
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#f8f9fb] rounded-2xl p-4">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Max Potential</span>
                              <span className="text-[17px] font-bold text-[#1a2233]">5%</span>
                            </div>
                            <div className="bg-[#f8f9fb] rounded-2xl p-4">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Your Rate</span>
                              <span className="text-[17px] font-bold text-sky-600">5%</span>
                            </div>
                          </div>
                       </div>
                       
                       <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                          <h3 className="text-base font-bold text-[#1a2233] mb-5 tracking-tight flex items-center justify-between">
                            Sub-Affiliates
                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">Active</span>
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#f8f9fb] rounded-2xl p-4">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Network</span>
                              <span className="text-[17px] font-bold text-[#1a2233]">{stats.leads > 0 ? stats.leads : 0}</span>
                            </div>
                            <div className="bg-[#f8f9fb] rounded-2xl p-4">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Your Rate</span>
                              <span className="text-[17px] font-bold text-fuchsia-600">10%</span>
                            </div>
                          </div>
                       </div>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BivaaxStatCard 
                  label="Users"
                  icon={Users}
                  values={[
                    { label: 'Clicks', val: impressions },
                    { label: 'Registrations', val: stats.leads },
                    { label: 'FTD', val: stats.conversions }
                  ]}
                />

                <BivaaxStatCard 
                  label="Deposits"
                  icon={Wallet}
                  values={[
                    { label: 'Deposits', val: referrals.reduce((acc, r) => acc + (r.totalDeposits || 0), 0) },
                    { label: 'FTD Amount', val: `$${referrals.filter(r => (r.totalDeposits || 0) > 0).reduce((acc, r) => acc + (r.totalDeposits || 0), 0).toFixed(2)}` },
                    { label: 'Deposits Amount', val: `$${referrals.reduce((acc, r) => acc + (r.totalDeposits || 0), 0).toFixed(2)}` }
                  ]}
                />
             </div>

             <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-base font-bold text-[#1a2233]">This week</h3>
                  <button onClick={() => setActiveTab('statistics')} className="text-sm font-bold text-[#3b66f5]">All statistics</button>
                </div>
                <div className="flex items-center gap-4 mb-8">
                   <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#3b66f5]"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Clicks</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff9500]"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Registrations</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#34c759]"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">FTD</span>
                   </div>
                </div>
                <div className="h-[240px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dynamicChartData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                         <YAxis hide />
                         <Tooltip 
                            cursor={{fill: 'rgba(59, 102, 245, 0.05)'}}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                         />
                         <Bar dataKey="clicks" fill="#3b66f5" radius={[4, 4, 0, 0]} barSize={8} />
                         <Bar dataKey="registrations" fill="#ff9500" radius={[4, 4, 0, 0]} barSize={8} />
                         <Bar dataKey="ftds" fill="#34c759" radius={[4, 4, 0, 0]} barSize={8} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
           </div>
        )}
        
        {activeTab === 'promo-perks' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <h2 className="text-[26px] font-bold text-[#1a2233] tracking-tight px-1">Promo Perks</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Boosted RevShare", desc: "Get +5% share for the next 30 days", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
                  { title: "CPA Bonus", desc: "Extra $10 for every 10 active traders", icon: Award, color: "text-indigo-500", bg: "bg-indigo-50" },
                  { title: "Weekly Race", desc: "Join the leaderboard to win $500", icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { title: "Direct Manager", desc: "Personal assistant for high volume partners", icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50" },
                ].map((perk, i) => (
                  <div key={i} className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm flex items-start gap-6 group hover:shadow-md transition-all">
                    <div className={`p-4 rounded-2xl ${perk.bg} ${perk.color} group-hover:scale-110 transition-transform`}>
                      <perk.icon size={28} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-[#1a2233]">{perk.title}</h3>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">{perk.desc}</p>
                      <button className="text-sm font-bold text-[#3b66f5] pt-2 flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                        Activate now <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        )}

        {activeTab === 'offers' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <h2 className="text-[26px] font-bold text-[#1a2233] tracking-tight px-1">Offers</h2>
             <div className="bg-white rounded-[32px] p-12 border border-gray-100 shadow-sm text-center space-y-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <Briefcase size={40} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-bold text-[#1a2233]">Available Programs</h3>
                   <p className="text-gray-500 max-w-sm mx-auto">Multiple payout models are being configured for your account. Standard RevShare is active by default.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-6">
                   <div className="bg-[#f8f9fb] p-6 rounded-2xl border-2 border-[#3b66f5] text-left relative">
                      <div className="absolute top-4 right-4 bg-[#3b66f5] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Active</div>
                      <h4 className="font-bold text-[#1a2233] mb-1">RevShare</h4>
                      <p className="text-xs text-gray-500 mb-4">Up to 80% from turnover</p>
                      <div className="text-lg font-bold text-[#3b66f5]">40% - 80%</div>
                   </div>
                   <div className="bg-white p-6 rounded-2xl border border-gray-100 text-left opacity-60">
                      <h4 className="font-bold text-[#1a2233] mb-1">CPA (Locked)</h4>
                      <p className="text-xs text-gray-500 mb-4">Fixed payout per user</p>
                      <div className="text-lg font-bold text-gray-400">$10 - $100</div>
                   </div>
                </div>
             </div>
           </div>
        )}

        {activeTab === 'postbacks' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex items-center justify-between px-1">
                <h2 className="text-[26px] font-bold text-[#1a2233] tracking-tight">Postbacks</h2>
                <button 
                  onClick={() => setShowAddPostback(!showAddPostback)}
                  className="bg-[#3b66f5] text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-900/10 hover:bg-[#3256d1] transition-colors"
                >
                   {showAddPostback ? <X size={18} /> : <Plus size={18} />} 
                   {showAddPostback ? 'Cancel' : 'Add Postback'}
                </button>
             </div>
             
             {showAddPostback && (
               <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                 <h3 className="text-xl font-bold text-[#1a2233] mb-6">Create New Postback</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Name</label>
                      <input 
                         type="text" 
                         value={newPostback.name}
                         onChange={(e) => setNewPostback({...newPostback, name: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#3b66f5] font-bold text-[#1c1d22]"
                         placeholder="e.g. Voluum Tracker"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Postback URL</label>
                      <input 
                         type="text" 
                         value={newPostback.url}
                         onChange={(e) => setNewPostback({...newPostback, url: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#3b66f5] font-bold text-[#1c1d22]"
                         placeholder="https://tracker.com/postback?clickid={clickid}"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Event Trigger</label>
                      <select 
                         value={newPostback.event}
                         onChange={(e) => setNewPostback({...newPostback, event: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#3b66f5] font-bold text-[#1c1d22] appearance-none"
                      >
                         <option value="registration">Registration (Lead)</option>
                         <option value="ftd">First Time Deposit (FTD)</option>
                         <option value="deposit">Any Deposit</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">HTTP Method</label>
                      <select 
                         value={newPostback.method}
                         onChange={(e) => setNewPostback({...newPostback, method: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#3b66f5] font-bold text-[#1c1d22] appearance-none"
                      >
                         <option value="GET">GET</option>
                         <option value="POST">POST</option>
                      </select>
                    </div>
                 </div>
                 <div className="flex justify-end">
                    <button 
                       onClick={handleAddPostback}
                       disabled={isAddingPostback}
                       className="bg-[#1a2233] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] hover:bg-black transition-colors disabled:opacity-50"
                    >
                       {isAddingPostback ? 'Saving...' : 'Save Postback'}
                    </button>
                 </div>
               </div>
             )}

             {postbacks.length === 0 && !showAddPostback ? (
                 <div className="bg-white rounded-[32px] p-12 border border-gray-100 shadow-sm text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                      <Undo2 size={32} />
                    </div>
                    <p className="text-gray-400 font-medium">Configure server-to-server notifications for your tracking platform.</p>
                 </div>
             ) : (
                <div className="space-y-4">
                   {postbacks.map((pb, i) => (
                      <div key={pb.id} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                         <div>
                            <div className="flex items-center gap-3 mb-2">
                               <h3 className="font-bold text-[#1a2233]">{pb.name}</h3>
                               <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black uppercase tracking-widest">{pb.event}</span>
                               <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-widest">{pb.method}</span>
                            </div>
                            <p className="text-[13px] text-gray-400 font-mono break-all max-w-2xl">{pb.url}</p>
                         </div>
                         <button 
                           onClick={() => handleDeletePostback(pb.id)}
                           className="text-red-400 hover:text-red-500 hover:bg-red-50 p-3 rounded-xl transition-colors"
                         >
                            <Trash2 size={20} />
                         </button>
                      </div>
                   ))}
                </div>
             )}
           </div>
        )}

        {activeTab === 'partner-bot' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex items-center justify-between px-1">
               <h2 className="text-[26px] font-bold text-[#1a2233] tracking-tight">Partner Bot</h2>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Bot Online</span>
               </div>
             </div>
             
             <div className="bg-[#1a2233] rounded-[32px] overflow-hidden flex flex-col h-[600px] border border-white/5 relative shadow-2xl">
                {/* Header */}
                <div className="px-8 py-5 border-b border-white/10 bg-[#1c2438] flex items-center justify-between relative z-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                         <Bot size={24} className="text-[#3b66f5]" />
                      </div>
                      <div>
                         <h3 className="text-[16px] font-bold text-white">Bivaax AI Bot</h3>
                         <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Signals & Stats</p>
                      </div>
                   </div>
                   <button className="px-4 py-2 bg-[#3b66f5]/20 text-[#3b66f5] rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#3b66f5]/30 transition-colors">
                      <ExternalLink size={14} /> View on Telegram
                   </button>
                </div>
                
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-[#1a2233] to-[#131926] relative z-10 scrollbar-hide">
                   {botMessages.map((msg, i) => {
                      const isBot = msg.sender === 'bot';
                      return (
                         <div key={i} className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${isBot ? 'bg-[#222b40] text-white rounded-tl-none border border-white/5' : 'bg-[#3b66f5] text-white rounded-tr-none shadow-lg'}`}>
                               <div className="whitespace-pre-line text-[14px] leading-relaxed font-medium">
                                  {msg.text}
                               </div>
                               <div className={`text-[9px] font-black uppercase tracking-widest mt-2 ${isBot ? 'text-gray-500' : 'text-blue-200 text-right'}`}>
                                  {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </div>
                            </div>
                         </div>
                      );
                   })}
                   {isBotTyping && (
                      <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                         <div className="max-w-[80%] p-4 rounded-2xl bg-[#222b40] rounded-tl-none border border-white/5 flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                         </div>
                      </div>
                   )}
                   <div ref={botEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="p-4 bg-[#1c2438] border-t border-white/10 relative z-10">
                   <form onSubmit={handleBotSubmit} className="flex items-center gap-3">
                      <input 
                         type="text"
                         value={botInput}
                         onChange={(e) => setBotInput(e.target.value)}
                         placeholder="Message Bivaax AI Bot (Try /stats, /signals)"
                         className="flex-1 bg-[#151b29] border border-white/5 rounded-2xl px-5 py-4 text-white text-[14px] focus:outline-none focus:border-[#3b66f5] placeholder:text-gray-600 transition-colors"
                      />
                      <button 
                         type="submit"
                         disabled={!botInput.trim()}
                         className="w-14 h-14 bg-[#3b66f5] hover:bg-[#3256d1] disabled:opacity-50 disabled:hover:bg-[#3b66f5] text-white rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95"
                      >
                         <Send size={20} className={botInput.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
                      </button>
                   </form>
                   <div className="flex gap-2 mt-3 px-1">
                      {['/stats', '/signals', '/link'].map(cmd => (
                         <button 
                            key={cmd}
                            type="button"
                            onClick={() => { setBotInput(cmd); }}
                            className="text-[10px] font-black text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg uppercase tracking-widest transition-colors"
                         >
                            {cmd}
                         </button>
                      ))}
                   </div>
                </div>
             </div>
           </div>
        )}

        {activeTab === 'profile' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <h2 className="text-[26px] font-bold text-[#1a2233] tracking-tight px-1">Profile Settings</h2>
             <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm divide-y divide-gray-50">
                <div className="p-8 flex items-center gap-6">
                   <div className="w-20 h-20 rounded-full bg-[#dbeafe] text-[#3b82f6] flex items-center justify-center text-2xl font-bold shadow-inner">
                      {currentUser?.email ? currentUser.email.substring(0, 2).toUpperCase() : "HA"}
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-[#1a2233] mb-1">{currentUser?.displayName || "Partner Account"}</h3>
                      <p className="text-gray-500 font-medium">{currentUser?.email}</p>
                   </div>
                </div>
                <div className="p-8 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                         <input type="text" readOnly value={currentUser?.displayName || "N/A"} className="w-full bg-[#f8f9fb] border border-gray-100 rounded-xl px-5 py-3.5 font-bold text-[#1a2233]" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                         <input type="text" readOnly value={currentUser?.email || ""} className="w-full bg-[#f8f9fb] border border-gray-100 rounded-xl px-5 py-3.5 font-bold text-[#1a2233]" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Affiliate ID</label>
                         <input type="text" readOnly value={`#${affId}`} className="w-full bg-[#f8f9fb] border border-gray-100 rounded-xl px-5 py-3.5 font-mono font-bold text-[#3b66f5]" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Account Currency</label>
                         <input type="text" readOnly value="USD (Tether)" className="w-full bg-[#f8f9fb] border border-gray-100 rounded-xl px-5 py-3.5 font-bold text-[#1a2233]" />
                      </div>
                   </div>
                   <div className="pt-4">
                      <button className="bg-gray-100 hover:bg-gray-200 transition-colors px-8 py-3.5 rounded-xl font-bold text-[#1a2233] text-sm">Change Password</button>
                   </div>
                </div>
             </div>
           </div>
         )}

        {activeTab === 'statistics' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <h2 className="text-[26px] font-bold text-[#1a2233] tracking-tight px-1">Statistics</h2>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Clicks", val: impressions, icon: MousePointer2, color: "text-blue-500" },
                  { label: "Registrations", val: stats.leads, icon: UserPlus, color: "text-indigo-500" },
                  { label: "FTD", val: stats.conversions, icon: CheckCircle2, color: "text-green-500" },
                  { label: "Profit", val: `$${getConvertedBalance(affiliateBalance, '$').toFixed(2)}`, icon: Wallet, color: "text-[#3b66f5]" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                       <div className={`p-2 rounded-lg bg-gray-50 ${s.color}`}>
                          <s.icon size={16} />
                       </div>
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-[#1a2233]">{s.val}</div>
                  </div>
                ))}
             </div>

             <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                   <div>
                      <h3 className="text-lg font-bold text-[#1a2233]">Referral Network Audit</h3>
                      <p className="text-sm text-gray-500 font-medium tracking-tight">In-depth member transaction logs</p>
                   </div>
                   <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                      <button className="px-5 py-2.5 rounded-xl bg-[#1a2233] text-white text-[11px] font-bold uppercase tracking-widest shadow-xl">Live Network</button>
                      <button className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-[#1a2233] transition-colors text-[11px] font-bold uppercase tracking-widest">History</button>
                   </div>
                </div>
                
                <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                               <th className="pb-8 px-4">Partner Identity</th>
                               <th className="pb-8 px-4">Joined</th>
                               <th className="pb-8 px-4">Total Deposits</th>
                               <th className="pb-8 px-4">Sub-Referrals</th>
                               <th className="pb-8 px-4 text-right">Trade Volume</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50">
                            {referrals.length > 0 ? referrals.map((ref, idx) => {
                               const email = ref.email || "";
                               const maskedEmail = email.includes("@") ? `${email.split("@")[0].substring(0, 2)}***@${email.split("@")[1]}` : "Anov*** Partner";
                               return (
                                  <tr key={`stat-row-${ref.id}`} className="group hover:bg-gray-50/50 transition-all">
                                    <td className="py-6 px-4">
                                       <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-2xl bg-[#1c1d22] text-white flex items-center justify-center font-black text-[14px] shadow-lg shadow-black/10 overflow-hidden relative group-hover:scale-110 transition-transform">
                                             <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${maskedEmail}`} alt="Affiliate Avatar" className="w-full h-full object-cover opacity-80" loading="lazy" />
                                          </div>
                                          <div>
                                             <div className="text-[15px] font-black text-[#1c1d22]">{maskedEmail}</div>
                                             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {ref.affiliateId || ref.id.substring(0,8)}</div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="py-6 px-4 font-bold text-gray-500 text-[13px] uppercase tracking-tighter">
                                       {new Date(ref.createdAt || Date.now()).toLocaleDateString()}
                                    </td>
                                    <td className="py-6 px-4">
                                       <span className="text-[14px] font-black text-emerald-600 tabular-nums">
                                          {userCurrency} {getConvertedBalance(ref.totalDeposits || 0, userCurrency).toLocaleString()}
                                       </span>
                                    </td>
                                    <td className="py-6 px-4">
                                       <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[12px] font-black text-indigo-600">
                                             {ref.referralCount || 0}
                                          </div>
                                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Users</span>
                                       </div>
                                    </td>
                                    <td className="py-6 px-4 text-right font-black text-[#1c1d22] text-[15px] tabular-nums tracking-tighter">
                                       {userCurrency} {getConvertedBalance(ref.tradeVolume || 0, userCurrency).toLocaleString()}
                                    </td>
                                  </tr>
                               );
                            }) : (
                               <tr>
                                  <td colSpan={5} className="py-24 text-center">
                                     <Activity size={48} className="text-gray-100 mx-auto mb-4" />
                                     <div className="text-[12px] font-black text-gray-300 uppercase tracking-widest">Awaiting primary data synchronization</div>
                                  </td>
                               </tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                </div>
                {/* Commissions History */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
                 <div className="lg:col-span-3 bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                      <div>
                         <h3 className="text-[22px] font-black text-[#1c1d22] tracking-tighter">Commissions History</h3>
                         <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">RevShare, Turnover & Sub-Affiliates</p>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                         <button className="px-5 py-2.5 rounded-xl bg-[#1c1d22] text-white text-[11px] font-black uppercase tracking-widest shadow-xl">Recent</button>
                      </div>
                   </div>
                   
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                               <th className="pb-8 px-4">Date</th>
                               <th className="pb-8 px-4">Type</th>
                               <th className="pb-8 px-4">Source ID</th>
                               <th className="pb-8 px-4">Base Volume</th>
                               <th className="pb-8 px-4">Rate %</th>
                               <th className="pb-8 px-4 text-right">Earned</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50">
                            {commissions.length > 0 ? commissions.map((comm, idx) => {
                               let typeLabel = "RevShare";
                               let typeColor = "text-indigo-500";
                               let volume = comm.lostAmount || comm.tradeAmount || comm.baseCommissionAmount || 0;
                               if (comm.type === 'turnover_share') {
                                   typeLabel = "Turnover";
                                   typeColor = "text-sky-500";
                               } else if (comm.type === 'sub_affiliate_share') {
                                   typeLabel = "Sub-Affiliate";
                                   typeColor = "text-fuchsia-500";
                               }
                               
                               return (
                                  <tr key={`comm-row-${comm.id}`} className="group hover:bg-gray-50/50 transition-all">
                                    <td className="py-6 px-4 font-bold text-gray-500 text-[13px] uppercase tracking-tighter">
                                       {new Date(comm.createdAt || Date.now()).toLocaleDateString()} {new Date(comm.createdAt || Date.now()).toLocaleTimeString()}
                                    </td>
                                    <td className={`py-6 px-4 font-black ${typeColor} text-[13px] uppercase tracking-widest`}>
                                       {typeLabel}
                                    </td>
                                    <td className="py-6 px-4 font-black text-[#1c1d22] text-[15px] tabular-nums tracking-tight">
                                       {comm.referredUid ? String(comm.referredUid).substring(0, 8).toUpperCase() : 'N/A'}
                                    </td>
                                    <td className="py-6 px-4">
                                       <span className="text-[14px] font-black text-gray-400 tabular-nums">
                                          {userCurrency} {getConvertedBalance(volume, userCurrency).toLocaleString()}
                                       </span>
                                    </td>
                                    <td className="py-6 px-4 font-black text-gray-700 text-[14px]">
                                       {comm.percent}%
                                    </td>
                                    <td className="py-6 px-4 text-right font-black text-emerald-500 text-[15px] tabular-nums tracking-tighter">
                                       +{userCurrency} {getConvertedBalance(comm.amount || 0, userCurrency).toLocaleString()}
                                    </td>
                                  </tr>
                               );
                            }) : (
                               <tr>
                                  <td colSpan={6} className="py-24 text-center">
                                     <Activity size={48} className="text-gray-100 mx-auto mb-4" />
                                     <div className="text-[12px] font-black text-gray-300 uppercase tracking-widest">Awaiting commission data</div>
                                  </td>
                               </tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                </div>

                <div className="space-y-8">
                   {/* Traffic Analysis */}
                   <div className="bg-[#1c1d22] rounded-[40px] p-10 text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px]"></div>
                      <h4 className="text-[14px] font-black text-indigo-400 uppercase tracking-[0.25em] mb-10">Traffic Funnel</h4>
                      <div className="space-y-6">
                         {[
                            { label: 'Direct Entry', val: '65%', color: 'bg-indigo-500' },
                            { label: 'Social Media', val: '22%', color: 'bg-rose-500' },
                            { label: 'Telegram Hub', val: '13%', color: 'bg-emerald-500' }
                         ].map((item, i) => (
                            <div key={`aff-stat-card-${i}`} className="space-y-2.5">
                               <div className="flex justify-between items-center text-[12px] font-black uppercase tracking-widest">
                                  <span className="text-gray-500">{item.label}</span>
                                  <span className="text-white">{item.val}</span>
                               </div>
                               <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div className={`h-full ${item.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} style={{ width: item.val }}></div>
                               </div>
                            </div>
                         ))}
                      </div>
                      <div className="mt-12 pt-10 border-t border-white/5">
                         <button className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[11px] uppercase tracking-[0.2em] transition-all border border-white/5">Generate Audit Report</button>
                      </div>
                   </div>

                   {/* Quick Performance Card */}
                   <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[40px] p-10 text-white shadow-2xl shadow-emerald-900/20 group">
                      <TrendingUp size={40} className="text-white/20 mb-8 group-hover:scale-110 transition-transform" />
                      <h4 className="text-[24px] font-black tracking-tighter leading-tight mb-4 text-white">Scale Your Reach Today.</h4>
                      <p className="text-emerald-50 text-[14px] font-medium leading-relaxed opacity-70 mb-10">Pro partners with high CR get access to exclusive $5 CPA bonuses per funded user.</p>
                      <button className="w-full py-5 rounded-2xl bg-white text-emerald-700 font-black text-[13px] uppercase tracking-widest shadow-xl">Contact Manager</button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'promo' && (
           <div className="space-y-10">
              <SectionHeading icon={Award} title="Marketing Assets" desc="Premium banners and assets for your promotions" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {promoMaterials.length > 0 ? promoMaterials.map((item, i) => (
                    <div key={`aff-promo-mat-${i}`} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all">
                       <div className={`aspect-video rounded-[20px] ${item.color || 'bg-[#1c1d22]'} mb-6 flex flex-col items-center justify-center p-4 text-center overflow-hidden relative shadow-inner`}>
                          {item.imageUrl ? (
                             <img src={item.imageUrl} className="w-full h-full object-cover" alt="Affiliate Promotion" loading="lazy" />
                          ) : (
                             <>
                                <Logo size={32} withBackground className="mb-3" />
                                <div className="text-white font-black text-[18px] tracking-tighter leading-tight drop-shadow-lg">GLOBAL TRADING <br/>LEADER</div>
                             </>
                          )}
                          <div className="absolute bottom-2 left-2 right-2 bg-white/10 backdrop-blur-md rounded-lg py-1 text-[10px] text-white font-black uppercase tracking-[0.2em]">{item.size}</div>
                       </div>
                       
                       <div className="flex items-center justify-between mt-auto">
                          <div>
                             <h4 className="text-[15px] font-black text-[#1c1d22] tracking-tight">{item.label}</h4>
                             <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{item.size}</p>
                          </div>
                          <button 
                            onClick={() => {
                                if (item.imageUrl) {
                                    navigator.clipboard.writeText(item.imageUrl);
                                    toast.success('Image link copied');
                                } else {
                                    toast.error('No image URL associated');
                                }
                            }}
                            className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          >
                             <Copy size={18} />
                          </button>
                       </div>
                       <button className="w-full mt-5 bg-gray-50 hover:bg-gray-100 text-[#1c1d22] font-black py-4 rounded-[20px] text-[13px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                          Get Asset Link
                          <ArrowRight size={16} />
                       </button>
                    </div>
                 )) : (
                    [
                        { size: '1080 x 1080', label: 'Instagram Square', color: 'bg-gradient-to-br from-[#1c1d22] to-[#3a3c42]' },
                        { size: '1200 x 628', label: 'Facebook / Twitter', color: 'bg-gradient-to-br from-indigo-900 to-indigo-600' },
                        { size: '728 x 90', label: 'Web Leaderboard', color: 'bg-gradient-to-br from-rose-900 to-rose-600' }
                    ].map((item, i) => (
                        <div key={`mock-promo-${i}`} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all opacity-60">
                           <div className={`aspect-video rounded-[20px] ${item.color} mb-6 flex flex-col items-center justify-center p-4 text-center overflow-hidden relative shadow-inner`}>
                              <Logo size={32} withBackground className="mb-3" />
                              <div className="text-white font-black text-[18px] tracking-tighter leading-tight drop-shadow-lg text-center font-sans">MARKETING<br/>ASSET</div>
                              <div className="absolute bottom-2 left-2 right-2 bg-white/10 backdrop-blur-md rounded-lg py-1 text-[10px] text-white font-black uppercase tracking-[0.2em]">{item.size}</div>
                           </div>
                           <div className="flex items-center justify-between mt-auto">
                              <div>
                                 <h4 className="text-[15px] font-black text-[#1c1d22] tracking-tight">{item.label}</h4>
                                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{item.size}</p>
                              </div>
                           </div>
                        </div>
                    ))
                 )}
              </div>
           </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <SectionHeading 
                  icon={ExternalLink} 
                  title="Campaign Management" 
                  desc="High-performance tracking links and traffic funnels" 
                />
                <div className="flex items-center gap-3 bg-gray-100 p-1.5 rounded-2xl border border-gray-100">
                    <button 
                      onClick={() => setCampaignTab('live')}
                      className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${campaignTab === 'live' ? 'bg-[#1c1d22] text-white shadow-xl' : 'text-gray-400 hover:text-[#1c1d22]'}`}
                    >
                      Live Campaigns
                    </button>
                    <button 
                      onClick={() => setCampaignTab('archived')}
                      className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${campaignTab === 'archived' ? 'bg-[#1c1d22] text-white shadow-xl' : 'text-gray-400 hover:text-[#1c1d22]'}`}
                    >
                      Archived
                    </button>
                </div>
             </div>

             <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
                            <th className="py-8 px-10">Campaign Detail</th>
                            <th className="py-8 px-6">Tracking URL</th>
                            <th className="py-8 px-6 text-center">Clicks</th>
                            <th className="py-8 px-6 text-center">Regs</th>
                            <th className="py-8 px-6 text-center">FTDs</th>
                            <th className="py-8 px-10 text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {campaigns.filter(c => campaignTab === 'archived' ? c.isArchived : !c.isArchived).map((camp, i) => {
                            const campRegs = referrals.filter(r => r.referredSub === camp.subId).length;
                            const campFTDs = referrals.filter(r => r.referredSub === camp.subId && (r.totalDeposits || 0) > 0).length;
                            const campClicks = camp.clicks || 0;

                            return (
                             <tr key={`camp-row-${camp.id || i}`} className="group hover:bg-gray-50/50 transition-all">
                               <td className="py-8 px-10">
                                  <div className="flex flex-col">
                                     <span className="text-[15px] font-black text-[#1c1d22] mb-1">{camp.name}</span>
                                     <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.1em]">SubID: {camp.subId}</span>
                                     </div>
                                  </div>
                               </td>
                               <td className="py-8 px-6">
                                  <div className="flex items-center gap-3 bg-gray-50 group-hover:bg-white rounded-xl px-4 py-3 border border-gray-100 min-w-[240px] transition-all">
                                     <span className="text-[12px] font-mono font-bold text-gray-400 truncate flex-1">{getCampaignLink(camp.subId, camp.landingPage, camp.linkType)}</span>
                                     <button 
                                       onClick={() => {
                                          navigator.clipboard.writeText(getCampaignLink(camp.subId, camp.landingPage, camp.linkType));
                                          toast.success('Campaign link copied');
                                       }}
                                       className="text-gray-400 hover:text-indigo-600 transition-colors"
                                     >
                                        <Copy size={16} />
                                     </button>
                                  </div>
                               </td>
                               <td className="py-8 px-6 text-center font-black text-[#1c1d22] text-[15px] tabular-nums">{campClicks}</td>
                               <td className="py-8 px-6 text-center font-black text-[#1c1d22] text-[15px] tabular-nums">{campRegs}</td>
                               <td className="py-8 px-6 text-center font-black text-emerald-500 text-[15px] tabular-nums">{campFTDs}</td>
                               <td className="py-8 px-10 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                     <button 
                                       onClick={async () => {
                                         if (camp.id === 'default') return toast.error('Standard campaign cannot be modified');
                                         try {
                                            await updateDoc(doc(db, 'affiliate_campaigns', camp.id), {
                                              isArchived: !camp.isArchived
                                            });
                                            toast.success(camp.isArchived ? 'Campaign restored' : 'Campaign archived');
                                         } catch (e) {
                                            toast.error('Failed to update campaign status');
                                         }
                                       }}
                                       className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                       title={camp.isArchived ? "Restore" : "Archive"}
                                     >
                                        {camp.isArchived ? <Activity size={18} /> : <History size={18} />}
                                     </button>
                                     {camp.id !== 'default' && (
                                        <button 
                                          onClick={() => {
                                            if (confirm('Are you sure you want to delete this campaign permanently?')) {
                                              deleteCampaign(camp.id);
                                            }
                                          }}
                                          className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                        >
                                           <X size={18} />
                                        </button>
                                     )}
                                  </div>
                               </td>
                            </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>
             </div>

             {/* New Link Generator */}
             <div className="bg-[#1c1d22] rounded-[48px] p-8 md:p-14 text-white relative overflow-hidden group border border-white/5">
                <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/15 transition-all duration-1000"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                   <div>
                      <h3 className="text-[32px] font-black leading-tight tracking-tighter mb-6">Create custom <br/>tracking campaigns.</h3>
                      <p className="text-[#8e9299] text-[15px] font-medium leading-relaxed mb-8 opacity-80">Use unique tracking IDs for different traffic sources (YouTube, Telegram, SEO) to calculate accurate ROI.</p>
                      <div className="flex items-center gap-6">
                         <div className="flex flex-col">
                            <span className="text-[18px] font-black text-white">Lifetime</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking Cookie</span>
                         </div>
                         <div className="w-[1px] h-10 bg-white/10"></div>
                         <div className="flex flex-col">
                            <span className="text-[18px] font-black text-white">Unlimited</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking IDs</span>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white/5 backdrop-blur-md rounded-[40px] p-8 md:p-10 border border-white/10 shadow-2xl space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Friendly Name</label>
                            <input 
                              type="text" 
                              value={newCampaignName}
                              onChange={e => setNewCampaignName(e.target.value)}
                              placeholder="e.g. YouTube Promo"
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-indigo-500 text-white font-bold transition-all"
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Tracking SubID</label>
                            <input 
                              type="text" 
                              value={newCampaignSubId}
                              onChange={e => setNewCampaignSubId(e.target.value.replace(/\s+/g, '_'))}
                              placeholder="e.g. yt_01"
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-indigo-500 text-indigo-400 font-mono transition-all"
                            />
                         </div>
                      </div>

                      <div className="space-y-3">
                         <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Traffic Hub (Landing Page)</label>
                         <select 
                            value={selectedLandingPage}
                            onChange={e => setSelectedLandingPage(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-indigo-500 text-white font-bold transition-all appearance-none"
                         >
                            <option value="/" className="bg-[#1c1d22]">Main Homepage (Convert focus)</option>
                            <option value="/trade" className="bg-[#1c1d22]">Trading Interface (Direct focus)</option>
                            <option value="/about-us" className="bg-[#1c1d22]">About Us (Trust focus)</option>
                         </select>
                      </div>
                      
                      <div className="space-y-3">
                         <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Commission Type</label>
                         <select 
                            value={newCampaignType}
                            onChange={e => setNewCampaignType(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-indigo-500 text-white font-bold transition-all appearance-none"
                         >
                            <option value="revshare" className="bg-[#1c1d22]">Revenue Share (40% - 80%)</option>
                            <option value="turnover" className="bg-[#1c1d22]">Turnover (2% - 5%)</option>
                         </select>
                      </div>
                      <button 
                        onClick={addCampaign}
                        className="w-full bg-white hover:bg-gray-100 active:scale-[0.98] text-[#1c1d22] font-black py-6 rounded-2xl text-[15px] uppercase tracking-widest shadow-2xl shadow-indigo-900/20 transition-all flex items-center justify-center gap-3"
                      >
                         <Plus size={20} className="text-indigo-600" />
                         Generate Tracking Campaign
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'sub-affiliates' && (
           <div className="space-y-10">
              <SectionHeading icon={UserPlus} title="Sub-Affiliate Network" desc="Earn 5% flat revenue from traffic referred by your partners" />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
                    <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                       <h3 className="text-[18px] font-black text-[#1c1d22]">Multi-level Partners</h3>
                       <span className="text-[11px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">2nd Tier Level</span>
                    </div>
                    
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/30">
                                <th className="px-8 py-5">Partner Email</th>
                                <th className="px-8 py-5">Joined</th>
                                <th className="px-8 py-5">Active Refs</th>
                                <th className="px-8 py-5 text-right">Your Earnings</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {subAffiliates.length > 0 ? subAffiliates.map((sub, i) => (
                                 <tr key={`sub-aff-row-${i}`} className="hover:bg-gray-50 transition-colors">
                                   <td className="px-8 py-5">
                                      <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-slate-100 border border-indigo-100 flex items-center justify-center font-black text-[10px] text-indigo-600">
                                            {sub.email?.substring(0, 2).toUpperCase()}
                                         </div>
                                         <span className="font-bold text-[#1c1d22] text-[14px]">{sub.email?.split('@')[0]}***@{sub.email?.split('@')[1]}</span>
                                      </div>
                                   </td>
                                   <td className="px-8 py-5 text-gray-500 font-bold text-[13px]">May {10+i}, 2026</td>
                                   <td className="px-8 py-5 text-[#1c1d22] font-black text-[13px]">{Math.floor(Math.random() * 20)}</td>
                                   <td className="px-8 py-5 text-right font-black text-indigo-600 text-[15px]">$ {(Math.random() * 45).toFixed(2)} [USDT]</td>
                                </tr>
                             )) : (
                                <tr>
                                   <td colSpan={4} className="px-8 py-20 text-center opacity-50">
                                      <div className="flex flex-col items-center gap-4">
                                         <Users size={32} />
                                         <p className="text-[14px] font-black uppercase tracking-widest leading-none">No active sub-partners</p>
                                         <p className="text-[12px] font-medium text-gray-400 max-w-[200px] leading-tight">Partners who sign up through your link appear here.</p>
                                      </div>
                                   </td>
                                </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="bg-[#1c1d22] rounded-[32px] p-8 text-white relative overflow-hidden border border-white/5">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px]"></div>
                        <h3 className="text-[18px] font-black mb-4 tracking-tight">Refer Other Partners</h3>
                        <p className="text-gray-400 text-[13px] leading-relaxed mb-8">Share this unique invitation with potential affiliates. You'll receive 5% from all revenue generated by their clients.</p>
                        
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between mb-4">
                           <span className="text-[12px] font-mono text-gray-500 font-bold truncate pr-3">{window.location.protocol}//{window.location.host}?ref={referralCode}</span>
                           <button onClick={() => { navigator.clipboard.writeText(`${window.location.protocol}//${window.location.host}?ref=${referralCode}`); toast.success('Invite link copied'); }} className="text-indigo-400">
                             <Copy size={16} />
                           </button>
                        </div>
                        
                        <div className="pt-6 border-t border-white/5">
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Network Commission</span>
                              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Fixed 5%</span>
                           </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-500/20">
                        <h4 className="font-black text-[17px] mb-4">Partner Strategy</h4>
                        <p className="text-indigo-100 text-[13px] leading-relaxed opacity-90">"Recruiting top-tier sub-affiliates is the fastest way to build passive income. Focus on bloggers and channel owners."</p>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'payouts' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-[26px] font-bold text-[#1a2233] tracking-tight px-1">Payments</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Balance Card */}
                   <BivaaxBalanceCard 
                     availableBalance={availableBalance}
                     heldBalance={heldBalance}
                     onPaymentClick={() => {}}
                   />


                  {/* Completed Payouts */}
                  <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                     <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Completed Cashouts</p>
                        <h3 className="text-[36px] font-black text-[#1c1d22] tracking-tight">
                          $ {
                             getConvertedBalance(
                               payoutRequests
                                 .filter(p => p.status === 'completed')
                                 .reduce((acc, curr) => acc + (curr.amount || 0), 0),
                               '$'
                             ).toFixed(2)
                          }
                        </h3>
                     </div>
                     <p className="text-[12px] text-gray-400 font-bold mt-4">Processed through verified secure checkout gateways</p>
                  </div>

                  {/* Pending Payouts */}
                  <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                     <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Pending Dispersals</p>
                        <h3 className="text-[36px] font-black text-amber-500 tracking-tight">
                          $ {
                             getConvertedBalance(
                               payoutRequests
                                 .filter(p => p.status === 'pending')
                                 .reduce((acc, curr) => acc + (curr.amount || 0), 0),
                               '$'
                             ).toFixed(2)
                          }
                        </h3>
                     </div>
                     <p className="text-[12px] text-gray-400 font-bold mt-4">Audited and processed by security within 2 hours</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Form Block */}
                  <div className="lg:col-span-1 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                     <h3 className="text-[18px] font-black text-[#1c1d22] mb-6 flex items-center gap-2">
                        <ArrowUpRight className="text-indigo-600" size={20} />
                        Withdraw Earnings
                     </h3>

                     <form onSubmit={handleRequestPayout} className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Payout Gateway</label>
                           <select 
                             value={payoutGateway}
                             onChange={(e) => setPayoutGateway(e.target.value)}
                             className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 font-bold text-[#1c1d22] transition-colors"
                          >
                             
                             
                             
                             <option value="USDT (TRC-20)">USDT Crypto (TRC-20)</option>
                             <option value="Nagad">Nagad (Personal/Agent)</option>
                             <option value="Bkash">Bkash (Personal/Agent)</option>
                             <option value="Rocket">Rocket (Personal/Agent)</option>
                             
                           </select>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Cashout Amount (USDT)</label>
                           <input 
                             type="number" 
                             step="any"
                             value={payoutAmount}
                             onChange={(e) => setPayoutAmount(e.target.value)}
                             placeholder={`Min $10`}
                             className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 font-black text-[#1c1d22] transition-all"
                           />
                           <p className="text-[10px] text-gray-400 font-bold ml-1">
                              Your Balance: ${getConvertedBalance(affiliateBalance, '$').toFixed(2)}
                           </p>
                        </div>

                        {/* Conditional details input */}
                        {false && (
                           <div className="space-y-2">
                              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{payoutGateway} Wallet Number</label>
                              <input 
                                type="text" 
                                value={payoutDetails.mobileNumber}
                                onChange={(e) => setPayoutDetails({...payoutDetails, mobileNumber: e.target.value})}
                                placeholder="e.g. 01XXXXXXXXX"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 font-mono text-[#1c1d22] transition-all"
                              />
                           </div>
                        )}

                        {payoutGateway === 'USDT (TRC-20)' && (
                           <div className="space-y-2">
                              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">USDT TRC-20 Destination Address</label>
                              <input 
                                type="text" 
                                value={payoutDetails.walletAddress}
                                onChange={(e) => setPayoutDetails({...payoutDetails, walletAddress: e.target.value})}
                                placeholder="e.g. Txxxxxxxxxxxxxxxxxxxxxxxxx"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 font-mono text-[12px] text-[#1c1d22] transition-all"
                              />
                           </div>
                        )}

                        {(payoutGateway === 'Nagad' || payoutGateway === 'Bkash' || payoutGateway === 'Rocket') && (
                           <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{payoutGateway} Number</label>
                                <input 
                                  type="text" 
                                  value={payoutDetails.mobileNumber}
                                  onChange={(e) => setPayoutDetails({...payoutDetails, mobileNumber: e.target.value})}
                                  placeholder="01XXXXXXXXX"
                                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 font-bold text-[#1c1d22]"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Type</label>
                                <select 
                                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 font-bold text-[#1c1d22]"
                                  onChange={(e) => setPayoutDetails({...payoutDetails, accountName: e.target.value})}
                                >
                                  <option value="Personal">Personal</option>
                                  <option value="Agent">Agent</option>
                                </select>
                              </div>
                           </div>
                        )}

                        {false && (
                           <div className="space-y-4 pt-1 font-sans">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Name</label>
                                 <input 
                                   type="text" 
                                   value={payoutDetails.bankName}
                                   onChange={(e) => setPayoutDetails({...payoutDetails, bankName: e.target.value})}
                                   placeholder="e.g. Dutch Bangla Bank"
                                   className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 text-[13px] font-bold text-[#1c1d22]"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Branch Name</label>
                                 <input 
                                   type="text" 
                                   value={payoutDetails.branchName}
                                   onChange={(e) => setPayoutDetails({...payoutDetails, branchName: e.target.value})}
                                   placeholder="e.g. Banani Branch"
                                   className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 text-[13px] font-bold text-[#1c1d22]"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Number</label>
                                 <input 
                                   type="text" 
                                   value={payoutDetails.accountNumber}
                                   onChange={(e) => setPayoutDetails({...payoutDetails, accountNumber: e.target.value})}
                                   placeholder="e.g. 123.456.7890"
                                   className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 font-mono text-[13px] text-[#1c1d22]"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Name</label>
                                 <input 
                                   type="text" 
                                   value={payoutDetails.accountName}
                                   onChange={(e) => setPayoutDetails({...payoutDetails, accountName: e.target.value})}
                                   placeholder="e.g. Tanvir Rahman"
                                   className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 text-[13px] font-bold text-[#1c1d22]"
                                 />
                              </div>
                           </div>
                        )}

                        <button 
                          type="submit" 
                          disabled={isSubmittingPayout || affiliateBalance <= 0}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl text-[13px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-2"
                        >
                           {isSubmittingPayout ? 'Processing...' : 'Submit Cashout Request'}
                        </button>
                     </form>
                  </div>

                  {/* History Table block */}
                  <div className="lg:col-span-2 bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
                     <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="text-[18px] font-black text-[#1c1d22]">Withdrawal Audits</h3>
                        <span className="text-[11px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest font-mono">Global Ledger</span>
                     </div>

                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/30 font-mono">
                                 <th className="px-8 py-5">Initiated</th>
                                 <th className="px-8 py-5 text-right">Amount</th>
                                 <th className="px-8 py-5">Mechanism</th>
                                 <th className="px-8 py-5">Details</th>
                                 <th className="px-8 py-5">Verification</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                              {payoutRequests.length > 0 ? (
                                 payoutRequests.map((req, i) => {
                                    const dateStr = (req.createdAt && typeof req.createdAt.toDate === 'function') 
                                         ? req.createdAt.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                                         : 'Pending';
                                    return (
                                        <tr key={`payout-req-row-${i}`} className="hover:bg-gray-50/50 transition-colors">
                                          <td className="px-8 py-5 text-[13px] text-gray-500 font-bold">{dateStr}</td>
                                          <td className="px-8 py-5 text-right font-black text-[#1c1d22] text-[14px]">
                                             $ {getConvertedBalance(req.amount || 0, '$').toFixed(2)}
                                          </td>
                                          <td className="px-8 py-5">
                                             <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-gray-100 text-gray-600 font-mono">
                                                {req.gateway}
                                             </span>
                                          </td>
                                          <td className="px-8 py-5 text-[12px] font-semibold text-gray-500 max-w-[180px] truncate" title={req.details}>
                                             {req.details}
                                          </td>
                                          <td className="px-8 py-5">
                                             {req.status === 'pending' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-50 text-amber-600 uppercase tracking-widest">
                                                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                                   Auditing
                                                </span>
                                             )}
                                             {req.status === 'completed' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-widest">
                                                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                   Disbursed
                                                </span>
                                             )}
                                             {req.status === 'rejected' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-50 text-rose-600 uppercase tracking-widest" title={req.rejectReason || 'Security audit failed'}>
                                                   <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                                   Rejected
                                                </span>
                                             )}
                                          </td>
                                       </tr>
                                    );
                                 })
                              ) : (
                                 <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold">
                                       No withdrawal dispersals found
                                    </td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'support' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionHeading 
                icon={MessageSquare} 
                title="Partner Support Hub" 
                desc="Direct connection to our affiliate relations team" 
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                       <h3 className="text-[18px] font-black text-[#1c1d22] mb-6 flex items-center gap-2">
                          <Zap className="text-amber-500" size={20} />
                          Open a Ticket
                       </h3>
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                             <input 
                                type="text"
                                value={ticketSubject}
                                onChange={(e) => setTicketSubject(e.target.value)}
                                placeholder="e.g. Traffic scaling advice"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 font-bold text-[#1c1d22]"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                             <textarea 
                                value={ticketMessage}
                                onChange={(e) => setTicketMessage(e.target.value)}
                                rows={4}
                                placeholder="How can we help you grow today?"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-indigo-500 font-medium text-[#1c1d22] resize-none"
                             />
                          </div>
                          <button 
                             onClick={() => {
                                if (!ticketSubject.trim() || !ticketMessage.trim()) return toast.error("Please fill all fields");
                                createSupportTicket(ticketSubject, ticketMessage);
                                setTicketSubject("");
                                setTicketMessage("");
                             }}
                             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl text-[13px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-2"
                          >
                             Open Partner Ticket
                          </button>
                       </div>
                    </div>

                    <div className="bg-[#1c1d22] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl border border-white/5 group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-[40px]"></div>
                        <h4 className="text-[16px] font-black uppercase tracking-widest mb-4">Elite Concierge</h4>
                        <p className="text-gray-400 text-[13px] leading-relaxed mb-6">Platinum partners with over 200 leads get access to a 24/7 dedicated account manager via Telegram.</p>
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                           <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                              <Star size={18} fill="white" />
                           </div>
                           <div>
                              <div className="text-[12px] font-black">Telegram VIP</div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase">Locked for Starter</div>
                           </div>
                        </div>
                    </div>
                 </div>

                 <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
                       <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                          <h3 className="text-[18px] font-black text-[#1c1d22]">My Support Logs</h3>
                          <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase tracking-widest">{userTickets.length} Tickets</span>
                       </div>
                       
                       <div className="divide-y divide-gray-50">
                          {userTickets.length > 0 ? (
                             userTickets.map((ticket, i) => (
                                <div 
                                   key={`ticket-row-${i}`}
                                   onClick={() => {
                                      setSelectedTicket(ticket);
                                      setActiveTab('support-detail');
                                   }}
                                   className="p-6 hover:bg-gray-50 transition-all cursor-pointer group"
                                >
                                   <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-3">
                                         <div className={`w-2 h-2 rounded-full ${ticket.status === 'open' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                         <h4 className="text-[15px] font-black text-[#1c1d22] group-hover:text-indigo-600 transition-colors">{ticket.subject}</h4>
                                      </div>
                                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                         {new Date(ticket.updatedAt).toLocaleDateString()}
                                      </span>
                                   </div>
                                   <p className="text-[13px] text-gray-500 font-medium truncate opacity-70 mb-3">{ticket.lastMessage || 'Open discussion...'}</p>
                                   <div className="flex items-center gap-2">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${ticket.status === 'open' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                         {ticket.status}
                                      </span>
                                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">•</span>
                                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ref: {ticket.id.substring(0,6)}</span>
                                   </div>
                                </div>
                             ))
                          ) : (
                             <div className="p-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                   <MessageSquare size={32} />
                                </div>
                                <div className="text-gray-400 font-bold uppercase text-[12px] tracking-widest">No active support data</div>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'support-detail' && selectedTicket && (
           <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col h-[700px]">
                 {/* Detail Header */}
                 <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-4">
                       <button 
                          onClick={() => { setActiveTab('support'); setSelectedTicket(null); }}
                          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                       >
                          <ChevronDown className="rotate-90" size={20} />
                       </button>
                       <div>
                          <h3 className="text-[18px] font-black text-[#1c1d22] leading-none mb-1">{selectedTicket.subject}</h3>
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Agent Active</span>
                          </div>
                       </div>
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                       ID: {selectedTicket.id.substring(0,8)}
                    </div>
                 </div>

                 {/* Message Scroller */}
                 <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-gray-50/30">
                    {ticketMessages.map((msg, i) => {
                       const isStaff = msg.senderType === 'support';
                       return (
                          <div key={`msg-${i}`} className={`flex ${isStaff ? 'justify-start' : 'justify-end'}`}>
                             <div className={`max-w-[80%] ${isStaff ? 'bg-white border border-gray-100 shadow-sm' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/10'} p-5 rounded-[24px] rounded-tl-none`}>
                                <div className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isStaff ? 'text-indigo-400' : 'text-indigo-200'}`}>
                                   {isStaff ? 'Bivaax Support' : 'You'}
                                </div>
                                <p className="text-[14px] font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                <div className={`text-[9px] font-bold mt-2 text-right ${isStaff ? 'text-gray-300' : 'text-indigo-300'}`}>
                                   {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                             </div>
                          </div>
                       );
                    })}
                    {isBotTyping && (
                       <div className="flex justify-start">
                          <div className="bg-white border border-gray-100 shadow-sm p-4 rounded-[20px] rounded-tl-none flex gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-gray-200 animate-bounce"></div>
                             <div className="w-1.5 h-1.5 rounded-full bg-gray-200 animate-bounce [animation-delay:0.2s]"></div>
                             <div className="w-1.5 h-1.5 rounded-full bg-gray-200 animate-bounce [animation-delay:0.4s]"></div>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* Reply Box */}
                 <div className="p-8 border-t border-gray-100 bg-white">
                    <div className="relative">
                       <textarea 
                          value={ticketReply}
                          onChange={(e) => setTicketReply(e.target.value)}
                          onKeyDown={(e) => {
                             if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendTicketMessage();
                             }
                          }}
                          placeholder="Type your response..."
                          className="w-full bg-gray-50 border border-gray-100 rounded-[28px] px-8 py-5 pr-16 focus:outline-none focus:border-indigo-500 font-medium text-[#1c1d22] resize-none h-[80px]"
                       />
                       <button 
                          onClick={sendTicketMessage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20"
                       >
                          <ArrowRight size={20} />
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'rules' && (
           <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center">
                 <h2 className="text-[32px] font-black tracking-tighter text-[#1c1d22] mb-3">Program Rules & Terms</h2>
                 <p className="text-[15px] text-gray-500 font-medium">Important policies for Affiliate Partners</p>
              </div>

              <div className="space-y-6">
                 {/* Commission Models */}
                 <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                    <h3 className="text-xl font-black text-[#1c1d22] mb-6 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Wallet size={16} />
                       </div>
                       1. Revenue Models
                    </h3>
                    <div className="space-y-4">
                       <div className="bg-gray-50 rounded-2xl p-5">
                          <h4 className="font-bold text-[#1c1d22] mb-1">RevShare (Revenue Share)</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">Earn up to 80% commission on the platform's profit generated from your referred traders. This is the primary and most lucrative model.</p>
                       </div>
                       <div className="bg-gray-50 rounded-2xl p-5">
                          <h4 className="font-bold text-[#1c1d22] mb-1">Turnover</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">Earn up to 5% commission based on the total trading volume (turnover) of your active referred traders.</p>
                       </div>
                       <div className="bg-gray-50 rounded-2xl p-5">
                          <h4 className="font-bold text-[#1c1d22] mb-1">Sub-Affiliates</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">Refer other partners to the program and earn up to 10% sub-commission on their total earnings.</p>
                       </div>
                    </div>
                 </div>

                 {/* Payout Rules */}
                 <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                    <h3 className="text-xl font-black text-[#1c1d22] mb-6 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Banknote size={16} />
                       </div>
                       2. Payout Rules
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                       <li className="flex gap-3"><span className="text-emerald-500 font-black">✓</span> <strong>Weekly Payouts:</strong> Withdrawals are processed on a weekly schedule.</li>
                       <li className="flex gap-3"><span className="text-emerald-500 font-black">✓</span> <strong>Payment Methods:</strong> Withdraw via Visa, advcash, Pix, Boleto, and Crypto.</li>
                       <li className="flex gap-3"><span className="text-emerald-500 font-black">✓</span> <strong>Active Traders:</strong> A minimum number of active depositing traders (usually 5) is required to unlock your first payout.</li>
                       <li className="flex gap-3"><span className="text-emerald-500 font-black">✓</span> <strong>Verification Holds:</strong> Traffic quality checks may result in temporary holds on payouts to prevent fraud.</li>
                    </ul>
                 </div>

                 {/* Prohibitions */}
                 <div className="bg-white rounded-[32px] p-8 border border-red-50 shadow-sm relative overflow-hidden">
                    <h3 className="text-xl font-black text-red-600 mb-6 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                          <AlertTriangle size={16} />
                       </div>
                       3. Traffic & Prohibitions
                    </h3>
                    <div className="space-y-4">
                       <div className="p-4 border-l-4 border-red-500 bg-red-50/50 rounded-r-2xl">
                          <h4 className="font-bold text-red-900 mb-1">No Self-Referrals</h4>
                          <p className="text-sm text-red-700/80">Opening a trading account via your own affiliate link, or referring family members on the same IP/Device, is strictly prohibited and results in permanent account suspension.</p>
                       </div>
                       <div className="p-4 border-l-4 border-red-500 bg-red-50/50 rounded-r-2xl">
                          <h4 className="font-bold text-red-900 mb-1">No Brand Bidding</h4>
                          <p className="text-sm text-red-700/80">Running search ads (Google, Bing) using our brand keywords (e.g. "Bivaax login") is forbidden.</p>
                       </div>
                       <div className="p-4 border-l-4 border-red-500 bg-red-50/50 rounded-r-2xl">
                          <h4 className="font-bold text-red-900 mb-1">No Spamming or False Info</h4>
                          <p className="text-sm text-red-700/80">Unsolicited spam (emails, DMs) and providing false guarantees of profit to attract users is not allowed.</p>
                       </div>
                    </div>
                 </div>

              </div>

              <div className="bg-[#1c1d22] rounded-[32px] p-8 md:p-10 text-white text-center shadow-xl border border-white/5">
                 <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400">
                    <ShieldAlert size={32} />
                 </div>
                 <h3 className="text-[22px] font-black tracking-tight mb-3">Compliance is Key</h3>
                 <p className="text-gray-400 text-[15px] max-w-sm mx-auto mb-8">Violating any of these rules will result in immediate termination of your affiliate status and forfeiture of all commissions.</p>
                 <button onClick={() => setActiveTab('support')} className="bg-white text-[#1c1d22] font-black px-10 py-5 rounded-[22px] text-[15px] uppercase tracking-widest hover:bg-gray-100 transition-all transform active:scale-95 shadow-xl shadow-black/20">
                    Contact Compliance
                 </button>
              </div>
           </div>
        )}

      {/* Profile Sidebar Drawer (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsSidebarOpen(false)}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ type: "spring", damping: 30, stiffness: 300 }}
               className="fixed inset-0 bg-[#1c1d22] z-[210] p-8 text-white shadow-2xl overflow-y-auto"
            >
               <div className="flex items-center justify-between mb-10">
                 <Logo size={28} withBackground />
                 <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white/5 rounded-full text-gray-400">
                    <X size={20} />
                 </button>
               </div>

               <div className="space-y-2">
                 {menuItems.map(item => (
                   <button 
                     key={item.id} 
                     onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
                     className={`w-full text-left py-4 px-5 rounded-2xl flex items-center gap-3 text-[14px] font-black transition-all uppercase tracking-widest ${activeTab === item.id ? 'bg-white/10 text-emerald-400 shadow-inner' : 'text-gray-400 hover:text-white'}`}
                   >
                     <item.icon size={18} />
                     {item.label}
                   </button>
                 ))}
                 
                 <div className="pt-10 border-t border-white/5 space-y-4 mt-4">
                    <div className="p-5 bg-white/5 rounded-[24px] border border-white/5">
                       <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Affiliate Balance</p>
                       <p className="text-[26px] font-black">$ {affiliateBalance.toFixed(2)}</p>
                    </div>
                    <button onClick={handleTransferEarnings} className="w-full bg-[#00dc74] text-[#0c0d12] font-black py-5 rounded-[22px] uppercase tracking-widest text-[14px] shadow-lg shadow-[#00dc74]/10">
                       Transfer to Main
                    </button>
                 </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav Mobile */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-gray-100 lg:hidden flex items-center justify-around z-[50] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe px-4">
         {[
           { id: 'dashboard', icon: Zap, label: 'Dash' },
           { id: 'statistics', icon: BarChart3, label: 'Stats' },
           { id: 'promo', icon: Award, label: 'Media' },
           { id: 'support', icon: MessageSquare, label: 'Support' },
           { id: 'rules', icon: ShieldAlert, label: 'Rules' }
         ].map((item) => (
           <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id as any)}
            className={`relative flex flex-col items-center gap-1 font-black uppercase text-[10px] tracking-[0.1em] transition-all duration-300 py-1 flex-1 ${activeTab === item.id ? 'text-indigo-600' : 'text-gray-400 opacity-70'}`}
           >
              {activeTab === item.id && (
                 <motion.div 
                    layoutId="activeBottomTab"
                    className="absolute -top-1 w-8 h-1 bg-indigo-600 rounded-full"
                 />
              )}
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} className={activeTab === item.id ? 'scale-110 mb-0.5' : ''} />
              <span className={activeTab === item.id ? 'font-black' : 'font-bold'}>{item.label}</span>
           </button>
         ))}
      </div>
      
      {/* Earnings Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCalculator(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="bg-[#1c1d22] p-8 md:p-10 text-white relative overflow-hidden">
                 <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[60px]"></div>
                 <button 
                  onClick={() => setShowCalculator(false)}
                  className="absolute right-6 top-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5 hover:bg-white/10"
                 >
                   <X size={20} />
                 </button>
                 <h2 className="text-[28px] font-black tracking-tight mb-2">Earnings Calculator</h2>
                 <p className="text-gray-400 font-medium text-[15px]">Estimate your potential revenue share earnings</p>
              </div>

              <div className="p-8 md:p-10 space-y-8">
                 <div className="space-y-6">
                    <div>
                       <div className="flex items-center justify-between mb-4">
                          <label className="text-[13px] font-black text-[#1c1d22] uppercase tracking-[0.15em]">Referrals Count</label>
                          <span className="text-indigo-600 font-black text-[18px]">{calcValues.referrals}</span>
                       </div>
                       <input 
                          type="range" 
                          min="1" 
                          max="500" 
                          value={calcValues.referrals}
                          onChange={(e) => setCalcValues({ ...calcValues, referrals: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                       />
                    </div>

                    <div>
                       <div className="flex items-center justify-between mb-4">
                          <label className="text-[13px] font-black text-[#1c1d22] uppercase tracking-[0.15em]">Month Volume / Ref</label>
                          <span className="text-indigo-600 font-black text-[18px]">$ {calcValues.volumePerRef}</span>
                       </div>
                       <input 
                          type="range" 
                          min="100" 
                          max="10000" 
                          step="100"
                          value={calcValues.volumePerRef}
                          onChange={(e) => setCalcValues({ ...calcValues, volumePerRef: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100">
                       <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Network Volume</p>
                       <p className="text-[22px] font-black text-[#1c1d22]">$ {(calcValues.referrals * calcValues.volumePerRef).toLocaleString()}</p>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-[24px] border border-emerald-100">
                       <p className="text-[11px] font-black text-emerald-600/70 uppercase tracking-widest mb-1">Your Monthly Share</p>
                       <p className="text-[22px] font-black text-emerald-600">$ {((calcValues.referrals * calcValues.volumePerRef) * (getTier().share / 100)).toLocaleString()}</p>
                    </div>
                 </div>

                 <button 
                  onClick={() => { setShowCalculator(false); setActiveTab('links'); }}
                  className="w-full bg-[#1c1d22] text-white font-black py-5 rounded-[22px] text-[15px] uppercase tracking-widest hover:bg-black transition-all active:scale-[0.98] shadow-2xl shadow-indigo-500/10"
                 >
                   Start Earning Today
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </main>

      {/* Footer Desktop */}
      <footer className="hidden md:block border-t border-gray-200 mt-28 py-14 bg-white">
        <div className="max-w-7xl mx-auto px-10 flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Logo size={24} />
               <span className="font-black tracking-tighter text-[20px] text-[#1c1d22]">BIVAAX</span>
            </div>
            <div className="flex items-center gap-10">
               {['About Network', 'Partner Terms', 'Support', 'Asset Center'].map(item => (
                 <button key={item} className="text-[12px] font-black text-gray-400 hover:text-[#1c1d22] transition-colors tracking-widest uppercase">{item}</button>
               ))}
            </div>
            <p className="text-[12px] font-black text-gray-400 tracking-widest uppercase">© 2026 BIVAAX • GLOBAL PARTNER NETWORK</p>
          </div>
          <div className="text-[11px] text-gray-400 leading-relaxed font-medium pt-8 border-t border-gray-50 border-dashed">
            The Bivaax Partner Program is subject to the Affiliate Terms of Service. Commissions are calculated based on net revenue generated by referred clients. Elite status is granted based on volume performance.
          </div>
        </div>
      </footer>
    </div>
  );
}


