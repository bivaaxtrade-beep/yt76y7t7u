import React, { useState, useEffect, useRef } from 'react';
import SEO from '../components/SEO';
// Test comment
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc, query, onSnapshot, orderBy, addDoc, limit, where } from '../firebase';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { 
  ArrowLeft, Users, Activity, User, DollarSign, Search, ShieldCheck, Power, 
  Settings2, RefreshCw, BarChart2, TrendingUp, TrendingDown, RefreshCcw, 
  Bell, CreditCard, Lock, Unlock, Filter, MoreVertical, Trash2, Ban, 
  Target, Zap, Trophy, Snowflake, LayoutDashboard, Database, Wallet, 
  ChevronRight, Globe, HardDrive, Cpu, AlertTriangle, UserCheck, Shield, MessageCircle,
  Megaphone, GraduationCap, Plus, X, Check, Eye, Edit2, Gift, FileText, Clock, Menu, LogOut, ArrowUpRight, Star, ExternalLink,
  Youtube, Instagram, Send, Facebook, Music2, Share, Award, Copy, ShieldOff, UserX, Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { currencies, formatWithCurrency, getCurrencySymbol } from '../lib/currencies';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, Cell, BarChart, Bar 
} from 'recharts';
import { AssetLogo } from '../components/AssetLogo';
import { MarketControlCard } from '../components/MarketControlCard';
import { AgentSupportHub } from '../components/AgentSupportHub';

type Role = 'superadmin' | 'admin' | 'moderator' | 'support' | 'user';
type PermissionKey = 'canManageUsers' | 'canManageStaff' | 'canManageFinance' | 'canManageContent' | 'canManageMarkets' | 'canManageSystem';
type AdminTab = 'stats' | 'market' | 'banners' | 'users' | 'finance' | 'deposits' | 'news' | 'education' | 'settings' | 'staff' | 'promotions' | 'tournaments' | 'logs' | 'tickets' | 'pages' | 'client_agreement' | 'aml_policy' | 'affiliate' | 'signals' | 'copytrading' | 'kyc';

const INITIAL_PERMISSIONS: Record<PermissionKey, boolean> = {
  canManageUsers: false,
  canManageStaff: false,
  canManageFinance: false,
  canManageContent: false,
  canManageMarkets: false,
  canManageSystem: false
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('market');
  const [marketFilter, setMarketFilter] = useState<'all' | 'currencies' | 'otc' | 'crypto' | 'commodities'>('all');

  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [depositRequests, setDepositRequests] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [depositMethods, setDepositMethods] = useState<any[]>([]);
  const [promoMaterials, setPromoMaterials] = useState<any[]>([]);
  const [affPayouts, setAffPayouts] = useState<any[]>([]);
  const [affPayoutFilterStatus, setAffPayoutFilterStatus] = useState<string>('all');
  const [affPayoutSortDate, setAffPayoutSortDate] = useState<'desc' | 'asc'>('desc');
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [isProcessingAffPayout, setIsProcessingAffPayout] = useState<Record<string, boolean>>({});
  const [signals, setSignals] = useState<any[]>([]);
  const [masterTraders, setMasterTraders] = useState<any[]>([]);
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [appConfig, setAppConfig] = useState<any>({});
  const [affiliateStats, setAffiliateStats] = useState({ totalAffiliates: 0, totalReferrals: 0, totalCommission: 0 });
  const [aboutUsData, setAboutUsData] = useState<any>({
    title: "", paragraphs: [], advantages: [], contacts: { companyName: "", address: "", email: "" }
  });
  const [clientAgreementData, setClientAgreementData] = useState<any>({
    title: "Client Agreement", content: ""
  });
  const [regulationsData, setRegulationsData] = useState<any>({
    title: "The Financial Commission",
    introParas: [
      "The Financial Commission is a neutral and independent dispute resolution organization that specializes in financial markets.",
      "Since May 2018, Bivaax has been a category \"A\" member of The Financial Commission. This speaks to the reliability of the company and guarantees our traders quality of services, transparency of relationships, and the protection of an independent professional organization. By joining The Financial Commission, Bivaax reaffirms its commitment to maintaining the highest standards of trading honor and best business practices."
    ],
    certificateUrl: "#",
    compensationFundText: "The Compensation Fund is a service included with The Financial Commission membership, which provides protection up to €20,000 per case should a Member refuse to adhere to a judgment from The Financial Commission.",
    appealSteps: [
      "Please contact us first. Tell us about the situation in an email and send it to support@bivaax.trade with the subject \"Let's figure it out.\" We will find a solution and reply to you during business hours within 72 hours of receiving the email. We will be able to accept appeals for 1 month following the date the disputed situation arose.",
      "Read the response and follow the proposed action plan to resolve the issue.",
      "In the event that your question is not resolved in full or you are not satisfied with the result, you have the right to send an appeal to The Financial Commission describing the situation in this Form."
    ],
    appealNote: "The Financial Commission accepts appeals for 45 days following the date of the controversial situation and only after the trader has tried to resolve the issue with the company directly.",
    traderFeatures: [
      { title: "You are well protected thanks to the commission's compensation fund which covers up to €20,000 per claim.", icon: "shield" },
      { title: "You have access to a neutral and impartial environment for the resolution of any claim..", icon: "scales" },
      { title: "Your situation will be looked into and resolved quickly and effectively.", icon: "doc" }
    ],
    vmtSection: {
      title: "A service that certifies the quality of trade execution, Verify My Trade (VMT)",
      paras: [
        "Bivaax underwent an audit by Verify My Trade (VMT) successfully and received a certificate of quality of trades.",
        "Verify My Trade is a specialized service that certifies the quality of trade execution. This organization cooperates with The Financial Commission, which makes it possible to transparently and reliably assess the quality of trade execution with brokers. Bivaax always takes care to ensure the quality of services provided, and therefore agreed to undergo a monthly audit on 5,000 executed trades by VerifyMyTrade."
      ]
    }
  });
  const [fmpApiKey, setFmpApiKey] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [adminSelectedTicket, setAdminSelectedTicket] = useState<any>(null);
  const [adminTicketMessages, setAdminTicketMessages] = useState<any[]>([]);
  const [adminTicketReply, setAdminTicketReply] = useState("");
  const adminMessagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    adminMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [adminTicketMessages]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<Role>('user');
  const [userPermissions, setUserPermissions] = useState<Record<PermissionKey, boolean>>(INITIAL_PERMISSIONS);
  const socketRef = useRef<any>(null);

  // Market Controls State
  const [marketState, setMarketState] = useState<any>(null);
  const [globalMessage, setGlobalMessage] = useState('');
  const [banners, setBanners] = useState<any[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'news' | 'education' | 'promotions' | 'tournaments' | 'banner' | 'user' | 'deposit' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [financeSubTab, setFinanceSubTab] = useState<'deposits' | 'withdrawals'>('deposits');
  const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null);
  const [userDetailTab, setUserDetailTab] = useState<'overview' | 'trades' | 'finances' | 'profile' | 'security' | 'staff'>('overview');
  const [selectedUserTrades, setSelectedUserTrades] = useState<any[]>([]);
  const [selectedUserTransactions, setSelectedUserTransactions] = useState<any[]>([]);
  const [selectedKYCRequest, setSelectedKYCRequest] = useState<any>(null);

  const logAdminAction = async (action: string, description: string) => {
      try {
          if (!auth.currentUser) return;
          await addDoc(collection(db, 'systemLogs'), {
              action,
              description,
              adminId: auth.currentUser.uid,
              adminEmail: auth.currentUser.email,
              timestamp: Date.now()
          });
      } catch (error) {
          console.error("Failed to log admin action:", error);
      }
  };

  const sendAdminReply = async () => {
    if (!adminSelectedTicket || !adminTicketReply.trim() || !auth.currentUser) return;
    try {
      await addDoc(collection(db, 'tickets', adminSelectedTicket.id, 'messages'), {
        senderId: auth.currentUser.uid,
        senderName: "Support Team",
        senderType: 'support',
        text: adminTicketReply,
        createdAt: Date.now()
      });
      
      await updateDoc(doc(db, 'tickets', adminSelectedTicket.id), {
        status: 'pending',
        lastMessage: adminTicketReply,
        updatedAt: Date.now()
      });

      setAdminTicketReply("");
      logAdminAction('reply_ticket', `Replied to ticket ${adminSelectedTicket.id}`);
    } catch (e) {
      console.error("Error sending reply:", e);
      alert("Failed to send reply");
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        status,
        updatedAt: Date.now()
      });
      logAdminAction('update_ticket_status', `Updated ticket ${ticketId} to ${status}`);
    } catch (e) {
      console.error("Error updating ticket status:", e);
    }
  };

  const fetchMarketState = async () => {
    try {
      const res = await fetch('/api/market/state');
      const data = await res.json();
      setMarketState(data);
    } catch(e) {
      console.error("Failed to fetch market state");
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/activities');
      const data = await res.json();
      setBanners(data);
    } catch(e) {
      console.error("Failed to fetch banners");
    }
  };

  const fetchStaticAdminData = async () => {
    try {
      const fetchCollectionInfo = async (action: any, setter: any, name: string) => {
        try {
           const snap = await action;
           if (snap && snap.docs) {
               const data = snap.docs.map((d: any) => ({id: d.id, ...d.data()}));
               setter(data);
           } else if (snap && snap.exists && snap.exists()) {
               setter(snap.data());
           }
        } catch (e) {
           console.warn(`Admin static fetch failed for ${name}: `, e);
        }
      };

      await Promise.all([
         fetchCollectionInfo(getDocs(query(collection(db, 'systemLogs'), orderBy('timestamp', 'desc'), limit(50))), setSystemLogs, 'systemLogs'),
         fetchCollectionInfo(getDocs(query(collection(db, 'news'), orderBy('date', 'desc'), limit(50))), setNews, 'news'),
         fetchCollectionInfo(getDocs(query(collection(db, 'education'), limit(50))), setEducation, 'education'),
         fetchCollectionInfo(getDocs(query(collection(db, 'promotions'), limit(50))), setPromotions, 'promotions'),
         fetchCollectionInfo(getDocs(query(collection(db, 'tournaments'), limit(50))), setTournaments, 'tournaments'),
         fetchCollectionInfo(getDocs(query(collection(db, 'depositMethods'), limit(50))), setDepositMethods, 'depositMethods'),
         fetchCollectionInfo(getDocs(query(collection(db, 'promoMaterials'), limit(50))), setPromoMaterials, 'promoMaterials'),
         fetchCollectionInfo(getDocs(query(collection(db, 'signals'), limit(50))), setSignals, 'signals'),
         fetchCollectionInfo(getDocs(query(collection(db, 'masterTraders'), limit(50))), setMasterTraders, 'masterTraders'),
         fetchCollectionInfo(getDoc(doc(db, 'app_config', 'settings')), setAppConfig, 'settings'),
         fetchCollectionInfo(getDoc(doc(db, 'pages', 'about_us')), setAboutUsData, 'about_us'),
         fetchCollectionInfo(getDoc(doc(db, 'pages', 'client_agreement')), setClientAgreementData, 'client_agreement'),
         fetchCollectionInfo(getDoc(doc(db, 'pages', 'regulations')), setRegulationsData, 'regulations')
      ]);

      try {
         const affPayoutsSnap = await getDocs(query(collection(db, 'affiliate_payouts'), limit(100)));
         const affList = affPayoutsSnap.docs.map(d => ({id: d.id, ...d.data()}));
         affList.sort((a: any, b: any) => {
            const tA = (a.createdAt && typeof a.createdAt.toDate === 'function') ? a.createdAt.toDate().getTime() : (a.createdAt || 0);
            const tB = (b.createdAt && typeof b.createdAt.toDate === 'function') ? b.createdAt.toDate().getTime() : (b.createdAt || 0);
            return tB - tA;
         });
         setAffPayouts(affList);
      } catch (e) {
         console.warn("Failed affPayouts", e);
      }
    } catch (err) {
      console.warn("Admin static data fetch issue:", err);
    }
  };

  const fetchLists = async () => {
    try {
        // Fetch admins from Firestore as secondary
        const adminsSnap = await getDocs(collection(db, 'admins'));
        setAdmins(adminsSnap.docs.map(d => ({id: d.id, ...d.data()})));
    } catch (err) {
        console.warn("Lists fetch issue:", err);
    }
  };

  useEffect(() => {
    if (!Array.isArray(users)) return;
    const affiliates = users.filter((u: any) => 
        users.some((other: any) => 
            other.referredByUid === u.id || 
            (u.affiliateId && String(other.referredBy) === String(u.affiliateId))
        )
    );
    const totalReferrals = users.filter((u: any) => u.referredBy || u.referredByUid).length;
    const totalCommission = users.reduce((acc, u: any) => acc + (u.totalAffiliateEarnings || 0), 0); 
    setAffiliateStats({
        totalAffiliates: affiliates.length,
        totalReferrals,
        totalCommission
    });
  }, [users]);

  // Detection logic for multi-accounting
  const securityRiskUsers = React.useMemo(() => {
    const risks: Record<string, { ipMatch: boolean, deviceMatch: boolean, affiliateSelfReferral: boolean }> = {};
    const ipMap: Record<string, string[]> = {};
    const deviceMap: Record<string, string[]> = {};

    users.forEach(u => {
      if (u.lastIp) {
        if (!ipMap[u.lastIp]) ipMap[u.lastIp] = [];
        ipMap[u.lastIp].push(u.id);
      }
      if (u.lastDeviceId) {
        if (!deviceMap[u.lastDeviceId]) deviceMap[u.lastDeviceId] = [];
        deviceMap[u.lastDeviceId].push(u.id);
      }
    });

    users.forEach(u => {
      const referrer = users.find(r => r.id === u.referredByUid);
      risks[u.id] = {
        ipMatch: u.lastIp ? ipMap[u.lastIp].length > 1 : false,
        deviceMatch: u.lastDeviceId ? deviceMap[u.lastDeviceId].length > 1 : false,
        affiliateSelfReferral: referrer ? (referrer.lastIp === u.lastIp || referrer.lastDeviceId === u.lastDeviceId) : false
      };
    });

    return risks;
  }, [users]);

  useEffect(() => {
    socketRef.current = io({ path: '/socket.io', transports: ['polling', 'websocket'] });
    
    socketRef.current.on('market_ticks', (ticks: any) => {
        setMarketState((prev: any) => {
            if (!prev) return prev;
            const newMarkets = { ...prev.markets };
            for (const [pair, data] of Object.entries(ticks)) {
                if (newMarkets[pair]) {
                    newMarkets[pair].price = (data as any).price;
                }
            }
            return { ...prev, markets: newMarkets };
        });
    });

    socketRef.current.on('market_settings_updated', (markets: any) => {
        setMarketState((prev: any) => ({ ...prev, markets }));
    });

    socketRef.current.on('system_status', (systemActive: boolean) => {
        setMarketState((prev: any) => ({ ...prev, systemActive }));
    });

    socketRef.current.on('global_manipulation_status', (mode: string) => {
        setMarketState((prev: any) => ({ ...prev, globalManipulationMode: mode }));
    });

    return () => {
        if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const unsubAuth = auth.onAuthStateChanged(async (user) => {
        // Clear previous listeners
        unsubs.forEach(u => u());
        unsubs = [];

        if (!user) {
            navigate('/');
            return;
        }

        try {
            const rawAdminEmail = import.meta.env.VITE_ADMIN_EMAIL;
            const adminEmail = (rawAdminEmail && rawAdminEmail !== 'undefined' && rawAdminEmail !== 'null' && rawAdminEmail.trim() !== '') 
                ? rawAdminEmail.toLowerCase().trim() 
                : "hamproosapport@gmail.com";
            const userEmail = user.email?.toLowerCase();
            const isSuperEmail = (adminEmail && userEmail === adminEmail) || userEmail === "hamproosapport@gmail.com" || userEmail === "hamproosupport@gmail.com" || userEmail === "bivaaxtrade@gmail.com" || user.uid === "HFvr43UhRiTSjb6m5sQJHmHGNvm1";
            
            let adminData: any = null;
            let roleInDb: Role = 'user';
            try {
                const adminDoc = await getDoc(doc(db, 'admins', user.uid));
                adminData = adminDoc.exists() ? adminDoc.data() : null;
                roleInDb = adminData ? adminData.role as Role : 'user';
            } catch (err: any) {
                console.warn("Could not fetch admin document due to rules or network issue:", err.message);
                if (isSuperEmail) {
                    roleInDb = 'superadmin';
                }
            }

            const permsInDb = adminData?.permissions || (roleInDb === 'superadmin' ? {
              canManageUsers: true,
              canManageStaff: true,
              canManageFinance: true,
              canManageContent: true,
              canManageMarkets: true,
              canManageSystem: true
            } : INITIAL_PERMISSIONS);
            
            const finalRole: Role = isSuperEmail ? 'superadmin' : roleInDb;
            const finalPermissions = isSuperEmail ? {
              canManageUsers: true,
              canManageStaff: true,
              canManageFinance: true,
              canManageContent: true,
              canManageMarkets: true,
              canManageSystem: true
            } : permsInDb;
            
            if (finalRole === 'user') {
                navigate('/');
                return;
            }

            setUserRole(finalRole);
            setUserPermissions(finalPermissions);

            // Add persistent real-time listeners for remaining Firestore collections if any
            // Deposits, Withdrawals, and Users moved to SQL fetch below
            
            unsubs.push(onSnapshot(query(collection(db, 'systemLogs'), orderBy('timestamp', 'desc'), limit(50)), (snap) => {
                setSystemLogs(snap.docs.map(d => ({id: d.id, ...d.data()})));
            }));
            
            unsubs.push(onSnapshot(collection(db, 'users'), (snap) => {
                setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})));
            }));

            unsubs.push(onSnapshot(collection(db, 'deposits'), (snap) => {
                setDepositRequests(snap.docs.map(d => ({id: d.id, ...d.data()})));
            }));
            
            unsubs.push(onSnapshot(collection(db, 'withdrawals'), (snap) => {
                setWithdrawals(snap.docs.map(d => ({id: d.id, ...d.data()})));
            }));

            unsubs.push(onSnapshot(collection(db, 'kycRequests'), (snap) => {
                setKycRequests(snap.docs.map(d => ({id: d.id, ...d.data()})));
            }));

            unsubs.push(onSnapshot(collection(db, 'tickets'), (snap) => {
                setTickets(snap.docs.map(d => ({id: d.id, ...d.data()})));
            }));
            
            const token = await user.getIdToken();
            await Promise.all([
                fetchLists(),
                fetchStaticAdminData(),
                fetchMarketState(),
                fetchBanners(),
                fetch('/api/admin/config/fmp-key', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then(res => res.ok ? res.json() : null).then(data => data && setFmpApiKey(data.fmpApiKey || ''))
            ]);

            setLoading(false);
        } catch(e) {
            console.error("Admin init error:", e);
        }
    });

    return () => {
        unsubAuth();
        unsubs.forEach(u => u());
    };
  }, [navigate]);

  useEffect(() => {
    if (!adminSelectedTicket) {
      setAdminTicketMessages(prev => prev.length === 0 ? prev : []);
      return;
    }
    
    // Only proceed if authenticated (and presumably admin)
    if (!auth.currentUser) return;
    
    const tid = adminSelectedTicket.id;
    const unsubMessages = onSnapshot(
      query(collection(db, "tickets", tid, "messages"), orderBy("createdAt", "asc")),
      (snapshot) => {
        setAdminTicketMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        // Only report if we haven't logged out
        if (auth.currentUser) {
           handleFirestoreError(error, OperationType.GET, "tickets/" + tid + "/messages");
        }
      }
    );
    
    return () => unsubMessages();
  }, [adminSelectedTicket?.id]);

  // Actions
  const rawAdminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const adminOwnerEmail = (rawAdminEmail && rawAdminEmail !== 'undefined' && rawAdminEmail !== 'null' && rawAdminEmail.trim() !== '') 
      ? rawAdminEmail.toLowerCase().trim() 
      : "hamproosapport@gmail.com";
  const currentUserEmail = auth.currentUser?.email?.toLowerCase();
  const isOwner = (currentUserEmail === adminOwnerEmail) || currentUserEmail === "hamproosapport@gmail.com" || currentUserEmail === "hamproosupport@gmail.com" || currentUserEmail === "bivaaxtrade@gmail.com" || auth.currentUser?.uid === "HFvr43UhRiTSjb6m5sQJHmHGNvm1";

  const isSuper = userRole === 'superadmin';
  const isAdminPerm = isSuper || userRole === 'admin' || userPermissions.canManageSystem;
  const isMod = isAdminPerm || userRole === 'moderator' || userPermissions.canManageFinance || userPermissions.canManageUsers;
  
  const canManageUsers = isSuper || userPermissions.canManageUsers;
  const canManageStaff = isSuper || userPermissions.canManageStaff;
  const canManageFinance = isSuper || userPermissions.canManageFinance;
  const canManageContent = isSuper || userPermissions.canManageContent;
  const canManageMarkets = isSuper || userPermissions.canManageMarkets;
  const canManageSystem = isSuper || userPermissions.canManageSystem;

  useEffect(() => {
    if (!selectedUserDetail) {
      setSelectedUserTrades(prev => prev.length === 0 ? prev : []);
      setSelectedUserTransactions(prev => prev.length === 0 ? prev : []);
      return;
    }

    const unsubTrades = onSnapshot(
        query(collection(db, 'trades'), where('userId', '==', selectedUserDetail.id), orderBy('createdAt', 'desc'), limit(100)),
        (snap) => {
            setSelectedUserTrades(snap.docs.map(d => ({id: d.id, ...d.data()})));
        }
    );

    const userDeposits = (Array.isArray(depositRequests) ? depositRequests : []).filter(d => d.userId === selectedUserDetail.id).map(d => ({ ...d, type: 'Deposit' }));
    const userWithdrawals = (Array.isArray(withdrawals) ? withdrawals : []).filter(w => w.userId === selectedUserDetail.id).map(w => ({ ...w, type: 'Withdrawal' }));
    
    const combined = [...userDeposits, ...userWithdrawals].sort((a: any, b: any) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp || 0);
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp || 0);
        return timeB - timeA;
    });

    setSelectedUserTransactions(combined);

    return () => unsubTrades();
  }, [selectedUserDetail, depositRequests, withdrawals]);

  const handleUpdateBalance = async (userId: string, currentBalance: number, field: string = 'balance', action: 'set' | 'add' | 'subtract' = 'set') => {
      const label = field === 'balance' ? 'Real' : field === 'demoBalance' ? 'Demo' : 'Affiliate';
      let promptMsg = `Enter new ${label} balance (৳):`;
      if (action === 'add') promptMsg = `Enter amount to ADD to ${label} balance (৳):`;
      if (action === 'subtract') promptMsg = `Enter amount to SUBTRACT from ${label} balance (৳):`;

      const inputStr = prompt(promptMsg, action === 'set' ? currentBalance.toString() : "");
      if (inputStr === null) return;
      const inputVal = parseFloat(inputStr);
      if (isNaN(inputVal)) return alert("Invalid number");
      
      let newBalance = inputVal;
      if (action === 'add') newBalance = currentBalance + inputVal;
      if (action === 'subtract') newBalance = Math.max(0, currentBalance - inputVal);

      try {
          // Update legacy Firestore
          await updateDoc(doc(db, 'users', userId), { [field]: newBalance });
          
          // Update primary SQL DB
          const sqlField = field === 'balance' ? 'realBalance' : field;
          await fetch('/api/admin/users/update-balance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, field: sqlField, value: newBalance.toFixed(2) })
          });

          await logAdminAction('Balance Adjustment', `${action.toUpperCase()} ${label} balance of user ${userId} to ৳${newBalance} (Adjusted by ৳${inputVal})`);
          if (selectedUserDetail && selectedUserDetail.id === userId) {
              setSelectedUserDetail({...selectedUserDetail, [field]: newBalance});
          }
          toast.success(`${label} balance updated`);
      } catch(e: any) { toast.error(e.message); }
  };

  const handleUpdateUserField = async (userId: string, field: string, value: any, label: string) => {
    if (!isAdminPerm) return;
    try {
      await updateDoc(doc(db, 'users', userId), { [field]: value });
      await logAdminAction('Profile Update', `Updated ${label} for user ${userId} to ${value}`);
      if (selectedUserDetail && selectedUserDetail.id === userId) {
        setSelectedUserDetail({ ...selectedUserDetail, [field]: value });
      }
      toast.success(`${label} updated successfully`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleWithdrawalStatus = async (id: string, status: 'approved' | 'rejected' | 'success', userId?: string, amount?: number, orderId?: string) => {
      if (!isMod) return;
      try {
          await updateDoc(doc(db, 'withdrawals', id), { status });
          if (status === 'rejected' && userId && amount) {
              const { increment } = await import('../firebase');
              await updateDoc(doc(db, 'users', userId), { balance: increment(amount) });
          }
          
          if (userId) {
              const txQuery = orderId 
                  ? query(collection(db, `users/${userId}/transactions`), where('orderId', '==', orderId))
                  : query(collection(db, `users/${userId}/transactions`), where('amount', '==', amount), where('type', '==', 'Withdrawal'), limit(1));
              const txSnap = await getDocs(txQuery);
              if (!txSnap.empty) {
                  const txStatus = status === 'success' ? 'Completed' : status === 'rejected' ? 'Rejected' : status;
                  await updateDoc(doc(db, `users/${userId}/transactions`, txSnap.docs[0].id), { status: txStatus });
              }
          }
          
          await logAdminAction('Processed Withdrawal', `Marked withdrawal ${id} as ${status}`);
      } catch(e: any) { alert(e.message); }
  };

  const handleDepositStatus = async (id: string, status: 'approved' | 'success' | 'rejected', userId: string, amount: number, currency: string, orderId?: string) => {
      if (!isMod) return;
      try {
          // Calculate the base amount once for both operations
          const currObj = currencies.find(c => c.code === currency) || currencies[0];
          const finalAmountInBase = amount / currObj.rate;
          
          await updateDoc(doc(db, 'deposits', id), { status });
          
          if (status === 'success') {
              const { increment } = await import('../firebase');
              await updateDoc(doc(db, 'users', userId), { 
                  balance: increment(finalAmountInBase),
                  totalDeposits: increment(finalAmountInBase)
              });
          }
          
          // Call server database update
          await fetch('/api/admin/deposits/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, status, userId, finalAmountInBase })
          });
          
          const txQuery = orderId 
              ? query(collection(db, `users/${userId}/transactions`), where('orderId', '==', orderId))
              : query(collection(db, `users/${userId}/transactions`), where('amount', '==', amount), where('type', '==', 'Deposit'), limit(1));
          const txSnap = await getDocs(txQuery);
          if (!txSnap.empty) {
              const txStatus = status === 'success' ? 'Completed' : status === 'rejected' ? 'Rejected' : status;
              await updateDoc(doc(db, `users/${userId}/transactions`, txSnap.docs[0].id), { status: txStatus });
          }
          
          await logAdminAction('Processed Deposit', `Marked deposit ${id} as ${status}`);
      } catch(e: any) { alert(e.message); }
  };

  const clearServerCache = async () => {
    try {
      await fetch('/api/admin/system/clear-cache', { method: 'POST' });
      console.log('Server cache cleared');
    } catch (e) {
      console.error('Failed to clear server cache:', e);
    }
  };

  const handleSaveItem = async () => {
      if (!editingItem || !modalType) return;
      try {
          const col = modalType === 'news' ? 'news' : 
                      modalType === 'education' ? 'education' : 
                      modalType === 'promotions' ? 'promotions' : 
                      modalType === 'tournaments' ? 'tournaments' : 
                      modalType === 'deposit' ? 'depositMethods' : 
                      modalType === 'signals' ? 'signals' :
                      modalType === 'promoMaterials' ? 'promoMaterials' :
                      modalType === 'masterTraders' ? 'masterTraders' : null;
          if (!col) return;

          if (modalType === 'deposit') {
              if (editingItem.minDeposit > editingItem.maxDeposit) {
                  alert("Min deposit cannot be greater than max deposit");
                  return;
              }
              // Force newly created items to be active by default
              if (!editingItem.id && editingItem.isActive === undefined) {
                  editingItem.isActive = true;
              }
              // If isActive is still undefined on edit, default to true
              if (editingItem.isActive === undefined) editingItem.isActive = true;
          }

          if (editingItem.id) {
              const { id, ...data } = editingItem;
              await updateDoc(doc(db, col, id), data);
              await logAdminAction('Updated Item', `Updated ${modalType} item: ${editingItem.title || id || editingItem.name}`);
          } else {
              const { id, ...data } = editingItem;
              await addDoc(collection(db, col), { ...data, createdAt: Date.now() });
              await logAdminAction('Created Item', `Created new ${modalType} item: ${editingItem.title || editingItem.name}`);
          }
          await fetchStaticAdminData();
          await clearServerCache();
          setShowModal(false);
      } catch(e: any) { alert(e.message); }
  };

  const handleDeleteItem = async (col: string, id: string) => {
      if (!confirm("Delete this permanently?")) return;
      try {
          await deleteDoc(doc(db, col, id));
          await logAdminAction('Deleted Item', `Deleted item ${id} from ${col}`);
          await fetchStaticAdminData();
          await clearServerCache();
      } catch(e: any) { alert(e.message); }
  };

  const updateMarket = async (pair: string, updates: any) => {
      await fetch('/api/admin/market/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pair, ...updates })
      });
      await logAdminAction('Updated Market', `Updated ${pair} market state: ${JSON.stringify(updates)}`);
      fetchMarketState();
  };

  const savePages = async () => {
    try {
      await setDoc(doc(db, 'pages', 'about_us'), aboutUsData, { merge: true });
      await setDoc(doc(db, 'pages', 'client_agreement'), clientAgreementData, { merge: true });
      await setDoc(doc(db, 'pages', 'regulations'), regulationsData, { merge: true });
      await logAdminAction('Updated Pages', 'Successfully updated static pages content');
      await clearServerCache();
      alert("Successfully saved Static Pages");
    } catch(e: any) {
      alert("Failed to save: " + e.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center">Loading Authority...</div>;

  const filteredUsers = Array.isArray(users) ? users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.id?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col lg:flex-row overflow-hidden font-sans">
      <SEO title="Admin Dashboard" description="Manage your Admin Dashboard on Bivaax Trade Platform." />

      
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/5 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between z-[190] px-6">
        <div className="flex items-center gap-3">
           <button onClick={() => setIsSidebarOpen(true)} className="w-10 h-10 bg-[#15161d] rounded-xl flex items-center justify-center text-gray-400 active:scale-95 transition-transform">
             <Menu size={22} />
           </button>
           <div className="flex flex-col">
             <span className="font-black text-[12px] text-white tracking-widest uppercase">Admin</span>
             <span className="text-[10px] text-yellow-500 font-bold uppercase leading-none">Console</span>
           </div>
        </div>
        <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-black text-xs shadow-lg shadow-yellow-500/10">
          MH
        </div>
      </div>

      {/* SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* SIDEBAR */}
      <aside className={`fixed lg:static top-0 left-0 bottom-0 w-72 bg-[#0a0a0f] border-r border-[#1a1a24] flex flex-col shrink-0 z-[210] transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-8 flex flex-col h-full overflow-y-auto">
           <div className="flex items-center justify-between mb-10">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-black shadow-lg shadow-yellow-500/20">
                    <ShieldCheck size={22} />
                </div>
                <div className="flex flex-col">
                    <div className="text-[15px] font-black uppercase tracking-tight leading-none">COMMAND</div>
                    <span className="text-[8px] text-yellow-500 font-bold uppercase tracking-[0.2em] mt-1">{userRole}</span>
                </div>
             </div>
             <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-white">
                <X size={24} />
             </button>
           </div>

           <nav className="flex flex-col gap-1.5 w-full mb-10">
              {[
                  { id: 'stats', label: 'Dashboard', icon: LayoutDashboard, show: isMod },
                  { id: 'market', label: 'Real-time Markets', icon: Activity, show: isMod },
                  { id: 'users', label: 'Traders & Wallets', icon: Users, show: isMod || userRole === 'support' },
                  { id: 'kyc', label: 'KYC Operations', icon: ShieldCheck, show: isMod },
                  { id: 'finance', label: 'Finance Center', icon: Wallet, show: isMod || userRole === 'support' },
                  { id: 'affiliate', label: 'Affiliate Network', icon: ExternalLink, show: isAdminPerm },
                  { id: 'signals', label: 'Signal Center', icon: Zap, show: isMod },
                  { id: 'copytrading', label: 'Copy Masters', icon: UserCheck, show: isMod },
                  { id: 'deposits', label: 'Deposit Methods', icon: CreditCard, show: isAdminPerm },
                  { id: 'banners', label: 'Asset Sources', icon: Database, show: isAdminPerm },
                  { id: 'news', label: 'News Engine', icon: Megaphone, show: isMod },
                  { id: 'education', label: 'Trade Academy', icon: GraduationCap, show: isMod },
                  { id: 'promotions', label: 'Dynamic Bonuses', icon: Zap, show: isAdminPerm },
                  { id: 'tournaments', label: 'Arena Events', icon: Trophy, show: isMod },
                  { id: 'tickets', label: 'Support Tickets', icon: MessageCircle, show: isMod || userRole === 'support' },
                  { id: 'pages', label: 'About Us', icon: FileText, show: isAdminPerm },
                  { id: 'client_agreement', label: 'Client Agreement', icon: FileText, show: isAdminPerm },
                  { id: 'aml_policy', label: 'AML Policy', icon: Shield, show: isAdminPerm },
                  { id: 'logs', label: 'Control Logs', icon: FileText, show: isSuper },
                  { id: 'settings', label: 'System Kernel', icon: Settings2, show: isAdminPerm },
              ].filter(t => t.show).map(t => (
                  <button 
                    key={t.id}
                    onClick={() => { setActiveTab(t.id as any); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-3.5 px-4 py-4 rounded-2xl transition-all relative ${
                        activeTab === t.id ? 'bg-yellow-500 text-black font-bold shadow-xl shadow-yellow-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <t.icon size={20} className={activeTab === t.id ? 'text-black' : 'text-gray-500'} />
                    <span className="text-[14px]">{t.id === 'deposits' ? 'Payment Gateway' : t.label}</span>
                    {t.id === 'finance' && (((Array.isArray(withdrawals) ? withdrawals : []).filter(w => w.status === 'pending').length + (Array.isArray(depositRequests) ? depositRequests : []).filter(d => d.status === 'pending').length) > 0) && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg border border-white/10 animate-pulse">
                            {(Array.isArray(withdrawals) ? withdrawals : []).filter(w => w.status === 'pending').length + (Array.isArray(depositRequests) ? depositRequests : []).filter(d => d.status === 'pending').length}
                        </span>
                    )}
                  </button>
              ))}
           </nav>

           <div className="mt-auto pt-8 border-t border-[#1a1a24]">
              <button 
                onClick={() => navigate('/trade')} 
                className="w-full flex items-center gap-3.5 px-4 py-4 text-red-500 hover:bg-red-500/5 rounded-2xl text-[14px] font-bold transition-all"
              >
                  <LogOut size={20} /> Exit to Control
              </button>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto px-6 py-10 lg:p-12 relative z-10">
        <button 
            onClick={() => navigate(-1)} 
            className="mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
        >
            <ArrowLeft size={18} />
            <span className="font-bold text-xs uppercase tracking-widest">Back</span>
        </button>
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
           {activeTab === 'stats' && (
               <motion.div key="stats-tab-content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                   <header className="flex flex-col gap-2 mb-10">
                    <div className="flex items-center gap-2 text-yellow-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                      Global Proxy Status: Online
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                      System <span className="text-yellow-500">Node</span> 01
                    </h1>
                    <p className="text-gray-500 text-sm font-medium max-w-lg">
                      Real-time analytics engine processing user liquidity and market stability across the decentralized network.
                    </p>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                     {[
                         { id: 'liq', label: 'Active Liquidity', val: Array.isArray(users) ? users.length : 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                         { id: 'cache', label: 'System Cache', val: `৳${(Array.isArray(users) ? users : []).reduce((acc, u) => acc + (u.balance || 0), 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
                         { id: 'escrow', label: 'Escrow Queue', val: (Array.isArray(withdrawals) ? withdrawals.filter(w => w.status === 'pending').length : 0) + (Array.isArray(depositRequests) ? depositRequests.filter(d => d.status === 'pending').length : 0), icon: Wallet, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                         { id: 'link', label: 'Market Link', val: marketState?.systemActive ? 'ENCRYPTED' : 'OFFLINE', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                     ].map((s) => (
                         <div key={`stat-card-${s.id}`} className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[40px] space-y-6 hover:border-yellow-500/20 transition-all group">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shadow-white/5 bg-[#15161d]">
                               <s.icon size={24} className={s.color} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">{s.label}</p>
                                <p className="text-3xl font-black text-white tracking-tighter">{s.val}</p>
                            </div>
                         </div>
                     ))}
                  </div>

                            <div className="bg-[#0a0a0f]/50 backdrop-blur-xl border border-white/5 rounded-[48px] p-8 lg:p-16 flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative group">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 blur-[100px] rounded-full -mr-48 -mt-48 group-hover:bg-yellow-500/10 transition-colors" />
                      <div className="flex-1 space-y-6 relative z-10 text-center lg:text-left">
                          <h3 className="text-4xl md:text-5xl font-black text-white leading-[1.1]">The console is <span className="text-yellow-500 underline decoration-yellow-500/30 underline-offset-8">ready</span> to receive commands.</h3>
                          
                          <div className="space-y-4 max-w-xl mx-auto lg:mx-0">
                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl w-fit">Broadcast System Alert</p>
                                <div className="flex flex-col gap-3">
                                    <textarea 
                                        value={globalMessage}
                                        onChange={e => setGlobalMessage(e.target.value)}
                                        placeholder="Type a professional system notification for all active traders..."
                                        className="w-full bg-[#050507] border border-white/10 rounded-3xl p-6 text-xs text-white focus:border-yellow-500 outline-none resize-none h-24 tracking-tight leading-relaxed transition-all shadow-inner"
                                    />
                                    <div className="flex gap-4">
                                        <button 
                                            disabled={!globalMessage.trim()}
                                            onClick={() => {
                                                if (!socketRef.current) return;
                                                socketRef.current.emit('admin_broadcast', { message: globalMessage });
                                                setGlobalMessage('');
                                                alert("Message Broadcasted to all terminals.");
                                            }}
                                            className="bg-yellow-500 disabled:opacity-50 disabled:grayscale text-black px-10 py-5 rounded-[28px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-yellow-500/20 active:scale-95 transition-all w-fit"
                                        >
                                            Transmit Global Alert
                                        </button>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button onClick={() => setActiveTab('market')} className="bg-white/5 hover:bg-white/10 text-white px-6 py-5 rounded-[28px] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all border border-white/5">
                                                Markets
                                            </button>
                                            <button onClick={() => setActiveTab('logs')} className="bg-white/5 hover:bg-white/10 text-white px-6 py-5 rounded-[28px] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all border border-white/5">
                                                Logs
                                            </button>
                                        </div>
                                    </div>
                                </div>
                          </div>
                      </div>
                      <div className="w-full lg:w-1/3 flex justify-center relative z-10">
                          <div className="relative">
                             <div className="w-48 h-48 rounded-full border-4 border-yellow-500/20 flex items-center justify-center animate-spin-slow">
                               <div className="w-36 h-36 rounded-full border-4 border-blue-500/20 border-t-yellow-500/60" />
                             </div>
                             <ShieldCheck size={64} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-500" />
                          </div>
                      </div>
                  </div>
               </motion.div>
           )}

            {activeTab === 'users' && (
                <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                   <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="space-y-1">
                          <h2 className="text-3xl font-black text-white tracking-tight">Trader <span className="text-yellow-500">Registry</span></h2>
                          <p className="text-gray-500 text-sm font-medium">Global database of active traders, liquidity providers, and administrative staff.</p>
                       </div>
                       <div className="relative group flex-1 md:max-w-md">
                           <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                             <Search size={18} />
                           </div>
                           <input 
                             type="text" placeholder="Query ID, Email or Signal..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                             className="w-full bg-[#0a0a0f] border border-white/5 rounded-3xl pl-14 pr-6 py-4 text-sm focus:border-yellow-500 outline-none transition-all placeholder:text-gray-600"
                           />
                       </div>
                   </header>

                   <div className="grid gap-4">
                       {filteredUsers.map((u, i) => (
                            <div key={`user-row-id-${u.id || i}-${i}`} className="bg-[#0a0a0f] border border-white/5 p-5 md:p-6 rounded-[32px] flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-[#0d0d15] hover:border-white/10 transition-all group relative overflow-hidden">
                                <div className="flex items-center gap-4 w-full lg:w-auto">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-[18px] bg-[#15161d] border border-white/5 flex items-center justify-center text-yellow-500 font-black text-lg shadow-inner group-hover:scale-105 transition-transform">
                                            {u.email?.[0].toUpperCase()}
                                        </div>
                                        {u.kycStatus === 'verified' && (
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-black rounded-full p-0.5 border-2 border-[#0a0a0f]">
                                                <Check size={10} strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                           <p className="font-black text-white text-sm md:text-base tracking-tight leading-none truncate max-w-[150px] md:max-w-[300px]">{u.email}</p>
                                           {u.isBlocked && <span className="text-[7px] bg-red-500 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Blocked</span>}
                                           {admins.some(a => a.id === u.id) && <span className="text-[7px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-widest">{admins.find(a => a.id === u.id)?.role}</span>}
                                           {u.kycStatus === 'verified' && <span className="text-[7px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest border border-green-500/20">Verified</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[8px] text-gray-500 font-black tracking-widest uppercase truncate">ID: {u.id}</p>
                                            {u.referredByUid && <span className="text-[7px] text-yellow-500 font-black uppercase tracking-widest">Partner: {u.referredByUid.substring(0,6)}</span>}
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {u.lastIp && (
                                                <span className={`text-[7px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase ${securityRiskUsers[u.id]?.ipMatch ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-gray-500/10 text-gray-500'}`}>
                                                    {u.lastIp}
                                                </span>
                                            )}
                                            {(securityRiskUsers[u.id]?.ipMatch || securityRiskUsers[u.id]?.deviceMatch) && (
                                                <span className="text-[7px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-1 animate-pulse">
                                                    Risk Detected
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 lg:gap-8 w-full lg:w-auto border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                                    <div className="grid grid-cols-2 lg:flex lg:flex-row gap-4 lg:gap-8 w-full lg:w-auto">
                                        <div className="flex flex-col gap-1 min-w-[90px]">
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none">Capital</p>
                                            <p className="font-mono font-black text-white text-sm md:text-base">৳{(u.balance || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 min-w-[90px]">
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none">Simulation</p>
                                            <p className="font-mono font-black text-gray-500 text-sm md:text-base">৳{(u.demoBalance || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none">Activity</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-gray-700 font-black uppercase">Dep</span>
                                                    <span className="text-[10px] text-green-500 font-bold leading-none">{(Array.isArray(depositRequests) ? depositRequests : []).filter(d => d.userId === u.id && d.status === 'success').length}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-gray-700 font-black uppercase">Wth</span>
                                                    <span className="text-[10px] text-red-500 font-bold leading-none">{(Array.isArray(withdrawals) ? withdrawals : []).filter(w => w.userId === u.id && w.status === 'success').length}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-gray-700 font-black uppercase">Trd</span>
                                                    <span className="text-[10px] text-yellow-500 font-bold leading-none">{u.totalTrades || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 ml-auto lg:ml-0 w-full lg:w-auto mt-2 lg:mt-0">
                                        <button 
                                          onClick={() => setSelectedUserDetail(u)}
                                          className="flex-1 lg:flex-none h-12 lg:h-10 px-6 rounded-2xl lg:rounded-xl flex items-center justify-center bg-yellow-500 text-black hover:bg-yellow-400 transition-all font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-yellow-500/10 active:scale-95"
                                        >
                                            <Settings2 size={14} /> Control
                                        </button>
                                        <button 
                                          onClick={async () => {
                                              if(!confirm(`Are you sure you want to ${u.isBlocked ? 'restore access' : 'block access'} for ${u.email}?`)) return;
                                              try {
                                                  await updateDoc(doc(db, 'users', u.id), { isBlocked: !u.isBlocked });
                                                  await logAdminAction(u.isBlocked ? 'Restored Access' : 'Revoked Access', `${u.isBlocked ? 'Restored' : 'Revoked'} node access for ${u.email}`);
                                                  toast.success(`User ${u.isBlocked ? 'unblocked' : 'blocked'} successfully`);
                                              } catch(err: any) { toast.error(err.message); }
                                          }}
                                          className={`w-12 h-12 lg:w-10 lg:h-10 rounded-2xl lg:rounded-xl flex items-center justify-center transition-all active:scale-95 ${u.isBlocked ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-gray-500 hover:text-white border border-white/5'}`}
                                        >
                                            <Ban size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

           {activeTab === 'finance' && (
               <motion.div key="finance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                   
                   <div className="flex gap-4 p-2 bg-[#0a0a0f] border border-[#1a1a24] rounded-full w-fit">
                       <button 
                           onClick={() => setFinanceSubTab('deposits')}
                           className={`px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all ${financeSubTab === 'deposits' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-500 hover:text-white'}`}
                       >
                           Deposit Requests
                       </button>
                       <button 
                           onClick={() => setFinanceSubTab('withdrawals')}
                           className={`px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all ${financeSubTab === 'withdrawals' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-500 hover:text-white'}`}
                       >
                           Withdrawal Requests
                       </button>
                   </div>

                   {financeSubTab === 'deposits' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black">DEPOSIT REQUESTS</h2>
                            <div className="grid gap-4">
                                {depositRequests.length > 0 ? depositRequests.map((d, i) => (
                                    <div key={`${d.id}-${i}`} className="bg-[#0a0a0f] border border-[#1a1a24] p-6 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${d.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : d.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {d.status}
                                                </span>
                                                <span className="text-xs text-gray-500">{d.timestamp?.toDate ? d.timestamp.toDate().toLocaleString() : new Date(d.timestamp).toLocaleString()}</span>
                                            </div>
                                            <h4 className="font-bold text-lg">{d.userEmail || d.userId}</h4>
                                            <p className="text-sm text-gray-400">{d.method}: <span className="font-mono text-white">{d.walletNumber}</span></p>
                                            {d.trxId && <p className="text-xs text-blue-400 mt-1">TrxID: <span className="font-mono">{d.trxId}</span></p>}
                                        </div>
                                        <div className="flex items-center gap-8 w-full lg:w-auto">
                                            <div className="text-right">
                                                <p className="text-[9px] font-bold text-gray-500 uppercase">Amount</p>
                                                <p className="text-2xl font-black text-green-500">
                                                    {getCurrencySymbol(d.currency)}{d.amount} {d.currency || 'BDT'}
                                                </p>
                                                {d.currency && d.currency !== 'BDT' && (
                                                    <p className="text-[10px] text-gray-400 font-bold tracking-tight">
                                                        ≈ {getCurrencySymbol('BDT')}{(d.amount / (currencies.find(c => c.code === d.currency)?.rate || 1)).toLocaleString()} (est.)
                                                    </p>
                                                )}
                                            </div>
                                            {d.status === 'pending' || d.status === 'approved' ? (
                                                <div className="flex gap-2 text-center items-center justify-center">
                                                    {d.status === 'pending' && <button onClick={() => handleDepositStatus(d.id, 'approved', d.userId, d.amount, d.currency, d.orderId)} className="px-3 py-2 bg-blue-500/10 text-blue-500 font-bold uppercase text-xs rounded-xl hover:bg-blue-500 hover:text-white transition-all">Approve</button>}
                                                    <button onClick={() => handleDepositStatus(d.id, 'success', d.userId, d.amount, d.currency, d.orderId)} className="px-3 py-2 bg-green-500/10 text-green-500 font-bold uppercase text-xs rounded-xl hover:bg-green-500 hover:text-black transition-all">Success</button>
                                                    <button onClick={() => handleDepositStatus(d.id, 'rejected', d.userId, d.amount, d.currency, d.orderId)} className="px-3 py-2 bg-red-500/10 text-red-500 font-bold uppercase text-xs rounded-xl hover:bg-red-500 hover:text-white transition-all">Reject</button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                )) : (<div className="text-gray-500 text-sm">No deposit requests found.</div>)}
                            </div>
                        </div>
                   )}

                   {financeSubTab === 'withdrawals' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black">WITHDRAWAL REQUESTS</h2>
                            <div className="grid gap-4">
                                {withdrawals.length > 0 ? withdrawals.map((w, i) => (
                                    <div key={`${w.id}-${i}`} className="bg-[#0a0a0f] border border-[#1a1a24] p-6 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${w.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : (w.status === 'approved' || w.status === 'success') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {w.status}
                                                </span>
                                                <span className="text-xs text-gray-500">{w.timestamp?.toDate ? w.timestamp.toDate().toLocaleString() : new Date(w.timestamp).toLocaleString()}</span>
                                            </div>
                                            <h4 className="font-bold text-lg">{w.userEmail || w.userId}</h4>
                                            <p className="text-sm text-gray-400">{w.method}: <span className="font-mono text-white">{w.walletNumber}</span></p>
                                            {w.accountHolder && <p className="text-xs text-[#FFE24C] mt-1">Holder: {w.accountHolder}</p>}
                                        </div>
                                        <div className="flex items-center gap-8 w-full lg:w-auto">
                                            <div className="text-right">
                                                <p className="text-[9px] font-bold text-gray-500 uppercase">Amount</p>
                                                <p className="text-2xl font-black text-red-500">-৳{w.amount}</p>
                                            </div>
                                            {w.status === 'pending' || w.status === 'approved' ? (
                                                <div className="flex gap-2 text-center items-center justify-center">
                                                    {w.status === 'pending' && <button onClick={() => handleWithdrawalStatus(w.id, 'approved', w.userId, w.amount, w.orderId)} className="px-3 py-2 bg-blue-500/10 text-blue-500 font-bold uppercase text-xs rounded-xl hover:bg-blue-500 hover:text-white transition-all">Approve</button>}
                                                    <button onClick={() => handleWithdrawalStatus(w.id, 'success', w.userId, w.amount, w.orderId)} className="px-3 py-2 bg-green-500/10 text-green-500 font-bold uppercase text-xs rounded-xl hover:bg-green-500 hover:text-black transition-all">Success</button>
                                                    <button onClick={() => handleWithdrawalStatus(w.id, 'rejected', w.userId, w.amount, w.orderId)} className="px-3 py-2 bg-red-500/10 text-red-500 font-bold uppercase text-xs rounded-xl hover:bg-red-500 hover:text-white transition-all">Reject</button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                )) : (<div className="text-gray-500 text-sm">No withdrawal requests found.</div>)}
                            </div>
                        </div>
                   )}

               </motion.div>
           )}

           {['news', 'education', 'promotions', 'deposits'].includes(activeTab) && (
               <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                   <div className="flex justify-between items-center">
                       <h2 className="text-2xl font-black uppercase">
                         {activeTab === 'news' ? 'NEWS FLASH' : 
                          activeTab === 'education' ? 'TRADING ACADEMY' : 
                          activeTab === 'promotions' ? 'BONUSES & PROMOS' : 
                          'DEPOSIT METHODS'} ({activeTab === 'news' ? news.length : activeTab === 'education' ? education.length : activeTab === 'promotions' ? promotions.length : depositMethods.length})
                       </h2>
                       {['deposits', 'education', 'news', 'promotions'].includes(activeTab) && (
                           <button 
                             onClick={async () => {
                                 if (!confirm(`Add default ${activeTab === 'deposits' ? 'deposit methods' : activeTab === 'education' ? 'academy videos' : activeTab === 'news' ? 'news flashes' : 'bonuses'}?`)) return;
                                 
                                 let defaults: any[] = [];
                                 let colName = '';
                                 
                                 if (activeTab === 'deposits') {
                                     colName = 'depositMethods';
                                     defaults = [
                                        { name: "bKash", provider: "bKash", logo: "bkash", logoType: 'text', category: "E-wallets", bgColor: "#E2136E", time: "Instant", instant: true, minDeposit: 500, maxDeposit: 25000, isPopular: true, currency: "BDT" },
                                        { name: "Nagad", provider: "Nagad", logo: "nagad", logoType: 'text', category: "E-wallets", bgColor: "#EC2A24", time: "Instant", instant: true, minDeposit: 500, maxDeposit: 25000, isPopular: true, currency: "BDT" },
                                        { name: "Rocket", provider: "Rocket", logo: "rocket", logoType: 'text', category: "E-wallets", bgColor: "#8B2E88", time: "Instant", instant: true, minDeposit: 500, maxDeposit: 25000, currency: "BDT" },
                                        { name: "Binance Pay", provider: "Binance", logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png", logoType: 'image', category: "Crypto", bgColor: "#FCD535", time: "Instant", instant: true, minDeposit: 1, maxDeposit: 10000, isPopular: true, currency: "USDT" },
                                        { name: "USDT TRC20", provider: "Tether", logo: "https://cryptologos.cc/logos/tether-usdt-logo.png", logoType: 'image', category: "Crypto", bgColor: "#26A17B", time: "30-60 Min", instant: false, minDeposit: 1, maxDeposit: 10000, currency: "USDT" },
                                        { name: "Perfect Money", provider: "Perfect Money", logo: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/perfect-money-icon.png", logoType: 'image', category: "E-wallets", bgColor: "#E61A24", time: "Instant", instant: true, minDeposit: 10, maxDeposit: 5000, currency: "USD" }
                                     ];
                                 } else if (activeTab === 'education') {
                                     colName = 'education';
                                     defaults = [
                                        { title: "Welcome to the Bivaax platform", description: "Simple steps to start from", duration: "1:23", type: "Video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnailUrl: "" },
                                        { title: "You're on the right track!", description: "Take a grand step into profitable trading by learning the essentials about indicators, strategies, and assets. You've made a deposit. All videos are unlocked!", duration: "12:35", type: "Video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnailUrl: "https://images.unsplash.com/photo-1611974714131-419b67484411?w=800&auto=format&fit=crop&q=80" },
                                        { title: "Plan your strategy with Economic calendar", description: "", duration: "0:29", type: "Video", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnailUrl: "https://images.unsplash.com/photo-1642543492481-44e81e391452?w=800&auto=format&fit=crop&q=80" }
                                     ];
                                 } else if (activeTab === 'news') {
                                     colName = 'news';
                                     defaults = [
                                        { title: "Don't miss your last chance to get prizes!", description: "Hurry up and activate your Horseshoes", content: "Increase your chances of becoming a winner before time runs out: deposit $50 or more, reach a turnover of $300, and get your Horseshoe. Prizes await, especially a brand new Mustang GT \"Fastback\" 2025 — maybe you will be the lucky winner! *All rewards are provided exclusively in a monetary equivalent deposited into the winner's real account", date: "10.03.2026", emoji: "🎯", reactions: 420 },
                                        { title: "Trade and prosper! 💰", description: "This year brings more exciting rewards", content: "Explore new trading opportunities this spring with our updated asset signals.", date: "24.02.2026", emoji: "💰", reactions: 349 },
                                        { title: "Big tournament is coming!", description: "Prepare for the biggest trading tournament", content: "Join the upcoming tournament to win massive rewards.", date: "15.02.2026", emoji: "🏆", reactions: 825 }
                                     ];
                                  } else if (activeTab === 'promotions') {
                                      colName = 'promotions';
                                      defaults = [
                                         { title: "Spring Trading Bonus", description: "Get 50% bonus on your next deposit", content: "Make a deposit of $100 or more and get a 50% bonus added to your trading account. Valid until end of April!", bonus: "50", price: "", icon: "Gift", imageUrl: "https://images.unsplash.com/photo-1591033588766-9810ea1a5557?w=800&auto=format&fit=crop&q=80" },
                                         { title: "Refer a Friend", description: "Earn $20 for every friend who joins", content: "Invite your friends to Bivaax and get $20 for every friend who completes their first trade.", bonus: "20", price: "", icon: "Zap", imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop&q=80" }
                                      ];
                                  }
                                  
                                  try {
                                      for (const item of defaults) {
                                          await addDoc(collection(db, colName), item);
                                      }
                                      await fetchStaticAdminData();
                                      await clearServerCache();
                                      alert('Default data seeded successfully! Please wait up to 10 seconds or reload the page to see them.');
                                  } catch (err: any) {
                                      alert('Failed to seed: ' + err.message);
                                  }
                              }}
                              className="bg-purple-500 text-white px-4 py-3 rounded-2xl font-bold flex items-center gap-2"
                             >
                                Seed Defaults
                            </button>
                        )}
                       <button 
                         onClick={() => {
                             setEditingItem(
                                 activeTab === 'news' ? { title: '', description: '', content: '', date: new Date().toLocaleDateString(), emoji: '📢', reactions: 0 } : 
                                 activeTab === 'education' ? { title: '', description: '', duration: '', type: 'Video', thumbnailUrl: '', videoUrl: '' } : 
                                 activeTab === 'promotions' ? { title: '', description: '', content: '', imageUrl: '', icon: 'Gift', bonus: '', price: '' } :
                                 { name: '', provider: '', logo: '', logoType: 'image', category: 'Crypto', bgColor: '#1e1e1e', time: '5 MIN', instant: false, minDeposit: 1, maxDeposit: 10000, currency: 'USDT', walletAddress: '', isActive: true }
                             );
                             setModalType(activeTab === 'deposits' ? 'deposit' : activeTab as any);
                             setShowModal(true);
                         }}
                         className="bg-yellow-500 text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-2"
                        >
                           <Plus size={20} /> Add New
                       </button>
                   </div>
                   <div className="grid lg:grid-cols-2 gap-4">
                       {activeTab === 'promotions' && (
                           <div 
                               className="bg-gradient-to-br from-purple-600 to-indigo-900 border border-white/10 p-6 rounded-[32px] flex items-center justify-between group cursor-pointer shadow-xl shadow-purple-500/10"
                               onClick={() => {
                                   setEditingItem({ title: 'Deposit Bonus', description: '50% Bonus Ready', content: 'Get 50% extra on your deposit!', bonus: '50', price: '429.23', icon: 'Gift', imageUrl: '' });
                                   setModalType('promotions');
                                   setShowModal(true);
                               }}
                           >
                               <div className="flex items-center gap-4">
                                   <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                       <Gift className="text-white" size={32} />
                                   </div>
                                   <div>
                                       <h4 className="font-black text-xl text-white uppercase tracking-tight">Deposit Bonus</h4>
                                       <p className="text-purple-100 text-sm opacity-80">50% Bonus Ready</p>
                                       <p className="text-white/60 font-mono text-[10px] mt-1">Base: ৳429.23</p>
                                   </div>
                               </div>
                               <div className="flex gap-2">
                                   <div className="px-3 py-1 bg-yellow-500 text-black rounded-lg text-[10px] font-black uppercase">Active</div>
                               </div>
                           </div>
                       )}
                       {(activeTab === 'news' ? news : activeTab === 'education' ? education : activeTab === 'promotions' ? promotions : depositMethods).length === 0 && (
                           <div className="col-span-full py-20 text-center bg-[#0a0a0f] border border-dashed border-white/10 rounded-[40px] space-y-4">
                               <Activity className="mx-auto text-gray-700" size={48} />
                               <div>
                                   <h3 className="text-xl font-bold text-white">No items found</h3>
                                   <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">There are currently no records for this section in the database. Use the "Add New" button or "Seed Defaults" to populate data.</p>
                               </div>
                           </div>
                       )}
                       {(activeTab === 'news' ? news : activeTab === 'education' ? education : activeTab === 'promotions' ? promotions : depositMethods).map((item: any, i: number) => (
                           <div key={`${item.id}-${i}`} className={`bg-[#0a0a0f] border border-[#1a1a24] p-6 rounded-3xl flex items-center justify-between group ${item.title?.includes('Bonus') ? 'bg-gradient-to-br from-purple-900/50 to-transparent' : ''}`}>
                               <div className="flex items-center gap-4">
                                   {activeTab === 'promotions' && (
                                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.title?.includes('Bonus') ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400'}`}>
                                           {item.icon === 'Zap' ? <Zap size={24} /> : 
                                             item.icon === 'Trophy' ? <Trophy size={24} /> : 
                                             item.icon === 'Star' ? <Star size={24} /> : 
                                             <Gift size={24} />}
                                       </div>
                                   )}
                                   {activeTab === 'deposits' && (
                                       <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white/5 border border-white/10 p-2">
                                           {item.logoType === 'image' || !item.logoType ? (
                                               item.logo ? <img src={item.logo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer"  loading="lazy" /> : <div className="text-white font-bold">?</div>
                                           ) : (
                                               <div className="text-white font-bold">{item.logo}</div>
                                           )}
                                       </div>
                                   )}
                                   <div>
                                       <h4 className="font-bold text-lg group-hover:text-yellow-500 transition-colors uppercase tracking-tight">{item.title || item.name}</h4>
                                       <p className="text-gray-500 text-sm line-clamp-1">{item.provider || item.description || item.content?.substring(0, 50)}</p>
                                       {(activeTab === 'promotions' || activeTab === 'deposits') && (
                                           <div className="flex gap-3 mt-2">
                                               {item.price && <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-black uppercase">Price: {formatWithCurrency(Number(item.price), item.currency || 'BDT')}</span>}
                                               {item.bonus && <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-black uppercase">Bonus: {item.bonus}%</span>}
                                               {activeTab === 'deposits' && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-black uppercase">{item.category} ({item.currency || 'BDT'})</span>}
                                               {activeTab === 'deposits' && <span className="text-[10px] bg-gray-500/10 text-gray-400 px-2 py-0.5 rounded font-black uppercase">{item.time}</span>}
                                               {activeTab === 'deposits' && item.isActive === false && <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-black uppercase">Hidden</span>}
                                               {activeTab === 'deposits' && item.isActive !== false && <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-black uppercase">Active</span>}
                                           </div>
                                       )}
                                   </div>
                               </div>
                               <div className="flex gap-2">
                                   <button 
                                     onClick={() => {
                                         setEditingItem(item);
                                         setModalType(activeTab === 'deposits' ? 'deposit' : activeTab as any);
                                         setShowModal(true);
                                     }}
                                     className="p-3 bg-white/5 text-gray-400 hover:text-white rounded-xl"
                                   >
                                       <Settings2 size={18} />
                                   </button>
                                   <button onClick={() => handleDeleteItem(activeTab === 'deposits' ? 'depositMethods' : activeTab as string, item.id)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 rounded-xl hover:text-white transition-all"><Trash2 size={18}/></button>
                                </div>
                            </div>
                        ))}
                   </div>
               </motion.div>
           )}

           {activeTab === 'tournaments' && (
               <motion.div key="tournaments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                   <div className="flex justify-between items-center">
                       <h2 className="text-3xl font-black uppercase">Arena Events (Tournaments)</h2>
                       <div className="flex items-center gap-2">
                           <button 
                             onClick={async () => {
                                 if (!window.confirm(`Add default tournaments?`)) return;
                                 const { collection, addDoc } = await import('../firebase');
                                 const defaults = [
                                     { title: 'Galaxy', status: 'Active', endTime: '23d 02h 45m', description: 'Explore the Galaxy tournament with massive prizes.', participationFee: '5,376.00', prizePool: '5,378,018.00', imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=600', entryFee: '5,376.00' },
                                     { title: 'Market Makers', status: 'Active', endTime: '02d 02h 45m', description: 'Show your market making skills.', participationFee: '5,376.00', prizePool: '3,016,462.00', imageUrl: 'https://images.unsplash.com/photo-1611974714851-48206138d73e?auto=format&fit=crop&q=80&w=600', entryFee: '5,376.00' }
                                 ];
                                 try {
                                     for (const item of defaults) {
                                         await addDoc(collection(db, 'tournaments'), item);
                                     }
                                     if (typeof fetchStaticAdminData === 'function') await fetchStaticAdminData();
                                     alert('Default tournaments seeded successfully!');
                                 } catch (err: any) {
                                     alert('Failed to seed: ' + err.message);
                                 }
                             }}
                             className="bg-purple-500 text-white px-4 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-purple-400 transition-all text-sm"
                            >
                               Seed Defaults
                           </button>
                       <button 
                         onClick={() => {
                             setEditingItem({ title: '', description: '', content: '', prizePool: '', entryFee: '', status: 'Upcoming', imageUrl: '', endTime: '' });
                             setModalType('tournaments');
                             setShowModal(true);
                         }}
                         className="bg-yellow-500 text-black px-8 py-4 rounded-3xl font-bold flex items-center gap-3 text-sm shadow-lg hover:bg-yellow-400 transition-all"
                        >
                           <Plus size={20} /> Create New Event
                       </button>
                       </div>
                   </div>
                   
                   {tournaments.length === 0 && (
                       <div className="col-span-full py-20 text-center bg-[#0a0a0f] border border-dashed border-white/10 rounded-[40px] space-y-4 mb-6">
                           <Activity className="mx-auto text-gray-700" size={48} />
                           <div>
                               <h3 className="text-xl font-bold text-white">No items found</h3>
                               <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">There are currently no tournaments. Use the "Create New Event" or "Seed Defaults" button to create events.</p>
                           </div>
                       </div>
                   )}
                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                       {tournaments.map((t: any, i: number) => (
                           <div key={`${t.id}-${i}`} className="bg-[#0a0a0f] border border-[#1a1a24] p-6 rounded-3xl space-y-4 hover:border-yellow-500/50 transition-all flex flex-col justify-between">
                            <div>
                               <div className="flex justify-between items-start mb-4">
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.status === 'Upcoming' ? 'bg-blue-500/10 text-blue-500' : t.status === 'Live' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                   {t.status}
                                 </span>
                                 <button onClick={() => handleDeleteItem('tournaments', t.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-xl"><Trash2 size={16}/></button>
                               </div>
                               <h3 className="font-bold text-lg mb-1">{t.title}</h3>
                               <p className="text-gray-500 text-sm mb-4 line-clamp-2">{t.description}</p>
                               <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-[#15161d] p-3 rounded-xl border border-white/5">
                                      <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Prize</p>
                                      <p className="text-sm font-black text-yellow-500">{t.prizePool}</p>
                                  </div>
                                  <div className="bg-[#15161d] p-3 rounded-xl border border-white/5">
                                      <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Fee</p>
                                      <p className="text-sm font-black text-white">{t.entryFee}</p>
                                  </div>
                               </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setEditingItem(t);
                                    setModalType('tournaments');
                                    setShowModal(true);
                                }}
                                className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold text-xs uppercase"
                            >
                                Manage Event
                            </button>
                           </div>
                       ))}
                   </div>
               </motion.div>
           )}

            {activeTab === 'market' && (
                <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    {/* PROFESSIONAL HEADER */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                Market <span className="text-yellow-500">Architect</span>
                                <div className="px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] uppercase font-black tracking-widest">v2.0 Professional</div>
                            </h2>
                            <p className="text-gray-500 text-sm font-medium">Manipulate algorithmic trajectories and define global market parameters with millisecond precision.</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                             <button 
                                onClick={async () => {
                                    const active = !marketState?.systemActive;
                                    await fetch('/api/admin/market/system', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ active })
                                    });
                                    fetchMarketState();
                                }}
                                className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all border font-black uppercase text-[10px] tracking-widest ${marketState?.systemActive ? 'bg-green-500 border-green-500 text-black shadow-lg shadow-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                            >
                                <Power size={18} />
                                Engine: {marketState?.systemActive ? 'Active' : 'Offline'}
                            </button>

                            <button 
                                onClick={async () => {
                                    if (!confirm("Unfreeze all market pairs?")) return;
                                    const pairs = Object.keys(marketState.markets);
                                    for (const pair of pairs) {
                                        if (marketState.markets[pair].isFrozen) {
                                            await updateMarket(pair, { isFrozen: false });
                                        }
                                    }
                                }}
                                className="bg-white/5 hover:bg-white/10 border border-white/5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Force Global Thaw
                            </button>
                        </div>
                    </header>

                    {/* GLOBAL PROTOCOL CENTER */}
                    <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[80px] rounded-full -mr-32 -mt-32" />
                        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10">
                            <div className="flex items-center gap-6 max-w-md">
                                <div className="w-16 h-16 rounded-[24px] bg-yellow-500/10 flex items-center justify-center text-yellow-500 shadow-inner shrink-0">
                                    <Shield size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Global Manipulation Center</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">Override natural market flow across ALL assets simultaneously. Select a protocol to force platform-wide outcomes.</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-center gap-3 p-2 bg-black/40 rounded-[32px] border border-white/5">
                                {[
                                    { id: 'neutral', label: 'Natural Flow', icon: RefreshCw, desc: 'Real Algorithm' },
                                    { id: 'smart_house', label: 'Smart House', icon: Cpu, desc: 'Auto Profit' },
                                    { id: 'always_loss', label: 'House Win', icon: TrendingDown, desc: 'Force Loss' },
                                    { id: 'always_win', label: 'Client Win', icon: TrendingUp, desc: 'Force Win' }
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={async () => {
                                            const res = await fetch('/api/admin/manipulation/global', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ mode: mode.id })
                                            });
                                            if (res.ok) fetchMarketState();
                                        }}
                                        className={`flex flex-col items-center gap-2 px-6 py-4 rounded-[24px] transition-all min-w-[140px] relative border ${
                                            (marketState?.globalManipulationMode || 'neutral') === mode.id 
                                                ? 'bg-white border-white text-black font-black shadow-2xl shadow-white/10' 
                                                : 'bg-white/5 border-transparent text-gray-500 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <mode.icon size={20} className={ (marketState?.globalManipulationMode || 'neutral') === mode.id ? '' : 'opacity-50' } />
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase tracking-widest">{mode.label}</p>
                                            <p className={`text-[8px] opacity-50 font-medium ${(marketState?.globalManipulationMode || 'neutral') === mode.id ? 'text-black' : 'text-gray-400'}`}>{mode.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* MARKET FILTERING & TOOLS */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-2">
                        <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                            {['all', 'currencies', 'otc', 'crypto', 'commodities'].map((f: any) => (
                                <button
                                    key={f}
                                    onClick={() => setMarketFilter(f)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${marketFilter === f ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-xl border border-white/5">
                                <Activity size={14} className="text-green-500" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">System Load: 12ms</span>
                            </div>
                        </div>
                    </div>

                    {/* MARKET ARCHITECT GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {marketState?.markets && Object.entries(marketState.markets)
                            .filter(([pair]: any) => {
                                if (marketFilter === 'all') return true;
                                if (marketFilter === 'currencies') return pair.includes('/') && !pair.includes('OTC');
                                if (marketFilter === 'otc') return pair.includes('OTC');
                                if (marketFilter === 'crypto') return pair === 'BTC/USD' || pair === 'ETH/USD' || pair === 'SOL/USD';
                                if (marketFilter === 'commodities') return pair === 'GOLD' || pair === 'SILVER' || pair === 'OIL';
                                return true;
                            })
                            .map(([pair, data]: any) => (
                                <MarketControlCard 
                                    key={pair} 
                                    pair={pair} 
                                    data={data} 
                                    updateMarket={updateMarket} 
                                    appConfig={appConfig}
                                    fetchMarketState={fetchMarketState}
                                />
                            ))}
                    </div>
                </motion.div>
            )}

           {activeTab === 'banners' && (
               <motion.div key="banners" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                   <div className="flex justify-between items-center">
                       <h2 className="text-2xl font-black">PROMOTIONAL BANNERS</h2>
                       <button 
                         onClick={() => {
                             setBanners([...banners, { id: Date.now().toString(), title: 'New Banner', imageUrl: '', bgGradient: 'from-amber-600 to-yellow-900', icon: 'Copy', enabled: true }]);
                         }}
                         className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                       >
                           <Plus size={20} /> Add Story
                       </button>
                   </div>
                   <div className="grid lg:grid-cols-2 gap-6">
                       {banners.map((b, idx) => (
                           <div key={`${b.id}-${idx}`} className="bg-[#0a0a0f] border border-[#1a1a24] p-8 rounded-[40px] space-y-4">
                               <div className="flex justify-between items-center">
                                   <div className={`w-16 h-20 rounded-2xl bg-gradient-to-br ${b.bgGradient} flex items-center justify-center border border-white/10`}>
                                       {b.imageUrl ? <img src={b.imageUrl} className="w-full h-full object-cover rounded-2xl"  loading="lazy" /> : <Database size={24} />}
                                   </div>
                                    <div className="flex gap-2">
                                        <button 
                                          onClick={() => {
                                              const n = [...banners]; n[idx].enabled = n[idx].enabled === false ? true : false; setBanners(n);
                                          }}
                                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${b.enabled === false ? 'bg-red-500 text-white' : 'bg-green-500 text-black'}`}
                                        >
                                            {b.enabled === false ? 'OFFLINE' : 'LIVE'}
                                        </button>
                                        <button onClick={() => setBanners(banners.filter((_, i) => i !== idx))} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                           <Trash2 size={20} />
                                        </button>
                                    </div>
                               </div>
                               <input 
                                 type="text" value={b.title} onChange={e => {
                                     const n = [...banners]; n[idx].title = e.target.value; setBanners(n);
                                 }}
                                 className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-4 py-3 text-sm focus:border-yellow-500 outline-none"
                               />
                               <input 
                                 type="text" placeholder="IMAGE URL (Optional)" value={b.imageUrl} onChange={e => {
                                     const n = [...banners]; n[idx].imageUrl = e.target.value; setBanners(n);
                                 }}
                                 className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-4 py-3 text-sm focus:border-yellow-500 outline-none"
                               />
                               <div className="grid grid-cols-2 gap-3">
                                   <input 
                                     type="text" placeholder="GRADIENT" value={b.bgGradient} onChange={e => {
                                         const n = [...banners]; n[idx].bgGradient = e.target.value; setBanners(n);
                                     }}
                                     className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-4 py-3 text-xs focus:border-yellow-500 outline-none"
                                   />
                                   <input 
                                     type="text" placeholder="ICON NAME" value={b.icon} onChange={e => {
                                         const n = [...banners]; n[idx].icon = e.target.value; setBanners(n);
                                     }}
                                     className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-4 py-3 text-xs focus:border-yellow-500 outline-none"
                                   />
                               </div>
                           </div>
                       ))}
                   </div>
                   {banners.length > 0 && (
                       <button 
                         onClick={async () => {
                             await fetch('/api/admin/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', payload: banners }) });
                             await logAdminAction('Updated Banners', 'Synced banner/activity configurations');
                             alert('Banners Synced!');
                         }}
                         className="w-full bg-green-500 text-black py-4 rounded-3xl font-black shadow-xl shadow-green-500/10 active:scale-[0.99] transition-all"
                       >
                           PUBLISH ALL CHANGES
                       </button>
                   )}
               </motion.div>
           )}

           {activeTab === 'settings' && (
               <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-2xl">
                   <h2 className="text-2xl font-black">SYSTEM CONFIGURATION</h2>
                   <div className="bg-[#0a0a0f] border border-[#1a1a24] p-8 lg:p-12 rounded-[48px] space-y-6">
                       <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase text-gray-500">Platform Identity</label>
                           <input 
                             type="text" value={appConfig.appName} onChange={e => setAppConfig({...appConfig, appName: e.target.value})}
                             className="w-full bg-[#15161d] border border-[#1a1a24] rounded-3xl px-6 py-4 focus:border-yellow-500 outline-none"
                           />
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase text-gray-500">Min Deposit (৳)</label>
                               <input 
                                 type="number" value={appConfig.minDeposit} onChange={e => setAppConfig({...appConfig, minDeposit: Number(e.target.value)})}
                                 className="w-full bg-[#15161d] border border-[#1a1a24] rounded-3xl px-6 py-4 focus:border-yellow-500 outline-none"
                               />
                           </div>
                           <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase text-gray-500">Global Multiplexer</label>
                               <input 
                                 type="number" step="0.01" value={appConfig.multiplier} onChange={e => setAppConfig({...appConfig, multiplier: Number(e.target.value)})}
                                 className="w-full bg-[#15161d] border border-[#1a1a24] rounded-3xl px-6 py-4 focus:border-yellow-500 outline-none"
                               />
                            </div>
                        </div>

                        <div className="space-y-6 pt-4 border-t border-white/5">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">API Integrations</h3>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-500">Financial Modeling Prep API Key</label>
                                <input 
                                  type="text" 
                                  placeholder="Enter FMP API Key..." 
                                  value={fmpApiKey} 
                                  onChange={e => setFmpApiKey(e.target.value)}
                                  className="w-full bg-[#15161d] border border-[#1a1a24] rounded-3xl px-6 py-4 focus:border-yellow-500 outline-none font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-6 pt-4 border-t border-white/5">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">SMTP Email Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-500">SMTP Host (e.g. mail.yourdomain.com)</label>
                                    <input 
                                      type="text" 
                                      placeholder="smtp.example.com" 
                                      value={appConfig.smtpHost || ""} 
                                      onChange={e => setAppConfig({...appConfig, smtpHost: e.target.value})}
                                      className="w-full bg-[#15161d] border border-[#1a1a24] rounded-3xl px-6 py-4 focus:border-yellow-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-500">SMTP Port (465, 587)</label>
                                    <input 
                                      type="number" 
                                      placeholder="465" 
                                      value={appConfig.smtpPort || ""} 
                                      onChange={e => setAppConfig({...appConfig, smtpPort: Number(e.target.value)})}
                                      className="w-full bg-[#15161d] border border-[#1a1a24] rounded-3xl px-6 py-4 focus:border-yellow-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-500">SMTP Username / Email</label>
                                    <input 
                                      type="text" 
                                      placeholder="support@domain.com" 
                                      value={appConfig.smtpUser || ""} 
                                      onChange={e => setAppConfig({...appConfig, smtpUser: e.target.value})}
                                      className="w-full bg-[#15161d] border border-[#1a1a24] rounded-3xl px-6 py-4 focus:border-yellow-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-500">SMTP Password</label>
                                    <input 
                                      type="password" 
                                      placeholder="••••••••" 
                                      value={appConfig.smtpPass || ""} 
                                      onChange={e => setAppConfig({...appConfig, smtpPass: e.target.value})}
                                      className="w-full bg-[#15161d] border border-[#1a1a24] rounded-3xl px-6 py-4 focus:border-yellow-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-500">From Email Address</label>
                                    <input 
                                      type="text" 
                                      placeholder="noreply@domain.com" 
                                      value={appConfig.smtpFromEmail || ""} 
                                      onChange={e => setAppConfig({...appConfig, smtpFromEmail: e.target.value})}
                                      className="w-full bg-[#15161d] border border-[#1a1a24] rounded-3xl px-6 py-4 focus:border-yellow-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-500">From Name</label>
                                    <input 
                                      type="text" 
                                      placeholder="Bivaax Support" 
                                      value={appConfig.smtpFromName || ""} 
                                      onChange={e => setAppConfig({...appConfig, smtpFromName: e.target.value})}
                                      className="w-full bg-[#15161d] border border-[#1a1a24] rounded-3xl px-6 py-4 focus:border-yellow-500 outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-4 border-t border-white/5">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Social Media Links</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
                                        <Youtube size={12} className="text-red-500" /> YouTube
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="https://youtube.com/..." 
                                        value={appConfig.socialYoutube || ""} 
                                        onChange={e => setAppConfig({...appConfig, socialYoutube: e.target.value})}
                                        className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-yellow-500 outline-none transition-all"
                                    />
                                </div>
                                
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
                                        <Instagram size={12} className="text-pink-500" /> Instagram
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="https://instagram.com/..." 
                                        value={appConfig.socialInstagram || ""} 
                                        onChange={e => setAppConfig({...appConfig, socialInstagram: e.target.value})}
                                        className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-yellow-500 outline-none transition-all"
                                    />
                                </div>
                                
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
                                        <Send size={12} className="text-blue-400" /> Telegram
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="https://t.me/..." 
                                        value={appConfig.socialTelegram || ""} 
                                        onChange={e => setAppConfig({...appConfig, socialTelegram: e.target.value})}
                                        className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-yellow-500 outline-none transition-all"
                                    />
                                </div>
                                
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
                                        <Facebook size={12} className="text-blue-600" /> Facebook
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="https://facebook.com/..." 
                                        value={appConfig.socialFacebook || ""} 
                                        onChange={e => setAppConfig({...appConfig, socialFacebook: e.target.value})}
                                        className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-yellow-500 outline-none transition-all"
                                    />
                                </div>
                                
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
                                        <div className="w-3 h-3 flex items-center justify-center text-purple-400">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                                            </svg>
                                        </div> 
                                        TikTok
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="https://tiktok.com/..." 
                                        value={appConfig.socialTiktok || ""} 
                                        onChange={e => setAppConfig({...appConfig, socialTiktok: e.target.value})}
                                        className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-yellow-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-4 border-t border-white/5">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Bivaaxpay Binance System</h3>
                            
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-500">Binance UID</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter Binance UID..." 
                                    value={appConfig.binancePayUid || ""} 
                                    onChange={e => setAppConfig({...appConfig, binancePayUid: e.target.value})}
                                    className="w-full bg-[#15161d] border border-[#1a1a24] rounded-3xl px-6 py-4 focus:border-yellow-500 outline-none font-mono text-sm"
                                />
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-500">Binance QR Code (Image URL)</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter Image URL for QR Code"
                                    value={appConfig.binancePayQrCode || ''}
                                    onChange={e => setAppConfig({...appConfig, binancePayQrCode: e.target.value})}
                                    className="w-full bg-[#15161d] border border-[#1a1a24] rounded-3xl px-6 py-4 focus:border-yellow-500 outline-none font-mono text-sm"
                                />
                                {appConfig.binancePayQrCode && (
                                    <div className="mt-4 p-4 border border-white/10 rounded-xl bg-white/5 w-fit">
                                        <img src={appConfig.binancePayQrCode} alt="Binance QR" className="h-48 w-48 object-contain rounded-lg"  loading="lazy" />
                                    </div>
                                )}
                            </div>
                            <hr className="border-white/5 my-8" />
                            
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">MFS Payment Configuration</h3>
                            
                            {/* bKash Config */}
                            <div className="bg-white/5 border border-pink-500/20 p-6 rounded-[32px] space-y-6 mb-8">
                                <h4 className="text-lg font-black text-pink-500 uppercase tracking-tight">bKash Settings</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">bKash Account Number</label>
                                        <input type="text" value={appConfig.bkash_number || ""} onChange={e => setAppConfig({...appConfig, bkash_number: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-pink-500 outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Account Type (BN)</label>
                                        <input type="text" value={appConfig.bkash_type || ""} onChange={e => setAppConfig({...appConfig, bkash_type: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-pink-500 outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-500">bKash Logo URL</label>
                                    <input type="text" value={appConfig.bkash_logo || ""} onChange={e => setAppConfig({...appConfig, bkash_logo: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-pink-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Step 1 Description (BN)</label>
                                        <textarea value={appConfig.bkash_step1_bn || ""} onChange={e => setAppConfig({...appConfig, bkash_step1_bn: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-pink-500 outline-none h-20" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Step 1 Description (EN)</label>
                                        <textarea value={appConfig.bkash_step1_en || ""} onChange={e => setAppConfig({...appConfig, bkash_step1_en: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-pink-500 outline-none h-20" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Guide Lines (BN - New Line Separated)</label>
                                        <textarea value={appConfig.bkash_guide_bn || ""} onChange={e => setAppConfig({...appConfig, bkash_guide_bn: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-pink-500 outline-none h-32" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Guide Lines (EN - New Line Separated)</label>
                                        <textarea value={appConfig.bkash_guide_en || ""} onChange={e => setAppConfig({...appConfig, bkash_guide_en: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-pink-500 outline-none h-32" />
                                    </div>
                                </div>
                            </div>

                            {/* Nagad Config */}
                            <div className="bg-white/5 border border-orange-500/20 p-6 rounded-[32px] space-y-6 mb-8">
                                <h4 className="text-lg font-black text-orange-500 uppercase tracking-tight">Nagad Settings</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Nagad Account Number</label>
                                        <input type="text" value={appConfig.nagad_number || ""} onChange={e => setAppConfig({...appConfig, nagad_number: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-orange-500 outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Account Type (BN)</label>
                                        <input type="text" value={appConfig.nagad_type || ""} onChange={e => setAppConfig({...appConfig, nagad_type: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-orange-500 outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-500">Nagad Logo URL</label>
                                    <input type="text" value={appConfig.nagad_logo || ""} onChange={e => setAppConfig({...appConfig, nagad_logo: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-orange-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Step 1 Description (BN)</label>
                                        <textarea value={appConfig.nagad_step1_bn || ""} onChange={e => setAppConfig({...appConfig, nagad_step1_bn: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-orange-500 outline-none h-20" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Step 1 Description (EN)</label>
                                        <textarea value={appConfig.nagad_step1_en || ""} onChange={e => setAppConfig({...appConfig, nagad_step1_en: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-orange-500 outline-none h-20" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Guide Lines (BN - New Line Separated)</label>
                                        <textarea value={appConfig.nagad_guide_bn || ""} onChange={e => setAppConfig({...appConfig, nagad_guide_bn: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-orange-500 outline-none h-32" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Guide Lines (EN - New Line Separated)</label>
                                        <textarea value={appConfig.nagad_guide_en || ""} onChange={e => setAppConfig({...appConfig, nagad_guide_en: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-orange-500 outline-none h-32" />
                                    </div>
                                </div>
                            </div>

                            {/* Rocket Config */}
                            <div className="bg-white/5 border border-purple-500/20 p-6 rounded-[32px] space-y-6 mb-8">
                                <h4 className="text-lg font-black text-purple-500 uppercase tracking-tight">Rocket Settings</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Rocket Account Number</label>
                                        <input type="text" value={appConfig.rocket_number || ""} onChange={e => setAppConfig({...appConfig, rocket_number: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-purple-500 outline-none" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Account Type (BN)</label>
                                        <input type="text" value={appConfig.rocket_type || ""} onChange={e => setAppConfig({...appConfig, rocket_type: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-purple-500 outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-500">Rocket Logo URL</label>
                                    <input type="text" value={appConfig.rocket_logo || ""} onChange={e => setAppConfig({...appConfig, rocket_logo: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-purple-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Step 1 Description (BN)</label>
                                        <textarea value={appConfig.rocket_step1_bn || ""} onChange={e => setAppConfig({...appConfig, rocket_step1_bn: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-purple-500 outline-none h-20" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Step 1 Description (EN)</label>
                                        <textarea value={appConfig.rocket_step1_en || ""} onChange={e => setAppConfig({...appConfig, rocket_step1_en: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-purple-500 outline-none h-20" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Guide Lines (BN - New Line Separated)</label>
                                        <textarea value={appConfig.rocket_guide_bn || ""} onChange={e => setAppConfig({...appConfig, rocket_guide_bn: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-purple-500 outline-none h-32" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500">Guide Lines (EN - New Line Separated)</label>
                                        <textarea value={appConfig.rocket_guide_en || ""} onChange={e => setAppConfig({...appConfig, rocket_guide_en: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-3 text-sm focus:border-purple-500 outline-none h-32" />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-white/5 my-8" />

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-xl font-black text-white">Login Promotional Ad Mode (Onboarding Ad)</label>
                                    <button 
                                        onClick={() => setAppConfig({ ...appConfig, loginPromoAd_enabled: !appConfig.loginPromoAd_enabled })}
                                        className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${appConfig.loginPromoAd_enabled ? 'bg-yellow-500' : 'bg-gray-700'}`}
                                    >
                                        <div className={`w-6 h-6 bg-black rounded-full transition-transform ${appConfig.loginPromoAd_enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                                <p className="text-gray-400 text-sm">Configure the promotional advertisement that pops up exclusively after a user logs in or signs up.</p>

                                {appConfig.loginPromoAd_enabled && (
                                    <div className="grid gap-6 p-6 bg-white/5 border border-yellow-500/30 rounded-2xl">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-gray-500">Ad Cover Image URL</label>
                                            <input 
                                                type="text" placeholder="https://..."
                                                value={appConfig.loginPromoAd_imageUrl || ''} 
                                                onChange={e => setAppConfig({...appConfig, loginPromoAd_imageUrl: e.target.value})}
                                                className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 focus:border-yellow-500 outline-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase text-gray-500">Ad Title</label>
                                                <input 
                                                    type="text" placeholder="Happy Trading!"
                                                    value={appConfig.loginPromoAd_title || ''} 
                                                    onChange={e => setAppConfig({...appConfig, loginPromoAd_title: e.target.value})}
                                                    className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 focus:border-yellow-500 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase text-gray-500">Ad Text Content</label>
                                                <input 
                                                    type="text" placeholder="How does it all work..."
                                                    value={appConfig.loginPromoAd_description || ''} 
                                                    onChange={e => setAppConfig({...appConfig, loginPromoAd_description: e.target.value})}
                                                    className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 focus:border-yellow-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase text-gray-500">Button Text</label>
                                                <input 
                                                    type="text" placeholder="Get the guides"
                                                    value={appConfig.loginPromoAd_buttonText || ''} 
                                                    onChange={e => setAppConfig({...appConfig, loginPromoAd_buttonText: e.target.value})}
                                                    className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 focus:border-yellow-500 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase text-gray-500">Target Action URL (Open in new tab)</label>
                                                <input 
                                                    type="text" placeholder="https://..."
                                                    value={appConfig.loginPromoAd_buttonUrl || ''} 
                                                    onChange={e => setAppConfig({...appConfig, loginPromoAd_buttonUrl: e.target.value})}
                                                    className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 focus:border-yellow-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-gray-500">Background Color Theme</label>
                                            <div className="flex gap-4">
                                                <input 
                                                    type="color" 
                                                    value={appConfig.loginPromoAd_bgColor || '#cd6f23'} 
                                                    onChange={e => setAppConfig({...appConfig, loginPromoAd_bgColor: e.target.value})}
                                                    className="w-16 h-12 rounded cursor-pointer border border-[#1a1a24]"
                                                />
                                                <input 
                                                    type="text"
                                                    value={appConfig.loginPromoAd_bgColor || '#cd6f23'} 
                                                    onChange={e => setAppConfig({...appConfig, loginPromoAd_bgColor: e.target.value})}
                                                    className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 focus:border-yellow-500 outline-none font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6 pt-8 border-t border-red-500/20">
                            <h3 className="text-sm font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                                <Database size={16} /> Data Sovereignty (Cloud SQL Migration)
                            </h3>
                            <p className="text-xs text-gray-500">
                                Transition all user data from Firebase Firestore to your private Cloud SQL instance. This ensures permanent, relational, and performant data storage.
                            </p>
                            
                            <div className="flex flex-wrap gap-4">
                                <button 
                                    onClick={async () => {
                                        if (!confirm("Start migration? This will sync all Firestore users to Cloud SQL.")) return;
                                        try {
                                            const res = await fetch('/api/admin/migrate-users', { method: 'POST' });
                                            const data = await res.json();
                                            alert(`Migration Success! Migrated: ${data.migrated}, Skipped (Already exists): ${data.skipped}`);
                                            // Refresh data after migration
                                            const uRef = await fetch('/api/admin/users');
                                            if (uRef.ok) setUsers(await uRef.json());
                                        } catch (e) {
                                            alert("Migration failed");
                                        }
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                >
                                    <RefreshCw size={14} /> Start SQL Migration
                                </button>

                                <button 
                                    onClick={async () => {
                                        const confirmText = prompt("Irreversible action! To delete all users from Firestore (keeping them only in SQL), type: DELETE_ALL_FIRESTORE_USERS");
                                        if (confirmText !== 'DELETE_ALL_FIRESTORE_USERS') return;
                                        
                                        try {
                                            const res = await fetch('/api/admin/delete-firestore-users', { 
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ confirm: confirmText })
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                alert(`Cleaned ${data.count} legacy Firestore records.`);
                                                await fetchLists();
                                            } else {
                                                alert("Action failed: " + data.error);
                                            }
                                        } catch (e) {
                                            alert("Cleaning failed");
                                        }
                                    }}
                                    className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 px-6 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> Wipe Firestore Legacy Data
                                </button>
                            </div>
                        </div>

                        <div className="pt-8">
                           <button onClick={async () => {
                               try {
                                   const token = await auth.currentUser?.getIdToken?.();
                                   await fetch('/api/admin/config/fmp-key', {
                                       method: 'POST',
                                       headers: { 
                                           'Content-Type': 'application/json',
                                           'Authorization': `Bearer ${token}`
                                       },
                                       body: JSON.stringify({ fmpApiKey })
                                   });
                               } catch (err) {
                                   console.error("Failed to save FMP API Key", err);
                               }
                               await setDoc(doc(db, 'app_config', 'settings'), appConfig);
                               await logAdminAction('Updated config', JSON.stringify(appConfig));
                               alert('Core Settings Saved Successfully!');
                               await clearServerCache();
                           }} className="w-full bg-[#FFE24C] hover:bg-[#F0D544] text-black py-5 rounded-[32px] font-black text-[12px] uppercase tracking-widest shadow-xl shadow-yellow-500/20 active:scale-95 transition-all">SAVE CORE CONFIGURATION</button>
                       </div>
                   </div>
               </motion.div>
           )}

           {activeTab === 'kyc' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div>
                           <h2 className="text-3xl font-black uppercase tracking-tight mb-2">KYC Verification</h2>
                           <p className="text-gray-500">Review and verify user identity documents.</p>
                       </div>
                   </div>

                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                       <div className="space-y-4">
                           {kycRequests.length === 0 ? (
                               <div className="bg-[#0a0a0f] border border-[#1a1a24] rounded-[32px] p-20 text-center text-gray-500">
                                   No pending KYC requests found.
                               </div>
                           ) : (
                               <div className="bg-[#0a0a0f] border border-[#1a1a24] rounded-[32px] p-4 space-y-3">
                                   {kycRequests.map((req, idx) => (
                                       <div 
                                           key={`kyc-req-${idx}-${req.id || 'kyc-' + idx}`}
                                           onClick={() => setSelectedKYCRequest(req)}
                                           className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                                               selectedKYCRequest?.id === req.id 
                                               ? 'bg-yellow-500/10 border-yellow-500/50' 
                                               : 'bg-[#15161d] border-[#1a1a24] hover:border-white/10'
                                           }`}
                                       >
                                           <div className="flex items-center justify-between gap-4">
                                               <div className="flex items-center gap-4">
                                                   <div className="w-12 h-12 rounded-xl bg-gray-500/10 flex items-center justify-center text-gray-400">
                                                       <UserCheck size={24}/>
                                                   </div>
                                                   <div>
                                                       <h4 className="font-bold text-white tracking-tight">{req.fullName}</h4>
                                                       <p className="text-[11px] text-gray-500 font-mono uppercase tracking-widest">{req.userEmail}</p>
                                                   </div>
                                               </div>
                                               <div className="text-right">
                                                   <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                                       req.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                                       req.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                                       'bg-yellow-500/10 text-yellow-500'
                                                   }`}>
                                                       {req.status}
                                                   </span>
                                               </div>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           )}
                       </div>

                       <div className="space-y-6">
                           {selectedKYCRequest ? (
                               <div className="bg-[#0a0a0f] border border-[#1a1a24] rounded-[32px] p-8 space-y-8">
                                   <div className="flex items-center justify-between">
                                       <h3 className="text-xl font-black uppercase tracking-tight">Request Details</h3>
                                       <button onClick={() => setSelectedKYCRequest(null)} className="p-3 bg-[#15161d] text-gray-500 hover:text-white rounded-xl transition-all">
                                           <X size={20}/>
                                       </button>
                                   </div>

                                   <div className="grid grid-cols-2 gap-4 p-4 bg-[#15161d] rounded-2xl border border-white/5">
                                       <div>
                                           <label className="text-[10px] font-black uppercase text-gray-500 block">Full Name</label>
                                           <p className="font-bold">{selectedKYCRequest.fullName || selectedKYCRequest.userName}</p>
                                       </div>
                                       <div>
                                           <label className="text-[10px] font-black uppercase text-gray-500 block">ID Type</label>
                                           <p className="font-bold text-yellow-500">{selectedKYCRequest.idType || selectedKYCRequest.documentType}</p>
                                       </div>
                                       <div className="col-span-2">
                                           <label className="text-[10px] font-black uppercase text-gray-500 block">ID Number</label>
                                           <p className="font-bold">{selectedKYCRequest.idNumber || selectedKYCRequest.documentNumber}</p>
                                       </div>
                                   </div>

                                   <div className="grid grid-cols-1 gap-4">
                                       <div className="space-y-2">
                                           <label className="text-[10px] font-black uppercase text-gray-500">Front</label>
                                           <img src={selectedKYCRequest.idFrontUrl || selectedKYCRequest.frontImage} className="w-full rounded-xl border border-white/5" alt="Front" onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'}/>
                                       </div>
                                       <div className="space-y-2">
                                           <label className="text-[10px] font-black uppercase text-gray-500">Back</label>
                                           <img src={selectedKYCRequest.idBackUrl || selectedKYCRequest.backImage} className="w-full rounded-xl border border-white/5" alt="Back" onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'}/>
                                       </div>
                                       <div className="space-y-2">
                                           <label className="text-[10px] font-black uppercase text-gray-500">Selfie</label>
                                           <img src={selectedKYCRequest.selfieUrl || selectedKYCRequest.selfieImage} className="w-full rounded-xl border border-white/5" alt="Selfie" onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'}/>
                                       </div>
                                   </div>

                                   {selectedKYCRequest.status === 'pending' && (
                                       <div className="flex gap-4 pt-4 border-t border-white/5">
                                           <button 
                                               onClick={async () => {
                                                   try {
                                                       const res = await fetch('/api/admin/kyc/update', {
                                                           method: 'POST',
                                                           headers: { 'Content-Type': 'application/json' },
                                                           body: JSON.stringify({
                                                               id: selectedKYCRequest.id,
                                                               status: 'approved',
                                                               userId: selectedKYCRequest.userId
                                                           })
                                                       });
                                                       if (!res.ok) throw new Error("Update failed");
                                                       await fetchLists();
                                                       setSelectedKYCRequest(null);
                                                       alert("Approved!");
                                                   } catch (e) { alert(e.message); }
                                               }}
                                               className="flex-1 bg-green-500 text-black py-3 rounded-xl font-black"
                                           >
                                               APPROVE
                                           </button>
                                           <button 
                                               onClick={async () => {
                                                   const r = prompt("Reason:");
                                                   if (!r) return;
                                                   try {
                                                       const res = await fetch('/api/admin/kyc/update', {
                                                           method: 'POST',
                                                           headers: { 'Content-Type': 'application/json' },
                                                           body: JSON.stringify({
                                                               id: selectedKYCRequest.id,
                                                               status: 'rejected',
                                                               rejectionReason: r,
                                                               userId: selectedKYCRequest.userId
                                                           })
                                                       });
                                                       if (!res.ok) throw new Error("Update failed");
                                                       await fetchLists();
                                                       setSelectedKYCRequest(null);
                                                       alert("Rejected.");
                                                   } catch (e) { alert(e.message); }
                                               }}
                                               className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black"
                                           >
                                               REJECT
                                           </button>
                                       </div>
                                   )}
                               </div>
                           ) : (
                               <div className="bg-[#0a0a0f] border border-[#1a1a24] rounded-[32px] p-20 text-center text-gray-500">
                                   Select a request to verify documents.
                               </div>
                           )}
                       </div>
                   </div>
               </motion.div>
           )}

           {activeTab === 'tickets' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                   <AgentSupportHub currentUser={auth.currentUser} userRole={userRole} />
               </motion.div>
           )}

            {activeTab === 'pages' && (
              <motion.div key="pages" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <FileText className="text-yellow-500" size={28} />
                            ABOUT US
                        </h2>
                        <p className="text-gray-500 mt-2 text-sm font-medium">Manage textual content for the About Us page</p>
                    </div>
                    <button onClick={savePages} className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
                        <Check size={20} />
                        Save Changes
                    </button>
                </div>

                <div className="bg-[#0a0a0f] border border-[#1a1a24] rounded-3xl overflow-hidden shadow-2xl p-8 mb-8">
                  <h3 className="text-xl font-bold mb-6 text-white border-b border-[#1a1a24] pb-4">About Us</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Main Title</label>
                      <input 
                        className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 text-white focus:border-yellow-500 transition-colors"
                        value={aboutUsData.title}
                        onChange={(e) => setAboutUsData({...aboutUsData, title: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-gray-400 text-xs font-bold uppercase">Paragraphs</label>
                        <button onClick={() => setAboutUsData({...aboutUsData, paragraphs: [...aboutUsData.paragraphs, ""]})} className="text-yellow-500 text-xs font-bold hover:text-yellow-400">+ Add Paragraph</button>
                      </div>
                      <div className="space-y-3">
                        {aboutUsData.paragraphs.map((p: string, i: number) => (
                          <div key={`about-para-${i}-${p.substring(0, 10)}`} className="flex gap-2">
                            <textarea 
                              className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 text-white focus:border-yellow-500 transition-colors min-h-[100px]"
                              value={p}
                              onChange={(e) => {
                                const newP = [...aboutUsData.paragraphs];
                                newP[i] = e.target.value;
                                setAboutUsData({...aboutUsData, paragraphs: newP});
                              }}
                            />
                            <button onClick={() => {
                              const newP = [...aboutUsData.paragraphs];
                              newP.splice(i, 1);
                              setAboutUsData({...aboutUsData, paragraphs: newP});
                            }} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors h-12">
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2 mt-8">
                        <label className="block text-gray-400 text-xs font-bold uppercase">Advantages List</label>
                        <button onClick={() => setAboutUsData({...aboutUsData, advantages: [...aboutUsData.advantages, ""]})} className="text-yellow-500 text-xs font-bold hover:text-yellow-400">+ Add Advantage</button>
                      </div>
                      <div className="space-y-3">
                        {aboutUsData.advantages.map((adv: string, i: number) => (
                          <div key={`about-adv-${i}-${adv.substring(0, 10)}`} className="flex gap-2">
                            <input 
                              className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 text-white focus:border-yellow-500 transition-colors"
                              value={adv}
                              onChange={(e) => {
                                const newA = [...aboutUsData.advantages];
                                newA[i] = e.target.value;
                                setAboutUsData({...aboutUsData, advantages: newA});
                              }}
                            />
                            <button onClick={() => {
                              const newA = [...aboutUsData.advantages];
                              newA.splice(i, 1);
                              setAboutUsData({...aboutUsData, advantages: newA});
                            }} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors flex-shrink-0">
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-[#1a1a24]">
                      <h4 className="text-lg font-bold mb-4 text-white">Contacts Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Company Name</label>
                          <input 
                            className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 text-white focus:border-yellow-500 transition-colors"
                            value={aboutUsData.contacts?.companyName || ''}
                            onChange={(e) => setAboutUsData({...aboutUsData, contacts: {...aboutUsData.contacts, companyName: e.target.value}})}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Support Email</label>
                          <input 
                            className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 text-white focus:border-yellow-500 transition-colors"
                            value={aboutUsData.contacts?.email || ''}
                            onChange={(e) => setAboutUsData({...aboutUsData, contacts: {...aboutUsData.contacts, email: e.target.value}})}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Company Address</label>
                          <textarea 
                            className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 text-white focus:border-yellow-500 transition-colors"
                            value={aboutUsData.contacts?.address || ''}
                            onChange={(e) => setAboutUsData({...aboutUsData, contacts: {...aboutUsData.contacts, address: e.target.value}})}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'aml_policy' && (
              <motion.div key="aml_policy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <FileText className="text-yellow-500" size={28} />
                            AML POLICY & REGULATIONS
                        </h2>
                        <p className="text-gray-500 mt-2 text-sm font-medium">Manage textual content for AML Policy and Regulations</p>
                    </div>
                    <button onClick={savePages} className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
                        <Check size={20} />
                        Save Changes
                    </button>
                </div>

                <div className="bg-[#0a0a0f] border border-[#1a1a24] rounded-3xl overflow-hidden shadow-2xl p-8 mb-8">
                  <h3 className="text-xl font-bold mb-6 text-white border-b border-[#1a1a24] pb-4">Regulations</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Main Title</label>
                      <input 
                        className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 text-white focus:border-yellow-500 transition-colors"
                        value={regulationsData.title}
                        onChange={(e) => setRegulationsData({...regulationsData, title: e.target.value})}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-gray-400 text-xs font-bold uppercase">Intro Paragraphs</label>
                        <button onClick={() => setRegulationsData({...regulationsData, introParas: [...regulationsData.introParas, ""]})} className="text-yellow-500 text-xs font-bold hover:text-yellow-400">+ Add Paragraph</button>
                      </div>
                      <div className="space-y-3">
                        {regulationsData.introParas.map((p: string, i: number) => (
                          <div key={`reg-intro-para-${i}`} className="flex gap-2">
                            <textarea 
                              className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 text-white focus:border-yellow-500 transition-colors min-h-[100px]"
                              value={p}
                              onChange={(e) => {
                                const newP = [...regulationsData.introParas];
                                newP[i] = e.target.value;
                                setRegulationsData({...regulationsData, introParas: newP});
                              }}
                            />
                            <button onClick={() => {
                              const newP = [...regulationsData.introParas];
                              newP.splice(i, 1);
                              setRegulationsData({...regulationsData, introParas: newP});
                            }} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors h-12">
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Compensation Fund Text</label>
                      <textarea 
                        className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 text-white focus:border-yellow-500 transition-colors min-h-[80px]"
                        value={regulationsData.compensationFundText}
                        onChange={(e) => setRegulationsData({...regulationsData, compensationFundText: e.target.value})}
                      />
                    </div>

                    <div className="pt-8 border-t border-[#1a1a24]">
                      <h4 className="text-lg font-bold mb-4 text-white">VMT Section</h4>
                      <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase mb-2">VMT Title</label>
                        <input 
                          className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 text-white focus:border-yellow-500 transition-colors"
                          value={regulationsData.vmtSection?.title || ''}
                          onChange={(e) => setRegulationsData({...regulationsData, vmtSection: {...regulationsData.vmtSection, title: e.target.value}})}
                        />
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-gray-400 text-xs font-bold uppercase">VMT Paragraphs</label>
                          <button onClick={() => setRegulationsData({...regulationsData, vmtSection: {...regulationsData.vmtSection, paras: [...(regulationsData.vmtSection?.paras || []), ""]}})} className="text-yellow-500 text-xs font-bold hover:text-yellow-400">+ Add Paragraph</button>
                        </div>
                        <div className="space-y-3">
                          {regulationsData.vmtSection?.paras?.map((p: string, i: number) => (
                            <div key={`vmt-${i}`} className="flex gap-2">
                              <textarea 
                                className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 text-white focus:border-yellow-500 transition-colors min-h-[100px]"
                                value={p}
                                onChange={(e) => {
                                  const newP = [...regulationsData.vmtSection.paras];
                                  newP[i] = e.target.value;
                                  setRegulationsData({...regulationsData, vmtSection: {...regulationsData.vmtSection, paras: newP}});
                                }}
                              />
                              <button onClick={() => {
                                const newP = [...regulationsData.vmtSection.paras];
                                newP.splice(i, 1);
                                setRegulationsData({...regulationsData, vmtSection: {...regulationsData.vmtSection, paras: newP}});
                              }} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors h-12">
                                <Trash2 size={16}/>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'client_agreement' && (
              <motion.div key="client_agreement" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <FileText className="text-yellow-500" size={28} />
                            CLIENT AGREEMENT
                        </h2>
                        <p className="text-gray-500 mt-2 text-sm font-medium">Manage the main client agreement content.</p>
                    </div>
                    <button onClick={savePages} className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
                        <Check size={20} />
                        Save Changes
                    </button>
                </div>
                <div className="bg-[#0a0a0f] border border-[#1a1a24] rounded-3xl p-8 mb-8 space-y-6">
                  <div>
                      <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Agreement Title</label>
                      <input 
                        className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 text-white focus:border-yellow-500 transition-colors"
                        value={clientAgreementData.title}
                        onChange={(e) => setClientAgreementData({...clientAgreementData, title: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Agreement Content</label>
                      <textarea 
                        className="w-full bg-[#15161d] border border-[#1a1a24] rounded-xl px-4 py-3 text-white focus:border-yellow-500 transition-colors min-h-[400px]"
                        value={clientAgreementData.content}
                        onChange={(e) => setClientAgreementData({...clientAgreementData, content: e.target.value})}
                      />
                  </div>
                </div>
              </motion.div>
            )}

           {activeTab === 'affiliate' && (
               <motion.div key="affiliate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                   <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="space-y-1">
                           <h2 className="text-3xl font-black text-white tracking-tight">Affiliate <span className="text-yellow-500">Command</span></h2>
                           <p className="text-gray-500 text-sm font-medium">Global partner network orchestration and commission protocol management.</p>
                       </div>
                   </header>

                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                       {[
                           { label: 'Total Partners', val: affiliateStats.totalAffiliates, icon: Users, color: 'text-indigo-500' },
                           { label: 'Network Referrals', val: affiliateStats.totalReferrals, icon: Share, color: 'text-emerald-500' },
                           { label: 'Platform Rev-Share', val: `৳${affiliateStats.totalCommission.toLocaleString()}`, icon: DollarSign, color: 'text-yellow-500' },
                       ].map((s, i) => (
                           <div key={`aff-stat-${i}`} className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[40px] space-y-4">
                               <div className="w-12 h-12 rounded-2xl bg-[#15161d] flex items-center justify-center border border-white/5">
                                   {s.label === 'Network Referrals' ? <Users size={20} className={s.color} /> : <s.icon size={20} className={s.color} />}
                               </div>
                               <div>
                                   <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">{s.label}</p>
                                   <p className="text-3xl font-black text-white tracking-tighter">{s.val}</p>
                               </div>
                           </div>
                       ))}
                   </div>

                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                       <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[48px] space-y-8">
                           <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                               <Settings2 className="text-yellow-500" size={24} />
                               Commission Tiers
                           </h3>
                           <div className="space-y-6">
                               {[
                                   { id: 'starter', label: 'Starter', minRefs: 0, defaultShare: 50 },
                                   { id: 'pro', label: 'Pro Partner', minRefs: 11, defaultShare: 60 },
                                   { id: 'vip', label: 'VIP Partner', minRefs: 51, defaultShare: 70 },
                                   { id: 'elite', label: 'Elite Master', minRefs: 201, defaultShare: 80 },
                               ].map((tier) => (
                                   <div key={tier.id} className="bg-[#15161d] p-6 rounded-3xl border border-white/5 space-y-4">
                                       <div className="flex justify-between items-center">
                                           <span className="font-black text-white text-sm uppercase tracking-widest">{tier.label}</span>
                                           <span className="text-[10px] text-gray-500 font-bold uppercase">Min Refs: {tier.minRefs}</span>
                                       </div>
                                       <div className="flex items-center gap-4">
                                           <div className="flex-1 space-y-2">
                                               <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Share Percentage (%)</label>
                                               <input 
                                                   type="number" 
                                                   value={appConfig[`affiliate_share_${tier.id}`] || tier.defaultShare} 
                                                   onChange={e => setAppConfig({ ...appConfig, [`affiliate_share_${tier.id}`]: Number(e.target.value) })}
                                                   className="w-full bg-[#0a0a0f] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-yellow-500 outline-none"
                                               />
                                           </div>
                                       </div>
                                   </div>
                               ))}
                               <button 
                                   onClick={async () => {
                                       await setDoc(doc(db, 'app_config', 'settings'), appConfig, { merge: true });
                                       await logAdminAction('Affiliate Config Update', 'Updated global commission tiers');
                                       alert('Commission Tiers Saved');
                                   }}
                                   className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-yellow-500/10 active:scale-[0.98] transition-all"
                               >
                                   Apply Dynamic Tiers
                               </button>
                           </div>
                       </div>

                           <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[48px] space-y-6">
                               <div className="flex items-center justify-between">
                                   <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                       <Award className="text-yellow-500" size={24} />
                                       Marketing Assets
                                   </h3>
                                   <button 
                                       onClick={() => {
                                           setEditingItem({ label: 'New Banner', size: '1080x1080', color: 'bg-indigo-600', imageUrl: '' });
                                           setModalType('promoMaterials' as any);
                                       }}
                                       className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl hover:bg-yellow-500 hover:text-black transition-all"
                                   >
                                       <Plus size={18} />
                                   </button>
                               </div>
                               <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                   {promoMaterials.map((item, i) => (
                                       <div key={`${item.id}-${i}`} className="bg-[#15161d] border border-white/5 p-4 rounded-3xl space-y-3 group">
                                           <div className="flex items-center justify-between">
                                               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.size}</span>
                                               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                   <button onClick={() => { navigator.clipboard.writeText(item.imageUrl || ''); alert('Copied Image URL!'); }} className="text-gray-500 hover:text-blue-500"><Copy size={12} /></button>
                                                   <button onClick={() => { setEditingItem(item); setModalType('promoMaterials' as any); }} className="text-gray-500 hover:text-yellow-500"><Edit2 size={12} /></button>
                                                   <button onClick={async () => { if(confirm('Delete asset?')) await deleteDoc(doc(db, 'promoMaterials', item.id)); }} className="text-gray-500 hover:text-rose-500"><Trash2 size={12} /></button>
                                               </div>
                                           </div>
                                           <div className={`aspect-square rounded-2xl ${item.color || 'bg-white/5'} flex items-center justify-center overflow-hidden`}>
                                               {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" alt=""  loading="lazy" /> : <Award size={24} className="text-white/20" />}
                                           </div>
                                           <p className="text-[11px] font-bold text-white truncate">{item.label}</p>
                                       </div>
                                   ))}
                               </div>
                           </div>

                           <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[48px] space-y-6">
                           <div className="flex items-center justify-between">
                               <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                   <Users className="text-yellow-500" size={24} />
                                   Active Partners
                               </h3>
                           </div>
                           <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                               {(Array.isArray(users) ? users : []).filter(u => (Array.isArray(users) ? users : []).some(other => 
                                 other.referredByUid === u.uid || 
                                 (u.affiliateId && other.referredBy === String(u.affiliateId)) ||
                                 other.referredBy === (u.uid ? String(u.uid).substring(0, 8).toUpperCase() : '')
                               )).map((aff, i) => {
                                   const refCount = (Array.isArray(users) ? users : []).filter(u => 
                                     u.referredByUid === aff.uid || 
                                     (aff.affiliateId && u.referredBy === String(aff.affiliateId)) ||
                                     u.referredBy === (aff.uid ? String(aff.uid).substring(0, 8).toUpperCase() : '')
                                   ).length;
                                   return (
                                       <div key={`${aff.id}-${i}`} className="bg-[#15161d] border border-white/5 p-5 rounded-3xl flex items-center justify-between group hover:border-yellow-500/20 transition-all">
                                           <div className="flex items-center gap-4">
                                               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-yellow-500 font-black shadow-inner">
                                                   {aff.email?.[0].toUpperCase()}
                                               </div>
                                               <div>
                                                   <p className="font-bold text-white text-sm">{aff.email}</p>
                                                   <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Network: {refCount} Traders</p>
                                                    <div className="mt-2.5 flex items-center gap-1.5 bg-[#050508] p-1.5 rounded-xl border border-white/5 w-fit">
                                                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest pl-1">Share:</span>
                                                        <input 
                                                            type="number" 
                                                            placeholder="Auto Tier"
                                                            value={aff.customAffiliateShare || ''} 
                                                            onChange={async (e) => {
                                                                const val = e.target.value === '' ? null : Number(e.target.value);
                                                                await updateDoc(doc(db, 'users', aff.id), { customAffiliateShare: val });
                                                                await logAdminAction('Partner Override Update', `Set custom affiliate share for ${aff.email} to ${val !== null ? val + '%' : 'auto-calculate'}`);
                                                            }}
                                                            className="w-16 bg-[#0c0c12] border border-white/5 rounded-lg px-2 py-0.5 text-[10px] text-yellow-500 text-center font-black focus:outline-none focus:border-yellow-500 transition-colors"
                                                        />
                                                        <span className="text-[9px] text-gray-500 font-black">%</span>
                                                    </div>
                                               </div>
                                           </div>
                                           <div className="text-right">
                                               <p className="font-black text-indigo-500 text-sm">৳{(aff.tradeVolume || 0).toLocaleString()}</p>
                                               <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest whitespace-nowrap">Volume Gen</p>
                                           </div>
                                       </div>
                                   );
                               })}
                           </div>
                       </div>
                   </div>
                    {/* Affiliate Cashout Request approvals ledger */}
                    <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[48px] space-y-8 mt-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                    <Wallet className="text-yellow-500" size={24} />
                                    Affiliate Payout Approvals
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">Verify pending partner commission dispersals, approve and complete transactions, or reject with safety comments.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={affPayoutFilterStatus}
                                    onChange={(e) => setAffPayoutFilterStatus(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-yellow-500"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <select
                                    value={affPayoutSortDate}
                                    onChange={(e) => setAffPayoutSortDate(e.target.value as any)}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-yellow-500"
                                >
                                    <option value="desc">Newest First</option>
                                    <option value="asc">Oldest First</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5 pb-4 font-mono">
                                        <th className="pb-4">Date Initiated</th>
                                        <th className="pb-4">Partner Email</th>
                                        <th className="pb-4 text-right">Requested Amount</th>
                                        <th className="pb-4">Gateway</th>
                                        <th className="pb-4">Dispersal Credentials</th>
                                        <th className="pb-4">Status & Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {(Array.isArray(affPayouts) ? affPayouts : [])
                                        .filter(req => affPayoutFilterStatus === 'all' || req.status === affPayoutFilterStatus)
                                        .sort((a, b) => {
                                            const da = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                                            const db_ = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                                            return affPayoutSortDate === 'desc' ? db_ - da : da - db_;
                                        })
                                        .length > 0 ? (
                                        (Array.isArray(affPayouts) ? affPayouts : [])
                                            .filter(req => affPayoutFilterStatus === 'all' || req.status === affPayoutFilterStatus)
                                            .sort((a, b) => {
                                                const da = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                                                const db_ = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                                                return affPayoutSortDate === 'desc' ? db_ - da : da - db_;
                                            })
                                            .map((req, i) => {
                                            const dateStr = (req.createdAt && typeof req.createdAt.toDate === 'function') 
                                                ? req.createdAt.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                                                : 'Pending';
                                            const isPending = req.status === 'pending';
                                            const isProcessing = isProcessingAffPayout[req.id];

                                            return (
                                                <tr key={`aff-payout-adm-${req.id || i}`} className="hover:bg-[#15161d]/20 transition-all font-sans">
                                                    <td className="py-5 text-[13px] text-gray-500 font-bold">{dateStr}</td>
                                                    <td className="py-5 text-white font-bold text-[13px]">{req.email || req.userId}</td>
                                                    <td className="py-5 text-right font-black text-yellow-500 text-[14px]">
                                                        {req.currency || '৳'} {parseFloat(req.amount || 0).toFixed(2)}
                                                    </td>
                                                    <td className="py-5">
                                                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-white/5 text-gray-400 border border-white/5 font-mono">
                                                            {req.gateway}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 text-[12px] font-mono text-gray-400 max-w-[200px] truncate" title={req.details}>
                                                        {req.details}
                                                    </td>
                                                    <td className="py-5">
                                                        {isPending ? (
                                                            <div className="flex flex-col gap-2 max-w-[200px]">
                                                                <button
                                                                    disabled={isProcessing}
                                                                    onClick={async () => {
                                                                        if (!confirm(`Are you sure you want to approve this withdrawal request of ${req.currency || '৳'}${req.amount}?`)) return;
                                                                        setIsProcessingAffPayout(prev => ({ ...prev, [req.id]: true }));
                                                                        try {
                                                                            await updateDoc(doc(db, 'affiliate_payouts', req.id), {
                                                                                status: 'completed',
                                                                                processedAt: new Date()
                                                                            });
                                                                            await logAdminAction('Affiliate Payout Approved', `Approved payout request of ${req.amount} ${req.currency || '৳'} for user ${req.email || req.userId}`);
                                                                            alert('Payout Approved and Transferred successfully!');
                                                                        } catch (err: any) {
                                                                            alert('Error approving payout: ' + err.message);
                                                                        } finally {
                                                                            setIsProcessingAffPayout(prev => ({ ...prev, [req.id]: false }));
                                                                        }
                                                                    }}
                                                                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                                                                >
                                                                    {isProcessing ? 'Processing...' : 'Approve Cashout'}
                                                                </button>
                                                                <div className="flex gap-2">
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="Rejection comment..."
                                                                        value={rejectionReasons[req.id] || ''}
                                                                        onChange={(e) => setRejectionReasons(prev => ({ ...prev, [req.id]: e.target.value }))}
                                                                        className="flex-grow bg-[#050508] border border-white/5 rounded-lg px-2 py-1 text-[10px] focus:outline-none focus:border-rose-500 text-white"
                                                                    />
                                                                    <button
                                                                        disabled={isProcessing}
                                                                        onClick={async () => {
                                                                            const reason = rejectionReasons[req.id]?.trim();
                                                                            if (!reason) {
                                                                                alert('Please enter a rejection reason first!');
                                                                                return;
                                                                            }
                                                                            if (!confirm(`Reject payout request? Amount will be refunded back to the partner.`)) return;
                                                                            setIsProcessingAffPayout(prev => ({ ...prev, [req.id]: true }));
                                                                            try {
                                                                                await updateDoc(doc(db, 'affiliate_payouts', req.id), {
                                                                                    status: 'rejected',
                                                                                    rejectReason: reason,
                                                                                    processedAt: new Date()
                                                                                });
                                                                                const userDocRef = doc(db, 'users', req.userId);
                                                                                const userSnap = await getDoc(userDocRef);
                                                                                if (userSnap.exists()) {
                                                                                    const currentBal = userSnap.data().affiliateBalance || 0;
                                                                                    await updateDoc(userDocRef, {
                                                                                        affiliateBalance: currentBal + Number(req.amount)
                                                                                    });
                                                                                }
                                                                                await logAdminAction('Affiliate Payout Rejected', `Rejected payout request for ${req.email || req.userId}. Reason: ${reason}`);
                                                                                alert('Payout Rejected and Refunded successfully!');
                                                                            } catch (err: any) {
                                                                                alert('Error rejecting: ' + err.message);
                                                                            } finally {
                                                                                setIsProcessingAffPayout(prev => ({ ...prev, [req.id]: false }));
                                                                            }
                                                                        }}
                                                                        className="px-2 py-2 bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                {req.status === 'completed' && (
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-emerald-500/10 text-emerald-400 uppercase tracking-widest border border-emerald-500/10 font-mono">
                                                                        ✓ Disbursed
                                                                    </span>
                                                                )}
                                                                {req.status === 'rejected' && (
                                                                    <div className="space-y-1">
                                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-rose-500/10 text-rose-400 uppercase tracking-widest border border-rose-500/10 font-mono">
                                                                            ✗ Rejected
                                                                        </span>
                                                                        <p className="text-[10px] text-gray-500 italic max-w-[150px] truncate" title={req.rejectReason}>
                                                                            {req.rejectReason}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center text-gray-500 font-bold text-sm">
                                                Zero pending partner cashout dispersals found in ledger
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

           {activeTab === 'signals' && (
               <motion.div key="signals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                   <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="space-y-1">
                           <h2 className="text-3xl font-black text-white tracking-tight">Signal <span className="text-yellow-500">Broadcast</span></h2>
                           <p className="text-gray-500 text-sm font-medium">Distribute real-time trading insights across the global network.</p>
                       </div>
                       <button 
                           onClick={() => {
                               setEditingItem({ asset: 'EUR/USD', direction: 'CALL', timeframe: '5m', accuracy: 85, status: 'Active' });
                               setModalType('signals' as any);
                           }} 
                           className="bg-yellow-500 hover:bg-yellow-600 text-black font-black px-8 py-4 rounded-2xl text-[12px] uppercase tracking-widest shadow-xl shadow-yellow-500/20 transition-all flex items-center gap-2 group"
                       >
                           <Zap size={18} />
                           Generate Signal
                        </button>
                        <button 
                            onClick={async () => {
                                try {
                                    await addDoc(collection(db, 'signals'), {
                                        asset: 'EUR/USD',
                                        direction: 'CALL',
                                        timeframe: '1 minute',
                                        accuracy: 90,
                                        status: 'Active',
                                        createdAt: Date.now()
                                    });
                                    alert("EUR/USD Signal Added Successfully");
                                } catch (e: any) {
                                    alert("Failed: " + e.message);
                                }
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-black font-black px-8 py-4 rounded-2xl text-[12px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2"
                        >
                            <Zap size={18} />
                            Add EUR/USD Signal
                        </button>
                   </header>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {signals.map((sig, i) => (
                           <div key={`sig-log-${sig.id || i}`} className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[40px] relative overflow-hidden group">
                               <div className="absolute top-0 right-0 p-6 flex gap-2">
                                   <button onClick={() => { setEditingItem(sig); setModalType('signals' as any); }} className="p-2 bg-white/5 rounded-xl hover:bg-yellow-500 hover:text-black transition-all">
                                       <Edit2 size={16} />
                                   </button>
                                   <button onClick={async () => { if(confirm('Delete signal?')) await deleteDoc(doc(db, 'signals', sig.id)); }} className="p-2 bg-white/5 rounded-xl hover:bg-rose-500 text-gray-500 hover:text-white transition-all">
                                       <Trash2 size={16} />
                                   </button>
                               </div>

                               <div className="flex items-center gap-4 mb-6">
                                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 ${sig.direction === 'CALL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                       {sig.direction === 'CALL' ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
                                   </div>
                                   <div>
                                       <h3 className="text-xl font-black text-white">{sig.asset}</h3>
                                       <span className={`text-[9px] font-black uppercase tracking-widest ${sig.status === 'Active' ? 'text-emerald-500' : 'text-gray-500'}`}>{sig.status}</span>
                                   </div>
                               </div>

                               <div className="grid grid-cols-2 gap-4 mb-6">
                                   <div className="bg-[#15161d] p-4 rounded-2xl border border-white/5">
                                       <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Timeframe</p>
                                       <p className="font-bold text-white text-sm">{sig.timeframe}</p>
                                   </div>
                                   <div className="bg-[#15161d] p-4 rounded-2xl border border-white/5">
                                       <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Confidence</p>
                                       <p className="font-bold text-white text-sm">{sig.accuracy}%</p>
                                   </div>
                               </div>

                               <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                  <span className="text-[10px] text-gray-500 font-bold">{new Date(sig.createdAt).toLocaleTimeString()}</span>
                                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${sig.direction === 'CALL' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'}`}>
                                      {sig.direction === 'CALL' ? 'BULLISH' : 'BEARISH'}
                                  </div>
                               </div>
                           </div>
                       ))}
                   </div>
               </motion.div>
           )}

           {activeTab === 'copytrading' && (
               <motion.div key="copytrading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                   <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="space-y-1">
                           <h2 className="text-3xl font-black text-white tracking-tight">Master <span className="text-yellow-500">Traders</span></h2>
                           <p className="text-gray-500 text-sm font-medium">Curate the elite pool of traders for the copy trading ecosystem.</p>
                       </div>
                       <button 
                           onClick={() => {
                               setEditingItem({ 
                                   name: '', 
                                   winRate: 0, 
                                   totalProfit: 0, 
                                   followers: 0, 
                                   strategy: '', 
                                   avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=newtrader',
                                   riskLevel: 'Medium',
                                   minInvestment: 100,
                                   totalTrades: 0,
                                   wonTrades: 0,
                                   lostTrades: 0,
                                   profitFactor: 0,
                                   assets: ['BTC/USD', 'EUR/USD'],
                                   isVerified: true
                               });
                               setModalType('masterTraders' as any);
                           }} 
                           className="bg-yellow-500 hover:bg-yellow-600 text-black font-black px-8 py-4 rounded-2xl text-[12px] uppercase tracking-widest shadow-xl shadow-yellow-500/20 transition-all flex items-center gap-2"
                       >
                           <Plus size={18} />
                           Add Master
                       </button>
                   </header>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       {masterTraders.map((master, i) => (
                           <div key={`master-tr-${master.id || i}`} className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[48px] text-center space-y-6 relative group">
                               <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingItem(master); setModalType('masterTraders' as any); }} className="p-2 bg-white/10 rounded-xl hover:bg-yellow-500 hover:text-black transition-all">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={async () => { if(confirm('Remove master?')) await deleteDoc(doc(db, 'masterTraders', master.id)); }} className="p-2 bg-white/10 rounded-xl hover:bg-rose-500 transition-all">
                                        <Trash2 size={14} />
                                    </button>
                               </div>
                               <div className="relative inline-block mx-auto">
                                   <img src={master.avatar} className="w-24 h-24 rounded-[32px] border-4 border-white/5 bg-[#15161d]" alt={master.name}  loading="lazy" />
                                   <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg">99%</div>
                               </div>
                               <div>
                                   <h3 className="text-lg font-black text-white">{master.name}</h3>
                                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{master.strategy}</p>
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                   <div className="bg-[#15161d] p-4 rounded-3xl border border-white/5">
                                       <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Win Rate</p>
                                       <p className="font-black text-emerald-500 text-sm">{master.winRate}%</p>
                                   </div>
                                   <div className="bg-[#15161d] p-4 rounded-3xl border border-white/5">
                                       <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Followers</p>
                                       <p className="font-black text-white text-sm">{master.followers}</p>
                                   </div>
                               </div>
                               <div className="pt-2">
                                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Life Profit</p>
                                   <p className="text-xl font-black text-yellow-500">৳{master.totalProfit.toLocaleString()}</p>
                               </div>
                           </div>
                       ))}
                   </div>
               </motion.div>
           )}

           {/* Keep existing tabs below... */}

           {activeTab === 'logs' && (
               <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                   <div className="flex justify-between items-end">
                       <h2 className="text-2xl font-black text-white flex items-center gap-3">
                           <FileText className="text-yellow-500" size={28} />
                           SYSTEM LOGS
                       </h2>
                   </div>
                   
                   <div className="bg-[#0a0a0f] border border-[#1a1a24] rounded-3xl overflow-hidden shadow-2xl">
                       <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                               <thead className="bg-[#15161d] text-xs font-black text-gray-500 uppercase tracking-widest border-b border-[#1a1a24]">
                                   <tr>
                                       <th className="px-6 py-5 rounded-tl-3xl">Action</th>
                                       <th className="px-6 py-5 hidden md:table-cell">Description</th>
                                       <th className="px-6 py-5 hidden sm:table-cell">Admin</th>
                                       <th className="px-6 py-5 text-right rounded-tr-3xl">Time</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-[#1a1a24]">
                                   {systemLogs.map((log, i) => (
                                       <tr key={`sys-log-${log.id || i}`} className="hover:bg-white/[0.02] transition-colors group">
                                           <td className="px-6 py-5">
                                               <div className="flex items-center gap-3">
                                                   <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                                       <Activity size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                                                   </div>
                                                   <span className="font-bold text-white whitespace-nowrap">{log.action}</span>
                                               </div>
                                           </td>
                                           <td className="px-6 py-5 text-sm text-gray-400 max-w-[200px] md:max-w-xs lg:max-w-md hidden md:table-cell truncate" title={log.description}>
                                               {log.description}
                                           </td>
                                           <td className="px-6 py-5 hidden sm:table-cell">
                                               <span className="bg-white/5 border border-white/10 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                                                   {log.adminEmail || log.adminId}
                                               </span>
                                           </td>
                                           <td className="px-6 py-5 text-right whitespace-nowrap">
                                               <div className="flex flex-col items-end gap-1">
                                                   <div className="flex items-center gap-1.5 text-gray-300 text-sm font-medium">
                                                       <Clock size={14} className="text-gray-500" />
                                                       {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                   </div>
                                                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{new Date(log.timestamp).toLocaleDateString()}</span>
                                               </div>
                                           </td>
                                       </tr>
                                   ))}
                                   {systemLogs.length === 0 && (
                                       <tr>
                                           <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                                               No system logs found
                                           </td>
                                       </tr>
                                   )}
                               </tbody>
                           </table>
                       </div>
                   </div>
               </motion.div>
           )}
        </AnimatePresence>
        </div>
      </main>

      {/* USER DETAIL MODAL */}
      <AnimatePresence>
        {selectedUserDetail && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 md:p-6 lg:p-12 overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                    onClick={() => { setSelectedUserDetail(null); setUserDetailTab('overview'); }}
                />
                
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 100 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 100 }}
                    className="relative w-full h-full md:h-[90vh] max-w-7xl bg-[#07070a] md:border md:border-white/10 md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden z-[510]"
                >
                    {/* Modal Header - Professional & Mobile Optimized */}
                    <div className="px-6 py-5 md:px-10 md:py-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md sticky top-0 z-20">
                        <div className="flex items-center gap-4 md:gap-6 min-w-0">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 border border-yellow-500/20 flex items-center justify-center text-yellow-500 font-black text-xl md:text-2xl flex-shrink-0">
                                {selectedUserDetail.email?.[0].toUpperCase()}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none truncate pr-4">{selectedUserDetail.email}</h3>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[80px] md:max-w-none">UID: {selectedUserDetail.id}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-700 flex-shrink-0" />
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${selectedUserDetail.kycStatus === 'verified' ? 'text-green-500' : 'text-yellow-500/60'}`}>
                                        {selectedUserDetail.kycStatus === 'verified' ? 'Verified Node' : 'Unverified Access'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setSelectedUserDetail(null); setUserDetailTab('overview'); }}
                            className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90 flex-shrink-0"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation Tabs - Scrollable on mobile */}
                    <div className="flex overflow-x-auto no-scrollbar border-b border-white/5 px-4 md:px-10 bg-black/20">
                        {[
                            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                            { id: 'trades', label: 'Trade Logs', icon: BarChart2 },
                            { id: 'finances', label: 'Finances', icon: Wallet },
                            { id: 'profile', label: 'Profile', icon: User },
                            { id: 'security', label: 'Security', icon: Lock },
                            ...(admins.some(a => a.id === selectedUserDetail.id) ? [{ id: 'staff', label: 'Clearance', icon: Shield }] : [])
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setUserDetailTab(tab.id as any)}
                                className={`px-6 py-5 flex items-center gap-3 border-b-2 transition-all whitespace-nowrap text-[10px] md:text-xs font-black uppercase tracking-[0.15em] ${userDetailTab === tab.id ? 'border-yellow-500 text-yellow-500 bg-yellow-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-black/10">
                        <AnimatePresence mode="wait">
                            {userDetailTab === 'overview' && (
                                <motion.div 
                                    key="overview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                    className="space-y-8"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-[#0f0f15] border border-white/5 p-6 rounded-[32px] space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                                                    <Wallet size={20} />
                                                </div>
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Capital Pool</h4>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-3xl font-black text-white font-mono leading-none">৳{selectedUserDetail.balance?.toLocaleString() || '0'}</p>
                                                <p className="text-[9px] text-gray-600 font-bold uppercase">Settled Real Balance</p>
                                            </div>
                                        </div>
                                        <div className="bg-[#0f0f15] border border-white/5 p-6 rounded-[32px] space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                    <Activity size={20} />
                                                </div>
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Simulation Node</h4>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-3xl font-black text-white font-mono leading-none">৳{selectedUserDetail.demoBalance?.toLocaleString() || '10,000'}</p>
                                                <p className="text-[9px] text-gray-600 font-bold uppercase">Training Environment</p>
                                            </div>
                                        </div>
                                        <div className="bg-[#0f0f15] border border-white/5 p-6 rounded-[32px] space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                                    <TrendingUp size={20} />
                                                </div>
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Performance Index</h4>
                                            </div>
                                            <div className="space-y-1">
                                                <p className={`text-3xl font-black font-mono leading-none ${selectedUserDetail.totalTrades > 0 ? ((selectedUserDetail.wonTrades / selectedUserDetail.totalTrades) * 100) >= 50 ? 'text-green-500' : 'text-red-500' : 'text-white'}`}>
                                                    {selectedUserDetail.totalTrades > 0 ? ((selectedUserDetail.wonTrades / selectedUserDetail.totalTrades) * 100).toFixed(1) : 0}%
                                                </p>
                                                <p className="text-[9px] text-gray-600 font-bold uppercase">Strategic Win Rate</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[40px] space-y-6">
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-500">Operational Summary</h4>
                                            <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Total Exposure</p>
                                                    <p className="text-lg font-black text-white font-mono">৳{(selectedUserDetail.totalLiveVolume || 0).toLocaleString()}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Successful Trades</p>
                                                    <p className="text-lg font-black text-green-500 font-mono">{selectedUserDetail.wonTrades || 0}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Failed Executions</p>
                                                    <p className="text-lg font-black text-red-500 font-mono">{selectedUserDetail.lostTrades || 0}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Total Handshakes</p>
                                                    <p className="text-lg font-black text-white font-mono">{selectedUserDetail.totalTrades || 0}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-yellow-500/[0.03] to-transparent border border-yellow-500/10 p-8 rounded-[40px] flex flex-col justify-between">
                                            <div className="space-y-4">
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-500">Account Quarantine</h4>
                                                <p className="text-xs text-gray-500 leading-relaxed font-medium">Revoking node access will immediately terminate all active sessions and prevent further market interaction for this identifier.</p>
                                            </div>
                                            <div className="pt-8">
                                                <button 
                                                    onClick={async () => {
                                                        if(!confirm(`DANGER: Are you sure you want to ${selectedUserDetail.isBlocked ? 'RE-ACTIVATE' : 'TERMINATE'} access for ${selectedUserDetail.email}?`)) return;
                                                        try {
                                                            await updateDoc(doc(db, 'users', selectedUserDetail.id), { isBlocked: !selectedUserDetail.isBlocked });
                                                            setSelectedUserDetail({...selectedUserDetail, isBlocked: !selectedUserDetail.isBlocked});
                                                            await logAdminAction('Account Lockdown', `Toggled block status for ${selectedUserDetail.email}`);
                                                            toast.success(`Access ${selectedUserDetail.isBlocked ? 'Restored' : 'Revoked'} successfully`);
                                                        } catch(e: any) { toast.error(e.message); }
                                                    }}
                                                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${selectedUserDetail.isBlocked ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white'}`}
                                                >
                                                    {selectedUserDetail.isBlocked ? 'RESTORE ACCESS PROTOCOL' : 'REVOKE ACCESS PERMANENTLY'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {userDetailTab === 'trades' && (
                                <motion.div 
                                    key="trades" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                            <BarChart2 className="text-yellow-500" size={20} />
                                            Execution Logs
                                        </h3>
                                        <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                            {selectedUserTrades.length} Recorded Traces
                                        </span>
                                    </div>
                                    <div className="bg-[#050507] border border-white/5 rounded-[32px] overflow-hidden">
                                        <div className="overflow-x-auto custom-scrollbar">
                                            {selectedUserTrades.length === 0 ? (
                                                <div className="p-20 text-center text-gray-700 text-xs font-black uppercase tracking-[0.2em]">Zero Trace Activity Detected</div>
                                            ) : (
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-black/40 border-b border-white/5">
                                                            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset Identification</th>
                                                            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Strategic Input</th>
                                                            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Execution Outcome</th>
                                                            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Node Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {selectedUserTrades.map((t, i) => (
                                                            <tr key={`user-tr-${t.id || i}`} className="hover:bg-white/[0.02] transition-colors">
                                                                <td className="p-6">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-black text-white tracking-tight">{t.asset}</span>
                                                                        <span className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${t.type === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                                                            {t.type === 'up' ? 'Bullish (Call)' : 'Bearish (Put)'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-6">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-black text-white font-mono">৳{t.amount.toLocaleString()}</span>
                                                                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">{t.accountType} Layer</span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-6">
                                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                                                                        t.status === 'won' ? 'bg-green-500/10 text-green-500 border border-green-500/10' : 
                                                                        t.status === 'lost' ? 'bg-red-500/10 text-red-500 border border-red-500/10' : 
                                                                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/10'
                                                                    }`}>
                                                                        {t.status}
                                                                    </span>
                                                                </td>
                                                                <td className="p-6 text-[10px] font-mono text-gray-500">
                                                                    {new Date(t.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {userDetailTab === 'finances' && (
                                <motion.div 
                                    key="finances" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                    className="space-y-10"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-[#15161d] border border-white/5 p-8 rounded-[40px] space-y-8">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Treasury Calibration</h4>
                                                <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/10">Active Liquidity</div>
                                            </div>
                                            <div className="flex items-end justify-between gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Real Capital Pool</p>
                                                    <p className="text-4xl font-black text-white font-mono">৳{selectedUserDetail.balance?.toLocaleString() || '0'}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button 
                                                    onClick={() => handleUpdateBalance(selectedUserDetail.id, selectedUserDetail.balance || 0, 'balance', 'set')}
                                                    className="col-span-2 py-4 bg-yellow-500 text-black font-black text-xs rounded-2xl shadow-lg shadow-yellow-500/10 active:scale-[0.98] transition-all uppercase tracking-widest"
                                                >
                                                    Overwrite Absolute Balance
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateBalance(selectedUserDetail.id, selectedUserDetail.balance || 0, 'balance', 'add')}
                                                    className="py-4 bg-green-500/10 text-green-500 border border-green-500/20 font-black text-xs rounded-2xl hover:bg-green-500 hover:text-black transition-all uppercase tracking-[0.15em]"
                                                >
                                                    Inject Funds
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateBalance(selectedUserDetail.id, selectedUserDetail.balance || 0, 'balance', 'subtract')}
                                                    className="py-4 bg-red-500/10 text-red-500 border border-red-500/20 font-black text-xs rounded-2xl hover:bg-red-500 hover:text-white transition-all uppercase tracking-[0.15em]"
                                                >
                                                    Drain Capital
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-[#15161d] border border-white/5 p-8 rounded-[40px] space-y-8">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Simulation Calibration</h4>
                                                <div className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/10">Virtual Assets</div>
                                            </div>
                                            <div className="flex items-end justify-between gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Demo Learning Fund</p>
                                                    <p className="text-4xl font-black text-white font-mono">৳{selectedUserDetail.demoBalance?.toLocaleString() || '10,000'}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button 
                                                    onClick={() => handleUpdateBalance(selectedUserDetail.id, selectedUserDetail.demoBalance || 0, 'demoBalance', 'set')}
                                                    className="col-span-2 py-4 bg-white/5 text-white border border-white/10 font-black text-xs rounded-2xl active:scale-[0.98] transition-all uppercase tracking-widest hover:bg-white/10"
                                                >
                                                    Set Simulation Balance
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateBalance(selectedUserDetail.id, selectedUserDetail.demoBalance || 0, 'demoBalance', 'add')}
                                                    className="py-4 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black text-xs rounded-2xl hover:bg-blue-500 hover:text-white transition-all uppercase tracking-[0.15em]"
                                                >
                                                    Grant Training Cred
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateBalance(selectedUserDetail.id, selectedUserDetail.demoBalance || 0, 'demoBalance', 'subtract')}
                                                    className="py-4 bg-red-500/10 text-red-500 border border-red-500/20 font-black text-xs rounded-2xl hover:bg-red-500 hover:text-white transition-all uppercase tracking-[0.15em]"
                                                >
                                                    Revoke Training
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                            <CreditCard className="text-blue-500" size={20} />
                                            Protocol Ledger
                                        </h3>
                                        <div className="bg-[#050507] border border-white/5 rounded-[32px] overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar shadow-inner">
                                            {selectedUserTransactions.length === 0 ? (
                                                <div className="p-20 text-center text-gray-700 text-xs font-black uppercase tracking-[0.2em]">No Financial Transactions Detected</div>
                                            ) : (
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-black/40 border-b border-white/5">
                                                            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Handshake Type</th>
                                                            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol Volume</th>
                                                            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Validation Status</th>
                                                            <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Time Registry</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {selectedUserTransactions.map((tx, idx) => (
                                                            <tr key={`atx-tr-${idx}-${tx.id || 'fallback'}`} className="hover:bg-white/[0.02] transition-colors">
                                                                <td className="p-6">
                                                                    <div className="flex flex-col">
                                                                        <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${tx.type === 'Deposit' ? 'text-green-500' : 'text-orange-500'}`}>
                                                                            {tx.type} HANDSHAKE
                                                                        </span>
                                                                        <span className="text-[9px] text-gray-600 font-bold uppercase mt-0.5">{tx.method || 'Internal Kernel Transfer'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-6">
                                                                    <span className={`text-sm font-black font-mono ${tx.type === 'Deposit' ? 'text-white' : 'text-gray-400'}`}>
                                                                        {tx.type === 'Deposit' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                                                                    </span>
                                                                </td>
                                                                <td className="p-6">
                                                                    <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-[0.1em] ${
                                                                        tx.status === 'success' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' : 
                                                                        tx.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/10' : 
                                                                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/10'
                                                                    }`}>
                                                                        {tx.status}
                                                                    </span>
                                                                </td>
                                                                <td className="p-6 text-[10px] font-mono text-gray-600 whitespace-nowrap">
                                                                    {new Date(tx.timestamp?.toMillis ? tx.timestamp.toMillis() : tx.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {userDetailTab === 'profile' && (
                                <motion.div 
                                    key="profile" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                    className="space-y-10"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Identity Verification</h3>
                                            <p className="text-xs text-gray-500 font-medium">Authoritative override of user profile attributes and clearance status.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`px-5 py-2 rounded-2xl border flex items-center gap-3 ${selectedUserDetail.kycStatus === 'verified' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
                                                <div className={`w-2 h-2 rounded-full ${selectedUserDetail.kycStatus === 'verified' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Clearance: {selectedUserDetail.kycStatus || 'Unverified'}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleUpdateUserField(selectedUserDetail.id, 'kycStatus', selectedUserDetail.kycStatus === 'verified' ? 'unverified' : 'verified', 'KYC Clearance')}
                                                className="text-[10px] font-black text-white bg-white/5 hover:bg-yellow-500 hover:text-black px-6 py-3 rounded-2xl border border-white/5 transition-all uppercase tracking-widest active:scale-95"
                                            >
                                                {selectedUserDetail.kycStatus === 'verified' ? 'Revoke KYC' : 'Authorize Identity'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                        {[
                                            { label: 'Network Alias', val: selectedUserDetail.nickname || 'Unassigned', field: 'nickname' },
                                            { label: 'Primary Forename', val: selectedUserDetail.firstName || 'Anonymous', field: 'firstName' },
                                            { label: 'Primary Surname', val: selectedUserDetail.lastName || 'Node', field: 'lastName' },
                                            { label: 'Comms Address', val: selectedUserDetail.phone || 'Non-Linked', field: 'phone' },
                                        ].map((item, i) => (
                                            <div 
                                                key={`user-detail-info-${i}`} 
                                                className="bg-[#15161d] p-8 rounded-[32px] border border-white/5 space-y-2 cursor-pointer group/item hover:border-yellow-500/30 transition-all hover:bg-yellow-500/[0.02]"
                                                onClick={() => {
                                                    const newVal = prompt(`Authoritative Update - ${item.label}:`, item.val === 'Unassigned' || item.val === 'Anonymous' || item.val === 'Node' || item.val === 'Non-Linked' ? "" : item.val);
                                                    if (newVal !== null) handleUpdateUserField(selectedUserDetail.id, item.field, newVal, item.label);
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{item.label}</p>
                                                    <Edit2 size={12} className="text-gray-700 group-hover/item:text-yellow-500 transition-colors" />
                                                </div>
                                                <p className="text-white font-bold text-base tracking-tight">{item.val}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[40px] space-y-6">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Node Architecture</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-1 bg-black/20 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Base Currency</p>
                                                <p className="text-sm font-black text-white">{selectedUserDetail.currency || 'BDT'}</p>
                                            </div>
                                            <div className="space-y-1 bg-black/20 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Region Allocation</p>
                                                <p className="text-sm font-black text-white">{selectedUserDetail.country || 'Global/None'}</p>
                                            </div>
                                            <div className="space-y-1 bg-black/20 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Registry Date</p>
                                                <p className="text-sm font-black text-white font-mono">{new Date(selectedUserDetail.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {userDetailTab === 'security' && (
                                <motion.div 
                                    key="security" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                    className="space-y-10"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-[#050507] p-8 rounded-[40px] border border-white/5 flex items-center justify-between group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/10 group-hover:scale-105 transition-transform">
                                                    <Lock size={24} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">2FA Protection Protocol</p>
                                                    <p className={`text-base font-black tracking-tight ${selectedUserDetail.tfaEnabled ? 'text-green-500' : 'text-gray-600'}`}>
                                                        {selectedUserDetail.tfaEnabled ? 'ENCRYPTED SHIELD ACTIVE' : 'UNPROTECTED ENVIRONMENT'}
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedUserDetail.tfaEnabled && (
                                                <button 
                                                    onClick={() => {
                                                        if (confirm("SECURITY OVERRIDE: Permanently deactivate 2FA for this identifier?")) {
                                                            handleUpdateUserField(selectedUserDetail.id, 'tfaEnabled', false, '2FA Protection');
                                                        }
                                                    }}
                                                    className="text-[10px] font-black text-red-500 hover:text-white hover:bg-red-500 px-6 py-3 rounded-2xl border border-red-500/20 transition-all uppercase tracking-widest active:scale-95 shadow-lg shadow-red-500/10"
                                                >
                                                    DEACTIVATE 2FA
                                                </button>
                                            )}
                                        </div>

                                        <div className="bg-[#050507] p-8 rounded-[40px] border border-white/5 flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
                                                <Globe size={24} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Network Signature (Last IP)</p>
                                                <p className="text-white font-mono font-black text-base tracking-widest">{selectedUserDetail.lastIp || 'Protocol Masked'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-[#050507] p-8 rounded-[40px] border border-white/5 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/10">
                                                    <Smartphone size={20} />
                                                </div>
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Hardware Fingerprint</h4>
                                            </div>
                                            <div className="space-y-1 bg-black/40 p-5 rounded-2xl border border-white/5">
                                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Linked Device Identifier</p>
                                                <p className="text-xs font-black text-white font-mono truncate">{selectedUserDetail.lastDeviceId || 'Device Non-Linked'}</p>
                                            </div>
                                        </div>

                                        <div className="bg-red-600/[0.02] p-8 rounded-[40px] border border-red-900/10 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/10">
                                                    <AlertTriangle size={20} />
                                                </div>
                                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500/60">Destructive Actions</h4>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <button 
                                                    onClick={async () => {
                                                        if (confirm("ULTIMATE WARNING: This will permanently delete this node and all financial records. This is NOT reversible. Terminate now?")) {
                                                            try {
                                                                await deleteDoc(doc(db, 'users', selectedUserDetail.id));
                                                                await logAdminAction('Account Termination', `Permanently deleted user node ${selectedUserDetail.id} (${selectedUserDetail.email})`);
                                                                setSelectedUserDetail(null);
                                                                toast.success("Identifier Terminated Permanently");
                                                            } catch (e: any) { toast.error(e.message); }
                                                        }
                                                    }}
                                                    className="w-full py-4 bg-red-600/10 text-red-500 border border-red-600/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
                                                >
                                                    <Trash2 size={16} /> TERMINATE ACCOUNT
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateBalance(selectedUserDetail.id, 0, 'balance', 'set')}
                                                    className="w-full py-4 bg-orange-600/10 text-orange-500 border border-orange-600/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
                                                >
                                                    <RefreshCcw size={16} /> WIPE TREASURY DATA
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {userDetailTab === 'staff' && (
                                <motion.div 
                                    key="staff" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                    className="space-y-10"
                                >
                                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                                                <Shield className="text-yellow-500" size={24} />
                                                Staff Clearance Protocol
                                            </h3>
                                            <p className="text-xs text-gray-500 font-medium">Authoritative grant of kernel-level administrative capabilities.</p>
                                        </div>
                                        <div className="bg-yellow-500/10 border border-yellow-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                                            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Registry Level:</span>
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{admins.find(a => a.id === selectedUserDetail.id)?.role}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {(Object.keys(INITIAL_PERMISSIONS) as PermissionKey[]).map((permKey) => {
                                            const adminData = admins.find(a => a.id === selectedUserDetail.id);
                                            const isEnabled = adminData?.permissions?.[permKey] || false;
                                            const isSuperAdmin = adminData?.role === 'superadmin';
                                            
                                            return (
                                                <div 
                                                    key={permKey} 
                                                    className={`bg-[#050507] border rounded-[32px] p-8 flex items-center justify-between transition-all hover:scale-[1.02] ${
                                                        isEnabled ? 'border-yellow-500/40 bg-yellow-500/[0.03]' : 'border-white/5'
                                                    }`}
                                                >
                                                    <div className="space-y-2 pr-4">
                                                        <p className="text-xs font-black text-white uppercase tracking-wider leading-none">{permKey.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
                                                           {permKey === 'canManageUsers' ? 'Database Access & Identifier Control' :
                                                            permKey === 'canManageStaff' ? 'Identity Management & Clearance' :
                                                            permKey === 'canManageFinance' ? 'Ledger Processing & Handshakes' :
                                                            permKey === 'canManageContent' ? 'Kernel Announcements & News' :
                                                            permKey === 'canManageMarkets' ? 'Direct Algorithmic Manipulation' :
                                                            'System Integrity & Config Override'}
                                                        </p>
                                                    </div>
                                                    
                                                    <button
                                                        disabled={!canManageStaff || isSuperAdmin}
                                                        onClick={async () => {
                                                            const newPerms = {
                                                                ...(adminData?.permissions || INITIAL_PERMISSIONS),
                                                                [permKey]: !isEnabled
                                                            };
                                                            try {
                                                                await updateDoc(doc(db, 'admins', selectedUserDetail.id), { permissions: newPerms });
                                                                const newAdmins = admins.map(a => 
                                                                    a.id === selectedUserDetail.id ? { ...a, permissions: newPerms } : a
                                                                );
                                                                setAdmins(newAdmins);
                                                                await logAdminAction('Clearance Modified', `Updated ${permKey} for ${selectedUserDetail.email}`);
                                                                toast.success(`${permKey} protocol toggled`);
                                                            } catch (e: any) { toast.error(e.message); }
                                                        }}
                                                        className={`w-14 h-7 rounded-full relative transition-all duration-300 flex-shrink-0 shadow-inner ${
                                                            isEnabled ? 'bg-yellow-500' : 'bg-white/10'
                                                        } ${isSuperAdmin ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
                                                    >
                                                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md ${
                                                            isEnabled ? 'left-8' : 'left-1'
                                                        }`} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* ITEM MODAL */}
      <AnimatePresence>
          {showModal && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0a0a0f] border border-[#1a1a24] w-full max-w-lg rounded-[40px] p-8 lg:p-12 relative z-10">
                      <h3 className="text-xl font-black mb-8 uppercase tracking-tight">Modify {modalType}</h3>
                      <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                          <input 
                            type="text" placeholder={modalType === 'deposit' ? "Name" : "Title"} value={editingItem?.title || editingItem?.name || ''} onChange={e => setEditingItem(modalType === 'deposit' ? {...editingItem, name: e.target.value} : {...editingItem, title: e.target.value})}
                            className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 focus:border-yellow-500 outline-none"
                          />
                          {modalType !== 'deposit' && (
                              <textarea 
                                placeholder="Description" value={editingItem?.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                                className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 h-24 focus:border-yellow-500 outline-none resize-none"
                              />
                          )}
                          {modalType === 'deposit' && (
                              <div className="space-y-4">
                                  <input 
                                    type="text" placeholder="Provider (e.g. Binance, Tether, bKash)" value={editingItem?.provider || ''} onChange={e => setEditingItem({...editingItem, provider: e.target.value})}
                                    className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 focus:border-yellow-500 outline-none"
                                  />
                                  <input 
                                    type="text" placeholder="Wallet Address / Number" value={editingItem?.walletAddress || ''} onChange={e => setEditingItem({...editingItem, walletAddress: e.target.value})}
                                    className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 focus:border-yellow-500 outline-none"
                                  />
                                  <input 
                                    type="text" placeholder="Logo URL (Icon/Logo Link)" value={editingItem?.logo || ''} onChange={e => setEditingItem({...editingItem, logo: e.target.value})}
                                    className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 focus:border-yellow-500 outline-none"
                                  />
                                  <input 
                                    type="text" placeholder="QR Code Image URL (For Crypto)" value={editingItem?.qrCode || ''} onChange={e => setEditingItem({...editingItem, qrCode: e.target.value})}
                                    className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 focus:border-yellow-500 outline-none"
                                  />
                                  <div className="grid grid-cols-2 gap-4">
                                      <select 
                                        value={editingItem?.logoType || 'image'} onChange={e => setEditingItem({...editingItem, logoType: e.target.value})}
                                        className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none text-white"
                                      >
                                          <option value="image">Image URL</option>
                                          <option value="icon">Lucide Icon</option>
                                          <option value="text">Text/Letter</option>
                                      </select>
                                      <select 
                                        value={editingItem?.category || 'Crypto'} onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                                        className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none text-white font-medium"
                                      >
                                          <option value="Crypto">Crypto</option>
                                          <option value="E-wallets">E-wallets / Mobile Banking</option>
                                          <option value="Popular">Popular</option>
                                          <option value="Bank transfer">Bank Transfer</option>
                                          <option value="Credit cards">Credit Cards</option>
                                          <option value="Other">Other</option>
                                      </select>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <input 
                                        type="text" placeholder="BG ColorHex (e.g. #27a17b)" value={editingItem?.bgColor || ''} onChange={e => setEditingItem({...editingItem, bgColor: e.target.value})}
                                        className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 focus:border-yellow-500 outline-none"
                                      />
                                      <input 
                                        type="text" placeholder="Time (e.g. 5 MIN)" value={editingItem?.time || ''} onChange={e => setEditingItem({...editingItem, time: e.target.value})}
                                        className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 focus:border-yellow-500 outline-none"
                                      />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Currency</label>
                                          <select 
                                            value={editingItem?.currency || 'BDT'} onChange={e => setEditingItem({...editingItem, currency: e.target.value})}
                                            className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none text-white"
                                          >
                                              {currencies.map(c => (
                                                  <option key={c.code} value={c.code}>{c.code} ({c.name})</option>
                                              ))}
                                          </select>
                                      </div>
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Settlement</label>
                                          <div className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 text-xs flex items-center justify-center text-gray-400 uppercase font-black">
                                              {editingItem?.currency || 'BDT'} Ready
                                          </div>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Min Deposit ({getCurrencySymbol(editingItem?.currency)})</label>
                                          <input 
                                            type="number" placeholder="500" value={editingItem?.minDeposit || ''} onChange={e => setEditingItem({...editingItem, minDeposit: Number(e.target.value)})}
                                            className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 focus:border-yellow-500 outline-none"
                                          />
                                      </div>
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Max Deposit ({getCurrencySymbol(editingItem?.currency)})</label>
                                          <input 
                                            type="number" placeholder="1000000" value={editingItem?.maxDeposit || ''} onChange={e => setEditingItem({...editingItem, maxDeposit: Number(e.target.value)})}
                                            className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 focus:border-yellow-500 outline-none"
                                          />
                                      </div>
                                  </div>
                                  <div className="space-y-4">
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Guide (Bengali) - One step per line</label>
                                          <textarea 
                                            placeholder="১. অ্যাপ খুলুন&#10;২. ক্যাশ আউট করুন" 
                                            value={Array.isArray(editingItem?.guideBN) ? editingItem.guideBN.join('\n') : (editingItem?.guideBN || '')} 
                                            onChange={e => setEditingItem({...editingItem, guideBN: e.target.value.split('\n')})}
                                            className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 h-32 focus:border-yellow-500 outline-none resize-none text-xs"
                                          />
                                      </div>
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Guide (English) - One step per line</label>
                                          <textarea 
                                            placeholder="1. Open App&#10;2. Cash Out" 
                                            value={Array.isArray(editingItem?.guideEN) ? editingItem.guideEN.join('\n') : (editingItem?.guideEN || '')} 
                                            onChange={e => setEditingItem({...editingItem, guideEN: e.target.value.split('\n')})}
                                            className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 h-32 focus:border-yellow-500 outline-none resize-none text-xs"
                                          />
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-6 px-2">
                                      <div className="flex items-center gap-3">
                                          <input 
                                            type="checkbox" checked={editingItem?.instant || false} onChange={e => setEditingItem({...editingItem, instant: e.target.checked})}
                                            className="w-5 h-5 rounded bg-[#15161d] border border-[#1a1a24]"
                                          />
                                          <label className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Instant Arrival</label>
                                      </div>
                                      <div className="flex items-center gap-3">
                                          <input 
                                            type="checkbox" checked={editingItem?.isActive !== false} onChange={e => setEditingItem({...editingItem, isActive: e.target.checked})}
                                            className="w-5 h-5 rounded bg-[#15161d] border border-[#1a1a24] accent-green-500"
                                          />
                                          <label className="text-green-500 font-bold uppercase text-[10px] tracking-widest">Show in Terminal</label>
                                      </div>
                                      <div className="flex items-center gap-3">
                                          <input 
                                            type="checkbox" checked={editingItem?.isPopular || false} onChange={e => setEditingItem({...editingItem, isPopular: e.target.checked})}
                                            className="w-5 h-5 rounded bg-[#15161d] border border-[#1a1a24] accent-yellow-500"
                                          />
                                          <label className="text-yellow-500 font-bold uppercase text-[10px] tracking-widest">Popular</label>
                                      </div>
                                  </div>
                              </div>
                          )}
                          {modalType === 'signals' && (
                              <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                      <input type="text" placeholder="Asset (e.g. BTC/USD)" value={editingItem?.asset || ''} onChange={e => setEditingItem({...editingItem, asset: e.target.value})} className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none text-white" />
                                      <select value={editingItem?.direction || 'CALL'} onChange={e => setEditingItem({...editingItem, direction: e.target.value})} className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none text-white">
                                          <option value="CALL">CALL (BULLISH)</option>
                                          <option value="PUT">PUT (BEARISH)</option>
                                      </select>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <input type="text" placeholder="Timeframe (e.g. 5m)" value={editingItem?.timeframe || ''} onChange={e => setEditingItem({...editingItem, timeframe: e.target.value})} className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none text-white" />
                                      <input type="number" placeholder="Confidence %" value={editingItem?.accuracy || ''} onChange={e => setEditingItem({...editingItem, accuracy: Number(e.target.value)})} className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none text-white" />
                                  </div>
                                  <select value={editingItem?.status || 'Active'} onChange={e => setEditingItem({...editingItem, status: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none text-white">
                                      <option value="Active">Active</option>
                                      <option value="Expired">Expired</option>
                                      <option value="Success">Success</option>
                                  </select>
                              </div>
                          )}
                          {modalType === 'masterTraders' && (
                              <div className="space-y-4">
                                  <div className="flex items-center gap-4 p-4 bg-[#15161d] rounded-2xl border border-white/5">
                                      <img src={editingItem?.avatar} className="w-16 h-16 rounded-xl bg-black/20" alt="Avatar"  loading="lazy" />
                                      <div className="flex-1">
                                          <input type="text" placeholder="Avatar URL" value={editingItem?.avatar || ''} onChange={e => setEditingItem({...editingItem, avatar: e.target.value})} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-xs outline-none focus:border-yellow-500" />
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-black uppercase text-gray-500">Full Name</label>
                                          <input type="text" value={editingItem?.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none focus:border-yellow-500" />
                                      </div>
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-black uppercase text-gray-500">Risk Level</label>
                                          <select value={editingItem?.riskLevel || 'Medium'} onChange={e => setEditingItem({...editingItem, riskLevel: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none focus:border-yellow-500">
                                              <option value="Low">Low Risk</option>
                                              <option value="Medium">Medium Risk</option>
                                              <option value="High">High Risk</option>
                                          </select>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-black uppercase text-gray-500">Min Investment (৳)</label>
                                          <input type="number" value={editingItem?.minInvestment || 0} onChange={e => setEditingItem({...editingItem, minInvestment: Number(e.target.value)})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none focus:border-yellow-500" />
                                      </div>
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-black uppercase text-gray-500">Strategy Label</label>
                                          <input type="text" placeholder="e.g. Price Action" value={editingItem?.strategy || ''} onChange={e => setEditingItem({...editingItem, strategy: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none focus:border-yellow-500" />
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-black uppercase text-gray-500">Total Trades</label>
                                          <input type="number" value={editingItem?.totalTrades || 0} onChange={e => setEditingItem({...editingItem, totalTrades: Number(e.target.value)})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none focus:border-yellow-500" />
                                      </div>
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-black uppercase text-gray-500">Won</label>
                                          <input type="number" value={editingItem?.wonTrades || 0} onChange={e => setEditingItem({...editingItem, wonTrades: Number(e.target.value)})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none focus:border-yellow-500 text-green-500" />
                                      </div>
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-black uppercase text-gray-500">Lost</label>
                                          <input type="number" value={editingItem?.lostTrades || 0} onChange={e => setEditingItem({...editingItem, lostTrades: Number(e.target.value)})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none focus:border-yellow-500 text-red-500" />
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-black uppercase text-gray-500">Profit Factor</label>
                                          <input type="number" step="0.01" value={editingItem?.profitFactor || 0} onChange={e => setEditingItem({...editingItem, profitFactor: Number(e.target.value)})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none focus:border-yellow-500" />
                                      </div>
                                      <div className="space-y-1">
                                          <label className="text-[10px] font-black uppercase text-gray-500">Total Followers</label>
                                          <input type="number" value={editingItem?.followers || 0} onChange={e => setEditingItem({...editingItem, followers: Number(e.target.value)})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none focus:border-yellow-500" />
                                      </div>
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-[10px] font-black uppercase text-gray-500">Traded Assets (Comma Separated)</label>
                                      <input type="text" value={editingItem?.assets?.join(', ') || ''} onChange={e => setEditingItem({...editingItem, assets: e.target.value.split(',').map(s => s.trim())})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none focus:border-yellow-500" />
                                  </div>
                                  <div className="flex items-center gap-3 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                                      <input type="checkbox" checked={editingItem?.isVerified} onChange={e => setEditingItem({...editingItem, isVerified: e.target.checked})} className="w-5 h-5 rounded border-white/10" />
                                      <label className="text-xs font-black uppercase text-yellow-500">Verified Master Badge</label>
                                  </div>
                              </div>
                          )}
                          {modalType === 'promoMaterials' && (
                              <div className="space-y-4">
                                  <input type="text" placeholder="Asset Label (e.g. FB Ad)" value={editingItem?.label || ''} onChange={e => setEditingItem({...editingItem, label: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none text-white" />
                                  <div className="grid grid-cols-2 gap-4">
                                      <input type="text" placeholder="Size (e.g. 1080x1080)" value={editingItem?.size || ''} onChange={e => setEditingItem({...editingItem, size: e.target.value})} className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none text-white" />
                                      <input type="text" placeholder="Banner Color (CSS Class)" value={editingItem?.color || ''} onChange={e => setEditingItem({...editingItem, color: e.target.value})} className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none text-white" />
                                  </div>
                                  <input type="text" placeholder="Image URL (Highly Recommended)" value={editingItem?.imageUrl || ''} onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none text-white" />
                                  <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                                      <p className="text-[10px] text-yellow-500 font-bold leading-relaxed">
                                          TIP: Partners can copy the "Asset Link" directly from their dashboard. Use high-quality JPG/PNG URLs.
                                      </p>
                                  </div>
                              </div>
                          )}
                          {modalType === 'news' && (
                              <>
                                <textarea 
                                    placeholder="Full Content" value={editingItem?.content || ''} onChange={e => setEditingItem({...editingItem, content: e.target.value})}
                                    className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 h-40 focus:border-yellow-500 outline-none resize-none"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Emoji" value={editingItem?.emoji || ''} onChange={e => setEditingItem({...editingItem, emoji: e.target.value})} className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none" />
                                    <input type="text" placeholder="Date" value={editingItem?.date || ''} onChange={e => setEditingItem({...editingItem, date: e.target.value})} className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none" />
                                </div>
                              </>
                          )}
                          {modalType === 'education' && (
                              <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                      <input type="text" placeholder="Duration (min)" value={editingItem?.duration || ''} onChange={e => setEditingItem({...editingItem, duration: e.target.value})} className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none" />
                                      <select value={editingItem?.type || 'Video'} onChange={e => setEditingItem({...editingItem, type: e.target.value})} className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none">
                                          <option>Video</option>
                                          <option>Course</option>
                                          <option>Article</option>
                                      </select>
                                  </div>
                                  <input type="text" placeholder="Thumbnail URL" value={editingItem?.thumbnailUrl || ''} onChange={e => setEditingItem({...editingItem, thumbnailUrl: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none" />
                                  <input type="text" placeholder="YouTube Video URL" value={editingItem?.videoUrl || ''} onChange={e => setEditingItem({...editingItem, videoUrl: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none" />
                              </div>
                          )}
                          {modalType === 'promotions' && (
                              <div className="space-y-4">
                                <textarea 
                                    placeholder="Short Description (for list view)" value={editingItem?.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                                    className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 h-24 focus:border-yellow-500 outline-none resize-none"
                                />
                                <textarea 
                                    placeholder="Full Content (for detail view)" value={editingItem?.content || ''} onChange={e => setEditingItem({...editingItem, content: e.target.value})}
                                    className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 h-40 focus:border-yellow-500 outline-none resize-none"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Image URL" value={editingItem?.imageUrl || ''} onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})} className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none" />
                                    <select 
                                        value={editingItem?.icon || 'Gift'} onChange={e => setEditingItem({...editingItem, icon: e.target.value})}
                                        className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none text-white"
                                    >
                                        <option value="Gift">Gift Icon</option>
                                        <option value="Zap">Zap Icon</option>
                                        <option value="Trophy">Trophy Icon</option>
                                        <option value="Star">Star Icon</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Bonus % (optional)" value={editingItem?.bonus || ''} onChange={e => setEditingItem({...editingItem, bonus: e.target.value})} className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none" />
                                    <input type="text" placeholder="Price Tag (optional)" value={editingItem?.price || ''} onChange={e => setEditingItem({...editingItem, price: e.target.value})} className="bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none" />
                                </div>
                              </div>
                          )}
                          {modalType === 'tournaments' && (
                              <div className="space-y-4">
                                  <textarea 
                                      placeholder="Short Description" value={editingItem?.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                                      className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 h-20 focus:border-yellow-500 outline-none resize-none"
                                  />
                                  <textarea 
                                      placeholder="Full Tournament Rules/Info" value={editingItem?.content || ''} onChange={e => setEditingItem({...editingItem, content: e.target.value})}
                                      className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 h-28 focus:border-yellow-500 outline-none resize-none"
                                  />
                                  <div className="grid grid-cols-2 gap-4">
                                      <input type="text" placeholder="Prize Pool (e.g. $10,000)" value={editingItem?.prizePool || ''} onChange={e => setEditingItem({...editingItem, prizePool: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none" />
                                      <input type="text" placeholder="Entry Fee (e.g. Free or $10)" value={editingItem?.participationFee || ''} onChange={e => setEditingItem({...editingItem, participationFee: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <select 
                                        value={editingItem?.status || 'Upcoming'} onChange={e => setEditingItem({...editingItem, status: e.target.value})}
                                        className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none appearance-none"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Upcoming">Upcoming</option>
                                        <option value="Finished">Finished</option>
                                    </select>
                                    <input type="text" placeholder="Ends In (e.g. 05:22:11)" value={editingItem?.endTime || ''} onChange={e => setEditingItem({...editingItem, endTime: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none" />
                                  </div>
                                  <input type="text" placeholder="Image URL" value={editingItem?.imageUrl || ''} onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})} className="w-full bg-[#15161d] border border-[#1a1a24] rounded-2xl px-5 py-4 outline-none" />
                              </div>
                          )}
                      </div>
                      <div className="mt-8 flex gap-3">
                          <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-bold">Cancel</button>
                          <button onClick={handleSaveItem} className="flex-1 py-4 bg-yellow-500 text-black rounded-2xl font-black">Save Terminal</button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

    </div>
  );
}
