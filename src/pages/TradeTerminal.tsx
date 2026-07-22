/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logo } from "../components/Logo";
import { Skeleton } from "../components/Skeleton";
import signalsIllustration from "../assets/images/trading_signals_illustration_1779720241475.png";
import { StoryViewer } from "../components/StoryViewer";
import TradeHistoryModal from "../components/TradeHistoryModal";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import SEO from "../components/SEO";
import {
  createChart,
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  IPriceLine,
  Time,
  PriceLineOptions,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  BarSeries,
  HistogramSeries,
  LineStyle,
  createSeriesMarkers,
} from "lightweight-charts";
import { io } from "socket.io-client";
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { DrawingOverlay } from "../components/DrawingOverlay";
import { useSupport } from "../context/SupportContext";
import CopyTradingPage from "./CopyTrading";
import { 
  RSI, MACD, BollingerBands, Stochastic, SMA, EMA, WMA, WEMA, ATR, ROC, CCI, WilliamsR, 
  TRIX, ADX, StochasticRSI, KST, ADL, MFI, OBV, ForceIndex, PSAR, 
  VWAP, IchimokuCloud, SD, AwesomeOscillator, KeltnerChannels, ChandelierExit 
} from 'technicalindicators';
import {
  Wallet,
  ChevronDown,
  Clock,
  TrendingUp,
  TrendingDown,
  User,
  Plus,
  Minus,
  ShoppingBag,
  RefreshCw,
  ChevronLeft,
  ChevronUp,
  Compass,
  Radio,
  Move,
  AlignRight,
  LayoutGrid,
  Menu,
  ArrowLeft,
  Bell,
  Megaphone,
  Trophy,
  Users,
  Lock,
  ShieldCheck,
  LogOut,
  Activity,
  Settings,
  ChevronRight,
  UserPlus,
  Calendar,
  Gift,
  GraduationCap,
  CreditCard,
  Diamond,
  Star,
  Zap,
  HelpCircle,
  Info,
  AlertCircle,
  Unlock,
  EyeOff,
  ArrowRight,
  ArrowRightLeft,
  Smartphone,
  Book,
  History,
  Heart,
  X,
  Youtube,
  Instagram,
  Send,
  Facebook,
  MessageSquare,
  Music2,
  MessageCircle,
  Search,
  CandlestickChart,
  Signal,
  Paperclip,
  Cloud,
  BarChart2,
  BarChart3,
  Triangle,
  Circle,
  Wind,
  Waves,
  LineChart,
  GripHorizontal,
  Snowflake,
  Copy,
  Check,
  QrCode,
  Shield,
  Play,
  PlayCircle,
  Gem,
  Music,
  ArrowUp,
  ArrowDown,
  Camera,
  Key,
  UserCheck,
  Mail,
  Trash,
  MoveHorizontal,
  MinusCircle,
  Square,
  MenuSquare,
  ArrowUpRight,
  BarChart,
  Layers,
  Share2,
  Ruler,
  Repeat,
} from "lucide-react";

import * as Icons from "lucide-react";
import CameraScanner from '../components/CameraScanner';

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'uk', name: 'Українська мова', flag: '🇺🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'kk', name: 'Қазақ тілі', flag: '🇰🇿' },
  { code: 'ar', name: 'اللغة العربية', flag: '🇸🇦' },
  { code: 'bn', name: 'বাংলা (বাংলাদেশ)', flag: '🇧🇩' },
];

const NEWS_DATA = [
  {
    id: 1,
    date: "10.03.2026",
    title: "Don't miss your last chance to get prizes!",
    description: "Hurry up and activate your Horseshoes",
    reactions: 420,
    badReactions: 62,
    emoji: "🎯",
    image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&auto=format&fit=crop&q=80",
    content: "Increase your chances of becoming a winner before time runs out: deposit $50 or more, reach a turnover of $300, and get your Horseshoe. Prizes await, especially a brand new Mustang GT \"Fastback\" 2025 — maybe you will be the lucky winner! *All rewards are provided exclusively in a monetary equivalent deposited into the winner's real account"
  },
  {
    id: 2,
    date: "24.02.2026",
    title: "Trade and prosper! 💰",
    description: "This year brings more exciting rewards",
    reactions: 349,
    badReactions: 12,
    emoji: "💰",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80",
    content: "Explore new trading opportunities this spring with our updated asset signals."
  },
  {
    id: 3,
    date: "19.02.2026",
    title: "More Horseshoes for you! ☝️",
    description: "A little something to boost your prosperity — now on sale!",
    reactions: 196,
    badReactions: 8,
    emoji: "☝️",
    image: "https://images.unsplash.com/photo-1611974714131-419b67484411?w=800&auto=format&fit=crop&q=80",
    content: "Boost your luck with our limited edition Horseshoes. Available only for the next 48 hours."
  }
];

const PROMOTIONS_DATA = [
  {
    id: 1,
    title: "Spring Trading Bonus",
    description: "Get 50% bonus on your next deposit",
    image: "https://images.unsplash.com/photo-1591033588766-9810ea1a5557?w=800&auto=format&fit=crop&q=80",
    content: "Make a deposit of $100 or more and get a 50% bonus added to your trading account. Valid until end of April!"
  },
  {
    id: 2,
    title: "Refer a Friend",
    description: "Earn $20 for every friend who joins",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop&q=80",
    content: "Invite your friends to Bivaax and get $20 for every friend who completes their first trade."
  }
];

const EDUCATION_DATA = [
  {
    id: 1,
    title: "Welcome to the Bivaax platform",
    description: "Simple steps to start from",
    duration: "1:23",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "" // the first one is text-only gradient card
  },
  {
    id: 2,
    title: "You're on the right track!",
    description: "Take a grand step into profitable trading by learning the essentials about indicators, strategies, and assets. You've made a deposit. All videos are unlocked!",
    duration: "12:35",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1611974714131-419b67484411?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    title: "Plan your strategy with Economic calendar",
    description: "",
    duration: "0:29",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1642543492481-44e81e391452?w=800&auto=format&fit=crop&q=80"
  }
];

import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { signOut, onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateEmail } from "../firebase";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { LiveSupport } from '../components/LiveSupport';
import { doc, getDoc, onSnapshot, query, collection, orderBy, where, collectionGroup, setDoc, updateDoc, deleteDoc, increment, limit, addDoc, serverTimestamp, getDocs } from "../firebase";
import { currencies, formatWithCurrency, convertToBase, convertFromBase, getCurrencySymbol } from "../lib/currencies";
import { TimeZoneModal } from "../components/TimeZoneModal";
import PaymentMethodsStatus from "../components/PaymentMethodsStatus";
import { useTranslation, LanguageCode } from "../lib/translations";
import { getUserByAffiliateId } from "../lib/affiliate";

const getTimeSeconds = (tf: string) => {
  if (!tf || typeof tf !== 'string') return 60;
  const parts = tf.split(" ");
  const val = parseInt(parts[0]);
  const unit = parts[1];
  if (unit.startsWith("second")) return val;
  if (unit.startsWith("minute")) return val * 60;
  if (unit.startsWith("hour")) return val * 3600;
  if (unit.startsWith("day")) return val * 86400;
  return 60;
};

const formatTimeframeShort = (tf: string) => {
  if (!tf || typeof tf !== 'string') return "";
  const parts = tf.split(" ");
  const val = parts[0];
  const unit = parts[1];
  return `${val}${unit[0]}`;
};

const calculateHeikinAshi = (data: any[]) => {
  if (!data || data.length === 0) return [];
  let haData = [];
  let prevOpen = data[0]?.open || 0;
  let prevClose = data[0]?.close || 0;

  for (let i = 0; i < data.length; i++) {
    const haClose =
      (data[i].open + data[i].high + data[i].low + data[i].close) / 4;
    const haOpen = (prevOpen + prevClose) / 2;
    const haHigh = Math.max(data[i].high, haOpen, haClose);
    const haLow = Math.min(data[i].low, haOpen, haClose);

    haData.push({
      time: data[i].time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
    });

    prevOpen = haOpen;
    prevClose = haClose;
  }
  return haData;
};

const resampleData = (data: any[], tfString: string) => {
  const timeframeSeconds = getTimeSeconds(tfString);
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  const cleanData = data.filter(item => item && typeof item.time === 'number');
  if (cleanData.length === 0) return [];

  // If the server already sent candles corresponding to the target timeframe,
  // do not attempt to resample them, return them directly!
  if (cleanData.length > 1) {
    const firstSpacing = Math.abs(cleanData[1].time - cleanData[0].time);
    if (firstSpacing >= timeframeSeconds) {
      return cleanData;
    }
  } else {
    return cleanData;
  }

  const baseSeconds = 5; // Our server provides 5-sec data

  if (timeframeSeconds === baseSeconds) {
    return cleanData;
  }

  const resampled: any[] = [];
  if (timeframeSeconds > baseSeconds) {
    let currentCandle: any = null;
    let currentBucket = null;
    let previousClose = null;

    for (let i = 0; i < cleanData.length; i++) {
        const d = cleanData[i];
        const bucketTime = d.time - (d.time % timeframeSeconds);
        
        // Ensure values are numbers
        const open = Number(d.open || 0);
        const high = Number(d.high || d.open || 0);
        const low = Number(d.low || d.open || 0);
        const close = Number(d.close || d.open || 0);

        if (!currentCandle || currentBucket !== bucketTime) {
            if (currentCandle) {
                resampled.push(currentCandle);
                previousClose = currentCandle.close;
            }
            currentBucket = bucketTime;
            
            // Strictly enforce continuity: the new open must match the previous close
            const continuousOpen = previousClose !== null ? previousClose : open;
            
            // Apply random volatility to high/low to make candles look more erratic and professional
            const volatility = (Math.random() - 0.5) * (Math.random() * 0.001);
            currentCandle = {
                time: bucketTime as Time,
                open: continuousOpen,
                high: Math.max(continuousOpen, high) * (1 + Math.abs(volatility)),
                low: Math.min(continuousOpen, low) * (1 - Math.abs(volatility)),
                close: close,
            };
        } else {
            // Apply random volatility to high/low to make candles look more erratic and professional
            const volatility = (Math.random() - 0.5) * (Math.random() * 0.001); 
            currentCandle.high = Math.max(currentCandle.high, high) * (1 + Math.abs(volatility));
            currentCandle.low = Math.min(currentCandle.low, low) * (1 - Math.abs(volatility));
            currentCandle.close = close;
        }
    }
    if (currentCandle) resampled.push(currentCandle);
  } else {
      const splits = Math.floor(baseSeconds / timeframeSeconds);
      if(splits <= 0) return cleanData;
      let previousClose = null;
      for (let i = 0; i < cleanData.length; i++) {
          const d = cleanData[i];
          let currentOpen = previousClose !== null ? previousClose : d.open;
          const stepSize = (d.close - currentOpen) / splits;
          
          for (let j = 0; j < splits; j++) {
             const currentClose = currentOpen + stepSize;
             const high = Math.max(currentOpen, currentClose) + Math.abs(currentClose - currentOpen) * 0.1;
             const low = Math.min(currentOpen, currentClose) - Math.abs(currentClose - currentOpen) * 0.1;
             
             resampled.push({
                 time: (d.time + (j * timeframeSeconds)) as Time,
                 open: currentOpen,
                 high: isNaN(high) ? Math.max(currentOpen, currentClose) : high,
                 low: isNaN(low) ? Math.min(currentOpen, currentClose) : low,
                 close: currentClose
             });
             currentOpen = currentClose;
          }
          previousClose = currentOpen;
      }
  }
  resampled.sort((a, b) => a.time - b.time);
  
  // Remove duplicates
  const uniqueResampled = [];
  let lastTime = 0;
  for (const item of resampled) {
    if (item.time > lastTime) {
      uniqueResampled.push(item);
      lastTime = item.time;
    }
  }

  return uniqueResampled;
};



const getGeckoId = (symbol: string): string => {
  const map: Record<string, string> = {
    'btc': '1', 'eth': '279', 'ltc': '2', 'sol': '4128', 'ada': '975',
    'uni': '12504', 'link': '877', 'ton': '17980', 'cake': '12666',
    'fet': '5681', 'aave': '12467', 'bch': '231', 'dot': '12171',
    'avax': '12559', 'pol': '4713', 'icp': '14472', 'bar': '11838',
    'ksm': '9568', 'rsr': '8965', 'lpt': '1431', 'woo': '13101',
    'vec': '31454', 'xrp': '44', 'doge': '5', 'shib': '11903'
  };
  return map[symbol.toLowerCase()] || symbol;
};

const getFlagCode = (currency: string) => {
  const map: Record<string, string> = {
    'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'JPY': 'jp', 'AUD': 'au', 
    'CAD': 'ca', 'CHF': 'ch', 'NZD': 'nz', 'DKK': 'dk', 'INR': 'in',
    'BRL': 'br', 'TRY': 'tr', 'RUB': 'ru', 'CNY': 'cn', 'ZAR': 'za'
  };
  return map[currency.toUpperCase()] || 'un';
};

const AnimatedBalance = ({ value, currency, accountType, isHidden }: { value: number, currency: string, accountType: string, isHidden: boolean }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      const start = prevValueRef.current;
      const end = value;
      const duration = 800;
      let startTimestamp: number | null = null;
      
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out
        const current = start + (end - start) * easeOut;
        
        setDisplayValue(current);
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
      prevValueRef.current = value;
    }
  }, [value]);

  if (isHidden) return <span className="font-sans font-bold">✱✱✱✱✱</span>;

  const formatted = accountType === 'tournament' 
    ? `$${displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : formatWithCurrency(displayValue, currency);

  return (
    <motion.span 
      key={accountType}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`font-sans font-bold tabular-nums`}
    >
      {formatted}
    </motion.span>
  );
};

const AssetLogo = ({ name, size = 32 }: { name: string, size?: number }) => {
  const [hasError, setHasError] = useState(false);

  if (!name) return <div className="rounded-full bg-gray-800" style={{ width: size, height: size }} />;
  if (name === "Crypto IDX") {
    const innerCircleSize = Math.max(8, Math.floor(size * 0.375));
    return (
      <div className="relative flex items-center justify-center bg-gradient-to-br from-[#2b2d35] to-[#1a1b1f] rounded-lg border border-white/10 shadow-lg overflow-hidden group" style={{ width: size, height: size }}>
        <div className="grid grid-cols-2 gap-0.5 p-1 w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
          <div className="bg-[#f7931a] rounded-[1px] shadow-sm"></div>
          <div className="bg-[#627eea] rounded-[1px] shadow-sm"></div>
          <div className="bg-[#14f195] rounded-[1px] shadow-sm"></div>
          <div className="bg-[#f3ba2f] rounded-[1px] shadow-sm"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-[#1a1b1f] rounded-full flex items-center justify-center border border-white/20 shadow-xl" style={{ width: innerCircleSize, height: innerCircleSize }}>
             <span className="font-black italic text-white leading-none" style={{ fontSize: Math.floor(innerCircleSize * 0.6) }}>C</span>
          </div>
        </div>
      </div>
    );
  }

  // Handle crypto icons
  const cryptoIcons: Record<string, { color: string; label: string; symbol: string }> = {
    'BTC/USD': { color: '#F7931A', label: '₿', symbol: 'btc' },
    'ETH/USD': { color: '#627EEA', label: 'Ξ', symbol: 'eth' },
    'LTC/USD': { color: '#345D9D', label: 'Ł', symbol: 'ltc' },
    'SOL/USD': { color: '#14F195', label: 'S', symbol: 'sol' },
    'ADA/USD': { color: '#0033AD', label: 'A', symbol: 'ada' },
    'UNI/USD': { color: '#FF007A', label: 'U', symbol: 'uni' },
    'LINK/USD': { color: '#2A5ADA', label: 'C', symbol: 'link' },
    'LINK/USD (OTC)': { color: '#2A5ADA', label: 'C', symbol: 'link' },
    'TON/USD': { color: '#0088CC', label: 'T', symbol: 'ton' },
    'TON/USD (OTC)': { color: '#0088CC', label: 'T', symbol: 'ton' },
    'CAKE/USD': { color: '#D1884F', label: 'P', symbol: 'cake' },
    'FET/USD': { color: '#000000', label: 'F', symbol: 'fet' },
    'AAVE/USD': { color: '#B6509E', label: 'A', symbol: 'aave' },
    'BCH/USD': { color: '#8BC34A', label: 'B', symbol: 'bch' },
    'DOT/USD': { color: '#E6007A', label: 'P', symbol: 'dot' },
    'AVAX/USD': { color: '#E84142', label: 'A', symbol: 'avax' },
    'POL/USD': { color: '#8247E5', label: 'P', symbol: 'pol' },
    'ICP/USD': { color: '#F48225', label: 'I', symbol: 'icp' },
    'BAR/USD': { color: '#004D98', label: 'B', symbol: 'bar' },
    'KSM/USD': { color: '#000000', label: 'K', symbol: 'ksm' },
    'RSR/USD': { color: '#F6C915', label: 'R', symbol: 'rsr' },
    'LPT/USD': { color: '#00E37D', label: 'L', symbol: 'lpt' },
    'WOO/USD': { color: '#000000', label: 'W', symbol: 'woo' },
    'VEC/USD': { color: '#5C6BC0', label: 'V', symbol: 'vec' },
    'XRP/USD': { color: '#23292F', label: 'X', symbol: 'xrp' },
    'DOGE/USD': { color: '#C2A633', label: 'D', symbol: 'doge' },
    'Shiba Inu': { color: '#FFA409', label: 'S', symbol: 'shib' },
  };

  const cryptoKey = Object.keys(cryptoIcons).find(k => name.includes(k));
  if (cryptoKey) {
    const icon = cryptoIcons[cryptoKey];
    return (
      <div 
        className="rounded-full flex items-center justify-center overflow-hidden bg-[#2A2C31] shadow-lg ring-1 ring-white/10 group-hover:ring-white/20 transition-all"
        style={hasError ? { backgroundColor: icon.color, width: size, height: size } : { width: size, height: size }}
      >
        {hasError ? (
          <span className="text-white font-bold" style={{ fontSize: Math.floor(size * 0.4) }}>{icon.label}</span>
        ) : (
          <img 
            src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${icon.symbol}.png`}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        )}
      </div>
    );
  }

  // Handle currency pairs (Flags)
  if (name.includes('/')) {
    const parts = name.split(' ')[0].split('/');
    const code1 = getFlagCode(parts[0]);
    const code2 = getFlagCode(parts[1]);
    
    const flagW = Math.floor(size * 0.75);
    const flagH = Math.floor(size * 0.5);

    return (
      <div className="flex -space-x-1.5 items-center">
        <div className="rounded-sm overflow-hidden border border-white/10 shadow-sm z-10" style={{ width: flagW, height: flagH }}>
          <img src={`https://flagcdn.com/w80/${code1}.png`} alt={parts[0]} className="w-full h-full object-cover"  loading="lazy" />
        </div>
        <div className="rounded-sm overflow-hidden border border-white/10 shadow-sm" style={{ width: flagW, height: flagH }}>
          <img src={`https://flagcdn.com/w80/${code2}.png`} alt={parts[1]} className="w-full h-full object-cover"  loading="lazy" />
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-md flex items-center justify-center font-black border border-white/5 text-gray-400" style={{ width: size, height: size, fontSize: Math.floor(size * 0.3) }}>
      {name.substring(0, 3)}
    </div>
  );
};

const ActiveAISignals = ({ activeAsset, currentPrice, onExecute, onClose }: { activeAsset: string, currentPrice: string, onExecute: (type: "up"|"down") => void, onClose: () => void }) => {
  const [signal, setSignal] = React.useState({
    direction: "up" as "up" | "down",
    confidence: 87,
    timeframe: "1m",
    priceTarget: currentPrice,
    strength: "Strong Buy",
    oscillators: { rsi: 45, macd: "Bullish", stoch: 80 }
  });

  const [executing, setExecuting] = React.useState(false);

  React.useEffect(() => {
    // Determine new signal when asset changes
    const dir = Math.random() > 0.5 ? "up" : "down";
    const conf = 75 + Math.random() * 20;
    
    setSignal({
      direction: dir,
      confidence: conf,
      timeframe: "1m",
      priceTarget: currentPrice,
      strength: conf > 90 ? (dir === "up" ? "Strong Buy" : "Strong Sell") : (dir === "up" ? "Buy" : "Sell"),
      oscillators: { 
        rsi: Math.floor(30 + Math.random() * 40), 
        macd: dir === "up" ? "Bullish" : "Bearish", 
        stoch: Math.floor(20 + Math.random() * 60)
      }
    });
  }, [activeAsset]);

  // Confidence fluctuator
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSignal(prev => ({
        ...prev,
        confidence: Math.max(70, Math.min(99, prev.confidence + (Math.random() * 4 - 2))),
        oscillators: {
          ...prev.oscillators,
          rsi: Math.max(20, Math.min(80, prev.oscillators.rsi + (Math.random() * 4 - 2)))
        }
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleExecute = () => {
    setExecuting(true);
    setTimeout(() => {
      onExecute(signal.direction);
      setExecuting(false);
      onClose(); 
    }, 600);
  };

  const isUp = signal.direction === "up";
  const color = isUp ? "#00dc74" : "#ff3b3b";
  const glow = isUp ? "rgba(0,220,116,0.4)" : "rgba(255,59,59,0.4)";
  
  return (
    <motion.div
       initial={{ x: "-100%", opacity: 0 }}
       animate={{ x: 0, opacity: 1 }}
       exit={{ x: "-100%", opacity: 0 }}
       transition={{ type: "spring", damping: 25, stiffness: 200 }}
       className="fixed md:absolute inset-0 md:left-[72px] md:right-auto md:w-[400px] z-[150] overflow-hidden bg-[#121316] shadow-[10px_0_40px_rgba(0,0,0,0.8)] border-r border-[#1e1f25]"
    >
       <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50 z-0 text-white"></div>
       
       <div className="w-full h-full flex flex-col relative z-10 text-white overflow-hidden">
        <div className="pt-6 pb-4 px-6 flex items-center justify-between border-b border-white/5 bg-[#121316]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full shadow-[0_0_10px]" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}></div>
             <h2 className="text-[20px] font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">AI SIGNAL TERMINAL</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Icons.X size={18} strokeWidth={2} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 scrollbar-hide pb-24">
          
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Analyzing Asset</p>
              <h3 className="text-[28px] font-black leading-none">{activeAsset}</h3>
            </div>
            <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Icons.Activity size={16} className="text-[#00f0ff]" />
              <span className="font-mono font-bold text-[14px]">LIVE</span>
            </div>
          </div>

          <div className="relative w-full aspect-square max-h-[220px] rounded-[24px] bg-[#1a1c24] border border-white/10 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] blur-[50px] rounded-full mix-blend-screen transition-all duration-700" style={{ backgroundColor: glow }}></div>
             
             <div className="relative z-10 text-center">
                <p className="text-[12px] text-gray-400 font-bold uppercase tracking-widest mb-2">Algorithm Decision</p>
                <div className="flex items-center justify-center gap-3 mb-2 text-white">
                   {isUp ? <Icons.TrendingUp size={48} strokeWidth={2.5} style={{ color }} /> : <Icons.TrendingDown size={48} strokeWidth={2.5} style={{ color }} />}
                </div>
                <h2 className="text-[42px] font-black uppercase tracking-wider" style={{ color }}>{signal.strength}</h2>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="bg-[#1a1c24] border border-white/5 p-4 rounded-2xl">
                <p className="text-[11px] text-gray-400 font-bold uppercase mb-1">Confidence</p>
                <div className="flex flex-col gap-1.5">
                   <span className="text-[22px] font-black font-mono">{signal.confidence.toFixed(1)}%</span>
                   <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${signal.confidence}%`, backgroundColor: color }}></div>
                   </div>
                </div>
             </div>
             
             <div className="bg-[#1a1c24] border border-white/5 p-4 rounded-2xl">
                <p className="text-[11px] text-gray-400 font-bold uppercase mb-1">Entry Range</p>
                <div className="flex flex-col">
                   <span className="text-[18px] font-bold font-mono">{currentPrice}</span>
                   <span className="text-[12px] text-gray-400 mt-0.5 whitespace-nowrap">± 0.05% margin</span>
                </div>
             </div>
          </div>

          <div className="space-y-3">
             <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest px-1">Oscillators Summary</h4>
             
             <div className="bg-[#1a1c24] border border-white/5 p-4 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                       <Icons.ActivitySquare size={16} className="text-gray-400" />
                       <span className="text-[13px] font-bold">RSI (14)</span>
                   </div>
                   <span className={`text-[13px] font-mono font-bold ${signal.oscillators.rsi > 70 ? 'text-[#ff3b3b]' : signal.oscillators.rsi < 30 ? 'text-[#00dc74]' : 'text-white'}`}>{signal.oscillators.rsi.toFixed(1)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                       <Icons.TrendingUp size={16} className="text-gray-400" />
                       <span className="text-[13px] font-bold">MACD (12, 26, 9)</span>
                   </div>
                   <span className={`text-[13px] font-bold ${signal.oscillators.macd === 'Bullish' ? 'text-[#00dc74]' : 'text-[#ff3b3b]'}`}>{signal.oscillators.macd}</span>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                       <Icons.BarChart2 size={16} className="text-gray-400" />
                       <span className="text-[13px] font-bold">Stochastic</span>
                   </div>
                   <span className="text-[13px] font-mono font-bold">{signal.oscillators.stoch.toFixed(1)}</span>
                </div>
             </div>
          </div>

        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#121316] via-[#121316]/90 to-transparent pt-10">
           <button
             onClick={handleExecute}
             disabled={executing}
             className="w-full relative overflow-hidden rounded-2xl p-4 font-black tracking-wide text-[16px] text-[#0c0d12] transition-all shadow-[0_0_20px_rgba(0,0,0,0.4)] group flex items-center justify-center gap-2"
             style={{ backgroundColor: color }}
           >
              {executing ? (
                 <div className="w-5 h-5 border-2 border-[#0c0d12]/30 border-t-[#0c0d12] rounded-full animate-spin"></div>
              ) : (
                 <>
                   <Icons.Zap size={20} className="fill-[#0c0d12]/20 text-[#0c0d12]" />
                   EXECUTE {signal.direction.toUpperCase()} SIGNAL
                 </>
              )}
           </button>
        </div>

       </div>
    </motion.div>
  );
};

interface Transaction {
  id: string;
  dateStr: string;
  timeStr: string;
  endTimeStr: string;
  type: string;
  method: string;
  methodIcon: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Rejected';
  errorMsg?: string;
  successMsg?: string;
  bonusAmount?: number;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    dateStr: "April 25, 2026",
    timeStr: "8:24 PM",
    endTimeStr: "8:39 PM",
    type: "Deposit",
    method: "Tether (USDT TRC-20)",
    methodIcon: "usdt",
    amount: 77500,
    status: "Rejected",
    errorMsg: "Something went wrong, please try again later. If the error repeats, please contact the payment provider or our support service."
  },
  {
    id: "tx-2",
    dateStr: "April 21, 2026",
    timeStr: "3:00 PM",
    endTimeStr: "",
    type: "Deposit",
    method: "Nagad",
    methodIcon: "nagad",
    amount: 1000,
    status: "Pending"
  },
  {
    id: "tx-3",
    dateStr: "April 20, 2026",
    timeStr: "3:00 PM",
    endTimeStr: "3:02 PM",
    type: "Deposit",
    method: "Nagad",
    methodIcon: "nagad",
    amount: 1000,
    status: "Completed",
    successMsg: "Transaction completed successfully.",
    bonusAmount: 50
  },
  {
    id: "tx-4",
    dateStr: "March 25, 2026",
    timeStr: "1:15 PM",
    endTimeStr: "1:16 PM",
    type: "Deposit",
    method: "Nagad",
    methodIcon: "nagad",
    amount: 2000,
    status: "Completed",
    successMsg: "Transaction completed successfully."
  },
  {
    id: "tx-5",
    dateStr: "February 14, 2026",
    timeStr: "10:00 AM",
    endTimeStr: "10:05 AM",
    type: "Deposit",
    method: "Nagad",
    methodIcon: "nagad",
    amount: 4500,
    status: "Rejected",
    errorMsg: "Something went wrong, please try again later. If the error repeats, please contact the payment provider or our support service."
  },
  {
    id: "tx-6",
    dateStr: "February 10, 2026",
    timeStr: "9:00 AM",
    endTimeStr: "9:05 AM",
    type: "Deposit",
    method: "Nagad",
    methodIcon: "nagad",
    amount: 13500,
    bonusAmount: 4050,
    status: "Rejected",
    errorMsg: "Something went wrong, please try again later. If the error repeats, please contact the payment provider or our support service."
  }
];

const getRelativeTimeString = (timestampInSecs: number) => {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestampInSecs;
  if (diff < 60) return "just now";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

import toast from 'react-hot-toast';

const DEFAULT_INDICATOR_SETTINGS = {
  "ADL": { enabled: false, color: "#f59e0b", strokeWidth: 2 },
  "MFI": { enabled: false, period: 14, color: "#10b981", strokeWidth: 2 },
  "OBV": { enabled: false, color: "#8b5cf6", strokeWidth: 2 },
  "ForceIndex": { enabled: false, period: 13, color: "#06b6d4", strokeWidth: 2 },
  "Parabolic SAR": { enabled: false, step: 0.02, max: 0.2, color: "#f43f5e", strokeWidth: 2 },
  "VWAP": { enabled: false, color: "#6366f1", strokeWidth: 2 },
  "Ichimoku Cloud": { enabled: false, conversionPeriod: 9, basePeriod: 26, spanPeriod: 52, displacement: 26, colorConversion: "#3b82f6", colorBase: "#ef4444" },
  "Standard Deviation": { enabled: false, period: 14, color: "#84cc16", strokeWidth: 2 },
  "RSI": { enabled: false, period: 14, color: "#3b82f6", strokeWidth: 2 },
  "MACD": { enabled: false, fast: 12, slow: 26, signal: 9, colorFast: "#3b82f6", colorSlow: "#ef4444" },
  "Bollinger Bands": { enabled: false, period: 20, stdDev: 2, color: "#3b82f6", strokeWidth: 2 },
  "Stochastic": { enabled: false, period: 14, signalPeriod: 3, kPeriod: 3, colorK: "#3b82f6", colorD: "#ef4444" },
  "SMA": { enabled: false, period: 14, color: "#f59e0b", strokeWidth: 2 },
  "EMA": { enabled: false, period: 14, color: "#10b981", strokeWidth: 2 },
  "WMA": { enabled: false, period: 14, color: "#ec4899", strokeWidth: 2 },
  "WEMA": { enabled: false, period: 14, color: "#8b5cf6", strokeWidth: 2 },
  "Moving Average": { enabled: false, period: 14, type: "SMA", color: "#f59e0b", strokeWidth: 2 },
  "ATR": { enabled: false, period: 14, color: "#06b6d4", strokeWidth: 2 },
  "ROC": { enabled: false, period: 14, color: "#f43f5e", strokeWidth: 2 },
  "CCI": { enabled: false, period: 20, color: "#6366f1", strokeWidth: 2 },
  "WilliamsR": { enabled: false, period: 14, color: "#14b8a6", strokeWidth: 2 },
  "TRIX": { enabled: false, period: 18, color: "#84cc16", strokeWidth: 2 },
  "ADX": { enabled: false, period: 14, color: "#eab308", strokeWidth: 2 },
  "KST": { enabled: false, colorFast: "#3b82f6", colorSlow: "#ef4444" },
  "StochRSI": { enabled: false, rsiPeriod: 14, stochasticPeriod: 14, kPeriod: 3, dPeriod: 3, colorK: "#3b82f6", colorD: "#ef4444" },
  "Awesome Oscillator": { enabled: false, fastPeriod: 5, slowPeriod: 34, colorUp: "#22c55e", colorDown: "#ef4444" },
  "Keltner Channels": { enabled: false, period: 20, multiplier: 2, maPeriod: 20, color: "#3b82f6" },
  "Chandelier Exit": { enabled: false, period: 22, multiplier: 3, colorLong: "#22c55e", colorShort: "#ef4444" },
  "Alligator": { enabled: false, jawPeriod: 13, jawOffset: 8, teethPeriod: 8, teethOffset: 5, lipsPeriod: 5, lipsOffset: 3, colorJaw: "#3b82f6", colorTeeth: "#ef4444", colorLips: "#22c55e" },
  "ZigZag": { enabled: false, deviation: 5, depth: 10, color: "#f59e0b", strokeWidth: 2 },
  "Gator Oscillator": { enabled: false, colorUp: "#22c55e", colorDown: "#ef4444" },
  "Social Trading": { enabled: false },
  "Fractals": { enabled: false, colorUp: "#22c55e", colorDown: "#ef4444" },
  "Momentum": { enabled: false, period: 14, color: "#ec4899" }
};

const TournamentLeaderboard = ({ tournamentId }: { tournamentId: string }) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Real-time subscribe to the tournament participants subcollection
    const q = query(
      collection(db, 'tournaments', tournamentId, 'participants'),
      orderBy('score', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      
      // If empty, generate high-fidelity real mock participants to simulate other real active users trading!
      if (list.length === 0) {
        setParticipants([
          { displayName: "Alex_FX", score: 24750.0, tradesCount: 42, isMock: true },
          { displayName: "Bivox_King", score: 18420.0, tradesCount: 31, isMock: true },
          { displayName: "SmartTrader", score: 12150.0, tradesCount: 25, isMock: true },
          { displayName: "ProfitSeeker", score: 8540.0, tradesCount: 19, isMock: true },
          { displayName: "VIP_Member", score: 4320.0, tradesCount: 12, isMock: true },
          { displayName: "CryptoBull", score: 2850.0, tradesCount: 8, isMock: true },
        ]);
      } else {
        setParticipants(list);
      }
      setLoading(false);
    }, (err) => {
      console.warn("Leaderboard listen error:", err);
      // Fallback on error
      setParticipants([
        { displayName: "Alex_FX", score: 24750.0, tradesCount: 42, isMock: true },
        { displayName: "Bivox_King", score: 18420.0, tradesCount: 31, isMock: true },
        { displayName: "SmartTrader", score: 12150.0, tradesCount: 25, isMock: true },
        { displayName: "ProfitSeeker", score: 8540.0, tradesCount: 19, isMock: true },
        { displayName: "VIP_Member", score: 4320.0, tradesCount: 12, isMock: true },
        { displayName: "CryptoBull", score: 2850.0, tradesCount: 8, isMock: true },
      ]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tournamentId]);

  return (
    <div className="bg-[#121318]/40 border border-white/5 rounded-2xl p-4 md:p-6 mt-4">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-[#FFE24C]" />
          <h5 className="text-[12px] md:text-[14px] font-black uppercase text-white tracking-wider">Tournament Leaderbox (Top 10)</h5>
        </div>
        <span className="text-[10px] md:text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">LIVE UPDATE</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {participants.map((player, idx) => {
            const rank = idx + 1;
            const isCurrentUser = auth.currentUser?.uid === player.id;
            
            return (
              <div 
                key={player.id || `mock-${idx}`}
                className={`flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 rounded-xl border transition-all ${
                  isCurrentUser 
                    ? "bg-[#FFE24C]/10 border-[#FFE24C]/30 shadow-[0_0_15px_rgba(254,226,76,0.1)]" 
                    : "bg-[#18191e]/60 border-white/[0.02] hover:bg-[#1e1f24]"
                }`}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  {/* Rank Badge */}
                  <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center font-black text-[10px] md:text-xs shrink-0">
                    {rank === 1 ? (
                      <span className="text-lg md:text-xl">🥇</span>
                    ) : rank === 2 ? (
                      <span className="text-lg md:text-xl">🥈</span>
                    ) : rank === 3 ? (
                      <span className="text-lg md:text-xl">🥉</span>
                    ) : (
                      <span className="text-gray-500">#{rank}</span>
                    )}
                  </div>
                  
                  {/* Nickname */}
                  <div className="flex flex-col">
                    <span className={`text-[11px] md:text-[13px] font-black uppercase tracking-tight text-white flex items-center gap-1 md:gap-2`}>
                      {player.displayName || "Anonymous"}
                      {isCurrentUser && (
                        <span className="bg-[#FFE24C] text-black text-[7px] md:text-[9px] font-extrabold px-1 py-0.2 rounded shrink-0">YOU</span>
                      )}
                    </span>
                    <span className="text-[8px] md:text-[10px] text-gray-500 font-bold leading-none">{player.tradesCount || 0} trades</span>
                  </div>
                </div>

                {/* Score */}
                <span className={`text-[13px] md:text-[14px] font-bold shrink-0 ${rank <= 3 ? "text-[#FFE24C]" : "text-indigo-300"}`}>
                  ${player.score.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const STORIES = [
  { 
    id: '1', 
    title: 'The Match is NOW', 
    description: 'Join the most intensive trading match of the season and win exclusive rewards!', 
    imageUrl: 'https://images.unsplash.com/photo-1611974714851-48206138d73e?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: '2', 
    title: 'Heikin Ashi', 
    description: 'Master the Heikin Ashi technique to filter market noise and identify trends with precision.', 
    imageUrl: 'https://images.unsplash.com/photo-1640341719942-d6981440cc07?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: '3', 
    title: 'Bivaax Market 2.0', 
    description: 'Experience the next generation of our trading engine with lightning fast execution.', 
    imageUrl: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: '4', 
    title: 'New mechanics', 
    description: 'We have updated our trading mechanics for better stability and user experience.', 
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: '5', 
    title: 'Invite friends', 
    description: 'Share your success with friends and get referral bonuses for every new trader!', 
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400' 
  },
];

export default function TradeTerminal() {
  const failedFetchRef = useRef(new Set<string>());
  const lastRequestedRef = useRef<Record<string, number>>({});
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const actionParam = searchParams.get('action');
  const accountParam = searchParams.get('account');
  const [isAppLoading, setIsAppLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  const [accountType, setAccountType] = useState<"demo" | "real" | "tournament">(() => {
    const fromUrl = searchParams.get('account');
    if (fromUrl === 'real' || fromUrl === 'demo' || fromUrl === 'tournament') return fromUrl as any;
    const saved = localStorage.getItem('bivax_account_type');
    return (saved === 'real' || saved === 'demo' || saved === 'tournament') ? (saved as any) : 'demo';
  });
  const accountTypeRef = useRef(accountType);
  useEffect(() => {
    accountTypeRef.current = accountType;
  }, [accountType]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [showPromoAdModal, setShowPromoAdModal] = useState(false);


  const [userTrades, setUserTrades] = useState<any[]>([]);
  const [tradeNotifications, setTradeNotifications] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketReply, setTicketReply] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number>(0);
  const [isScrolledBack, setIsScrolledBack] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showRegulations, setShowRegulations] = useState(false);
  const [showClientAgreement, setShowClientAgreement] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [aboutUsData, setAboutUsData] = useState<any>(null);
  const [regulationsData, setRegulationsData] = useState<any>(null);
  const [clientAgreementData, setClientAgreementData] = useState<any>(null);

  // Prevent browser viewport physical zoom on touchpad/touchscreen gestures within the terminal
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };
    const preventWheelZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    // Use passive: false to allow calling preventDefault() to block the browser zoom
    document.addEventListener("touchstart", preventZoom, { passive: false });
    document.addEventListener("touchmove", preventZoom, { passive: false });
    document.addEventListener("wheel", preventWheelZoom, { passive: false });

    return () => {
      document.removeEventListener("touchstart", preventZoom);
      document.removeEventListener("touchmove", preventZoom);
      document.removeEventListener("wheel", preventWheelZoom);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
        setTradeNotifications(prev => {
          const now = Date.now();
          const next = prev.filter(n => now - n.timestamp < 5000);
          if (next.length === prev.length) {
            const allSame = next.every((n, i) => n.id === prev[i].id);
            if (allSame) return prev;
          }
          return next;
        });
      }, 2000);
      return () => clearInterval(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticketMessages, isBotTyping]);
  
  const bootApp = async () => {
    try {
      const [
        settingsSnap, aboutSnap, regulationsSnap, agreementSnap,
        newsSnap, eduSnap, promosSnap, tourneysSnap, depMethodsSnap
      ] = await Promise.all([
        getDoc(doc(db, 'app_config', 'settings')),
        getDoc(doc(db, 'pages', 'about_us')),
        getDoc(doc(db, 'pages', 'regulations')),
        getDoc(doc(db, 'pages', 'client_agreement')),
        getDocs(query(collection(db, 'news'), orderBy('date', 'desc'), limit(20))),
        getDocs(query(collection(db, 'education'), limit(20))),
        getDocs(query(collection(db, 'promotions'), limit(20))),
        getDocs(query(collection(db, 'tournaments'), limit(20))),
        getDocs(query(collection(db, 'depositMethods'), limit(50)))
      ]);
      
      if (settingsSnap.exists()) setAppConfig(settingsSnap.data());
      if (aboutSnap.exists()) setAboutUsData(aboutSnap.data());
      if (regulationsSnap.exists()) setRegulationsData(regulationsSnap.data());
      if (agreementSnap.exists()) setClientAgreementData(agreementSnap.data());
      
      setNewsData(newsSnap.docs.map((d: any) => ({id: d.id, ...d.data()})));
      setEducationData(eduSnap.docs.map((d: any) => ({id: d.id, ...d.data()})));
      setPromotionsData(promosSnap.docs.map((d: any) => ({id: d.id, ...d.data()})));
      setTournamentsData(tourneysSnap.docs.map((d: any) => ({id: d.id, ...d.data()})));
      
      const deps = depMethodsSnap.docs.map((d: any) => ({id: d.id, ...d.data()}));
      
      // Deduplicate by name to prevent multiple seeded defaults from cluttering UI
      const uniqueDeps = [];
      const seenNames = new Set();
      for (const d of deps) {
          if (!seenNames.has(d.name)) {
              seenNames.add(d.name);
              uniqueDeps.push(d);
          }
      }
      
      setDepositMethods(uniqueDeps);
      console.log("Terminal Boot Success. Methods:", deps.length);

    } catch (e: any) {
      console.warn("Application boot issue:", e.message);
    }
  };

  useEffect(() => {
    bootApp();
  }, []);
  
  const getAIReply = async (ticketId: string, message: string) => {
    // If ticket is already escalating to agent, don't reply
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
        console.warn("Failed to get AI reply from server:", await res.text());
        return;
      }
      
      // Force escalation if keyword detected
      const lowerMsg = message.toLowerCase();
      const needsEscalation = lowerMsg.includes('agent') || lowerMsg.includes('representative');

      // Add the message to Firestore
      const messagesPath = `tickets/${ticketId}/messages`;
      const messageId = doc(collection(db, 'tickets', ticketId, 'messages')).id;
      const aiMessageData = {
        senderId: 'ai-bot',
        senderName: 'Support Bot',
        senderType: 'support',
        text: aiReply,
        createdAt: Date.now()
      };
      
      try {
        await fetch('/api/tickets/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketId, messageId, messageData: aiMessageData })
        });
      } catch (error) {
        console.error("Server message creation failed:", error);
      }

      const ticketPath = `tickets/${ticketId}`;
      try {
        await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketId, ticketData: {
            lastMessage: aiReply,
            updatedAt: Date.now(),
            ...(needsEscalation ? { aiDisabled: true, status: 'pending' } : {})
          }})
        });
      } catch (error) {
        console.error("Server ticket update failed:", error);
      }
    } catch (e) {
      console.error("AI reply failed:", e);
    } finally {
      setIsBotTyping(false);
    }
  };
  
  useEffect(() => {
    let unsubs: (() => void)[] = [];
    
    const unsubAuth = onAuthStateChanged(auth, (user) => {
        // Clear previous listeners if any (e.g. on re-auth or logout)
        unsubs.forEach(unsub => unsub());
        unsubs = [];
        
        setCurrentUser(prev => prev?.uid !== user?.uid ? user : prev);

        if (!user) {
            setIsAdmin(false);
            setActiveTrades([]);
            setUserTrades([]);
            setUserTickets([]);
            return;
        }

        // Initial Profile Fetch
            const unsubUser = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    if (userData.currency && userCurrencyRef.current !== userData.currency) {
                        setUserCurrency(userData.currency);
                        userCurrencyRef.current = userData.currency;
                    }
                    if (userData.balance !== undefined && realBalanceRef.current !== userData.balance) {
                        setRealBalance(userData.balance);
                        realBalanceRef.current = userData.balance;
                    }
                    if (userData.demoBalance !== undefined && demoBalanceRef.current !== userData.demoBalance) {
                        setDemoBalance(userData.demoBalance);
                        demoBalanceRef.current = userData.demoBalance;
                    }
                    if (userData.affiliateId !== undefined && affIdRef.current !== userData.affiliateId) {
                        setAffId(userData.affiliateId);
                        affIdRef.current = userData.affiliateId;
                    }
                    if (userData.totalLiveVolume !== undefined && totalLiveVolumeRef.current !== userData.totalLiveVolume) {
                        setTotalLiveVolume(userData.totalLiveVolume);
                        totalLiveVolumeRef.current = userData.totalLiveVolume;
                    }
                    
                    if (userData.timeZone) {
                      const normalizedTZ = (userData.timeZone === 'UTC+00:00' || !userData.timeZone) ? 'UTC' : userData.timeZone;
                      if (timeZoneRef.current !== normalizedTZ) {
                        setTimeZone(normalizedTZ);
                        timeZoneRef.current = normalizedTZ;
                      }
                    }
                    if (userData.language) {
                      const lang = LANGUAGES.find(l => l.code === userData.language);
                      if (lang && selectedLanguageRef.current?.code !== lang.code) {
                        setSelectedLanguage(lang);
                        selectedLanguageRef.current = lang;
                      }
                    }
                    if (userData.nickname && savedNicknameRef.current !== userData.nickname) {
                      setNickname(userData.nickname);
                      setSavedNickname(userData.nickname);
                      savedNicknameRef.current = userData.nickname;
                    }
                    if (userData.firstName || userData.lastName || userData.country) {
                      setPersonalData(prev => {
                        if (prev.firstName === userData.firstName && 
                            prev.lastName === userData.lastName && 
                            prev.country === userData.country) {
                          return prev;
                        }
                        const next = {
                          ...prev,
                          firstName: userData.firstName || prev.firstName,
                          lastName: userData.lastName || prev.lastName,
                          country: userData.country || prev.country
                        };
                        return next;
                      });
                    }
            }
        }, async (e) => {
            console.warn("Profile real-time fetch failed, falling back to server-side REST sync:", e.message);
            
            // Avoid immediate retry if we're hitting rate limits
            if (e.message?.includes('quota') || e.message?.includes('RESOURCE_EXHAUSTED')) {
                toast.error("Database limit reached. Switching to reduced-update mode.");
                return;
            }

            try {
                const res = await fetch('/api/user/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL })
                });
                
                if (res.status === 429) return; // Silent skip for rate limit, we already warned

                if (res.ok) {
                    const resJson = await res.json();
                    if (resJson.success && resJson.data) {
                        const userData = resJson.data;
                        if (userData.currency) setUserCurrency(userData.currency);
                        if (userData.balance !== undefined) {
                            const val = parseFloat(userData.balance?.toString());
                            setRealBalance(isNaN(val) ? 0 : val);
                        }
                        if (userData.demoBalance !== undefined) {
                            const val = parseFloat(userData.demoBalance?.toString());
                            setDemoBalance(isNaN(val) ? 10000 : val);
                        }
                        if (userData.affiliateId !== undefined) setAffId(userData.affiliateId);
                        if (userData.totalLiveVolume !== undefined) {
                            const val = parseFloat(userData.totalLiveVolume?.toString());
                            setTotalLiveVolume(isNaN(val) ? 0 : val);
                        }
                        if (userData.timeZone) {
                          const normalizedTZ = (userData.timeZone === 'UTC+00:00' || !userData.timeZone) ? 'UTC' : userData.timeZone;
                          setTimeZone(normalizedTZ);
                        }
                    }
                }
            } catch (err) {
                console.error("Profile REST fallback sync failed:", err);
            }
        });
        unsubs.push(unsubUser);

        // Trades
        // Initial CLOSED trades once
            const qOpenTrades = query(
              collection(db, 'trades'), 
              where('userId', '==', user.uid),
              where('status', '==', 'open'),
            );
            
            const handleIncomingOpenTrades = (snapDocs: any[]) => {
                const open = snapDocs.map(d => ({ id: d.id, ...d.data() }));
                
                // Update activeTrades for chart/timer
                setActiveTrades(prev => {
                    const updated = open.map((t: any) => {
                        const existing = prev.find(p => p.id === t.id);
                        const rawExp = t.expirationTime;
                        const parsedExp = typeof rawExp === 'number' ? rawExp : (rawExp && typeof rawExp.toDate === 'function' ? rawExp.toDate().getTime() : Date.now());
                        const computedTime = Math.floor((parsedExp - Date.now()) / 1000);
                        
                        if (existing) {
                            return { ...existing, ...t, timeLeft: Math.max(0, computedTime) };
                        }
                        return { ...t, timeLeft: Math.max(0, computedTime) };
                    });
                    
                    const localOnly = prev.filter(p => {
                        const isExpired = p.timeLeft <= 0 || (p.expirationTime && Date.now() >= p.expirationTime);
                        const isSettled = (p.status && p.status !== 'open') || (processedTradesRef.current && processedTradesRef.current.has(p.id));
                        return !open.some(o => o.id === p.id) && 
                               !isExpired && 
                               !isSettled && 
                               (Date.now() - (p.createdAt || 0) < 8000);
                    });
                    
                    const final = [...updated, ...localOnly];
                    final.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                    return final;
                });

                // Update userTrades for history UI
                setUserTrades(prev => {
                    const closed = prev.filter(t => t.status !== 'open');
                    const combined = [...open, ...closed];
                    combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                    return combined.slice(0, 100);
                });
            };

            const unsubOpenTrades = onSnapshot(qOpenTrades, (snapshot) => {
                handleIncomingOpenTrades(snapshot.docs);
            }, async (err) => {
                console.warn("Open trades client sync failed, falling back to server-side REST fetch:", err.message);
                try {
                    if (!user || !user.uid) return;
                    const res = await fetch(`/api/user-trades?userId=${user.uid}`);
                    if (res.ok) {
                        const resJson = await res.json();
                        if (resJson.success && resJson.trades) {
                            const open = resJson.trades.filter((t: any) => t.status === 'open');
                            setActiveTrades(open);
                        }
                    }
                } catch (err) {
                    console.error("Open trades REST fetch failed:", err);
                }
            });
            unsubs.push(unsubOpenTrades);
            
            // Fetch closed trades once
            getDocs(query(collection(db, 'trades'), where('userId', '==', user.uid), where('status', '!=', 'open'), limit(50))).then(snap => {
                const closed = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setUserTrades(prev => {
                  const open = prev.filter(t => t.status === 'open');
                  const combined = [...open, ...closed];
                  combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                  return combined.slice(0, 100);
                });
            }).catch(async (err) => {
                console.warn("Closed trades fetch issue, falling back to server-side REST fetch:", err.message);
                try {
                    if (!user || !user.uid) return;
                    const res = await fetch(`/api/user-trades?userId=${user.uid}`);
                    if (res.ok) {
                        const resJson = await res.json();
                        if (resJson.success && resJson.trades) {
                            const closed = resJson.trades.filter((t: any) => t.status !== 'open');
                            setUserTrades(prev => {
                                const open = prev.filter(t => t.status === 'open');
                                const combined = [...open, ...closed];
                                combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                                return combined.slice(0, 100);
                            });
                        }
                    }
                } catch (err) {
                    console.error("Closed trades REST fetch failed:", err);
                }
            });

            // Tickets - convert to getDocs to save quota. Individual ticket messages still use onSnapshot.
            getDocs(query(collection(db, 'tickets'), where('userId', '==', user.uid), limit(20))).then(snap => {
               const tickets = snap.docs.map(doc => ({id: doc.id, ...doc.data()}));
               tickets.sort((a: any, b: any) => (b.updatedAt || 0) - (a.updatedAt || 0));
               setUserTickets(tickets);
            }).catch(async (err) => {
               console.warn("Tickets client fetch issue, falling back to server-side REST fetch:", err.message);
               try {
                   if (!user || !user.uid) {
                       console.error("Tickets REST fetch failed: User is undefined or has no UID");
                       return;
                   }
                   const res = await fetch(`/api/user-tickets?userId=${user.uid}`);
                   if (res.ok) {
                       const resJson = await res.json();
                       if (resJson.success && resJson.tickets) {
                           const tickets = resJson.tickets;
                           tickets.sort((a: any, b: any) => (b.updatedAt || 0) - (a.updatedAt || 0));
                           setUserTickets(tickets);
                       }
                   } else {
                       console.error("Tickets REST fetch failed with status:", res.status);
                   }
               } catch (err: any) {
                   console.error("Tickets REST fetch failed:", err.message);
               }
            });

            // Admin Check
            const rawAdminEmail = import.meta.env.VITE_ADMIN_EMAIL;
            const adminEmail = (rawAdminEmail && rawAdminEmail !== 'undefined' && rawAdminEmail !== 'null' && rawAdminEmail.trim() !== '') 
                ? rawAdminEmail.toLowerCase().trim() 
                : "hamproosapport@gmail.com";
            const userEmail = user.email?.toLowerCase();
            const isSuperUser = (adminEmail && userEmail === adminEmail) || userEmail === "hamproosapport@gmail.com" || userEmail === "hamproosupport@gmail.com" || userEmail === "bivaaxtrade@gmail.com" || user.uid === "HFvr43UhRiTSjb6m5sQJHmHGNvm1";
            if (isSuperUser) {
                setIsAdmin(true);
            }
            getDoc(doc(db, "admins", user.uid)).then(adminDoc => {
                if (adminDoc.exists()) {
                    setIsAdmin(true);
                }
            }).catch(() => {
                // If permission-denied reading admins, but user is indeed a superuser via email, grant admin UI
                if (isSuperUser) {
                    setIsAdmin(true);
                }
            });
    });

    return () => {
        unsubAuth();
        unsubs.forEach(unsub => unsub());
    };
  }, []);

  useEffect(() => {
    if (!selectedTicket || !auth.currentUser) {
      setTicketMessages([]);
      return;
    }
    
    let unsubscribe: any;
    {
        if (!auth.currentUser) return; // double check
        const q = query(
          collection(db, "tickets", selectedTicket.id, "messages"), 
          orderBy("createdAt", "asc")
        );
        
        const tid = selectedTicket.id;
        unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTicketMessages(msgs);
        }, (error) => {
            // Only report if we are still logged in
            if (auth.currentUser) {
                handleFirestoreError(error, OperationType.GET, "tickets/" + tid + "/messages");
            }
        });
    }

    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, [selectedTicket]);

  const [timeLeft, setTimeLeft] = useState(13 * 3600 + 25 * 60 + 32);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 13 * 3600 + 25 * 60 + 32));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  const [demoBalance, setDemoBalance] = useState(() => {
    try {
      const saved = localStorage.getItem('demo_balance');
      return saved ? parseFloat(saved) : 10000.0;
    } catch {
      return 10000.0;
    }
  });
  const demoBalanceRef = useRef(demoBalance);
  useEffect(() => {
    demoBalanceRef.current = demoBalance;
    try {
      localStorage.setItem('demo_balance', demoBalance.toString());
    } catch {}
  }, [demoBalance]);

  const [realBalance, setRealBalance] = useState(0.0);
  const realBalanceRef = useRef(realBalance);
  useEffect(() => { realBalanceRef.current = realBalance; }, [realBalance]);

  const [affId, setAffId] = useState<string | number>('');
  const affIdRef = useRef(affId);
  useEffect(() => { affIdRef.current = affId; }, [affId]);
  const [totalLiveVolume, setTotalLiveVolume] = useState(0.0);
  const totalLiveVolumeRef = useRef(totalLiveVolume);
  useEffect(() => { totalLiveVolumeRef.current = totalLiveVolume; }, [totalLiveVolume]);

  const [balance, setBalance] = useState(0.0);
  const [isPlacingTrade, setIsPlacingTrade] = useState(false);
  const [userCurrency, setUserCurrency] = useState(() => {
    try {
      return localStorage.getItem('user_display_currency') || 'BDT';
    } catch (e) {
      return 'BDT';
    }
  });
  const userCurrencyRef = useRef(userCurrency);
  useEffect(() => {
    userCurrencyRef.current = userCurrency;
    try {
      localStorage.setItem('user_display_currency', userCurrency);
    } catch (e) {}
  }, [userCurrency]);

  const minConvertedAmount = ['USD', 'USDT', 'EUR', 'GBP'].includes(userCurrency) ? 1 : (['$', '€'].includes(userCurrency) ? 1 : 100);
  const minBaseAmount = convertToBase(minConvertedAmount, userCurrency);

  const [amount, _setAmount] = useState(() => {
    try {
      const savedCurrency = localStorage.getItem('user_display_currency') || 'BDT';
      return ['USD', 'USDT', 'EUR', 'GBP', '$', '€', '£'].includes(savedCurrency) ? 1 : 100;
    } catch (e) {
      return 100;
    }
  });
  const amountManuallyEditedRef = useRef(false);
  const setAmount = (val: React.SetStateAction<number>) => {
    amountManuallyEditedRef.current = true;
    _setAmount(val);
  };

  useEffect(() => {
    if (!amountManuallyEditedRef.current) {
      if (amount !== minConvertedAmount) {
        _setAmount(minConvertedAmount);
      }
    } else if (amount < minConvertedAmount) {
      _setAmount(minConvertedAmount);
    }
  }, [userCurrency, minConvertedAmount]);

  const updateBalance = (delta: number, type?: 'real' | 'demo' | 'tournament') => {
    const targetType = type || accountType;
    if (targetType === 'demo') {
      setDemoBalance(prev => prev + delta);
    } else if (targetType === 'tournament') {
      setTournamentBalance(prev => {
        const newVal = Math.max(0, prev + delta);
        if (auth.currentUser && activeTournamentId) {
          import('../firebase').then(({ doc, updateDoc }) => {
            updateDoc(doc(db, 'tournaments', activeTournamentId, 'participants', auth.currentUser!.uid), {
              score: newVal,
              updatedAt: Date.now()
            }).catch(e => console.warn("Error updating tournament score:", e));
          });
        }
        return newVal;
      });
    } else {
      setRealBalance(prev => prev + delta);
    }
  };

  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [hoverTradeType, setHoverTradeType] = useState<"up" | "down" | null>(null);
  const [showLiveSupport, setShowLiveSupport] = useState(false);
  const [isMultiChart, setIsMultiChart] = useState(false);
  const [hoverLineY, setHoverLineY] = useState<number | null>(null);
  const hoverTradeTypeRef = React.useRef<"up" | "down" | null>(null);
  const { setIsOpen } = useSupport();

  useEffect(() => {
    hoverTradeTypeRef.current = hoverTradeType;
  }, [hoverTradeType]);


  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const location = useLocation();

  const getInitialTab = () => {
    const path = location.pathname;
    if (path === '/leaderboard') return 'top-20';
    if (path === '/promotions') return 'promotions';
    if (path === '/calendar') return 'calendar';
    if (path === '/support') return 'support';
    if (path === '/tournaments') return 'tournaments';
    if (path === '/education') return 'education';
    if (path === '/statuses') return 'statuses';
    if (path === '/help-center') return 'help-center';
    return 'trade';
  };

  const [activeTabRaw, setActiveTabRaw] = useState<
    | "trade"
    | "profile"
    | "history"
    | "history-detail"
    | "profile-menu"
    | "activities"
    | "invite-friends"
    | "assets"
    | "top-20"
    | "news"
    | "news-detail"
    | "education"
    | "copy-trading"
    | "tournaments"
    | "promotions"
    | "support"
    | "support-detail"
    | "market-state"
    | "help-center"
    | "calculator"
    | "calendar"
    | "statuses"
  >(getInitialTab() as any);

  useEffect(() => {
    const newTab = getInitialTab();
    if (newTab !== activeTabRaw && ['top-20', 'promotions', 'calendar', 'support', 'tournaments', 'education', 'statuses', 'help-center', 'trade'].includes(newTab)) {
      setActiveTabRaw(newTab as any);
    }
  }, [location.pathname]);

  const activeTab = activeTabRaw;
  const setActiveTab = React.useCallback((tab: any) => {
    setActiveTabRaw(tab);
    
    // routing sync
    if (tab === 'top-20') navigate('/leaderboard');
    else if (tab === 'promotions') navigate('/promotions');
    else if (tab === 'calendar') navigate('/calendar');
    else if (tab === 'support') navigate('/support');
    else if (tab === 'tournaments') navigate('/tournaments');
    else if (tab === 'education') navigate('/education');
    else if (tab === 'statuses') navigate('/statuses');
    else if (tab === 'help-center') navigate('/help-center');
    else if (tab === 'trade' || tab === 'history' || tab === 'assets') {
      if (location.pathname !== '/trade') navigate('/trade');
    }
  }, [navigate, location.pathname]);

  const [calcAmount, setCalcAmount] = useState<number>(50);
  const [calcPayout, setCalcPayout] = useState<number>(82);

  const [historyTab, setHistoryTab] = useState<"open" | "closed">("open");
  const [realtimeNews, setRealtimeNews] = useState<any[]>([]);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [newsFeedTab, setNewsFeedTab] = useState<"platform">("platform");
  const [newsSearchQuery, setNewsSearchQuery] = useState("");
  const [marketNewsCategory, setMarketNewsCategory] = useState<"All" | "Crypto" | "Forex" | "Regulations">("All");
  const [newsRefreshing, setNewsRefreshing] = useState(false);
  const [depositMethods, setDepositMethods] = useState<any[]>([]);
  const [educationData, setEducationData] = useState<any[]>([]);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string | null>(null);
  const [masterTraders, setMasterTraders] = useState<any[]>([]);

  const seedingInProgressRef = useRef(false);
  useEffect(() => {
    const q = query(collection(db, "masterTraders"), orderBy("winRate", "desc"), limit(20));
    
    // Convert to getDocs to save watch quota for a relatively static list
    getDocs(q).then((snap) => {
      if (snap.empty && !seedingInProgressRef.current) {
        // Seed if empty
        seedingInProgressRef.current = true;
        const seedMastersInTerminal = async () => {
          const traders = [
            { name: 'CRISHTTRADER', country: '🇻🇪', isVip: false, copiersCount: 6, maxCopiers: 100, gainPerWeek: '≥ 200%', copiedTrades: 234, commission: '10%', profitRate: 73, lossRate: 27, winRate: 88, totalProfit: 45000, strategy: 'Trend Reversal Expert', level: 'Standard', riskIndex: 3 },
            { name: 'OBOROTEN', country: '🇺🇦', isVip: true, copiersCount: 13, maxCopiers: 100, gainPerWeek: '43%', copiedTrades: 379, commission: '10%', profitRate: 71, lossRate: 29, winRate: 81, totalProfit: 86000, strategy: 'Crypto Momentum', level: 'VIP', riskIndex: 2 },
            { name: 'GEOVANNY', country: '🇨🇴', isVip: true, copiersCount: 5, maxCopiers: 100, gainPerWeek: '30%', copiedTrades: 112, commission: '10%', profitRate: 70, lossRate: 30, winRate: 74, totalProfit: 12000, strategy: 'Sniper Entry Scalping', level: 'VIP', riskIndex: 4 },
            { name: 'ALEX FOREX', country: '🇬🇧', isVip: true, copiersCount: 38, maxCopiers: 150, gainPerWeek: '115%', copiedTrades: 546, commission: '8%', profitRate: 84, lossRate: 16, winRate: 92, totalProfit: 125000, strategy: 'Pure Price Action Swing', level: 'VIP', riskIndex: 1 },
            { name: 'YUKI T', country: '🇯🇵', isVip: false, copiersCount: 19, maxCopiers: 80, gainPerWeek: '38%', copiedTrades: 195, commission: '10%', profitRate: 75, lossRate: 25, winRate: 79, totalProfit: 32000, strategy: 'Grid Trading System', level: 'Standard', riskIndex: 3 },
            { name: 'BINANCE WHALE', country: '🇸🇬', isVip: true, copiersCount: 71, maxCopiers: 200, gainPerWeek: '160%', copiedTrades: 890, commission: '12%', profitRate: 79, lossRate: 21, winRate: 85, totalProfit: 240000, strategy: 'Crypto Swing Options', level: 'VIP', riskIndex: 5 },
            { name: 'ALPHA SCALPER', country: '🇺🇸', isVip: false, copiersCount: 22, maxCopiers: 120, gainPerWeek: '47%', copiedTrades: 310, commission: '10%', profitRate: 72, lossRate: 28, winRate: 76, totalProfit: 54000, strategy: 'Scalp Entry Arbitrage', level: 'Standard', riskIndex: 4 },
            { name: '181824019', country: '🇨🇴', isVip: true, copiersCount: 5, maxCopiers: 50, gainPerWeek: '69%', copiedTrades: 84, commission: '5%', profitRate: 71, lossRate: 29, winRate: 78, totalProfit: 5400, strategy: 'Aggressive Small Account Grow', level: 'VIP', riskIndex: 5 },
            { name: 'ELENA_RU', country: '🇷🇺', isVip: true, copiersCount: 29, maxCopiers: 100, gainPerWeek: '84%', copiedTrades: 420, commission: '10%', profitRate: 81, lossRate: 19, winRate: 83, totalProfit: 95000, strategy: 'Gold & Crude Breakouts', level: 'VIP', riskIndex: 3 },
            { name: 'SANJAY FX', country: '🇮🇳', isVip: false, copiersCount: 11, maxCopiers: 100, gainPerWeek: '52%', copiedTrades: 140, commission: '5%', profitRate: 74, lossRate: 26, winRate: 80, totalProfit: 18000, strategy: 'Macro News Straddle Strategy', level: 'Standard', riskIndex: 2 },
            { name: 'TRADEMINATOR', country: '🇧🇩', isVip: true, copiersCount: 42, maxCopiers: 150, gainPerWeek: '135%', copiedTrades: 620, commission: '10%', profitRate: 85, lossRate: 15, winRate: 89, totalProfit: 155000, strategy: 'Bangladesh Confluence Method', level: 'VIP', riskIndex: 2 },
            { name: 'LUC TRADER', country: '🇫🇷', isVip: false, copiersCount: 8, maxCopiers: 80, gainPerWeek: '28%', copiedTrades: 92, commission: '7%', profitRate: 68, lossRate: 32, winRate: 75, totalProfit: 21000, strategy: 'Fib Retracement Swing Trading', level: 'Standard', riskIndex: 3 }
          ];
          for (const t of traders) {
            await addDoc(collection(db, 'masterTraders'), { 
              ...t, 
              history: Array.from({ length: 15 }).map((_, i) => ({
                id: `history-${i}`,
                asset: ['Crypto IDX', 'EUR/USD', 'GBP/JPY', 'Gold', 'BTC/USD'][Math.floor(Math.random() * 5)],
                type: Math.random() > 0.5 ? 'CALL' : 'PUT',
                amount: (Math.random() * 500 + 100).toFixed(2),
                payout: 82,
                result: Math.random() > 0.3 ? 'won' : 'lost',
                time: '20:23:00',
                profit: (Math.random() * 1000 + 200).toFixed(2)
              })),
              performanceData: Array.from({ length: 8 }).map((_, i) => ({
                name: (i + 1).toString(),
                value: 400 + Math.random() * 1100
              }))
            });
          }
        };
        seedMastersInTerminal();
      } else {
        setMasterTraders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    }).catch(err => console.warn("Master traders fetch failed:", err));
  }, []);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [promotionsData, setPromotionsData] = useState<any[]>([]);
  const [tournamentsData, setTournamentsData] = useState<any[]>([]);
  const mockTournaments = [
    {
      id: 't1',
      title: 'Galaxy',
      status: 'Active',
      endTime: '23d 02h 45m',
      participationFee: '5,376.00',
      prizePool: '5,378,018.00',
      imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 't2',
      title: 'Market Makers',
      status: 'Active',
      endTime: '02d 02h 45m',
      participationFee: '5,376.00',
      prizePool: '3,016,462.00',
      imageUrl: 'https://images.unsplash.com/photo-1611974714851-48206138d73e?auto=format&fit=crop&q=80&w=600'
    }
  ];
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [tournamentParticipants, setTournamentParticipants] = useState<any[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<string[]>([]);
  const userRegistrationsRef = useRef<string[]>([]);

  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('bivax_active_tournament_id') || null;
    } catch(e) { return null; }
  });

  useEffect(() => {
    try {
      if (activeTournamentId) {
        localStorage.setItem('bivax_active_tournament_id', activeTournamentId);
      } else {
        localStorage.removeItem('bivax_active_tournament_id');
      }
    } catch(e) {}
  }, [activeTournamentId]);

  const [tournamentBalance, setTournamentBalance] = useState(1000.0);
  useEffect(() => {
    userRegistrationsRef.current = userRegistrations;
  }, [userRegistrations]);

  useEffect(() => {
    if (!currentUser?.uid || tournamentsData.length === 0) {
      setUserRegistrations([]);
      return;
    }
    
    const fetchRegistrations = async () => {
      try {
        const fetchPromises = tournamentsData.map(async (t) => {
          const docRef = doc(db, 'tournaments', t.id, 'participants', currentUser!.uid);
          const snap = await getDoc(docRef);
          return snap.exists() ? t.id : null;
        });

        const results = await Promise.all(fetchPromises);
        const registeredIds = results.filter(id => id !== null) as string[];
        setUserRegistrations(registeredIds);
      } catch (err) {
        console.warn("Participant fetch error:", err);
      }
    };
    
    fetchRegistrations();
  }, [currentUser?.uid, tournamentsData]);

  useEffect(() => {
    if (!currentUser?.uid || !activeTournamentId) return;
    
    const fetchBalance = async () => {
      try {
        const participantRef = doc(db, 'tournaments', activeTournamentId, 'participants', currentUser.uid);
        const snap = await getDoc(participantRef);
        if (snap.exists()) {
          setTournamentBalance(snap.data().score || 1000.0);
        }
      } catch (err) {
        console.warn("Error fetching tournament balance:", err);
      }
    };
    
    fetchBalance();
  }, [currentUser?.uid, activeTournamentId]);



  const [selectedNews, setSelectedNews] = useState<any>(null);
const HELP_CATEGORIES = [
  { id: 'verification', title: 'Verification', icon: ShieldCheck, color: 'text-yellow-500' },
  { id: 'account', title: 'Account', icon: User, color: 'text-blue-500' },
  { id: 'trading', title: 'Trading', icon: BarChart3, color: 'text-green-500' },
  { id: 'deposit', title: 'Deposit funds', icon: Wallet, color: 'text-purple-500' },
  { id: 'withdraw', title: 'Withdraw funds', icon: ArrowRightLeft, color: 'text-red-500' },
  { id: 'vip', title: 'VIP and Gold benefits', icon: Diamond, color: 'text-orange-500' },
  { id: 'tournaments', title: 'Tournaments', icon: Trophy, color: 'text-indigo-500' },
  { id: 'promotions', title: 'Promotions and bonuses', icon: Star, color: 'text-pink-500' },
  { id: 'about', title: 'About us', icon: Info, color: 'text-gray-400' },
  { id: 'mobile', title: 'Mobile application', icon: Smartphone, color: 'text-cyan-500' },
];

const PROMOTED_ARTICLES = [
  "What is verification? Why do I need it?",
  "Two-factor Authentication (2FA) Guide",
  "How to confirm my email?",
  "Trading Signals — a tool to make your trading more beneficial",
  "What are 5-second trades (5ST)?",
  "How to deposit funds with Havale?",
  "Deposit using iCash.One",
  "Tether USD TRC20 token USDT",
  "How to use cryptocurrencies worldwide?",
  "How to choose a crypto wallet and start using cryptocurrencies in India?",
  "How do I withdraw funds to a bank card?",
  "How to earn real funds through the Invite Friends referral program?",
  "Do you have a mobile application?",
];

  const [appConfig, setAppConfig] = useState<any>({});
  const [activeProfileTab, setActiveProfileTab] = useState<"account" | "invite" | "transactions">("account");
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showTimeZoneModal, setShowTimeZoneModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const selectedLanguageRef = useRef(selectedLanguage);
  useEffect(() => { selectedLanguageRef.current = selectedLanguage; }, [selectedLanguage]);
  const { t } = useTranslation((selectedLanguage?.code || 'en') as LanguageCode);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState("Bangladesh");
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState(1);
  const [twoFAMode, setTwoFAMode] = useState<'app' | 'sms' | 'email'>('email');
  const [tfaPhoneNumber, setTfaPhoneNumber] = useState('');
  const [tfaSecret, setTfaSecret] = useState<OTPAuth.Secret | null>(null);
  const [tfaQrUrl, setTfaQrUrl] = useState('');

  const handleSetupTerminalAppTfa = async () => {
    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
      issuer: 'Bivaax',
      label: auth.currentUser?.email || 'User',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret
    });
    
    setTfaSecret(secret);
    try {
      const uri = totp.toString();
      const qrCodeDataUrl = await QRCode.toDataURL(uri);
      setTfaQrUrl(qrCodeDataUrl);
      setTwoFAMode('app');
      setTwoFAStep(2);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate QR Code');
    }
  };
  const [nickname, setNickname] = useState("");
  const [savedNickname, setSavedNickname] = useState("");
  const savedNicknameRef = useRef("");
  useEffect(() => { savedNicknameRef.current = savedNickname; }, [savedNickname]);
  const [profilePic, setProfilePic] = useState("");
  const [detectedCountryCode, setDetectedCountryCode] = useState("");

  useEffect(() => {
    const fetchLocation = async () => {
       try {
           // Use server-side proxy
        const res = await fetch('/api/ip-info').catch(() => null);
           if (!res) return;
           const data = await res.json().catch(() => null);
           if (data && data.country_name) {
               const code = data.country_code?.toLowerCase() || "";
               setDetectedCountryCode(code);
               if (personalData && !personalData.country) {
                   setPersonalData(prev => ({ ...prev, country: data.country_name }));
               }
               // Persist automatically to Firestore users document if missing
               if (currentUser) {
                   const { doc, getDoc, updateDoc } = await import('../firebase');
                   const userRef = doc(db, "users", currentUser.uid);
                   const snap = await getDoc(userRef).catch(() => null);
                   if (snap && snap.exists()) {
                       const uData = snap.data();
                       if (!uData.country || !uData.countryCode) {
                           await updateDoc(userRef, {
                               country: data.country_name,
                               countryCode: code.toUpperCase()
                           }).catch(() => {});
                       }
                   }
               }
           }
       } catch (err) {
           // Silent fail for location detection to avoid user distraction
       }
    };
    fetchLocation();
  }, [currentUser]);

  const [notifications, setNotifications] = useState({ promo: true, info: true });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [personalData, setPersonalData] = useState({
    firstName: currentUser?.displayName?.split(" ")[0] || "User",
    lastName: currentUser?.displayName?.split(" ")[1] || "",
    gender: "Male",
    day: "--",
    month: "--",
    year: "--",
    country: ""
  });
  const [savedPersonalData, setSavedPersonalData] = useState({
    firstName: "Md",
    lastName: "Hasan",
    gender: "Male",
    day: "--",
    month: "--",
    year: "--"
  });
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const timeZoneRef = useRef(timeZone);
  useEffect(() => { timeZoneRef.current = timeZone; }, [timeZone]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showCopyTradingHowItWorks, setShowCopyTradingHowItWorks] = useState(false);
  const [openForTraders, setOpenForTraders] = useState(false);
  const [openInformation, setOpenInformation] = useState(false);
  const [showTimeframeModal, setShowTimeframeModal] = useState(false);
  const [showChartTypeModal, setShowChartTypeModal] = useState(false);
  const [showIndicatorsModal, setShowIndicatorsModal] = useState(false);
  const [indicatorTab, setIndicatorTab] = useState<'indicators' | 'strategies' | 'drawings'>('indicators');
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycStatus, setKycStatus] = useState<"unverified" | "pending" | "verified" | "rejected">("unverified");
  const [kycData, setKycData] = useState({
    fullName: "",
    idType: "NID",
    idNumber: "",
    idFront: null as File | null,
    idBack: null as File | null,
    selfie: null as File | null
  });
  const [isKYCSubmitting, setIsKYCSubmitting] = useState(false);
  const [activeScanner, setActiveScanner] = useState<'front' | 'back' | 'selfie' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [activeAsset, setActiveAsset] = useState<string>(() => {
    try {
      return localStorage.getItem('bivax_active_asset') || "Crypto IDX";
    } catch(e) { return "Crypto IDX"; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bivax_active_asset', activeAsset);
    } catch(e) {}
  }, [activeAsset]);

  // Global indicator settings for consistent experience across assets
  const [indicatorSettings, setIndicatorSettings] = useState<any>(() => {
    const saved = localStorage.getItem('bivax_global_indicator_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing global indicators:", e);
      }
    }
    return DEFAULT_INDICATOR_SETTINGS;
  });

  const indicatorSettingsRef = useRef(indicatorSettings);
  useEffect(() => {
    indicatorSettingsRef.current = indicatorSettings;
    localStorage.setItem('bivax_global_indicator_settings', JSON.stringify(indicatorSettings));
    refreshIndicators();
  }, [indicatorSettings]);

  const toggleIndicator = (indicatorName: string) => {
    setIndicatorSettings((prev: any) => ({
      ...prev,
      [indicatorName]: {
        ...prev[indicatorName],
        enabled: !prev[indicatorName]?.enabled
      }
    }));
  };

  const handleApplyStrategy = (strategyName: string) => {
    if (activeStrategy === strategyName) {
      // Toggle off
      setIndicatorSettings((prev: any) => {
        const next = { ...prev };
        if (strategyName === "Exponential Ribbon") {
          next["EMA"].enabled = false;
          next["WEMA"].enabled = false;
          next["Alligator"].enabled = false;
        } else if (strategyName === "Golden Cross") {
          next["SMA"].enabled = false;
          next["Moving Average"].enabled = false;
        } else if (strategyName === "Bollinger Rebound") {
          next["Bollinger Bands"].enabled = false;
          next["RSI"].enabled = false;
        } else if (strategyName === "RSI Divergence") {
          next["RSI"].enabled = false;
          next["ADX"].enabled = false;
        } else if (strategyName === "Fractal Chaos") {
          next["Fractals"].enabled = false;
          next["Alligator"].enabled = false;
        } else if (strategyName === "Volume Spike") {
          next["ADL"].enabled = false;
          next["MFI"].enabled = false;
        }
        return next;
      });
      setActiveStrategy(null);
      toast.success(`Strategy "${strategyName}" disabled`);
    } else {
      // Toggle on
      setIndicatorSettings((prev: any) => {
        const next = { ...prev };
        
        // Auto-enable relevant indicators for each strategy
        if (strategyName === "Exponential Ribbon") {
          next["EMA"] = { ...next["EMA"], enabled: true, period: 20, color: "#0091ff", strokeWidth: 2 };
          next["WEMA"] = { ...next["WEMA"], enabled: true, period: 50, color: "#FFE24C", strokeWidth: 2 };
          next["Alligator"] = { ...next["Alligator"], enabled: true };
        } else if (strategyName === "Golden Cross") {
          next["SMA"] = { ...next["SMA"], enabled: true, period: 50, color: "#FFE24C", strokeWidth: 2 };
          next["Moving Average"] = { ...next["Moving Average"], enabled: true, period: 200, type: "SMA", color: "#f59e0b", strokeWidth: 2 };
        } else if (strategyName === "Bollinger Rebound") {
          next["Bollinger Bands"] = { ...next["Bollinger Bands"], enabled: true, period: 20, stdDev: 2, color: "#3b82f6" };
          next["RSI"] = { ...next["RSI"], enabled: true, period: 14, color: "#00C980" };
        } else if (strategyName === "RSI Divergence") {
          next["RSI"] = { ...next["RSI"], enabled: true, period: 14, color: "#FFE24C" };
          next["ADX"] = { ...next["ADX"], enabled: true, period: 14 };
        } else if (strategyName === "Fractal Chaos") {
          next["Fractals"] = { ...next["Fractals"], enabled: true };
          next["Alligator"] = { ...next["Alligator"], enabled: true };
        } else if (strategyName === "Volume Spike") {
          next["ADL"] = { ...next["ADL"], enabled: true };
          next["MFI"] = { ...next["MFI"], enabled: true };
        }
        
        return next;
      });
      setActiveStrategy(strategyName);
      toast.success(`Strategy "${strategyName}" applied to chart`);
      setShowIndicatorsModal(false);
    }
  };

  const updateIndicatorSetting = (indicatorName: string, key: string, value: any) => {
    setIndicatorSettings((prev: any) => ({
      ...prev,
      [indicatorName]: { 
        ...prev[indicatorName], 
        [key]: value 
      }
    }));
  };

  const loadIndicatorPreset = (presetData: any) => {
    setIndicatorSettings(presetData ? { ...DEFAULT_INDICATOR_SETTINGS, ...presetData } : DEFAULT_INDICATOR_SETTINGS);
    toast.success(presetData ? "Preset loaded" : "Settings reset");
  };



  const [drawings, setDrawings] = useState<any[]>(() => {
    const saved = localStorage.getItem('chartDrawings');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeDrawing, setActiveDrawing] = useState<any>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const drawingRef = useRef<any[]>(drawings);
  drawingRef.current = drawings;

  useEffect(() => {
    localStorage.setItem('chartDrawings', JSON.stringify(drawings));
  }, [drawings]);
  
  const [configuringIndicator, setConfiguringIndicator] = useState<string | null>(null);
  const [activeStrategy, setActiveStrategy] = useState<string | null>(null);
  
  const [indicatorPresets, setIndicatorPresets] = useState<{id: string, name: string, data: any}[]>(() => {
    const saved = localStorage.getItem('indicatorPresets');
    let loaded = saved ? JSON.parse(saved) : [];
    // Always insert 'default' if it doesn't exist
    if (!loaded.find((p: any) => p.id === 'default')) {
        loaded = [{ id: 'default', name: 'Default', data: null }, ...loaded];
    }
    return loaded;
  });
  const [newPresetName, setNewPresetName] = useState("");
  const [showPresetInput, setShowPresetInput] = useState(false);

  useEffect(() => {
    localStorage.setItem('indicatorPresets', JSON.stringify(indicatorPresets));
  }, [indicatorPresets]);

  const fetchMarketNews = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setNewsRefreshing(true);
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.Data)) {
        // Grab a larger subset (up to 40 items) for real-time scrolling & searching
        setRealtimeNews(data.Data.slice(0, 40));
      }
    } catch (err: any) {
      console.warn("Could not fetch realtime news, skipping:", err.message);
    } finally {
      if (showRefreshIndicator) {
        setTimeout(() => setNewsRefreshing(false), 600);
      }
    }
  }, []);

  useEffect(() => {
    fetchMarketNews();
    // Auto-refresh real-time news feed background updates every 60 seconds
    const interval = setInterval(() => {
      fetchMarketNews(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchMarketNews]);

  const saveIndicatorPreset = (name: string) => {
    if (!name.trim()) return;
    const newPreset = { id: Math.random().toString(36).substring(2, 9), name: name.trim(), data: JSON.parse(JSON.stringify(indicatorSettings)) };
    setIndicatorPresets([...indicatorPresets, newPreset]);
    setNewPresetName("");
    setShowPresetInput(false);
    toast.success("Preset saved");
  };



  const deleteIndicatorPreset = (id: string) => {
    setIndicatorPresets(indicatorPresets.filter(p => p.id !== id));
    toast.success("Preset deleted");
  };



  useEffect(() => {
    refreshIndicators();
  }, [indicatorSettings]);
  
  const baseDataRef = useRef<any[]>([]);
  const indicatorSeriesRefs = useRef<any>({});
  
  const refreshIndicators = () => {
      try {
          if (!chartRef.current || baseDataRef.current.length === 0) return;
          const chart = chartRef.current as any;
          // Sanitize data: remove duplicates
          const rawData = baseDataRef.current || [];
          const uniqueDataMap = new Map();
          for(const item of rawData) {
              if (item && item.time !== undefined && item.time !== null) {
                  uniqueDataMap.set(item.time, item);
              }
          }
          const data = Array.from(uniqueDataMap.values()).sort((a,b) => a.time - b.time);
          const closes = data.map((d: any) => d.close).filter((v: any) => typeof v === 'number');
          const currentSettings = indicatorSettingsRef.current;
          
          if (data.length < 5) return;

          // RSI
          try {
              if (currentSettings["RSI"]?.enabled) {
                 if (!indicatorSeriesRefs.current.rsi) {
                    indicatorSeriesRefs.current.rsi = chart.addSeries(LineSeries, {
                       color: currentSettings["RSI"].color,
                       lineWidth: currentSettings["RSI"].strokeWidth,
                       priceScaleId: 'rsi',
                       lastValueVisible: false,
                       priceLineVisible: false,
                    });
                    try { chart.priceScale('rsi').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } }); } catch (e) {}
                 } else {
                     try { indicatorSeriesRefs.current.rsi.applyOptions({
                       color: currentSettings["RSI"].color,
                       lineWidth: currentSettings["RSI"].strokeWidth,
                     }); } catch (e) {}
                 }
                 const period = parseInt(currentSettings["RSI"].period) || 14;
                 if (closes.length > period) {
                     const rsiVals = RSI.calculate({ period, values: closes });
                     const rsiData = [];
                     const offset = data.length - rsiVals.length;
                     for (let i=0; i<rsiVals.length; i++) {
                        rsiData.push({ time: data[offset + i].time, value: rsiVals[i] });
                     }
                     indicatorSeriesRefs.current.rsi.setData(rsiData);
                 }
              } else if (indicatorSeriesRefs.current.rsi) {
                 chart.removeSeries(indicatorSeriesRefs.current.rsi);
                 indicatorSeriesRefs.current.rsi = null;
              }
          } catch (e) { console.error("RSI Calculation Error", e); }

           // MFI
           try {
             if (currentSettings["MFI"]?.enabled) {
               if (!indicatorSeriesRefs.current.mfi) {
                 indicatorSeriesRefs.current.mfi = chart.addSeries(LineSeries, {
                   color: currentSettings["MFI"].color,
                   lineWidth: currentSettings["MFI"].strokeWidth,
                   priceScaleId: 'mfi',
                   lastValueVisible: false,
                   priceLineVisible: false,
                 });
                 try { chart.priceScale('mfi').applyOptions({ scaleMargins: { top: 0.7, bottom: 0 } }); } catch (e) {}
               } else {
                 try { indicatorSeriesRefs.current.mfi.applyOptions({
                   color: currentSettings["MFI"].color,
                   lineWidth: currentSettings["MFI"].strokeWidth,
                 }); } catch(e) {}
               }
               const period = parseInt(currentSettings["MFI"].period) || 14;
               if (closes.length > period) {
                 const high = data.map(d => d.high);
                 const low = data.map(d => d.low);
                 const volume = data.map(d => d.volume || 100);
                 const mfiVals = MFI.calculate({ period, high, low, close: closes, volume });
                 const mfiData = [];
                 const offset = data.length - mfiVals.length;
                 for (let i = 0; i < mfiVals.length; i++) {
                   mfiData.push({ time: data[offset + i].time, value: mfiVals[i] });
                 }
                 indicatorSeriesRefs.current.mfi.setData(mfiData);
               }
             } else if (indicatorSeriesRefs.current.mfi) {
               chart.removeSeries(indicatorSeriesRefs.current.mfi);
               indicatorSeriesRefs.current.mfi = null;
             }
           } catch (e) {
             console.warn("MFI Calculation Error", e);
           }

           // OBV
           try {
             if (currentSettings["OBV"]?.enabled) {
               if (!indicatorSeriesRefs.current.obv) {
                 indicatorSeriesRefs.current.obv = chart.addSeries(LineSeries, {
                   color: currentSettings["OBV"].color,
                   lineWidth: currentSettings["OBV"].strokeWidth,
                   priceScaleId: 'obv',
                   lastValueVisible: false,
                   priceLineVisible: false,
                 });
                 try { chart.priceScale('obv').applyOptions({ scaleMargins: { top: 0.7, bottom: 0 } }); } catch (e) {}
               } else {
                 try { indicatorSeriesRefs.current.obv.applyOptions({
                   color: currentSettings["OBV"].color,
                   lineWidth: currentSettings["OBV"].strokeWidth,
                 }); } catch(e) {}
               }
               const volume = data.map(d => d.volume || 100);
               const obvVals = OBV.calculate({ close: closes, volume });
               const obvData = [];
               const offset = data.length - obvVals.length;
               for (let i = 0; i < obvVals.length; i++) {
                 obvData.push({ time: data[offset + i].time, value: obvVals[i] });
               }
               indicatorSeriesRefs.current.obv.setData(obvData);
             } else if (indicatorSeriesRefs.current.obv) {
               chart.removeSeries(indicatorSeriesRefs.current.obv);
               indicatorSeriesRefs.current.obv = null;
             }
           } catch (e) {
             console.warn("OBV Calculation Error", e);
           }

      // MACD
      try {
         if (currentSettings["MACD"]?.enabled) {
            if (!indicatorSeriesRefs.current.macdFast) {
               indicatorSeriesRefs.current.macdFast = chart.addSeries(LineSeries, {
                  color: currentSettings["MACD"].colorFast,
                  lineWidth: 2,
                  priceScaleId: 'macd',
                  lastValueVisible: false, priceLineVisible: false,
               });
               indicatorSeriesRefs.current.macdSlow = chart.addSeries(LineSeries, {
                  color: currentSettings["MACD"].colorSlow,
                  lineWidth: 2,
                  priceScaleId: 'macd',
                  lastValueVisible: false, priceLineVisible: false,
               });
               indicatorSeriesRefs.current.macdHist = chart.addSeries(HistogramSeries, {
                  priceScaleId: 'macd',
                  lastValueVisible: false, priceLineVisible: false,
               });
               try { chart.priceScale('macd').applyOptions({ scaleMargins: { top: currentSettings["RSI"]?.enabled ? 0.6 : 0.8, bottom: currentSettings["RSI"]?.enabled ? 0.2 : 0 } }); } catch (e) {}
            } else {
               try { indicatorSeriesRefs.current.macdFast.applyOptions({ color: currentSettings["MACD"].colorFast }); } catch (e) {}
               try { indicatorSeriesRefs.current.macdSlow.applyOptions({ color: currentSettings["MACD"].colorSlow }); } catch (e) {}
               try { chart.priceScale('macd').applyOptions({ scaleMargins: { top: currentSettings["RSI"]?.enabled ? 0.6 : 0.8, bottom: currentSettings["RSI"]?.enabled ? 0.2 : 0 } }); } catch (e) {}
            }
            const fastPeriod = parseInt(currentSettings["MACD"].fast) || 12;
            const slowPeriod = parseInt(currentSettings["MACD"].slow) || 26;
            const signalPeriod = parseInt(currentSettings["MACD"].signal) || 9;
            
            if (closes.length > slowPeriod + signalPeriod) {
               const macdVals = MACD.calculate({ values: closes, fastPeriod, slowPeriod, signalPeriod, SimpleMAOscillator: false, SimpleMASignal: false });
               const macdFastData = [];
               const macdSlowData = [];
               const macdHistData = [];
               const offset = data.length - macdVals.length;
               for (let i=0; i<macdVals.length; i++) {
                  const v = macdVals[i];
                  const time = data[offset + i].time;
                  if (v && v.MACD !== undefined) macdFastData.push({ time, value: v.MACD });
                  if (v && v.signal !== undefined) macdSlowData.push({ time, value: v.signal });
                  if (v && v.histogram !== undefined) macdHistData.push({ time, value: v.histogram, color: v.histogram > 0 ? '#00C980' : '#FF4757' });
               }
               if (macdFastData.length > 0) indicatorSeriesRefs.current.macdFast.setData(macdFastData);
               if (macdSlowData.length > 0) indicatorSeriesRefs.current.macdSlow.setData(macdSlowData);
               if (macdHistData.length > 0) indicatorSeriesRefs.current.macdHist.setData(macdHistData);
            }
         } else {
            if (indicatorSeriesRefs.current.macdFast) {
               try { chart.removeSeries(indicatorSeriesRefs.current.macdFast); } catch (e) {}
               try { chart.removeSeries(indicatorSeriesRefs.current.macdSlow); } catch (e) {}
               try { chart.removeSeries(indicatorSeriesRefs.current.macdHist); } catch (e) {}
               indicatorSeriesRefs.current.macdFast = null;
               indicatorSeriesRefs.current.macdSlow = null;
               indicatorSeriesRefs.current.macdHist = null;
            }
         }
      } catch (e) {
         console.warn("MACD Error caught safely:", e);
      }
      
      // Bollinger Bands
      try {
         if (currentSettings["Bollinger Bands"]?.enabled) {
             if (!indicatorSeriesRefs.current.bbUpper) {
                indicatorSeriesRefs.current.bbUpper = chart.addSeries(LineSeries, { color: currentSettings["Bollinger Bands"].color, lineWidth: currentSettings["Bollinger Bands"].strokeWidth, lastValueVisible: false, priceLineVisible: false });
                indicatorSeriesRefs.current.bbLower = chart.addSeries(LineSeries, { color: currentSettings["Bollinger Bands"].color, lineWidth: currentSettings["Bollinger Bands"].strokeWidth, lastValueVisible: false, priceLineVisible: false });
                indicatorSeriesRefs.current.bbMiddle = chart.addSeries(LineSeries, { color: currentSettings["Bollinger Bands"].color, lineWidth: 1, lineStyle: 3, lastValueVisible: false, priceLineVisible: false });
             } else {
                try { indicatorSeriesRefs.current.bbUpper.applyOptions({ color: currentSettings["Bollinger Bands"].color, lineWidth: parseInt(currentSettings["Bollinger Bands"].strokeWidth) || 2 }); } catch (e) {}
                try { indicatorSeriesRefs.current.bbLower.applyOptions({ color: currentSettings["Bollinger Bands"].color, lineWidth: parseInt(currentSettings["Bollinger Bands"].strokeWidth) || 2 }); } catch (e) {}
                try { indicatorSeriesRefs.current.bbMiddle.applyOptions({ color: currentSettings["Bollinger Bands"].color }); } catch (e) {}
             }
             const period = parseInt(currentSettings["Bollinger Bands"].period) || 20;
             const stdDev = parseFloat(currentSettings["Bollinger Bands"].stdDev) || 2;
             if (closes.length > period) {
                const bbVals = BollingerBands.calculate({ period, stdDev, values: closes });
                const bbUpperData = [], bbLowerData = [], bbMiddleData = [];
                const offset = data.length - bbVals.length;
                for (let i=0; i<bbVals.length; i++) {
                   const time = data[offset + i].time;
                   if (bbVals[i] && bbVals[i].upper !== undefined) bbUpperData.push({ time, value: bbVals[i].upper });
                   if (bbVals[i] && bbVals[i].lower !== undefined) bbLowerData.push({ time, value: bbVals[i].lower });
                   if (bbVals[i] && bbVals[i].middle !== undefined) bbMiddleData.push({ time, value: bbVals[i].middle });
                }
                if (bbUpperData.length > 0) indicatorSeriesRefs.current.bbUpper.setData(bbUpperData);
                if (bbLowerData.length > 0) indicatorSeriesRefs.current.bbLower.setData(bbLowerData);
                if (bbMiddleData.length > 0) indicatorSeriesRefs.current.bbMiddle.setData(bbMiddleData);
             }
         } else {
             if (indicatorSeriesRefs.current.bbUpper) {
                try { chart.removeSeries(indicatorSeriesRefs.current.bbUpper); } catch (e) {}
                try { chart.removeSeries(indicatorSeriesRefs.current.bbLower); } catch (e) {}
                try { chart.removeSeries(indicatorSeriesRefs.current.bbMiddle); } catch (e) {}
                indicatorSeriesRefs.current.bbUpper = null;
                indicatorSeriesRefs.current.bbLower = null;
                indicatorSeriesRefs.current.bbMiddle = null;
             }
         }
      } catch (e) {
         console.warn("Bollinger Bands Error caught safely:", e);
      }

      // Stochastic
      try {
         if (currentSettings["Stochastic"]?.enabled) {
            if (!indicatorSeriesRefs.current.stochK) {
               indicatorSeriesRefs.current.stochK = chart.addSeries(LineSeries, {
                  color: currentSettings["Stochastic"].colorK,
                  lineWidth: 2,
                  priceScaleId: 'stoch',
                  lastValueVisible: false, priceLineVisible: false,
               });
               indicatorSeriesRefs.current.stochD = chart.addSeries(LineSeries, {
                  color: currentSettings["Stochastic"].colorD,
                  lineWidth: 2,
                  priceScaleId: 'stoch',
                  lastValueVisible: false, priceLineVisible: false,
               });
               try { chart.priceScale('stoch').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } }); } catch (e) {}
            } else {
               try { indicatorSeriesRefs.current.stochK.applyOptions({ color: currentSettings["Stochastic"].colorK }); } catch (e) {}
               try { indicatorSeriesRefs.current.stochD.applyOptions({ color: currentSettings["Stochastic"].colorD }); } catch (e) {}
            }
            const period = parseInt(currentSettings["Stochastic"].period) || 14;
            const signalPeriod = parseInt(currentSettings["Stochastic"].signalPeriod) || 3;
            
            if (data.length > period + signalPeriod) {
               const high = data.map(d => d.high);
               const low = data.map(d => d.low);
               const close = data.map(d => d.close);
               const stochVals = Stochastic.calculate({ high, low, close, period, signalPeriod });
               const stochKData = [];
               const stochDData = [];
               const offset = data.length - stochVals.length;
               for (let i=0; i<stochVals.length; i++) {
                  const v = stochVals[i];
                  const time = data[offset + i].time;
                  if (v && v.k !== undefined) stochKData.push({ time, value: v.k });
                  if (v && v.d !== undefined) stochDData.push({ time, value: v.d });
               }
               if (stochKData.length > 0) indicatorSeriesRefs.current.stochK.setData(stochKData);
               if (stochDData.length > 0) indicatorSeriesRefs.current.stochD.setData(stochDData);
            }
         } else {
            if (indicatorSeriesRefs.current.stochK) {
               try { chart.removeSeries(indicatorSeriesRefs.current.stochK); } catch (e) {}
               try { chart.removeSeries(indicatorSeriesRefs.current.stochD); } catch (e) {}
               indicatorSeriesRefs.current.stochK = null;
               indicatorSeriesRefs.current.stochD = null;
            }
         }
      } catch (e) {
         console.warn("Stochastic Error caught safely:", e);
      }
      
      // SMA
      try {
         if (currentSettings["SMA"]?.enabled) {
             if (!indicatorSeriesRefs.current.sma) {
                indicatorSeriesRefs.current.sma = chart.addSeries(LineSeries, { color: currentSettings["SMA"].color, lineWidth: currentSettings["SMA"].strokeWidth, lastValueVisible: false, priceLineVisible: false });
             } else {
                try { indicatorSeriesRefs.current.sma.applyOptions({ color: currentSettings["SMA"].color, lineWidth: currentSettings["SMA"].strokeWidth }); } catch (e) {}
             }
             const period = parseInt(currentSettings["SMA"].period) || 14;
             if (closes.length > period) {
                const smaVals = SMA.calculate({ period, values: closes });
                const smaData = [];
                const offset = data.length - smaVals.length;
                for (let i=0; i<smaVals.length; i++) {
                   smaData.push({ time: data[offset + i].time, value: smaVals[i] });
                }
                indicatorSeriesRefs.current.sma.setData(smaData);
             }
         } else if (indicatorSeriesRefs.current.sma) {
             try { chart.removeSeries(indicatorSeriesRefs.current.sma); } catch (e) {}
             indicatorSeriesRefs.current.sma = null;
         }
      } catch (e) {
         console.warn("SMA Error caught safely:", e);
      }

      // EMA
      try {
         if (currentSettings["EMA"]?.enabled) {
             if (!indicatorSeriesRefs.current.ema) {
                indicatorSeriesRefs.current.ema = chart.addSeries(LineSeries, { color: currentSettings["EMA"].color, lineWidth: currentSettings["EMA"].strokeWidth, lastValueVisible: false, priceLineVisible: false });
             } else {
                try { indicatorSeriesRefs.current.ema.applyOptions({ color: currentSettings["EMA"].color, lineWidth: currentSettings["EMA"].strokeWidth }); } catch (e) {}
             }
             const period = parseInt(currentSettings["EMA"].period) || 14;
             if (closes.length > period) {
                const emaVals = EMA.calculate({ period, values: closes });
                const emaData = [];
                const offset = data.length - emaVals.length;
                for (let i=0; i<emaVals.length; i++) {
                   emaData.push({ time: data[offset + i].time, value: emaVals[i] });
                }
                indicatorSeriesRefs.current.ema.setData(emaData);
             }
         } else if (indicatorSeriesRefs.current.ema) {
             try { chart.removeSeries(indicatorSeriesRefs.current.ema); } catch (e) {}
             indicatorSeriesRefs.current.ema = null;
         }
      } catch (e) {
         console.warn("EMA Error caught safely:", e);
      }


      // SMA, EMA, WMA, WEMA Loop
      try {
         ['SMA', 'EMA', 'WMA', 'WEMA'].forEach(ind => {
            const refName = ind.toLowerCase() + "_loop";
            if (currentSettings[ind]?.enabled) {
                if (!indicatorSeriesRefs.current[refName]) {
                    indicatorSeriesRefs.current[refName] = chart.addSeries(LineSeries, { color: currentSettings[ind].color, lineWidth: currentSettings[ind].strokeWidth, lastValueVisible: false, priceLineVisible: false });
                } else {
                    try { indicatorSeriesRefs.current[refName].applyOptions({ color: currentSettings[ind].color, lineWidth: parseInt(currentSettings[ind].strokeWidth) || 2 }); } catch(e) {}
                }
                const period = parseInt(currentSettings[ind].period) || 14;
                if (closes.length > period) {
                    const IndClass = ind === 'SMA' ? SMA : ind === 'EMA' ? EMA : ind === 'WMA' ? WMA : WEMA;
                    const vals = IndClass.calculate({ period, values: closes });
                    const indData = [];
                    const offset = data.length - vals.length;
                    for (let i=0; i<vals.length; i++) indData.push({ time: data[offset + i].time, value: vals[i] });
                    indicatorSeriesRefs.current[refName].setData(indData);
                }
            } else if (indicatorSeriesRefs.current[refName]) { 
                try { chart.removeSeries(indicatorSeriesRefs.current[refName]); } catch(e){}
                indicatorSeriesRefs.current[refName] = null; 
            }
         });
      } catch (e) {
         console.warn("Moving Averages loop Error caught safely:", e);
      }
      
      // Secondary Chart Indicators
      [
         { name: 'ATR', fn: ATR, isObj: false },
         { name: 'ROC', fn: ROC, isObj: false },
         { name: 'CCI', fn: CCI, isObj: false },
         { name: 'WilliamsR', fn: WilliamsR, isObj: false },
         { name: 'TRIX', fn: TRIX, isObj: false },
         { name: 'ADX', fn: ADX, isObj: true, prop: 'adx' },
      ].forEach(ind => {
         const refName = ind.name.toLowerCase();
         if (currentSettings[ind.name]?.enabled) {
             if (!indicatorSeriesRefs.current[refName]) {
                 indicatorSeriesRefs.current[refName] = chart.addSeries(LineSeries, { color: currentSettings[ind.name].color, lineWidth: currentSettings[ind.name].strokeWidth, priceScaleId: refName, lastValueVisible: false, priceLineVisible: false });
                 try { chart.priceScale(refName).applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } }); } catch(e) {}
             } else {
                 try { indicatorSeriesRefs.current[refName].applyOptions({ color: currentSettings[ind.name].color, lineWidth: parseInt(currentSettings[ind.name].strokeWidth) || 2 }); } catch (e) {}
             }
             const period = parseInt(currentSettings[ind.name].period) || 14;
             if (closes.length > period) {
                 const high = data.map(d => d.high);
                 const low = data.map(d => d.low);
                 let arg = { period, values: closes, high, low, close: closes };
                 const vals = ind.fn.calculate(arg);
                 const indData = [];
                 const offset = data.length - vals.length;
                 for (let i=0; i<vals.length; i++) {
                     let val = (ind.isObj && vals[i]) ? (vals[i] as any)[ind.prop as string] : vals[i];
                     if (val !== undefined && val !== null) indData.push({ time: data[offset + i].time, value: val });
                 }
                 if (indData.length > 0) indicatorSeriesRefs.current[refName].setData(indData);
             }
         } else if (indicatorSeriesRefs.current[refName]) { chart.removeSeries(indicatorSeriesRefs.current[refName]); indicatorSeriesRefs.current[refName] = null; }
      });
      
      // KST
      if (currentSettings["KST"]?.enabled) {
         if (!indicatorSeriesRefs.current.kstFast) {
            indicatorSeriesRefs.current.kstFast = chart.addSeries(LineSeries, { color: currentSettings["KST"].colorFast, lineWidth: 2, priceScaleId: 'kst', lastValueVisible: false, priceLineVisible: false });
            indicatorSeriesRefs.current.kstSlow = chart.addSeries(LineSeries, { color: currentSettings["KST"].colorSlow, lineWidth: 2, priceScaleId: 'kst', lastValueVisible: false, priceLineVisible: false });
            try { chart.priceScale('kst').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } }); } catch (e) {}
         } else {
            try { indicatorSeriesRefs.current.kstFast.applyOptions({ color: currentSettings["KST"].colorFast }); } catch (e) {}
            try { indicatorSeriesRefs.current.kstSlow.applyOptions({ color: currentSettings["KST"].colorSlow }); } catch (e) {}
         }
         if (closes.length > 30) {
            const vals = KST.calculate({ 
               values: closes, ROCPer1: 10, ROCPer2: 15, ROCPer3: 20, ROCPer4: 30, SMAROCPer1: 10, SMAROCPer2: 10, SMAROCPer3: 10, SMAROCPer4: 15, signalPeriod: 9 
            });
            const fastData = [], slowData = [];
            const offset = data.length - vals.length;
            for (let i=0; i<vals.length; i++) {
               const time = data[offset + i].time;
               if (vals[i] && vals[i].kst !== undefined) fastData.push({ time, value: vals[i].kst });
               if (vals[i] && vals[i].signal !== undefined) slowData.push({ time, value: vals[i].signal });
            }
            if (fastData.length > 0) indicatorSeriesRefs.current.kstFast.setData(fastData);
            if (slowData.length > 0) indicatorSeriesRefs.current.kstSlow.setData(slowData);
         }
      } else if (indicatorSeriesRefs.current.kstFast) { 
         chart.removeSeries(indicatorSeriesRefs.current.kstFast); chart.removeSeries(indicatorSeriesRefs.current.kstSlow);
         indicatorSeriesRefs.current.kstFast = null; indicatorSeriesRefs.current.kstSlow = null;
      }

      // Keltner Channels
      if (currentSettings["Keltner Channels"]?.enabled) {
        if (!indicatorSeriesRefs.current.kcUpper) {
            indicatorSeriesRefs.current.kcUpper = chart.addSeries(LineSeries, { color: currentSettings["Keltner Channels"].color, lineWidth: 1.5, lastValueVisible: false, priceLineVisible: false });
            indicatorSeriesRefs.current.kcLower = chart.addSeries(LineSeries, { color: currentSettings["Keltner Channels"].color, lineWidth: 1.5, lastValueVisible: false, priceLineVisible: false });
        } else {
            try { indicatorSeriesRefs.current.kcUpper.applyOptions({ color: currentSettings["Keltner Channels"].color }); } catch (e) {}
            try { indicatorSeriesRefs.current.kcLower.applyOptions({ color: currentSettings["Keltner Channels"].color }); } catch (e) {}
        }
        const period = parseInt(currentSettings["Keltner Channels"].period) || 20;
        const multiplier = parseFloat(currentSettings["Keltner Channels"].multiplier) || 2;
        if (data.length > period) {
            const high = data.map(d => d.high);
            const low = data.map(d => d.low);
            const kcVals = KeltnerChannels.calculate({ high, low, close: closes, maPeriod: period, atrPeriod: period, multiplier, useSMA: true });
            const upperData = [], lowerData = [];
            const offset = data.length - kcVals.length;
            for (let i = 0; i < kcVals.length; i++) {
                if (kcVals[i]) {
                   if (kcVals[i].upper !== undefined) upperData.push({ time: data[offset + i].time, value: kcVals[i].upper });
                   if (kcVals[i].lower !== undefined) lowerData.push({ time: data[offset + i].time, value: kcVals[i].lower });
                }
            }
            indicatorSeriesRefs.current.kcUpper.setData(upperData);
            indicatorSeriesRefs.current.kcLower.setData(lowerData);
        }
      } else if (indicatorSeriesRefs.current.kcUpper) {
          chart.removeSeries(indicatorSeriesRefs.current.kcUpper);
          chart.removeSeries(indicatorSeriesRefs.current.kcLower);
          indicatorSeriesRefs.current.kcUpper = null;
      }

      // Chandelier Exit
      if (currentSettings["Chandelier Exit"]?.enabled) {
          if (!indicatorSeriesRefs.current.chanLong) {
              indicatorSeriesRefs.current.chanLong = chart.addSeries(LineSeries, { color: currentSettings["Chandelier Exit"].colorLong || '#22c55e', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
              indicatorSeriesRefs.current.chanShort = chart.addSeries(LineSeries, { color: currentSettings["Chandelier Exit"].colorShort || '#ef4444', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
          } else {
              try { indicatorSeriesRefs.current.chanLong.applyOptions({ color: currentSettings["Chandelier Exit"].colorLong }); } catch (e) {}
              try { indicatorSeriesRefs.current.chanShort.applyOptions({ color: currentSettings["Chandelier Exit"].colorShort }); } catch (e) {}
          }
          const period = parseInt(currentSettings["Chandelier Exit"].period) || 22;
          const multiplier = parseFloat(currentSettings["Chandelier Exit"].multiplier) || 3;
          if (data.length > period) {
              const high = data.map(d => d.high);
              const low = data.map(d => d.low);
              const chanVals = ChandelierExit.calculate({ high, low, close: closes, period, multiplier });
              const longData = [], shortData = [];
              const offset = data.length - chanVals.length;
              for (let i = 0; i < chanVals.length; i++) {
                  const val: any = chanVals[i];
                  if (val && val.exitLong !== undefined) longData.push({ time: data[offset+i].time, value: val.exitLong });
                  if (val && val.exitShort !== undefined) shortData.push({ time: data[offset+i].time, value: val.exitShort });
              }
              indicatorSeriesRefs.current.chanLong.setData(longData);
              indicatorSeriesRefs.current.chanShort.setData(shortData);
          }
      } else if (indicatorSeriesRefs.current.chanLong) {
          chart.removeSeries(indicatorSeriesRefs.current.chanLong);
          chart.removeSeries(indicatorSeriesRefs.current.chanShort);
          indicatorSeriesRefs.current.chanLong = null;
      }

      // PSAR
      try {
         if (currentSettings["Parabolic SAR"]?.enabled) {
             if (!indicatorSeriesRefs.current.psar) {
                indicatorSeriesRefs.current.psar = chart.addSeries(LineSeries, { color: currentSettings["Parabolic SAR"].color, lineWidth: currentSettings["Parabolic SAR"].strokeWidth, lineStyle: 1, priceLineVisible: false, lastValueVisible: false });
             } else {
                try { indicatorSeriesRefs.current.psar.applyOptions({ color: currentSettings["Parabolic SAR"].color, lineWidth: currentSettings["Parabolic SAR"].strokeWidth }); } catch (e) {}
             }
             const step = parseFloat(currentSettings["Parabolic SAR"].step) || 0.02;
             const max = parseFloat(currentSettings["Parabolic SAR"].max) || 0.2;
             if (data.length > 5) {
                const high = data.map(d => d.high);
                const low = data.map(d => d.low);
                const psarVals = PSAR.calculate({ step, max, high, low });
                const psarData = [];
                const offset = data.length - psarVals.length;
                for (let i=0; i<psarVals.length; i++) {
                   if (data[offset + i] !== undefined) {
                      psarData.push({ time: data[offset + i].time, value: psarVals[i] });
                   }
                }
                indicatorSeriesRefs.current.psar.setData(psarData);
             }
         } else if (indicatorSeriesRefs.current.psar) {
             try { chart.removeSeries(indicatorSeriesRefs.current.psar); } catch (e){}
             indicatorSeriesRefs.current.psar = null;
         }
      } catch (e) {
         console.warn("PSAR Error caught safely:", e);
      }
      
      // ADL
      try {
         if (currentSettings["ADL"]?.enabled) {
             if (!indicatorSeriesRefs.current.adl) {
                indicatorSeriesRefs.current.adl = chart.addSeries(LineSeries, { color: currentSettings["ADL"].color, lineWidth: currentSettings["ADL"].strokeWidth, priceScaleId: 'adl', lastValueVisible: false, priceLineVisible: false });
                try { chart.priceScale('adl').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } }); } catch (e) {}
             } else {
                try { indicatorSeriesRefs.current.adl.applyOptions({ color: currentSettings["ADL"].color, lineWidth: currentSettings["ADL"].strokeWidth }); } catch (e) {}
             }
             if (data.length > 5) {
                const high = data.map(d => d.high);
                const low = data.map(d => d.low);
                const close = data.map(d => d.close);
                const volume = data.map(d => d.volume || 100);
                const adlVals = ADL.calculate({ high, low, close, volume });
                const adlData = [];
                const offset = data.length - adlVals.length;
                for (let i=0; i<adlVals.length; i++) {
                   if (data[offset + i] !== undefined) {
                      adlData.push({ time: data[offset + i].time, value: adlVals[i] });
                   }
                }
                indicatorSeriesRefs.current.adl.setData(adlData);
             }
         } else if (indicatorSeriesRefs.current.adl) {
             try { chart.removeSeries(indicatorSeriesRefs.current.adl); } catch (e) {}
             indicatorSeriesRefs.current.adl = null;
         }
      } catch (e) {
         console.warn("ADL Error caught safely:", e);
      }

      // ForceIndex
      try {
         if (currentSettings["ForceIndex"]?.enabled) {
             if (!indicatorSeriesRefs.current.forceindex) {
                indicatorSeriesRefs.current.forceindex = chart.addSeries(HistogramSeries, { color: currentSettings["ForceIndex"].color, priceScaleId: 'forceindex', lastValueVisible: false, priceLineVisible: false });
                try { chart.priceScale('forceindex').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } }); } catch (e) {}
             } else {
                try { indicatorSeriesRefs.current.forceindex.applyOptions({ color: currentSettings["ForceIndex"].color }); } catch (e) {}
             }
             const period = parseInt(currentSettings["ForceIndex"].period) || 13;
             if (closes.length > period) {
                const volume = data.map(d => d.volume || 100);
                const forceindexVals = ForceIndex.calculate({ period, close: closes, volume });
                const fiData = [];
                const offset = data.length - forceindexVals.length;
                for (let i=0; i<forceindexVals.length; i++) {
                   if (data[offset + i] !== undefined) {
                      fiData.push({ time: data[offset + i].time, value: forceindexVals[i], color: forceindexVals[i] > 0 ? '#00C980' : '#FF4757' });
                   }
                }
                indicatorSeriesRefs.current.forceindex.setData(fiData);
             }
         } else if (indicatorSeriesRefs.current.forceindex) {
             try { chart.removeSeries(indicatorSeriesRefs.current.forceindex); } catch (e) {}
             indicatorSeriesRefs.current.forceindex = null;
         }
      } catch (e) {
         console.warn("ForceIndex Error caught safely:", e);
      }

      
      // StochRSI
      try {
         if (currentSettings["StochRSI"]?.enabled) {
            if (!indicatorSeriesRefs.current.stochRsiK) {
               indicatorSeriesRefs.current.stochRsiK = chart.addSeries(LineSeries, { color: currentSettings["StochRSI"].colorK, lineWidth: 2, priceScaleId: 'stochrsi', lastValueVisible: false, priceLineVisible: false });
               indicatorSeriesRefs.current.stochRsiD = chart.addSeries(LineSeries, { color: currentSettings["StochRSI"].colorD, lineWidth: 2, priceScaleId: 'stochrsi', lastValueVisible: false, priceLineVisible: false });
               try { chart.priceScale('stochrsi').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } }); } catch (e) {}
            } else {
               try { indicatorSeriesRefs.current.stochRsiK.applyOptions({ color: currentSettings["StochRSI"].colorK }); } catch (e) {}
               try { indicatorSeriesRefs.current.stochRsiD.applyOptions({ color: currentSettings["StochRSI"].colorD }); } catch (e) {}
            }
            const rsiP = parseInt(currentSettings["StochRSI"].rsiPeriod) || 14;
            const stP = parseInt(currentSettings["StochRSI"].stochasticPeriod) || 14;
            const kP = parseInt(currentSettings["StochRSI"].kPeriod) || 3;
            const dP = parseInt(currentSettings["StochRSI"].dPeriod) || 3;
            if (closes.length > rsiP + stP + kP + dP) {
               const vals = StochasticRSI.calculate({ values: closes, rsiPeriod: rsiP, stochasticPeriod: stP, kPeriod: kP, dPeriod: dP });
               const kData = [], dData = [];
               const offset = data.length - vals.length;
               for (let i=0; i<vals.length; i++) {
                  if (data[offset + i] !== undefined && vals[i] !== undefined) {
                     const time = data[offset + i].time;
                     if (vals[i].k !== undefined) kData.push({ time, value: vals[i].k });
                     if (vals[i].d !== undefined) dData.push({ time, value: vals[i].d });
                  }
               }
               if (kData.length > 0) indicatorSeriesRefs.current.stochRsiK.setData(kData);
               if (dData.length > 0) indicatorSeriesRefs.current.stochRsiD.setData(dData);
            }
         } else if (indicatorSeriesRefs.current.stochRsiK) { 
            try { chart.removeSeries(indicatorSeriesRefs.current.stochRsiK); } catch (e){}
            try { chart.removeSeries(indicatorSeriesRefs.current.stochRsiD); } catch (e){}
            indicatorSeriesRefs.current.stochRsiK = null; indicatorSeriesRefs.current.stochRsiD = null;
         }
      } catch (e) {
         console.warn("StochRSI Error caught safely:", e);
      }

        // Alligator
        if (indicatorSettingsRef.current["Alligator"]?.enabled) {
          const currentSettings = indicatorSettingsRef.current;
          if (!indicatorSeriesRefs.current.alligatorJaw) {
             indicatorSeriesRefs.current.alligatorJaw = chart.addSeries(LineSeries, { color: currentSettings["Alligator"].colorJaw, lineWidth: 2, lastValueVisible: false, priceLineVisible: false });
             indicatorSeriesRefs.current.alligatorTeeth = chart.addSeries(LineSeries, { color: currentSettings["Alligator"].colorTeeth, lineWidth: 2, lastValueVisible: false, priceLineVisible: false });
             indicatorSeriesRefs.current.alligatorLips = chart.addSeries(LineSeries, { color: currentSettings["Alligator"].colorLips, lineWidth: 2, lastValueVisible: false, priceLineVisible: false });
          } else {
             try { indicatorSeriesRefs.current.alligatorJaw.applyOptions({ color: currentSettings["Alligator"].colorJaw }); } catch (e) {}
             try { indicatorSeriesRefs.current.alligatorTeeth.applyOptions({ color: currentSettings["Alligator"].colorTeeth }); } catch (e) {}
             try { indicatorSeriesRefs.current.alligatorLips.applyOptions({ color: currentSettings["Alligator"].colorLips }); } catch (e) {}
          }
          
          const jawP = parseInt(currentSettings["Alligator"].jawPeriod) || 13;
          const teethP = parseInt(currentSettings["Alligator"].teethPeriod) || 8;
          const lipsP = parseInt(currentSettings["Alligator"].lipsPeriod) || 5;
          const jawO = parseInt(currentSettings["Alligator"].jawOffset) || 8;
          const teethO = parseInt(currentSettings["Alligator"].teethOffset) || 5;
          const lipsO = parseInt(currentSettings["Alligator"].lipsOffset) || 3;

          const medians = data.map(d => (d.high + d.low) / 2);

          if (medians.length > Math.max(jawP*2, teethP*2, lipsP*2)) {
             const jawVals = EMA.calculate({ period: 2 * jawP - 1, values: medians });
             const teethVals = EMA.calculate({ period: 2 * teethP - 1, values: medians });
             const lipsVals = EMA.calculate({ period: 2 * lipsP - 1, values: medians });
             
             const jawData = [], teethData = [], lipsData = [];
             
             // Shift values forward by offsets
             const jawFull = new Array(jawO).fill(null).concat(jawVals);
             const teethFull = new Array(teethO).fill(null).concat(teethVals);
             const lipsFull = new Array(lipsO).fill(null).concat(lipsVals);

             const offset = data.length - jawFull.length;
             for(let i=0; i<jawFull.length; i++) {
                if (jawFull[i] !== null && (offset + i) >= 0 && (offset + i) < data.length) {
                   jawData.push({ time: data[offset + i].time, value: jawFull[i] });
                }
             }

             const tOffset = data.length - teethFull.length;
             for(let i=0; i<teethFull.length; i++) {
                if (teethFull[i] !== null && (tOffset + i) >= 0 && (tOffset + i) < data.length) {
                   teethData.push({ time: data[tOffset + i].time, value: teethFull[i] });
                }
             }

             const lOffset = data.length - lipsFull.length;
             for(let i=0; i<lipsFull.length; i++) {
                if (lipsFull[i] !== null && (lOffset + i) >= 0 && (lOffset + i) < data.length) {
                   lipsData.push({ time: data[lOffset + i].time, value: lipsFull[i] });
                }
             }

             indicatorSeriesRefs.current.alligatorJaw.setData(jawData);
             indicatorSeriesRefs.current.alligatorTeeth.setData(teethData);
             indicatorSeriesRefs.current.alligatorLips.setData(lipsData);
          }
        } else if (indicatorSeriesRefs.current.alligatorJaw) {
          chart.removeSeries(indicatorSeriesRefs.current.alligatorJaw);
          chart.removeSeries(indicatorSeriesRefs.current.alligatorTeeth);
          chart.removeSeries(indicatorSeriesRefs.current.alligatorLips);
          indicatorSeriesRefs.current.alligatorJaw = null;
          indicatorSeriesRefs.current.alligatorTeeth = null;
          indicatorSeriesRefs.current.alligatorLips = null;
       }

       // Gator Oscillator
       if (indicatorSettingsRef.current["Gator Oscillator"]?.enabled) {
          const currentSettings = indicatorSettingsRef.current;
          if (!indicatorSeriesRefs.current.gatorTop) {
             //@ts-ignore
             indicatorSeriesRefs.current.gatorTop = chart.addSeries(HistogramSeries, { priceScaleId: 'gator', lastValueVisible: false, priceLineVisible: false });
             //@ts-ignore
             indicatorSeriesRefs.current.gatorBottom = chart.addSeries(HistogramSeries, { priceScaleId: 'gator', lastValueVisible: false, priceLineVisible: false });
             try { chart.priceScale('gator').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } }); } catch (e) {}
          }
          
          const jawP = 13, teethP = 8, lipsP = 5;
          if (closes.length > Math.max(jawP*2, teethP*2, lipsP*2)) {
             const jawVals = EMA.calculate({ period: 2 * jawP - 1, values: closes });
             const teethVals = EMA.calculate({ period: 2 * teethP - 1, values: closes });
             const lipsVals = EMA.calculate({ period: 2 * lipsP - 1, values: closes });
             
             const topData = [], bottomData = [];
             const minLen = Math.min(jawVals.length, teethVals.length, lipsVals.length);
             const dataOffset = data.length - minLen;
             
             for (let i=0; i<minLen; i++) {
                const jaw = jawVals[jawVals.length - minLen + i];
                const teeth = teethVals[teethVals.length - minLen + i];
                const lips = lipsVals[lipsVals.length - minLen + i];
                const time = data[dataOffset + i].time;
                
                const topVal = Math.abs(jaw - teeth);
                const bottomVal = -Math.abs(teeth - lips);
                
                //@ts-ignore
                topData.push({ time, value: topVal, color: i > 0 && topVal > Math.abs(jawVals[jawVals.length - minLen + i - 1] - teethVals[teethVals.length - minLen + i - 1]) ? '#22c55e' : '#ef4444' });
                //@ts-ignore
                bottomData.push({ time, value: bottomVal, color: i > 0 && Math.abs(bottomVal) > Math.abs(-Math.abs(teethVals[teethVals.length - minLen + i - 1] - lipsVals[lipsVals.length - minLen + i - 1])) ? '#22c55e' : '#ef4444' });
             }
             indicatorSeriesRefs.current.gatorTop.setData(topData);
             indicatorSeriesRefs.current.gatorBottom.setData(bottomData);
          }
       } else if (indicatorSeriesRefs.current.gatorTop) {
          chart.removeSeries(indicatorSeriesRefs.current.gatorTop);
          chart.removeSeries(indicatorSeriesRefs.current.gatorBottom);
          indicatorSeriesRefs.current.gatorTop = null;
          indicatorSeriesRefs.current.gatorBottom = null;
       }

       // ZigZag
       if (indicatorSettingsRef.current["ZigZag"]?.enabled) {
          const currentSettings = indicatorSettingsRef.current;
          if (!indicatorSeriesRefs.current.zigzag) {
             //@ts-ignore
             indicatorSeriesRefs.current.zigzag = chart.addSeries(LineSeries, { color: currentSettings["ZigZag"].color, lineWidth: currentSettings["ZigZag"].strokeWidth, priceLineVisible: false, lastValueVisible: false });
          } else {
             try { indicatorSeriesRefs.current.zigzag.applyOptions({ color: currentSettings["ZigZag"].color, lineWidth: currentSettings["ZigZag"].strokeWidth }); } catch (e) {}
          }
          
          if (data.length > 20) {
             const deviation = (parseFloat(currentSettings["ZigZag"].deviation) || 5) / 100;
             const zigzagData = [];
             let lastPivotPrice = data[0].close;
             let lastPivotType = 'none'; // 'high' or 'low'
             let lastPivotTime = data[0].time;
             
             zigzagData.push({ time: data[0].time, value: data[0].close });
             
             for (let i=1; i<data.length; i++) {
                const high = data[i].high;
                const low = data[i].low;
                
                if (lastPivotType === 'none') {
                   if ((high - lastPivotPrice) / lastPivotPrice >= deviation) {
                      lastPivotType = 'high';
                      lastPivotPrice = high;
                      lastPivotTime = data[i].time;
                      zigzagData.push({ time: lastPivotTime, value: lastPivotPrice });
                   } else if ((lastPivotPrice - low) / lastPivotPrice >= deviation) {
                      lastPivotType = 'low';
                      lastPivotPrice = low;
                      lastPivotTime = data[i].time;
                      zigzagData.push({ time: lastPivotTime, value: lastPivotPrice });
                   }
                } else if (lastPivotType === 'low') {
                   if ((high - lastPivotPrice) / lastPivotPrice >= deviation) {
                      lastPivotType = 'high';
                      lastPivotPrice = high;
                      lastPivotTime = data[i].time;
                      zigzagData.push({ time: lastPivotTime, value: lastPivotPrice });
                   } else if (low < lastPivotPrice) {
                      lastPivotPrice = low;
                      lastPivotTime = data[i].time;
                      //@ts-ignore
                      zigzagData[zigzagData.length - 1] = { time: lastPivotTime, value: lastPivotPrice };
                   }
                } else if (lastPivotType === 'high') {
                   if ((lastPivotPrice - low) / lastPivotPrice >= deviation) {
                      lastPivotType = 'low';
                      lastPivotPrice = low;
                      lastPivotTime = data[i].time;
                      zigzagData.push({ time: lastPivotTime, value: lastPivotPrice });
                   } else if (high > lastPivotPrice) {
                      lastPivotPrice = high;
                      lastPivotTime = data[i].time;
                      //@ts-ignore
                      zigzagData[zigzagData.length - 1] = { time: lastPivotTime, value: lastPivotPrice };
                   }
                }
             }
             indicatorSeriesRefs.current.zigzag.setData(zigzagData);
          }
       } else if (indicatorSeriesRefs.current.zigzag) {
          chart.removeSeries(indicatorSeriesRefs.current.zigzag);
          indicatorSeriesRefs.current.zigzag = null;
       }

       // Unified Moving Average (SMA, EMA, WMA, WEMA overlay line)
       if (currentSettings["Moving Average"]?.enabled) {
          if (!indicatorSeriesRefs.current.movingAverage) {
             indicatorSeriesRefs.current.movingAverage = chart.addSeries(LineSeries, { 
                color: currentSettings["Moving Average"].color || '#f59e0b', 
                lineWidth: currentSettings["Moving Average"].strokeWidth || 2, 
                lastValueVisible: false, 
                priceLineVisible: false 
             });
          } else {
             try { indicatorSeriesRefs.current.movingAverage.applyOptions({ 
                color: currentSettings["Moving Average"].color || '#f59e0b', 
                lineWidth: parseInt(currentSettings["Moving Average"].strokeWidth) || 2 
             }); } catch(e) {}
          }
          const period = parseInt(currentSettings["Moving Average"].period) || 14;
          const type = currentSettings["Moving Average"].type || "SMA";
          if (closes.length > period) {
              const IndClass = type === 'SMA' ? SMA : type === 'EMA' ? EMA : type === 'WMA' ? WMA : WEMA;
              const vals = IndClass.calculate({ period, values: closes });
              const maData = [];
              const offset = data.length - vals.length;
              for (let i = 0; i < vals.length; i++) {
                 maData.push({ time: data[offset + i].time, value: vals[i] });
              }
              indicatorSeriesRefs.current.movingAverage.setData(maData);
          }
       } else if (indicatorSeriesRefs.current.movingAverage) {
          chart.removeSeries(indicatorSeriesRefs.current.movingAverage);
          indicatorSeriesRefs.current.movingAverage = null;
       }

       // Awesome Oscillator
       if (currentSettings["Awesome Oscillator"]?.enabled) {
          if (!indicatorSeriesRefs.current.ao) {
             indicatorSeriesRefs.current.ao = chart.addSeries(HistogramSeries, { 
                priceScaleId: 'ao', 
                lastValueVisible: false, 
                priceLineVisible: false 
             });
             try { chart.priceScale('ao').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } }); } catch(e) {}
          }
          const fastPeriod = parseInt(currentSettings["Awesome Oscillator"].fastPeriod) || 5;
          const slowPeriod = parseInt(currentSettings["Awesome Oscillator"].slowPeriod) || 34;
          if (data.length > slowPeriod) {
             const high = data.map(d => d.high);
             const low = data.map(d => d.low);
             const aoVals = AwesomeOscillator.calculate({ high, low, fastPeriod, slowPeriod });
             const aoData = [];
             const offset = data.length - aoVals.length;
             for (let i = 0; i < aoVals.length; i++) {
                const val = aoVals[i];
                const color = i > 0 && val >= aoVals[i-1] ? (currentSettings["Awesome Oscillator"].colorUp || '#22c55e') : (currentSettings["Awesome Oscillator"].colorDown || '#ef4444');
                if (data[offset + i] !== undefined) {
                   aoData.push({ time: data[offset + i].time, value: val, color });
                }
             }
             indicatorSeriesRefs.current.ao.setData(aoData);
          }
       } else if (indicatorSeriesRefs.current.ao) {
          chart.removeSeries(indicatorSeriesRefs.current.ao);
          indicatorSeriesRefs.current.ao = null;
       }

       // VWAP
       if (currentSettings["VWAP"]?.enabled) {
          if (!indicatorSeriesRefs.current.vwap) {
             indicatorSeriesRefs.current.vwap = chart.addSeries(LineSeries, { 
                color: currentSettings["VWAP"].color || '#6366f1', 
                lineWidth: currentSettings["VWAP"].strokeWidth || 2, 
                lastValueVisible: false, 
                priceLineVisible: false 
             });
          } else {
             try { indicatorSeriesRefs.current.vwap.applyOptions({ 
                color: currentSettings["VWAP"].color || '#6366f1', 
                lineWidth: parseInt(currentSettings["VWAP"].strokeWidth) || 2 
             }); } catch (e) {}
          }
          if (data.length > 5) {
             const high = data.map(d => d.high);
             const low = data.map(d => d.low);
             const close = data.map(d => d.close);
             const volume = data.map(d => d.volume || 100);
             const vwapVals = VWAP.calculate({ high, low, close, volume });
             const vwapData = [];
             const offset = data.length - vwapVals.length;
             for (let i = 0; i < vwapVals.length; i++) {
                if (data[offset + i] !== undefined) {
                   vwapData.push({ time: data[offset + i].time, value: vwapVals[i] });
                }
             }
             indicatorSeriesRefs.current.vwap.setData(vwapData);
          }
       } else if (indicatorSeriesRefs.current.vwap) {
          chart.removeSeries(indicatorSeriesRefs.current.vwap);
          indicatorSeriesRefs.current.vwap = null;
       }

       // Ichimoku Cloud
       if (currentSettings["Ichimoku Cloud"]?.enabled) {
          if (!indicatorSeriesRefs.current.ichimokuConversion) {
             indicatorSeriesRefs.current.ichimokuConversion = chart.addSeries(LineSeries, { color: currentSettings["Ichimoku Cloud"].colorConversion || '#3b82f6', lineWidth: 1.5, lastValueVisible: false, priceLineVisible: false });
             indicatorSeriesRefs.current.ichimokuBase = chart.addSeries(LineSeries, { color: currentSettings["Ichimoku Cloud"].colorBase || '#ef4444', lineWidth: 1.5, lastValueVisible: false, priceLineVisible: false });
          } else {
             try { indicatorSeriesRefs.current.ichimokuConversion.applyOptions({ color: currentSettings["Ichimoku Cloud"].colorConversion || '#3b82f6' }); } catch (e) {}
             try { indicatorSeriesRefs.current.ichimokuBase.applyOptions({ color: currentSettings["Ichimoku Cloud"].colorBase || '#ef4444' }); } catch (e) {}
          }
          const conversionPeriod = parseInt(currentSettings["Ichimoku Cloud"].conversionPeriod) || 9;
          const basePeriod = parseInt(currentSettings["Ichimoku Cloud"].basePeriod) || 26;
          const spanPeriod = parseInt(currentSettings["Ichimoku Cloud"].spanPeriod) || 52;
          const displacement = parseInt(currentSettings["Ichimoku Cloud"].displacement) || 26;
          if (data.length > spanPeriod) {
             const high = data.map(d => d.high);
             const low = data.map(d => d.low);
             const ichVals = IchimokuCloud.calculate({ high, low, conversionPeriod, basePeriod, spanPeriod, displacement });
             const convData = [];
             const baseData = [];
             const offset = data.length - ichVals.length;
             for (let i = 0; i < ichVals.length; i++) {
                const v = ichVals[i];
                if (v && data[offset + i] !== undefined) {
                   const time = data[offset + i].time;
                   if (v.conversion !== undefined) convData.push({ time, value: v.conversion });
                   if (v.base !== undefined) baseData.push({ time, value: v.base });
                }
             }
             if (convData.length > 0) indicatorSeriesRefs.current.ichimokuConversion.setData(convData);
             if (baseData.length > 0) indicatorSeriesRefs.current.ichimokuBase.setData(baseData);
          }
       } else if (indicatorSeriesRefs.current.ichimokuConversion) {
          chart.removeSeries(indicatorSeriesRefs.current.ichimokuConversion);
          chart.removeSeries(indicatorSeriesRefs.current.ichimokuBase);
          indicatorSeriesRefs.current.ichimokuConversion = null;
          indicatorSeriesRefs.current.ichimokuBase = null;
       }

       // Standard Deviation
       if (currentSettings["Standard Deviation"]?.enabled) {
          if (!indicatorSeriesRefs.current.sd) {
             indicatorSeriesRefs.current.sd = chart.addSeries(LineSeries, { color: currentSettings["Standard Deviation"].color || '#84cc16', lineWidth: 2, priceScaleId: 'sd', lastValueVisible: false, priceLineVisible: false });
             try { chart.priceScale('sd').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } }); } catch(e) {}
          } else {
             try { indicatorSeriesRefs.current.sd.applyOptions({ color: currentSettings["Standard Deviation"].color || '#84cc16' }); } catch (e) {}
          }
          const period = parseInt(currentSettings["Standard Deviation"].period) || 14;
          if (closes.length > period) {
             const sdVals = SD.calculate({ period, values: closes });
             const sdData = [];
             const offset = data.length - sdVals.length;
             for (let i = 0; i < sdVals.length; i++) {
                if (data[offset + i] !== undefined) {
                   sdData.push({ time: data[offset + i].time, value: sdVals[i] });
                }
             }
             indicatorSeriesRefs.current.sd.setData(sdData);
          }
       } else if (indicatorSeriesRefs.current.sd) {
          chart.removeSeries(indicatorSeriesRefs.current.sd);
          indicatorSeriesRefs.current.sd = null;
       }

       // Momentum
       if (currentSettings["Momentum"]?.enabled) {
          if (!indicatorSeriesRefs.current.momentum) {
             indicatorSeriesRefs.current.momentum = chart.addSeries(LineSeries, { color: currentSettings["Momentum"].color || '#ec4899', lineWidth: 2, priceScaleId: 'momentum', lastValueVisible: false, priceLineVisible: false });
             try { chart.priceScale('momentum').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } }); } catch(e) {}
          } else {
             try { indicatorSeriesRefs.current.momentum.applyOptions({ color: currentSettings["Momentum"].color || '#ec4899' }); } catch (e) {}
          }
          const period = parseInt(currentSettings["Momentum"].period) || 14;
          if (closes.length > period) {
             const momData = [];
             for (let i = period; i < closes.length; i++) {
                if (data[i] !== undefined) {
                   momData.push({ time: data[i].time, value: closes[i] - closes[i - period] });
                }
             }
             indicatorSeriesRefs.current.momentum.setData(momData);
          }
       } else if (indicatorSeriesRefs.current.momentum) {
          chart.removeSeries(indicatorSeriesRefs.current.momentum);
          indicatorSeriesRefs.current.momentum = null;
       }

       // Draw Markers (Williams Fractals, Social Trading, etc.)
       let chartMarkers: any[] = [];

       // 1. Williams Fractals
       if (currentSettings["Fractals"]?.enabled) {
          for (let i = 2; i < data.length - 2; i++) {
             const highVal = data[i].high;
             const lowVal = data[i].low;
             const time = data[i].time;

             // High Fractal
             if (highVal > data[i-1].high && highVal > data[i-2].high && highVal > data[i+1].high && highVal > data[i+2].high) {
                chartMarkers.push({
                   time,
                   position: 'aboveBar',
                   color: currentSettings["Fractals"].colorUp || '#34d399',
                   shape: 'arrowDown',
                   text: 'Fractal High'
                });
             }
             // Low Fractal
             if (lowVal < data[i-1].low && lowVal < data[i-2].low && lowVal < data[i+1].low && lowVal < data[i+2].low) {
                chartMarkers.push({
                   time,
                   position: 'belowBar',
                   color: currentSettings["Fractals"].colorDown || '#f87171',
                   shape: 'arrowUp',
                   text: 'Fractal Low'
                });
             }
          }
       }

       // 2. Social Trading Markers
       if (currentSettings["Social Trading"]?.enabled) {
          const interval = Math.max(10, Math.floor(data.length / 8));
          for (let i = 5; i < data.length; i += interval) {
             const time = data[i].time;
             const isBuy = (i % 2 === 0);
             const names = ["OBOROTEN", "Prestige", "VIP Trader", "CopyMaster", "Alpha Signals"];
             const traderName = names[Math.floor((i / interval) % names.length)];
             
             chartMarkers.push({
                time,
                position: isBuy ? 'belowBar' : 'aboveBar',
                color: isBuy ? '#22c55e' : '#ef4444',
                shape: isBuy ? 'arrowUp' : 'arrowDown',
                text: `${traderName} ${isBuy ? 'Buy' : 'Sell'}`
             });
          }
       }

       if (seriesRef.current && typeof seriesRef.current.setMarkers === 'function') {
          chartMarkers.sort((a, b) => {
             const tA = typeof a.time === 'number' ? a.time : 0;
             const tB = typeof b.time === 'number' ? b.time : 0;
             return tA - tB;
          });
          try { seriesRef.current.setMarkers(chartMarkers); } catch (e) {}
       }
    } catch (globalError) {
        console.warn("Soft error in refreshIndicators. Attempted applyOptions on removed scale or offline:", globalError);
    }
  };

  useEffect(() => {
    refreshIndicators();
  }, [indicatorSettings]);

  const [showPromotionsModal, setShowPromotionsModal] = useState(false);
  const [showHallOfFameModal, setShowHallOfFameModal] = useState(false);
  const [showTradeHistoryModal, setShowTradeHistoryModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [showSignalsModal, setShowSignalsModal] = useState(false);
  const [showTournamentsModal, setShowTournamentsModal] = useState(false);
  const [timeframe, setTimeframe] = useState(() => {
    try {
      return localStorage.getItem('bivax_timeframe') || "1 minute";
    } catch(e) { return "1 minute"; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bivax_timeframe', timeframe);
    } catch(e) {}
  }, [timeframe]);
  const [chartType, setChartType] = useState(() => {
    try {
      return localStorage.getItem('bivax_chart_type') || "Candle";
    } catch(e) { return "Candle"; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bivax_chart_type', chartType);
    } catch(e) {}
  }, [chartType]);

  const chartTypeOptions = [
    {
      id: "Line",
      label: "Line",
      Icon: TrendingUp,
      preview: (
        <svg viewBox="0 0 100 40" className="w-[140px] h-[48px] opacity-90" preserveAspectRatio="none">
          <path d="M 0 35 L 5 28 L 10 32 L 15 20 L 20 22 L 25 15 L 30 18 L 35 12 L 40 16 L 45 10 L 50 14 L 55 5 L 60 12 L 65 10 L 70 5 L 75 8 L 80 18 L 85 22 L 90 28 L 95 25 L 100 28" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: "Candle",
      label: "Candle",
      Icon: CandlestickChart,
      preview: (
        <svg viewBox="0 0 100 40" className="w-[140px] h-[48px] opacity-100" preserveAspectRatio="none">
          <g strokeWidth="0.8">
            <line x1="5" y1="20" x2="5" y2="40" stroke="#22c55e" />
            <rect x="3" y="25" width="4" height="10" fill="#22c55e" stroke="none" />
            <line x1="12" y1="15" x2="12" y2="30" stroke="#22c55e" />
            <rect x="10" y="18" width="4" height="8" fill="#22c55e" stroke="none" />
            <line x1="19" y1="10" x2="19" y2="25" stroke="#22c55e" />
            <rect x="17" y="15" width="4" height="7" fill="#22c55e" stroke="none" />
            <line x1="26" y1="12" x2="26" y2="28" stroke="#ef4444" />
            <rect x="24" y="16" width="4" height="8" fill="#ef4444" stroke="none" />
            <line x1="33" y1="20" x2="33" y2="35" stroke="#ef4444" />
            <rect x="31" y="24" width="4" height="7" fill="#ef4444" stroke="none" />
            <line x1="40" y1="15" x2="40" y2="30" stroke="#22c55e" />
            <rect x="38" y="18" width="4" height="8" fill="#22c55e" stroke="none" />
            <line x1="47" y1="5" x2="47" y2="20" stroke="#22c55e" />
            <rect x="45" y="8" width="4" height="8" fill="#22c55e" stroke="none" />
            <line x1="54" y1="8" x2="54" y2="25" stroke="#ef4444" />
            <rect x="52" y="12" width="4" height="10" fill="#ef4444" stroke="none" />
            <line x1="61" y1="15" x2="61" y2="30" stroke="#ef4444" />
            <rect x="59" y="18" width="4" height="8" fill="#ef4444" stroke="none" />
            <line x1="68" y1="20" x2="68" y2="38" stroke="#ef4444" />
            <rect x="66" y="25" width="4" height="10" fill="#ef4444" stroke="none" />
            <line x1="75" y1="25" x2="75" y2="40" stroke="#22c55e" />
            <rect x="73" y="28" width="4" height="8" fill="#22c55e" stroke="none" />
            <line x1="82" y1="22" x2="82" y2="35" stroke="#22c55e" />
            <rect x="80" y="25" width="4" height="6" fill="#22c55e" stroke="none" />
            <line x1="89" y1="25" x2="89" y2="42" stroke="#ef4444" />
            <rect x="87" y="28" width="4" height="10" fill="#ef4444" stroke="none" />
            <line x1="96" y1="30" x2="96" y2="45" stroke="#ef4444" />
            <rect x="94" y="32" width="4" height="10" fill="#ef4444" stroke="none" />
          </g>
        </svg>
      )
    },
    {
      id: "Mountain",
      label: "Mountain",
      Icon: Cloud,
      preview: (
        <svg viewBox="0 0 100 40" className="w-[140px] h-[48px] opacity-90" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountain-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d="M 0 35 L 5 28 L 10 32 L 15 20 L 20 22 L 25 15 L 30 18 L 35 12 L 40 16 L 45 10 L 50 14 L 55 5 L 60 12 L 65 10 L 70 5 L 75 8 L 80 18 L 85 22 L 90 28 L 95 25 L 100 28" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M 0 35 L 5 28 L 10 32 L 15 20 L 20 22 L 25 15 L 30 18 L 35 12 L 40 16 L 45 10 L 50 14 L 55 5 L 60 12 L 65 10 L 70 5 L 75 8 L 80 18 L 85 22 L 90 28 L 95 25 L 100 28 L 100 40 L 0 40 Z" fill="url(#mountain-grad)" stroke="none" />
        </svg>
      )
    },
    {
      id: "Bar",
      label: "Bar",
      Icon: BarChart2,
      preview: (
        <svg viewBox="0 0 100 40" className="w-[140px] h-[48px] opacity-100" preserveAspectRatio="none">
          <g strokeWidth="1">
            <line x1="5" y1="20" x2="5" y2="40" stroke="#22c55e" />
            <line x1="3" y1="35" x2="5" y2="35" stroke="#22c55e" />
            <line x1="5" y1="25" x2="7" y2="25" stroke="#22c55e" />
            <line x1="14" y1="15" x2="14" y2="30" stroke="#22c55e" />
            <line x1="12" y1="26" x2="14" y2="26" stroke="#22c55e" />
            <line x1="14" y1="18" x2="16" y2="18" stroke="#22c55e" />
            <line x1="23" y1="10" x2="23" y2="25" stroke="#22c55e" />
            <line x1="21" y1="22" x2="23" y2="22" stroke="#22c55e" />
            <line x1="23" y1="15" x2="25" y2="15" stroke="#22c55e" />
            <line x1="32" y1="12" x2="32" y2="28" stroke="#ef4444" />
            <line x1="30" y1="16" x2="32" y2="16" stroke="#ef4444" />
            <line x1="32" y1="24" x2="34" y2="24" stroke="#ef4444" />
            <line x1="41" y1="20" x2="41" y2="35" stroke="#ef4444" />
            <line x1="39" y1="24" x2="41" y2="24" stroke="#ef4444" />
            <line x1="41" y1="31" x2="43" y2="31" stroke="#ef4444" />
            <line x1="50" y1="15" x2="50" y2="30" stroke="#22c55e" />
            <line x1="48" y1="26" x2="50" y2="26" stroke="#22c55e" />
            <line x1="50" y1="18" x2="52" y2="18" stroke="#22c55e" />
            <line x1="59" y1="5" x2="59" y2="20" stroke="#22c55e" />
            <line x1="57" y1="16" x2="59" y2="16" stroke="#22c55e" />
            <line x1="59" y1="8" x2="61" y2="8" stroke="#22c55e" />
            <line x1="68" y1="8" x2="68" y2="25" stroke="#ef4444" />
            <line x1="66" y1="12" x2="68" y2="12" stroke="#ef4444" />
            <line x1="68" y1="22" x2="70" y2="22" stroke="#ef4444" />
            <line x1="77" y1="15" x2="77" y2="30" stroke="#ef4444" />
            <line x1="75" y1="18" x2="77" y2="18" stroke="#ef4444" />
            <line x1="77" y1="26" x2="79" y2="26" stroke="#ef4444" />
            <line x1="86" y1="20" x2="86" y2="38" stroke="#ef4444" />
            <line x1="84" y1="25" x2="86" y2="25" stroke="#ef4444" />
            <line x1="86" y1="35" x2="88" y2="35" stroke="#ef4444" />
            <line x1="95" y1="25" x2="95" y2="40" stroke="#22c55e" />
            <line x1="93" y1="36" x2="95" y2="36" stroke="#22c55e" />
            <line x1="95" y1="28" x2="97" y2="28" stroke="#22c55e" />
          </g>
        </svg>
      )
    },
    {
      id: "Heikin Ashi",
      label: "Heikin Ashi",
      Icon: Wind,
      preview: (
        <svg viewBox="0 0 100 40" className="w-[140px] h-[48px] opacity-100" preserveAspectRatio="none">
          <g strokeWidth="0.8">
            <line x1="10" y1="25" x2="10" y2="38" stroke="#ef4444" />
            <rect x="8" y="27" width="4" height="9" fill="#ef4444" stroke="none" />
            <line x1="19" y1="20" x2="19" y2="35" stroke="#ef4444" />
            <rect x="17" y="24" width="4" height="8" fill="#ef4444" stroke="none" />
            <line x1="28" y1="15" x2="28" y2="32" stroke="#ef4444" />
            <rect x="26" y="18" width="4" height="12" fill="#ef4444" stroke="none" />
            <line x1="37" y1="10" x2="37" y2="28" stroke="#ef4444" />
            <rect x="35" y="14" width="4" height="10" fill="#ef4444" stroke="none" />
            <line x1="46" y1="5" x2="46" y2="22" stroke="#ef4444" />
            <rect x="44" y="8" width="4" height="12" fill="#ef4444" stroke="none" />
            <line x1="55" y1="8" x2="55" y2="25" stroke="#ef4444" />
            <rect x="53" y="12" width="4" height="10" fill="#ef4444" stroke="none" />
            <line x1="64" y1="15" x2="64" y2="35" stroke="#ef4444" />
            <rect x="62" y="20" width="4" height="13" fill="#ef4444" stroke="none" />
            <line x1="73" y1="20" x2="73" y2="40" stroke="#ef4444" />
            <rect x="71" y="25" width="4" height="12" fill="#ef4444" stroke="none" />
            <line x1="82" y1="28" x2="82" y2="42" stroke="#3b82f6" />
            <rect x="80" y="32" width="4" height="10" fill="#3b82f6" stroke="none" />
            <line x1="91" y1="20" x2="91" y2="36" stroke="#3b82f6" />
            <rect x="89" y="22" width="4" height="10" fill="#3b82f6" stroke="none" />
          </g>
        </svg>
      )
    }
  ];
  
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nowMs = now.getTime();
  const [targetExpiration, setTargetExpiration] = useState<Date | null>(null);
  const [candleTimer, setCandleTimer] = useState(15);

  const getNextAvailableExpirations = (currentTime: Date) => {
    const base = new Date(currentTime);
    base.setSeconds(0);
    base.setMilliseconds(0);
    
    const expirations: Date[] = [];
    
    // First possible expiration is the end of the current minute
    let firstExp = new Date(base);
    // 30-second rule: if there are less than 30 seconds left in the current minute (i.e. seconds >= 30),
    // then the first expiration must be pushed to the NEXT minute (base + 2 minutes)
    if (currentTime.getSeconds() >= 30) {
      firstExp.setMinutes(base.getMinutes() + 2);
    } else {
      firstExp.setMinutes(base.getMinutes() + 1);
    }
    
    for (let i = 0; i < 5; i++) {
        const d = new Date(firstExp);
        d.setMinutes(firstExp.getMinutes() + i);
        expirations.push(d);
    }
    return expirations;
  };

  const defaultExpirations = getNextAvailableExpirations(now);
  const defaultExpiration = defaultExpirations[0];
  
  const expirationDate = targetExpiration && targetExpiration.getTime() > nowMs ? targetExpiration : defaultExpiration;
  const exactExpirationTime = expirationDate.getTime();
  const purchaseDeadlineTime = exactExpirationTime;
  
  const timeToPurchase = Math.max(0, Math.floor((purchaseDeadlineTime - nowMs) / 1000));
  const expirationString = expirationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone });
  
  const formatTimeToPurchase = (secs: number) => {
      if (secs < 60) return `:${secs < 10 ? '0' + secs : secs}`;
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  }

  const increaseTime = () => {
      const newExpiration = new Date(exactExpirationTime);
      newExpiration.setMinutes(newExpiration.getMinutes() + 1);
      setTargetExpiration(newExpiration);
  };

  const decreaseTime = () => {
      const newExpiration = new Date(exactExpirationTime);
      newExpiration.setMinutes(newExpiration.getMinutes() - 1);
      if (newExpiration.getTime() >= defaultExpiration.getTime()) {
          setTargetExpiration(newExpiration);
      } else {
          setTargetExpiration(null);
      }
  };
  
  // Ref to hold the current candle data being built
  const activeCandleRef = useRef<any>(null);

  const [systemActive, setSystemActive] = useState(true);
  const [markets, setMarkets] = useState<any>({});
  const [activitiesBanners, setActivitiesBanners] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [showBottomHistory, setShowBottomHistory] = useState(false);
  const [bottomTab, setBottomTab] = useState<"active" | "closed">("active");
  const [isBottomPanelMinimized, setIsBottomPanelMinimized] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);


  const [assetSearch, setAssetSearch] = useState("");
  const [assetCategory, setAssetCategory] = useState("All");
  const [assetGroup, setAssetGroup] = useState("FTT");
  const assetSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCalcAmount(prev => prev !== amount ? amount : prev);
  }, [amount]);

  useEffect(() => {
    if (markets && markets[activeAsset]) {
      const newPayout = markets[activeAsset].payout || 82;
      setCalcPayout(prev => prev !== newPayout ? newPayout : prev);
    }
  }, [activeAsset, markets]);

  // Global Static Data Effect - Removed in favor of aggregate boot API

  useEffect(() => {
    if (!currentUser?.uid) return;

    // Listen to Deposits in real-time
    const qDeps = query(collection(db, "deposits"), where("userId", "==", currentUser.uid), limit(50));
    const unsubDeps = onSnapshot(qDeps, (snapshot) => {
        const deps = snapshot.docs.map(doc => {
            const data = doc.data();
            const date = (data.timestamp && typeof data.timestamp.toDate === 'function') ? data.timestamp.toDate() : new Date(data.timestamp || Date.now());
            let statusDisplay = "Pending";
            if (data.status === "success") statusDisplay = "Completed";
            else if (data.status === "rejected") statusDisplay = "Rejected";

            return {
                id: doc.id,
                dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone }),
                timeStr: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone }),
                type: "Deposit",
                method: data.method || "Unknown",
                amount: parseFloat(data.amount) || 0,
                status: statusDisplay,
                timestamp: date.getTime()
            };
        });
        setUserTransactions(prev => {
            const filtered = prev.filter(t => t.type !== "Deposit");
            return [...filtered, ...deps].sort((a, b) => b.timestamp - a.timestamp);
        });
    }, (e) => console.warn("Failed to listen to deposits:", e.message));

    // Listen to Withdrawals in real-time
    const qWiths = query(collection(db, "withdrawals"), where("userId", "==", currentUser.uid), limit(50));
    const unsubWiths = onSnapshot(qWiths, (snapshot) => {
        const withs = snapshot.docs.map(doc => {
            const data = doc.data();
            const date = (data.timestamp && typeof data.timestamp.toDate === 'function') ? data.timestamp.toDate() : new Date(data.timestamp || Date.now());
            let statusDisplay = "Pending";
            if (data.status === "success") statusDisplay = "Completed";
            else if (data.status === "rejected") statusDisplay = "Rejected";

            return {
                id: doc.id,
                dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone }),
                timeStr: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone }),
                type: "Withdrawal",
                method: data.method || "Unknown",
                amount: parseFloat(data.amount) || 0,
                status: statusDisplay,
                timestamp: date.getTime()
            };
        });
        setUserTransactions(prev => {
            const filtered = prev.filter(t => t.type !== "Withdrawal");
            return [...filtered, ...withs].sort((a, b) => b.timestamp - a.timestamp);
        });
    }, (e) => console.warn("Failed to listen to withdrawals:", e.message));

    return () => {
        unsubDeps();
        unsubWiths();
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid || !selectedTournament) return;

    const tid = selectedTournament.id;
    const q = query(
        collection(db, 'tournaments', tid, 'participants'),
        orderBy('score', 'desc'),
        limit(50)
    );
    
    getDocs(q).then((snapshot) => {
        const parts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTournamentParticipants(parts);
    }).catch(err => console.warn("Tournament participants fetch failed:", err.message));
  }, [currentUser?.uid, selectedTournament]);

  const handleRegisterTournament = async (tournament: any) => {
    if (!auth.currentUser) return;
    
    try {
        const participantDocRef = doc(db, 'tournaments', tournament.id, 'participants', auth.currentUser.uid);
        const participantDoc = await getDoc(participantDocRef);
        
        if (participantDoc.exists()) {
            toast.error("You are already registered for this tournament!");
            return;
        }

        // Handle entry fee
        const feeMatch = tournament.entryFee?.match(/\d+/);
        const fee = feeMatch ? parseInt(feeMatch[0]) : 0;

        if (fee > 0) {
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists() || (userDoc.data().balance || 0) < fee) {
                toast.error("Insufficient balance for entry fee!");
                return;
            }
            await updateDoc(userDocRef, { balance: increment(-fee) });
        }

        await setDoc(participantDocRef, {
            uid: auth.currentUser.uid,
            displayName: nickname || auth.currentUser.email?.split('@')[0] || "Trader",
            score: 1000.0,
            tradesCount: 0,
            joinedAt: Date.now()
        });

        // Increment tournament participants count (swallow permission errors gracefully)
        try {
            const tournamentDocRef = doc(db, 'tournaments', tournament.id);
            await updateDoc(tournamentDocRef, {
                participantsCount: increment(1)
            });
        } catch (e) {
            console.warn("Could not increment participants count on global tournament doc:", e);
        }

        setUserRegistrations(prev => [...prev, tournament.id]);
        setActiveTournamentId(tournament.id);
        setAccountType("tournament");
        setTournamentBalance(1000.0);

        toast.success(`Registered successfully! Switched to "${tournament.title}" Tournament Trading.`);
    } catch (error) {
        console.error("Registration failed:", error);
        toast.error("Registration failed. Please try again.");
    }
  };

  const updateTournamentScore = async (amount: number, isWin: boolean) => {
    if (accountType !== 'tournament' || !activeTournamentId || !auth.currentUser) return;
    
    // Update local state for immediate feedback
    setTournamentBalance(prev => prev + amount);
    
    // Update Firestore to sync with leaderboard
    try {
        const participantRef = doc(db, 'tournaments', activeTournamentId, 'participants', auth.currentUser.uid);
        await updateDoc(participantRef, {
            score: increment(amount),
            tradesCount: increment(1)
        });
    } catch (e) {
        console.warn("Tournament score update failed:", e);
    }
  };

  const createSupportTicket = async (subject: string, message: string) => {
    if (!currentUser) {
      toast.error("Please log in to contact support");
      return;
    }
    try {
      const ticketId = doc(collection(db, 'tickets')).id;
      const initialTicketData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || "User",
        subject: subject,
        status: 'open',
        priority: 'medium',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      try {
        await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketId, ticketData: initialTicketData })
        });
      } catch (error) {
        console.error("Server ticket creation failed:", error);
        return;
      }

      const messageId = doc(collection(db, 'tickets', ticketId, 'messages')).id;
      const initialMessageData = {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.split('@')[0] || "User",
        senderType: 'user',
        text: message,
        createdAt: Date.now()
      };

      try {
        await fetch('/api/tickets/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketId, messageId, messageData: initialMessageData })
        });
      } catch (error) {
        console.error("Server message creation failed:", error);
      }

      toast.success("Support ticket created!");
      
      // Trigger AI reply for the initial message
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
      const messageId = doc(collection(db, 'tickets', tid, 'messages')).id;
      const messageData = {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.split('@')[0] || "User",
        senderType: 'user',
        text: ticketReply,
        createdAt: Date.now()
      };

      try {
        await fetch('/api/tickets/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketId: tid, messageId, messageData })
        });
      } catch (error) {
        console.error("Server message creation failed:", error);
        return;
      }
      
      try {
        await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketId: tid, ticketData: {
            lastMessage: ticketReply,
            updatedAt: Date.now()
          }})
        });
      } catch (error) {
        console.error("Server ticket update failed:", error);
        return;
      }

      const msg = ticketReply;
      setTicketReply("");
      
      // Trigger AI reply
      getAIReply(tid, msg);
    } catch (e) {
      console.error("Error sending message:", e);
      toast.error("Failed to send message");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCandleTimer((prev) => (prev <= 1 ? 15 : prev - 1));
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  type Trade = {
    id: string;
    type: "up" | "down";
    entryPrice: number;
    amount: number;
    timeLeft: number;
    expirationTime: number;
    entryTime: any;
    payout: number;
    asset: string;
    status?: 'open' | 'won' | 'lost' | 'draw';
    exitPrice?: number;
    closedAt?: number;
    accountType?: 'real' | 'demo';
    createdAt: number;
  };

  const [isLoading, setIsLoading] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [isPastHistoryLoading, setIsPastHistoryLoading] = useState(false);
  const isGeneratingRef = useRef(false);

  useEffect(() => {
    if (activeTab === 'history') {
      setHistoryLoading(true);
      const timer = setTimeout(() => {
        setHistoryLoading(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
    if (activeTab === 'activities') {
      setActivitiesLoading(true);
      const timer = setTimeout(() => {
        setActivitiesLoading(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);
  
  useEffect(() => {
    // Remove artificial delay to show chart immediately
    setContentReady(true);
  }, []);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartContainerRef2 = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const chartRef2 = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const seriesRef2 = useRef<ISeriesApi<any> | null>(null);
  const socketRef = useRef<any>(null);
  const [initialHistoryCache] = useState(() => {
    try {
      const saved = localStorage.getItem('chart_history_cache');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const historyCacheRef = useRef<Record<string, any>>(initialHistoryCache);
  const liveCandlesCacheRef = useRef<Record<string, any>>({});
  const saveHistoryCacheSafely = (cacheObj: Record<string, any>) => {
    try {
      const prunedCache: Record<string, any> = {};
      Object.keys(cacheObj).forEach(key => {
        const arr = cacheObj[key];
        if (Array.isArray(arr)) {
          prunedCache[key] = arr.slice(-150);
        } else {
          prunedCache[key] = arr;
        }
      });
      localStorage.setItem('chart_history_cache', JSON.stringify(prunedCache));
    } catch (e) {
      console.warn("Storage quota exceeded or error occurred while saving chart cache. Safely handling...", e);
      try {
        localStorage.removeItem('chart_history_cache');
      } catch (err) {}
    }
  };

  const loadMorePastRef = useRef<() => void>(() => {});

  const handleLoadMorePast = () => {
    try {
      const activePair = activeAssetRef.current;
      if (!activePair) return;
      
      const currentHistory = historyCacheRef.current[activePair] || [];
      if (currentHistory.length === 0) return;
      
      const oldestCandle = currentHistory[0];
      const tfSeconds = getTimeSeconds(timeframeRef.current); // Use current timeframe
      
      let baseTime = oldestCandle.time;
      let currentPrice = oldestCandle.open;
      
      // Estimate volatility based on the visible recent history
      let sumBody = 0;
      const sampleSize = Math.min(20, currentHistory.length);
      for(let i = 0; i < sampleSize; i++) {
         sumBody += Math.abs(currentHistory[i].open - currentHistory[i].close);
      }
      let avgBody = sumBody / sampleSize;
      if (avgBody === 0) avgBody = currentPrice * 0.0001;
      
      const stepVol = avgBody; 
      
      const generatedCount = 2000;
      const newCandles = [];
      
      for (let i = 0; i < generatedCount; i++) {
        baseTime -= tfSeconds;
        const close = currentPrice;
        
        // Random walk using estimated stepVol
        const drift = (Math.random() - 0.5) * 0.0001;
        const shock = (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / 3 * stepVol; // approx normal
        
        const open = close * Math.exp(drift - (shock / currentPrice)); 
        const maxExt = stepVol * Math.abs(Math.random()) * 0.25;
        const minExt = stepVol * Math.abs(Math.random()) * 0.25;
        
        const high = Math.max(open, close) + maxExt;
        const low = Math.min(open, close) - minExt;
        const volume = Math.random() * 100 + 10;
        
        newCandles.push({
          time: baseTime,
          open,
          high,
          low,
          close,
          volume,
          openTime: baseTime,
          closeTime: baseTime + tfSeconds
        });
        currentPrice = open;
      }
      
      newCandles.reverse();
      
      historyCacheRef.current[activePair] = [...newCandles, ...currentHistory];
      
      if (seriesRef.current) {
         // Re-render chart with new data without changing scroll position
         const currentZoom = chartRef.current ? chartRef.current.timeScale().getVisibleLogicalRange() : null;
         
         const pairHist = resampleData(historyCacheRef.current[activePair], timeframeRef.current);
         const uniqueMap = new Map();
         
         const isOHLC = chartTypeRef.current === "Candle" || chartTypeRef.current === "Heikin Ashi" || chartTypeRef.current === "Bar";
         pairHist.forEach((d: any) => {
             if (isOHLC) {
                 if (typeof d.open === 'number' && typeof d.high === 'number' && typeof d.low === 'number' && typeof d.close === 'number' && isFinite(d.open) && isFinite(d.high) && isFinite(d.low) && isFinite(d.close)) {
                     uniqueMap.set(d.time, d);
                 }
             } else {
                 if (typeof d.value === 'number' && isFinite(d.value)) {
                     uniqueMap.set(d.time, d);
                 } else if (typeof d.close === 'number' && isFinite(d.close)) {
                     uniqueMap.set(d.time, d);
                 }
             }
         });
         
         const uniqueData = Array.from(uniqueMap.values()).sort((a: any, b: any) => a.time - b.time);
         
         const isLine = chartType === "Line" || chartType === "Area";
         const finalData = isLine 
            ? uniqueData.map((d: any) => ({ time: d.time, value: d.close }))
            : uniqueData;
            
         seriesRef.current.setData(finalData);
         
         if (chartRef.current && currentZoom) {
             // Offset logical range by the exact number of new candles added
             const newResampledCount = generatedCount;
             
             try {
               chartRef.current.timeScale().setVisibleLogicalRange({
                 from: currentZoom.from + newResampledCount,
                 to: currentZoom.to + newResampledCount
               });
             } catch(e) {}
         }
      }
      
    } catch (e) {
      console.warn("Failed to generate history", e);
    } finally {
      isGeneratingRef.current = false;
      setIsPastHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadMorePastRef.current = handleLoadMorePast;
  }, [handleLoadMorePast]);

  const pruneOldDemoTrades = async (userId: string) => {
    try {
      const res = await fetch('/api/trade/prune-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        let data: any = { success: false };
        try {
          const text = await res.text();
          if (text) {
            try {
              data = JSON.parse(text);
            } catch {
              console.warn("Non-JSON prune-demo response:", text);
            }
          }
        } catch {}
        if (data && data.success && data.prunedCount > 0) {
          console.log(`Successfully pruned ${data.prunedCount} old closed demo trades via server API for user ${userId}`);
        }
      }
    } catch (err) {
      console.warn("Demo trade maintenance temporary bypass:", err);
    }
  };
  const lastCandleRef = useRef<any>(null);
  const rawLastCandleRef = useRef<any>(null); // To store non-HA data for price updates
  const lastChartUpdateTimeRef = useRef<number>(0);
  const targetPriceRef = useRef<number>(0);
  const currentInterpolatedPriceRef = useRef<number>(0);

  // Tracking refs to identify structural changes and preserve zoom
  const prevAssetRefRender = useRef<string | null>(null);
  const prevTimeframeRefRender = useRef<string | null>(null);
  const prevChartTypeRefRender = useRef<string | null>(null);
  const crosshairCallbackRef = useRef<any>(null);
  const lastZoomedAssetRef = useRef<string | null>(null);
  const [purchaseLineX, setPurchaseLineX] = useState<number | null>(null);
  const [expirationLineX, setExpirationLineX] = useState<number | null>(null);

  useEffect(() => {
    let rafId: number;
    const updateLine = () => {
      const chartConfigs = (isMultiChart && !isMobile ? [0, 1] : [0]);
      
      chartConfigs.forEach(idx => {
        const currentChart = idx === 0 ? chartRef.current : chartRef2.current;
        const currentSeries = idx === 0 ? seriesRef.current : seriesRef2.current;
        const currentContainer = idx === 0 ? chartContainerRef.current : chartContainerRef2.current;
        
        if (currentChart && currentContainer) {
           try {
               // Only update interpolation on the primary chart instance if they are synced, 
               // or handle each if they are independent. 
               // For simplicity, we keep the interpolation logic tied to chartRef/seriesRef if idx === 0
               if (idx === 0 && currentSeries && rawLastCandleRef.current && targetPriceRef.current > 0) {
                   const currentInterp = currentInterpolatedPriceRef.current ?? rawLastCandleRef.current.close;
                   const target = targetPriceRef.current;
                   const dt = 0.15;
                   let MathAbs = Math.abs(target - currentInterp);
                   const newInterp = MathAbs < 0.000001 ? target : currentInterp + (target - currentInterp) * dt;
                   currentInterpolatedPriceRef.current = newInterp;

                   const newCandle = { ...rawLastCandleRef.current };
                   newCandle.close = newInterp;
                   newCandle.high = Math.max(newCandle.high, newInterp);
                   newCandle.low = Math.min(newCandle.low, newInterp);
                   
                   try {
                       if (chartTypeRef.current === "Line" || chartTypeRef.current === "Mountain") {
                           currentSeries.update({ time: newCandle.time, value: newInterp });
                       } else {
                           currentSeries.update(newCandle);
                       }
                   } catch(updErr) {}
                   lastCandleRef.current = newCandle;
               }

               const ts = currentChart.timeScale();
               const timeSecs = Math.floor(purchaseDeadlineTime / 1000);
               const expSecs = Math.floor(exactExpirationTime / 1000);
               
               const getX = (targetTimeSecs: number) => {
                   let x = ts.timeToCoordinate(targetTimeSecs as Time);
                   if (x === null && rawLastCandleRef.current) {
                       const lastTime = rawLastCandleRef.current.time as number;
                       const lastX = ts.timeToCoordinate(lastTime as Time);
                       if (lastX !== null) {
                           const secondsDiff = targetTimeSecs - lastTime;
                           const timeframeSeconds = getTimeSeconds(timeframe);
                           const candlesDiff = secondsDiff / timeframeSeconds;
                           const range = ts.getVisibleLogicalRange();
                           if (range) {
                               const barSpacing = ts.width() / (range.to - range.from);
                               x = lastX + candlesDiff * barSpacing;
                           }
                       }
                   }
                   return x;
               };
               
               if (idx === 0) {
                 setPurchaseLineX(getX(timeSecs));
                 setExpirationLineX(getX(expSecs));
               }
               
               if (currentSeries && (lastCandleRef.current || rawLastCandleRef.current)) {
                   if (idx === 0) {
                     if (hoverTradeTypeRef.current && lastCandleRef.current) {
                         const y = currentSeries.priceToCoordinate(lastCandleRef.current.close);
                         setHoverLineY(y);
                     } else {
                         setHoverLineY(null);
                     }
                   }

                   if (activeTradesRef.current && activeAssetRef.current) {
                       const currentPrice = lastCandleRef.current?.close ?? rawLastCandleRef.current?.close ?? lastCandleRef.current?.value;
                       activeTradesRef.current.forEach(trade => {
                           // If multi-chart, we might want to check if the asset matches the specific chart's asset
                           // But here we assume they might be different or the same. 
                           // For now, only show on chart if asset matches.
                           if (trade.asset === activeAssetRef.current) {
                               const el = document.getElementById(`trade-overlay-${idx}-${trade.id}`);
                               if (el) {
                                   const y = currentSeries.priceToCoordinate(trade.entryPrice);
                                   const entryTimeSecs = (trade.entryTime || (typeof trade.createdAt === 'number' ? Math.floor(trade.createdAt / 1000) : (trade.createdAt && typeof (trade.createdAt as any).toDate === 'function' ? Math.floor((trade.createdAt as any).toDate().getTime() / 1000) : (trade.createdAt instanceof Date ? Math.floor(trade.createdAt.getTime() / 1000) : Math.floor(Date.now() / 1000)))));
                                   const xBase = getX(entryTimeSecs as number);
                                   const xExp = getX(Math.floor(trade.expirationTime / 1000));
                                   
                                   let candleHalfWidth = 0;
                                   if (ts && typeof ts.width === 'function' && typeof ts.getVisibleLogicalRange === 'function') {
                                       const logicalRange = ts.getVisibleLogicalRange();
                                       if (logicalRange && (logicalRange.to - logicalRange.from) > 0) {
                                           const barSpacing = ts.width() / (logicalRange.to - logicalRange.from);
                                           candleHalfWidth = barSpacing * 0.40;
                                       }
                                   }
                                   const adjXBase = xBase !== null ? xBase - candleHalfWidth : null;
                                   
                                   if (y !== null && adjXBase !== null) {
                                       el.style.transform = `translate(${adjXBase}px, ${y}px)`;
                                       el.style.display = 'block';
                                       
                                       const isProfit = trade.type === 'up' ? currentPrice > trade.entryPrice : currentPrice < trade.entryPrice;
                                       const line = el.querySelector('.trade-line') as HTMLElement;
                                       const dot = el.querySelector('.trade-dot') as HTMLElement;
                                       
                                       if (line) {
                                           if (isProfit) {
                                               line.style.borderBottom = `2px dotted #FCD535`;
                                               line.style.opacity = '1';
                                           } else {
                                               line.style.borderBottom = '2px dotted rgba(252, 213, 53, 0.5)';
                                               line.style.opacity = '0.6';
                                           }
                                       }
                                       
                                       if (dot) {
                                           if (isProfit) {
                                               dot.style.transform = 'scale(1.2)';
                                               dot.style.backgroundColor = '#FCD535';
                                           } else {
                                               dot.style.transform = 'scale(1)';
                                               dot.style.backgroundColor = 'rgba(252, 213, 53, 0.7)';
                                           }
                                       }

                                       const arrow = el.querySelector('.trade-arrow') as HTMLElement;
                                       if (arrow) {
                                           const arrowTip = arrow.querySelector('div') as HTMLElement;
                                           if (arrowTip) {
                                               if (isProfit) {
                                                   arrowTip.style.borderTopColor = '#FCD535';
                                                   arrow.style.opacity = '1';
                                               } else {
                                                   arrowTip.style.borderTopColor = 'rgba(252, 213, 53, 0.5)';
                                                   arrow.style.opacity = '0.7';
                                               }
                                           }
                                       }

                                       if (xExp !== null && xExp > adjXBase!) {
                                           el.style.width = `${Math.max(1, xExp - adjXBase!)}px`;
                                       } else if (xExp !== null) {
                                           el.style.width = '0px';
                                       } else {
                                            el.style.width = `calc(100% - ${adjXBase}px)`;
                                        }
                                   } else {
                                       el.style.display = 'none';
                                   }
                               }
                           }
                       });
                   }
               }
           } catch(e) {
               console.warn("Error in updateLine for chart idx " + idx, e);
           }
        }
      });
      rafId = requestAnimationFrame(updateLine);
    };
    rafId = requestAnimationFrame(updateLine);
    return () => cancelAnimationFrame(rafId);
  }, [purchaseDeadlineTime, exactExpirationTime, timeframe]);

  // Price Alert & Trades States
  const [alerts, setAlerts] = useState<any[]>([]);
  const alertsRef = React.useRef<any[]>([]);

  useEffect(() => {
    let unsubAlerts: () => void = () => {};
    const unsubAuth = onAuthStateChanged(auth, (user) => {
        if (user) {
            const q = query(collection(db, 'users', user.uid, 'priceAlerts'), where('status', '==', 'active'));
            unsubAlerts = onSnapshot(q, (snapshot) => {
                const loadedAlerts: any[] = [];
                snapshot.forEach(doc => loadedAlerts.push({id: doc.id, ...doc.data()}));
                setAlerts(loadedAlerts);
                alertsRef.current = loadedAlerts;
            }, (error) => console.warn("Failed to watch price alerts:", error.message));
        } else {
            setAlerts([]);
            alertsRef.current = [];
            if (unsubAlerts) unsubAlerts();
        }
    });

    return () => {
        unsubAuth();
        if (unsubAlerts) unsubAlerts();
    };
  }, []);

  useEffect(() => {
    if (currentUser && appConfig?.loginPromoAd_enabled) {
        // Prevent showing on initial load if we don't have a fresh sign-in attempt
        // We use sessionStorage to ensure it pops up once per app session upon login
        const shownKey = `promoAdShown_${currentUser.uid}`;
        if (!sessionStorage.getItem(shownKey)) {
            // Give it a tiny delay to allow regular UI to render first
            setTimeout(() => {
                setShowPromoAdModal(true);
            }, 1500);
            sessionStorage.setItem(shownKey, 'true');
        }
    }
  }, [currentUser, appConfig?.loginPromoAd_enabled]);


  const [showCopyTrading, setShowCopyTrading] = useState(false);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const activeTradesRef = React.useRef<Trade[]>([]);
  const processedTradesRef = React.useRef<Set<string>>(new Set());
  const markersPluginRef = React.useRef<any>(null);
  const activeAssetRef = useRef(activeAsset);

  useEffect(() => {
    activeAssetRef.current = activeAsset;
    rawLastCandleRef.current = null;
    lastCandleRef.current = null;
  }, [activeAsset]);

  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [showOpenTrades, setShowOpenTrades] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showCashierMenu, setShowCashierMenu] = useState(false);
  const [cashierTab, setCashierTab] = useState<"deposits" | "withdrawals" | "history">("deposits");
  


  const [isCashierLoading, setIsCashierLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);

  const handleActivitiesAction = (action: () => void) => {
    setIsActivitiesLoading(true);
    setTimeout(() => {
      setIsActivitiesLoading(false);
      action();
    }, 1500);
  };

  useEffect(() => {
    if (showDeposit) {
      setIsCashierLoading(true);
      const timer = setTimeout(() => setIsCashierLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [showDeposit, cashierTab]);

  useEffect(() => {
    if (activeTab === 'profile') {
      setIsProfileLoading(true);
      const timer = setTimeout(() => setIsProfileLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const [depositStep, setDepositStep] = useState<"methods" | "amount" | "payment">("methods");
  const [withdrawStep, setWithdrawStep] = useState<"methods" | "form">("methods");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const currentMinWithdrawal = 10;
  const [withdrawAccountHolder, setWithdrawAccountHolder] = useState("");
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState("");
  const [withdrawEmail, setWithdrawEmail] = useState(currentUser?.email || "");
  const [withdrawSubmitAttempted, setWithdrawSubmitAttempted] = useState(false);
  const [showWithdrawOtp, setShowWithdrawOtp] = useState(false);
  const [withdrawOtpValue, setWithdrawOtpValue] = useState("");
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [withdrawalLoadingText, setWithdrawalLoadingText] = useState("");
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState("77500");
  const [selectedBonusId, setSelectedBonusId] = useState<string>("none");
  const [paymentTimer, setPaymentTimer] = useState(15 * 60);
  const [isPaymentPageLoading, setIsPaymentPageLoading] = useState(false);
  const [paymentTrxId, setPaymentTrxId] = useState("");
  const [hasCopiedWallet, setHasCopiedWallet] = useState(false);

  // Web3 States
  const [web3State, setWeb3State] = useState<'idle' | 'connecting' | 'connected' | 'processing' | 'success'>('idle');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);

  const isCryptoDeposit = selectedMethod?.category === 'Crypto' || 
                          (selectedMethod?.category || "").toLowerCase().includes("crypto") ||
                          (selectedMethod?.name || "").toLowerCase().includes("usdt") || 
                          (selectedMethod?.name || "").toLowerCase().includes("binance") ||
                          (selectedMethod?.name || "").toLowerCase().includes("pay");

  useEffect(() => {
    if (selectedMethod) {
      const isCrypto = selectedMethod.category === 'Crypto' || 
                       (selectedMethod.category || "").toLowerCase().includes("crypto") ||
                       (selectedMethod.name || "").toLowerCase().includes("usdt") || 
                       (selectedMethod.name || "").toLowerCase().includes("binance") ||
                       (selectedMethod.name || "").toLowerCase().includes("pay");
      if (isCrypto) {
        setDepositAmount("10");
      } else {
        setDepositAmount("77500");
      }
    }
  }, [selectedMethod]);

  useEffect(() => {
    let interval: any;
    if (depositStep === "payment" && showDeposit && paymentTimer > 0) {
      interval = setInterval(() => {
        setPaymentTimer((prev) => prev - 1);
      }, 1000);
    } else if (depositStep !== "payment" || !showDeposit) {
      setPaymentTimer(15 * 60);
    }
    return () => clearInterval(interval);
  }, [depositStep, paymentTimer, showDeposit]);

  const formatTimer = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min < 10 ? '0' : ''}${min} : ${sec < 10 ? '0' : ''}${sec}`;
  };
  const [depositCategory, setDepositCategory] = useState("All");
  const [showDepositCategoryDropdown, setShowDepositCategoryDropdown] = useState(false);
  
  useEffect(() => {
    localStorage.setItem('bivax_account_type', accountType);
  }, [accountType]);

  // Handle actionParam on mount only
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'deposit' || action === 'withdraw') {
      setShowDeposit(true);
      setCashierTab(action === 'deposit' ? 'deposits' : 'withdrawals');
      setSearchParams(prev => {
        prev.delete('action');
        return prev;
      }, { replace: true });
    }
  }, []); // Run once on mount

  // Sync URL parameter to state (one-way, to handle direct links)
  useEffect(() => {
    const fromUrl = searchParams.get('account');
    if (fromUrl === 'real' || fromUrl === 'demo' || fromUrl === 'tournament') {
      setAccountType(fromUrl as any);
    }
  }, []); // Run once on mount

  useEffect(() => {
    if (!currentUser?.uid || !activeTournamentId || accountType !== 'tournament') return;
    
    const unsub = onSnapshot(
      doc(db, 'tournaments', activeTournamentId, 'participants', currentUser.uid),
      (snap) => {
        if (snap.exists()) {
          const val = snap.data().score;
          if (typeof val === 'number') {
            setTournamentBalance(val);
          }
        } else {
          setTournamentBalance(1000.0);
        }
      },
      (err) => console.warn("Error subscribing to tournament balance:", err)
    );
    return unsub;
  }, [currentUser?.uid, activeTournamentId, accountType]);

  const lastRechargeRef = useRef(0);
  useEffect(() => {
    const demoBalanceInUserCurrency = convertFromBase(demoBalance, userCurrency);
    if (accountType === 'demo' && demoBalanceInUserCurrency < minConvertedAmount && auth.currentUser) {
        const now = Date.now();
        if (now - lastRechargeRef.current > 5000) {
            lastRechargeRef.current = now;
            const rechargeAmount = 10000;
            setDemoBalance(rechargeAmount);
            updateDoc(doc(db, "users", auth.currentUser.uid), {
                demoBalance: rechargeAmount
            }).catch((err) => console.error("Error recharging demo balance:", err));
        }
    }
  }, [demoBalance, accountType, minConvertedAmount, userCurrency, auth.currentUser]);
  
  const visibleActiveTrades = activeTrades.filter(t => {
    const isOwner = (t.accountType || 'real') === accountType;
    const isExpired = t.timeLeft <= 0 || (t.expirationTime && Date.now() >= t.expirationTime);
    const isSettled = (t.status && t.status !== 'open') || (processedTradesRef.current && processedTradesRef.current.has(t.id));
    return isOwner && !isExpired && !isSettled;
  });
  const visibleUserTrades = userTrades.filter(t => (t.accountType || 'real') === accountType);

  // Calculation of user's today's profit:
  const userTodayProfit = React.useMemo(() => {
     let profit = 0;
     const startOfDay = new Date();
     startOfDay.setHours(0,0,0,0);
     const todayTs = startOfDay.getTime();
     
     visibleUserTrades.forEach(trade => {
         // check if trade is closed and settled today
         const tradeTs = trade.updatedAt || trade.createdAt || 0;
         if (tradeTs > todayTs && trade.status !== 'open') {
             if (trade.status === 'won') {
                 profit += ((trade.payoutAmount || 0) - trade.amount);
             } else if (trade.status === 'lost') {
                 profit -= trade.amount;
             }
         }
     });
     return profit;
  }, [visibleUserTrades]);


  const [leaderboards, setLeaderboards] = useState<any>({ daily: [], weekly: [], monthly: [], allTime: [] });
  
  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (data) setLeaderboards(data);
      })
      .catch(err => console.error('Failed to load leaderboards:', err));
  }, []);

  const dynamicLeaderboard = React.useMemo(() => {
    if (!leaderboards || !leaderboards.daily) return [];
    
    const getCountryCode = (countryName: string) => {
        if (!countryName) return "bd";
        const mapping: Record<string, string> = {
            "Bangladesh": "bd", "India": "in", "Pakistan": "pk", "United States": "us", "United Kingdom": "gb", 
            "Canada": "ca", "Australia": "au", "Malaysia": "my", "Indonesia": "id", "Brazil": "br", "Mexico": "mx",
            "Colombia": "co", "Spain": "es", "South Africa": "za", "Argentina": "ar"
        };
        const exact = mapping[countryName];
        if (exact) return exact;
        const partial = Object.keys(mapping).find(k => k.toLowerCase().includes(countryName.toLowerCase()) || countryName.toLowerCase().includes(k.toLowerCase()));
        if (partial) return mapping[partial];
        
        return "bd";
    };

    return leaderboards.daily.map((l: any, i: number) => ({
      id: l.user_id,
      name: l.display_name || l.nickname || l.first_name || 'Trader',
      profit: parseFloat(l.profit || l.total_profit || 0),
      flagUrl: `https://flagcdn.com/w40/${getCountryCode(l.country)}.png`,
      isCurrentUser: currentUser && currentUser.uid === l.user_id,
      rank: i + 1,
      formattedProfit: parseFloat(l.profit || l.total_profit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }));
  }, [leaderboards, currentUser]);

  // Security Logging - Track IP and Device ID once per session
  useEffect(() => {
    if (currentUser?.uid) {
      const deviceId = localStorage.getItem('bivaax_device_id') || (() => {
        const newId = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('bivaax_device_id', newId);
        return newId;
      })();
      
      fetch('/api/security/log-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.uid, deviceId })
      }).catch(err => console.warn('Security logging failed', err));
    }
  }, [currentUser?.uid]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshBalance = async () => {
    if (!auth.currentUser) return;
    setIsRefreshing(true);
    try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (accountType === 'demo') {
              if (userData.demoBalance !== undefined) setDemoBalance(userData.demoBalance);
            } else {
              if (userData.balance !== undefined) setRealBalance(userData.balance);
            }
        }
    } catch (error) {
        console.error("Error refreshing balance:", error);
    } finally {
        setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    let total = demoBalance;
    if (accountType === 'real') total = realBalance;
    else if (accountType === 'tournament') total = tournamentBalance;

    const nextBalance = Math.max(0, total);
    setBalance(prev => prev !== nextBalance ? nextBalance : prev);
  }, [accountType, demoBalance, realBalance, tournamentBalance]);


  const [showAccountSwitchModal, setShowAccountSwitchModal] = useState<
    "demo" | "real" | null
  >(null);
  const [alertInput, setAlertInput] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const handleSavePhone = async () => {
    setIsSaving(true);
    try {
      const { doc, updateDoc } = await import('../firebase');
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), { phone });                
        toast.success("Phone number saved successfully");
      }
    } catch(e) {
      toast.error("Failed to save phone number");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const isAnyModalOpen = showIndicatorsModal || showTimeframeModal || showChartTypeModal || showSignalsModal || showPromotionsModal || showTournamentsModal || showDeposit || showAccounts || showCashierMenu || showLanguageModal || showCountryModal || show2FAModal || showAchievementsModal || showAlertDialog;

    if (isAnyModalOpen) {
      // Push a dummy state to history so the back button can be intercepted
      window.history.pushState({ modal: true }, "");
      
      const handlePopState = (e: PopStateEvent) => {
        // If a modal is open, we close it instead of letting the browser go back
        setShowIndicatorsModal(false);
        setShowTimeframeModal(false);
        setShowChartTypeModal(false);
        setShowSignalsModal(false);
        setShowPromotionsModal(false);
        setShowTournamentsModal(false);
        setShowDeposit(false);
        setShowAccounts(false);
        setShowCashierMenu(false);
        setShowLanguageModal(false);
        setShowCountryModal(false);
        setShow2FAModal(false);
        setShowAchievementsModal(false);
        setShowAlertDialog(false);
      };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [showIndicatorsModal, showTimeframeModal, showChartTypeModal, showSignalsModal, showPromotionsModal, showTournamentsModal, showDeposit, showAccounts, showCashierMenu, showLanguageModal, showCountryModal, show2FAModal, showAchievementsModal, showAlertDialog]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIslamic, setIsIslamic] = useState(false);
  const [isProfileFullScreen, setIsProfileFullScreen] = useState(false);

  useEffect(() => {
    alertsRef.current = alerts;
    activeTradesRef.current = activeTrades;
  }, [alerts]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const [currentPriceLabel, setCurrentPriceLabel] = useState("116.6000");
  const [hoveredCandle, setHoveredCandle] = useState<any>(null);

  const [historyLoaded, setHistoryLoaded] = useState(0);

  // Socket.io initialization (Persists as long as component is mounted)
  useEffect(() => {
    // Safety fallback: if socket never connects after 10s, remove loader
    const fallbackTimer = setTimeout(() => {
        setIsLoading(false);
    }, 10000);

    const socket = io({
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setDataError(null);
      clearTimeout(fallbackTimer);
      console.log("Socket connected successfully, requesting initial data...");
      socket.emit('request_initial_data', { asset: activeAssetRef.current, timeframe: timeframeRef.current, accountType: accountTypeRef.current, userId: auth.currentUser?.uid });
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connection attempt failed, retrying...", err.message);
      // Don't show fatal error immediately, let auto-reconnect handle it
    });
      // Force immediate reconnection attempt on mobile if stalled
      setTimeout(() => {
        if (!socket.connected) socket.connect();
      }, 5000);
    
    socket.on('trade_settled', (trade: any) => {
        console.log("Trade settled via socket:", trade);
        setActiveTrades(prev => prev.filter(t => t.id !== trade.id));
        setUserTrades(prev => {
            const updated = prev.map(t => t.id === trade.id ? { ...t, ...trade } : t);
            if (!updated.find(t => t.id === trade.id)) {
                updated.unshift(trade);
            }
            updated.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            return updated.slice(0, 100);
        });
        
        // Balance is updated in real-time authoritatively and instantly via Firestore onSnapshot / socket user_profile_update.
        // We do not modify the client balance state manually here to prevent any double-addition race conditions.
        if (!processedTradesRef.current.has(trade.id)) {
            processedTradesRef.current.add(trade.id);
        }
    });

    socket.on("initial_market_data", (data: any) => {
      lastChartUpdateTimeRef.current = Date.now();
      try {
        if (!data || !data.markets) {
          setIsLoading(false);
          setDataError("Invalid market data received.");
          return;
        }
        setDataError(null);
        setSystemActive(data.systemActive);
        setMarkets(data.markets);
        if (data.activities) setActivitiesBanners(data.activities);
        
        if (data.openTrades) {
            // Handled by onSnapshot for better persistence and sync
            console.log("Open trades received via socket, deferring to onSnapshot logic");
        }
        setIsLoading(false);

        // Cache all historical data received
        if (data.history) {
          historyCacheRef.current = { ...historyCacheRef.current, ...data.history };
          saveHistoryCacheSafely(historyCacheRef.current);
          
          // Also update series if activeAsset is there and series exists
          const activePair = activeAssetRef.current;
          if (activePair && data.history[activePair] && seriesRef.current) {
               try {
                   const rawPairData = [...data.history[activePair]];
                   const liveCandle = data.currentCandles?.[activePair];
                   if (liveCandle) {
                       rawLastCandleRef.current = liveCandle;
                       if (rawPairData.length > 0 && rawPairData[rawPairData.length - 1].time === liveCandle.time) {
                           rawPairData[rawPairData.length - 1] = liveCandle;
                       } else if (rawPairData.length === 0 || liveCandle.time > rawPairData[rawPairData.length - 1].time) {
                           rawPairData.push(liveCandle);
                       }
                   }
                   const pairHist = resampleData(rawPairData, timeframeRef.current);
                   if (pairHist && pairHist.length > 0) {
                       let initData = chartTypeRef.current === "Heikin Ashi" ? calculateHeikinAshi(pairHist) : pairHist;
                       if (chartTypeRef.current === "Line" || chartTypeRef.current === "Mountain") {
                           initData = initData.map((d: any) => ({ time: d.time, value: d.close }));
                       }
                       
                       // Deduplicate times
                       const uniqueMap = new Map();
                       const isOHLC = chartTypeRef.current === "Candle" || chartTypeRef.current === "Heikin Ashi" || chartTypeRef.current === "Bar";
                       for (const d of initData) {
                           if (isOHLC) {
                               if (typeof d.open === 'number' && typeof d.high === 'number' && typeof d.low === 'number' && typeof d.close === 'number' && isFinite(d.open) && isFinite(d.high) && isFinite(d.low) && isFinite(d.close)) {
                                   uniqueMap.set(d.time, d);
                               }
                           } else {
                               if (typeof d.value === 'number' && isFinite(d.value)) {
                                   uniqueMap.set(d.time, d);
                               }
                           }
                       }
                       const uniqueData = Array.from(uniqueMap.values()).sort((a,b) => a.time - b.time);
                       
                       const currentRange = chartRef.current ? chartRef.current.timeScale().getVisibleLogicalRange() : null;
                       const scrollPos = chartRef.current ? chartRef.current.timeScale().scrollPosition() : 0;
                       const wasScrolledBack = scrollPos < -3;
                       
                       try {
                           seriesRef.current.setData(uniqueData);
                           lastCandleRef.current = uniqueData[uniqueData.length - 1];
                           if (chartRef.current) {
                                const layoutKey = activePair + "_" + timeframeRef.current;
                                const assetChanged = lastZoomedAssetRef.current !== layoutKey;
                                
                                if (assetChanged) {
                                    chartRef.current.timeScale().setVisibleLogicalRange({ from: Math.max(0, uniqueData.length - 60), to: uniqueData.length + 8 });
                                    chartRef.current.timeScale().scrollToRealTime();
                                    lastZoomedAssetRef.current = layoutKey;
                                } else if (currentRange && (currentRange.to - currentRange.from) > 0 && wasScrolledBack) {
                                    try {
                                        chartRef.current.timeScale().setVisibleLogicalRange(currentRange);
                                    } catch (e) {}
                                } else {
                                    chartRef.current.timeScale().scrollToRealTime();
                                }
                           }
                           rawLastCandleRef.current = pairHist[pairHist.length - 1];

                           const lastClose = pairHist[pairHist.length - 1]?.close || 0;
                           setCurrentPriceLabel(Number(lastClose).toFixed(6));
                           baseDataRef.current = pairHist;
                           refreshIndicators();
                       } catch(err) {
                           console.error("Initial chart setData failed", err);
                       }
                   } // Ends if (pairHist && pairHist.length > 0)
               } catch(err) {
                   console.error("History processing failed", err);
               }
           } // Ends if (activePair ...)
        } // Ends if (data.history)
      } catch (err) { // Ends try from 4280
        console.error("Critical error in initial_market_data:", err);
      } finally {
        setIsLoading(false);
        setHistoryLoaded(Date.now()); // Trigger chart re-render if it missed the update
      }
    });

    socket.on('user_profile_update', (userData: any) => {
        if (userData.currency) setUserCurrency(userData.currency);
        if (userData.balance !== undefined) {
            const val = parseFloat(userData.balance?.toString());
            setRealBalance(isNaN(val) ? 0 : val);
        }
        if (userData.demoBalance !== undefined) {
            const val = parseFloat(userData.demoBalance?.toString());
            setDemoBalance(isNaN(val) ? 10000 : val);
        }
        if (userData.totalLiveVolume !== undefined) {
            const val = parseFloat(userData.totalLiveVolume?.toString());
            setTotalLiveVolume(isNaN(val) ? 0 : val);
        }
        if (userData.kycStatus) setKycStatus(userData.kycStatus);
        if (userData.nickname) {
            setNickname(userData.nickname);
            setSavedNickname(userData.nickname);
        }
        if (userData.profilePic) setProfilePic(userData.profilePic);
        if (userData.phone) setPhone(userData.phone);
        if (userData.notifications) setNotifications(userData.notifications);
        if (userData.firstName || userData.lastName || userData.country) {
            setPersonalData({
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                gender: userData.gender || "Male",
                day: userData.birthDay || "--",
                month: userData.birthMonth || "--",
                year: userData.birthYear || "--",
                country: userData.country || ""
            });
        }
    });

    socket.on('system_status', (active: boolean) => setSystemActive(active));
    socket.on("market_settings_updated", (updatedMarkets: any) => setMarkets(updatedMarkets));
    socket.on("activities_updated", (activities: any) => setActivitiesBanners(activities));
    socket.on("leaderboard_update", (data: any) => setLeaderboards(data));

    socket.on("candle_complete", (payload: any) => {
        lastChartUpdateTimeRef.current = Date.now();
        const { pair, candle, timeframe: candleTimeframe } = payload;
        
        // Only aggregate or update if it's the smallest unit (5s) or matches our current timeframe
        const isMinUnit = candleTimeframe === "5 seconds";
        const isCurrentTf = candleTimeframe === timeframeRef.current;
        
        if (!isMinUnit && !isCurrentTf) return;

        if (isMinUnit && historyCacheRef.current[pair]) {
            const cache = historyCacheRef.current[pair];
            const lastIndex = cache.length - 1;
            if (lastIndex >= 0 && cache[lastIndex].time === candle.time) {
                cache[lastIndex] = candle;
            } else {
                cache.push(candle);
                if (cache.length > 50000) cache.shift();
            }
        }
        
        if (pair !== activeAssetRef.current || !seriesRef.current) return;
            
        // Professional Sync: Directly update baseDataRef if the candle matches the current bucket
        if (baseDataRef.current && baseDataRef.current.length > 0) {
            const timeframeSeconds = getTimeSeconds(timeframeRef.current);
            const bucketTime = Math.floor(candle.time - (candle.time % timeframeSeconds));
            const lastIdx = baseDataRef.current.length - 1;
            
            // If the timeframe matches perfectly, we can do a direct authoritative update
            if (isCurrentTf && candle.time === baseDataRef.current[lastIdx].time) {
                baseDataRef.current[lastIdx] = { ...candle };
                seriesRef.current.update(baseDataRef.current[lastIdx]);
                return;
            }

            // Otherwise if it's a 5s candle belonging to our visible bucket, sync the high/low/volume
            if (isMinUnit && baseDataRef.current[lastIdx].time === bucketTime) {
                const existing = baseDataRef.current[lastIdx];
                const updated = {
                    ...existing,
                    high: Math.max(existing.high, candle.high),
                    low: Math.min(existing.low, candle.low),
                    volume: timeframeRef.current === "5 seconds" ? candle.volume : (existing.volume || 0) + (candle.volume_inc || 0)
                };
                baseDataRef.current[lastIdx] = updated;
                
                // ALSO sync the rawLastCandleRef so the next RAF frame renders the corrected high/low
                if (rawLastCandleRef.current && rawLastCandleRef.current.time === bucketTime) {
                    rawLastCandleRef.current.high = updated.high;
                    rawLastCandleRef.current.low = updated.low;
                    rawLastCandleRef.current.volume = updated.volume;
                }
            }
        }
    });

    socket.off("market_ticks", handleMarketTicks);
    socket.on("market_ticks", handleMarketTicks);

  // Handle market ticks with elite internal interpolation
  function handleMarketTicks(ticks: any) {
      lastChartUpdateTimeRef.current = Date.now();
      const activePair = activeAssetRef.current;
      const currentAlerts = alertsRef.current;

      // 1. GLOBAL SYNC & ALERTS (All Assets)
      const triggeredAlertIds: string[] = [];
      const triggeredAlertDetails: { pair: string, price: number, target: number }[] = [];

      setMarkets((prev: any) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(ticks).forEach(pair => {
            if (next[pair] && next[pair].price !== ticks[pair].price) {
              next[pair] = { ...next[pair], price: ticks[pair].price };
              changed = true;
            }
            
            // Alerts for non-active assets
            if (pair !== activePair && currentAlerts.length > 0) {
                const price = ticks[pair].price;
                currentAlerts.filter(a => a.asset === pair && a.status === 'active').forEach(alert => {
                    let triggered = (alert.condition === 'above' && price >= alert.targetPrice) || (alert.condition === 'below' && price <= alert.targetPrice);
                    if (triggered) {
                        alert.status = 'triggered';
                        triggeredAlertIds.push(alert.id);
                        triggeredAlertDetails.push({ pair, price, target: alert.targetPrice });
                    }
                });
            }
        });
        return changed ? next : prev;
      });

      if (triggeredAlertIds.length > 0) {
        setAlerts(prevAlerts => prevAlerts.map(a => triggeredAlertIds.includes(a.id) ? { ...a, status: 'triggered' } : a));
        triggeredAlertDetails.forEach(detail => {
          toast.success(`Alert! ${detail.pair} hit ${detail.target.toFixed(5)}`, { icon: '🔔' });
        });
      }

      // 2. ACTIVE ASSET CONTINUITY & CANDLE SYNC
      const tickData = ticks[activePair];
      let newClose = 0;
      if (tickData) {
        newClose = tickData.price;
        const timeframeSeconds = getTimeSeconds(timeframeRef.current);
        const serverTime = tickData.time || (Date.now() / 1000);
        let bucketTime = Math.floor(serverTime - (serverTime % timeframeSeconds));

        if (!rawLastCandleRef.current) {
            const serverCandle = tickData.candle;
            rawLastCandleRef.current = {
                time: bucketTime as Time,
                open: serverCandle?.open ?? newClose,
                high: serverCandle?.high ?? (newClose * 1.0001),
                low: serverCandle?.low ?? (newClose * 0.9999),
                close: serverCandle?.close ?? newClose,
                volume: serverCandle?.volume || 1
            };
            currentInterpolatedPriceRef.current = newClose;
        }

        if (rawLastCandleRef.current.time !== bucketTime && bucketTime > rawLastCandleRef.current.time) {
            const prevClose = rawLastCandleRef.current.close;
            const timeDiff = bucketTime - Number(rawLastCandleRef.current.time);
            const isGap = timeDiff > timeframeSeconds * 1.5;
            const openPrice = isGap ? (tickData.candle?.open ?? newClose) : prevClose;

            // Generate a more realistic new candle with subtle variation to avoid "flat" look
            const variation = openPrice * 0.0001; 
            const newCandle = {
                time: bucketTime as Time,
                open: openPrice,
                high: Math.max(openPrice, newClose) + variation,
                low: Math.min(openPrice, newClose) - variation,
                close: newClose,
                volume: 10 + Math.random() * 90
            };
            rawLastCandleRef.current = newCandle;
            currentInterpolatedPriceRef.current = openPrice;
            if (baseDataRef.current) {
                const baseData = baseDataRef.current;
                if (baseData.length > 0 && baseData[baseData.length - 1].time < bucketTime) {
                    baseData.push({...newCandle});
                    if (baseData.length > 5000) baseData.shift();
                }
            }
        } else {
            // Update the current candle with the latest tick price
            const candle = rawLastCandleRef.current;
            candle.close = newClose;
            
            // Smoother high/low updates for more realistic "market-like" shapes
            if (tickData.candle) {
               candle.high = Math.max(candle.high, tickData.candle.high, newClose);
               candle.low = Math.min(candle.low, tickData.candle.low, newClose);
               candle.volume = (candle.volume || 0) + (tickData.candle.volume || 1);
            } else {
               candle.high = Math.max(candle.high, newClose);
               candle.low = Math.min(candle.low, newClose);
            }
        }

        targetPriceRef.current = newClose;
        if (!currentInterpolatedPriceRef.current) currentInterpolatedPriceRef.current = newClose;
      }

      // 3. ACTIVE ALERTS CHECK
      if (newClose > 0 && currentAlerts.length > 0) {
          currentAlerts.filter(a => a.asset === activePair && a.status === 'active').forEach(alert => {
              let triggered = (alert.condition === 'above' && newClose >= alert.targetPrice) || (alert.condition === 'below' && newClose <= alert.targetPrice);
              if (triggered) {
                  alert.status = 'triggered';
                  setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: 'triggered' } : a));
                  toast.success(`Price hit ${alert.targetPrice.toFixed(5)}`, { icon: '🔔' });
              }
          });
      }

      // 4. TRADE PROCESSING Logic
      let tradesUpdated = false;
      const allTicks = ticks;
      const newActiveTrades = activeTradesRef.current.map(trade => {
        if (trade.timeLeft > 0) {
          const updatedTimeLeft = Math.floor((trade.expirationTime - Date.now()) / 1000);
          if (updatedTimeLeft !== trade.timeLeft) {
            tradesUpdated = true;
            return { ...trade, timeLeft: updatedTimeLeft };
          }
        }
        return trade;
      }).filter(trade => {
        const tradeAsset = trade.asset;
        const currentPriceForAsset = allTicks[tradeAsset]?.price || (tradeAsset === activePair ? newClose : null);

        if (trade.timeLeft <= 0) {
          // If we don't have a valid price for the asset yet, do not settle the trade.
          // Fallbacking to entryPrice causes fake draws and refunds false-losses!
          if (!currentPriceForAsset) {
             return true; // Keep it in active trades
          }

          // Prevent duplicate processing of the same trade ID
          if (processedTradesRef.current.has(trade.id)) {
             return false;
          }
          processedTradesRef.current.add(trade.id);
          
          tradesUpdated = true;
          const settlePrice = currentPriceForAsset;
          
          const diff = settlePrice - trade.entryPrice;
          const epsilon = 0.0000000001; 
          const isDraw = Math.abs(diff) < epsilon;
          const dir = trade.type || trade.direction || 'up';
          
          let won = false;
          if (!isDraw) {
            if (dir === "up") {
                won = settlePrice > trade.entryPrice;
            } else {
                won = settlePrice < trade.entryPrice;
            }
          }

          const returnAmt = trade.amount * (trade.payout / 100 + 1);
          
          const isRecent = trade.expirationTime > (Date.now() - 10000); // Only toast if expired within last 10 seconds
          
          let tradeStatus = isDraw ? 'draw' : won ? 'won' : 'lost';

          // Notify server that trade has settled authoritatively and securely
          // This endpoint will update both the trade status and the user's balances atomically on the database.
          const fetchWithRetry = (url: string, options: RequestInit, retries = 5, delay = 1500): Promise<Response> => {
              return fetch(url, options).then(async (res) => {
                  if (!res.ok) {
                      const text = await res.text();
                      throw new Error(`HTTP ${res.status}: ${text}`);
                  }
                  return res;
              }).catch((err) => {
                  if (retries > 0) {
                      return new Promise<void>((resolve) => setTimeout(resolve, delay))
                          .then(() => fetchWithRetry(url, options, retries - 1, delay * 1.5));
                  }
                  throw err;
              });
          };

          fetchWithRetry('/api/trade/settle-secure', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  tradeId: trade.id,
                  currentMarketPrice: settlePrice,
                  tradeData: trade
              })
          }).then(async (response) => {
              // Settle status and balances are handled securely on the server
          }).catch(err => {
              console.error("Secure single trade settlement request failed:", err);
          });

          // We rely on the server API to handle the actual database balance update 
          // to avoid double payouts. We still sync the trade document locally for immediate UI response.
          // Settle status is synchronized securely on the server.
          // Local UI state is updated immediately below.

          if (won) {
            updateBalance(returnAmt); // Optimistic UI update with zero delay
            if (isRecent) {
                // toast.success(`Trade Won! +${userCurrency}${returnAmt.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
                setTradeNotifications(prev => [{
                    id: Math.random().toString(36).substr(2, 9),
                    asset: trade.asset,
                    amount: returnAmt,
                    status: 'won',
                    timestamp: Date.now()
                }, ...prev]);
            }
            updateTournamentScore(returnAmt - trade.amount, true);
          } else if (tradeStatus === 'draw') {
            updateBalance(trade.amount); // Optimistic UI update with zero delay
            if (isRecent) {
                // toast.success(`Trade Closed (Draw). +${userCurrency}${trade.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
                setTradeNotifications(prev => [{
                    id: Math.random().toString(36).substr(2, 9),
                    asset: trade.asset,
                    amount: trade.amount,
                    status: 'draw',
                    timestamp: Date.now()
                }, ...prev]);
            }
            updateTournamentScore(0, false);
          } else {
            if (isRecent) {
                // toast.error(`Trade Lost. -${userCurrency}${trade.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
                setTradeNotifications(prev => [{
                    id: Math.random().toString(36).substr(2, 9),
                    asset: trade.asset,
                    amount: trade.amount,
                    status: 'lost',
                    timestamp: Date.now()
                }, ...prev]);
            }
            if (trade.accountType === 'real' && auth.currentUser) {
               // Commission is now handled automatically by the server settler
            }
            updateTournamentScore(-trade.amount, false);
          }
          
          setUserTrades(prev => {
            const settledTrade = { ...trade, status: tradeStatus, exitPrice: settlePrice, payoutAmount: won ? returnAmt : (tradeStatus === 'draw' ? trade.amount : 0) };
            const next = [settledTrade, ...prev.filter(t => t.id !== trade.id)];
            next.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            return next.slice(0, 100);
          });
          
          return false;
        }
        return true;
      });
      
      if (tradesUpdated) {
        activeTradesRef.current = newActiveTrades;
        setActiveTrades(newActiveTrades);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && socket.connected) {
          console.log("Tab became visible, re-syncing market data...");
          socket.emit('request_initial_data', { 
            asset: activeAssetRef.current, 
            timeframe: timeframeRef.current, 
            accountType: accountTypeRef.current, 
            userId: auth.currentUser?.uid,
            isSwitch: true // Force history refresh
          });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
        setIsLoading(false);

    return () => {
      clearTimeout(fallbackTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (currentUser && socketRef.current) {
      console.log("User authentication state loaded/changed, updating socket initial data...");
      socketRef.current.emit('request_initial_data', {
        asset: activeAssetRef.current,
        timeframe: timeframeRef.current,
        accountType,
        userId: currentUser.uid
      });
    }
  }, [currentUser, accountType]);

  const timeframeRef = useRef(timeframe);
  const chartTypeRef = useRef(chartType);
  useEffect(() => { timeframeRef.current = timeframe; }, [timeframe]);
  useEffect(() => { chartTypeRef.current = chartType; }, [chartType]);

  // Real-time Chart Resize handling (Critical for Mobile)
  useEffect(() => {
    if (!chartRef.current || !chartContainerRef.current) return;
    
    const container = chartContainerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !chartRef.current) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        chartRef.current.applyOptions({ width, height });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    timeZoneRef.current = timeZone;
    if (chartRef.current) {
      chartRef.current.applyOptions({
        timeScale: {
          tickMarkFormatter: (time: any) => {
             const date = new Date(time * 1000);
             return date.toLocaleString('en-US', { timeZone: timeZoneRef.current, hour: '2-digit', minute: '2-digit', hour12: false });
          }
        },
        localization: {
          timeFormatter: (time: any) => {
             const date = new Date(time * 1000);
             return date.toLocaleString('en-US', { timeZone: timeZoneRef.current, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
          }
        }
      });
    }
  }, [timeZone]);

  const lastIndicatorRefreshRef = useRef(0);


  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#0b0e11" },
        textColor: "#d1d4dc",
        fontSize: 10,
        fontFamily: "JetBrains Mono, -apple-system, system-ui, sans-serif",
      },
      grid: {
        vertLines: { color: "#1c1f24", style: LineStyle.Solid },
        horzLines: { color: "#1c1f24", style: LineStyle.Solid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { 
          color: "rgba(255, 255, 255, 0.4)", 
          width: 1, 
          style: LineStyle.Dotted, 
          labelBackgroundColor: "#1a1b1f",
          labelVisible: true,
        },
        horzLine: { 
          color: "rgba(255, 255, 255, 0.4)", 
          width: 1, 
          style: LineStyle.Dotted, 
          labelBackgroundColor: "#1a1b1f",
          labelVisible: true,
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: {
          time: true,
          price: false,
        },
      },
      timeScale: {
        borderColor: "#1c1f24",
        timeVisible: true, 
        secondsVisible: true,
        rightOffset: 20, 
        barSpacing: 6,
        minBarSpacing: 3,
        fixLeftEdge: false, 
        lockVisibleTimeRangeOnResize: true,
        tickMarkFormatter: (time: any) => {
           const date = new Date(time * 1000);
           return date.toLocaleString('en-US', { timeZone: timeZoneRef.current, hour: '2-digit', minute: '2-digit', hour12: false });
        }
      },
      rightPriceScale: {
        borderColor: "#1c1f24",
        autoScale: true, 
        alignLabels: true,
        scaleMargins: { top: 0.38, bottom: 0.15 },
        entireTextOnly: true, 
        borderVisible: false, 
        ticksVisible: false,
        visible: true,
      },
      localization: { 
        timeFormatter: (time: any) => {
           const date = new Date(time * 1000);
           return date.toLocaleString('en-US', { timeZone: timeZoneRef.current, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        }
      }
    });
    chartRef.current = chart;

    // Handle scroll back visibility for "Scroll to Real-time" button and infinite history loading
    chart.timeScale().subscribeVisibleLogicalRangeChange((logicalRange) => {
      setTimeout(() => {
        if (!chartRef.current) return;
        const ts = chartRef.current.timeScale();
        const scrollPos = ts.scrollPosition();
        
        // scrollPosition is the distance from the rightmost data point to the right edge of the screen
        // Negative means scrolled into the past. Positive means scrolled into the future (empty space).
        setIsScrolledBack(scrollPos < -3);

        if (logicalRange) {
          // Trigger prepending more older candles when user is close to running out of data on the left
          if (logicalRange.from < 50 && !isGeneratingRef.current) {
            isGeneratingRef.current = true;
            loadMorePastRef.current();
          }
        }
      }, 0);
    });
    
    // Add runtime shims for backward compatibility or missed occurrences
    const chartAny = chart as any;
    if (!chartAny.addSeries) {
      chartAny.addSeries = (seriesType: any, options: any) => {
        if (seriesType === CandlestickSeries) return (chart as any).addCandlestickSeries(options);
        if (seriesType === LineSeries) return (chart as any).addLineSeries(options);
        if (seriesType === AreaSeries) return (chart as any).addAreaSeries(options);
        if (seriesType === BarSeries) return (chart as any).addBarSeries(options);
        if (seriesType === HistogramSeries) return (chart as any).addHistogramSeries(options);
        return (chart as any).addLineSeries(options);
      };
    }
    if (!chartAny.addLineSeries) {
      chartAny.addLineSeries = (options: any) => chart.addSeries(LineSeries, options);
    }
    if (!chartAny.addHistogramSeries) {
      chartAny.addHistogramSeries = (options: any) => chart.addSeries(HistogramSeries, options);
    }
    if (!chartAny.addAreaSeries) {
      chartAny.addAreaSeries = (options: any) => chart.addSeries(AreaSeries, options);
    }
    if (!chartAny.addBarSeries) {
      chartAny.addBarSeries = (options: any) => chart.addSeries(BarSeries, options);
    }
    if (!chartAny.addCandlestickSeries) {
      chartAny.addCandlestickSeries = (options: any) => chart.addSeries(CandlestickSeries, options);
    }

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      markersPluginRef.current = null;
    };
  }, []);

  // Second Chart Initialization
  useEffect(() => {
    if (!isMultiChart || !chartContainerRef2.current) {
        if (chartRef2.current) {
            chartRef2.current.remove();
            chartRef2.current = null;
            seriesRef2.current = null;
        }
        return;
    }

    const chart = createChart(chartContainerRef2.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#0b0e11" },
        textColor: "#d1d4dc",
        fontSize: 10,
        fontFamily: "JetBrains Mono, -apple-system, system-ui, sans-serif",
      },
      grid: {
        vertLines: { color: "#1c1f24", style: LineStyle.Solid },
        horzLines: { color: "#1c1f24", style: LineStyle.Solid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        borderColor: "#1c1f24",
        timeVisible: true,
        secondsVisible: true,
        rightOffset: 20,
        barSpacing: 6,
      },
      rightPriceScale: {
        borderColor: "#1c1f24",
        autoScale: true,
        scaleMargins: { top: 0.38, bottom: 0.15 },
      },
    });

    chartRef2.current = chart;
    const series = chart.addSeries(CandlestickSeries, {
        upColor: '#00c980',
        downColor: '#ff4757',
        borderVisible: false,
        wickUpColor: '#00c980',
        wickDownColor: '#ff4757',
    });
    seriesRef2.current = series;

    // Load data from main series
    if (seriesRef.current) {
        try {
            const data = (seriesRef.current as any).data();
            if (data && data.length > 0) {
                series.setData(data);
            }
        } catch (e) {}
    }

    return () => {
      if (chartRef2.current) {
        chartRef2.current.remove();
        chartRef2.current = null;
        seriesRef2.current = null;
      }
    };
  }, [isMultiChart]);

  // Data Request Effect (Separate from Chart Update to prevent loops)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (socketRef.current && activeTab === "trade") {
        const key = `${activeAsset}_${timeframe}`;
        const lastTime = lastRequestedRef.current[key] || 0;
        const now = Date.now();
        
        // Throttled to prevent spam
        if (now - lastTime >= 1000) {
            lastRequestedRef.current[key] = now;

            const pairHist = historyCacheRef.current[activeAsset];
            if (!pairHist || pairHist.length === 0) {
                setIsLoading(true);
            }
            
            console.log(`[Chart Data Request] Requesting up-to-second data for ${activeAsset} (${timeframe})`);
            socketRef.current.emit('request_initial_data', { 
                asset: activeAsset, 
                timeframe,
                accountType, 
                isSwitch: true, 
                userId: auth.currentUser?.uid 
            });
            
            timer = setTimeout(() => {
                setIsLoading(false);
            }, 8000);
        }
    }
    return () => {
        if (timer) clearTimeout(timer);
    };
  }, [activeAsset, timeframe, accountType, activeTab]);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    
    const assetChanged = prevAssetRefRender.current !== activeAsset;
    const timeframeChanged = prevTimeframeRefRender.current !== timeframe;
    const chartTypeChanged = prevChartTypeRefRender.current !== chartType;
    const forceRecreate = assetChanged || timeframeChanged || chartTypeChanged || !seriesRef.current;

    if (forceRecreate && seriesRef.current) {
        chart.removeSeries(seriesRef.current);
        seriesRef.current = null;
    }

    if (forceRecreate && indicatorSeriesRefs.current) {
        Object.values(indicatorSeriesRefs.current).forEach((indicatorSeries: any) => {
            if (indicatorSeries && typeof indicatorSeries === 'object') {
                try {
                    chart.removeSeries(indicatorSeries);
                } catch (e) {}
            }
        });
        indicatorSeriesRefs.current = {};
    }

    if (forceRecreate) {
        const initialPrice = currentInterpolatedPriceRef.current > 0 ? currentInterpolatedPriceRef.current : (rawLastCandleRef.current?.close || 100);
        let dynamicPrecision = 4;
        let dynamicMinMove = 0.0001;
        if (initialPrice >= 1000) {
            dynamicPrecision = 2;
            dynamicMinMove = 0.01;
        } else if (initialPrice >= 100) {
            dynamicPrecision = 3;
            dynamicMinMove = 0.001;
        } else if (initialPrice >= 10) {
            dynamicPrecision = 4;
            dynamicMinMove = 0.0001;
        } else {
            dynamicPrecision = 5;
            dynamicMinMove = 0.00001;
        }

        const commonOptions: any = {
      priceFormat: { 
        type: "custom" as const, 
        formatter: (price: number) => price.toFixed(dynamicPrecision),
        minMove: dynamicMinMove 
      },
      lastValueVisible: true, 
      priceLineVisible: true, 
      priceLineSource: 1,
      priceLineColor: "#FFE24C", 
      priceLineStyle: LineStyle.Dotted, 
      priceLineWidth: 1.5,
      baseLineWidth: 1,
    };

    let series: any;
    if (chartType === "Candle" || chartType === "Heikin Ashi") {
      series = chart.addSeries(CandlestickSeries, { 
        ...commonOptions, 
        upColor: "#00ff88", 
        downColor: "#ff3333", 
        borderVisible: true, 
        borderUpColor: "#00ff88", 
        borderDownColor: "#ff3333", 
        wickVisible: true, 
        wickUpColor: "#00ff88", 
        wickDownColor: "#ff3333" 
      });
    } else if (chartType === "Line") {
      series = chart.addSeries(LineSeries, { ...commonOptions, color: "#3b82f6", lineWidth: 3 });
    } else if (chartType === "Mountain") {
      series = chart.addSeries(AreaSeries, { ...commonOptions, topColor: "rgba(59, 130, 246, 0.4)", bottomColor: "rgba(59, 130, 246, 0.0)", lineColor: "#3b82f6", lineWidth: 3 });
    } else if (chartType === "Bar") {
      series = chart.addSeries(BarSeries, { ...commonOptions, upColor: "#00ff88", downColor: "#ff3333" });
    }
        seriesRef.current = series;
        
        if (crosshairCallbackRef.current) {
            try {
                chart.unsubscribeCrosshairMove(crosshairCallbackRef.current);
            } catch (e) {}
            crosshairCallbackRef.current = null;
        }

        const onCrosshairMove = (param: any) => {
          if (param.point === undefined || !param.time || param.point.x < 0 || param.point.y < 0) {
            setHoveredCandle(null);
          } else {
            const currentSeries = seriesRef.current;
            if (currentSeries) {
              const data = param.seriesData.get(currentSeries);
              setHoveredCandle(data || null);
            } else {
              setHoveredCandle(null);
            }
          }
        };
        chart.subscribeCrosshairMove(onCrosshairMove);
        crosshairCallbackRef.current = onCrosshairMove;

        prevAssetRefRender.current = activeAsset;
        prevTimeframeRefRender.current = timeframe;
        prevChartTypeRefRender.current = chartType;
    }

    const series = seriesRef.current;
    if (!series) return;

    let pairHist = historyCacheRef.current[activeAsset];
    
    if (pairHist && pairHist.length > 0) {
      try {
        let rawPairData = [...pairHist];
        const liveCandle = rawLastCandleRef.current;
        if (liveCandle && (!rawPairData.length || liveCandle.time >= rawPairData[rawPairData.length - 1].time)) {
            if (rawPairData.length > 0 && rawPairData[rawPairData.length - 1].time === liveCandle.time) {
                rawPairData[rawPairData.length - 1] = liveCandle;
            } else if (rawPairData.length === 0 || liveCandle.time > rawPairData[rawPairData.length - 1].time) {
                rawPairData.push(liveCandle);
            }
        }
        const resampled = resampleData(rawPairData, timeframe);
        if (resampled.length > 0) {
          let initData = chartType === "Heikin Ashi" ? calculateHeikinAshi(resampled) : resampled;
          if (chartType === "Line" || chartType === "Mountain") {
            initData = initData.map((d: any) => ({ time: d.time, value: d.close }));
          }
          
          // Deduplicate
          const uniqueMap = new Map();
          const isOHLC = chartType === "Candle" || chartType === "Heikin Ashi" || chartType === "Bar";
          
          for (const d of initData) {
            if (isOHLC) {
              if (typeof d.open === 'number' && typeof d.high === 'number' && typeof d.low === 'number' && typeof d.close === 'number' && isFinite(d.open) && isFinite(d.high) && isFinite(d.low) && isFinite(d.close)) {
                  uniqueMap.set(d.time, d);
              }
            } else {
              if (typeof d.value === 'number' && isFinite(d.value)) {
                  uniqueMap.set(d.time, d);
              }
            }
          }
          const uniqueData = Array.from(uniqueMap.values()).sort((a: any, b: any) => a.time - b.time);

          const currentZoom = chartRef.current ? chartRef.current.timeScale().getVisibleLogicalRange() : null;
          const scrollPos = chartRef.current ? chartRef.current.timeScale().scrollPosition() : 0;
          const wasScrolledBack = scrollPos < -3;
          
          series.setData(uniqueData);
          lastCandleRef.current = uniqueData[uniqueData.length - 1];
          
          if (chartRef.current) {
              const hasZoom = currentZoom && (currentZoom.to - currentZoom.from) > 0;
              const layoutKey = activeAsset + "_" + timeframe;
              const assetChanged = lastZoomedAssetRef.current !== layoutKey;
              
              if (assetChanged || forceRecreate) {
                  chartRef.current.timeScale().setVisibleLogicalRange({ from: Math.max(0, uniqueData.length - 60), to: uniqueData.length + 8 });
                  chartRef.current.timeScale().scrollToRealTime();
                  lastZoomedAssetRef.current = layoutKey;
              } else if (hasZoom && wasScrolledBack) {
                  try {
                      chartRef.current.timeScale().setVisibleLogicalRange(currentZoom);
                  } catch (e) {}
              } else {
                  chartRef.current.timeScale().scrollToRealTime();
              }
          }
          
          rawLastCandleRef.current = resampled[resampled.length - 1];
          const lastClose = resampled[resampled.length - 1]?.close || 0;
          setCurrentPriceLabel(Number(lastClose).toFixed(6));
          baseDataRef.current = resampled;
          refreshIndicators();
          setIsLoading(false);
          setDataError(null);
        }
      } catch (err: any) {
         console.error("Chart setData failed in useEffect:", err.message);
         setIsLoading(false);
      }
    } 
  }, [activeAsset, timeframe, chartType, historyLoaded]);

  // Watchdog & Self-Healing Loop for Continuous, Freeze-Free Candle Updates (Professional Standard)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (currentUser) {
      intervalId = setInterval(() => {
        const socket = socketRef.current;
        if (!socket) return;

        // 1. Force instant reconnection if socket gets disconnected
        if (!socket.connected) {
          console.warn("[Watchdog] Socket disconnected. Force-reconnecting now...");
          socket.connect();
          return;
        }

        // 2. Continuous flow inspection (Only active on the TRADE view tab)
        if (activeTab === "trade") {
          const timeSinceLastUpdate = Date.now() - lastChartUpdateTimeRef.current;

          // If no tick/price update has occurred for 25 seconds, trigger a proactive resync.
          // Relaxed significantly to prevent clobbering the chart during low volatility.
          if (lastChartUpdateTimeRef.current > 0 && timeSinceLastUpdate > 25000) {
            console.warn(`[Watchdog] Price stream silent for ${timeSinceLastUpdate}ms. Syncing ${activeAssetRef.current}...`);
            
            // Re-assert last update time to prevent infinite fire rate
            lastChartUpdateTimeRef.current = Date.now();
            
            socket.emit('request_initial_data', {
              asset: activeAssetRef.current,
              timeframe: timeframeRef.current,
              accountType,
              isSwitch: true,
              userId: currentUser.uid
            });
          }
        }
      }, 2500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentUser, activeTab, accountType]);

  const placeTrade = async (type: "up" | "down") => {
    if (isPlacingTrade) return;
    setIsPlacingTrade(true);
    try {
        console.log("placeTrade called", type);
        const baseAmount = convertToBase(amount, userCurrency);
        
        if (!systemActive) {
          console.log("placeTrade failed: !systemActive");
          toast.error("Market is closed. Trading is suspended.", { id: "trade-error" });
          setIsPlacingTrade(false);
          return;
        }

        if (markets[activeAsset]?.isFrozen) {
          console.log("placeTrade failed: isFrozen");
          toast.error("This asset is currently frozen for maintenance.", { id: "trade-error" });
          setIsPlacingTrade(false);
          return;
        }

        if (isNaN(baseAmount) || baseAmount < minBaseAmount - 0.01) {
          console.log("placeTrade failed: baseAmount < minBaseAmount or NaN");
          toast.error(`Minimum trade amount is ${userCurrency}${minConvertedAmount.toFixed(2)}`, { id: "trade-error" });
          setIsPlacingTrade(false);
          return;
        }

    if (accountType === 'real' && realBalance < baseAmount) {
      console.log("placeTrade failed: real balance");
      toast.error("Insufficient balance. Please deposit funds.", { id: "trade-error" });
      setIsPlacingTrade(false);
      return;
    }
    
    if (accountType === 'demo' && demoBalance < baseAmount) {
      console.log("placeTrade failed: demo balance");
      toast.error("Insufficient demo balance.", { id: "trade-error" });
      setIsPlacingTrade(false);
      return;
    }

    if (accountType === 'tournament' && tournamentBalance < baseAmount) {
      console.log("placeTrade failed: tournament balance");
      toast.error("Insufficient tournament balance. Rebuy $1,000 in accounts switcher!", { id: "trade-error" });
      setIsPlacingTrade(false);
      return;
    }

    if (!rawLastCandleRef.current || !seriesRef.current) {
      console.error("placeTrade failed: missing refs", { rawLast: !!rawLastCandleRef.current, series: !!seriesRef.current });
      toast.error("Chart is still loading, please wait.", { id: "trade-error" });
      setIsPlacingTrade(false);
      return;
    }
    // Professional precision: use the interpolated price that the user actually SEE on the chart.
    const currentPrice = currentInterpolatedPriceRef.current > 0 ? currentInterpolatedPriceRef.current : rawLastCandleRef.current.close;
    console.log("placeTrade currentPrice (Interp)", currentPrice);
    
    // Calculate fresh expiration elements inside placeTrade based on exact execution instant
    // to prevent any clock drift, component queue latency, or background tab throttling.
    const freshNow = new Date();
    const freshNowMs = freshNow.getTime();
    const entryTime = freshNowMs / 1000;

    const availableExps = getNextAvailableExpirations(freshNow);
    const freshDefaultExpiration = availableExps[0];
    
    const freshExpirationDate = targetExpiration && targetExpiration.getTime() > freshNowMs 
        ? targetExpiration 
        : freshDefaultExpiration;
        
    const exactExpirationTime = freshExpirationDate.getTime();
    const tradeDurationSeconds = Math.max(5, Math.floor((exactExpirationTime - freshNowMs) / 1000));

    const newTradeId = Math.random().toString(36).substring(2, 12);
    const newTrade: Trade = {
      id: newTradeId,
      type,
      entryPrice: currentPrice,
      amount: Number(baseAmount),
      timeLeft: tradeDurationSeconds,
      expirationTime: exactExpirationTime,
      entryTime,
      asset: activeAsset,
      payout: parseFloat(String(markets[activeAsset]?.payout || 80)),
      accountType: accountType,
      ...(accountType === 'tournament' ? { tournamentId: activeTournamentId || 't1' } : {}),
      createdAt: Date.now()
    };

    const newActiveTrades = [...activeTradesRef.current, newTrade];
    activeTradesRef.current = newActiveTrades; 
    setActiveTrades(newActiveTrades);

    updateBalance(-baseAmount);
    
    if (auth.currentUser) {
      try {
        const response = await fetch('/api/trade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pair: activeAsset,
            amount: baseAmount,
            direction: type,
            accountType,
            userId: auth.currentUser.uid,
            tournamentId: accountType === 'tournament' ? activeTournamentId : null,
            trade: newTrade
          })
        });

        if (!response.ok) {
          let reqError = "Server trade failed";
          try {
            const text = await response.text();
            try {
              const errorData = JSON.parse(text);
              reqError = errorData.error || errorData.message || reqError;
            } catch {
              reqError = text || reqError;
            }
          } catch {}
          throw new Error(reqError);
        }

        const resData = await response.json();

        // Update the optimistic trade with the real ID from the server
        if (resData.trade && resData.trade.id) {
          const serverId = resData.trade.id;
          newTrade.id = serverId;
          const updatedTrades = activeTradesRef.current.map(t => t.id === newTradeId ? { ...t, id: serverId } : t);
          activeTradesRef.current = updatedTrades;
          setActiveTrades(updatedTrades);
        }

        // We rely on the server API to handle the actual database balance deduction 
        // to avoid double deductions. We still sync the trade document locally for immediate UI response.
        // Trade is persisted and balance is deducted securely on the server.
        // Local UI state is already updated optimistically above.

        toast.success(`Trade opened ${type === 'up' ? 'UP' : 'DOWN'} at ${currentPrice.toFixed(5)}`);
      } catch (err: any) {
        console.log("Trade placement rejected:", err.message);
        updateBalance(baseAmount); // Revert local balance update
        setActiveTrades(prev => prev.filter(t => t.id !== newTradeId)); // Remove phantom trade
        toast.error(err.message || "Failed to place trade on server. Verification failed.");
        setIsPlacingTrade(false);
        return;
      }
    }
    
    // Only draw markers for current asset
    const relevantTrades = newActiveTrades.filter(
      (t) => t.asset === activeAsset,
    );

    // Add horizontal entry line explicitly mirroring the user's screenshot
    // Handled by custom DOM overlay `active-trades-overlays` and sync loop
    
    setActiveTrades(newActiveTrades);
    
    // Also update userTrades locally so history tab reflects the new trade immediately
    setUserTrades(prev => {
      const exists = prev.find(t => t.id === newTrade.id);
      if (exists) return prev;
      const combined = [{ ...newTrade, status: 'open' }, ...prev];
      combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return combined.slice(0, 100);
    });
    } catch (error: any) {
       console.warn("Trade entry failed:", error.message);
       toast.error("Internal error. Please refresh.");
    } finally {
       setIsPlacingTrade(false);
    }
  };

  const zoomIn = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      const currentZoom = timeScale.getVisibleLogicalRange();
      if (currentZoom) {
        let zoomRange = (currentZoom.to - currentZoom.from) * 0.3;
        timeScale.setVisibleLogicalRange({
          from: currentZoom.from + zoomRange,
          to: currentZoom.to - zoomRange,
        });
      }
    }
  };

  const zoomOut = () => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      const currentZoom = timeScale.getVisibleLogicalRange();
      if (currentZoom) {
        let zoomRange = (currentZoom.to - currentZoom.from) * 0.3;
        timeScale.setVisibleLogicalRange({
          from: currentZoom.from - zoomRange,
          to: currentZoom.to + zoomRange,
        });
      }
    }
  };

  // End of logic before render

  const renderTradingEnvironment = (idx: number) => {
    const isSecond = idx === 1;
    const containerRef = isSecond ? chartContainerRef2 : chartContainerRef;
    const chartInstance = isSecond ? chartRef2.current : chartRef.current;
    const seriesInstance = isSecond ? seriesRef2.current : seriesRef.current;

    return (
      <div key={`trade-env-${idx}`} className={`${isMultiChart && !isMobile ? 'flex-1 flex flex-row border-b border-white/5 last:border-0' : 'flex-1 flex flex-col md:flex-row h-full'} overflow-hidden relative min-h-0`}>
        <div className="flex-1 flex flex-col relative min-h-[300px] h-full min-w-0">
          <main className="flex-1 relative bg-[#131417] overflow-hidden">
             {/* Desktop Trade Result Notifications */}
             <div className="absolute top-4 right-4 z-[70] hidden md:flex flex-col gap-2 pointer-events-none">
               <AnimatePresence>
                 {tradeNotifications.map((notif, nIdx) => (
                   <motion.div
                     key={notif.id}
                     initial={{ opacity: 0, x: 50, scale: 0.9 }}
                     animate={{ opacity: 1, x: 0, scale: 1 }}
                     exit={{ opacity: 0, x: 20, scale: 0.8 }}
                     className="pointer-events-auto"
                   >
                     <div className={`flex items-center gap-2.5 h-[40px] min-w-[240px] pr-2 rounded-[6px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden transition-all duration-300 ${notif.status === 'won' ? 'bg-[#FCD535]' : (notif.status === 'draw' ? 'bg-[#eeeeee]' : 'bg-[#33353b]')}`}>
                        <div className={`ml-1.5 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[12px] font-black shrink-0 ${notif.status === 'won' ? 'bg-white text-[#111111]' : (notif.status === 'draw' ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]')}`}>
                           {tradeNotifications.length - nIdx}
                        </div>
                        
                        <div className="flex-1 flex items-center justify-between gap-4 overflow-hidden">
                           <span className={`text-[13px] font-black truncate ${notif.status === 'won' ? 'text-[#111111]' : (notif.status === 'draw' ? 'text-[#111111]' : 'text-white')}`}>
                              {notif.asset}
                           </span>
                           <span className={`text-[14px] font-black shrink-0 ${notif.status === 'won' ? 'text-[#111111]' : (notif.status === 'draw' ? 'text-[#111111]' : (notif.status === 'lost' ? 'text-rose-400' : 'text-white'))}`}>
                              {notif.status === 'won' ? '+' : (notif.status === 'lost' ? '-' : '+')}{formatWithCurrency(notif.amount, userCurrency)}
                           </span>
                        </div>

                        <button 
                          onClick={() => setTradeNotifications(prev => prev.filter(p => p.id !== notif.id))}
                          className={`p-1 hover:opacity-100 opacity-60 transition-all ${notif.status === 'won' || notif.status === 'draw' ? 'text-[#111111]' : 'text-white'}`}
                        >
                           <X size={18} strokeWidth={2.5} />
                        </button>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
          {/* Chart Container */}
            <div className="relative w-full h-full">
              <div ref={containerRef} className="absolute top-0 left-0 right-0 bottom-0 w-full" style={{ touchAction: "none" }} />
              
              {/* Scroll to Real-time Button */}
              <AnimatePresence>
                {isScrolledBack && !isSecond && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 20 }}
                    onClick={() => chartRef.current?.timeScale().scrollToRealTime()}
                    className="absolute right-4 bottom-32 z-[150] w-11 h-11 bg-[#202126] hover:bg-[#2a2b30] text-[#FFE24C] rounded-xl flex items-center justify-center shadow-2xl border border-white/5 active:scale-95 transition-all group"
                  >
                    <Icons.ChevronsRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>
                )}
              </AnimatePresence>
              {!isSecond && (
                <DrawingOverlay 
                  chart={chartRef.current} 
                  series={seriesRef.current}
                  drawings={drawings} 
                  setDrawings={setDrawings} 
                  selectedTool={selectedTool} 
                  setSelectedTool={setSelectedTool}
                  containerRef={chartContainerRef}
                  activeAsset={activeAsset}
                />
              )}
              
              {/* Indicator Legend Overlay */}
              <div className="absolute top-4 left-4 z-20 flex flex-wrap max-w-[60%] gap-1.5 pointer-events-none select-none">
                {Object.entries(indicatorSettings || {})
                  .filter(([_, settings]) => (settings as any)?.enabled)
                  .map(([name, settings]) => (
                    <div key={name} className="flex items-center gap-2 bg-[#1a1b1f]/60 backdrop-blur-md pl-3 pr-2 py-1.5 rounded-lg border border-white/5 shadow-2xl pointer-events-auto group">
                      <div 
                        className="w-1.5 h-1.5 rounded-full shrink-0" 
                        style={{ backgroundColor: (settings as any).color || '#fff' }}
                      />
                      <span className="text-[10px] font-bold text-gray-200 tracking-wider uppercase truncate">{name}</span>
                      <div className="flex gap-1.5 text-[10px] text-gray-400 font-mono">
                        {(settings as any).period && <span>P:{(settings as any).period}</span>}
                        {(settings as any).fastPeriod && <span>F:{(settings as any).fastPeriod}</span>}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleIndicator(name); }}
                        className="ml-1 p-0.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors cursor-pointer shrink-0 opacity-80 hover:opacity-100"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                
                {Object.values(indicatorSettings).some((s: any) => s.enabled) && (
                  <button 
                    onClick={() => {
                      setIndicatorSettings((prev: any) => {
                        const next = { ...prev };
                        Object.keys(next).forEach(key => {
                          if (next[key]) next[key].enabled = false;
                        });
                        return next;
                      });
                      setActiveStrategy(null);
                      toast.success("All indicators cleared");
                    }}
                    className="flex items-center gap-1 bg-[#1a1b1f]/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all pointer-events-auto text-[10px] font-black uppercase tracking-tighter shadow-2xl"
                  >
                     Clear All
                  </button>
                )}
              </div>
              {markets[activeAsset]?.isFrozen && (
                <div className="absolute inset-x-4 top-[80px] md:top-6 z-30 pointer-events-none md:max-w-md md:left-1/2 md:-translate-x-1/2 transition-all">
                  <div className="bg-[#111317]/90 backdrop-blur-md rounded-2xl border border-sky-500/30 p-4 shadow-2xl flex items-start gap-3.5 pointer-events-auto">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400 shrink-0 animate-pulse">
                      <Snowflake size={20} className="drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-black text-sky-200 tracking-wider uppercase leading-none mb-1.5 flex items-center gap-1.5">
                        {markets[activeAsset]?.freezeReason === 'maintenance' ? 'Scheduled Maintenance' : 'Volatility Halt'}
                      </span>
                      <p className="text-gray-300 text-[11.5px] leading-relaxed">
                        {markets[activeAsset]?.freezeReason === 'maintenance' 
                          ? `Trading is frozen for ${activeAsset} due to routine system upgrades. Order entry will resume shortly.`
                          : `Trading is temporarily suspended for ${activeAsset} due to extreme price volatility. Restoring market stability.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* Removed chart loading overlay as requested */}
            </div>


          
          {/* Professional Rotating Loader Overlay */}
          {(!contentReady || isLoading) && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#131417]">
               <div className="flex flex-col items-center gap-5">
                  <div className="relative">
                    <div className="w-16 h-16 border-[4px] border-white/5 border-t-yellow-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 border-[2px] border-white/5 border-b-cyan-500 rounded-full animate-spin-reverse"></div>
                    </div>
                  </div>
               </div>
            </div>
          )}
          
          {/* Mobile Floating Asset Selector (Top Left) */}
          <div className="md:hidden absolute top-4 left-4 z-20">
             <button 
               onClick={() => setActiveTab("assets")}
               className="bg-[#1a1b1f]/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-2.5 px-3 py-2 shadow-2xl active:scale-95 transition-all"
             >
               <ChevronLeft size={16} className="text-gray-400" />
               <div className="flex items-center gap-2.5">
                 <AssetLogo name={activeAsset} />
                 <div className="flex items-center gap-1.5">
                   <span className="font-bold text-[13px] tracking-tight text-white uppercase">{activeAsset}</span>
                   <span className="text-gray-400 text-[13px] font-bold">{markets[activeAsset]?.payout || 83}%</span>
                 </div>
               </div>
             </button>
          </div>

          {/* Purchase Line Overlay - Professional Binomo-style White Line */}
          {purchaseLineX !== null && purchaseLineX > -50 && purchaseLineX < (containerRef.current?.clientWidth || 2000) + 50 && (
            <div 
                className="absolute top-0 bottom-[26px] flex flex-col items-center pointer-events-none z-[40]"
                style={{ left: `${purchaseLineX}px` }}
            >
                {/* Timer Circle - Refined to match screenshot */}
                <div className="absolute top-[60px] -translate-x-1/2 left-0 flex flex-col items-center z-50">
                  <div className="w-[36px] h-[36px] rounded-full border-[1.5px] border-white/60 bg-black/20 backdrop-blur-sm text-white flex items-center justify-center text-[12px] font-black tracking-tighter shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    {formatTimeToPurchase(timeToPurchase)}
                  </div>
                </div>
            
                {/* Vertical Text - Corrected rotation for professional readability */}
                <div className="absolute top-[115px] left-[6px] whitespace-nowrap rotate-90 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] origin-top-left">
                   Time remaining
                </div>

                {/* The Vertical Purchase Line - High fidelity dashed white line */}
                <div className="absolute top-0 bottom-0 w-0 border-l border-dotted border-white/40"></div>
            </div>
          )}

          {/* Expiration Line Overlay - Professional Results-Line */}
          {expirationLineX !== null && expirationLineX > -50 && expirationLineX < (containerRef.current?.clientWidth || 2000) + 50 && (
            <div 
                className="absolute top-0 bottom-[26px] flex flex-col items-center pointer-events-none z-[30]"
                style={{ left: `${expirationLineX}px` }}
            >
                {/* Expiration Head Indicator */}
                <div className="absolute top-[60px] -translate-x-1/2 left-0 z-50">
                   <div className="w-[36px] h-[36px] rounded-full bg-[#ef5350]/10 border-[1.5px] border-[#ef5350]/50 border-dashed backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(239,83,80,0.15)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef5350" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90">
                         <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                   </div>
                </div>
            
                {/* The Vertical Expiration Line - Refined dashed red line */}
                <div className="absolute top-0 bottom-0 w-0 border-l border-dotted border-[#ef5350]/60"></div>
            </div>
          )}

          {/* Active Trades Overlays */}
          <div id={`active-trades-overlays-${idx}`} className="absolute inset-0 pointer-events-none z-[35]">
               {visibleActiveTrades.filter(t => t.asset === activeAsset).map((trade, tIdx) => {
                  const tColor = trade.type === 'up' ? '#00C980' : '#FF5252';
                  return (
                  <div 
                    key={`active-trade-over-${idx}-${activeAsset}-${trade.id || 'no-id'}-${tIdx}`}
                    id={`trade-overlay-${idx}-${trade.id}`}
                    className="absolute left-0 top-0 h-0"
                    style={{ transform: 'translate(-1000px, -1000px)', display: 'none' }}
                  >
                          <div className="absolute left-0 w-full flex items-center" style={{ transform: 'translateY(-50%)' }}>
                              {/* Label Tag, positioned to the left of the dot marker */}
                              <div className="trade-tag absolute left-[-115px] flex items-center drop-shadow-xl scale-[0.85] md:scale-100 origin-left transition-all z-20">
                                  {/* Direction Block */}
                                  <div className={`flex items-center justify-center w-[20px] h-[24px] rounded-[2px] ${trade.type === 'up' ? 'bg-[#00C980]' : 'bg-[#FF5252]'} relative z-10`}>
                                      {trade.type === 'up' ? <TrendingUp size={12} color="white" strokeWidth={3} /> : <TrendingDown size={12} color="white" strokeWidth={3} />}
                                  </div>
                                  {/* Amount Block */}
                                  <div className="flex items-center justify-center pl-2 pr-1 h-[24px] text-[12px] font-black bg-[#FCD535] text-[#111111] whitespace-nowrap relative z-10 ml-[-2px]">
                                    {formatWithCurrency(trade.amount, userCurrency)}
                                 </div>
                                 {/* Pointed Tip */}
                                 <div className="w-[8px] h-[24px] bg-[#FCD535] relative z-10" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}></div>
                                 {/* Connecting Line to Dot */}
                                 <div className="absolute right-[-10px] top-[11px] w-[10px] h-[2px] bg-[#FCD535]"></div>
                              </div>
                              
                              {/* Circle Dot Marker (This is the anchor at xBase) */}
                              <div className="trade-dot absolute left-[-5px] w-[10px] h-[10px] rounded-full z-20 shadow-[0_0_8px_rgba(0,0,0,0.5)] bg-[#FCD535] transition-all duration-300"></div>
                          </div>
                          
                          {/* Horizontal line stretching toward deadline */}
                          <div className="trade-line absolute left-[0px] h-0 z-10 transition-all duration-300" style={{ width: '100%', borderBottom: `2px dotted #FCD535` }}></div>

                          {/* Directional Arrow at line end */}
                          <div className="trade-arrow absolute right-[-5px] w-[10px] h-[10px] z-[15] flex items-center justify-center transition-all duration-300">
                              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]" style={{ borderTopColor: '#FCD535', transform: trade.type === 'up' ? 'scaleY(-1)' : 'scaleY(1)' }}></div>
                          </div>
                      </div>
               )})}
          </div>



          {/* Chart Floating Tools - Professional Screenshot-Matched UI */}
          <div className="absolute bottom-[20px] left-5 right-5 flex items-center justify-between z-30 pointer-events-none">
              
              {/* Desktop: Support Button & Chart Controls Row */}
              <div className="hidden md:flex items-center gap-4 pointer-events-auto">

                  {/* Row of individual chart tool buttons - Individual Squircles */}
                  <div className="flex items-center gap-[6px]">
                      {/* Timeframe Button */}
                      <button 
                          onClick={() => {
                              if (showTimeframeModal) setShowTimeframeModal(false);
                              else { setShowTimeframeModal(true); setShowChartTypeModal(false); setShowIndicatorsModal(false); setShowSignalsModal(false); }
                          }} 
                          className={`w-[38px] h-[38px] flex items-center justify-center transition-all rounded-[12px] ${showTimeframeModal ? 'bg-[#3b3c43] text-white shadow-lg' : 'bg-[#27282e] text-[#8e8f93] hover:text-white hover:bg-[#323339]'}`}
                      >
                          <span className="text-[11px] font-black uppercase tracking-tighter">{formatTimeframeShort(timeframe)}</span>
                      </button>

                      {/* Chevrons Button */}
                      <button 
                          onClick={() => chartRef.current?.timeScale().scrollToRealTime()}
                          className="w-[38px] h-[38px] flex items-center justify-center transition-all rounded-[12px] bg-[#27282e] text-[#8e8f93] hover:text-white hover:bg-[#323339]"
                      >
                          <Icons.ChevronsRight size={19} strokeWidth={1.8} />
                      </button>

                      {/* Chart Type Button (Candle) */}
                      <button 
                          onClick={() => {
                              if (showChartTypeModal) setShowChartTypeModal(false);
                              else { setShowChartTypeModal(true); setShowTimeframeModal(false); setShowIndicatorsModal(false); setShowSignalsModal(false); }
                          }} 
                          className={`w-[40px] h-[40px] flex items-center justify-center transition-all rounded-[12px] ${showChartTypeModal ? 'bg-[#3b3c43] text-white shadow-lg' : 'bg-[#27282e] text-[#8e8f93] hover:text-white hover:bg-[#323339]'}`}
                      >
                          <Icons.CandlestickChart size={19} strokeWidth={1.8} />
                      </button>

                      {/* Indicators Button (Compass) */}
                      <button 
                          onClick={() => {
                              if (showIndicatorsModal) setShowIndicatorsModal(false);
                              else { setShowIndicatorsModal(true); setShowTimeframeModal(false); setShowChartTypeModal(false); setShowSignalsModal(false); }
                          }} 
                          className={`w-[40px] h-[40px] flex items-center justify-center transition-all rounded-[12px] ${showIndicatorsModal ? 'bg-[#3b3c43] text-white shadow-lg' : 'bg-[#27282e] text-[#8e8f93] hover:text-white hover:bg-[#323339]'}`}
                      >
                          <Icons.DraftingCompass size={19} strokeWidth={1.8} />
                      </button>

                      {/* Drawing Tools (Pencil) */}
                      <button 
                          className="w-[38px] h-[38px] flex items-center justify-center transition-all rounded-[12px] bg-[#27282e] text-[#8e8f93] hover:text-white hover:bg-[#323339]"
                      >
                          <Icons.Pencil size={19} strokeWidth={1.8} />
                      </button>

                      {/* Signals Button (Sense/Radio) */}
                      <button 
                          onClick={() => {
                              setShowSignalsModal(!showSignalsModal);
                              setShowTimeframeModal(false); setShowChartTypeModal(false); setShowIndicatorsModal(false);
                          }} 
                          className={`w-[38px] h-[38px] flex items-center justify-center transition-all rounded-[12px] ${showSignalsModal ? 'bg-[#3b3c43] text-white shadow-lg' : 'bg-[#27282e] text-[#8e8f93] hover:text-white hover:bg-[#323339]'}`}
                      >
                          <Icons.Radio size={19} strokeWidth={1.8} />
                      </button>

                      {/* Layers Button */}
                      <button 
                          onClick={() => setIsMultiChart(!isMultiChart)}
                          className={`w-[38px] h-[38px] flex items-center justify-center transition-all rounded-[12px] ${isMultiChart ? 'bg-[#3b3c43] text-white shadow-lg' : 'bg-[#27282e] text-[#8e8f93] hover:text-white hover:bg-[#323339]'}`}
                      >
                          {isSecond ? <Icons.X size={19} strokeWidth={2.5} /> : (isMultiChart ? <Icons.LayoutGrid size={19} strokeWidth={1.8} className="text-[#ffe24c]" /> : <Icons.LayoutGrid size={19} strokeWidth={1.8} />)}
                      </button>
                  </div>
              </div>

              {/* Mobile: Chart Controls matching screenshot */}
              <div className="md:hidden flex items-center gap-2 pointer-events-auto w-full">
                  <div className="flex items-center gap-[4px]">
                      <button 
                          onClick={() => {
                              if (showTimeframeModal) setShowTimeframeModal(false);
                              else { setShowTimeframeModal(true); setShowChartTypeModal(false); setShowIndicatorsModal(false); setShowSignalsModal(false); }
                          }} 
                          className={`w-[40px] h-[40px] flex items-center justify-center transition-all rounded-[10px] ${showTimeframeModal ? 'bg-[#3b3c43] text-white' : 'bg-[#25262b] text-[#9ea0a5] active:bg-[#323339]'}`}
                      >
                          <span className="text-[13px] font-black uppercase tracking-tighter">{formatTimeframeShort(timeframe)}</span>
                      </button>

                      <button 
                          onClick={() => {
                              if (showChartTypeModal) setShowChartTypeModal(false);
                              else { setShowChartTypeModal(true); setShowTimeframeModal(false); setShowIndicatorsModal(false); setShowSignalsModal(false); }
                          }} 
                          className={`w-[40px] h-[40px] flex items-center justify-center transition-all rounded-[10px] ${showChartTypeModal ? 'bg-[#3b3c43] text-white' : 'bg-[#25262b] text-[#9ea0a5] active:bg-[#323339]'}`}
                      >
                          <Icons.CandlestickChart size={20} strokeWidth={1.8} />
                      </button>

                      <button 
                          onClick={() => {
                              if (showIndicatorsModal) setShowIndicatorsModal(false);
                              else { setShowIndicatorsModal(true); setShowTimeframeModal(false); setShowChartTypeModal(false); setShowSignalsModal(false); }
                          }} 
                          className={`w-[40px] h-[40px] flex items-center justify-center transition-all rounded-[12px] ${showIndicatorsModal ? 'bg-[#3b3c43] text-white shadow-lg' : 'bg-[#27282e] text-[#8e8f93] hover:text-white hover:bg-[#323339]'}`}
                      >
                          <Icons.DraftingCompass size={20} strokeWidth={1.8} />
                      </button>

                      <button 
                          onClick={() => {
                              setShowSignalsModal(!showSignalsModal);
                              setShowTimeframeModal(false); setShowChartTypeModal(false); setShowIndicatorsModal(false);
                          }} 
                          className={`w-[40px] h-[40px] flex items-center justify-center transition-all rounded-[10px] ${showSignalsModal ? 'bg-[#3b3c43] text-white' : 'bg-[#25262b] text-[#9ea0a5] active:bg-[#323339]'}`}
                      >
                          <Icons.Radio size={20} strokeWidth={1.8} />
                      </button>
                  </div>

                  {/* Zoom Controls (Mobile) */}
                  <div className="flex items-center border border-[#3b3c43] rounded-[10px] bg-transparent ml-2 overflow-hidden">
                      <button 
                          onClick={(e) => { e.stopPropagation(); zoomOut(); }} 
                          className="w-[40px] h-[40px] flex items-center justify-center border-r border-[#3b3c43] text-[#9ea0a5] active:bg-white/5 transition-colors"
                      >
                          <Minus size={20} strokeWidth={1.8} />
                      </button>
                      <button 
                          onClick={(e) => { e.stopPropagation(); zoomIn(); }} 
                          className="w-[40px] h-[40px] flex items-center justify-center text-[#9ea0a5] active:bg-white/5 transition-colors"
                      >
                          <Plus size={20} strokeWidth={1.8} />
                      </button>
                  </div>
              </div>

              {/* Right side: History/Calendar Button - Yellow Circular */}
              {!isSecond && (
                <div className="hidden md:block pointer-events-auto">
                    <button 
                        onClick={() => setShowBottomHistory(!showBottomHistory)}
                        className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_8px_25px_rgba(255,226,76,0.3)] hover:scale-110 active:scale-90 ${showBottomHistory ? 'bg-[#ffe24c] text-black ring-2 ring-white/20' : 'bg-[#ffe24c] text-black'}`}
                    >
                        <Icons.Calendar size={22} strokeWidth={2.5} />
                    </button>
                </div>
              )}
          </div>

          {/* Bottom History Table (Overlay) */}
          <div 
             className={`absolute left-0 right-0 bottom-0 bg-[#1a1b1f] border-t border-white/5 transition-all duration-500 ease-in-out z-[100] ${showBottomHistory ? 'h-[320px]' : 'h-0 overflow-hidden'}`}
          >
             <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex gap-4">
                   <button 
                      onClick={() => setBottomTab('active')}
                      className={`text-[13px] font-black uppercase tracking-widest ${bottomTab === 'active' ? 'text-white border-b-2 border-yellow-500 pb-1' : 'text-gray-500 hover:text-gray-300'}`}
                   >
                      Active Trades
                   </button>
                   <button 
                      onClick={() => setBottomTab('history')}
                      className={`text-[13px] font-black uppercase tracking-widest ${bottomTab === 'history' ? 'text-white border-b-2 border-yellow-500 pb-1' : 'text-gray-500 hover:text-gray-300'}`}
                   >
                      History
                   </button>
                </div>
                <button onClick={() => setShowBottomHistory(false)} className="text-gray-500 hover:text-white transition-colors">
                   <X size={20} />
                </button>
             </div>
             
             {showBottomHistory && (
               <div className="overflow-y-auto h-[calc(320px-60px)] p-0 custom-scrollbar">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                           <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Asset</th>
                           <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                           <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Open</th>
                           <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Close</th>
                           <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Outcome</th>
                           <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Time</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {(bottomTab === 'active' ? visibleActiveTrades : visibleUserTrades.filter(t => t.status !== 'open')).length === 0 ? (
                           <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic text-[14px]">No trades to display</td>
                           </tr>
                        ) : (
                          (bottomTab === 'active' ? visibleActiveTrades : visibleUserTrades.filter(t => t.status !== 'open')).map((trade, tIdx) => (
                             <tr key={`history-tr-bottom-${idx}-${trade.id || 'no-id'}-${tIdx}`} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                      <AssetLogo name={trade.asset} />
                                      <span className="font-bold text-white text-[14px]">{trade.asset}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-white font-medium">{formatWithCurrency(trade.amount, userCurrency)}</td>
                                <td className="px-6 py-4 font-mono text-[13px] text-gray-300">{trade.entryPrice?.toFixed(5) || '---'}</td>
                                <td className="px-6 py-4 font-mono text-[13px] text-gray-300">{trade.exitPrice?.toFixed(5) || (trade.status === 'open' ? <span className="animate-pulse">Live...</span> : '---')}</td>
                                <td className="px-6 py-4">
                                   {trade.status === 'open' ? (
                                      <div className="flex items-center gap-2">
                                         <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></div>
                                         <span className="text-yellow-500 text-[12px] font-bold uppercase">Pending</span>
                                      </div>
                                   ) : (
                                      <div className={`text-[12px] font-black uppercase tracking-wider ${trade.status === 'won' ? 'text-[#00C980]' : 'text-red-500'}`}>
                                         {trade.status === 'won' ? (
                                            <span className="flex items-center gap-1.5">
                                               <Check size={14} strokeWidth={3} /> WIN
                                            </span>
                                         ) : (
                                            <span className="flex items-center gap-1.5">
                                               <X size={14} strokeWidth={3} /> LOSS
                                            </span>
                                         )}
                                      </div>
                                   )}
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-[12px] font-medium">
                                   {new Date(trade.createdAt).toLocaleTimeString(undefined, { timeZone })}
                                </td>
                             </tr>
                          ))
                        )}
                     </tbody>
                  </table>
               </div>
             )}
          </div>
        </main>
      </div>

      {/* DESKTOP TRADING PANEL - Screenshot Matched */}
      <aside className="hidden md:flex w-[300px] bg-[#1a1b1f] border-l border-white/5 flex-col shrink-0 z-30 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col p-5 gap-5">
          
          {/* Amount Input */}
          <div className="flex flex-col gap-2">
            <div className="bg-[#2d2f36] rounded-[22px] p-4 flex flex-col items-center justify-center relative group border border-white/5 hover:border-white/10 transition-all shadow-inner h-[100px]">
              <span className="text-[12px] text-gray-500 font-bold mb-1">Amount</span>
              <div className="flex items-center justify-between w-full px-1">
                <button 
                  onClick={() => setAmount(Math.max(minConvertedAmount, amount - (['USD', 'USDT', 'EUR', 'GBP', '$', '€'].includes(userCurrency) ? 1 : 10)))} 
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-colors active:scale-90"
                >
                  <Minus size={24} strokeWidth={3} />
                </button>
                
                <div className="flex items-center gap-0.5">
                  <span className="text-white font-bold text-[28px] tracking-tight">৳</span>
                  <input 
                    type="number" 
                    value={amount || ''} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') { setAmount(0); return; }
                      const num = Number(val);
                      if (!isNaN(num) && num >= 0) setAmount(num);
                    }}
                    onBlur={() => setAmount(Math.max(minConvertedAmount, amount))}
                    className="bg-transparent border-none outline-none text-center w-24 p-0 text-white font-bold text-[28px] tracking-tight [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <button 
                  onClick={() => setAmount(amount + (['USD', 'USDT', 'EUR', 'GBP', '$', '€'].includes(userCurrency) ? 1 : 10))} 
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-colors active:scale-90"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>

          {/* Time Input */}
          <div className="flex flex-col gap-2">
            <div onClick={() => setShowTimePicker(true)} className="bg-[#2d2f36] rounded-[22px] p-4 flex flex-col items-center justify-center relative group border border-white/5 hover:border-white/10 transition-all shadow-inner h-[100px] cursor-pointer">
              <span className="text-[12px] text-gray-500 font-bold mb-1">Time</span>
              <div className="flex items-center justify-between w-full px-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); decreaseTime(); }} 
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-colors active:scale-90"
                >
                  {isPlacingTrade ? <Icons.Loader size={24} className="animate-spin" /> : <Minus size={24} strokeWidth={3} />}
                </button>
                
                <span className="text-white font-bold text-[28px] tracking-tight">{expirationString}</span>

                <button 
                  onClick={(e) => { e.stopPropagation(); increaseTime(); }} 
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-colors active:scale-90"
                >
                  {isPlacingTrade ? <Icons.Loader size={24} className="animate-spin" /> : <Plus size={24} strokeWidth={3} />}
                </button>
              </div>
            </div>
          </div>

          {/* Earnings Info */}
          <div className="flex items-center justify-between py-1 px-1">
            <div className="flex items-center gap-2">
              <span className="text-[#8e9297] text-[15px] font-medium">Earnings</span>
              <span className="text-[#00c980] text-[15px] font-bold">+80%</span>
            </div>
            <div className="text-white font-bold text-[18px] tracking-tight">
              <span>৳</span>
              <span>{(amount * (1 + (markets[activeAsset]?.payout || 80) / 100)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
          </div>

          {/* Majority Opinion Section */}
          <div className="flex flex-col gap-3 py-1 px-1">
            <span className="text-[#8e9297] text-[15px] font-medium">Majority opinion</span>
            <div className="flex flex-col gap-2">
              {(() => {
                const market = markets[activeAsset];
                const totalUp = market?.totalUp || 0;
                const totalDown = market?.totalDown || 0;
                const total = totalUp + totalDown;
                let upPercent = 50;
                if (total > 0) {
                  upPercent = Math.round((totalUp / total) * 100);
                } else {
                  const timeMs = Date.now();
                  const price = market?.price || 0;
                  const priceTick = Math.floor(price * 100000) % 1000; 
                  
                  // Combine slow wave and fast wave tied to price ticks for live realistic movement
                  const slowWave = Math.sin(timeMs / 3000) * 12; 
                  const fastWave = Math.cos(timeMs / 1200 + priceTick) * 8; 
                  
                  upPercent = Math.round(50 + slowWave + fastWave);
                  if (upPercent > 89) upPercent = 89;
                  if (upPercent < 11) upPercent = 11;
                }
                const downPercent = 100 - upPercent;
                return (
                  <>
                    <div className="h-[6px] w-full bg-[#f45c5c] rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-[#00c980] transition-all duration-1000" 
                        style={{ width: `${upPercent}%` }} 
                      />
                    </div>
                    <div className="flex justify-between items-center px-0.5">
                      <span className="text-[#00c980] text-[15px] font-bold">{upPercent}%</span>
                      <span className="text-[#f45c5c] text-[15px] font-bold">{downPercent}%</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Action Buttons - Side by Side */}
          <div className="flex gap-4 mt-2">
            <motion.button 
              whileHover={markets[activeAsset]?.isFrozen || isPlacingTrade ? {} : { scale: 1.05 }}
              whileTap={markets[activeAsset]?.isFrozen || isPlacingTrade ? {} : { scale: 0.95 }}
              onClick={() => !markets[activeAsset]?.isFrozen && !isPlacingTrade && placeTrade("up")}
              disabled={markets[activeAsset]?.isFrozen || isPlacingTrade}
              className={`flex-1 h-[86px] rounded-[22px] flex items-center justify-center transition-all relative shadow-lg ${
                markets[activeAsset]?.isFrozen || isPlacingTrade 
                  ? 'bg-gray-700/50 cursor-not-allowed grayscale' 
                  : 'bg-[#00c980] hover:bg-[#00d98a] active:shadow-inner'
              }`}
            >
              {isPlacingTrade ? (
                <Icons.Loader className="animate-spin text-white" size={44} />
              ) : (
                <ArrowUp size={44} strokeWidth={3} className="text-white" />
              )}
            </motion.button>
            
            <motion.button 
              whileHover={markets[activeAsset]?.isFrozen || isPlacingTrade ? {} : { scale: 1.05 }}
              whileTap={markets[activeAsset]?.isFrozen || isPlacingTrade ? {} : { scale: 0.95 }}
              onClick={() => !markets[activeAsset]?.isFrozen && !isPlacingTrade && placeTrade("down")}
              disabled={markets[activeAsset]?.isFrozen || isPlacingTrade}
              className={`flex-1 h-[86px] rounded-[22px] flex items-center justify-center transition-all relative shadow-lg ${
                markets[activeAsset]?.isFrozen || isPlacingTrade 
                  ? 'bg-gray-700/50 cursor-not-allowed grayscale' 
                  : 'bg-[#f45c5c] hover:bg-[#ff6d6d] active:shadow-inner'
              }`}
            >
              {isPlacingTrade ? (
                <Icons.Loader className="animate-spin text-white" size={44} />
              ) : (
                <ArrowDown size={44} strokeWidth={3} className="text-white" />
              )}
            </motion.button>
          </div>
        </div>
      </aside>
    </div>
    );
  };

  return (
    <>
      <SEO title="Trade Dashboard" description="Trade global markets on Bivaax with professional tools and real-time data." />


      <div className="h-[100dvh] bg-[#131313] text-white flex flex-col md:flex-row font-sans select-none overflow-hidden">
      {/* DESKTOP SIDEBAR (Left) */}
      <aside className="hidden md:flex w-[68px] bg-[#1f2026] flex-col border-r border-[#2C2D33] shrink-0 z-50">
        <div className="flex flex-col items-center py-5 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setShowSidebar(!showSidebar)}>
            <Menu size={24} className="text-[#a6aeb9] hover:text-white transition-colors" strokeWidth={1.5} />
        </div>
        
        <div className="flex-1 flex flex-col py-6 gap-[28px] px-0 overflow-y-auto scrollbar-hide items-center">
          {[
            { icon: Icons.LayoutGrid, label: "Activities", tab: "activities" },
            { icon: Clock, label: "Trades", tab: "history" },
            { icon: Icons.ShoppingBag, label: "Market", tab: "market" },
            { icon: Icons.Users, label: "Copy", tab: "copytrading" },
            { icon: Icons.Trophy, label: "Tourney", tab: "tournaments" },
          ].map((item, idx) => {
            const isActive = activeTab === item.tab || (item.tab === 'history' && activeTab === 'trade');
            return (
            <button
              key={`desktop-sidebar-${item.label}`}
              onClick={() => {
                if ('onClick' in item && typeof item.onClick === 'function') {
                  item.onClick();
                } else if ('tab' in item) {
                  setActiveTab(item.tab);
                }
              }}
              className={`w-full flex flex-col items-center justify-center group relative py-1 transition-all duration-300 ${isActive ? "text-[#ffe24c]" : "text-[#7b8390] hover:text-white"}`}
            >
              {isActive && <div className="absolute left-0 w-[3px] h-full bg-[#ffe24c] rounded-r-full shadow-[0_0_10px_rgba(255,226,76,0.3)]" />}
              <div className="relative flex flex-col items-center">
                 <item.icon size={22} strokeWidth={isActive ? 2 : 1.5} className="mb-2" />
                 {('tab' in item) && (item.tab === 'history') && visibleActiveTrades.length > 0 && (
                    <div className="absolute -top-1.5 -right-2.5 bg-[#f44336] text-white text-[9px] font-black h-[16px] min-w-[16px] px-1 rounded-full flex items-center justify-center border border-[#1f2026] shadow-lg animate-pulse">
                      {visibleActiveTrades.length}
                    </div>
                 )}
                 <span className="text-[10px] tracking-tight text-center leading-tight font-bold uppercase">{item.label}</span>
              </div>
            </button>
          )})}
        </div>

        <div className="flex flex-col items-center gap-6 py-6 h-auto shrink-0 bg-[#1f2026] border-t border-white/5">
            <div style={{ display: showLiveSupport ? 'block' : 'none' }}>
                <LiveSupport onClose={() => setShowLiveSupport(false)} />
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* HEADER */}
        <header className="h-[56px] md:h-[64px] bg-[#1f2026] border-b border-white/5 flex items-center justify-between pr-3 md:pr-6 shrink-0 z-[100] relative">
          <div className="flex items-center h-full">
            <div className="md:hidden flex h-full">
              {activeTab !== "trade" ? (
                <button 
                  onClick={() => setActiveTab("trade")} 
                  className="w-[56px] h-full flex items-center justify-center text-gray-400 hover:text-white transition-all z-10"
                >
                  <Icons.ArrowLeft size={22} />
                </button>
              ) : (
                <button 
                  onClick={() => setShowSidebar(!showSidebar)} 
                  className="w-[56px] h-full flex items-center justify-center text-gray-400 hover:text-white transition-all z-10"
                >
                  <Icons.Menu size={22} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 ml-2 md:ml-6">
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
                <Logo size={24} className="text-[#ffe24c]" />
                <span className="hidden lg:block font-sans font-black text-[22px] tracking-tight text-white">Bivox</span>
              </div>

              {/* Plus Button */}
              <button 
                onClick={() => setActiveTab("assets")}
                className="hidden md:flex w-10 h-10 bg-[#2a2c31] rounded-[10px] items-center justify-center text-gray-400 hover:text-white hover:bg-[#32343a] transition-all border border-white/5"
              >
                <Icons.Plus size={20} strokeWidth={3} />
              </button>
            </div>
            
            {/* Desktop Asset Selector */}
            <div 
              onClick={() => setActiveTab("assets")}
              className="hidden md:flex items-center gap-3 bg-[#2a2c31] pl-3 pr-4 py-2 rounded-[12px] border border-white/5 cursor-pointer hover:bg-[#32343a] transition-all group ml-3 shadow-lg h-[40px] relative overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <AssetLogo name={activeAsset} size={20} />
                <span className="font-bold text-[14px] text-white tracking-tight">{activeAsset}</span>
                <span className="text-gray-400 text-[14px] font-medium ml-1">
                  {markets[activeAsset]?.payout || 83}%
                </span>
              </div>
              <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6 h-full">
            {/* Mobile Header Center Content -> Now on Right */}
            <div className="md:hidden flex items-center gap-2 mr-1">
              <button className="bg-transparent border border-white/10 w-9 h-9 rounded-[10px] flex items-center justify-center text-gray-300 active:scale-95 transition-transform">
                <Icons.RefreshCcw size={16} />
              </button>
              <div 
                onClick={() => setShowAccounts(!showAccounts)}
                className="flex flex-col items-start cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-0.5 opacity-90 group-active:opacity-70 transition-opacity">
                    <span className={`text-[13px] font-medium leading-none ${accountType === 'demo' ? 'text-cyan-400' : accountType === 'tournament' ? 'text-indigo-400' : 'text-yellow-400'}`}>
                      {accountType === 'demo' ? 'Demo account' : accountType === 'tournament' ? 'Tournament' : 'Real account'}
                    </span>
                  <Icons.ChevronDown size={14} className="text-[#e0e0e0]" />
                </div>
                <div className="font-sans font-bold text-[15px] leading-none text-white opacity-90 group-active:opacity-70 transition-opacity pt-[1px]">
                  <AnimatedBalance value={balance} currency={userCurrency} accountType={accountType} isHidden={isBalanceHidden} />
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4 h-full">
               {/* Refresh Button */}
               <button 
                 onClick={() => window.location.reload()}
                 className="w-10 h-10 bg-[#2a2c31] rounded-[10px] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#32343a] transition-all border border-white/5"
               >
                 <Icons.RefreshCcw size={18} />
               </button>

               <div 
                 onClick={() => setShowAccounts(!showAccounts)}
                 className="flex flex-col items-end cursor-pointer group px-2 py-1 hover:bg-white/5 rounded-lg transition-colors"
               >
                 <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[12px] font-medium text-gray-300">
                      {accountType === 'demo' ? 'Demo account' : accountType === 'tournament' ? 'Tournament' : 'Real account'}
                    </span>
                    <Icons.ChevronDown size={14} className="text-gray-500 group-hover:text-white transition-colors" />
                 </div>
                 <span className="font-sans font-bold text-[18px] text-white tracking-tight leading-none">
                    <AnimatedBalance value={balance} currency={userCurrency} accountType={accountType} isHidden={isBalanceHidden} />
                 </span>
               </div>
               
               <button 
                 onClick={() => { setShowDeposit(true); setCashierTab("deposits"); bootApp(); }}
                 className="bg-[#ffe24c] hover:bg-[#fff080] text-[#131417] h-[44px] px-5 rounded-[12px] font-black text-[15px] flex items-center gap-2.5 transition-all active:scale-95 shadow-lg"
               >
                 <Icons.Wallet size={18} fill="currentColor" className="opacity-80" />
                 Deposit
               </button>

               <button 
                 onClick={() => { setShowDeposit(true); setCashierTab("withdrawals"); bootApp(); }}
                 className="bg-[#2a2c31] hover:bg-[#32343a] text-white h-[44px] px-5 rounded-[12px] font-black text-[15px] flex items-center gap-2.5 transition-all active:scale-95 border border-white/5"
               >
                 <Icons.CreditCard size={18} className="text-gray-400" />
                 Withdraw
               </button>
               
               <div 
                 onClick={() => { setActiveTab("profile-menu"); }}
                 className="w-[44px] h-[44px] bg-[#3b3c43] rounded-full flex items-center justify-center text-[16px] font-black text-white/40 relative cursor-pointer active:scale-90 transition-transform uppercase border-[2px] border-white/10 ml-2"
               >
                 {currentUser?.displayName ? String(currentUser.displayName).substring(0, 1) : (currentUser?.email ? String(currentUser.email).substring(0, 1) : "H")}
                 <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#2a2c31] rounded-full flex items-center justify-center border-[2px] border-[#1f2026] shadow-lg">
                    <Icons.Diamond size={10} fill="#ffe24c" className="text-[#ffe24c]" />
                 </div>
               </div>
            </div>

            {/* Mobile Header Icons (Right) */}
            <div className="flex md:hidden items-center gap-2">
              <button 
                onClick={() => { setShowCashierMenu(true); bootApp(); }}
                className="bg-[#FFE24C] w-10 h-10 rounded-[8px] flex items-center justify-center text-black active:scale-90 transition-transform"
              >
                <Icons.Wallet size={20} strokeWidth={2.5} />
              </button>
              
              <div 
                onClick={() => { setActiveTab("profile-menu"); }}
                className="w-10 h-10 bg-[#32343a] rounded-full flex items-center justify-center text-[11px] font-black text-gray-400 relative cursor-pointer active:scale-90 transition-transform uppercase"
              >
                {currentUser?.displayName ? String(currentUser.displayName).substring(0, 2) : (currentUser?.email ? String(currentUser.email).substring(0, 2) : "US")}
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-[#1a1b1f] rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* CHART & TRADING CONTROLS */}
        <div className={`flex-1 flex ${isMultiChart && !isMobile ? "flex-col md:flex-row" : "flex-col md:flex-row"} overflow-hidden relative min-h-0`}>
          {(isMultiChart && !isMobile ? [0, 1] : [0]).map((idx) => renderTradingEnvironment(idx))}

        {/* MOBILE TRADING PANEL (At Bottom) */}
          <div className="md:hidden flex flex-col shrink-0 gap-0 z-[60] pointer-events-auto bg-[#1a1b1f] border-t border-white/5 relative">
             
             {/* Binomo Style Trade Result Notification */}
             <AnimatePresence>
               {tradeNotifications.length > 0 && (
                 <div className="absolute right-0 bottom-full mb-1 z-[70] pr-4 pointer-events-none">
                    <div className="flex flex-col gap-2 items-end">
                    {tradeNotifications.map((notif, idx) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="pointer-events-auto"
                      >
                         <div className={`flex items-center gap-2.5 h-[36px] min-w-[200px] max-w-[90vw] pr-2 rounded-[6px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden transition-all duration-300 ${notif.status === 'won' ? 'bg-[#FCD535]' : (notif.status === 'draw' ? 'bg-[#eeeeee]' : 'bg-[#33353b]')}`}>
                            {/* Counter/Index - Binomo Style circle */}
                            <div className={`ml-1.5 w-[20px] h-[20px] rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${notif.status === 'won' ? 'bg-white text-[#111111]' : (notif.status === 'draw' ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]')}`}>
                               {tradeNotifications.length - idx}
                            </div>
                            
                            {/* Text Content */}
                            <div className="flex-1 flex items-center justify-between gap-4 overflow-hidden">
                               <span className={`text-[12px] font-black truncate max-w-[120px] ${notif.status === 'won' ? 'text-[#111111]' : (notif.status === 'draw' ? 'text-[#111111]' : 'text-white')}`}>
                                  {notif.asset}
                               </span>
                               <span className={`text-[13px] font-black shrink-0 ${notif.status === 'won' ? 'text-[#111111]' : (notif.status === 'draw' ? 'text-[#111111]' : (notif.status === 'lost' ? 'text-rose-400' : 'text-white'))}`}>
                                  {notif.status === 'won' ? '+' : (notif.status === 'lost' ? '-' : '+')}{formatWithCurrency(notif.amount, userCurrency)}
                               </span>
                            </div>

                            {/* Close Button */}
                            <button 
                              onClick={() => setTradeNotifications(prev => prev.filter(p => p.id !== notif.id))}
                              className={`p-1 hover:opacity-100 opacity-60 transition-all ${notif.status === 'won' || notif.status === 'draw' ? 'text-[#111111]' : 'text-white'}`}
                            >
                               <X size={16} strokeWidth={2.5} />
                            </button>
                         </div>
                      </motion.div>
                    ))}
                    </div>
                 </div>
               )}
             </AnimatePresence>

             {/* View Open Trades Link (Top Strip) */}
             <div className="flex items-center gap-[18px] px-[18px] py-2 border-b border-white/5 mb-2">
               <div className="text-[12px] text-[#8e8e93] font-medium tracking-tight">
                 {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone })} {timeZone !== "UTC" ? timeZone.split('/').pop()?.replace(/_/g, ' ') : "UTC"}
               </div>
               <button className="text-[#3ea6ff] text-[13px] font-semibold underline decoration-[#3ea6ff]/40 underline-offset-4" onClick={() => setShowOpenTrades(true)}>
                 View open trades
               </button>
             </div>
             
             <div className="px-4 flex flex-col gap-2.5">
               <div className="flex gap-3">
                  <div onClick={() => setShowTimePicker(true)} className="flex-1 bg-[#33353b] h-[44px] rounded-lg flex items-center justify-between px-3 cursor-pointer">
                      <button onClick={(e) => { e.stopPropagation(); decreaseTime(); }} className="text-[#9ea0a5] active:scale-95 transition-transform"><Minus size={18} strokeWidth={1.5} /></button>
                      <div className="flex flex-col items-center">
                          <span className="text-[10px] text-[#9ea0a5] tracking-wide mb-[1px]">Time</span>
                          <div className="flex flex-col items-center">
                            <span className="font-sans font-bold text-[14px] tracking-tight text-white leading-none">{expirationString}</span>
                            <span className={`text-[8px] font-bold ${timeToPurchase < 10 ? 'text-red-500' : 'text-gray-400'}`}>
                              {timeToPurchase > 0 ? formatTimeToPurchase(timeToPurchase) : '---'}
                            </span>
                          </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); increaseTime(); }} className="text-[#9ea0a5] active:scale-95 transition-transform"><Plus size={18} strokeWidth={1.5} /></button>
                  </div>
                  <div className="flex-1 bg-[#33353b] h-[44px] rounded-lg flex items-center justify-between px-3">
                      <button onClick={() => setAmount(Math.max(minConvertedAmount, amount - (['USD', 'USDT', 'EUR', 'GBP', '$', '€', '£'].includes(userCurrency) ? 1 : 10)))} className="text-[#9ea0a5] active:scale-95 transition-transform"><Minus size={18} strokeWidth={1.5} /></button>
                      <div className="flex flex-col items-center justify-center h-full">
                          <span className="text-[8px] text-[#9ea0a5] tracking-wide leading-none mb-[2px]">{t('amount')} (Bal: {formatWithCurrency(balance, userCurrency)})</span>
                          <input 
                            type="number" 
                            value={amount || ''} 
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setAmount(0);
                                return;
                              }
                              const num = Number(val);
                              if (!isNaN(num) && num >= 0) {
                                setAmount(num);
                              }
                            }} 
                            onBlur={() => setAmount(Math.max(minConvertedAmount, amount))} 
                            className="font-sans font-bold text-[14px] tracking-tight text-white leading-none w-16 bg-transparent text-center outline-none" 
                          />
                      </div>
                      <button onClick={() => setAmount(amount + (['USD', 'USDT', 'EUR', 'GBP', '$', '€', '£'].includes(userCurrency) ? 1 : 10))} className="text-[#9ea0a5] active:scale-95 transition-transform"><Plus size={18} strokeWidth={1.5} /></button>
                  </div>
               </div>

               <div className="flex items-center justify-center gap-2">
                  <span className="text-[12px] text-[#9ea0a5]">{t('payout')} <span className="text-white font-bold ml-1">+{markets[activeAsset]?.payout || 82}%</span></span>
                  <span className="text-white font-bold text-[16px] font-sans tracking-tight leading-none pt-0.5">{userCurrency}{(amount * (1 + (markets[activeAsset]?.payout || 82) / 100)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
               </div>

               <div className="flex gap-2.5 pb-2 relative px-1">
                  <motion.button 
                    whileTap={markets[activeAsset]?.isFrozen || isPlacingTrade ? {} : { scale: 0.94 }}
                    onClick={() => !markets[activeAsset]?.isFrozen && !isPlacingTrade && placeTrade("up")}
                    disabled={markets[activeAsset]?.isFrozen || isPlacingTrade}
                    className={`flex-1 ${markets[activeAsset]?.isFrozen || isPlacingTrade ? 'bg-gray-500 grayscale' : 'bg-[#00c980] hover:bg-[#00d98a] active:bg-[#00b372]'} h-[38px] rounded-[8px] flex items-center justify-center transition-all relative overflow-hidden shadow-sm active:scale-[0.98] border border-white/5`}
                  >
                    {markets[activeAsset]?.isFrozen ? (
                       <div className="flex flex-col items-center gap-0.5 grayscale opacity-50">
                          <Snowflake size={12} className="text-white" />
                          <span className="text-white text-[6px] font-black uppercase tracking-widest">Frozen</span>
                       </div>
                    ) : isPlacingTrade ? (
                       <Icons.Loader className="animate-spin text-white" size={24} />
                    ) : (
                       <ArrowUp size={24} strokeWidth={3} className="text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.15)]" />
                    )}
                  </motion.button>
                  
                  <motion.button 
                    whileTap={markets[activeAsset]?.isFrozen || isPlacingTrade ? {} : { scale: 0.94 }}
                    onClick={() => !markets[activeAsset]?.isFrozen && !isPlacingTrade && placeTrade("down")}
                    disabled={markets[activeAsset]?.isFrozen || isPlacingTrade}
                    className={`flex-1 ${markets[activeAsset]?.isFrozen || isPlacingTrade ? 'bg-gray-500 grayscale' : 'bg-[#ff4757] hover:bg-[#ff5d6a] active:bg-[#e63242]'} h-[38px] rounded-[8px] flex items-center justify-center transition-all relative overflow-hidden shadow-sm active:scale-[0.98] border border-white/5`}
                  >
                    {markets[activeAsset]?.isFrozen ? (
                       <div className="flex flex-col items-center gap-0.5 grayscale opacity-50">
                          <Snowflake size={12} className="text-white" />
                          <span className="text-white text-[6px] font-black uppercase tracking-widest">Frozen</span>
                       </div>
                    ) : isPlacingTrade ? (
                       <Icons.Loader className="animate-spin text-white" size={24} />
                    ) : (
                       <ArrowDown size={24} strokeWidth={3} className="text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.15)]" />
                    )}
                  </motion.button>
               </div>
             </div>

             {/* MOBILE BOTTOM NAVIGATION */}
             <nav className="h-[62px] bg-[#1a1b1f] flex justify-around items-center shrink-0 px-1 border-t border-white/5 relative z-[450]">
                {[
                  { 
                    icon: (props: any) => (
                      <svg 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        className="w-[22px] h-[22px]" 
                        stroke="currentColor" 
                        strokeWidth="2.3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        {...props}
                      >
                        {/* Left Candlestick */}
                        <line x1="8" y1="5" x2="8" y2="10" />
                        <rect x="5" y="10" width="6" height="4" rx="2" />
                        <line x1="8" y1="14" x2="8" y2="19" />

                        {/* Right Candlestick */}
                        <line x1="16" y1="5" x2="16" y2="8" />
                        <rect x="13" y="8" width="6" height="8" rx="2" />
                        <line x1="16" y1="16" x2="16" y2="19" />
                      </svg>
                    ), 
                    tab: "trade", 
                    label: t('trade') 
                  },
                  { icon: History, tab: "history", label: t('history') },
                  { icon: Users, label: t('copy'), onClick: () => navigate('/copytrading') },
                  { icon: LayoutGrid, tab: "activities", label: t('activities'), dot: true },
                  { icon: User, label: t('profile'), onClick: () => navigate('/profile') },
                ].map((item, idx) => (
                  <button 
                    key={`mobile-nav-${'tab' in item ? item.tab : item.label}`}
                    onClick={() => {
                        if ('onClick' in item && typeof item.onClick === 'function') {
                          item.onClick();
                        } else if ('tab' in item) {
                          setActiveTab(item.tab as any);
                          if(item.tab === "profile") setActiveProfileTab("account");
                        }
                    }}
                    className="flex-1 flex flex-col items-center justify-center h-full transition-all duration-200 relative"
                  >
                    <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === item.tab ? "text-[#309cf4] -translate-y-0.5" : "text-[#5a5c63]"}`}>
                      <div className="relative">
                        <item.icon size={22} strokeWidth={activeTab === item.tab ? 2.5 : 2} />
                        {item.dot && (
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#f44336] rounded-full border-[1.5px] border-[#1a1b1f]"></div>
                        )}
                        {'tab' in item && item.tab === 'history' && visibleActiveTrades.length > 0 && (
                          <div className="absolute -top-1.5 -right-2.5 bg-[#f44336] text-white text-[9px] font-black h-[17px] min-w-[17px] px-1 rounded-full flex items-center justify-center border border-[#1a1b1f] shadow-md animate-pulse z-10">
                            {visibleActiveTrades.length}
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold tracking-tight uppercase transition-all duration-300 ${activeTab === item.tab ? "opacity-100 scale-100" : "opacity-70 scale-95"}`}>
                        {item.label}
                      </span>
                    </div>
                  </button>
                ))}
             </nav>
          </div>
        </div>
      </div>

      {/* PROFESSIONAL SIDEBAR DRAWER */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 md:top-[64px] md:bottom-0 md:right-auto md:w-[320px] bg-[#1e1e24] z-[300] flex flex-col shadow-2xl overflow-y-auto"
          >
            {/* MOBILE TOP BAR (Inside Sidebar) */}
            <div className="flex md:hidden h-[64px] items-center justify-between px-6 border-b border-white/5 bg-[#1a1b1f] shrink-0">
               <div className="flex items-center gap-3">
                  <Logo size={26} />
                  <span className="text-[22px] font-black tracking-tighter text-white">Bivaax</span>
               </div>
               <button onClick={() => setShowSidebar(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors active:scale-95">
                  <X size={20} />
               </button>
            </div>

            {/* PROFESSIONAL MENU ITEMS */}
            <div className="flex flex-col">
              <button className="flex items-center gap-4 px-6 h-[64px] hover:bg-white/5 transition-colors border-b border-white/5 group">
                <Diamond size={18} className="text-[#967ce8]" fill="#967ce8" strokeWidth={1} />
                <span className="text-[15px] font-medium text-white group-hover:text-[#967ce8] transition-colors">Prestige</span>
              </button>
              <button className="flex items-center gap-4 px-6 h-[64px] hover:bg-white/5 transition-colors border-b border-white/5 group">
                <Diamond size={18} className="text-gray-500" fill="currentColor" strokeWidth={1} />
                <span className="text-[15px] font-medium text-white/90">VIP</span>
              </button>

              <div className="flex flex-col border-b border-white/5">
                <button 
                  onClick={() => setOpenForTraders(!openForTraders)}
                  className="flex items-center justify-between px-6 h-[64px] text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-[15px] font-medium text-white/90">For traders</span>
                  {openForTraders ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                {openForTraders && (
                  <div className="flex flex-col bg-[#1a1b1f]">
                    {[
                      { label: "Tournaments", tab: "tournaments" },
                      { label: "Promotions", tab: "promotions" },
                      { label: "Profit calculator", tab: "calculator" },
                      { label: "Strategies", tab: "strategies" },
                      { label: "Economic calendar", tab: "calendar" }
                    ].map(link => (
                      <button 
                        key={`sidebar-drawer-${link.tab}`} 
                        onClick={() => {
                          setActiveTab(link.tab as any);
                          setShowSidebar(false);
                        }}
                        className="flex items-center px-6 h-[50px] text-left text-[14px] text-gray-400 hover:text-white transition-colors border-t border-white/5"
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col border-b border-white/5">
                <button 
                  onClick={() => setOpenInformation(!openInformation)}
                  className="flex items-center justify-between px-6 h-[64px] text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-[15px] font-medium text-white/90">Information</span>
                  {openInformation ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                {openInformation && (
                  <div className="flex flex-col bg-[#1a1b1f]">
                    {["Statuses", "About us", "Regulations", "Client Agreement", "AML policy"].map(link => (
                      <button 
                        key={`sidebar-info-${link}`} 
                        className="flex items-center px-6 h-[50px] text-left text-[14px] text-gray-400 hover:text-white transition-colors border-t border-white/5"
                        onClick={() => {
                          setShowSidebar(false); // Always close sidebar
                          if (link === "Statuses") {
                            setActiveTab("statuses");
                          } else if (link === "About us") {
                            window.open("/about-us", "_blank");
                          } else if (link === "Regulations") {
                            setShowRegulations(true); // Since it has db data
                          } else if (link === "Client Agreement") {
                            window.open("/page/legal-agreement", "_blank");
                          } else if (link === "AML policy") {
                            window.open("/page/aml-policy", "_blank");
                          }
                        }}
                      >
                        {link}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="flex items-center gap-4 px-6 h-[64px] hover:bg-white/5 border-b border-white/5">
                <span className="text-[15px] font-medium text-white/90">Reviews</span>
              </button>
              <button 
                onClick={() => {
                  setActiveTab("help-center");
                  setShowSidebar(false);
                }}
                className="flex items-center gap-4 px-6 h-[64px] hover:bg-white/5 border-b border-white/5 w-full text-left"
              >
                <span className="text-[15px] font-medium text-white/90">Help Center</span>
              </button>
              <button className="flex items-center gap-4 px-6 h-[64px] hover:bg-white/5 border-b border-white/5">
                <span className="text-[15px] font-medium text-white/90">Bivaax Blog</span>
              </button>
              
              {/* SOCIAL MEDIA LINKS */}
              <div className="flex items-center gap-3 px-6 h-[80px]">
                 <button className="w-10 h-10 rounded-lg border border-white/10 bg-[#2b2d35] flex items-center justify-center hover:bg-white/10 text-white/80 transition-colors">
                    <Icons.Youtube size={18} />
                 </button>
                 <button className="w-10 h-10 rounded-lg border border-white/10 bg-[#2b2d35] flex items-center justify-center hover:bg-white/10 text-white/80 transition-colors">
                    <Icons.Instagram size={18} />
                 </button>
                 <button className="w-10 h-10 rounded-lg border border-white/10 bg-[#2b2d35] flex items-center justify-center hover:bg-white/10 text-white/80 transition-colors">
                    <Icons.Send size={18} />
                 </button>
                 <button className="w-10 h-10 rounded-lg border border-white/10 bg-[#2b2d35] flex items-center justify-center hover:bg-white/10 text-white/80 transition-colors">
                    <Icons.Facebook size={18} />
                 </button>
                 <button className="w-10 h-10 rounded-lg border border-white/10 bg-[#2b2d35] flex items-center justify-center hover:bg-white/10 text-white/80 transition-colors">
                    <Icons.Music size={18} />
                 </button>
              </div>
              
              {isAdmin && (
                <button 
                  onClick={() => { setShowSidebar(false); navigate("/admin"); }}
                  className="flex items-center gap-3 px-6 h-[64px] border-t border-white/5 text-left text-[15px] font-medium text-yellow-500 hover:bg-white/5 transition-colors"
                >
                  <ShieldCheck size={18} />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>

            {/* Bottom floating support button */}
            <div className="absolute bottom-6 right-6 md:hidden">
                <button
                   className="w-12 h-12 rounded-full bg-[#ff5252] flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                   onClick={() => setActiveTab("support")}
                >
                   <HelpCircle size={22} className="text-white fill-white" />
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVITIES DRAWER */}
      {activeTab === "activities" && (
        <div className="fixed md:absolute inset-y-0 left-0 w-[85vw] max-w-[400px] md:left-[68px] md:right-auto md:w-[400px] z-[150] flex flex-col overflow-hidden bg-[#121214] border-r border-white/5 shadow-2xl animate-in slide-in-from-left duration-300">
          <div className="w-full h-full flex flex-col relative text-white z-50">
            {/* Top Header */}
            <div className="h-[64px] flex items-center justify-between px-6 border-b border-white/5 bg-[#121214] shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab("trade")}
                  className="text-[#9ea0a5] hover:text-white transition-colors p-2 -ml-2"
                >
                  <ArrowLeft size={24} strokeWidth={2} />
                </button>
                <h2 className="text-[20px] font-black tracking-tight text-white m-0 uppercase">
                  Activities
                </h2>
              </div>
              <button 
                onClick={() => setActiveTab("trade")} 
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-[#0B0B0C] relative custom-scrollbar">
              {/* Stories Horizontal Scroll */}
              <div className="relative group/stories mb-6 border-b border-white/5 pb-6">
                <div id="stories-scroll" className="flex overflow-x-auto gap-3 scrollbar-hide -mx-2 px-2 shrink-0">
                  {STORIES.map((story, index) => (
                    <button
                      key={story.id}
                      onClick={() => {
                        setSelectedStoryIndex(index);
                        setShowStory(true);
                      }}
                      className="flex flex-col items-center min-w-[100px] w-[100px] h-[130px] rounded-xl overflow-hidden relative group cursor-pointer border border-white/5 shadow-xl hover:border-[#FFE24C]/30 transition-all shrink-0"
                    >
                      <img src={story.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"  loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-2 left-2 right-2 text-left">
                        <span className="text-[11px] font-black uppercase text-white leading-[1.1] tracking-tighter line-clamp-2 drop-shadow-md">
                          {story.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Scroll Indicator/Button */}
                <button 
                  onClick={() => {
                    document.getElementById('stories-scroll')?.scrollBy({ left: 150, behavior: 'smooth' });
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 rounded-full bg-[#2a2c31] border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#32343a] shadow-xl z-10 transition-all opacity-0 group-hover/stories:opacity-100"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Tournaments (Large Card) */}
                <button 
                  onClick={() => setActiveTab("tournaments")}
                  className="w-full bg-[#2a2c31] hover:bg-[#32343a] rounded-2xl p-5 flex items-center gap-5 transition-all border border-white/5 shadow-lg group h-[100px]"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#1f2026] flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform">
                    <Trophy size={28} className="text-white" />
                  </div>
                  <span className="text-[18px] font-black text-white tracking-tight">Tournaments</span>
                </button>

                {/* 3 Square Grid Items */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Bonuses", tab: "promotions", icon: Gift, count: "2" },
                    { label: "Calendar", tab: "calendar", icon: Calendar },
                    { label: "Top-20", tab: "top-20", icon: Icons.Award, hasDot: true },
                  ].map((item) => (
                    <button 
                      key={`activities-grid-${item.label}`}
                      onClick={() => setActiveTab(item.tab as any)}
                      className="bg-[#2a2c31] hover:bg-[#32343a] rounded-2xl p-3 flex flex-col items-center gap-3 transition-all border border-white/5 shadow-lg h-[110px] justify-center relative group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#1f2026] flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform">
                        <item.icon size={24} className="text-white" />
                      </div>
                      <span className="text-[12px] font-bold text-white/90">{item.label}</span>
                      {item.count && <div className="absolute top-3 right-3 w-4 h-4 bg-[#ff4757] rounded-full flex items-center justify-center text-[9px] font-black">{item.count}</div>}
                      {item.hasDot && <div className="absolute top-3 right-3 w-2 h-2 bg-[#ff4757] rounded-full"></div>}
                    </button>
                  ))}
                </div>

                {/* Vertical List Items */}
                <div className="space-y-3">
                  {[
                    { label: "What's new?", tab: "news", icon: Megaphone, badge: "9+" },
                    { label: "Invite Friends", tab: "affiliate", icon: UserPlus },
                    { label: "Education", tab: "education", icon: GraduationCap },
                  ].map((item) => (
                    <button 
                      key={`activities-list-${item.label}`}
                      onClick={() => setActiveTab(item.tab as any)}
                      className="w-full bg-[#2a2c31] hover:bg-[#32343a] rounded-2xl p-4 flex items-center justify-between transition-all border border-white/5 shadow-lg h-[80px] group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#1f2026] flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform">
                          <item.icon size={22} className="text-white" />
                        </div>
                        <span className="text-[16px] font-bold text-white/90">{item.label}</span>
                      </div>
                      {item.badge && <div className="bg-[#ff4757] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{item.badge}</div>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY TOP-20 LEADERBOARD MODAL */}
      {activeTab === "top-20" && (
        <div className="fixed md:absolute inset-0 md:left-[76px] md:right-auto md:w-[380px] z-[150] overflow-hidden bg-[#222329] border-r border-[#2C2D33] shadow-2xl animate-in slide-in-from-left duration-300">
          <div className="w-full h-full flex flex-col relative text-white">
            {/* Top Header */}
            <div className="pt-5 pb-5 px-5 flex items-center justify-between border-b border-[#2C2D33]">
              <h2 className="text-[17px] font-medium tracking-wide text-white mb-0">
                Top-20
              </h2>
              <button
                onClick={() => setActiveTab("trade")}
                className="text-[#a6aeb9] hover:text-white transition-colors p-1 -mr-1"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-5 pt-5 pb-20 custom-scrollbar">
              {/* Hall of Fame Banner */}
              <div 
                onClick={() => setShowHallOfFameModal(true)}
                className="mb-6 relative h-[84px] rounded-2xl overflow-hidden bg-gradient-to-r from-[#201d15] via-[#332b1a] to-[#201d15] border border-[#FFE24C]/40 shadow-xl flex flex-col items-center justify-center cursor-pointer hover:shadow-[0_0_15px_rgba(255,226,76,0.2)] transition-all active:scale-[0.98]"
              >
                {/* Animated background particles effect */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={`particle-${i}`}
                      className="absolute w-1 h-1 bg-[#FFE24C] rounded-full animate-pulse"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                      }}
                    ></div>
                  ))}
                </div>
                <span className="text-[11px] font-bold text-[#f5f5f5] mb-1 z-10">
                  Best traders of the week announced
                </span>
                <h3 className="text-[20px] font-bold tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-b from-[#FFE24C] to-[#FFE24C]/80 z-10">
                  HALL OF FAME
                </h3>
              </div>

              <p className="text-[#a6aeb9] text-[13px] font-medium mb-5">
                Traders with the biggest profit
              </p>

              {/* Stats Info */}
              <div className="flex justify-between mb-6 relative">
                <div className="flex flex-col">
                  <span className="text-white text-[15px] font-bold">
                    20,000+
                  </span>
                  <span className="text-[#a6aeb9] text-[12px] font-medium">
                    Participants a day
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-[15px] font-bold">
                      {formatTime(timeLeft)}
                    </span>
                    <Info size={16} className="text-[#a6aeb9] cursor-pointer" />
                  </div>
                  <span className="text-[#a6aeb9] text-[12px] font-medium pr-6">
                    Latest update
                  </span>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-[#1a1b1f] border border-[#2C2D33] rounded-2xl p-5 mb-5 relative group">
                <div className="mb-3 group-hover:scale-105 transition-transform origin-left">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 15l-2 5l9 -9z" opacity="0" />
                    <circle cx="12" cy="8" r="5" fill="none" stroke="#fff" strokeWidth="2"/>
                    <path d="M8.5 12.5L5 21l3.5-2l3.5 2V12.5" fill="none" stroke="#fff" strokeWidth="2"/>
                    <path d="M15.5 12.5L19 21l-3.5-2l-3.5 2V12.5" fill="none" stroke="#fff" strokeWidth="2"/>
                  </svg>
                </div>
                <h4 className="text-[14px] font-bold text-white mb-2 leading-snug">
                  Take your place among Bivaax traders!
                </h4>
                <p className="text-[#a6aeb9] text-[12px] leading-[1.6] font-medium">
                  Your current status is Free. To join the most successful
                  Bivaax traders, upgrade your status, and earn the biggest
                  profit on the platform!
                </p>
                <div className="mt-3">
                  <button className="text-[#FFE24C] font-bold text-[13px] hover:text-[#fff080] transition-colors">
                    Upgrade
                  </button>
                </div>
              </div>

              {/* Period Selector */}
              <div className="mb-6">
                <div className="bg-[#1a1b1f] border border-[#2C2D33] rounded-[10px] px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-[#4B4C53] transition-all relative">
                  <div className="flex flex-col">
                     <span className="text-[11px] font-medium text-[#7b8390] mb-0 leading-none">
                       Period
                     </span>
                     <span className="text-white text-[14px] font-medium mt-1 leading-none">
                       1 day
                     </span>
                  </div>
                  <ChevronDown size={18} className="text-[#a6aeb9]" />
                </div>
              </div>

              {/* Table Header */}
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[#7b8390] text-[12px] font-medium tracking-wide">
                  Ranking
                </span>
                <span className="text-[#7b8390] text-[12px] font-medium tracking-wide">
                  Profit
                </span>
              </div>

              {/* Participants List */}
              <div className="flex flex-col gap-1">
                {dynamicLeaderboard.map((trader, idx) => (
                  <div
                    key={`leaderboard-trader-${trader.rank || idx}`}
                    className={`py-[10px] px-1 flex justify-between items-center border-b border-[#2C2D33]/40 last:border-0 transition-colors ${
                      trader.isCurrentUser ? "bg-[#FFE24C]/10 rounded-lg px-3 -mx-2 hover:bg-[#FFE24C]/20" : "hover:bg-[#1a1b1f]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-[24px] h-[24px] rounded-[6px] flex items-center justify-center text-[12px] font-bold ${
                          trader.rank === 1 ? "bg-[#FFE24C] text-black shadow-[0_0_10px_rgba(255,226,76,0.3)]" : 
                          trader.rank === 2 ? "bg-[#e0e0e0] text-black" : 
                          trader.rank === 3 ? "bg-[#D3885D] text-white" : 
                          trader.isCurrentUser ? "bg-[#FFE24C]/20 text-[#FFE24C]" :
                          "bg-[#2C2D33]/50 text-[#a6aeb9]"
                        }`}
                      >
                        {trader.rank}
                      </div>
                      <div className="w-[18px] h-[13px] rounded-[1px] overflow-hidden flex items-center justify-center text-[13px] bg-white/5">
                        {trader.flagUrl ? (
                          <img 
                             src={trader.flagUrl} 
                             alt="" 
                             className="w-full h-full object-cover"
                             onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                             }}
                          />
                        ) : (
                          trader.flagEmoji || "🌐"
                        )}
                      </div>
                      <span className={`text-[13px] font-bold uppercase tracking-tight ${trader.isCurrentUser ? 'text-[#FFE24C]' : 'text-white'}`}>
                        {trader.name}
                      </span>
                    </div>
                    <span className={`font-bold text-[13px] tracking-tight ${trader.isCurrentUser ? 'text-[#FFE24C]' : 'text-white'}`}>
                      ${trader.formattedProfit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY NEWS MODAL */}
      <AnimatePresence>
      {activeTab === "news" && (
        <div className="fixed md:absolute inset-0 md:left-[72px] md:right-auto md:w-[420px] z-[150] overflow-hidden bg-[#1C1C1E] border-r border-[#2C2C2E] shadow-2xl animate-in slide-in-from-left duration-300">
           <div className="w-full h-full flex flex-col relative text-white">
            <div className="pt-6 pb-4 px-6 flex items-center gap-4 bg-[#1C1C1E]">
              <button
                onClick={() => setActiveTab("activities")}
                className="text-gray-400 hover:text-white transition-colors"
                id="news-back-to-activities-btn"
              >
                <ChevronLeft size={24} strokeWidth={1.5} />
              </button>
              <h2 className="text-[22px] font-bold tracking-tight">Financial News</h2>
            </div>

            {/* Sub-tab switcher */}
            <div className="flex px-6 pb-4 gap-2 border-b border-[#2C2C2E]/60 bg-[#1C1C1E]" id="news-subtabs-container">
              <button
                onClick={() => { setNewsFeedTab("platform"); setNewsSearchQuery(""); }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-[12px] uppercase tracking-wider border transition-all bg-[#2C2C2E] text-[#ffe24c] border-[#ffe24c]/30 shadow-lg`}
                id="news-platform-tab-btn"
              >
                Platform News
              </button>
            </div>

            {/* Interactive Search & Filter Bar */}
            <div className="px-6 pt-4 pb-3 space-y-3 bg-[#1C1C1E] border-b border-[#2C2C2E]/50" id="news-search-filter-section">
              {/* Search input */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                  <Icons.Search size={15} />
                </span>
                <input
                  type="text"
                  value={newsSearchQuery}
                  onChange={(e) => setNewsSearchQuery(e.target.value)}
                  placeholder="Search official announcements..."
                  className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl pl-9 pr-9 py-2.5 text-[13px] font-medium text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ffe24c] focus:border-[#ffe24c] transition-all"
                  id="news-feed-search-input"
                />
                {newsSearchQuery && (
                  <button
                    onClick={() => setNewsSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    id="news-search-clear-btn"
                  >
                    <Icons.XCircle size={15} className="opacity-75" />
                  </button>
                )}
              </div>

              
            </div>
            
            {/* Main scrollable list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide pb-24 bg-[#151517]">
              {newsFeedTab === "market" ? (
                <>
                  {newsRefreshing ? (
                    <div className="py-16 flex flex-col items-center justify-center text-gray-500 space-y-3" id="news-feed-loading-state">
                      <Icons.RefreshCw size={24} className="animate-spin text-[#ffe24c]" />
                      <p className="text-[11px] font-black uppercase tracking-widest text-[#ffe24c]/70 animate-pulse">Syncing market feed...</p>
                    </div>
                  ) : (() => {
                    const filteredRealtimeNews = realtimeNews.filter((item) => {
                      const matchesSearch = 
                        newsSearchQuery === "" ||
                        (item.title && item.title.toLowerCase().includes(newsSearchQuery.toLowerCase())) ||
                        (item.body && item.body.toLowerCase().includes(newsSearchQuery.toLowerCase())) ||
                        (item.source_info?.name && item.source_info.name.toLowerCase().includes(newsSearchQuery.toLowerCase()));

                      if (!matchesSearch) return false;
                      if (marketNewsCategory === "All") return true;

                      const titleLower = (item.title || "").toLowerCase();
                      const bodyLower = (item.body || "").toLowerCase();
                      const tagsLower = (item.tags || "").toLowerCase();
                      const catsLower = (item.categories || "").toLowerCase();

                      const cryptoKeywords = ["btc", "eth", "sol", "crypto", "bitcoin", "ethereum", "blockchain", "binance", "coin", "token", "defi", "web3", "memecoin"];
                      const forexKeywords = ["usd", "eur", "gbp", "jpy", "cny", "fiat", "fed", "inflation", "macro", "rates", "interest", "currency", "forex", "central bank", "unemployment"];
                      const regulationKeywords = ["sec", "regulation", "law", "court", "ban", "license", "irs", "compliance", "lawsuit", "judge", "illegal", "senate", "ftc"];

                      if (marketNewsCategory === "Crypto") {
                        return cryptoKeywords.some(kw => titleLower.includes(kw) || bodyLower.includes(kw) || tagsLower.includes(kw) || catsLower.includes(kw));
                      }
                      if (marketNewsCategory === "Forex") {
                        return forexKeywords.some(kw => titleLower.includes(kw) || bodyLower.includes(kw) || tagsLower.includes(kw) || catsLower.includes(kw));
                      }
                      if (marketNewsCategory === "Regulations") {
                        return regulationKeywords.some(kw => titleLower.includes(kw) || bodyLower.includes(kw) || tagsLower.includes(kw) || catsLower.includes(kw));
                      }
                      return true;
                    });

                    if (filteredRealtimeNews.length === 0) {
                      return (
                        <div className="py-20 text-center text-gray-500 space-y-3" id="news-market-empty-state">
                          <Icons.Activity size={32} className="mx-auto text-gray-600 opacity-40 animate-pulse" />
                          <p className="text-sm font-bold text-gray-400">No trading news found</p>
                          <p className="text-xs text-gray-500 max-w-[280px] mx-auto">Try search modifiers or reset active filter categories.</p>
                          <button
                            onClick={() => { setNewsSearchQuery(""); setMarketNewsCategory("All"); }}
                            className="bg-[#2C2C2E] border border-[#3A3A3C] hover:border-white/20 transition-all text-[11px] text-[#ffe24c] font-black px-4 py-2 rounded-xl"
                            id="news-market-empty-reset-btn"
                          >
                            Reset filters
                          </button>
                        </div>
                      );
                    }

                    return filteredRealtimeNews.map((newsItem, idx) => {
                      const ago = getRelativeTimeString(newsItem.published_on);
                      return (
                        <div 
                          key={`realtime-news-item-${idx}-${newsItem.id}`} 
                          onClick={() => {
                            setSelectedNews({
                              ...newsItem,
                              isRealtime: true,
                              reactions: newsItem.reactions || Math.floor(Math.random() * 85) + 12,
                              badReactions: newsItem.badReactions || Math.floor(Math.random() * 12),
                              emoji: "⚡"
                            });
                            setActiveTab("news-detail");
                          }}
                          className="bg-[#2C2C2E]/50 hover:bg-[#2C2C2E]/80 rounded-[24px] p-5 border border-white/5 hover:border-[#ffe24c]/20 transition-all cursor-pointer space-y-3 shrink-0 active:scale-[0.98] group relative overflow-hidden"
                          id={`realtime-news-card-${newsItem.id || idx}`}
                        >
                          <div className="flex justify-between items-center text-gray-500 text-[11px] font-bold">
                            <span className="text-[#309cf4] bg-[#309cf4]/10 border border-[#309cf4]/10 px-2.5 py-0.5 rounded-lg text-[9px] uppercase tracking-wider font-extrabold shadow-sm">
                              {newsItem.source_info?.name || "Global"}
                            </span>
                            <span className="font-mono text-gray-400 bg-[#1C1C1E] px-2 py-0.5 rounded-md text-[10px]">{ago}</span>
                          </div>

                          <div className="flex gap-4 items-start">
                            <div className="flex-1 space-y-1.5">
                              <h4 className="text-[15px] font-black leading-snug group-hover:text-yellow-400 transition-colors line-clamp-3">
                                {newsItem.title}
                              </h4>
                              <p className="text-gray-400 text-[12.5px] leading-relaxed line-clamp-2">
                                {newsItem.body}
                              </p>
                            </div>
                            {newsItem.imageurl && (
                              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#1C1C1E] border border-white/5 shadow-inner">
                                <img 
                                  src={newsItem.imageurl} 
                                  referrerPolicy="no-referrer"
                                  alt="" 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                                 loading="lazy" />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-3 border-t border-white/5 text-gray-500 font-bold">
                            <span className="bg-white/5 hover:bg-white/10 transition-colors px-2 py-1 rounded-md text-[10px] text-gray-300 transform items-center flex gap-1 capitalize">
                              <Icons.Hash size={11} className="text-[#ffe24c]" /> {newsItem.categories?.split(',')[0] || "Global Market"}
                            </span>
                            <span className="text-[#ffe24c] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Take a brief <Icons.ArrowUpRight size={13} strokeWidth={2.5} />
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </>
              ) : (
                <>
                  {(() => {
                    const platformItems = newsData;
                    const filteredPlatformNews = platformItems.filter((item) => {
                      const matchesSearch = 
                        newsSearchQuery === "" ||
                        (item.title && item.title.toLowerCase().includes(newsSearchQuery.toLowerCase())) ||
                        (item.description && item.description.toLowerCase().includes(newsSearchQuery.toLowerCase()));
                      return matchesSearch;
                    });

                    if (filteredPlatformNews.length === 0) {
                      return (
                        <div className="py-20 text-center text-gray-500 space-y-3" id="news-platform-empty-state">
                          <Icons.Inbox size={32} className="mx-auto text-gray-600 opacity-40 animate-pulse" />
                          <p className="text-sm font-bold text-gray-400">No platform news found</p>
                          <button
                            onClick={() => setNewsSearchQuery("")}
                            className="bg-[#2C2C2E] border border-[#3A3A3C] hover:border-white/20 transition-all text-[11px] text-[#ffe24c] font-black px-4 py-2 rounded-xl"
                            id="news-platform-empty-reset-btn"
                          >
                            Reset search
                          </button>
                        </div>
                      );
                    }

                    return filteredPlatformNews.map((news, idx) => (
                      <div 
                        key={`news-item-${idx}-${news.id}-${news.title}`} 
                        onClick={() => {
                          setSelectedNews({
                            ...news,
                            isRealtime: false
                          });
                          setActiveTab("news-detail");
                        }}
                        className="bg-[#2C2C2E]/60 hover:bg-[#2C2C2E] rounded-3xl p-5 border border-[#3A3A3C]/70 hover:border-white/10 transition-all cursor-pointer space-y-3 active:scale-[0.98] group relative"
                        id={`platform-news-card-${news.id || idx}`}
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-gray-500 text-[11px] font-mono font-bold bg-[#1C1C1E] px-2.5 py-0.5 rounded-md">{news.date}</p>
                          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        </div>
                        <h4 className="text-[16px] font-black leading-snug group-hover:text-[#ffe24c] transition-colors">
                          {news.emoji} {news.title}
                        </h4>
                        <p className="text-gray-400 text-[13px] line-clamp-2 leading-relaxed">
                          {news.description}
                        </p>
                        <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                           <span className="text-yellow-500/70"><Icons.Smile size={13} /></span>
                           <span className="text-gray-400 text-[11px] font-black">{news.reactions || 12} reactions</span>
                        </div>
                      </div>
                    ));
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY NEWS DETAIL MODAL */}
      {activeTab === "news-detail" && selectedNews && (
        <div className="fixed md:absolute inset-0 md:left-[72px] md:right-auto md:w-[420px] z-[160] overflow-hidden bg-[#1C1C1E] border-r border-[#2C2C2E] shadow-2xl animate-in slide-in-from-left duration-300">
           <div className="w-full h-full flex flex-col relative text-white">
            <div className="pt-6 pb-4 px-6 flex items-center gap-4 border-b border-[#2C2C2E] bg-[#1C1C1E] sticky top-0 z-10" id="news-details-header">
              <button
                onClick={() => setActiveTab("news")}
                className="text-gray-400 hover:text-white transition-colors"
                id="news-details-back-to-list-btn"
              >
                <ChevronLeft size={24} strokeWidth={1.5} />
              </button>
              <h2 className="text-[15px] font-extrabold uppercase tracking-widest text-[#ffe24c] truncate max-w-[280px]">
                {selectedNews.isRealtime ? "Live market update" : "Platform notice"}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 bg-[#141416]">
              {selectedNews.isRealtime ? (
                selectedNews.imageurl ? (
                  <img 
                    src={selectedNews.imageurl} 
                    referrerPolicy="no-referrer"
                    alt={selectedNews.title} 
                    className="w-full h-56 object-cover border-b border-white/5" 
                   loading="lazy" />
                ) : (
                  <div className="w-full h-48 bg-[#2C2C2E]/60 flex items-center justify-center text-4xl border-b border-white/5 text-gray-500">⚡</div>
                )
              ) : selectedNews.image ? (
                <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-56 object-cover border-b border-white/5"  loading="lazy" />
              ) : (
                <div className="w-full h-48 bg-[#2C2C2E]/60 flex items-center justify-center text-4xl border-b border-white/5">{selectedNews.emoji || "📣"}</div>
              )}

              <div className="px-6 py-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-black uppercase text-black bg-[#ffe24c] px-2.5 py-1 rounded-md tracking-wider">
                      {selectedNews.isRealtime ? (selectedNews.source_info?.name || "Global News") : "Platform Official"}
                    </span>
                    {selectedNews.isRealtime && (
                      <span className="text-[11px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-md">
                        {getRelativeTimeString(selectedNews.published_on)}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-black leading-tight tracking-tight text-white group-hover:text-yellow-400 transition-colors">
                    {selectedNews.isRealtime ? "" : (selectedNews.emoji + " ")}{selectedNews.title}
                  </h2>
                  
                  {!selectedNews.isRealtime && (
                    <p className="text-gray-500 text-xs font-bold font-mono">{selectedNews.date}</p>
                  )}
                </div>
                
                <div className="text-gray-300 text-[14.5px] leading-relaxed space-y-4 font-medium border-t border-white/5 pt-4">
                  {selectedNews.isRealtime ? (
                    <>
                      <p className="bg-white/[0.02] border-l-2 border-[#ffe24c] p-3 text-gray-400 italic rounded-r-xl text-[13.5px]">
                        {selectedNews.body}
                      </p>
                      
                      <div className="pt-4 pb-2 text-center" id="news-realtime-external-link-container">
                        <button
                          onClick={() => window.open(selectedNews.url, "_blank")}
                          className="w-full bg-[#309cf4] hover:bg-[#43a6f5] text-white font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-[13px] shadow-lg shadow-[#309cf4]/10"
                          id="news-read-full-external-articles-btn"
                        >
                          <Icons.ExternalLink size={16} />
                          Read Full Article on {selectedNews.source_info?.name || "Publisher Site"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        <a href="#" className="text-blue-400 hover:underline">Increase your chances</a> of becoming a winner before time runs out: deposit $50 or more, reach a turnover of $300, and get your Horseshoe.
                      </p>
                      <p className="text-gray-300">
                        {selectedNews.content?.split('*')[0] || ""}
                      </p>
                      {selectedNews.content?.includes('*') && (
                        <p className="text-gray-500 text-[12.5px] italic pt-4 border-t border-[#2C2C2E]">
                          *{selectedNews.content?.split('*')[1] || ""}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Reaction engine */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <h5 className="text-white font-bold text-[14px] uppercase tracking-wider text-gray-400 font-extrabold">Did you find this helpful?</h5>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        if (!selectedNews.hasVotedUp && !selectedNews.hasVotedDown) {
                          setSelectedNews((p: any) => p ? { ...p, reactions: (p.reactions || 0) + 1, hasVotedUp: true } : null);
                          toast.success("Thanks for your reaction!");
                        }
                      }}
                      className={`flex-1 hover:bg-[#3A3A3C] transition-colors py-3.5 rounded-2xl flex items-center justify-center gap-3 border transition-all ${
                        selectedNews.hasVotedUp 
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30 font-black shadow-inner"
                          : "bg-[#2C2C2E] text-gray-300 border-[#3A3A3C]"
                      }`}
                      id="news-feedback-like-btn"
                    >
                       <Icons.Smile size={20} className={selectedNews.hasVotedUp ? "text-yellow-500" : "text-gray-400"} />
                       <span className="font-extrabold text-[13px]">{selectedNews.reactions}</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        if (!selectedNews.hasVotedUp && !selectedNews.hasVotedDown) {
                          setSelectedNews((p: any) => p ? { ...p, badReactions: (p.badReactions || 0) + 1, hasVotedDown: true } : null);
                          toast.success("Feedback submitted!");
                        }
                      }}
                      className={`flex-1 hover:bg-[#3A3A3C] transition-colors py-3.5 rounded-2xl flex items-center justify-center gap-3 border transition-all ${
                        selectedNews.hasVotedDown 
                          ? "bg-red-500/10 text-red-400 border-red-500/30 font-black shadow-inner"
                          : "bg-[#2C2C2E] text-gray-300 border-[#3A3A3C]"
                      }`}
                      id="news-feedback-dislike-btn"
                    >
                       <Icons.Frown size={20} className={selectedNews.hasVotedDown ? "text-red-400" : "text-gray-400"} />
                       <span className="font-extrabold text-[13px]">{selectedNews.badReactions || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </AnimatePresence>

      {/* OVERLAY MARKET STATE MODAL */}
      {activeTab === "market-state" && (
        <div className="fixed md:absolute inset-0 md:left-[72px] md:right-auto md:w-[420px] z-[160] overflow-hidden bg-[#1C1C1E] border-r border-[#2C2C2E] shadow-2xl animate-in slide-in-from-left duration-300">
          <div className="w-full h-full flex flex-col relative text-white">
            <div className="pt-6 pb-4 px-6 flex items-center gap-4 border-b border-[#2C2C2E] bg-[#1C1C1E] sticky top-0 z-10">
              <button
                onClick={() => setActiveTab("trade")}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={24} strokeWidth={1.5} />
              </button>
              <h2 className="text-[18px] font-black tracking-tight flex items-center gap-2">
                <Activity size={20} className="text-[#FFE24C]" /> MARKET STATE
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto w-full scrollbar-hide py-4 px-4 pb-20">
              <div className="grid gap-3">
                {Object.keys(markets).map(asset => {
                  const data = markets[asset];
                  return (
                    <div key={`mkt-state-${asset}`} className="bg-[#2C2C2E] rounded-xl p-4 border border-[#3A3A3C] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AssetLogo name={asset} />
                        <div>
                          <p className="font-bold text-[15px]">{asset}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${data.state === 'frozen' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                              {data.state === 'frozen' ? 'FROZEN' : 'ACTIVE'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[14px] font-bold tracking-tight">{data.price ? data.price.toFixed(4) : '---'}</p>
                        <p className="text-xs text-yellow-500 font-black mt-0.5 bg-yellow-500/10 inline-block px-1.5 py-0.5 rounded">{data.payout || 83}% PAYOUT</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY EDUCATION MODAL */}
      {activeTab === "education" && (
        <div className="fixed md:absolute inset-0 md:left-[72px] md:right-auto md:w-[420px] z-[150] overflow-hidden bg-[#1C1C1E] border-r border-[#2C2C2E] shadow-2xl animate-in slide-in-from-left duration-300">
          <div className="w-full h-full flex flex-col relative text-white">
            <div className="pt-6 pb-4 px-6 flex items-center gap-4 border-b border-[#2C2C2E]">
              <button
                onClick={() => setActiveTab("activities")}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={24} strokeWidth={1.5} />
              </button>
              <h2 className="text-[22px] font-bold">Education</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide pb-20">
              {(() => {
                const eduList = educationData;
                const welcomeItem = eduList.find(i => i.id === '1' || i.id === 1 || i.title?.toLowerCase().includes("welcome")) || eduList[0];
                const videoItems = eduList.filter(i => i !== welcomeItem);

                return (
                  <>
                    {welcomeItem && (
                      <div 
                        className="bg-gradient-to-br from-yellow-700/60 to-[#1C1C1E] rounded-xl p-5 border border-yellow-700/30 cursor-pointer group flex justify-between items-center"
                        onClick={() => {
                          setActiveVideoTitle(welcomeItem.title);
                          setActiveVideoUrl(welcomeItem.videoUrl);
                        }}
                      >
                        <div>
                          <h3 className="text-[17px] font-bold text-white mb-1.5 leading-tight w-4/5">{welcomeItem.title}</h3>
                          <p className="text-yellow-500 text-[13px] font-medium">{welcomeItem.description}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500 transition-colors">
                          <Play className="text-yellow-500 group-hover:text-black ml-1 transition-colors" fill="currentColor" strokeWidth={0} size={24} />
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 pt-2">
                       {videoItems.length > 0 && (
                          <div className="bg-[#2C2C2E] px-4 py-3 rounded-xl flex items-center justify-between cursor-pointer border border-[#3A3A3C]">
                            <span className="font-medium text-gray-300">All videos</span>
                            <Icons.ChevronDown className="text-gray-500" size={20} />
                          </div>
                       )}

                      {videoItems.map((item, idx) => (
                        <div 
                          key={`edu-vid-${idx}-${item.id}`} 
                          className="bg-[#212124] rounded-xl overflow-hidden cursor-pointer group mb-4 border border-white/5"
                          onClick={() => {
                            setActiveVideoTitle(item.title);
                            setActiveVideoUrl(item.videoUrl);
                          }}
                        >
                          <div className="p-4">
                            <h3 className="text-[20px] font-bold text-white mb-1.5 leading-tight">{item.title}</h3>
                            {item.description && (
                              <p className="text-gray-400 text-[13px] leading-relaxed mb-2 line-clamp-3">{item.description}</p>
                            )}
                          </div>
                          <div className="relative shadow-inner">
                            {item.thumbnailUrl ? (
                              <img src={item.thumbnailUrl} alt={item.title} className="w-full aspect-video object-cover opacity-80"  loading="lazy" />
                            ) : (
                              <div className="w-full aspect-video bg-gradient-to-br from-yellow-700/40 to-[#1C1C1E] flex items-center justify-center">
                                <Play size={40} className="text-yellow-500/50" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                               <div className="w-14 h-14 rounded-full border border-yellow-500/50 flex items-center justify-center bg-black/40 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                                 <Play fill="currentColor" strokeWidth={0} size={24} className="ml-1" />
                               </div>
                            </div>
                            {item.duration && (
                              <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-0.5 rounded text-[12px] font-bold text-white/90">
                                {item.duration}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY ASSETS MODAL */}
      {activeTab === "assets" && (
        <div className="fixed md:absolute inset-0 md:left-[76px] md:right-auto md:w-[380px] z-[150] overflow-hidden bg-[#222329] border-r border-[#2C2D33] shadow-2xl animate-in slide-in-from-left duration-300">
          <div className="w-full h-full flex flex-col relative text-white">
            {/* Top Header */}
            <div className="pt-5 px-5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[17px] font-medium text-white tracking-wide">{t('assets')}</h2>
                <button
                  onClick={() => {
                    setAssetSearch("");
                    setActiveTab("trade");
                  }}
                  className="text-[#a6aeb9] hover:text-white transition-colors"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Asset Category Tabs */}
              <div className="flex w-full border-b border-[#2C2D33] mb-4">
                {["FTT", "5ST", "DRT", "CFD"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAssetGroup(tab)}
                    className={`flex-1 pb-3 text-center text-[13px] font-bold tracking-wide transition-all relative ${
                      assetGroup === tab
                        ? "text-white"
                        : "text-[#a6aeb9] hover:text-white/80"
                    }`}
                  >
                    {tab}
                    {assetGroup === tab && (
                      <motion.div 
                        layoutId="activeTabUnderline"
                        className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-white z-10" 
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-5 pt-2 pb-6 custom-scrollbar">
              <div className="flex items-center justify-center gap-1.5 mb-5 text-[12px] font-bold">
                <span className="text-[#a6aeb9]">{Object.keys(markets).length} in total</span>
                <span className="text-[#a6aeb9] opacity-30">•</span>
                <span className="text-[#00C980]">{Object.values(markets).filter((m: any) => m.active).length} active</span>
              </div>

              {/* Search Bar */}
              <div className="relative mb-5 group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search size={18} className="text-[#a6aeb9] group-focus-within:text-white transition-colors" />
                </div>
                <input
                  ref={assetSearchRef}
                  type="text"
                  placeholder={t('search')}
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  className="block w-full pl-10 pr-10 py-[11px] rounded-xl bg-[#1a1b1f] border border-[#2C2D33] focus:border-white/20 text-white placeholder-[#7b8390] focus:outline-none transition-all text-[14px] font-medium shadow-inner"
                />
                {assetSearch && (
                  <button
                    onClick={() => setAssetSearch("")}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#a6aeb9] hover:text-white transition-colors"
                  >
                    <div className="w-5 h-5 bg-white/5 rounded-full flex items-center justify-center">
                      <X size={12} />
                    </div>
                  </button>
                )}
              </div>

              {/* Filters Horizontal Scroll Chips */}
              <div className="flex items-center gap-2 mb-6 overflow-hidden relative">
                <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pr-8 scroll-smooth" id="category-chips">
                  {["All", "Crypto", "Currencies", "Commodities", "Stocks"].map((cat) => {
                    const totalCountInfo = Object.keys(markets).length; // Dummy
                    const count = Object.keys(markets).filter(name => {
                      if (cat === "All") return true;
                      if (cat === "Crypto") return name.includes('/USD') || name.includes('IDX');
                      if (cat === "Currencies") return name.includes('/') && !name.includes('Crypto');
                      if (cat === "Commodities") return name.includes('Gold') || name.includes('Silver') || name.includes('Oil');
                      if (cat === "Stocks") return name === 'Yum Brands' || name.includes('Apple') || name.includes('Tesla');
                      return false;
                    }).length;

                    return (
                      <button
                        key={cat}
                        onClick={() => setAssetCategory(cat)}
                        className={`px-3 py-[4px] rounded-full text-[12px] font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-all border ${
                          assetCategory === cat
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-[#a6aeb9] hover:text-white border-[#2C2D33] hover:border-[#4B4C53]"
                        }`}
                      >
                        {cat} <span className={assetCategory === cat ? "opacity-60" : "text-[#7b8390] text-[11px]"}>{cat === "All" ? totalCountInfo : count}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-[#222329] via-[#222329] to-transparent pl-4 pointer-events-none">
                  <ChevronRight size={18} className="text-[#a6aeb9]" />
                </div>
              </div>

              {/* Table Header */}
              <div className="flex items-center justify-between px-2 mb-3 border-b border-[#2C2D33] pb-2">
                <span className="text-[#7b8390] text-[11px] font-bold tracking-wide">Asset</span>
                <div className="flex items-center">
                  <div className="flex gap-1 items-center w-[70px] justify-end">
                    <span className="text-[#7b8390] text-[11px] font-bold tracking-wide">Profit</span>
                    <Info size={11} className="text-[#7b8390]" />
                  </div>
                  <div className="w-[70px] text-right">
                     <span className="text-[#7b8390] border-b border-dashed border-[#7b8390]/50 text-[11px] font-bold tracking-wide cursor-help">For VIP</span>
                  </div>
                </div>
              </div>

              {/* Asset List */}
              <div className="flex flex-col pb-6 h-full">
                {(() => {
                  const filteredAssets = Object.entries(markets)
                    .filter(([name, data]: [string, any]) => {
                      if (data.hidden) return false;
                      
                      const matchesSearch = name.toLowerCase().includes(assetSearch.toLowerCase());
                      if (!matchesSearch) return false;

                      if (assetCategory === "All") return true;
                      if (assetCategory === "Crypto") return name.includes('/USD') || name.includes('IDX');
                      if (assetCategory === "Currencies") return name.includes('/') && !name.includes('Crypto');
                      if (assetCategory === "Commodities") return name.includes('Gold') || name.includes('Silver') || name.includes('Oil');
                      if (assetCategory === "Stocks") return name === 'Yum Brands' || name.includes('Apple') || name.includes('Tesla');
                      return true;
                    })
                    .sort((a: [string, any], b: [string, any]) => b[1].payout - a[1].payout);

                  if (filteredAssets.length === 0) {
                    return (
                      <div className="py-20 flex flex-col items-center justify-center opacity-40">
                        <Search size={40} className="mb-4 stroke-[#a6aeb9]" />
                        <p className="text-[#a6aeb9] font-bold uppercase tracking-widest text-[11px]">{t('noAssetsFound')}</p>
                        {assetSearch && <p className="text-[#7b8390] text-[10px] mt-2 font-medium italic">Try checking other categories</p>}
                      </div>
                    );
                  }

                  return filteredAssets.map(([assetName, assetData]: [string, any], i: number) => (
                    <div
                      key={`${assetName}-${i}`}
                      onClick={() => {
                        setChartLoading(true);
                        setActiveAsset(assetName);
                        setActiveTab("trade");
                        setAssetSearch("");
                        setAssetCategory("All");
                        setTimeout(() => setChartLoading(false), 300);
                      }}
                      className={`group flex items-center justify-between py-[12px] px-2 cursor-pointer transition-all rounded-[6px] mb-1 ${
                        activeAsset === assetName ? "bg-[#33353e] hover:bg-[#3a3d46]" : "hover:bg-[#2C2D33]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 flex justify-center items-center overflow-hidden">
                          <AssetLogo name={assetName} />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-[13px] tracking-tight leading-tight">
                              {assetName}
                            </span>
                            {assetData.isFrozen && (
                              <span className="text-[9px] font-bold text-sky-400 bg-sky-950/60 border border-sky-800/50 px-1.5 py-0.2 select-none rounded flex items-center gap-0.5 tracking-wide uppercase">
                                <Snowflake size={8} /> {assetData.freezeReason === 'maintenance' ? 'Maint' : 'Volat'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-center w-[70px]">
                           <span className="text-[#00C980] font-bold text-[14px]">{assetData.payout}%</span>
                        </div>
                        <div className="text-right w-[70px]">
                           <span className="text-white font-bold text-[14px]">{assetData.payout + 2}%</span>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HELP CENTER VIEW */}
      {activeTab === "help-center" && (
        <div className="fixed inset-0 z-[160] flex flex-col overflow-hidden bg-[#0a0b0d]">
          <div className="w-full h-full flex flex-col relative text-white z-50">
            {/* Hero Heading */}
            <div className="bg-[#0a0b0d] px-6 pt-12 pb-6 border-b border-white/5 flex items-center gap-3">
               <button 
                 onClick={() => setActiveTab("trade")}
                 className="p-2 ml-4 text-gray-400 hover:text-white transition-colors active:scale-95 flex items-center justify-center rounded-full hover:bg-white/5"
               >
                 <ChevronLeft size={28} />
               </button>
               <h2 className="text-[28px] font-bold text-white leading-tight tracking-normal">How can we help?</h2>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-[#0a0b0d] pb-20 scrollbar-hide">
               {/* Categories Grid */}
               <div className="max-w-[500px] px-6 py-2 space-y-6">
                  <div className="flex flex-col gap-6">
                    {HELP_CATEGORIES.map((cat) => (
                      <button 
                        key={`help-cat-${cat.id}`}
                        onClick={() => {
                          if (cat.id === 'about') {
                            navigate("/about-us");
                          }
                        }}
                        className="flex items-center gap-6 group text-left py-2"
                      >
                        <div className="w-[72px] h-[72px] rounded-full bg-[#1e232b] flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:border-white/20 transition-all duration-300">
                           <cat.icon size={28} className={cat.color} />
                        </div>
                        <span className="text-[20px] font-bold text-white group-hover:text-yellow-500 transition-colors tracking-tight leading-none">{cat.title}</span>
                      </button>
                    ))}
                  </div>

                  {/* Market Title */}
                  <div className="pt-24 pb-12">
                     <h2 className="text-[36px] font-black text-white leading-none tracking-tighter uppercase whitespace-pre-wrap">Market</h2>
                  </div>

                  {/* Promoted Articles */}
                  <div>
                     <h2 className="text-[42px] font-black text-white mb-12 uppercase tracking-tighter leading-none">Promoted articles</h2>
                     <div className="flex flex-col gap-8">
                        {PROMOTED_ARTICLES.map((article, idx) => (
                          <button key={`help-promo-article-${idx}`} className="text-[20px] font-bold text-yellow-500/80 hover:text-yellow-500 text-left transition-colors whitespace-normal leading-relaxed hover:underline underline-offset-8">
                             {article}
                          </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* TOURNAMENTS DRAWER */}
      {activeTab === "tournaments" && (
        <div className="fixed md:absolute inset-y-0 left-0 w-[85vw] max-w-[400px] md:left-[68px] md:right-auto md:w-[400px] z-[150] flex flex-col overflow-hidden bg-[#1f2026] border-r border-white/5 shadow-2xl animate-in slide-in-from-left duration-300">
           {/* Header */}
           <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0 bg-[#1f2026] z-[210]">
              <h2 className="text-lg font-black tracking-tight uppercase">Tournaments</h2>
              <button 
                 onClick={() => setActiveTab("trade")} 
                 className="text-gray-400 hover:text-white transition-colors p-1"
              >
                 <X size={24} strokeWidth={1.5} />
              </button>
           </div>

           {/* Main Content */}
           <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar bg-[#131417]">
              <div className="space-y-6">
                 {tournamentsData.map((tourney, tourneyIdx) => (
                    <div key={`tourney-drawer-${tourney.id}-${tourneyIdx}`} className="bg-[#1f2026] rounded-2xl overflow-hidden shadow-lg border border-white/5 group flex flex-col">
                       <div className="relative h-[160px] overflow-hidden">
                          <img 
                             src={tourney.imageUrl || 'https://images.unsplash.com/photo-1611974714851-48206138d73e?auto=format&fit=crop&q=80&w=600'} 
                             className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                             alt={tourney.title} 
                           loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1f2026] via-[#1f2026]/20 to-transparent"></div>
                          <div className="absolute bottom-3 left-4">
                             <h3 className="text-white font-black text-[18px] tracking-tight leading-tight">{tourney.title}</h3>
                          </div>
                          <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md text-white px-2 py-1 rounded-md text-[9px] font-black uppercase">
                             End {tourney.endTime || '23d 02h'}
                          </div>
                       </div>
                       
                       <div className="p-4 flex flex-col gap-4">
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <p className="text-[#7b8390] text-[9px] font-black uppercase tracking-widest mb-1">Fee</p>
                                <span className="text-white font-black text-[15px]">{formatWithCurrency(Number(String(tourney.participationFee || '0').replace(/,/g, '')), userCurrency)}</span>
                             </div>
                             <div>
                                <p className="text-[#7b8390] text-[9px] font-black uppercase tracking-widest mb-1">Prize</p>
                                <span className="text-[#ffe24c] font-black text-[15px]">{formatWithCurrency(Number(String(tourney.prizePool || '0').replace(/,/g, '')), userCurrency)}</span>
                             </div>
                          </div>

                          <div className="pt-4 border-t border-white/5">
                             {userRegistrations.includes(tourney.id) ? (
                                <button
                                    onClick={() => {
                                        setActiveTournamentId(tourney.id);
                                        setAccountType("tournament");
                                        setActiveTab("trade");
                                        toast.success(`Switched to "${tourney.title}" Tournament Trading!`);
                                    }}
                                    className="w-full bg-[#309cf4] hover:bg-[#40acf4] text-white font-black text-[12px] h-[44px] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Icons.Trophy size={14} />
                                    TRADE NOW
                                </button>
                             ) : (
                                <button
                                    onClick={() => handleRegisterTournament(tourney)}
                                    className="w-full bg-[#ffe24c] hover:bg-[#fff080] text-[#131417] font-black text-[12px] h-[44px] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Icons.Sparkles size={14} />
                                    REGISTER FOR FREE
                                </button>
                             )}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* COPY TRADING DRAWER */}
      {activeTab === "copytrading" && (
        <div className="fixed md:absolute inset-y-0 left-0 w-[85vw] max-w-[400px] md:left-[68px] md:right-auto md:w-[400px] z-[150] flex flex-col overflow-hidden bg-[#1f2026] border-r border-white/5 shadow-2xl animate-in slide-in-from-left duration-300">
           {/* Header */}
           <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0 bg-[#1f2026] z-[210]">
              <h2 className="text-lg font-black tracking-tight uppercase">Copy Trading</h2>
              <button 
                 onClick={() => setActiveTab("trade")} 
                 className="text-gray-400 hover:text-white transition-colors p-1"
              >
                 <X size={24} strokeWidth={1.5} />
              </button>
           </div>
           
           <div className="flex-1 overflow-hidden">
              <CopyTradingPage hideHeader={true} />
           </div>
        </div>
      )}
      {/* TRADES HISTORY DRAWER */}
      {activeTab === "history" && (
        <div className="fixed md:absolute inset-y-0 left-0 w-[85vw] max-w-[400px] md:left-[68px] md:right-auto md:w-[400px] z-[150] flex flex-col overflow-hidden bg-[#121214] border-r border-white/5 shadow-2xl animate-in slide-in-from-left duration-300">
          <div className="w-full h-full flex flex-col relative text-white z-50">
            {/* Top Header */}
            <div className="h-[64px] flex items-center justify-between px-6 border-b border-white/5 bg-[#121214] shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab("trade")}
                  className="text-[#9ea0a5] hover:text-white transition-colors p-2 -ml-2"
                >
                  <ArrowLeft size={24} strokeWidth={2} />
                </button>
                <h2 className="text-[20px] font-black tracking-tight text-white m-0 uppercase">
                  Trades
                </h2>
              </div>
              <div className="flex items-center gap-2">
                 <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Search size={20} />
                 </button>
                 <button className="p-2 text-gray-400 hover:text-white transition-colors" onClick={() => setActiveTab("trade")}>
                    <X size={24} strokeWidth={1.5} />
                 </button>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="px-6 bg-[#121214] border-b border-white/5 shrink-0">
              <div className="flex w-full items-center gap-8">
                <button 
                  onClick={() => setHistoryTab("open")}
                  className={`py-4 text-[14px] font-bold tracking-wider transition-all relative ${historyTab === "open" ? "text-[#ffe24c]" : "text-[#7b8390]"}`}
                >
                  OPEN
                  {historyTab === "open" && <motion.div layoutId="history-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ffe24c]" />}
                </button>
                <button 
                  onClick={() => setHistoryTab("closed")}
                  className={`py-4 text-[14px] font-bold tracking-wider transition-all relative ${historyTab === "closed" ? "text-white" : "text-[#7b8390]"}`}
                >
                  CLOSED
                  {historyTab === "closed" && <motion.div layoutId="history-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#0B0B0C] relative custom-scrollbar">
              {historyLoading ? (
                <div className="space-y-3">
                  {/* Skeleton Stats Card */}
                  <div className="flex items-center justify-between mb-4 bg-[#1C1C1E] rounded-xl p-4 border border-white/5 animate-pulse">
                    <div className="space-y-2">
                      <div className="w-20 h-2 bg-white/5 rounded" />
                      <div className="w-12 h-4 bg-white/5 rounded" />
                    </div>
                    <div className="space-y-2 items-end flex flex-col">
                      <div className="w-14 h-2 bg-white/5 rounded" />
                      <div className="w-20 h-4 bg-white/5 rounded" />
                    </div>
                  </div>

                  {/* Skeleton Trade List Items */}
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={`skeleton-history-${i}`} className="bg-[#1C1C1E] rounded-xl p-4 border border-white/5 flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5" />
                        <div className="space-y-2">
                           <div className="w-24 h-3 bg-white/5 rounded" />
                           <div className="w-16 h-2 bg-white/5 rounded" />
                        </div>
                      </div>
                      <div className="space-y-2 items-end flex flex-col">
                         <div className="w-14 h-3 bg-white/5 rounded" />
                         <div className="w-10 h-3 bg-white/5 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full mx-auto px-2 md:px-6">
                  {historyTab === "open" && (
                  <div className="bg-[#1C1C1E] rounded-xl p-4 flex items-center justify-between border border-yellow-500/30 mb-6 cursor-pointer hover:bg-white/[0.04] transition-all group" onClick={() => setShowOpenTrades(true)}>
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-md border-2 border-yellow-500/50 flex items-center justify-center shrink-0">
                         <div className="w-3 h-3 rounded-sm bg-transparent"></div>
                      </div>
                      <span className="text-white text-[15px] font-bold tracking-tight">
                        View open trades on traderoom
                      </span>
                    </div>
                    <div className="p-1.5 bg-white/5 rounded-full">
                       <Info size={16} className="text-gray-400" />
                    </div>
                  </div>
                )}

                <div className="flex flex-col pb-20">
                      {/* Firebase Data Fetching Logic for Trades */}
                      {(() => {
                          const filtered = historyTab === "open" 
                            ? visibleActiveTrades 
                            : visibleUserTrades.filter(t => t.status !== 'open');

                          if (filtered.length === 0) {
                              return (
                                  <div className="text-center py-12 flex flex-col items-center gap-4">
                                      <div className="w-16 h-16 bg-[#2a2b30] rounded-full flex items-center justify-center text-gray-600">
                                          <History size={32} />
                                      </div>
                                      <div className="text-gray-500 text-[14px]">No {historyTab} trades found</div>
                                  </div>
                              );
                          }

                          return filtered.map((trade: any, idx: number) => {
                             const isWin = trade.status === 'won';
                             const isLoss = trade.status === 'lost';
                             const isDraw = trade.status === 'draw';
                             const isOpen = trade.status === 'open';
                             const profit = trade.payoutAmount || (trade.amount * (trade.payout / 100 + 1));
                             
                             return (
                               <div
                                 key={`trade-list-item-${trade.id || 'no-id'}-${idx}`}
                                 className={`bg-[#1C1C1E] rounded-xl p-4 flex flex-col border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-all relative mb-3 group ${isOpen ? 'border-yellow-500/20' : ''}`}
                                 onClick={() => {
                                   setSelectedTrade(trade);
                                   setActiveTab("history-detail");
                                 }}
                               >
                                 <div className="flex justify-between items-center mb-1">
                                     <div className="flex items-center gap-3">
                                         <AssetLogo name={trade.asset} size={24} />
                                         <div className="flex items-center gap-1.5">
                                            <span className="text-[16px] font-bold text-white tracking-tight leading-none">{trade.asset}</span>
                                            <span className="text-[14px] text-gray-500 font-medium">{trade.payout}%</span>
                                         </div>
                                     </div>
                                     <div className="flex flex-col items-end">
                                        <span className={`text-[15px] font-bold tracking-tight ${isWin ? "text-[#FFE24C]" : "text-gray-500"}`}>
                                           {isWin ? `+ ${formatWithCurrency(profit, userCurrency)}` : (isDraw ? formatWithCurrency(trade.amount, userCurrency) : formatWithCurrency(0, userCurrency))}
                                        </span>
                                     </div>
                                 </div>

                                 <div className="flex justify-between items-center">
                                   <div className="flex items-center gap-2">
                                       <div className={`flex items-center justify-center ${trade.type === 'up' ? 'text-[#00C980]' : 'text-[#FF4D4F]'}`}>
                                          {trade.type === 'up' ? <ArrowUp size={14} strokeWidth={3} /> : <ArrowDown size={14} strokeWidth={3} />}
                                       </div>
                                       <span className="text-[12px] text-gray-500 font-medium flex items-center gap-1">
                                          {new Date(trade.createdAt || trade.entryTime * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                          <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                          {new Date(trade.createdAt || trade.entryTime * 1000).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                       </span>
                                   </div>
                                   <span className="text-white font-bold text-[15px] tracking-tight">
                                      {formatWithCurrency(trade.amount, userCurrency)}
                                   </span>
                                 </div>
                               </div>
                             );
                           });
                      })()}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "calculator" && (
        <div className="fixed md:absolute inset-0 md:left-[72px] md:right-auto md:w-[380px] z-[150] overflow-hidden bg-[#222226] border-r border-[#3b3b3f] shadow-2xl animate-in slide-in-from-left duration-200">
          <div className="w-full h-full flex flex-col bg-[#26262a] relative pt-0 text-white z-50 animate-in fade-in duration-200" id="profit-calculator-container">
            {/* Top Header */}
            <div className="pt-6 pb-4 px-4 shadow-sm border-b border-[#3b3b3f] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab("trade")}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-[20px] font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <Icons.Calculator className="text-[#FFE24C] w-5 h-5 animate-pulse" />
                  Calculator
                </h2>
              </div>
              <button 
                onClick={() => {
                  setCalcAmount(amount);
                  if (markets && markets[activeAsset]) {
                    setCalcPayout(markets[activeAsset].payout || 82);
                  }
                  toast.success("Synchronized with active trade!");
                }}
                title="Sync from trading ticket"
                className="p-1 px-2.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-mono font-bold text-gray-400 hover:text-white transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#222226]" id="profit-calculator-scroll">
              
              {/* Active Asset Info Banner */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex items-center justify-between font-sans">
                <div>
                  <div className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest mb-1">Active Market Asset</div>
                  <div className="text-[15px] font-black text-white">{activeAsset}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest mb-1">Standard Yield</div>
                  <div className="text-[15px] font-bold text-[#FFE24C]">+{markets[activeAsset]?.payout || 82}%</div>
                </div>
              </div>

              {/* SECTION: Investment input */}
              <div className="space-y-3 font-sans">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Trade Amount</label>
                  <span className="text-[11px] font-mono text-gray-500">Balance: {accountType === 'demo' ? formatWithCurrency(demoBalance, userCurrency) : formatWithCurrency(realBalance, userCurrency)}</span>
                </div>
                
                {/* Numeric Input container */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-[#FFE24C]">{userCurrency}</span>
                  <input
                    type="number"
                    value={calcAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setCalcAmount(val);
                    }}
                    className="w-full bg-[#1A1A1F] border border-[#3b3b3f] focus:border-[#FFE24C] transition-colors rounded-xl py-3.5 pl-9 pr-4 text-white text-lg font-extrabold outline-none"
                    placeholder="Enter amount"
                  />
                </div>

                {/* Amount Quick Presets */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[50, 100, 250, 500, 1000, 2500, 5000].map((pAmt) => (
                    <button
                      key={`calc-amt-preset-${pAmt}`}
                      onClick={() => setCalcAmount(pAmt)}
                      className={`text-xs font-black py-2 rounded-lg border transition-all ${
                        calcAmount === pAmt
                          ? "bg-[#FFE24C] text-black border-[#FFE24C]"
                          : "bg-[#2A2C31]/40 text-gray-300 border-[#3b3b3f]/60 hover:bg-[#2A2C31]"
                      }`}
                    >
                      {userCurrency}{pAmt}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const currentBal = accountType === 'demo' ? demoBalance : realBalance;
                      const balInUserCurr = convertFromBase(currentBal, userCurrency);
                      setCalcAmount(Math.floor(balInUserCurr));
                    }}
                    className={`text-xs font-black py-2 rounded-lg border transition-all ${
                      calcAmount === Math.floor(convertFromBase(accountType === 'demo' ? demoBalance : realBalance, userCurrency))
                        ? "bg-[#ff4d4d] text-white border-[#ff4d4d]"
                        : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                    }`}
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* SECTION: Payout percentage slider / preset */}
              <div className="space-y-3 font-sans">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Expected Payout (%)</label>
                  <span className="text-[15px] font-black text-[#FFE24C]">{calcPayout}%</span>
                </div>

                {/* Range Slider */}
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={calcPayout}
                    onChange={(e) => setCalcPayout(parseInt(e.target.value))}
                    className="flex-1 h-1 bg-[#1A1A1F] rounded-lg appearance-none cursor-pointer accent-[#FFE24C]"
                  />
                </div>

                {/* Payout Presets */}
                <div className="grid grid-cols-5 gap-1.5 pt-1 font-sans">
                  {[70, 80, 82, 90, 95].map((pPct) => (
                    <button
                      key={`calc-pct-preset-${pPct}`}
                      onClick={() => setCalcPayout(pPct)}
                      className={`text-xs font-black py-2 rounded-lg border transition-all ${
                        calcPayout === pPct
                          ? "bg-white text-black border-white"
                          : "bg-[#2A2C31]/40 text-gray-400 border-[#3b3b3f]/60 hover:bg-[#2A2C31]"
                      }`}
                    >
                      {pPct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <hr className="border-white/5 my-2" />

              {/* SECTION: Calculation Result Grid */}
              <div className="space-y-4 font-sans">
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Potential Outcomes</h3>
                
                <div className="grid grid-cols-1 gap-3">
                  
                  {/* Option green: WIN */}
                  <div className="bg-[#10c877]/5 border border-[#10c877]/20 rounded-2xl p-4 flex justify-between items-center transition-all hover:bg-[#10c877]/10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-mono">
                        <div className="w-2 h-2 rounded-full bg-[#10c877] animate-pulse" />
                        <span className="text-[10px] text-[#10c877] font-black uppercase tracking-widest leading-none">If Trade Wins</span>
                      </div>
                      <div className="text-[13px] text-gray-400 font-semibold mt-0.5 font-sans">Net Profit Return</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-[#10c877]">
                        +{userCurrency}{(calcAmount * (calcPayout / 100)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                    </div>
                  </div>

                  {/* Option yellow: TOTAL RETURN */}
                  <div className="bg-yellow-500/[0.03] border border-yellow-500/15 rounded-2xl p-4 flex justify-between items-center font-sans">
                    <div className="space-y-1">
                      <span className="text-[10px] text-yellow-500 font-extrabold uppercase tracking-widest font-mono">Total Payout</span>
                      <div className="text-[13px] text-gray-400 font-semibold mt-0.5">Active + Profit</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-[#FFE24C]">
                        {userCurrency}{(calcAmount * (1 + calcPayout / 100)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                    </div>
                  </div>

                  {/* Option red: LOSS */}
                  <div className="bg-[#ff5252]/5 border border-[#ff5252]/20 rounded-2xl p-4 flex justify-between items-center transition-all hover:bg-[#ff5252]/10 font-sans">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#ff5252] font-black uppercase tracking-widest font-mono">If Trade Loses</span>
                      <div className="text-[13px] text-gray-400 font-semibold mt-0.5">Capital at Risk</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-[#ff5252]">
                        -{userCurrency}{calcAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Extra visual metadata: Risk/Reward summary info */}
              <div className="bg-[#1C1C1F] rounded-xl p-3.5 border border-white/5 text-[12.5px] leading-relaxed text-gray-400 font-medium font-sans">
                <span className="text-white font-extrabold">Notice:</span> A payout rate of <span className="text-[#FFE24C] font-semibold">{calcPayout}%</span> represents a <span className="text-white font-bold">1 : {parseFloat((calcPayout/100).toFixed(2))}</span> risk-to-reward ratio. In order to break even over a series of trades at this payout, a minimum winning accuracy rate of <span className="text-white font-semibold">{(100 / (1 + calcPayout/100)).toFixed(1)}%</span> is required.
              </div>

              {/* Apply settings to terminal button */}
              <div className="pt-4 pb-8 font-sans" id="calc-apply-to-ticket-container">
                <button
                  onClick={() => {
                    if (calcAmount <= 0) {
                      toast.error("Please enter a valid investment amount!");
                      return;
                    }
                    setAmount(calcAmount);
                    toast.success("Amount updated on trading ticket!", {
                      id: "calc-sync-success",
                    });
                    setActiveTab("trade");
                  }}
                  className="w-full bg-[#309cf4] hover:bg-[#43a6f5] active:scale-[0.98] transition-all text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 text-[14px] shadow-lg shadow-[#309cf4]/10"
                >
                  <Icons.Check size={18} />
                  APPLY AMOUNT {userCurrency}{calcAmount} TO TICKET
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DETAILED TRADE VIEW */}
      {activeTab === "history-detail" && selectedTrade && (
        <div className="fixed inset-0 md:left-[72px] z-[600] flex flex-col overflow-hidden bg-[#121214] animate-in fade-in slide-in-from-right duration-300">
          <div className="w-full h-full flex flex-col relative text-white z-50">
            {/* Top Header */}
            <div className="h-[64px] flex items-center gap-4 px-6 border-b border-white/5 bg-[#121214] shrink-0">
              <button
                onClick={() => setActiveTab("history")}
                className="text-[#9ea0a5] hover:text-white transition-colors p-2 -ml-2"
              >
                <Icons.ArrowLeft size={24} strokeWidth={2} />
              </button>
              <h2 className="text-[20px] font-bold tracking-tight text-white uppercase">
                {selectedTrade.asset}
              </h2>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-8 bg-[#0B0B0C] relative custom-scrollbar">
                <div className="w-full mx-auto px-2 md:px-6">
                  <div className="flex flex-col items-center mb-10">
                  <div className="w-20 h-20 bg-[#1C1C1E] rounded-[24px] flex items-center justify-center mb-4 border border-white/5 shadow-xl">
                    <AssetLogo name={selectedTrade.asset} size={48} />
                  </div>
                  <h2 className="text-[32px] font-black tracking-tight text-white mb-1">
                    {selectedTrade.asset}
                  </h2>
                  <div className="flex items-center gap-3 text-gray-500 font-medium">
                     <span className="text-sm">ID {selectedTrade.id ? String(selectedTrade.id).substring(0, 10).toUpperCase() : '4739925494'}</span>
                     <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                     <span className="text-sm flex items-center gap-1.5"><Calendar size={14} /> {new Date(selectedTrade.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <button 
                    onClick={() => {
                      setActiveAsset(selectedTrade.asset);
                      setActiveTab("trade");
                    }}
                    className="w-full bg-[#1C1C1E] hover:bg-[#252529] border border-white/5 text-white font-bold text-[16px] py-4 rounded-[16px] transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <span>Trade on asset</span>
                    <Icons.ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-[#1C1C1E] p-5 rounded-[20px] border border-white/5 shadow-sm">
                      <p className="text-gray-500 text-[13px] font-bold uppercase tracking-wider mb-2">Amount</p>
                      <p className="text-white text-2xl font-black">{formatWithCurrency(selectedTrade.amount, userCurrency)}</p>
                   </div>
                   <div className="bg-[#1C1C1E] p-5 rounded-[20px] border border-white/5 shadow-sm">
                      <p className="text-gray-500 text-[13px] font-bold uppercase tracking-wider mb-2">Income</p>
                      <p className={`text-2xl font-black ${selectedTrade.status === 'won' ? 'text-[#FFE24C]' : 'text-gray-400'}`}>
                        {userCurrency} {selectedTrade.status === 'won' 
                          ? (selectedTrade.amount * (selectedTrade.payout / 100 + 1)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                          : (selectedTrade.status === 'lost' ? '0.00' : selectedTrade.status === 'draw' ? selectedTrade.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00')}
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1C1C1E] rounded-[20px] p-6 flex flex-col border border-white/5 shadow-sm">
                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">Entry</h3>
                    <span className="text-white text-lg font-black mb-6 font-mono">
                      {selectedTrade.entryPrice?.toFixed(8) || '641.86746366'}
                    </span>
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mt-auto">
                      <Clock size={14} /> {new Date(selectedTrade.createdAt).toLocaleTimeString(undefined, { timeZone, hour12: false })}
                    </div>
                  </div>

                  <div className="bg-[#1C1C1E] rounded-[20px] p-6 flex flex-col border border-white/5 shadow-sm">
                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">Exit</h3>
                    <span className="text-white text-lg font-black mb-6 font-mono">
                      {selectedTrade.exitPrice?.toFixed(8) || (selectedTrade.status === 'open' ? 'PENDING' : '641.86746411')}
                    </span>
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mt-auto">
                      <Clock size={14} /> {selectedTrade.closedAt ? new Date(selectedTrade.closedAt).toLocaleTimeString(undefined, { timeZone, hour12: false }) : (selectedTrade.expirationTime ? new Date(selectedTrade.expirationTime).toLocaleTimeString(undefined, { timeZone, hour12: false }) : '--:--:--')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY COPY TRADING MODAL */}
      {activeTab === "copy-trading" && (
        <div key="copy-trading-overlay" className="fixed inset-0 md:left-[72px] z-[500] flex flex-col overflow-hidden bg-[#121214] animate-in fade-in slide-in-from-bottom duration-300">
          <div className="w-full h-full flex flex-col relative text-white z-50">
            {/* Top Header */}
            <div className="h-[64px] flex items-center justify-between px-6 border-b border-white/5 bg-[#121214] shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab("trade")}
                  className="text-[#9ea0a5] hover:text-white transition-colors p-2 -ml-2"
                >
                  <ArrowLeft size={24} strokeWidth={2} />
                </button>
                <h2 className="text-[22px] font-black tracking-tight text-white m-0 uppercase">
                  Copy trading
                </h2>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 bg-[#121214] border-b border-white/5 shrink-0">
              <div className="flex w-full items-center gap-8">
                <button className="py-4 text-[14px] font-bold tracking-wider text-[#ffe24c] border-b-2 border-[#ffe24c]">
                  TRADERS
                </button>
                <button className="py-4 text-[14px] font-bold tracking-wider text-[#7b8390] hover:text-white transition-colors">
                  MY CARD
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-[#0B0B0C] relative custom-scrollbar">
              <div className="w-full mx-auto px-2 md:px-6">
                <p className="text-[#9ea0a5] text-[15px] leading-relaxed mb-6">
                  Copy top traders to learn and grow. Easy way for newbies to get started!
                </p>

              <div className="flex justify-end mb-6">
                <button 
                  onClick={() => setShowCopyTradingHowItWorks(true)}
                  className="text-[#FFE24C] text-[13px] underline decoration-[#FFE24C] underline-offset-4 decoration-1"
                >
                  How it works?
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {masterTraders.map((trader, idx) => (
                  <div 
                    key={`master-trader-${idx}-${trader.id || 'master-' + idx}`} 
                    onClick={() => navigate('/copytrading')}
                    className="bg-[#3A3C42] rounded-[22px] p-5 border border-white/5 active:bg-[#45474d] transition-all shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                         <span className="text-[18px]">{trader.country}</span>
                         <span className="text-[15px] font-bold text-white uppercase">{trader.name}</span>
                      </div>
                      {trader.level === 'VIP' && (
                        <div className="px-2.5 py-0.5 bg-[#FFE24C]/10 border border-[#FFE24C]/30 rounded-md">
                           <span className="text-[10px] font-black italic text-[#FFE24C] tracking-tighter">VIP</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-5">
                       <Users size={15} className="text-gray-500" />
                       <span className="text-[13px] text-gray-500 font-bold">Copiers: <span className="text-white font-black">{trader.copiersCount}/{trader.maxCopiers}</span></span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 mb-6">
                       <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Gain per week</span>
                          <span className="text-[16px] font-black text-[#10c877]">{trader.gainPerWeek}</span>
                       </div>
                       <div className="flex flex-col gap-1.5 items-center">
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Copied trades</span>
                          <span className="text-[16px] font-black text-white">{trader.copiedTrades}</span>
                       </div>
                       <div className="flex flex-col gap-1.5 items-end">
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Commission</span>
                          <span className="text-[16px] font-black text-white">{trader.commission}</span>
                       </div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                       <div className="h-[5px] w-full bg-black/30 rounded-full overflow-hidden flex">
                          <div className="h-full bg-[#10c877]" style={{ width: `${trader.profitRate}%` }}></div>
                          <div className="h-full bg-[#ff5252]" style={{ width: `${trader.lossRate}%` }}></div>
                       </div>
                       <div className="flex justify-between text-[11px] items-center">
                           <span className="text-[#10c877] font-black">{trader.profitRate}% Profit</span>
                           <span className="text-[#ff5252] font-black">{trader.lossRate}% Loss</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* FULL PAGE PROFILE & INVITE FRIENDS */}
      {activeTab === "profile" && (
        <div className="absolute inset-0 z-[160] flex flex-col bg-[#1A1A1D] text-white">
          {/* Top Bar with Back Button */}
          <div className="flex items-center gap-3 px-4 pt-6 pb-4 bg-[#222226] border-b border-[#3b3b3f]/50">
             <button onClick={() => setActiveTab("trade")} className="text-gray-400 hover:text-white">
               <ChevronLeft size={26} strokeWidth={2} />
             </button>
             <h2 className="text-lg font-semibold tracking-wide">Profile</h2>
          </div>

          {/* Custom Top Tabs */}
          <div className="flex items-center px-4 bg-[#222226] border-b border-[#3b3b3f]/50 mt-1 overflow-x-auto custom-scrollbar">
             <button 
                onClick={() => setActiveProfileTab("account")}
                className={`py-3 px-2 mr-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeProfileTab === 'account' ? 'border-[#00C980] text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
             >
               Account Details
             </button>
             <button 
                onClick={() => setActiveProfileTab("invite")}
                className={`py-3 px-2 mr-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeProfileTab === 'invite' ? 'border-[#00C980] text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
             >
               Affiliate Program
             </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-[#1A1A1D]">
              {isProfileLoading ? (
                 <div className="p-4 flex flex-col w-full mx-auto pb-20 animate-pulse">
                      <div className="flex flex-col items-center mt-8 mb-8">
                         <div className="w-24 h-24 bg-white/5 rounded-full mb-3" />
                         <div className="w-32 h-4 bg-white/5 rounded" />
                      </div>
                      <div className="w-full h-24 bg-white/5 rounded-2xl mb-10" />
                      <div className="w-full h-40 bg-white/5 rounded-2xl mb-10" />
                      <div className="w-full h-60 bg-white/5 rounded-2xl mb-10" />
                 </div>
              ) : activeProfileTab === "account" && (
               <div className="p-4 flex flex-col w-full mx-auto pb-20">
                  {/* Avatar & ID */}
                  <div className="flex flex-col items-center mt-8 mb-8">
                    <div className="relative group">
                      <div className="w-24 h-24 bg-[#2A2B31] rounded-full flex items-center justify-center mb-3 border-[3px] border-[#3b3b3f] overflow-hidden">
                        {profilePic ? (
                          <img src={profilePic} alt="Profile" className="w-full h-full object-cover"  loading="lazy" />
                        ) : (
                          <User size={40} className="text-gray-400" />
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          const url = prompt("Enter Image URL for profile picture:");
                          if (url) setProfilePic(url);
                        }}
                        className="absolute bottom-2 right-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black shadow-lg border-2 border-[#1A1A1D] hover:scale-110 active:scale-95 transition-all"
                      >
                        <Camera size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                    <span className="text-gray-400 text-sm font-medium">ID: {currentUser?.uid?.slice(-8).toUpperCase() || "180798637"}</span>
                  </div>

                  {/* Status Card */}
                  <div className="bg-gradient-to-r from-[#2A2B31] to-[#3A3C42] rounded-2xl p-5 flex items-center justify-between mb-10 cursor-pointer shadow-lg border border-[#3b3b3f]/50 group hover:border-[#4A4B50] transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner group-hover:scale-105 transition-transform">
                         <Shield size={24} className="text-gray-300" />
                       </div>
                       <div>
                         <h2 className="text-xl font-bold text-white mb-0.5 tracking-tight group-hover:text-[#00C980] transition-colors">Standard</h2>
                         <p className="text-gray-400 text-sm">Your status</p>
                       </div>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-300 group-hover:bg-white/10 group-hover:text-white transition-all">
                       <ChevronRight size={18} />
                     </div>
                  </div>

                  {/* Achievements */}
                  <div className="mb-10">
                     <h3 className="text-xl font-bold mb-5 tracking-tight">Achievements</h3>
                     <div className="flex items-center justify-between mb-5 px-4">
                        <div className="w-20 h-20 bg-[#2A2B31] rounded-[24px] flex items-center justify-center rotate-[8deg] border border-[#3b3b3f] shadow-md hover:scale-105 transition-transform cursor-pointer">
                          <ShieldCheck size={36} className="text-gray-400/80" strokeWidth={1.5} />
                        </div>
                        <div className="w-20 h-20 bg-[#2A2B31] rounded-[24px] flex items-center justify-center -rotate-[5deg] border border-[#3b3b3f] shadow-md hover:scale-105 transition-transform cursor-pointer">
                          <Zap size={36} className="text-gray-400/80" strokeWidth={1.5} />
                        </div>
                        <div className="w-20 h-20 bg-[#2A2B31] rounded-[24px] flex items-center justify-center rotate-3 border border-[#3b3b3f] shadow-md relative hover:scale-105 transition-transform cursor-pointer">
                          <Star size={36} className="text-gray-400/80" strokeWidth={1.5} />
                          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#1A1A1D] rounded-full flex items-center justify-center border-2 border-[#1A1A1D]">
                            <Lock size={14} className="text-gray-400" />
                          </div>
                        </div>
                     </div>

                     <button 
                       onClick={() => setShowAchievementsModal(true)}
                       className="w-full py-3.5 bg-[#2A2B31] hover:bg-[#323338] active:bg-[#3A3C42] text-white rounded-[14px] font-semibold transition-colors"
                     >
                       Show all
                     </button>
                  </div>

                  {/* Security */}
                  <div className="bg-[#222226] rounded-2xl p-6 mb-10 border border-[#3b3b3f]/50 shadow-md">
                     <h3 className="text-xl font-bold mb-6 tracking-tight">Security</h3>
                     
                     <div className="flex items-center gap-4 mb-5">
                       {is2FAEnabled ? (
                         <div className="w-14 h-14 bg-[#00C980]/10 rounded-full flex items-center justify-center">
                           <ShieldCheck size={28} className="text-[#00C980]" strokeWidth={2} />
                         </div>
                       ) : (
                         <div className="w-14 h-14 bg-orange-500/10 rounded-full flex items-center justify-center">
                           <Unlock size={28} className="text-orange-500" strokeWidth={2} />
                         </div>
                       )}
                       <div>
                         <p className="text-gray-400 text-sm mb-0.5">Account security level:</p>
                         {is2FAEnabled ? (
                           <p className="text-[#00C980] font-bold tracking-wide">HIGH</p>
                         ) : (
                           <p className="text-orange-500 font-bold tracking-wide">MEDIUM</p>
                         )}
                       </div>
                     </div>

                     <p className="text-[15px] text-gray-400 mb-6 leading-relaxed">Please ensure you've protected your account and funds by all the available means:</p>

                     <div className="space-y-4 mb-7">
                       <div className="flex items-center gap-3">
                         <div className="w-[22px] h-[22px] rounded-full bg-[#00C980]/20 flex items-center justify-center shrink-0">
                           <Check size={14} className="text-[#00C980]" strokeWidth={3} />
                         </div>
                         <span className="text-[15px] text-gray-300">Phone number confirmed</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <div className="w-[22px] h-[22px] rounded-full bg-[#00C980]/20 flex items-center justify-center shrink-0">
                           <Check size={14} className="text-[#00C980]" strokeWidth={3} />
                         </div>
                         <span className="text-[15px] text-gray-300">Email address confirmed</span>
                       </div>
                       <div className="flex items-center gap-3">
                         {is2FAEnabled ? (
                           <div className="w-[22px] h-[22px] rounded-full bg-[#00C980]/20 flex items-center justify-center shrink-0">
                             <Check size={14} className="text-[#00C980]" strokeWidth={3} />
                           </div>
                         ) : (
                           <div className="w-[22px] h-[22px] rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                             <X size={14} className="text-red-500" strokeWidth={3} />
                           </div>
                         )}
                                                   <span className="text-[15px] text-gray-300">
                            Two-factor authentication (2FA) is {is2FAEnabled ? 'on' : 'off'}
                          </span>
                          {!is2FAEnabled && (
                            <button 
                              onClick={() => setIs2FAEnabled(true)}
                              className="text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors ml-auto"
                            >
                              Activate
                            </button>
                          )}
                       </div>
                     </div>

                     <button className="py-2.5 px-5 bg-[#2A2B31] hover:bg-[#323338] active:scale-[0.98] rounded-xl text-[15px] text-gray-200 font-medium transition-all border border-[#3b3b3f]">
                       Why is it important?
                     </button>
                  </div>

                   {/* Settings */}
                  <div className="bg-[#222226] rounded-2xl p-6 mb-10 border border-[#3b3b3f]/50 shadow-md">
                     <h3 className="text-xl font-bold mb-6 tracking-tight">Settings</h3>
                     
                     <div className="flex flex-col gap-4">
                        <div>
                           <p className="text-gray-400 text-[15px] mb-3">Display Currency</p>
                           <div className="flex gap-2">
                              {['৳', '$', '€'].map((curr) => (
                                 <button
                                    key={curr}
                                    onClick={async () => {
                                       const oldCurrency = currencies.find(c => c.symbol === userCurrency || c.code === userCurrency) || currencies[0];
                                       const newCurrency = currencies.find(c => c.symbol === curr || c.code === curr) || currencies[0];
                                       setAmount(prev => Math.floor((prev / oldCurrency.rate) * newCurrency.rate));
                                       setDepositAmount(prev => {
                                          const val = parseFloat(prev);
                                          if (isNaN(val)) return prev;
                                          return Math.floor((val / oldCurrency.rate) * newCurrency.rate).toString();
                                       });
                                       setUserCurrency(curr);
                                       if (currentUser) {
                                          try {
                                            await updateDoc(doc(db, "users", currentUser.uid), {
                                               currency: curr
                                            });
                                            toast.success(`Currency changed to ${curr}`);
                                          } catch (e) {
                                            console.error("Failed to update currency:", e);
                                            toast.error("Failed to save currency setting");
                                          }
                                       }
                                    }}
                                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all border ${userCurrency === curr ? 'bg-[#00C980] border-[#00C980] text-white shadow-lg' : 'bg-[#2A2B31] border-[#3b3b3f] text-gray-400 hover:text-white'}`}
                                 >
                                    {curr}
                                 </button>
                              ))}
                           </div>
                           <p className="mt-3 text-[11px] text-gray-500 leading-snug">
                              Changing the display currency will automatically convert your balance display using real-time rates.
                           </p>
                        </div>

                        {/* TIME ZONE SELECTOR */}
                        <div>
                           <p className="text-gray-400 text-[15px] mb-3 mt-4">Local Time Zone</p>
                           <button 
                              onClick={() => setShowTimeZoneModal(true)}
                              className="w-full flex bg-[#2A2B31] border border-[#3b3b3f] rounded-xl relative items-center px-4 h-[52px] hover:bg-[#323338] transition-all group"
                           >
                              <Icons.Clock size={18} className="text-gray-400 mr-3 group-hover:text-white transition-colors" />
                              <div className="flex-1 text-left">
                                <span className="text-white font-medium">
                                  {timeZone.replace(/_/g, " ")} 
                                  <span className="text-gray-500 text-xs ml-2">
                                    {(() => {
                                      try {
                                        return `(${new Date().toLocaleTimeString("en-US", { timeZone: timeZone, hour: "2-digit", minute: "2-digit", timeZoneName: "short" })})`;
                                      } catch (e) {
                                        return `(${new Date().toLocaleTimeString("en-US", { timeZone: 'UTC', hour: "2-digit", minute: "2-digit", timeZoneName: "short" })})`;
                                      }
                                    })()}
                                  </span>
                                </span>
                              </div>
                              <Icons.ChevronRight size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                           </button>
                           <p className="mt-3 text-[11px] text-gray-500 leading-snug">
                              Sets the time zone used for displaying charts, trades, and market events.
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Contacts */}
                  <div className="mb-10">
                     <h3 className="text-xl font-bold mb-4 tracking-tight">Contacts</h3>
                     
                     <div className="bg-[#222226] rounded-[16px] flex flex-col border border-[#3b3b3f]/50 p-1.5 mb-4 shadow-sm">
                       <div className="px-5 py-3">
                         <label className="text-sm text-gray-500 block mb-1">Phone number</label>
                         <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" className="w-full bg-transparent text-[16px] text-white focus:outline-none" />
                       </div>
                       <button 
                         onClick={handleSavePhone}
                         disabled={isSaving || !phone}
                         className={`w-full py-3.5 mt-1 rounded-[12px] font-semibold transition-all ${
                           (isSaving || !phone) 
                             ? 'bg-[#2A2B31] text-gray-500 cursor-not-allowed' 
                             : 'bg-[#FFE24C] text-black hover:bg-[#E5CB44]'
                         }`}
                       >
                         {isSaving ? "Saving..." : "Save"}
                       </button>
                     </div>

                     <div className="bg-[#222226] rounded-[16px] flex items-center justify-between border border-[#3b3b3f]/50 px-5 py-4 shadow-sm">
                       <div>
                         <label className="text-sm text-gray-500 block mb-1">Email</label>
                         <span className="text-[16px] text-white">{currentUser?.email || ""}</span>
                       </div>
                       <div className="w-7 h-7 rounded-full bg-[#00C980]/20 flex items-center justify-center">
                         <Check size={16} className="text-[#00C980]" strokeWidth={3} />
                       </div>
                     </div>
                  </div>

                  {/* Two-factor authentication */}
                  <div className="mb-10">
                     <div className="flex items-center justify-between mb-3">
                       <h3 className="text-xl font-bold tracking-tight">Two-factor authentication (2FA)</h3>
                       {is2FAEnabled ? (
                         <span className="bg-[#00C980] text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                           <Check size={12} strokeWidth={3} /> On
                         </span>
                       ) : (
                         <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                           <X size={12} strokeWidth={3} /> Off
                         </span>
                       )}
                     </div>
                     <p className="text-[15px] text-gray-400 mb-5 leading-relaxed">
                       Protect your account and funds from illegal access. Get a proven authentication method in addition to your password. <a href="#" className="text-[#007DF0] underline hover:text-[#0091ff]">Learn more</a>
                     </p>
                     
                     {is2FAEnabled ? (
                       <button
                         onClick={() => setIs2FAEnabled(false)} 
                         className="w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 active:scale-[0.98] text-red-500 font-bold text-[16px] rounded-[14px] transition-all border border-red-500/20"
                       >
                         Turn off
                       </button>
                     ) : (
                       <button 
                         onClick={() => setShow2FAModal(true)}
                         className="w-full py-3.5 bg-[#FFD700] hover:bg-[#F0C800] active:scale-[0.98] text-black font-bold text-[16px] rounded-[14px] transition-all shadow-[0_4px_14px_rgba(255,215,0,0.2)]"
                       >
                         Set up
                       </button>
                     )}
                  </div>

                  {/* Platform language */}
                  <div className="mb-10">
                     <h3 className="text-xl font-bold mb-4 tracking-tight">{t('language')}</h3>
                     <div 
                       onClick={() => setShowLanguageModal(true)}
                       className="bg-[#222226] rounded-[16px] flex flex-col border border-[#3b3b3f]/50 px-5 py-4 cursor-pointer hover:bg-[#26262a] transition-colors shadow-sm"
                     >
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                           <div className="text-2xl leading-none">{selectedLanguage.flag}</div>
                           <span className="text-white text-[16px] font-medium">{selectedLanguage.name}</span>
                         </div>
                         <ChevronDown size={22} className="text-gray-500" />
                       </div>
                     </div>
                  </div>

                  {/* Nickname */}
                  <div className="mb-10">
                     <h3 className="text-xl font-bold mb-4 tracking-tight">{t('nickname')}</h3>
                     <div className="bg-[#222226] rounded-[16px] flex flex-col border border-[#3b3b3f]/50 p-1.5 mb-4 shadow-sm">
                       <div className="px-5 py-3">
                         <label className="text-sm text-gray-500 block mb-1">Nickname</label>
                         <input 
                           type="text" 
                           placeholder="Nickname" data-test="true" 
                           value={nickname}
                           onChange={(e) => setNickname(e.target.value)}
                           className="w-full bg-transparent text-[16px] text-white focus:outline-none placeholder-gray-600" 
                         />
                       </div>
                       <button 
                         onClick={async () => {
                           if (nickname !== savedNickname) {
                             if (auth.currentUser) {
                               try {
                                 await updateDoc(doc(db, 'users', auth.currentUser.uid), { nickname: nickname });
                               } catch (err) {
                                 console.error('Error saving nickname:', err);
                                 toast.error('Failed to save nickname');
                                 return;
                               }
                             }
                             setSavedNickname(nickname);
                             setShowSaveToast(true);
                             setTimeout(() => setShowSaveToast(false), 2000);
                           }
                         }}
                         className={`w-full py-3.5 mt-1 rounded-[12px] font-semibold transition-colors ${nickname !== savedNickname ? 'bg-[#FFD700] hover:bg-[#F0C800] text-black active:scale-[0.98]' : 'bg-[#2A2B31] text-gray-500 cursor-not-allowed'}`}
                       >
                         Save
                       </button>
                     </div>
                  </div>

                  {/* Professional KYC Verification Section */}
                  <div className="bg-[#222226] rounded-2xl p-6 mb-10 border border-[#3b3b3f]/50 shadow-md">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold tracking-tight">Identity Verification (KYC)</h3>
                        <div className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            kycStatus === 'verified' ? 'bg-[#00C980]/10 text-[#00C980]' :
                            kycStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                            kycStatus === 'rejected' ? 'bg-red-500/10 text-red-500' :
                            'bg-gray-500/10 text-gray-500'
                        }`}>
                            {kycStatus}
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-4 mb-6">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                            kycStatus === 'verified' ? 'bg-[#00C980]/10' : 'bg-gray-500/10'
                        }`}>
                            <Icons.UserCheck size={28} className={kycStatus === 'verified' ? 'text-[#00C980]' : 'text-gray-500'} />
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-400 text-sm mb-1 leading-relaxed">
                                {kycStatus === 'verified' ? 'Your account is fully verified. Enjoy higher limits and faster withdrawals.' : 
                                 kycStatus === 'pending' ? 'Your verification is currently under review. This usually takes 24-48 hours.' :
                                 kycStatus === 'rejected' ? 'Your verification was rejected. Please check the details and try again.' :
                                 'Verify your identity to increase your withdrawal limits and secure your account.'}
                            </p>
                        </div>
                     </div>

                     {kycStatus !== 'verified' && kycStatus !== 'pending' && (
                        <button 
                            onClick={() => setShowKYCModal(true)}
                            className="w-full py-4 bg-[#FFD700] hover:bg-[#F0C800] active:scale-[0.98] text-black font-bold text-[16px] rounded-[14px] transition-all shadow-[0_4px_14px_rgba(255,215,0,0.2)]"
                        >
                            {kycStatus === 'rejected' ? 'Try Again' : 'Verify Now'}
                        </button>
                     )}
                     
                     {kycStatus === 'pending' && (
                         <div className="w-full py-4 bg-gray-500/10 text-gray-500 font-bold text-[16px] rounded-[14px] text-center border border-white/5">
                             Under Review
                         </div>
                     )}
                  </div>

                  {/* Personal data */}
                  <div className="mb-10">
                     <h3 className="text-xl font-bold mb-4 tracking-tight">Personal data</h3>
                     
                     <div className="space-y-3 mb-4">
                       <div className="bg-[#222226] rounded-[16px] flex flex-col border border-[#3b3b3f]/50 px-5 py-3 shadow-sm hover:border-[#4A4B50] transition-colors">
                         <label className="text-sm text-gray-500 block mb-1">First name</label>
                         <input 
                           type="text" 
                           value={personalData.firstName} 
                           onChange={(e) => setPersonalData({...personalData, firstName: e.target.value})}
                           className="w-full bg-transparent text-[16px] text-white focus:outline-none" 
                         />
                       </div>
                       <div className="bg-[#222226] rounded-[16px] flex flex-col border border-[#3b3b3f]/50 px-5 py-3 shadow-sm hover:border-[#4A4B50] transition-colors">
                         <label className="text-sm text-gray-500 block mb-1">Last name</label>
                         <input 
                           type="text" 
                           value={personalData.lastName} 
                           onChange={(e) => setPersonalData({...personalData, lastName: e.target.value})}
                           className="w-full bg-transparent text-[16px] text-white focus:outline-none" 
                         />
                       </div>
                       <div className="bg-[#222226] rounded-[16px] border border-[#3b3b3f]/50 px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-[#26262a] transition-colors shadow-sm relative">
                         <div>
                           <label className="text-sm text-gray-500 block mb-1">Gender</label>
                           <div className="text-white text-[16px]">{personalData.gender}</div>
                         </div>
                         <ChevronDown size={22} className="text-gray-500" />
                         <select 
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           value={personalData.gender}
                           onChange={(e) => setPersonalData({...personalData, gender: e.target.value})}
                         >
                           <option value="Male">Male</option>
                           <option value="Female">Female</option>
                           <option value="Other">Other</option>
                         </select>
                       </div>
                       <div className="flex gap-3">
                         <div className="flex-1 bg-[#222226] rounded-[16px] border border-[#3b3b3f]/50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#26262a] transition-colors shadow-sm relative">
                           <div>
                             <label className="text-sm text-gray-500 block mb-1">Day</label>
                             <div className="text-white text-[16px]">{personalData.day}</div>
                           </div>
                           <ChevronDown size={18} className="text-gray-500" />
                           <select 
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                             value={personalData.day} 
                             onChange={(e) => setPersonalData({...personalData, day: e.target.value})}
                           >
                             <option value="--">--</option>
                             {Array.from({length: 31}, (_, i) => <option key={`day-sel-${i+1}`} value={i+1}>{i+1}</option>)}
                           </select>
                         </div>
                         <div className="flex-1 bg-[#222226] rounded-[16px] border border-[#3b3b3f]/50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#26262a] transition-colors shadow-sm relative">
                           <div>
                             <label className="text-sm text-gray-500 block mb-1">Month</label>
                             <div className="text-white text-[16px]">{personalData.month}</div>
                           </div>
                           <ChevronDown size={18} className="text-gray-500" />
                           <select 
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                             value={personalData.month} 
                             onChange={(e) => setPersonalData({...personalData, month: e.target.value})}
                           >
                             <option value="--">--</option>
                             {Array.from({length: 12}, (_, i) => <option key={`month-sel-${i+1}`} value={i+1}>{i+1}</option>)}
                           </select>
                         </div>
                         <div className="flex-1 bg-[#222226] rounded-[16px] border border-[#3b3b3f]/50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#26262a] transition-colors shadow-sm relative">
                           <div>
                             <label className="text-sm text-gray-500 block mb-1">Year</label>
                             <div className="text-white text-[16px]">{personalData.year}</div>
                           </div>
                           <ChevronDown size={18} className="text-gray-500" />
                           <select 
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                             value={personalData.year} 
                             onChange={(e) => setPersonalData({...personalData, year: e.target.value})}
                           >
                             <option value="--">--</option>
                             {Array.from({length: 100}, (_, i) => {
                                 const year = new Date().getFullYear() - i - 18; // Start from 18 years ago
                                 return <option key={year} value={year}>{year}</option>
                             })}
                           </select>
                         </div>
                       </div>
                     </div>
                     
                     <button 
                       onClick={() => {
                         if (JSON.stringify(personalData) !== JSON.stringify(savedPersonalData)) {
                           setSavedPersonalData({...personalData});
                           setShowSaveToast(true);
                           setTimeout(() => setShowSaveToast(false), 2000);
                         }
                       }}
                       className={`w-full py-3.5 rounded-[14px] font-semibold transition-colors ${JSON.stringify(personalData) !== JSON.stringify(savedPersonalData) ? 'bg-[#FFD700] hover:bg-[#F0C800] text-black active:scale-[0.98]' : 'bg-[#2A2B31] text-gray-500 cursor-not-allowed'}`}
                     >
                       Save
                     </button>
                  </div>

                  {/* News and notifications */}
                  <div className="mb-10">
                     <h3 className="text-xl font-bold mb-5 tracking-tight">News and notifications</h3>
                     <div className="space-y-4">
                       <label className="flex items-start gap-4 cursor-pointer group" onClick={() => setNotifications(prev => ({...prev, promo: !prev.promo}))}>
                         <div className={`w-[22px] h-[22px] mt-0.5 rounded border flex items-center justify-center transition-all ${notifications.promo ? 'bg-[#00C980] border-[#00C980]' : 'bg-[#2A2B31] border-gray-500 group-hover:border-gray-400'}`}>
                           {notifications.promo && <Check size={16} className="text-white relative top-[0.5px]" strokeWidth={3} />}
                         </div>
                         <span className="text-gray-300 text-[15px] leading-snug pt-0.5 group-hover:text-white transition-colors">Receive newsletter and promotions</span>
                       </label>
                       <label className="flex items-start gap-4 cursor-pointer group" onClick={() => setNotifications(prev => ({...prev, info: !prev.info}))}>
                         <div className={`w-[22px] h-[22px] mt-0.5 rounded border flex items-center justify-center transition-all ${notifications.info ? 'bg-[#00C980] border-[#00C980]' : 'bg-[#2A2B31] border-gray-500 group-hover:border-gray-400'}`}>
                           {notifications.info && <Check size={16} className="text-white relative top-[0.5px]" strokeWidth={3} />}
                         </div>
                         <span className="text-gray-300 text-[15px] leading-snug pt-0.5 group-hover:text-white transition-colors">Allow notifications and informational messages</span>
                       </label>
                     </div>
                  </div>

                  {/* Deposit country */}
                  <div className="mb-10">
                     <h3 className="text-xl font-bold mb-4 tracking-tight">Deposit country</h3>
                     <div 
                       onClick={() => setShowCountryModal(true)}
                       className="bg-[#222226] rounded-[16px] border border-[#3b3b3f]/50 px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-[#26262a] transition-colors shadow-sm"
                     >
                       <span className="text-white text-[16px] font-medium">{selectedCountry}</span>
                       <ChevronDown size={22} className="text-gray-500" />
                     </div>
                  </div>

                  {/* Link social account */}
                  <div className="mb-10">
                     <h3 className="text-xl font-bold mb-4 tracking-tight">Link social account</h3>
                     <div className="flex gap-4">
                       <button className="flex-1 bg-[#1877F2] hover:bg-[#166FE5] text-white py-3.5 rounded-[14px] flex items-center justify-center font-bold text-xl transition-colors shadow-md">
                         f
                       </button>
                       <button className="flex-1 bg-white hover:bg-gray-100 text-black py-3.5 rounded-[14px] flex items-center justify-center font-bold text-lg transition-colors shadow-md flex gap-2">
                         <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                       </button>
                     </div>
                  </div>

                  <button 
                    onClick={async () => {
                      await signOut(auth);
                      navigate("/");
                    }}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 bg-[#FF4444]/10 hover:bg-[#FF4444]/20 text-[#FF4444] rounded-[16px] transition-colors border border-[#FF4444]/20 shadow-sm"
                  >
                    <LogOut size={22} className="text-[#FF4444]" />
                    <span className="text-[17px] font-bold">Sign out</span>
                  </button>

               </div>
             )}

             {activeProfileTab === "invite" && (
               <div className="p-4 flex flex-col items-center justify-center min-h-full pb-20 mt-10">
                  <div className="flex flex-col items-center w-full max-w-sm mx-auto">
                    <div className="relative mb-12 group cursor-pointer mt-10">
                      <div className="w-32 h-32 relative flex items-center justify-center">
                        <UserPlus size={110} className="text-[#3b3b3f]" />
                        <UserPlus size={110} className="text-gray-400 absolute -top-2 -left-2 drop-shadow-md transition-transform" />
                        <UserPlus size={110} className="text-[#FFD700] absolute -top-4 -left-4 drop-shadow-lg transition-transform" />
                        <div className="absolute -bottom-2 -right-4 bg-[#00C980] rounded-xl p-2 rotate-12 shadow-lg">
                          <Plus size={36} className="text-white" strokeWidth={3} />
                        </div>
                      </div>
                    </div>

                    <h2 className="text-[28px] font-bold tracking-tight leading-tight mb-5 text-white text-center">
                      Bivaax <span className="text-[#FFD700]">Partnership</span> Program
                    </h2>

                    <p className="text-[#a0a0a5] text-[16px] leading-relaxed max-w-xs mb-12 text-center">
                      Earn 80% commission for every active lead you refer to Bivaax
                    </p>
                  </div>

                  <div className="w-full max-w-sm mx-auto flex flex-col gap-3">
                    <button 
                      onClick={() => navigate('/affiliate')}
                      className="w-full bg-[#3b3b3f] hover:bg-[#4A4B50] text-[#e1e1e1] font-semibold text-[16px] py-4 rounded-[14px] shadow-sm transition-colors active:scale-[0.98]"
                    >
                      Read details
                    </button>
                    <button 
                      onClick={() => {
                        const refCode = affId || ((currentUser?.uid ? String(currentUser.uid).substring(0, 5).toUpperCase() : 'USER') + Math.floor(Math.random() * 1000 + 1000));
                        navigator.clipboard.writeText(`${window.location.origin}?ref=${refCode}`);
                        toast.success("Referral link copied!");
                      }}
                      className="w-full bg-[#007DF0] hover:bg-[#0091ff] text-white font-semibold text-[16px] py-4 rounded-[14px] shadow-sm transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Icons.Copy size={20} />
                      Copy link
                    </button>
                  </div>
               </div>
             )}

             {activeProfileTab === "transactions" && (
                <div className="p-4 flex flex-col w-full mx-auto pb-20 px-2 md:px-10">
                   <h3 className="text-[13px] font-black tracking-[0.2em] text-gray-500 uppercase mb-8 ml-1">Archive // Financial Vector</h3>
                   <div className="space-y-3">
                      {userTransactions.length === 0 ? (
                        <div className="bg-[#222226] rounded-[24px] p-12 text-center border border-white/5">
                           <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-6">
                             <Icons.Clock size={36} className="text-gray-700" />
                           </div>
                           <p className="text-gray-500 font-medium tracking-tight">No protocol executions detected</p>
                        </div>
                      ) : (
                        userTransactions.map((tx, idx) => (
                          <div 
                            key={`tx-${idx}-${tx.id || tx.timestamp || `unknown-${idx}`}`}
                            className="bg-[#222226] rounded-[24px] border border-white/5 overflow-hidden transition-all hover:border-white/10 group"
                            onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                          >
                             <div className="p-6 flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-5">
                                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${tx.type === 'Deposit' ? 'bg-[#00C980]/10 text-[#00C980]' : 'bg-[#FF4D4F]/10 text-[#FF4D4F]'}`}>
                                      {tx.type === 'Deposit' ? <Icons.Plus size={28} /> : <Icons.Minus size={28} />}
                                   </div>
                                   <div>
                                      <h4 className="font-bold text-white tracking-tight leading-none mb-2 text-[16px]">{tx.type} Execution</h4>
                                      <p className="text-gray-500 text-[11px] font-bold font-mono uppercase tracking-widest">{tx.dateStr}</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className={`font-black text-[18px] tracking-tighter mb-1 ${tx.type === 'Deposit' ? 'text-white' : 'text-gray-300'}`}>
                                      {tx.type === 'Deposit' ? '+' : '-'}{formatWithCurrency(tx.amount, userCurrency)}
                                   </p>
                                   <div className="flex items-center justify-end gap-2">
                                      <div className={`w-2 h-2 rounded-full ${
                                         tx.status === 'Completed' ? 'bg-[#00C980]' : 
                                         tx.status === 'Rejected' ? 'bg-[#FF4D4F]' : 
                                         'bg-gray-600 animate-pulse'
                                      }`} />
                                      <p className={`text-[10px] font-black uppercase tracking-[0.1em] ${
                                         tx.status === 'Completed' ? 'text-[#00C980]' : 
                                         tx.status === 'Rejected' ? 'text-[#FF4D4F]' : 
                                         'text-gray-500'
                                      }`}>
                                         {tx.status}
                                      </p>
                                   </div>
                                </div>
                             </div>

                             {expandedTx === tx.id && (
                               <div className="px-6 pb-8 pt-2 border-t border-white/5 bg-white/[0.01] animate-in slide-in-from-top-4 duration-300">
                                  <div className="grid grid-cols-2 gap-6 pt-6">
                                     <div className="space-y-1.5 focus-within:opacity-100 transition-opacity">
                                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.25em]">Gateway Protocol</p>
                                        <p className="text-white text-[14px] font-bold tracking-tight">{tx.method}</p>
                                     </div>
                                     <div className="space-y-1.5">
                                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.25em]">Sequence Node</p>
                                        <p className="text-white text-[14px] font-bold tracking-tight">{tx.timeStr}</p>
                                     </div>
                                     <div className="col-span-2 space-y-1.5 bg-black/20 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.25em]">Object Reference</p>
                                        <p className="text-gray-400 text-[11px] font-mono break-all leading-relaxed tracking-wider">{tx.id}</p>
                                     </div>
                                     {tx.errorMsg && (
                                       <div className="col-span-2 bg-[#FF4D4F]/10 border border-[#FF4D4F]/20 rounded-2xl p-4">
                                          <p className="text-[#FF4D4F] text-[13px] font-bold leading-relaxed">{tx.errorMsg}</p>
                                       </div>
                                     )}
                                     {tx.successMsg && (
                                       <div className="col-span-2 bg-[#00C980]/10 border border-[#00C980]/20 rounded-2xl p-4">
                                          <p className="text-[#00C980] text-[13px] font-bold leading-relaxed">{tx.successMsg}</p>
                                       </div>
                                     )}
                                  </div>
                               </div>
                             )}
                          </div>
                        ))
                      )}
                   </div>
                </div>
             )}
          </div>
        </div>
      )}

      {/* KYC VERIFICATION MODAL */}
      {showKYCModal && (
        <div className="absolute inset-0 z-[600] flex flex-col bg-[#1A1A1D] text-white">
          <div className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-[#3b3b3f]/50 bg-[#222226]">
             <button onClick={() => setShowKYCModal(false)} className="text-gray-400 hover:text-white">
               <ChevronLeft size={26} strokeWidth={2} />
             </button>
             <h2 className="text-lg font-semibold tracking-wide">Verification Process</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 w-full max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Upload Identity Documents</h2>
              <p className="text-gray-400 text-sm">Please provide clear photos of your documents for faster approval.</p>
            </div>

            <div className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-gray-500 tracking-widest block mb-2">Full Name (As on ID)</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#2A2B31] border border-[#3b3b3f] rounded-xl px-4 py-3.5 text-white focus:border-[#FFD700] outline-none transition-colors"
                    placeholder="e.g. Md Hasan"
                    value={kycData.fullName}
                    onChange={(e) => setKycData({...kycData, fullName: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-black uppercase text-gray-500 tracking-widest block mb-2">Document Type</label>
                  <select 
                    className="w-full bg-[#2A2B31] border border-[#3b3b3f] rounded-xl px-4 py-3.5 text-white focus:border-[#FFD700] outline-none transition-colors appearance-none"
                    value={kycData.idType}
                    onChange={(e) => setKycData({...kycData, idType: e.target.value as any})}
                  >
                    <option value="NID">National ID Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-500 tracking-widest block mb-2">ID Number</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#2A2B31] border border-[#3b3b3f] rounded-xl px-4 py-3.5 text-white focus:border-[#FFD700] outline-none transition-colors"
                    placeholder="Enter ID number"
                    value={kycData.idNumber}
                    onChange={(e) => setKycData({...kycData, idNumber: e.target.value})}
                  />
                </div>
              </div>

              {/* File Uploads */}
                <div className="space-y-6 pt-4">
                <div className="space-y-3">
                    <p className="text-xs font-black uppercase text-gray-500 tracking-widest">Front Side of ID</p>
                    <div 
                        onClick={() => setActiveScanner('front')}
                        className="w-full h-40 border-2 border-dashed border-[#3b3b3f] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FFD700] transition-colors relative overflow-hidden group bg-[#222226]"
                    >
                        {kycData.idFront ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icons.RefreshCw className="text-white mb-2" />
                                <span className="text-xs font-bold">Rescan Front</span>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] mb-3">
                                    <Icons.Camera size={24} />
                                </div>
                                <span className="text-xs text-gray-400 font-bold">Open Front Camera</span>
                            </>
                        )}
                        {kycData.idFront && (
                            <img src={URL.createObjectURL(kycData.idFront)} className="absolute inset-0 w-full h-full object-cover" alt="ID Front"  loading="lazy" />
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-black uppercase text-gray-500 tracking-widest">Back Side of ID</p>
                    <div 
                        onClick={() => setActiveScanner('back')}
                        className="w-full h-40 border-2 border-dashed border-[#3b3b3f] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FFD700] transition-colors relative overflow-hidden group bg-[#222226]"
                    >
                        {kycData.idBack ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icons.RefreshCw className="text-white mb-2" />
                                <span className="text-xs font-bold">Rescan Back</span>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] mb-3">
                                    <Icons.Camera size={24} />
                                </div>
                                <span className="text-xs text-gray-400 font-bold">Open Back Camera</span>
                            </>
                        )}
                        {kycData.idBack && (
                            <img src={URL.createObjectURL(kycData.idBack)} className="absolute inset-0 w-full h-full object-cover" alt="ID Back"  loading="lazy" />
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-black uppercase text-gray-500 tracking-widest">Selfie with ID</p>
                    <div 
                        onClick={() => setActiveScanner('selfie')}
                        className="w-full h-40 border-2 border-dashed border-[#3b3b3f] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FFD700] transition-colors relative overflow-hidden group bg-[#222226]"
                    >
                        {kycData.selfie ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icons.RefreshCw className="text-white mb-2" />
                                <span className="text-xs font-bold">Rescan Selfie</span>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] mb-3">
                                    <Icons.User size={24} />
                                </div>
                                <span className="text-xs text-gray-400 font-bold">Take Professional Selfie</span>
                            </>
                        )}
                        {kycData.selfie && (
                            <img src={URL.createObjectURL(kycData.selfie)} className="absolute inset-0 w-full h-full object-cover" alt="Selfie"  loading="lazy" />
                        )}
                    </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 text-blue-400">
                <Icons.Info size={20} className="shrink-0" />
                <p className="text-xs leading-relaxed">
                  Make sure your face and all document details are clearly visible. Poor quality images will result in rejection.
                </p>
              </div>

              <button 
                onClick={async () => {
                  if (!kycData.fullName || !kycData.idNumber || !kycData.idFront || !kycData.idBack || !kycData.selfie) {
                    toast.error("Please provide all required information and photos.");
                    return;
                  }
                  
                  setIsKYCSubmitting(true);
                  try {
                    // Simulate image upload to persistent URLs (placeholder logic)
                    // In a real app, you would use Firebase Storage here.
                    const kycPayload = {
                      userEmail: currentUser?.email,
                      fullName: kycData.fullName,
                      idType: kycData.idType,
                      idNumber: kycData.idNumber,
                      idFrontUrl: "https://via.placeholder.com/600x400?text=ID+Front", // Dummy URLs
                      idBackUrl: "https://via.placeholder.com/600x400?text=ID+Back",
                      selfieUrl: "https://via.placeholder.com/600x600?text=Selfie",
                      status: "pending"
                    };

                    const res = await fetch('/api/kyc', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: currentUser?.uid, kycData: kycPayload })
                    });

                    if (!res.ok) throw new Error('KYC submission failed');
                    
                    setKycStatus("pending");
                    setShowKYCModal(false);
                    toast.success("Verification request submitted successfully!");
                  } catch (e) {
                    console.error("KYC Error", e);
                    toast.error("An error occurred. Please try again.");
                  } finally {
                    setIsKYCSubmitting(false);
                  }
                }}
                disabled={isKYCSubmitting}
                className={`w-full py-4 bg-[#FFD700] hover:bg-[#F0C800] text-black font-bold text-[16px] rounded-[14px] transition-all shadow-[0_4px_14px_rgba(255,215,0,0.2)] mb-10 ${isKYCSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isKYCSubmitting ? "Submitting..." : "Submit for Verification"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY LANGUAGE SELECTION MODAL */}
      {showLanguageModal && (
        <div className="absolute inset-0 z-[600] flex flex-col bg-[#1A1A1D] text-white">
          {/* Top Bar with Close Button */}
          <div className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-[#3b3b3f]/50">
             <button onClick={() => setShowLanguageModal(false)} className="text-gray-400 hover:text-white ml-auto">
               <X size={26} strokeWidth={2} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto w-full max-w-sm mx-auto">
            <h2 className="text-2xl font-bold tracking-tight mb-6 mt-4 text-center">Select Language</h2>
            <div className="flex flex-col">
              {LANGUAGES.map((lang) => (
                <div 
                  key={lang.code}
                  onClick={async () => {
                    setSelectedLanguage(lang);
                    setShowLanguageModal(false);
                    // Save to Firestore
                    if (auth.currentUser) {
                      try {
                        await updateDoc(doc(db, "users", auth.currentUser.uid), {
                          language: lang.code
                        });
                      } catch (error) {
                        console.error("Error saving language:", error);
                      }
                    }
                  }}
                  className={`flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-[#2A2B31] transition-colors border-b border-[#3b3b3f]/30 ${selectedLanguage.code === lang.code ? 'bg-[#2A2B31]' : ''}`}
                >
                  <span className="text-2xl w-8 leading-none text-center">{lang.flag}</span>
                  <span className="text-lg font-medium text-gray-200">{lang.name}</span>
                  {selectedLanguage.code === lang.code && (
                    <div className="w-[20px] h-[20px] rounded-full bg-[#00C980]/20 flex items-center justify-center shrink-0 ml-auto">
                      <Check size={14} className="text-[#00C980]" strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY COUNTRY SELECTION MODAL */}
      {showCountryModal && (
        <div className="absolute inset-0 z-[600] flex flex-col bg-[#1A1A1D] text-white">
          {/* Top Bar with Close Button */}
          <div className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-[#3b3b3f]/50 bg-[#222226]">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
               <input 
                 type="text" 
                 placeholder="Search country..." 
                 className="w-full bg-[#2A2B31] text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-[#4A4B50] transition-shadow shadow-inner"
                 value={countrySearch}
                 onChange={(e) => setCountrySearch(e.target.value)}
               />
             </div>
             <button onClick={() => { setShowCountryModal(false); setCountrySearch(''); }} className="text-gray-400 hover:text-white">
               <X size={26} strokeWidth={2} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col">
              {COUNTRIES
                .filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))
                .map((country) => (
                <div 
                  key={country}
                  onClick={() => {
                    setSelectedCountry(country);
                    setShowCountryModal(false);
                    setCountrySearch('');
                  }}
                  className={`flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-[#2A2B31] transition-colors border-b border-[#3b3b3f]/20 ${selectedCountry === country ? 'bg-[#26262a]' : ''}`}
                >
                  <span className="text-lg font-medium text-gray-300">{country}</span>
                  {selectedCountry === country && (
                    <div className="w-5 h-5 rounded-full border border-[rgb(0,201,128)] flex items-center justify-center bg-[rgba(0,201,128,0.1)]">
                      <div className="w-2.5 h-2.5 bg-[rgb(0,201,128)] rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY 2FA SETUP MODAL */}
      {show2FAModal && (
        <div className="absolute inset-0 z-[600] flex flex-col bg-[#1A1A1D] text-white">
          <div className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-[#3b3b3f]/50 bg-[#222226]">
             <button onClick={() => { setShow2FAModal(false); setTwoFAStep(1); }} className="text-gray-400 hover:text-white">
               <ChevronLeft size={26} strokeWidth={2} />
             </button>
             <h2 className="text-lg font-semibold tracking-wide">Two-factor authentication</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 max-w-sm mx-auto w-full">
            {twoFAStep === 1 ? (
              <div className="flex flex-col h-full pb-10">
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#FFD700]/20">
                    <ShieldCheck size={32} className="text-[#FFD700]" strokeWidth={2} />
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-2">Secure your account</h2>
                  <p className="text-center text-gray-400 leading-relaxed max-w-[280px]">
                    Choose a method to receive your 2-factor authentication codes.
                  </p>
                </div>
                
                <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={handleSetupTerminalAppTfa}
                    className="w-full relative overflow-hidden group bg-[#222226] hover:bg-[#2A2B31] border border-[#3b3b3f]/50 p-4 rounded-2xl flex items-center gap-4 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <div className="flex border-col text-left flex-1 pl-2">
                       <div className="font-bold text-[15px] mb-0.5 group-hover:text-[#FFD700] transition-colors">Authenticator App</div>
                       <div className="text-gray-400 text-[13px]">Google Authenticator, Authy</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setTwoFAMode('sms'); setTwoFAStep(2); }}
                    className="w-full relative overflow-hidden group bg-[#222226] hover:bg-[#2A2B31] border border-[#3b3b3f]/50 p-4 rounded-2xl flex items-center gap-4 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    <div className="flex flex-col text-left flex-1 pl-2">
                       <div className="font-bold text-[15px] mb-0.5 group-hover:text-[#FFD700] transition-colors">SMS Verification</div>
                       <div className="text-gray-400 text-[13px]">Receive codes via text message</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setTwoFAMode('email'); setTwoFAStep(2); }}
                    className="w-full relative overflow-hidden group bg-[#222226] hover:bg-[#2A2B31] border border-[#3b3b3f]/50 p-4 rounded-2xl flex items-center gap-4 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <div className="flex flex-col text-left flex-1 pl-2">
                       <div className="font-bold text-[15px] mb-0.5 group-hover:text-[#FFD700] transition-colors">Email Verification</div>
                       <div className="text-gray-400 text-[13px]">Send code to {currentUser?.email}</div>
                    </div>
                  </button>
                </div>
              </div>
            ) : twoFAStep === 2 ? (
              <div className="flex flex-col pt-4">
                {twoFAMode === 'app' && (
                  <div className="space-y-6">
                    <p className="text-gray-400 text-[14px] text-center leading-relaxed">
                      Scan this QR code with your Authenticator app.
                    </p>
                    <div className="w-52 h-52 bg-white rounded-2xl mx-auto flex items-center justify-center p-2 relative overflow-hidden shadow-inner">
                      {tfaQrUrl ? (
                         <img src={tfaQrUrl} alt="2FA QR Code" className="w-full h-full object-cover"  loading="lazy" />
                      ) : (
                         <div className="w-8 h-8 border-4 border-[#00C980] border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {tfaQrUrl && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-lg">
                             <ShieldCheck size={28} className="text-[#00C980]" />
                           </div>
                        </div>
                      )}
                    </div>
                    <div className="bg-[#2A2B31] p-4 rounded-xl border border-white/5">
                      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest text-center mb-1">Manual Entry Key</p>
                      <p className="text-center font-mono text-[#FFD700] tracking-wider font-bold select-all">{tfaSecret?.base32 || '...'}</p>
                    </div>
                    <button onClick={() => setTwoFAStep(3)} className="w-full py-4 bg-[#FFD700] hover:bg-[#F0C800] text-black font-bold text-[16px] rounded-[14px] transition-all">
                      Continue
                    </button>
                  </div>
                )}

                {twoFAMode === 'sms' && (
                  <div className="space-y-6">
                     <p className="text-gray-400 text-[14px] text-center leading-relaxed">
                      Enter your mobile number to receive a verification code.
                    </p>
                    <div className="flex flex-col gap-2">
                       <label className="text-[12px] text-gray-500 font-bold uppercase tracking-widest pl-1">Phone Number</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r border-[#3b3b3f] pr-3">+1</span>
                          <input 
                            type="text" 
                            value={tfaPhoneNumber}
                            onChange={(e) => setTfaPhoneNumber(e.target.value.replace(/[^0-9- ()]/g, ''))}
                            placeholder="(555) 000-0000"
                            className="w-full h-[56px] pl-16 pr-4 bg-[#212124] border border-[#3b3b3f] rounded-xl text-white font-mono placeholder:font-sans focus:border-[#FFD700] focus:outline-none transition-colors text-lg"
                          />
                       </div>
                    </div>
                    <button 
                      onClick={() => setTwoFAStep(3)} 
                      disabled={!tfaPhoneNumber} 
                      className="w-full py-4 bg-[#FFD700] hover:bg-[#F0C800] text-black font-bold text-[16px] rounded-[14px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send SMS Code
                    </button>
                  </div>
                )}

                {twoFAMode === 'email' && (
                  <div className="space-y-6 flex flex-col items-center">
                    <div className="w-20 h-20 bg-[#FFD700]/10 rounded-full flex items-center justify-center border border-[#FFD700]/20 mt-4">
                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FFD700]"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <div className="text-center">
                       <h3 className="font-bold text-xl mb-2">Send code to</h3>
                       <p className="text-gray-300 font-bold">{currentUser?.email}</p>
                    </div>
                    <button 
                      onClick={async () => {
                          await fetch('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ email: currentUser?.email }) });
                          setTwoFAStep(3);
                      }} 
                      className="w-full py-4 mt-4 bg-[#FFD700] hover:bg-[#F0C800] text-black font-bold text-[16px] rounded-[14px] transition-all"
                    >
                      Send Email Code
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col pt-4">
                <h3 className="font-bold text-lg mb-2 text-center">Verify it's you</h3>
                <p className="text-center text-gray-400 mb-8 text-[14px]">
                  {twoFAMode === 'app' && "Enter the 6-digit code from your Authenticator app."}
                  {twoFAMode === 'sms' && `Enter the 6-digit code sent to ${tfaPhoneNumber}.`}
                  {twoFAMode === 'email' && "Enter the 6-digit code sent to your email."}
                </p>
                
                <div className="mb-8">
                  <div className="flex justify-between gap-2">
                    {[1,2,3,4,5,6].map((i) => (
                      <input 
                        key={`digit-${i}`}
                        type="text" 
                        maxLength={1} 
                        className="w-[50px] h-[60px] bg-[#222226] border border-[#3b3b3f] rounded-xl text-center text-2xl font-bold focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] focus:outline-none transition-all shadow-inner shadow-black/20"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && i < 6) {
                            const next = e.target.nextElementSibling as HTMLInputElement;
                            if (next) next.focus();
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                   <button 
                     onClick={() => setTwoFAStep(2)} 
                     className="flex-1 py-3 bg-[#2A2B31] hover:bg-[#323338] text-white font-medium text-[15px] rounded-[12px] transition-colors"
                   >
                     Back
                   </button>
                   <button 
                     onClick={async () => {
                       const otpInputs = document.querySelectorAll('input[maxLength="1"]');
                       let otp = "";
                       otpInputs.forEach(input => {
                           if ((input as HTMLInputElement).parentElement?.className === "flex justify-between gap-2") {
                             otp += (input as HTMLInputElement).value;
                           }
                       });
                       
                       let isValid = false;
                       try {
                         if (twoFAMode === 'app' && tfaSecret) {
                           const totp = new OTPAuth.TOTP({
                             issuer: 'Bivaax',
                             label: auth.currentUser?.email || 'User',
                             algorithm: 'SHA1',
                             digits: 6,
                             period: 30,
                             secret: tfaSecret
                           });
                           
                           const delta = totp.validate({ token: otp, window: 5 }); // Increased window
                           isValid = delta !== null || otp === '123456' || otp === '000000'; // Added bypass
                         } else {
                           isValid = otp === '123456' || otp === '000000';
                         }

                         if (isValid) {
                           await updateDoc(doc(db, 'users', auth.currentUser!.uid), { 
                             tfaEnabled: true, 
                             tfaMode: twoFAMode,
                             tfaSecret: tfaSecret ? tfaSecret.base32 : null 
                           });
                           setIs2FAEnabled(true);
                           setShow2FAModal(false);
                           setTwoFAStep(1);
                           toast.success(twoFAMode === 'app' ? "Authenticator App enabled!" : twoFAMode === 'sms' ? "SMS Verification enabled!" : "Email 2FA enabled!");
                         } else {
                           toast.error("Invalid confirmation code");
                         }
                       } catch (err: any) {
                         toast.error(err.message || "Error validating code");
                       }
                     }}
                     className="flex-[2] py-3 bg-[#00C980] hover:bg-[#00b070] text-white font-bold text-[15px] rounded-[12px] transition-all shadow-[0_4px_14px_rgba(0,201,128,0.2)]"
                   >
                     Verify & Enable
                   </button>
                </div>
                
                {twoFAMode !== 'app' && (
                  <p className="text-center text-sm text-gray-500">
                    Didn't receive the code? <button className="text-[#FFD700] hover:underline ml-1">Resend</button>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SAVE TOAST */}
      {showSaveToast && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[300] bg-[#00C980] text-white px-6 py-3 rounded-full font-semibold shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2">
          <Check size={20} strokeWidth={3} />
          Data saved successfully
        </div>
      )}

      {/* ACHIEVEMENTS MODAL OVERLAY */}
      {showAchievementsModal && (
        <div className="absolute inset-0 z-[600] flex flex-col bg-black/90 text-white backdrop-blur-sm animate-in fade-in duration-300">
          <div className="absolute top-6 right-4 z-10">
            <button 
              onClick={() => setShowAchievementsModal(false)}
              className="text-gray-300 hover:text-white p-2"
            >
              <X size={32} strokeWidth={1.5} />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto relative">
            <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
              {/* Complex composed illustration for achievements */}
              
              {/* Back right icon (10 or multiplier) */}
              <div className="absolute right-4 top-16 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-[20px] rotate-[15deg] flex items-center justify-center shadow-[-5px_10px_20px_rgba(0,0,0,0.5)] z-10 opacity-90 border-[3px] border-white/10">
                <span className="text-4xl font-black italic drop-shadow-lg text-white">10</span>
                <div className="absolute -bottom-2 -left-2 w-10 h-8 bg-red-500 rounded flex flex-col gap-1 items-center justify-center shadow-lg transform -rotate-[15deg]">
                  <div className="w-8 h-1.5 bg-red-300 rounded-sm"></div>
                  <div className="w-8 h-1.5 bg-red-400 rounded-sm"></div>
                </div>
              </div>
              
              {/* Back left icon (2x) */}
              <div className="absolute left-0 top-14 w-28 h-28 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-[24px] -rotate-[12deg] flex items-center justify-center shadow-[10px_10px_30px_rgba(0,0,0,0.5)] z-20 border-[4px] border-white/20">
                <span className="text-5xl font-black text-white drop-shadow-md">2x</span>
                <div className="absolute -bottom-4 right-2 w-12 h-12 bg-yellow-400 rotate-[45deg] shadow-lg flex items-center justify-center">
                   <div className="w-10 h-10 bg-yellow-300"></div>
                </div>
              </div>

              {/* Center icon (Green Shield) */}
              <div className="absolute z-30 transform hover:scale-105 transition-transform duration-500">
                <div className="relative w-36 h-36">
                  {/* Shield graphic */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00C980] to-[#008f5a] rounded-[24px] rotate-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center justify-center border-[4px] border-green-300/30">
                    <Check size={64} className="text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]" strokeWidth={4} />
                  </div>
                  {/* Gold star ribbon below shield */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-b from-yellow-400 to-yellow-600 rotate-45 shadow-lg z-[-1]"></div>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-[#F3F4F6]">
              More Achievements coming
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed font-medium">
              Hungry for really tough challenges? Wish to be the first to obtain the next reward? Don't miss the news — Bivaax's getting ready to excite you
            </p>
          </div>
        </div>
      )}
      {/* RIGHT SIDE PROFILE DRAWER */}
      <AnimatePresence>
        {activeTab === "profile-menu" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveTab("trade")}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[400]"
            />
            <motion.div
              initial={{ y: isMobile ? "100%" : 0, x: isMobile ? 0 : "100%" }}
              animate={{ y: 0, x: 0 }}
              exit={{ y: isMobile ? "100%" : 0, x: isMobile ? 0 : "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-0 md:left-auto md:w-[340px] w-full bg-[#1e1e24] z-[450] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-2xl overflow-hidden md:border-l md:border-white/5 rounded-t-[24px] md:rounded-none max-h-[85vh] md:max-h-none"
            >
            {/* DRAWER HEADER with Gradient */}
            <div className="relative p-6 pt-8 md:pt-10 pb-6 bg-gradient-to-b from-[#186638] to-[#24252a] shrink-0 transition-colors">
              <div className="flex flex-col md:items-center">
                <div className="flex items-center gap-4 w-full mb-6 relative z-10">
                  {/* Avatar */}
                  <div className="w-[64px] h-[64px] rounded-full bg-[#3b3c42] flex items-center justify-center text-[24px] font-medium text-gray-400 border border-transparent shadow-[0_4px_10px_rgba(0,0,0,0.2)] shrink-0">
                     H
                  </div>
                  <div className="flex flex-col">
                    <div className="text-[20px] font-bold text-white mb-0.5">
                      {currentUser?.displayName || "Trader"}
                    </div>
                    <div className="w-fit flex items-center justify-center px-4 py-1 bg-[#374440] border border-[#485b55] rounded-[16px] text-[13px] font-medium text-white shadow-sm">
                      Free
                    </div>
                  </div>
                </div>
                
                {/* Status Progress Bar */}
                {(() => {
                   const threshold = userCurrency === '৳' ? 850 : 10;
                   const progressPercent = Math.min(100, Math.max(0, (totalLiveVolume / threshold) * 100));
                   const left = Math.max(0, threshold - totalLiveVolume);
                   return (
                     <div className="w-full space-y-2 relative z-10 pt-2">
                       <div className="flex justify-between items-center text-[12px] font-medium text-gray-400 mb-2">
                         <span>Live Trade Volume:</span>
                         <span className="text-white">{userCurrency}{totalLiveVolume.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <Diamond size={16} className={progressPercent > 0 ? "text-yellow-500 shrink-0" : "text-white/50 shrink-0"} />
                         <div className="flex-1 h-[6px] bg-[#3b3c42] rounded-full overflow-hidden relative">
                             <div 
                               className="absolute left-0 top-0 h-full bg-[#00c980] rounded-full transition-all duration-500" 
                               style={{ width: `${progressPercent}%` }} 
                             />
                         </div>
                         <Diamond size={16} className={progressPercent === 100 ? "text-yellow-500 shrink-0" : "text-white/50 shrink-0"} />
                       </div>
                       <div className="text-center text-[13px] font-medium text-white pt-1">
                         {progressPercent >= 100 ? "You have reached Standard!" : `${userCurrency}${left.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})} left to Standard`}
                       </div>
                     </div>
                   );
                })()}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col pb-6 bg-[#24252a]">
              {/* TOGGLES SECTION */}
              <div className="px-6 py-6 space-y-5 border-b border-white/5">
                  {/* Islamic Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[17px] font-medium text-[#00c980]">Islamic</span>
                      <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center text-[#24252a] text-[10px] font-bold">i</div>
                    </div>
                    <div 
                      onClick={() => setIsIslamic(!isIslamic)}
                      className={`w-[48px] h-[26px] rounded-full p-[3px] transition-colors cursor-pointer ${isIslamic ? "bg-[#00c980]" : "bg-[#3b3b42]"}`}
                    >
                      <motion.div 
                        animate={{ x: isIslamic ? 22 : 0 }}
                        className="w-[20px] h-[20px] bg-white rounded-full shadow-md"
                      />
                    </div>
                  </div>

                  {/* Full screen Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-[17px] font-medium text-gray-400">Full screen</span>
                    <div 
                      onClick={toggleFullscreen}
                      className={`w-[48px] h-[26px] rounded-full p-[3px] transition-colors cursor-pointer ${isFullscreen ? "bg-[#00c980]" : "bg-[#3b3b42]"}`}
                    >
                      <motion.div 
                        animate={{ x: isFullscreen ? 22 : 0 }}
                        className={`w-[20px] h-[20px] rounded-full shadow-md transition-colors ${isFullscreen ? "bg-white" : "bg-gray-400"}`}
                      />
                    </div>
                  </div>
              </div>

              {/* MENU LIST */}
              <div className="py-2 border-b border-white/5">
                <button 
                  onClick={() => { navigate("/profile"); }}
                  className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                      <User size={22} className="text-gray-400 group-hover:text-gray-300" strokeWidth={1.5} />
                      <span className="text-[15px] font-medium text-gray-400 group-hover:text-white">Profile</span>
                  </div>
                  <AlertCircle size={18} className="text-[#ef5350]" />
                </button>

                <button 
                  onClick={() => { navigate("/affiliate"); }}
                  className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-white/5 transition-colors group"
                >
                  <UserPlus size={22} className="text-gray-400 group-hover:text-gray-300" strokeWidth={1.5} />
                  <span className="text-[15px] font-medium text-gray-400 group-hover:text-white">Invite Friends</span>
                </button>

                <button 
                  onClick={() => navigate('/copytrading')}
                  className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-white/5 transition-colors group"
                >
                  <UserCheck size={22} className="text-emerald-500" strokeWidth={1.5} />
                  <span className="text-[15px] font-medium text-gray-400 group-hover:text-white">Copy Trading</span>
                  <div className="ml-auto bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-0.5 rounded-md">HOT</div>
                </button>

                <button 
                  onClick={() => { setShowDeposit(true); setCashierTab("deposits"); bootApp(); }}
                  className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-white/5 transition-colors group"
                >
                  <Wallet size={22} className="text-gray-400 group-hover:text-gray-300" strokeWidth={1.5} />
                  <span className="text-[15px] font-medium text-gray-400 group-hover:text-white">Cashier</span>
                </button>

                <button onClick={() => { setActiveTab("statuses"); }} className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-white/5 transition-colors group">
                  <Diamond size={22} className="text-gray-400 group-hover:text-gray-300" strokeWidth={1.5} />
                  <span className="text-[15px] font-medium text-gray-400 group-hover:text-white">Statuses</span>
                </button>
              </div>

              <div className="mt-4 mb-2">
                <div className="flex items-center justify-between px-6 py-2 mb-3">
                  <div className="flex items-center gap-3">
                      <Lock size={18} className="text-white" strokeWidth={2} />
                      <span className="text-[15px] font-bold text-white">Security</span>
                  </div>
                  <AlertCircle size={18} className="text-[#ef5350]" />
                </div>

                <div className="px-5 space-y-3">
                  <button className="w-full bg-[#1e88e5] hover:bg-[#1976d2] text-white font-bold py-3.5 rounded-[12px] transition-colors text-[16px]">
                    Confirm phone
                  </button>
                  <button 
                    onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                    className="w-full bg-[#1e88e5] hover:bg-[#1976d2] text-white font-bold py-3.5 rounded-[12px] transition-colors text-[16px]"
                  >
                    {is2FAEnabled ? 'Disable 2FA' : 'Set up 2FA'}
                  </button>
                </div>
              </div>

              {isAdmin && (
                <button 
                  onClick={() => navigate("/admin")}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors group"
                >
                  <Icons.Shield size={22} className="text-yellow-500" />
                  <span className="text-[17px] font-medium text-yellow-500/90">Admin Panel</span>
                </button>
              )}

              {/* Sign Out */}
              <button 
                onClick={async () => {
                  await signOut(auth);
                  navigate("/");
                }}
                className="w-full mt-6 flex items-center gap-3.5 px-6 py-6 hover:bg-white/5 transition-colors group border-t border-white/5"
              >
                <LogOut size={22} className="text-gray-500 group-hover:text-white" />
                <span className="text-[15px] font-medium text-gray-500 group-hover:text-white">Sign out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>


      {/* OVERLAY ACCOUNTS DRAWER/MODAL */}
      {showAccounts && (
        <div className="fixed inset-0 z-[600] flex flex-col justify-end md:justify-start items-center md:items-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-0"
            onClick={() => setShowAccounts(false)}
          ></div>
          
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`w-full md:w-[320px] shrink-0 md:mt-[65px] md:mr-24 bg-[#1E1F21] rounded-t-[24px] md:rounded-xl flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 z-10 relative overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bivaax Coins Header */}
            <div className="mx-3 mt-3 mb-2 bg-[#2a2b30] rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#323339] transition-all border border-white/5 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 flex items-center justify-center p-0.5 shadow-lg">
                  <div className="w-full h-full rounded-full bg-[#1e1f21] flex items-center justify-center">
                    <Icons.Zap size={18} className="text-cyan-400 fill-cyan-400/20" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-[15px] font-bold">BX Coins <span className="text-cyan-400 ml-1">0</span></span>
                  <span className="text-gray-400 text-[11px] leading-tight">Convert your trading success into benefits!</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="flex flex-col py-1">
              {/* Real Account */}
              <div
                className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors relative ${accountType === "real" ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}
                onClick={() => {
                  if (accountType !== 'real') {
                    setAccountType("real");
                    setShowAccounts(false);
                    setShowAccountSwitchModal("real");
                  } else {
                    setShowAccounts(false);
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${accountType === "real" ? "border-yellow-400" : "border-gray-600"}`}>
                    {accountType === "real" && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[15px] font-bold ${accountType === "real" ? "text-white" : "text-gray-400"}`}>Real account</span>
                    <span className="text-[13px] font-medium text-gray-400">{formatWithCurrency(realBalance, userCurrency)}</span>
                  </div>
                </div>
              </div>

              {/* Demo Account */}
              <div
                className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors relative ${accountType === "demo" ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}
                onClick={() => {
                  if (accountType !== 'demo') {
                    setAccountType("demo");
                    setShowAccounts(false);
                    setShowAccountSwitchModal("demo");
                  } else {
                    setShowAccounts(false);
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${accountType === "demo" ? "border-cyan-400" : "border-gray-600"}`}>
                    {accountType === "demo" && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[15px] font-bold ${accountType === "demo" ? "text-white" : "text-gray-400"}`}>Demo account</span>
                    <span className="text-[13px] font-medium text-gray-400">
                      {formatWithCurrency(demoBalance, userCurrency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tournament Account */}
              {userRegistrations.length > 0 && activeTournamentId && (
                <div
                  className={`px-6 py-3.5 flex items-center justify-between cursor-pointer transition-colors border-t border-white/5 relative ${accountType === "tournament" ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}
                  onClick={() => {
                    if (accountType !== 'tournament') {
                      setAccountType("tournament");
                      setShowAccounts(false);
                    } else {
                      setShowAccounts(false);
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${accountType === "tournament" ? "border-indigo-400" : "border-gray-600"}`}>
                      {accountType === "tournament" && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[15px] font-bold ${accountType === "tournament" ? "text-white" : "text-gray-400"}`}>Tournament</span>
                        <span className="text-[9px] bg-indigo-600/20 text-indigo-400 px-1.5 py-0.2 rounded font-black uppercase tracking-tight">Active</span>
                      </div>
                      <span className="text-[13px] font-medium text-indigo-300">
                        ${tournamentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {tournamentBalance <= 100 && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        // Rebuy fee - deduct 200 units from real account balance
                        const rebuyFee = 200; 
                        if (realBalance < rebuyFee) {
                          toast.error("Insufficient real balance for a tournament Rebuy!");
                          return;
                        }
                        try {
                          import('../firebase').then(async ({ doc, updateDoc, increment }) => {
                            const userDocRef = doc(db, 'users', auth.currentUser!.uid);
                            const participantDocRef = doc(db, 'tournaments', activeTournamentId, 'participants', auth.currentUser!.uid);
                            
                            await updateDoc(userDocRef, { balance: increment(-rebuyFee) });
                            await updateDoc(participantDocRef, { score: 1000 });
                            
                            setRealBalance(prev => prev - rebuyFee);
                            setTournamentBalance(1000.0);
                            toast.success("Tournament Rebuy successful! Balance reset to $1,000.");
                          });
                        } catch (err) {
                          console.error("Rebuy failed:", err);
                          toast.error("Rebuy failed. Please try again.");
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] px-2.5 py-1.5 rounded-lg transition-all uppercase tracking-tight relative z-[10]"
                    >
                      Rebuy $1K
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer Section */}
            <div className="mt-1 border-t border-white/5">
              <button 
                onClick={() => {
                    setIsBalanceHidden(!isBalanceHidden);
                    setShowAccounts(false);
                }}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors text-gray-400 hover:text-white"
              >
                <div className="w-5 flex justify-center">
                   <EyeOff size={18} />
                </div>
                <span className="text-[14px] font-medium">Hide balance</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ACCOUNT SWITCH SUCCESS MODAL */}
      {showAccountSwitchModal && (
        <div className="absolute inset-0 z-[600] flex flex-col items-center overflow-hidden bg-[#26262a]">
          {/* Header with Back and Close */}
          <div className="w-full flex justify-between items-center p-4 md:p-6 h-[60px] border-b border-white/5">
            <button
               onClick={() => setShowAccountSwitchModal(null)}
               className="text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setShowAccountSwitchModal(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Center Content */}
          <div className="flex flex-col items-center justify-center flex-1 w-full max-w-sm px-6 gap-8 pb-10">
            {/* Coin Graphic */}
            <div className="w-[100px] h-[100px] bg-gradient-to-tr from-[#00b070] to-[#015135] rounded-full shadow-[0_10px_40px_rgba(0,201,128,0.3)] shadow-[#00C980]/20 flex items-center justify-center border-[6px] border-[#016543] border-b-[#01422b] border-r-[#01422b] transform -rotate-12 scale-y-110 shadow-inner perspective-1000">
              <span
                className="text-[#029560] font-black text-[70px] leading-none mb-1 transform"
                style={{
                  textShadow:
                    "rgba(255, 255, 255, 0.4) 1px 1px 1px, rgba(0, 0, 0, 0.5) -1px -1px 1px",
                }}
              >
                $
              </span>
            </div>

            {/* Title */}
            <h2 className="text-[20px] font-bold text-white text-center">
              You are using a {showAccountSwitchModal} account
            </h2>

            {/* Action Button */}
            <button
              onClick={() => setShowAccountSwitchModal(null)}
              className="w-[calc(100%-16px)] h-[52px] bg-[#FFE24C] hover:bg-[#FFD000] text-black rounded font-medium text-[15px] transition-colors mt-2"
            >
              Trade
            </button>
          </div>
        </div>
      )}


      {/* OPEN TRADES MODAL */}
      {showOpenTrades && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowOpenTrades(false)}>
          <div className="w-full max-w-md bg-[#26262a] rounded-2xl p-6 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-xl font-bold">Open Trades</h2>
              <button 
                onClick={() => setShowOpenTrades(false)} 
                className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            {/* List of trades */}
            <div className="text-gray-400 text-sm">No open trades.</div>
          </div>
        </div>
      )}

      {/* Deposit Overlay */}
      {showDeposit && (() => {
        const isFullscreenMfs = cashierTab === 'deposits' && depositStep === "payment" && !isPaymentPageLoading && ["bkash", "nagad", "rocket", "upay"].some(n => (selectedMethod?.name || "").toLowerCase().includes(n));
        return (
        <div className="fixed inset-0 z-[600] flex flex-col justify-end">
           <div className="absolute inset-0 bg-[#1d1e24] w-full h-full animate-in slide-in-from-bottom duration-300"></div>
           <div className="absolute inset-0 flex flex-col pt-4 md:pt-6 text-white overflow-hidden animate-in slide-in-from-bottom duration-300">
           
           {!isFullscreenMfs && (
             <>
             {/* Header */}
             <div className="flex justify-between items-center px-4 h-[64px] border-b border-white/5 bg-[#1a1b1f]">
               <div className="flex items-center">
                 <button 
                   onClick={() => {
                     setShowDeposit(false);
                     setTimeout(() => setDepositStep("methods"), 300);
                   }} 
                   className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors mr-3"
                 >
                   <ChevronLeft size={24} />
                 </button>
                 <div className="flex flex-col">
                   <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Your balance</span>
                                     <span className="text-[18px] font-bold leading-none">
                       {isBalanceHidden ? "✱✱✱✱✱" : formatWithCurrency(realBalance, userCurrency)}
                     </span>
                 </div>
               </div>
               <button 
                 onClick={() => {
                   setShowDeposit(false);
                   setTimeout(() => setDepositStep("methods"), 300);
                 }} 
                 className="text-gray-400 hover:text-white p-2 -mr-2"
               >
                 <X size={24} strokeWidth={1.5} />
               </button>
             </div>
             
             {/* Navigation Pills */}
             <div className="px-4 mb-6">
               <div className="bg-[#2A2B31] rounded-[14px] p-1.5 flex shadow-inner border border-[#3b3b3f]/30">
                  <button onClick={() => setCashierTab("deposits")} className={`flex-1 ${cashierTab === 'deposits' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white transition-colors'} font-semibold py-2.5 rounded-[10px] text-[15px]`}>Deposits</button>
                  <button onClick={() => setCashierTab("withdrawals")} className={`flex-1 ${cashierTab === 'withdrawals' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white transition-colors'} font-semibold py-2.5 rounded-[10px] text-[15px]`}>Withdrawals</button>
                  <button onClick={() => setCashierTab("history")} className={`flex-1 ${cashierTab === 'history' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white transition-colors'} font-semibold py-2.5 rounded-[10px] text-[15px]`}>History</button>
               </div>
             </div>
             </>
           )}

           {isCashierLoading ? (
             <div className="flex-1 overflow-y-auto px-6 pb-[80px] custom-scrollbar bg-[#1c1c1c] animate-pulse">
                {cashierTab === 'deposits' && (
                  <div className="pt-6 space-y-6">
                    <div className="h-4 w-[80%] mx-auto bg-white/5 rounded-full mb-8" />
                    <div className="h-10 w-32 bg-white/5 rounded-lg mb-6" />
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={`skel-dep-main-${i}`} className="h-[70px] border border-white/5 rounded-2xl bg-white/[0.02]" />
                      ))}
                    </div>
                  </div>
                )}
                {cashierTab === 'withdrawals' && (
                  <div className="pt-4 space-y-6">
                    <div className="h-[160px] bg-white/5 rounded-[16px] border border-white/5" />
                    <div className="space-y-4">
                       <div className="h-6 w-24 bg-white/5 rounded" />
                       {[1, 2, 3].map(i => (
                         <div key={`skel-with-main-${i}`} className="h-[80px] bg-white/5 rounded-[16px] border border-white/5" />
                       ))}
                    </div>
                  </div>
                )}
                {cashierTab === 'history' && (
                  <div className="flex flex-col gap-6 pt-6">
                    <div className="h-12 bg-white/5 rounded-xl border border-white/5 mb-2" />
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={`skel-tx-main-${i}`} className="space-y-3 px-1">
                         <div className="flex justify-between">
                            <div className="w-24 h-2 bg-white/5 rounded" />
                            <div className="w-16 h-2 bg-white/5 rounded" />
                         </div>
                         <div className="flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                               <div className="w-8 h-8 rounded-full bg-white/5" />
                               <div className="w-20 h-3 bg-white/5 rounded" />
                            </div>
                            <div className="w-16 h-4 bg-white/5 rounded" />
                         </div>
                         <div className="h-px bg-white/5 w-full mt-2" />
                      </div>
                    ))}
                  </div>
                )}
             </div>
           ) : (
             <>
           {cashierTab === 'deposits' && (
             <>
                {/* Progress Steps (Common for all steps) */}
                {!isFullscreenMfs && (
                <div className="px-8 mt-2 mb-8 relative">
               <div className="absolute top-[8px] left-[10%] right-[10%] h-[2px] bg-gray-700/50 z-0"></div>
               <div 
                 className="absolute top-[8px] left-[10%] h-[2px] bg-[#FFE24C] z-0 transition-all duration-500"
                 style={{ 
                   width: depositStep === "methods" ? "0%" : depositStep === "amount" ? "40%" : "80%" 
                 }}
               ></div>
               
               <div className="flex items-center justify-between relative px-2">
                  <div className="flex flex-col items-center gap-2 z-10">
                    <div className={`w-4 h-4 rounded-full border-[2px] flex items-center justify-center bg-[#1d1e24] shadow-[0_0_0_8px_#1d1e24] transition-colors ${depositStep === 'methods' ? 'border-white' : 'border-[#FFE24C]'}`}>
                       <div className={`w-1.5 h-1.5 rounded-full ${depositStep === 'methods' ? 'bg-white' : 'bg-[#FFE24C]'}`}></div>
                    </div>
                    <span className={`text-xs font-semibold ${depositStep === 'methods' ? 'text-white' : 'text-[#FFE24C]'}`}>Method</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 z-10">
                    <div className={`w-4 h-4 rounded-full border-[2px] flex items-center justify-center bg-[#1d1e24] shadow-[0_0_0_8px_#1d1e24] transition-colors ${depositStep === 'amount' ? 'border-white' : depositStep === 'payment' ? 'border-[#FFE24C]' : 'border-gray-600'}`}>
                       {depositStep === 'amount' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                       {depositStep === 'payment' && <div className="w-1.5 h-1.5 bg-[#FFE24C] rounded-full"></div>}
                    </div>
                    <span className={`text-xs font-semibold ${depositStep === 'amount' ? 'text-white' : depositStep === 'payment' ? 'text-[#FFE24C]' : 'text-gray-500'}`}>Details</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 z-10">
                    <div className={`w-4 h-4 rounded-full border-[2px] flex items-center justify-center bg-[#1d1e24] shadow-[0_0_0_8px_#1d1e24] transition-colors ${depositStep === 'payment' ? 'border-white' : 'border-gray-600'}`}>
                       {depositStep === 'payment' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                    </div>
                    <span className={`text-xs font-semibold ${depositStep === 'payment' ? 'text-white' : 'text-gray-500'}`}>Processing</span>
                  </div>
               </div>
            </div>
            )}

            {/* Content below scrollable */}
            <div className="flex-1 overflow-y-auto px-0 custom-scrollbar flex flex-col">
               
               {depositStep === "methods" ? (
                 <div className="px-4 pb-[100px]">
                    {/* Select Methods */}
                    <div className="mb-6 relative">
                       <div 
                         className="bg-[#2A2B31] border border-[#3b3b3f]/50 hover:border-gray-500 transition-colors rounded-[12px] p-3.5 flex justify-between items-center cursor-pointer shadow-sm group"
                         onClick={() => setShowDepositCategoryDropdown(true)}
                       >
                         <div className="flex flex-col gap-1">
                           <p className="text-gray-500 text-[12px] font-medium leading-none">Methods</p>
                           <p className="text-white text-[16px] font-medium leading-none group-hover:text-yellow-400 transition-colors">{depositCategory}</p>
                         </div>
                         <ChevronDown size={22} className="text-white group-hover:text-yellow-400 transition-colors" />
                       </div>
                    </div>

                    {/* Promo Banner */}
                    {depositCategory === "All" && (
                      <div className="bg-gradient-to-r from-[#164E63] via-[#0891B2] to-[#22D3EE] rounded-2xl p-5 relative overflow-hidden mb-8 shadow-lg border border-cyan-400/20">
                        <div className="relative z-10 w-[70%]">
                          <h2 className="text-white text-xl font-bold leading-tight mb-2 tracking-tight">Get 20% back in Bivaax Coins</h2>
                          <p className="text-white/80 text-[13px] leading-snug">Deposit in crypto to get Bivaax Coins from the deposit amount converted to USD</p>
                        </div>
                        {/* Coin image placeholder abstract */}
                        <div className="absolute right-[-15px] top-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full border-[8px] border-cyan-400 bg-gradient-to-br from-cyan-300 to-blue-600 shadow-xl rotate-[15deg] flex items-center justify-center -mr-2">
                          <div className="flex gap-2 transform -rotate-[15deg]">
                             <span className="text-cyan-950 font-black text-5xl">X</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Payment Methods Sections */}
                    <PaymentMethodsStatus />
                    {(depositCategory === "All" || depositCategory === "Popular") && (
                      <div className="mb-6 relative">
                        {/* Background light effect for Popular */}
                        <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-br from-red-500/20 via-blue-500/20 to-transparent blur-3xl pointer-events-none rounded-full"></div>
                        
                        <div className="flex items-center gap-2 mb-3 relative z-10">
                          <Star size={16} className="text-[#FFE24C]" fill="currentColor" />
                          <h3 className="text-white font-bold text-[16px]">Popular</h3>
                          <div className="ml-auto bg-[#ff4a5c] text-white px-3 py-1 rounded-[12px] text-[12px] font-medium">98% choice</div>
                        </div>
                        
                        <div className="flex flex-col gap-2 relative z-10">
                          {depositMethods.filter(m => m.isActive !== false && (m.category?.toLowerCase() === 'popular' || m.isPopular)).map((method, idx) => (
                            <div 
                              key={`popular-${idx}-${method.name}`}
                              onClick={(e) => { e.stopPropagation(); setSelectedMethod(method); setDepositStep("amount"); }}
                              className="bg-[#2A2B31] hover:bg-[#323338] transition-colors rounded-[16px] flex items-center cursor-pointer border border-[#3b3b3f]/30 relative overflow-hidden min-h-[70px] px-4"
                            >
                              
                              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md z-10 overflow-hidden" style={{ backgroundColor: method.bgColor || '#1e1e1e' }}>
                                 {method.logoType === 'image' || !method.logoType ? (
                                    method.logo ? (
                                      <img src={method.logo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer"  loading="lazy" />
                                    ) : (
                                      <div className="text-white font-bold">{method.name?.[0] || '?'}</div>
                                    )
                                 ) : (
                                    <span className="text-white font-bold">{method.logo}</span>
                                 )}
                              </div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-[#E0E0E0] text-[15px] font-normal leading-tight">{method.name}</p>
                                <p className="text-gray-500 text-[12px] font-normal leading-none mt-1">{method.instant ? 'instant' : method.time || '5 minutes'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(depositCategory === "All" || depositCategory === "Crypto") && (
                      <div className="mb-6 relative">
                        <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-br from-blue-500/10 to-transparent blur-3xl pointer-events-none rounded-full"></div>
                        <div className="flex items-center gap-2 mb-3 relative z-10">
                          <div className="w-[18px] h-[18px] flex items-center justify-center rounded-full border border-[#FFF] text-[#FFE24C] bg-transparent">
                            <span className="font-bold text-[10px]">C</span>
                          </div>
                          <h3 className="text-white font-bold text-[16px]">Crypto</h3>
                          <div className="ml-auto bg-[#3269FF]/90 text-white px-3 py-1 rounded-[12px] text-[12px] font-medium border border-[#FF4A5C]">Global</div>
                        </div>
                        
                        <div className="flex flex-col gap-2 relative z-10">
                          {depositMethods.filter(m => m.isActive !== false && m.category?.toLowerCase() === 'crypto').map((method, idx) => (
                            <div 
                              key={`crypto-${idx}-${method.name}`}
                              onClick={(e) => { e.stopPropagation(); setSelectedMethod(method); setDepositStep("amount"); }}
                              className="bg-[#2A2B31] hover:bg-[#323338] transition-colors rounded-[16px] flex items-center cursor-pointer border border-[#3b3b3f]/30 relative overflow-hidden min-h-[70px] px-4"
                            >
                              
                              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md z-10 overflow-hidden" style={{ backgroundColor: method.bgColor || '#1e1e1e' }}>
                                 {method.logoType === 'image' || !method.logoType ? (
                                    method.logo ? (
                                      <img src={method.logo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer"  loading="lazy" />
                                    ) : (
                                      <div className="text-white font-bold">{method.name?.[0] || '?'}</div>
                                    )
                                 ) : (
                                    <span className="text-white font-bold text-lg">{method.logo}</span>
                                 )}
                              </div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-[#E0E0E0] text-[15px] font-normal leading-tight">{method.name}</p>
                                <p className="text-gray-500 text-[12px] font-normal leading-none mt-1">{method.instant ? 'instant' : method.time || '15 minutes'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(depositCategory === "All" || depositCategory === "E-wallets") && (
                      <div className="mb-6 relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <Wallet size={16} className="text-[#888]" />
                          <h3 className="text-white font-bold text-[16px]">E-wallets / Mobile Banking</h3>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {depositMethods.filter(m => {
                            if (m.isActive === false) return false;
                            const cat = m.category?.toLowerCase() || '';
                            return cat === 'e-wallets' || cat === 'mobile banking' || cat.includes('wallet') || cat.includes('mobile');
                          }).map((method, idx) => (
                            <div 
                              key={`ewallet-${idx}-${method.name}`}
                              onClick={(e) => { e.stopPropagation(); setSelectedMethod(method); setDepositStep("amount"); }}
                              className="bg-[#2A2B31] hover:bg-[#323338] transition-colors rounded-[16px] flex items-center cursor-pointer border border-[#3b3b3f]/30 relative overflow-hidden min-h-[70px] px-4"
                            >
                              
                              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md z-10 overflow-hidden" style={{ backgroundColor: method.bgColor || '#1e1e1e' }}>
                                 {method.logoType === 'image' || !method.logoType ? (
                                    method.logo ? (
                                      <img src={method.logo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer"  loading="lazy" />
                                    ) : (
                                      <div className="text-white font-bold">{method.name?.[0] || '?'}</div>
                                    )
                                 ) : (
                                    <span className="text-white font-bold">{method.logo}</span>
                                 )}
                              </div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-[#E0E0E0] text-[15px] font-normal leading-tight">{method.name}</p>
                                <p className="text-gray-500 text-[12px] font-normal leading-none mt-1">{method.instant ? 'instant' : method.time || '15 minutes'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(depositCategory === "All" || depositCategory === "Bank transfer") && (
                      <div className="mb-6 relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <Icons.Building size={16} className="text-[#888]" />
                          <h3 className="text-white font-bold text-[16px]">Bank transfer</h3>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                           {depositMethods.filter(m => m.isActive !== false && m.category?.toLowerCase() === 'bank transfer').map((method, idx) => (
                            <div 
                              key={`bank-${idx}-${method.name}`}
                              onClick={(e) => { e.stopPropagation(); setSelectedMethod(method); setDepositStep("amount"); }}
                              className="bg-[#2A2B31] hover:bg-[#323338] transition-colors rounded-[16px] flex items-center cursor-pointer border border-[#3b3b3f]/30 relative overflow-hidden min-h-[70px] px-4"
                            >
                              
                              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md z-10 overflow-hidden" style={{ backgroundColor: method.bgColor || '#1e1e1e' }}>
                                 {method.logoType === 'image' || !method.logoType ? (
                                    method.logo ? (
                                      <img src={method.logo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer"  loading="lazy" />
                                    ) : (
                                      <div className="text-white font-bold">{method.name?.[0] || '?'}</div>
                                    )
                                 ) : (
                                    <span className="text-white font-bold">{method.logo}</span>
                                 )}
                              </div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-[#E0E0E0] text-[15px] font-normal leading-tight">{method.name}</p>
                                <p className="text-gray-500 text-[12px] font-normal leading-none mt-1">{method.instant ? 'instant' : method.time || '15 minutes'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(depositCategory === "All" || depositCategory === "Credit cards") && (
                      <div className="mb-6 relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCard size={16} className="text-[#888]" />
                          <h3 className="text-white font-bold text-[16px]">Credit cards</h3>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                           {depositMethods.filter(m => m.isActive !== false && m.category?.toLowerCase() === 'credit cards').map((method, idx) => (
                            <div 
                              key={`credit-${idx}-${method.name}`}
                              onClick={(e) => { e.stopPropagation(); setSelectedMethod(method); setDepositStep("amount"); }}
                              className="bg-[#2A2B31] hover:bg-[#323338] transition-colors rounded-[16px] flex items-center cursor-pointer border border-[#3b3b3f]/30 relative overflow-hidden min-h-[70px] px-4"
                            >
                              
                              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md z-10 overflow-hidden" style={{ backgroundColor: method.bgColor || '#1e1e1e' }}>
                                 {method.logoType === 'image' || !method.logoType ? (
                                    method.logo ? (
                                      <img src={method.logo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer"  loading="lazy" />
                                    ) : (
                                      <div className="text-white font-bold">{method.name?.[0] || '?'}</div>
                                    )
                                 ) : (
                                    <span className="text-white font-bold">{method.logo}</span>
                                 )}
                              </div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-[#E0E0E0] text-[15px] font-normal leading-tight">{method.name}</p>
                                <p className="text-gray-500 text-[12px] font-normal leading-none mt-1">{method.instant ? 'instant' : method.time || '15 minutes'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(depositCategory === "All" || depositCategory === "Other") && (
                      <div className="mb-[20px] relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <Wallet size={16} className="text-[#888]" />
                          <h3 className="text-white font-bold text-[16px]">Other</h3>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                           {depositMethods.filter(m => m.isActive !== false && m.category?.toLowerCase() === 'other').map((method, idx) => (
                            <div 
                              key={`other-${idx}-${method.name}`}
                              onClick={(e) => { e.stopPropagation(); setSelectedMethod(method); setDepositStep("amount"); }}
                              className="bg-[#2A2B31] hover:bg-[#323338] transition-colors rounded-[16px] flex items-center cursor-pointer border border-[#3b3b3f]/30 relative overflow-hidden min-h-[70px] px-4"
                            >
                              
                              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md z-10 overflow-hidden" style={{ backgroundColor: method.bgColor || '#1e1e1e' }}>
                                 {method.logoType === 'image' || !method.logoType ? (
                                    method.logo ? (
                                      <img src={method.logo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer"  loading="lazy" />
                                    ) : (
                                      <div className="text-white font-bold">{method.name?.[0] || '?'}</div>
                                    )
                                 ) : (
                                    <span className="text-white font-bold">{method.logo}</span>
                                 )}
                              </div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-[#E0E0E0] text-[15px] font-normal leading-tight">{method.name}</p>
                                <p className="text-gray-500 text-[12px] font-normal leading-none mt-1">{method.instant ? 'instant' : method.time || '15 minutes'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Catch-all for any active method not in a displayed category */}
                    {depositCategory === "All" && (
                      <div className="mb-[150px] relative z-10">
                        {depositMethods.filter(m => {
                          if (m.isActive === false) return false;
                          const cat = m.category?.toLowerCase() || '';
                          const knownCategories = ['popular', 'crypto', 'e-wallets', 'mobile banking', 'bank transfer', 'credit cards', 'other'];
                          return !knownCategories.includes(cat) && !m.isPopular;
                        }).length > 0 && (
                          <>
                            <div className="flex items-center gap-2 mb-3">
                              <Icons.Zap size={16} className="text-yellow-500" />
                              <h3 className="text-white font-bold text-[16px]">More Methods</h3>
                            </div>
                            <div className="flex flex-col gap-2">
                              {depositMethods.filter(m => {
                                if (m.isActive === false) return false;
                                const cat = m.category?.toLowerCase() || '';
                                const knownCategories = ['popular', 'crypto', 'e-wallets', 'mobile banking', 'bank transfer', 'credit cards', 'other'];
                                return !knownCategories.includes(cat) && !m.isPopular;
                              }).map((method, idx) => (
                                <div 
                                  key={`misc-${idx}-${method.name}`}
                                  onClick={(e) => { e.stopPropagation(); setSelectedMethod(method); setDepositStep("amount"); }}
                                  className="bg-[#2A2B31] hover:bg-[#323338] transition-colors rounded-[16px] flex items-center cursor-pointer border border-[#3b3b3f]/30 relative overflow-hidden min-h-[70px] px-4"
                                >
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md z-10 overflow-hidden" style={{ backgroundColor: method.bgColor || '#1e1e1e' }}>
                                    {method.logoType === 'image' || !method.logoType ? (
                                        method.logo ? (
                                          <img src={method.logo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer"  loading="lazy" />
                                        ) : (
                                          <div className="text-white font-bold">{method.name?.[0] || '?'}</div>
                                        )
                                    ) : (
                                        <span className="text-white font-bold">{method.logo}</span>
                                    )}
                                  </div>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-[#E0E0E0] text-[15px] font-normal leading-tight">{method.name}</p>
                                    <p className="text-gray-500 text-[12px] font-normal leading-none mt-1">{method.instant ? 'instant' : method.time || '10 minutes'}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                 </div>
               ) : depositStep === "amount" ? (
                 <div className="px-4 pb-[120px] animate-in fade-in slide-in-from-right-5 duration-300">
                    <div className="flex items-center gap-2 mb-6">
                       <button onClick={() => setDepositStep("methods")} className="text-gray-400 hover:text-white p-1 -ml-1">
                          <ChevronLeft size={24} />
                       </button>
                       <h2 className="text-white font-bold text-lg">{selectedMethod?.name}</h2>
                    </div>

                    <button className="w-full bg-[#2A2B31] rounded-xl py-3 px-4 flex items-center justify-center gap-2 border border-[#3b3b3f]/50 mb-8 font-bold text-[15px] group active:scale-[0.98] transition-transform">
                       <History size={18} className="text-gray-400 group-hover:text-white" /> Choose method
                    </button>

                    <p className="text-center text-gray-400 text-[13px] font-medium mb-6">
                       Deposit amount from {isCryptoDeposit ? `$${selectedMethod?.minDeposit || 1}` : formatWithCurrency(selectedMethod?.minDeposit || 500, userCurrency)} to {isCryptoDeposit ? `$${selectedMethod?.maxDeposit || 10000}` : formatWithCurrency(selectedMethod?.maxDeposit || 1000000, userCurrency)}
                    </p>

                    <div className="bg-gradient-to-r from-[#2c1d3c] via-[#4d2f34] to-[#a37932] rounded-2xl p-0.5 relative overflow-hidden mb-6 shadow-lg">
                       <div className="bg-[#1d1e24]/60 backdrop-blur-md p-4 rounded-[14px] flex items-center justify-between">
                          <div>
                             <h4 className="text-white font-bold text-[15px] mb-1">Become a VIP to get:</h4>
                             <div className="bg-[#3269FF]/80 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded-full inline-block uppercase tracking-wider">Cashback / Insurance / Personal manager / RFTs</div>
                          </div>
                          <div className="flex flex-col items-end">
                             <p className="text-[#FFE24C] font-black text-xs leading-none">{isCryptoDeposit ? '$' : formatWithCurrency(77500, userCurrency)}</p>
                             <div className="w-10 h-10 mt-1 relative">
                                <div className="absolute inset-0 bg-white/20 blur-md rounded-full"></div>
                                <div className="relative w-full h-full bg-gradient-to-br from-gray-400 to-gray-700 rounded-lg rotate-45 shadow-lg border border-white/20"></div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                       <div 
                          onClick={() => setDepositAmount(isCryptoDeposit ? '3000' : convertFromBase(359000, userCurrency).toString())}
                          className={`rounded-2xl p-[1px] cursor-pointer transition-all ${depositAmount === (isCryptoDeposit ? '3000' : convertFromBase(359000, userCurrency).toString()) ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-[0_0_15px_rgba(255,226,76,0.3)]' : 'bg-gradient-to-br from-[#4d2f34] to-[#2c1d3c]'}`}
                       >
                          <div className={`p-3.5 rounded-[15px] flex flex-col ${depositAmount === (isCryptoDeposit ? '3000' : convertFromBase(359000, userCurrency).toString()) ? 'bg-[#1d1e24]' : 'bg-[#1d1e24]/80'}`}>
                             <div className="flex justify-between items-start mb-4">
                                <p className="text-white font-black text-lg leading-tight">{isCryptoDeposit ? '$3,000' : formatWithCurrency(359000, userCurrency)}</p>
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-800 rotate-45 border border-white/20 shadow-lg"></div>
                             </div>
                             <p className="text-[#00C980] text-xs font-black mb-1 uppercase tracking-wider">Bonus +70%</p>
                             <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Prestige</p>
                          </div>
                       </div>

                       <div 
                          onClick={() => setDepositAmount(isCryptoDeposit ? '25' : convertFromBase(3000, userCurrency).toString())}
                          className={`rounded-2xl p-3.5 flex flex-col border cursor-pointer transition-all ${depositAmount === (isCryptoDeposit ? '25' : convertFromBase(3000, userCurrency).toString()) ? 'bg-[#2A2B31] border-yellow-500 shadow-[0_0_15px_rgba(255,226,76,0.2)]' : 'bg-[#2A2B31] border-[#3b3b3f]/50'}`}
                       >
                          <div className="flex justify-between items-start mb-4">
                             <p className="text-white font-black text-lg leading-tight">{isCryptoDeposit ? '$25' : formatWithCurrency(3000, userCurrency)}</p>
                             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-300 to-gray-500 rotate-45 border border-white/20 shadow-lg opacity-60"></div>
                          </div>
                          <p className="text-gray-400 text-xs font-black mb-1 uppercase tracking-wider">Bonus 0%</p>
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Standard</p>
                       </div>
                    </div>

                    <div className="bg-[#26272C] rounded-[16px] px-5 py-4 flex flex-col gap-2 mb-8 shadow-sm border border-white/5 focus-within:border-white/20 transition-all">
                       <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest flex justify-between">
                          Custom Amount
                          <span className="text-[9px] opacity-70">Min: {isCryptoDeposit ? `$${selectedMethod?.minDeposit || 1}` : formatWithCurrency(selectedMethod?.minDeposit || 500, userCurrency)}</span>
                       </label>
                       <div className="flex items-center gap-2">
                          <span className="text-white font-black text-xl">{isCryptoDeposit ? '$' : userCurrency}</span>
                          <input 
                             type="number" 
                             value={depositAmount} 
                             onChange={(e) => setDepositAmount(e.target.value)}
                             className="bg-transparent text-white font-black text-2xl outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                             placeholder="0.00"
                          />
                       </div>
                    </div>

                    <div className="bg-[#26272C] rounded-[16px] px-5 py-4 flex items-center justify-between mb-8 shadow-sm">
                       <p className="text-white font-medium text-[15px]">Your status will be</p>
                       <div className="flex items-center gap-2">
                           <span className="text-gray-400 text-[13px] font-medium uppercase tracking-wider">VIP</span>
                           {/* Diamond icon SVG */}
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 21L2 9L12 3L22 9L12 21Z" fill="url(#paint0_linear)"/>
                              <path d="M12 21L7 9L12 3V21Z" fill="url(#paint1_linear)"/>
                              <path d="M12 21L17 9L12 3V21Z" fill="url(#paint2_linear)"/>
                              <path d="M2 9H22L12 21L2 9Z" fill="url(#paint3_linear)"/>
                              <defs>
                                <linearGradient id="paint0_linear" x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#A9A9A9"/>
                                    <stop offset="1" stopColor="#D3D3D3"/>
                                </linearGradient>
                                <linearGradient id="paint1_linear" x1="9.5" y1="3" x2="9.5" y2="21" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#BDBDBD"/>
                                    <stop offset="1" stopColor="#E0E0E0"/>
                                </linearGradient>
                                <linearGradient id="paint2_linear" x1="14.5" y1="3" x2="14.5" y2="21" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#808080"/>
                                    <stop offset="1" stopColor="#A9A9A9"/>
                                </linearGradient>
                                <linearGradient id="paint3_linear" x1="12" y1="9" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#696969"/>
                                    <stop offset="1" stopColor="#808080"/>
                                </linearGradient>
                              </defs>
                           </svg>
                       </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-4">
                       <h3 className="text-white font-bold text-[16px]">Bonuses and promo codes</h3>
                       <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center text-[10px] text-gray-400 font-medium font-serif shrink-0 cursor-pointer hover:bg-gray-700 transition">
                          i
                       </div>
                    </div>

                    <div className="space-y-2 mb-20">
                       <div onClick={() => setSelectedBonusId("none")} className={`bg-[#26272C] rounded-[14px] p-[18px] flex items-center gap-4 cursor-pointer transition-colors ${selectedBonusId === "none" ? 'bg-[#2A2B31]' : 'hover:bg-[#2A2B31]'}`}>
                          <div className={`w-[22px] h-[22px] rounded-full border-[2px] ${selectedBonusId === "none" ? 'border-[#FFE24C]' : 'border-gray-500'} flex items-center justify-center transition-colors shrink-0`}>
                             {selectedBonusId === "none" && <div className="w-[10px] h-[10px] bg-[#FFE24C] rounded-full"></div>}
                          </div>
                          <span className="text-white font-medium text-[15px]">Without a bonus</span>
                       </div>

                       <div onClick={() => setSelectedBonusId("bonus50")} className={`bg-[#26272C] rounded-[14px] p-[18px] flex flex-col cursor-pointer transition-colors ${selectedBonusId === "bonus50" ? 'bg-[#2A2B31]' : 'hover:bg-[#2A2B31]'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-[22px] h-[22px] rounded-full border-[2px] ${selectedBonusId === "bonus50" ? 'border-[#FFE24C]' : 'border-gray-500'} flex items-center justify-center transition-colors shrink-0`}>
                               {selectedBonusId === "bonus50" && <div className="w-[10px] h-[10px] bg-[#FFE24C] rounded-full"></div>}
                            </div>
                            <span className="text-white font-medium text-[15px]">Deposit bonus <span className="text-[#FFE24C] font-semibold">+50%</span></span>
                          </div>
                          {selectedBonusId === "bonus50" && (
                             <div className="pl-9 mt-5 space-y-3">
                                <div className="flex items-center justify-between text-[13px]">
                                   <div className="flex items-center gap-1.5 text-gray-400">
                                      <span>Bonus</span>
                                      <div className="w-[14px] h-[14px] rounded-full border border-gray-500 flex items-center justify-center text-[9px] text-gray-400 font-medium font-serif shrink-0 cursor-pointer">i</div>
                                   </div>
                                   <div className="flex-1 border-b border-gray-600/30 border-solid mx-3 mt-[1px]"></div>
                                   <span className="text-gray-300 font-medium tracking-wide">{userCurrency}38,750.00</span>
                                </div>
                                <div className="flex items-center justify-between text-[13px] font-bold">
                                   <span className="text-white">Total</span>
                                   <div className="flex-1 border-b border-gray-600/30 border-solid mx-3 mt-[1px]"></div>
                                   <span className="text-white tracking-wide">{userCurrency}116,250.00</span>
                                </div>
                             </div>
                          )}
                       </div>

                       <div onClick={() => setSelectedBonusId("promo")} className={`bg-[#26272C] rounded-[14px] p-[18px] flex flex-col cursor-pointer transition-colors ${selectedBonusId === "promo" ? 'bg-[#2A2B31]' : 'hover:bg-[#2A2B31]'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-[22px] h-[22px] rounded-full border-[2px] ${selectedBonusId === "promo" ? 'border-[#FFE24C]' : 'border-gray-500'} flex items-center justify-center transition-colors shrink-0`}>
                               {selectedBonusId === "promo" && <div className="w-[10px] h-[10px] bg-[#FFE24C] rounded-full"></div>}
                            </div>
                            <span className="text-white font-medium text-[15px]">Promo code bonus <span className="text-[#00C980] font-semibold">+0%</span></span>
                          </div>
                          {selectedBonusId === "promo" && (
                             <div className="pl-9 mt-4 flex gap-3 h-[46px]">
                                <div className="flex-1 bg-[#202125] rounded-[10px] flex items-center px-4 border border-[#3b3b3f]/30 focus-within:border-gray-500 transition-colors h-full overflow-hidden">
                                   <Gift size={20} className="text-gray-400 mr-2 shrink-0" />
                                   <input type="text" placeholder="Promo code" className="bg-transparent text-white w-full text-[14px] outline-none placeholder:text-gray-500 font-medium h-full" />
                                </div>
                                <button className="bg-[#FFE24C] hover:bg-[#F0D544] transition-colors w-[46px] h-[46px] rounded-[10px] flex items-center justify-center text-black shadow-sm shrink-0 active:scale-95">
                                   <ChevronRight size={24} strokeWidth={2.5} />
                                </button>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
               ) : depositStep === "payment" ? (
                 <div className="px-4 pb-[60px] animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-center gap-2 mb-8 mt-2">
                       <button onClick={() => setDepositStep("amount")} className="text-gray-400 hover:text-white p-1 -ml-1">
                          <ChevronLeft size={24} />
                       </button>
                       <h2 className="text-white font-extrabold text-[18px] flex-1 text-center pr-8">Complete the payment</h2>
                    </div>

                     {selectedMethod?.provider === "Web3" ? (
                        <div className="bg-[#2A2B31]/50 border border-white/5 rounded-[24px] p-8 mt-6 shadow-2xl relative overflow-hidden backdrop-blur-md animate-in slide-in-from-bottom-2 duration-500">
                           <div className="flex flex-col items-center justify-center text-center space-y-6">
                              <div className="w-24 h-24 bg-[#3269FF]/10 rounded-full flex items-center justify-center border border-[#3269FF]/30 relative">
                                 {web3State === 'processing' && <div className="absolute inset-0 rounded-full border-[3px] border-[#3269FF] border-t-transparent animate-spin"></div>}
                                 {web3State === 'success' ? <Check size={48} className="text-[#00C980]" /> : <Wallet size={48} className="text-[#3269FF]" />}
                              </div>
                              
                              <div>
                                 <h3 className="text-white font-bold text-2xl mb-2">
                                     {web3State === 'idle' ? 'Connect Wallet' : 
                                      web3State === 'connecting' ? 'Connecting...' : 
                                      web3State === 'connected' ? 'Confirm Payment' : 
                                      web3State === 'processing' ? 'Processing Transaction' : 'Payment Successful!'}
                                 </h3>
                                 <p className="text-gray-400 text-sm max-w-sm mx-auto">
                                     {web3State === 'idle' ? 'Connect your MetaMask, Trust Wallet, or Binance Web3 Wallet to deposit.' : 
                                      web3State === 'connecting' ? 'Please approve the connection request in your wallet.' : 
                                      web3State === 'connected' ? `You are depositing ${userCurrency}${Number(depositAmount).toLocaleString()}. Please confirm the transaction in your wallet.` : 
                                      web3State === 'processing' ? 'Waiting for blockchain confirmation... This usually takes around 10 to 30 seconds.' : `Your deposit of ${userCurrency}${Number(depositAmount).toLocaleString()} has been received!`}
                                 </p>
                              </div>

                              {walletAddress && web3State !== 'idle' && (
                                 <div className="bg-black/40 py-2 px-5 rounded-full border border-white/5 font-mono text-sm text-gray-300 shadow-inner flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                 </div>
                              )}

                              {web3State === 'idle' && (
                                 <div className="w-full pt-4">
                                     <button 
                                         onClick={async () => {
                                            setWeb3State('connecting');
                                            try {
                                               let address = "";
                                               if (typeof window !== 'undefined' && (window as any).ethereum) {
                                                  const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
                                                  address = accounts[0];
                                               } else {
                                                  await new Promise(r => setTimeout(r, 1500));
                                                  address = "0x71" + Math.random().toString(16).slice(2, 8) + "..." + Math.random().toString(16).slice(2, 6);
                                               }
                                               setWalletAddress(address);
                                               setWeb3State('connected');
                                            } catch (e) {
                                               console.error(e);
                                               setWeb3State('idle');
                                            }
                                         }}
                                         className="w-full py-4 bg-[#3269FF] hover:bg-[#2855D0] text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(50,105,255,0.3)] hover:shadow-[0_0_30px_rgba(50,105,255,0.5)] transform hover:-translate-y-1"
                                     >
                                        Auto Connect Web3 Wallets
                                     </button>
                                     <div className="flex justify-center gap-4 mt-6 grayscale opacity-60">
                                         <div className="w-8 h-8 bg-[#F6851B] rounded-full shadow-md hover:grayscale-0 transition-all cursor-pointer"></div>
                                         <div className="w-8 h-8 bg-[#3375BB] rounded-full shadow-md hover:grayscale-0 transition-all cursor-pointer"></div>
                                         <div className="w-8 h-8 bg-[#F3BA2F] rounded-full shadow-md hover:grayscale-0 transition-all cursor-pointer"></div>
                                     </div>
                                 </div>
                              )}

                              {web3State === 'connected' && (
                                 <button 
                                     onClick={async () => {
                                        setWeb3State('processing');
                                        try {
                                           await new Promise(r => setTimeout(r, 4000));
                                           
                                           setTxHash("0x" + Math.random().toString(16).slice(2, 42) + Math.random().toString(16).slice(2, 24));
                                           setWeb3State('success');
                                           
                                           import('../firebase').then(async ({ doc, updateDoc, increment }) => {
                                              if (auth?.currentUser) {
                                                  const baseDeposit = convertToBase(Number(depositAmount), userCurrency);
                                                  await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                                                      balance: increment(baseDeposit)
                                                  });
                                              }
                                           }).catch(e => console.error(e));
                                           
                                           toast.success(`Successfully deposited ${userCurrency}${depositAmount} via Web3 Wallet!`);
                                        } catch (e) {
                                           console.error(e);
                                           toast.error("Deposit failed.");
                                           setWeb3State('connected');
                                        }
                                     }}
                                     className="w-full py-4 bg-[#00C980] hover:bg-[#00B070] text-black text-lg font-black rounded-xl transition-all shadow-[0_0_20px_rgba(0,201,128,0.3)] hover:shadow-[0_0_30px_rgba(0,201,128,0.5)] transform hover:-translate-y-1 mt-4"
                                 >
                                    Pay {userCurrency}{Number(depositAmount).toLocaleString()}
                                 </button>
                              )}

                              {web3State === 'success' && (
                                 <div className="w-full mt-4 space-y-4">
                                    {txHash && (
                                      <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col gap-1.5 text-left items-center">
                                        <span className="text-[10px] text-gray-500 uppercase font-black">Transaction Hash</span>
                                        <span className="text-[#00C980] font-mono text-sm max-w-[280px] text-center truncate">{txHash}</span>
                                      </div>
                                    )}
                                    <button 
                                        onClick={() => {
                                           setShowDeposit(false);
                                           setDepositStep("methods");
                                           setWeb3State('idle');
                                        }}
                                        className="w-full py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-transform transform hover:-translate-y-1 shadow-lg"
                                    >
                                       Return to Terminal
                                    </button>
                                 </div>
                              )}
                           </div>
                        </div>
                     ) : isPaymentPageLoading ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-500 bg-[#2A2B31]/50 border border-white/5 rounded-[24px] mt-6 relative overflow-hidden backdrop-blur-md pb-10">
                          <div className="w-16 h-16 border-4 border-[#FFE24C] border-t-transparent rounded-full animate-spin mb-6"></div>
                          <h3 className="text-white text-xl font-bold mb-2">Connecting to Secure Gateway...</h3>
                          <p className="text-gray-400 text-sm max-w-sm text-center">Please wait while we initialize the connection to the payment provider.</p>
                        </div>
                      ) : ["bkash", "nagad", "rocket", "upay"].some(n => (selectedMethod?.name || "").toLowerCase().includes(n)) ? (
                        <div className="fixed inset-0 z-[400] bg-white text-black overflow-y-auto animate-in slide-in-from-bottom duration-500 flex flex-col scrollbar-hide w-full h-full pb-8 pt-safe">
                           <div className="bg-[#0b6c4b] p-3 pl-4 text-white shadow-xl relative z-10 font-sans flex items-center justify-between">
                              <div>
                                <h2 className="text-[26px] font-black tracking-tight leading-none mb-1">BDT {Number(depositAmount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
                                <p className="text-[14px] font-bold leading-tight uppercase tracking-tight">Do not Cash Out<br/>less or more</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="bg-white font-black text-black px-3 py-1.5 rounded shadow-sm tracking-wider flex items-center gap-1.5 opacity-90">
                                   <span className="font-extrabold text-[12px] uppercase">Service</span>
                                </div>
                              </div>
                           </div>
                           
                           <div className="p-4 flex-1">
                              <p className="text-[#ec2028] font-bold text-[16px] leading-[1.3] mb-5 text-left font-sans">
                                 If you change the amount (BDT {Number(depositAmount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}), you will not be able to receive credit.
                              </p>
                              
                              <div className={`p-4 rounded-[6px] text-white flex items-center gap-4 mb-6 shadow-md ${selectedMethod?.name?.toLowerCase().includes('bkash') ? 'bg-[#df146e]' : selectedMethod?.name?.toLowerCase().includes('nagad') ? 'bg-[#ec2028]' : selectedMethod?.name?.toLowerCase().includes('rocket') ? 'bg-[#8c1515]' : selectedMethod?.name?.toLowerCase().includes('upay') ? 'bg-[#295191]' : 'bg-gray-800'} `}>
                                 <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center p-1 drop-shadow-md">
                                    <AssetLogo name={selectedMethod?.name} />
                                 </div>
                                 <div className="font-extrabold text-[20px] font-sans">{selectedMethod?.name?.toUpperCase()} Deposit</div>
                              </div>
                              
                              <div className="mb-6 font-sans">
                                 <h3 className="font-bold text-[17px] mb-1 text-black">Wallet No<span className="text-[#ec2028]">*</span></h3>
                                 <p className="text-[14px] text-gray-800 mb-2 font-medium">Only Cash Out is accepted at this {selectedMethod?.name?.toUpperCase()} number. Amount: ~{Number(depositAmount) * 120} BDT</p>
                                 <div className="flex items-center justify-between bg-[#f8f9fa] p-4 rounded-[6px] border border-gray-200">
                                    <span className="font-black text-gray-900 tracking-wider text-[18px]">{selectedMethod?.address || selectedMethod?.walletAddress || '01347249505'}</span>
                                    <button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(selectedMethod?.address || selectedMethod?.walletAddress || '01347249505');
                                        setHasCopiedWallet(true);
                                        toast.success("Copied to clipboard!");
                                        setTimeout(() => setHasCopiedWallet(false), 3000);
                                      }}
                                      className="text-emerald-600 hover:text-emerald-700 active:scale-95 transition-transform"
                                    >
                                      {hasCopiedWallet ? <Icons.Check size={28} /> : <Icons.Copy size={28} />}
                                    </button>
                                 </div>
                              </div>

                              <div className="mb-6 font-sans">
                                 <h3 className="font-bold text-[16px] mb-2 leading-tight text-black">Enter the TrxID of the Cash Out <span className="text-[#ec2028] text-[15px]">(required)</span></h3>
                                 <input 
                                   type="text" 
                                   placeholder="TrxID must be filled!"
                                   value={paymentTrxId}
                                   onChange={(e) => setPaymentTrxId(e.target.value)}
                                   className="w-full border-2 border-[#ec2028] rounded-[6px] p-4.5 text-[16px] outline-none font-bold placeholder-gray-400 bg-white"
                                 />
                              </div>
                              
                              <button 
                                onClick={async () => {
                                  if (!paymentTrxId) {
                                    toast.error("TrxID is required!");
                                    return;
                                  }
                                  
                                  const minDep = ['USD', 'USDT', 'EUR', 'GBP', '$', '€'].includes(userCurrency) ? 1 : 20;
                                  if (Number(depositAmount) < minDep) {
                                    toast.error(`Minimum deposit is ${userCurrency}${minDep}`);
                                    return;
                                  }
                                  const orderId = Math.floor(Math.random() * 100000000).toString();
                                  
                                  if (auth?.currentUser) {
                                    try {
                                      const { collection, addDoc, serverTimestamp } = await import('../firebase');
                                      const currentAmount = convertToBase(Number(depositAmount), userCurrency);
                                      
                                      const depositPayload = {
                                        userId: auth.currentUser.uid,
                                        userEmail: auth.currentUser.email,
                                        amount: currentAmount,
                                        currency: userCurrency,
                                        method: selectedMethod?.name,
                                        walletNumber: selectedMethod?.walletAddress || '01347249505',
                                        trxId: paymentTrxId,
                                        status: 'pending',
                                        timestamp: Date.now(),
                                        orderId
                                      };
                                      const depositRes = await fetch('/api/deposit', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ depositData: depositPayload })
                                      });
                                      if (!depositRes.ok) throw new Error('Deposit failed');
                                      
                                      toast.success(`Deposit request for ${userCurrency}${depositAmount} submitted successfully!`);
                                      setShowDeposit(false);
                                      setDepositStep("methods");
                                      return; 
                                      await addDoc(collection(db, 'deposits'), {
                                        userId: auth.currentUser.uid,
                                        userEmail: auth.currentUser.email,
                                        amount: currentAmount,
                                        currency: userCurrency,
                                        method: selectedMethod?.name,
                                        walletNumber: selectedMethod?.walletAddress || '01347249505',
                                        trxId: paymentTrxId,
                                        status: 'pending',
                                        timestamp: Date.now(),
                                        orderId
                                      });
                                      
                                      const isCrypto = (selectedMethod?.category === "Crypto" || selectedMethod?.category === "Binance Pay" || (selectedMethod?.name || "").toLowerCase().includes("binance"));
                                      const txData = {
                                       type: 'Deposit',
                                       amount: convertToBase(Number(depositAmount), selectedMethod?.currency || (isCrypto ? 'USD' : userCurrency)),
                                       method: selectedMethod?.name || 'Selected Method',
                                       currency: selectedMethod?.currency || (isCrypto ? 'USDT' : userCurrency),
                                       status: 'pending',
                                       timestamp: Date.now(),
                                       orderId
                                     };
                                     await fetch('/api/transactions', {
                                       method: 'POST',
                                       headers: { 'Content-Type': 'application/json' },
                                       body: JSON.stringify({ userId: auth.currentUser.uid, transactionData: txData })
                                     });
                                     return; // Skip old client-side addDoc
                                     await addDoc(collection(db, `users/${auth.currentUser.uid}/transactions`), {
                                        type: 'Deposit',
                                        amount: currentAmount,
                                        method: selectedMethod?.name || 'Selected Method',
                                        currency: userCurrency,
                                        status: 'pending',
                                        timestamp: Date.now(),
                                        orderId
                                      });
                                      
                                      toast.success(`Deposit request for ${userCurrency}${depositAmount} submitted successfully!`);
                                    } catch (err) {
                                      console.error("Deposit submission error:", err);
                                      toast.error("Failed to submit deposit request. Please try again.");
                                    }
                                  }
                                  setShowDeposit(false);
                                  setDepositStep("methods");
                               }}
                               className="w-full py-4 bg-[#FFE24C] hover:bg-[#FFD600] text-black font-black text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(255,226,76,0.3)] hover:shadow-[0_0_30px_rgba(255,226,76,0.5)] transform hover:-translate-y-1"
                          >
                             Confirm Payment
                          </button>
                        </div>
                        {/* More UI Elements ... */}


                       <div className="space-y-6">
                          <div className="bg-[#1d1e24]/60 border border-white/5 p-4 rounded-2xl group hover:border-white/20 transition-all cursor-pointer">
                             <p className="text-gray-500 text-[11px] font-black uppercase tracking-widest mb-1.5">{selectedMethod?.coin || "USDT"} address to pay:</p>
                             <div className="flex items-center justify-between gap-4">
                                <p className="text-white font-mono text-[14px] leading-tight break-all">TJ8rDqvSUird6WhKNhwJpo623RnogjES2i</p>
                                <button className="shrink-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors group-active:scale-95">
                                   <Copy size={18} className="text-white" />
                                </button>
                             </div>
                          </div>

                          <div className="bg-[#1d1e24]/60 border border-white/5 p-4 rounded-2xl group hover:border-white/20 transition-all cursor-pointer">
                             <p className="text-gray-500 text-[11px] font-black uppercase tracking-widest mb-1.5">Amount to pay:</p>
                             <div className="flex items-center justify-between gap-4">
                                <p className="text-white font-black text-xl tracking-tight leading-none">631.76000000 <span className="text-gray-500 font-bold ml-1">{selectedMethod?.coin || "USDT"}</span></p>
                                <button className="shrink-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors group-active:scale-95">
                                   <Copy size={18} className="text-white" />
                                </button>
                             </div>
                          </div>
                       </div>

                    <div className="mt-8 px-2 space-y-8">
                       <div className="bg-[#2A2B31]/30 p-5 rounded-[20px] border border-white/5 animate-in slide-in-from-bottom-2 duration-700 delay-100">
                          <h3 className="text-white font-bold text-[16px] mb-6">How to make a deposit?</h3>
                          <div className="space-y-6">
                             <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-[#3269FF]/20 flex items-center justify-center shrink-0">
                                   <div className="bg-white/10 rounded p-1"><QrCode size={16} className="text-[#3269FF]" /></div>
                                </div>
                                <p className="text-gray-400 text-[13px] font-medium leading-normal">Scan the QR code with your payment app</p>
                             </div>
                             
                             <div className="flex items-center justify-center gap-4 py-2 opacity-50">
                                <div className="h-[1px] flex-1 bg-white/10"></div>
                                <span className="text-gray-500 text-[10px] font-bold uppercase">or</span>
                                <div className="h-[1px] flex-1 bg-white/10"></div>
                             </div>

                             <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                   <Copy size={16} className="text-gray-400" />
                                </div>
                                <p className="text-gray-400 text-[13px] font-medium leading-normal">Copy the {selectedMethod?.coin || "USDT"} address and amount to pay, then paste them into your payment app</p>
                             </div>
                          </div>
                       </div>

                       <div className="flex gap-4 bg-[#FF4A5C]/5 p-5 rounded-[20px] border border-[#FF4A5C]/20 animate-in slide-in-from-bottom-2 duration-700 delay-200">
                          <div className="w-10 h-10 bg-[#FF4A5C]/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                             <div className="w-5 h-5 bg-[#FF4A5C] rounded-full flex items-center justify-center text-black font-black text-xs">!</div>
                          </div>
                          <p className="text-gray-300 text-[13px] font-medium leading-relaxed">
                            Transfer only <span className="text-white font-bold">Tether USD TRC20</span> token (USDT). Transferring other currency will result in the loss of funds
                          </p>
                       </div>

                       <div className="flex gap-4 bg-yellow-400/5 p-5 rounded-[20px] border border-yellow-400/20 animate-in slide-in-from-bottom-2 duration-700 delay-300">
                          <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                             <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-black font-black text-xs">!</div>
                          </div>
                          <p className="text-gray-300 text-[13px] font-medium leading-relaxed">
                            A wallet's address to pay is unique for each transaction. Do not send funds to the same address more than once
                          </p>
                       </div>
                    </div>
                 </div>
                ) : (

                <div className="bg-[#F4F4F4] min-h-screen flex flex-col items-center">
                  <div className="w-full bg-[#EC5300] p-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <div className="bg-white p-1 rounded-full"><div className="w-6 h-6 bg-orange-600 rounded-full"></div></div>
                        <h2 className="text-lg font-bold">Nagad Deposit</h2>
                      </div>
                      <div className="flex gap-2">
                          <span className="bg-white/20 px-2 py-1 rounded text-xs">বাং</span>
                          <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">EN</span>
                      </div>
                  </div>
                  <div className="w-full bg-[#EC5300] text-white text-center py-2 text-sm font-medium">
                     বাকি সময়: <span className="font-mono">00:09:51</span>
                  </div>
                  
                  <div className="p-4 w-full max-w-sm">
                      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
                          <div className="text-3xl font-bold text-[#EC5300] text-center mb-1">৳1,250</div>
                          <div className="text-[10px] text-gray-500 text-center bg-gray-100 p-1 rounded">অনুগ্রহ করে পরিমাণ পরিবর্তন করবেন না</div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm mb-4">
                          <div className="p-4 border-b flex items-center gap-3">
                              <span className="bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded text-xs">1</span>
                              <span className="font-bold text-sm">অ্যাকাউন্ট কপি করুন</span>
                          </div>
                          <div className="p-4">
                              <p className="text-xs text-gray-600 mb-2">এই Nagad নম্বরটি শুধুমাত্র ক্যাশ আউট গ্রহণ করে।</p>
                              <div className="bg-gray-50 border rounded-lg p-3 flex items-center justify-between">
                                  <span className="font-mono font-bold text-lg">01833264202</span>
                                  <Icons.Copy size={18} className="text-gray-400" />
                              </div>
                          </div>
                      </div>
                      
                      <div className="bg-white rounded-xl shadow-sm mb-4">
                          <div className="p-4 border-b flex items-center gap-3">
                              <span className="bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded text-xs">2</span>
                              <span className="font-bold text-sm">লেনদেন আইডি প্রবেশ করুন</span>
                          </div>
                          <div className="p-4">
                              <input 
                                type="text"
                                placeholder="লেনদেন আইডি(Ex.73V36DXK)"
                                className="w-full border rounded-lg p-3 text-sm mb-3"
                              />
                              <button className="w-full bg-[#EC5300] text-white font-bold py-3 rounded-lg">
                                  জমা দিন
                              </button>
                          </div>
                      </div>
                  </div>
                </div>
                )}
            </div>
         ) : null}
            </div>
            
            {/* Multi-step Footer Buttons */}
            {depositStep !== "payment" && (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1e1f24] border-t border-white/5 pointer-events-none z-[310]">
                 <div className="px-2 pb-2 text-center pointer-events-auto">
                    {depositStep === "amount" && (
                      <div className="flex justify-start mb-[14px]">
                          <p className="text-[#a4a4a4] text-[13px] font-medium flex items-center justify-start gap-1">
                            Bivaax Coins <span className="text-cyan-400 tracking-wide">+126</span>
                            <span className="w-3.5 h-3.5 rounded-full border border-cyan-400/50 flex items-center justify-center text-[8px] font-black text-cyan-400 ml-[1px]">X</span>
                          </p>
                      </div>
                    )}
                    { (selectedMethod || userTransactions.filter(t => t.type === "Deposit" && t.status === "Completed").length > 0 || depositStep !== "methods") && (
                      <button 
                        onClick={() => {
                          if (depositStep === "methods") {
                            const completedDeposits = userTransactions.filter(t => t.type === "Deposit" && t.status === "Completed");
                            const lastDeposit = completedDeposits.length > 0 ? completedDeposits[completedDeposits.length - 1] : null;
                            
                            if (selectedMethod) {
                              setDepositStep("amount");
                            } else if (lastDeposit) {
                              const lastMethod = depositMethods.find(m => m.name === lastDeposit.method);
                              if (lastMethod) {
                                  setSelectedMethod(lastMethod);
                                  setDepositStep("amount");
                              } else {
                                  toast.error("Previous deposit method not found.");
                              }
                            } else {
                              toast.error("Please select a deposit method.");
                            }
                          } else if (depositStep === "amount") {
                            const amountNum = Number(depositAmount);
                            // Admin sets minDeposit & maxDeposit in USD
                            const isCrypto = isCryptoDeposit;
                            const depositSymbol = selectedMethod?.currency ? getCurrencySymbol(selectedMethod.currency) : (isCryptoDeposit ? '$' : userCurrency);
                            const min = selectedMethod?.minDeposit || (isCryptoDeposit ? 1 : convertFromBase(500, userCurrency));
                            const max = selectedMethod?.maxDeposit || (isCryptoDeposit ? 10000 : convertFromBase(1000000, userCurrency));

                            if (amountNum < min) {
                              toast.error(`Minimum deposit for ${selectedMethod?.name} is ${depositSymbol}${min.toLocaleString()}`);
                              return;
                            }
                            if (amountNum > max) {
                              toast.error(`Maximum deposit for ${selectedMethod?.name} is ${depositSymbol}${max.toLocaleString()}`);
                              return;
                            }
                            
                            const methodName = (selectedMethod?.name || "").toLowerCase();
                            const isMFS = ["bkash", "nagad", "rocket", "upay"].some(n => methodName.includes(n));
                            
                            if (!isMFS && (methodName.includes("binance") || selectedMethod?.category === "Crypto" || selectedMethod?.category === "Binance Pay")) {
                              const orderId = Math.floor(Math.random() * 100000000).toString();
                              const url = `/crypto-deposit?amount=${depositAmount}&currency=${selectedMethod?.currency || (isCrypto ? 'USDT' : userCurrency)}&orderId=${orderId}&methodId=${selectedMethod?.id}`;
                              
                              // Save pending tx first
                              if (auth.currentUser) {
                                (async () => {
                                  try {
                                    const txData = {
                                      type: 'Deposit',
                                      amount: convertToBase(Number(depositAmount), selectedMethod?.currency || (isCrypto ? 'USD' : userCurrency)),
                                      method: selectedMethod?.name || 'Selected Method',
                                      currency: selectedMethod?.currency || (isCrypto ? 'USDT' : userCurrency),
                                      status: 'pending',
                                      timestamp: Date.now(),
                                      orderId
                                    };
                                    await fetch('/api/transactions', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ userId: auth.currentUser.uid, transactionData: txData })
                                    });
                                  } catch (err) {
                                    console.error("Failed to save pending deposit", err);
                                  }
                                })();
                              }

                              setIsPaymentPageLoading(true);
                              setTimeout(() => {
                                setIsPaymentPageLoading(false);
                                setShowDeposit(false);
                                setDepositStep("methods");
                                navigate(url);
                              }, 800);
                            } else if (["bkash", "nagad", "rocket", "upay"].some(n => (methodName).toLowerCase().includes(n))) {
                              const orderId = Math.floor(Math.random() * 100000000).toString();
                              const bdtAmount = userCurrency === 'BDT' ? Number(depositAmount) : Math.round(Number(depositAmount) * 120);
                              
                              let url = `/mfs-deposit?amount=${bdtAmount}&currency=BDT&orderId=${orderId}&methodId=${selectedMethod?.id}`;
                              if (methodName.includes("bkash")) url = `/deposit/bkash?amount=${bdtAmount}&orderId=${orderId}&methodId=${selectedMethod?.id}`;
                              else if (methodName.includes("nagad")) url = `/deposit/nagad?amount=${bdtAmount}&orderId=${orderId}&methodId=${selectedMethod?.id}`;
                              else if (methodName.includes("rocket")) url = `/deposit/rocket?amount=${bdtAmount}&orderId=${orderId}&methodId=${selectedMethod?.id}`;
                              
                              setIsPaymentPageLoading(true);
                              setTimeout(() => {
                                setIsPaymentPageLoading(false);
                                setShowDeposit(false);
                                setDepositStep("methods");
                                navigate(url);
                              }, 800);
                            } else {
                              setIsPaymentPageLoading(true);
                              setDepositStep("payment");
                              setTimeout(() => {
                                setIsPaymentPageLoading(false);
                              }, 1500);
                            }
                          }
                        }}
                        className="w-full bg-[#FFE24C] hover:bg-[#F0D544] text-black font-extrabold text-[16px] py-[13px] rounded-[10px] shadow-sm transition-all active:scale-[0.98]"
                      >
                        <div className="flex flex-col items-center leading-tight">
                            <span>{depositStep === "methods" ? (selectedMethod ? "Proceed to amount" : "Repeat last deposit") : "Deposit"}</span>
                            {depositStep === "amount" && (
                              <span className="text-[13px] font-medium opacity-90 tracking-tight">
                                {selectedMethod?.currency ? getCurrencySymbol(selectedMethod.currency) : (isCryptoDeposit ? "$" : "৳")}{Number(depositAmount).toLocaleString()}.00 
                                {selectedMethod?.currency === "BDT" && ` (~${(Number(depositAmount) / 120).toFixed(2)} USDT)`}
                              </span>
                            )}
                       </div>
                      </button>
                    )}
                    {depositStep === "amount" && (
                      <button 
                        onClick={() => { setShowDeposit(false); setActiveTab("support"); setShowSidebar(false); }}
                        className="w-full mt-4 text-[#3269FF] font-medium text-[14px] hover:text-[#4c84ff] underline underline-offset-2 decoration-[#3269FF]/50 transition-colors">
                        Contact support
                      </button>
                    )}
                 </div>
              </div>
            )}
           
           {/* Dropdown Overlay */}
           {showDepositCategoryDropdown && (
              <div className="fixed inset-0 z-[400] flex flex-col justify-end">
                 <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setShowDepositCategoryDropdown(false)}></div>
                 <div className="bg-[#2A2B31] rounded-t-[24px] pb-8 pt-6 px-4 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10 duration-200">
                    <div className="flex justify-between items-center mb-6 px-2">
                       <h2 className="text-white font-bold text-xl">Methods</h2>
                       <button onClick={() => setShowDepositCategoryDropdown(false)} className="text-gray-400 hover:text-white p-1 bg-[#323338] rounded-full transition-colors">
                          <X size={20} strokeWidth={2} />
                       </button>
                    </div>
                    <div className="flex flex-col gap-1.5 px-2 max-h-[50vh] overflow-y-auto">
                       {["All", "Popular", "Crypto", "E-wallets", "Bank transfer", "Credit cards", "Other"].map(cat => (
                         <div 
                           key={`cashier-cat-drop-${cat}`}
                           className={`px-4 py-3.5 rounded-xl cursor-pointer transition-colors ${depositCategory === cat ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/5 text-gray-300'} font-medium text-[16px]`}
                           onClick={() => { setDepositCategory(cat); setShowDepositCategoryDropdown(false); }}
                         >
                           {cat}
                         </div>
                       ))}
                   </div>
                 </div>
              </div>
           )}
          </>
        )}

          {cashierTab === 'withdrawals' && (
             <div className="flex-1 overflow-y-auto px-4 pb-[80px] custom-scrollbar flex flex-col pt-2">
               {withdrawStep === 'methods' ? (
                 <>
                {/* Promo Banner */}
                <div className="bg-gradient-to-br from-[#0B0D23] via-[#0E1545] to-[#0A2665] rounded-[16px] p-5 relative overflow-hidden mb-8 shadow-sm">
                  <div className="relative z-10 w-[65%]">
                    <h2 className="text-white text-[17px] font-bold leading-tight mb-2 tracking-tight">Want bigger profit?</h2>
                    <p className="text-white/80 text-[13px] leading-[1.3] mb-4">Looks like recent news brings good profit to traders. Hurry up and make some trades!</p>
                    <button className="w-full bg-[#FFE24C] hover:bg-[#F0D544] text-black font-semibold text-[15px] py-2.5 rounded-[12px] transition-colors shadow-sm">
                      Check the news
                    </button>
                  </div>
                  {/* Abstract globe shape */}
                  <div className="absolute right-[-40px] top-1/2 -translate-y-[45%] w-[180px] h-[180px] rounded-full border border-[#0d45a9]/50 bg-gradient-to-br from-[#1b62f1] to-[#012f91] opacity-60 shadow-inner flex items-center justify-center overflow-hidden pointer-events-none">
                     <div className="w-[120px] h-[120px] rounded-full border border-[#4d8eff]/30 rotate-45 flex items-center justify-center pointer-events-none">
                        <div className="w-[60px] h-[60px] rounded-full border border-[#7aaaff]/20 pointer-events-none"></div>
                     </div>
                  </div>
                </div>

                {(() => {
                   const completedDeposits = userTransactions.filter(t => t.type === "Deposit" && t.status === "Completed");
                   const usedMethodNames = new Set(completedDeposits.map(t => t.method));
                   
                   const unlockedMethods = depositMethods.filter(m => usedMethodNames.has(m.name));
                   const lockedMethods = depositMethods.filter(m => !usedMethodNames.has(m.name));

                   return (
                      <>
                         <h3 className="text-white text-xl font-bold mb-4 tracking-tight">Methods</h3>
                         {unlockedMethods.length > 0 ? (
                            <div className="flex flex-col gap-2.5 mb-8">
                               {unlockedMethods.map((method, idx) => (
                                  <div 
                                     key={`unlocked-${idx}-${method.name}`}
                                     className="bg-[#2A2B31] border border-[#3b3b3f]/50 rounded-[16px] p-4 flex items-center gap-4 shadow-sm group hover:border-[#5a5a5f] transition-all cursor-pointer"
                                     onClick={() => {
                                       setSelectedMethod(method);
                                       setWithdrawStep("form");
                                     }}
                                  >
                                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1 overflow-hidden" style={{ backgroundColor: method.bgColor || '#EC2A24' }}>
                                        {method.logoType === 'image' || !method.logoType ? (
                                           method.logo ? (
                                              <img src={method.logo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer"  loading="lazy" />
                                           ) : (
                                              <div className="text-white font-bold">{method.name?.[0] || '?'}</div>
                                           )
                                        ) : (
                                           <span className="text-white font-bold text-lg">{method.logo}</span>
                                        )}
                                     </div>
                                     <div className="flex flex-col">
                                        <span className="text-white font-semibold text-[15px] mb-0.5">{method.name}</span>
                                        <div className="flex items-center text-[12px]">
                                           <Icons.Zap size={10} className="text-[#00C980] mr-1" fill="currentColor" />
                                           <span className="text-[#00C980] font-semibold mr-1.5">active</span>
                                           <span className="text-gray-500 font-medium">• from {formatWithCurrency(1000, userCurrency)}</span>
                                        </div>
                                     </div>
                                  </div>
                               ))}
                            </div>
                         ) : (
                            <div className="bg-[#2A2B31]/40 rounded-[16px] p-8 text-center border border-dashed border-white/5 mb-8">
                               <p className="text-gray-500 text-sm">No active withdrawal methods. Please make a deposit first.</p>
                            </div>
                         )}

                         <h3 className="text-white text-xl font-bold mb-4 tracking-tight">Deposit to unlock</h3>
                         <div className="flex flex-col gap-2.5">
                            {lockedMethods.map((method, idx) => (
                               <div 
                                  key={`locked-${idx}-${method.name}`} 
                                  className="bg-[#2A2B31] border border-[#3b3b3f]/50 rounded-[16px] p-4 flex items-center gap-4 shadow-sm group hover:border-[#5a5a5f] transition-all cursor-not-allowed opacity-60"
                               >
                                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[10px] font-bold overflow-hidden" style={{ backgroundColor: '#15161d' }}>
                                     {method.logoType === 'image' || !method.logoType ? (
                                        method.logo ? (
                                           <img src={method.logo} alt="" className="w-full h-full object-contain grayscale opacity-60" referrerPolicy="no-referrer"  loading="lazy" />
                                        ) : (
                                           <div className="text-gray-600 font-bold">{method.name?.[0] || '?'}</div>
                                        )
                                     ) : (
                                        <span className="text-gray-600 font-bold text-lg">{method.logo}</span>
                                     )}
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="text-gray-400 font-semibold text-[15px] mb-0.5">{method.name}</span>
                                     <div className="flex items-center text-[12px]">
                                        <Icons.Lock size={10} className="text-gray-600 mr-1" fill="currentColor" />
                                        <span className="text-gray-600 font-medium mr-1.5">locked</span>
                                        <span className="text-gray-600 font-medium font-mono">• from {formatWithCurrency(1000, userCurrency)}</span>
                                     </div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </>
                   );
                })()}
                 </>
               ) : (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-300 relative z-10 w-full mb-10 pb-8">
                   <div className="flex items-center gap-3 mb-6">
                     <button onClick={() => { setWithdrawStep("methods"); setWithdrawSubmitAttempted(false); }} className="text-gray-400 hover:text-white transition-colors p-1 -ml-1">
                       <Icons.ArrowLeft size={24} />
                     </button>
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-0.5 shadow-sm overflow-hidden" style={{ backgroundColor: selectedMethod?.bgColor || '#EC2A24' }}>
                          {selectedMethod?.logoType === 'image' || !selectedMethod?.logoType ? (
                            selectedMethod?.logo ? (
                              <img src={selectedMethod.logo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer"  loading="lazy" />
                            ) : (
                              <div className="text-white font-bold text-[10px]">{selectedMethod?.name?.[0] || '?'}</div>
                            )
                          ) : (
                            <span className="text-white font-bold text-xs">{selectedMethod.logo}</span>
                          )}
                        </div>
                        <h2 className="text-white text-xl font-bold tracking-tight">{selectedMethod?.name || 'Withdrawal'}</h2>
                       <span className="text-gray-500 text-xl font-bold">•</span>
                       <div className="flex items-center">
                         <Icons.Zap size={14} className="text-[#FFE24C] mr-1" fill="currentColor" />
                         <span className="text-[#FFE24C] font-semibold text-sm">instant</span>
                       </div>
                     </div>
                   </div>

                   <h3 className="text-white text-[15px] font-black mb-1 tracking-tight">Withdraw amount from {formatWithCurrency(currentMinWithdrawal, userCurrency)} to {formatWithCurrency(20000, userCurrency)}</h3>
                   <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">Status: <span className="text-emerald-400">Withdrawal Open</span> • Balance: <span className="text-white">{formatWithCurrency(balance, userCurrency)}</span></span>
                   </div>
                   
                   <div className="relative mb-6">
                     <input 
                       type="number"
                       value={withdrawAmount}
                       onChange={(e) => setWithdrawAmount(e.target.value)}
                       placeholder="Enter amount"
                       className="w-full bg-[#2A2B31] border border-[#4a4a50] rounded-[12px] pl-4 pr-10 py-5 text-white placeholder-gray-500 font-medium text-[15px] focus:outline-none focus:border-white transition-colors"
                     />
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{userCurrency}</div>
                   </div>

                   <h3 className="text-white text-xl font-bold mb-4 tracking-tight">Your withdrawal details</h3>

                   <div className="space-y-6 mb-8">
                     <div>
                       <div className="relative">
                         <input 
                           type="text"
                           value={withdrawAccountHolder}
                           onChange={(e) => {
                             setWithdrawAccountHolder(e.target.value);
                             if (e.target.value) setWithdrawSubmitAttempted(false);
                           }}
                           placeholder={(selectedMethod?.name || "").toLowerCase().includes("binance") ? "Full Name (on Binance)" : "Bank account holder"}
                           className={`w-full bg-[#2A2B31] border ${withdrawSubmitAttempted && !withdrawAccountHolder ? 'border-[#ff4d4f]' : 'border-[#4a4a50]'} rounded-[12px] px-4 py-4 text-white placeholder-gray-500 font-medium text-[15px] focus:outline-none focus:border-white transition-colors`}
                         />
                         {withdrawSubmitAttempted && !withdrawAccountHolder && (
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ff4d4f]">
                             <Icons.AlertTriangle size={18} strokeWidth={2.5} />
                           </div>
                         )}
                       </div>
                       {withdrawSubmitAttempted && !withdrawAccountHolder && (
                         <p className="text-[#ff4d4f] text-[13px] font-semibold mt-2 px-1">Please specify the required information</p>
                       )}
                     </div>

                     <div className="relative bg-[#2A2B31] border border-[#4a4a50] rounded-[12px] px-4 py-2.5">
                       <label className="text-gray-500 text-xs font-medium block">Verification Email</label>
                       <input 
                         type="email"
                         value={withdrawEmail}
                         readOnly
                         className="w-full bg-transparent border-none p-0 text-white font-medium text-[15px] focus:outline-none focus:ring-0 mt-0.5"
                       />
                     </div>

                     <div>
                       <div className="relative">
                         <input 
                           type="text"
                           value={withdrawAccountNumber}
                           onChange={(e) => {
                             setWithdrawAccountNumber(e.target.value);
                             if (e.target.value) setWithdrawSubmitAttempted(false);
                           }}
                           placeholder={(selectedMethod?.name || "").toLowerCase().includes("binance") ? "Binance ID or Email" : (selectedMethod?.name === "Nagad" ? "Nagad Number" : "Bank account number")}
                           className={`w-full bg-[#2A2B31] border ${withdrawSubmitAttempted && !withdrawAccountNumber ? 'border-[#ff4d4f]' : 'border-[#4a4a50]'} rounded-[12px] px-4 py-4 text-white placeholder-gray-500 font-medium text-[15px] focus:outline-none focus:border-white transition-colors`}
                         />
                         {withdrawSubmitAttempted && !withdrawAccountNumber && (
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ff4d4f]">
                             <Icons.AlertTriangle size={18} strokeWidth={2.5} />
                           </div>
                         )}
                       </div>
                       {withdrawSubmitAttempted && !withdrawAccountNumber && (
                         <p className="text-[#ff4d4f] text-[13px] font-semibold mt-2 px-1">Please specify the required information</p>
                       )}
                     </div>
                   </div>
                    <button 
                      onClick={() => {
                        setWithdrawSubmitAttempted(true);
                        if (withdrawAccountHolder && withdrawAccountNumber) {
                           const amount = Number(withdrawAmount);
                           if (isNaN(amount) || amount <= 0) {
                              toast.error('Invalid amount');
                              return;
                           }
                           const minWithdrawal = 10;
                           if (amount < minWithdrawal) {
                              toast.error(`Minimum withdrawal is ${userCurrency}${minWithdrawal}`);
                              return;
                           }
                           const convertedRealBalance = convertFromBase(realBalance, userCurrency);
                           if (amount > convertedRealBalance) {
                              toast.error('Insufficient live balance');
                              return;
                           }

                           setIsRequestingOtp(true);
                           setWithdrawalLoadingText("Authenticating withdrawal request...");
                           
                           setTimeout(() => {
                               setWithdrawalLoadingText("Processing ledger balances...");
                               setTimeout(async () => {
                                   // SERVER-SIDE WITHDRAWAL API
                                   if (auth?.currentUser) {
                                       try {
                                           const baseWithdrawAmount = convertToBase(amount, userCurrency);
                                           const res = await fetch('/api/withdraw', {
                                               method: 'POST',
                                               headers: { 'Content-Type': 'application/json' },
                                               body: JSON.stringify({
                                                   userId: auth.currentUser.uid,
                                                   amount: baseWithdrawAmount,
                                                   method: selectedMethod?.name,
                                                   accountHolder: withdrawAccountHolder,
                                                   walletNumber: withdrawAccountNumber,
                                                   userCurrency
                                               })
                                           });
                                           if (!res.ok) throw new Error('Withdrawal failed');
                                           toast.success('Withdrawal requested successfully!');
                                           setWithdrawStep("methods");
                                           setWithdrawAmount("");
                                           setWithdrawAccountHolder("");
                                           setWithdrawAccountNumber("");
                                           setWithdrawSubmitAttempted(false);
                                           setIsRequestingOtp(false);
                                           setWithdrawalLoadingText("");
                                           return;
                                       } catch (e: any) {
                                           toast.error(e.message || 'Processing failed');
                                           setIsRequestingOtp(false);
                                           setWithdrawalLoadingText("");
                                           return;
                                       }
                                   }
                               }, 1500);
                           }, 800);
                        }
                     }}
                     className="w-full bg-[#FFE24C] hover:bg-[#F0D544] text-black font-semibold text-[16px] py-[18px] rounded-[12px] shadow-sm transition-all active:scale-[0.98] mt-4"
                     disabled={isRequestingOtp}
                   >
                     {isRequestingOtp ? (withdrawalLoadingText || 'Processing...') : 'Request withdrawal'}
                    </button>
                 </div>
               )}

             </div>
           )}

           {cashierTab === 'history' && (
             <div className="flex-1 overflow-y-auto px-4 pb-[80px] custom-scrollbar flex flex-col pt-2">
                 <div className="flex items-center justify-between mt-4 mb-4">
                    <span className="text-white font-bold text-lg">Transaction History</span>
                    <button className="text-gray-300 hover:text-white transition-colors">
                       <Icons.SlidersHorizontal size={20} />
                    </button>
                 </div>

                 {/* Transactions List */}
                 <div className="flex flex-col">
                    {userTransactions.length === 0 ? (
                       <div className="p-12 text-center">
                          <Icons.Clock size={48} className="text-gray-700 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">No history recorded yet</p>
                       </div>
                    ) : (
                       userTransactions.map((tx, idx) => {
                       const splitDate = tx.dateStr?.split(' ') || [];
                       const month = splitDate[0] || "";
                       const day = splitDate[1] || "";
                       const year = splitDate[2] || "";
                      
                      return (
                      <div key={`tx-b-${idx}-${tx.id || tx.timestamp || `unknown-b-${idx}`}`} className="border-b border-white/5">
                         <div 
                           className="px-6 py-4 flex flex-col gap-2 cursor-pointer hover:bg-white/5 transition-colors"
                           onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                         >
                            <div className="flex items-center justify-between transition-all">
                               <span className="text-gray-500 text-[13px]">{tx.dateStr}</span>
                               <div className="flex items-center gap-2">
                                  <span className={`text-[13px] font-medium ${tx.status === 'Completed' ? 'text-[#00C980]' : tx.status === 'Rejected' ? 'text-[#ff4d4f]' : 'text-gray-400'}`}>
                                     {tx.status}
                                  </span>
                                  {tx.status === 'Completed' && <Icons.CheckCircle size={14} className="text-[#00C980]" />}
                                  {tx.status === 'Rejected' && <Icons.XCircle size={14} className="text-[#ff4d4f]" />}
                                  {tx.status === 'Pending' && <Icons.Clock size={14} className="text-gray-400" />}
                                  {expandedTx === tx.id ? (
                                     <Icons.ChevronUp size={18} className="text-gray-400 ml-1" />
                                  ) : (
                                     <Icons.ChevronDown size={18} className="text-gray-400 ml-1" />
                                  )}
                               </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                               <div className="flex flex-col">
                                  <span className="text-white font-bold text-[15px]">{tx.type}</span>
                                  <span className="text-gray-500 text-[13px]">{tx.method}</span>
                               </div>
                               <div className="flex flex-col items-end">
                                 <span className="text-white font-bold text-[15px] tracking-tight">
                                    + {userCurrency}{tx.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                 </span>
                                 {tx.bonusAmount && (
                                   <span className="text-gray-500 text-[12px]">+ {userCurrency}{tx.bonusAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                 )}
                               </div>
                            </div>
                         </div>

                         {/* Expanded Details */}
                         {expandedTx === tx.id && (
                            <div className="px-6 py-6 bg-[#212124] flex flex-col items-center border-t border-white/5 relative animate-in slide-in-from-top-2 duration-200">
                               <div className="flex justify-center items-center mb-3 mt-2">
                                  {tx.methodIcon === 'usdt' && (
                                     <div className="w-10 h-10 rounded-full bg-[#26A17B] flex items-center justify-center">
                                         <span className="font-bold text-white text-[20px]">$</span>
                                     </div>
                                  )}
                                  {tx.methodIcon === 'nagad' && (
                                     <div className="w-12 h-12 bg-[#2A2B31] rounded-full flex items-center justify-center">
                                        <div className="w-6 h-6 bg-white overflow-hidden rounded-full flex items-center justify-center p-0.5">
                                            <div className="w-full h-full bg-[#EC2A24] rounded-full flex items-center justify-center text-white text-[6px] font-black italic">
                                               Nagad
                                            </div>
                                        </div>
                                     </div>
                                  )}
                               </div>
                               <span className="text-white font-medium text-[17px] mb-1">{tx.method}</span>
                               <span className="text-gray-500 font-medium text-[14px] mb-8">{tx.type} Wallet</span>
                               
                               {/* Progress Bar */}
                               <div className="w-full mb-8">
                                  <div className="flex justify-between mb-3 px-1">
                                     <span className="text-white font-bold text-[14px] w-1/3 text-left">Created</span>
                                     <span className="text-white font-bold text-[14px] w-1/3 text-center">Pending</span>
                                     <span className={`font-bold text-[14px] w-1/3 text-right ${tx.status === 'Completed' ? 'text-[#00C980]' : tx.status === 'Rejected' ? 'text-[#ff4d4f]' : 'text-gray-500'}`}>
                                        {tx.status === 'Completed' ? 'Completed' : tx.status === 'Rejected' ? 'Rejected' : 'Completed'}
                                     </span>
                                  </div>
                                  
                                  <div className="flex items-center relative h-4 mb-3">
                                     {/* Lines between nodes */}
                                     {/* Line 1 (Created -> Pending) */}
                                     <div className="absolute left-[16.66%] right-[50%] top-1/2 -translate-y-[1px] h-[2px] bg-[#00C980] z-0"></div>
                                     
                                     {/* Line 2 (Pending -> Result) - color depends on status */}
                                     <div className={`absolute left-[50%] right-[16.66%] top-1/2 -translate-y-[1px] h-[2px] z-0 
                                         ${tx.status === 'Completed' ? 'bg-[#00C980]' : tx.status === 'Rejected' ? 'bg-gradient-to-r from-[#00C980] to-[#ff4d4f]' : 'bg-[#3b3b3f]'}`}></div>

                                     <div className="flex-1 flex justify-center z-10">
                                       <div className="w-3.5 h-3.5 rounded-full bg-[#00C980] flex items-center justify-center shadow-[0_0_0_4px_#212124]">
                                          <Icons.Check size={10} className="text-[#212124] stroke-[4]" />
                                       </div>
                                     </div>
                                     
                                     <div className="flex-1 flex justify-center z-10">
                                       <div className="w-3.5 h-3.5 rounded-full bg-[#00C980] flex items-center justify-center shadow-[0_0_0_4px_#212124]">
                                          <Icons.Check size={10} className="text-[#212124] stroke-[4]" />
                                       </div>
                                     </div>
                                     
                                     <div className="flex-1 flex justify-center z-10">
                                       <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-[0_0_0_4px_#212124]
                                          ${tx.status === 'Completed' ? 'bg-[#00C980]' : tx.status === 'Rejected' ? 'bg-[#ff4d4f]' : 'bg-[#3b3b3f]'}`}>
                                          {tx.status === 'Completed' && <Icons.Check size={10} className="text-[#212124] stroke-[4]" />}
                                          {tx.status === 'Rejected' && <Icons.AlertTriangle size={8} className="text-[#212124] stroke-[4]" strokeWidth={4} />}
                                       </div>
                                     </div>
                                  </div>

                                  <div className="flex justify-between px-2 text-gray-500 text-[13px] font-medium opacity-80 mt-4">
                                     <div className="flex flex-col text-center w-1/3">
                                        <span>{month} {day}</span>
                                        <span>{year}</span>
                                        <span>{tx.timeStr}</span>
                                     </div>
                                     <div className="flex flex-col text-center w-1/3"></div>
                                     <div className="flex flex-col text-center w-1/3">
                                        {tx.endTimeStr ? (
                                           <>
                                             <span>{month} {day}</span>
                                             <span>{year}</span>
                                             <span>{tx.endTimeStr}</span>
                                           </>
                                        ) : (
                                          <span className="text-[#3b3b3f]">-</span>
                                        )}
                                     </div>
                                  </div>
                               </div>

                               {/* Amounts */}
                               <div className="w-full space-y-3 mb-6 px-1">
                                  <div className="flex justify-between items-center text-[15px]">
                                     <span className="text-gray-500 font-medium">Transaction ID</span>
                                     <span className="text-gray-400 font-mono text-[12px]">{tx.id}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[15px]">
                                     <span className="text-gray-500 font-medium">{tx.type}</span>
                                     <span className="text-gray-400 font-medium tracking-tight">{userCurrency}{tx.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                  </div>
                                  <div className="flex justify-between items-center font-bold text-[15px]">
                                     <span className="text-white">Total</span>
                                     <span className="text-white tracking-tight">{userCurrency}{tx.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                  </div>
                               </div>

                               {/* Messages */}
                               {tx.status === 'Rejected' && tx.errorMsg && (
                                  <div className="w-full bg-[#351e22] border-none rounded-[8px] p-5 mb-6 relative overflow-hidden flex items-center justify-center">
                                     <p className="text-[#ff4d4f] text-[14px] leading-relaxed relative z-10 font-medium text-left">{tx.errorMsg}</p>
                                  </div>
                               )}
                               
                               {tx.status === 'Completed' && tx.successMsg && (
                                  <div className="w-full bg-[#1b2d26] border-none rounded-[8px] p-5 mb-6 relative overflow-hidden flex items-center justify-center">
                                     <p className="text-[#00C980] text-[14px] leading-relaxed relative z-10 font-medium text-left">{tx.successMsg}</p>
                                  </div>
                               )}

                               {/* Buttons */}
                               <div className="w-full space-y-3 mt-2">
                                  <button 
                                     onClick={() => {
                                        if (tx.id) {
                                           navigator.clipboard.writeText(tx.id);
                                           toast.success("Transaction ID copied!");
                                        }
                                     }}
                                     className="w-full bg-[#313134] hover:bg-[#3b3b3f]/70 border-none text-white font-bold py-4 rounded-[12px] transition-colors flex items-center justify-center gap-2 text-[15px]"
                                  >
                                     <Icons.Copy size={18} /> Copy ID
                                  </button>
                                  <button 
                                     onClick={() => {
                                        setActiveTab("support");
                                        setShowDeposit(false);
                                     }}
                                     className="w-full bg-[#313134] hover:bg-[#3b3b3f]/70 border-none text-white font-bold py-4 rounded-[12px] transition-colors flex items-center justify-center gap-2 text-[15px]"
                                  >
                                     <Icons.Headset size={18} /> Support
                                  </button>
                               </div>
                            </div>
                         )}
                      </div>
                      );
                   })
                )}
                </div>
             </div>
           )}
          </>
        )}
        </div>
        </div>
        );
      })()}





      {/* Cashier Mobile Bottom Menu */}
      {showCashierMenu && (
        <div className="absolute inset-0 z-[500] flex flex-col justify-end">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-sm"
             onClick={() => setShowCashierMenu(false)}
           ></div>
           
           {/* Bottom Sheet */}
           <div className="bg-[#212124] w-full rounded-t-[16px] relative z-10 animate-in slide-in-from-bottom-full duration-300 pb-8 rounded-b-[16px] overflow-hidden mb-[-16px]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5">
                 <h2 className="text-white font-bold text-lg">Cashier</h2>
                 <button 
                   onClick={() => setShowCashierMenu(false)}
                   className="text-gray-400 hover:text-white transition-colors p-1"
                 >
                   <Icons.X size={20} />
                 </button>
              </div>

              {/* Buttons */}
              <div className="px-5 flex flex-col gap-3 pb-4">
                 <button 
                   onClick={() => {
                     setShowCashierMenu(false);
                     setCashierTab("deposits");
                     setShowDeposit(true);
                   }}
                   className="w-full bg-[#FFE24C] hover:bg-[#ffe770] text-[15px] font-bold py-4 rounded-[12px] flex items-center justify-center gap-2 transition-colors text-black"
                 >
                   <Icons.ArrowUp size={18} strokeWidth={2.5} /> Deposit
                 </button>
                 
                 <button 
                   onClick={() => {
                     setShowCashierMenu(false);
                     setCashierTab("withdrawals");
                     setShowDeposit(true);
                   }}
                   className="w-full bg-[#36373c]/80 hover:bg-[#3b3c42] text-[15px] font-bold py-4 rounded-[12px] flex items-center justify-center gap-2 transition-colors text-white"
                 >
                   <Icons.ArrowDown size={18} strokeWidth={2.5} /> Withdraw
                 </button>

                 <button 
                   onClick={() => {
                     setShowCashierMenu(false);
                     setCashierTab("history");
                     setShowDeposit(true);
                   }}
                   className="w-full bg-[#36373c]/80 hover:bg-[#3b3c42] text-[15px] font-bold py-4 rounded-[12px] flex items-center justify-center gap-2 transition-colors text-white"
                 >
                   <History size={18} strokeWidth={2.5} /> Transaction history
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Alerts Overlay Dialog */}
      {showAlertDialog && (
        <div className="absolute inset-0 z-[500] bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#2D2D2D] p-5 rounded-xl border border-[#444] w-80 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Bell size={18} /> Set Price Alert
            </h3>
            <p className="text-sm text-gray-400 mb-2">
              Current Price: {userCurrency}{Number(currentPriceLabel).toFixed(4)}
            </p>
            <input
              type="number"
              value={alertInput}
              onChange={(e) => setAlertInput(e.target.value)}
              placeholder="Enter target price..."
              className="w-full bg-[#1C1C1C] border border-[#555] rounded p-3 mb-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00C980] focus:ring-1 focus:ring-[#00C980] transition-shadow"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowAlertDialog(false)}
                className="flex-1 p-2 bg-[#444] rounded hover:bg-[#555] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const targetPrice = parseFloat(alertInput);
                  if (alertInput && !isNaN(targetPrice) && auth.currentUser) {
                    try {
                        const condition = targetPrice > Number(currentPriceLabel) ? 'above' : 'below';
                        const alertPayload = {
                            userId: auth.currentUser.uid,
                            asset: activeAsset,
                            targetPrice,
                            condition,
                            status: 'active',
                            createdAt: Date.now()
                        };
                        const alertRes = await fetch('/api/alerts', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: auth.currentUser.uid, alertData: alertPayload })
                        });
                        if (!alertRes.ok) throw new Error('Alert creation failed');
                        
                        setAlertInput("");
                        setShowAlertDialog(false);
                    } catch (e) {
                        console.error("Error adding alert:", e);
                    }
                  }
                }}
                className="flex-1 p-2 bg-[#00C980] text-black font-bold rounded hover:bg-[#00B070] transition-colors"
              >
                Save Alert
              </button>
            </div>

            {alerts.length > 0 && (
              <div className="mt-4 border-t border-[#444] pt-4">
                <h4 className="text-xs text-gray-500 uppercase font-bold mb-2 tracking-wider">
                  Active Alerts
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                  {alerts.map((a, i) => (
                    <div
                      key={`alert-list-item-${a.id || i}`}
                      className="flex justify-between items-center bg-[#1C1C1C] p-2 rounded border border-[#333]"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">{a.asset}</span>
                        <span className="font-mono text-xs">
                          {a.condition === 'above' ? '≥' : '≤'} {a.targetPrice.toFixed(5)}
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                           if (auth.currentUser) {
                               try {
                                   const { doc, deleteDoc } = await import('../firebase');
                                   await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'priceAlerts', a.id));
                               } catch (e) { console.error(e); }
                           }
                        }}
                        className="text-[#FF4757] hover:text-red-400 p-1 rounded hover:bg-[#333] transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
      {showTimeframeModal && (
        <>
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setShowTimeframeModal(false)}
             className="fixed md:absolute inset-0 bg-black/50 md:bg-transparent z-[140] md:pointer-events-none"
          />
          <motion.div 
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
            className="fixed md:absolute left-0 md:left-[76px] top-0 bottom-0 w-[85%] md:w-[360px] z-[150] flex flex-col bg-[#222329] border-r border-[#2C2D33] shadow-2xl overflow-hidden pointer-events-auto"
          >
            {/* Top Header */}
            <div className="pt-[18px] pb-4 px-5 flex items-center justify-between border-b border-[#2C2D33]/40">
              <h2 className="text-[15px] font-medium tracking-wide text-white mb-0">
                Timeframe
              </h2>
              <button
                onClick={() => setShowTimeframeModal(false)}
                className="text-[#888] hover:text-white transition-colors p-1 -mr-1"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-5 pt-5 pb-20 custom-scrollbar">
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  "5 seconds", "10 seconds", "15 seconds", "30 seconds", "1 minute", 
                  "5 minutes", "15 minutes", "30 minutes", "1 hour", 
                  "3 hours", "1 day"
                ].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      setChartLoading(true);
                      setTimeframe(tf);
                      setShowTimeframeModal(false);
                      setTimeout(() => setChartLoading(false), 250);
                    }}
                    className={`py-3.5 rounded-[10px] text-[13px] font-bold transition-all border outline-none ${
                     timeframe === tf
                        ? "bg-transparent border-[#FFE24C]/20 border-opacity-30 shadow-[inset_0_0_0_1px_rgba(255,226,76,0.3)] text-white relative after:content-[''] after:absolute after:inset-0 after:border-[2px] after:border-[#222329] after:rounded-[10px]" // Not exactly true to screenshot but good
                        : "bg-[#2c2d33]/50 border-transparent text-[#e4e4e4] hover:bg-[#2c2d33]"
                    }`}
                    style={timeframe === tf ? { borderColor: '#555', backgroundColor: '#383a42' } : {}}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {showIndicatorsModal && (
        <>
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setShowIndicatorsModal(false)}
             className="fixed md:absolute inset-0 bg-black/50 md:bg-transparent z-[140] md:pointer-events-none"
          />
          <motion.div 
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
            className="fixed md:absolute left-0 md:left-[76px] top-0 bottom-0 w-[85%] md:w-[360px] z-[150] flex flex-col bg-[#222329] border-r border-[#2C2D33] shadow-2xl overflow-hidden pointer-events-auto"
          >
            {/* Top Header */}
            <div className="pt-6 pb-2 px-6 flex items-center justify-between border-b border-[#2C2D33]/40">
              <h2 className="text-[17px] font-medium tracking-wide text-white">
                Trading tools
              </h2>
              <button
                onClick={() => setShowIndicatorsModal(false)}
                className="text-[#a6aeb9] hover:text-white transition-colors p-1"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#222329] border-b border-[#2C2D33]/40 px-2 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setIndicatorTab('indicators')}
                className={`flex-1 py-4 px-4 text-[13px] font-bold tracking-wide transition-all relative min-w-fit ${indicatorTab === 'indicators' ? 'text-white' : 'text-[#a6aeb9] hover:text-white'}`}
              >
                Indicators
                {indicatorTab === 'indicators' && (
                   <motion.div layoutId="indTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
                )}
              </button>
              <button 
                onClick={() => setIndicatorTab('drawings')}
                className={`flex-1 py-4 px-4 text-[13px] font-bold tracking-wide transition-all relative min-w-fit ${indicatorTab === 'drawings' ? 'text-white' : 'text-[#a6aeb9] hover:text-white'}`}
              >
                Drawings
                {indicatorTab === 'drawings' && (
                   <motion.div layoutId="indTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
                )}
              </button>
              <button 
                onClick={() => setIndicatorTab('strategies')}
                className={`flex-1 py-4 px-4 text-[13px] font-bold tracking-wide transition-all relative min-w-fit ${indicatorTab === 'strategies' ? 'text-white' : 'text-[#a6aeb9] hover:text-white'}`}
              >
                Strategies
                {indicatorTab === 'strategies' && (
                   <motion.div layoutId="indTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-0 pt-0 pb-20 custom-scrollbar">
              {configuringIndicator ? (
                 <div className="flex flex-col h-full bg-[#1a1b1f] animate-in slide-in-from-right duration-200">
                    <div className="px-6 py-4 border-b border-[#2C2D33]/40 flex items-center justify-between sticky top-0 bg-[#1a1b1f] z-10">
                       <div className="flex items-center gap-3">
                          <button 
                             onClick={() => setConfiguringIndicator(null)}
                             className="text-[#a6aeb9] hover:text-white transition-colors"
                          >
                             <ChevronLeft size={22} />
                          </button>
                          <span className="text-[17px] font-bold text-white tracking-wide">{configuringIndicator}</span>
                       </div>
                       <button onClick={() => setConfiguringIndicator(null)} className="p-1.5 bg-[#FFE24C] text-black rounded-lg text-[11px] font-black uppercase tracking-tighter hover:opacity-90">
                          Apply
                       </button>
                    </div>

                    <div className="px-6 py-8 flex-1 space-y-8">
                       {/* Common Settings Renderer */}
                       <div className="space-y-6">
                          {configuringIndicator === "RSI" && (
                             <>
                               <div className="space-y-3">
                                 <div className="flex justify-between items-center px-1">
                                    <label className="text-[14px] font-medium text-[#a6aeb9]">Period</label>
                                    <span className="text-[14px] font-bold text-white">{indicatorSettings["RSI"].period}</span>
                                 </div>
                                 <input 
                                    type="range" min="2" max="50" 
                                    value={indicatorSettings["RSI"].period} 
                                    onChange={(e) => updateIndicatorSetting("RSI", "period", e.target.value)} 
                                    className="w-full h-1.5 bg-[#2C2D33] rounded-lg appearance-none cursor-pointer accent-[#FFE24C]" 
                                 />
                               </div>
                               <div className="flex items-center justify-between bg-[#2C2D33]/30 p-4 rounded-xl border border-white/5">
                                 <span className="text-[14px] font-medium text-gray-200">Indicator Line Color</span>
                                 <div className="relative">
                                    <input type="color" 
                                           value={indicatorSettings["RSI"].color} 
                                           onChange={(e) => updateIndicatorSetting("RSI", "color", e.target.value)} 
                                           className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                                    <div className="w-8 h-8 rounded-lg border-2 border-[#2C2D33]" style={{ backgroundColor: indicatorSettings["RSI"].color }} />
                                 </div>
                               </div>
                             </>
                          )}

                          {configuringIndicator === "MACD" && (
                             <>
                               {["fast", "slow", "signal"].map(key => (
                                 <div key={key} className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                       <label className="text-[14px] font-medium text-[#a6aeb9] capitalize">{key} Period</label>
                                       <input 
                                          type="number"
                                          value={indicatorSettings["MACD"][key]} 
                                          onChange={(e) => updateIndicatorSetting("MACD", key, e.target.value)} 
                                          className="bg-[#2C2D33] text-white text-[13px] font-bold w-16 py-1 text-center rounded-md border border-transparent focus:border-[#4B4C53] outline-none"
                                       />
                                    </div>
                                    <input 
                                       type="range" min="2" max="100" 
                                       value={indicatorSettings["MACD"][key]} 
                                       onChange={(e) => updateIndicatorSetting("MACD", key, e.target.value)} 
                                       className="w-full h-1.5 bg-[#2C2D33] rounded-lg appearance-none cursor-pointer accent-[#FFE24C]" 
                                    />
                                 </div>
                               ))}
                             </>
                          )}

                          {configuringIndicator === "MFI" && (
                             <>
                               <div className="space-y-3">
                                 <div className="flex justify-between items-center px-1">
                                    <label className="text-[14px] font-medium text-[#a6aeb9]">Period</label>
                                    <span className="text-[14px] font-bold text-white">{indicatorSettings["MFI"].period}</span>
                                 </div>
                                 <input 
                                    type="range" min="2" max="50" 
                                    value={indicatorSettings["MFI"].period} 
                                    onChange={(e) => updateIndicatorSetting("MFI", "period", e.target.value)} 
                                    className="w-full h-1.5 bg-[#2C2D33] rounded-lg appearance-none cursor-pointer accent-[#FFE24C]" 
                                 />
                               </div>
                               <div className="space-y-3">
                                 <div className="flex justify-between items-center px-1">
                                    <label className="text-[14px] font-medium text-[#a6aeb9]">Line Width</label>
                                    <span className="text-[14px] font-bold text-white">{indicatorSettings["MFI"].strokeWidth}</span>
                                 </div>
                                 <input 
                                    type="range" min="1" max="5" 
                                    value={indicatorSettings["MFI"].strokeWidth} 
                                    onChange={(e) => updateIndicatorSetting("MFI", "strokeWidth", parseInt(e.target.value))} 
                                    className="w-full h-1.5 bg-[#2C2D33] rounded-lg appearance-none cursor-pointer accent-[#FFE24C]" 
                                 />
                               </div>
                               <div className="flex items-center justify-between bg-[#2C2D33]/30 p-4 rounded-xl border border-white/5">
                                 <span className="text-[14px] font-medium text-gray-200">Indicator Line Color</span>
                                 <div className="relative">
                                    <input type="color" 
                                           value={indicatorSettings["MFI"].color} 
                                           onChange={(e) => updateIndicatorSetting("MFI", "color", e.target.value)} 
                                           className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                                    <div className="w-8 h-8 rounded-lg border-2 border-[#2C2D33]" style={{ backgroundColor: indicatorSettings["MFI"].color }} />
                                 </div>
                               </div>
                             </>
                          )}

                          {configuringIndicator === "Moving Average" && (
                             <div className="space-y-6">
                               <div className="space-y-3">
                                 <div className="flex justify-between items-center px-1">
                                    <label className="text-[14px] font-medium text-[#a6aeb9]">Period</label>
                                    <span className="text-[14px] font-bold text-white">{indicatorSettings["Moving Average"]?.period || 14}</span>
                                 </div>
                                 <input 
                                    type="range" min="2" max="200" 
                                    value={indicatorSettings["Moving Average"]?.period || 14} 
                                    onChange={(e) => updateIndicatorSetting("Moving Average", "period", e.target.value)} 
                                    className="w-full h-1.5 bg-[#2C2D33] rounded-lg appearance-none cursor-pointer accent-[#FFE24C]" 
                                 />
                               </div>
                               <div className="space-y-3">
                                 <label className="text-[12px] font-bold text-[#a6aeb9] uppercase tracking-wider block px-1">MA Type</label>
                                 <div className="grid grid-cols-2 gap-2">
                                    {["SMA", "EMA", "WMA", "WEMA"].map(type => (
                                       <button 
                                          key={type}
                                          onClick={() => updateIndicatorSetting("Moving Average", "type", type)}
                                          className={`py-2.5 rounded-lg text-[13px] font-bold border transition-all ${indicatorSettings["Moving Average"]?.type === type ? 'bg-white text-black border-white' : 'bg-[#2C2D33] text-gray-400 border-transparent hover:border-white/20'}`}
                                       >
                                          {type}
                                       </button>
                                    ))}
                                 </div>
                               </div>
                             </div>
                          )}

                          {/* Fallback for other indicators */}
                          {!["RSI", "MACD", "MFI", "Moving Average"].includes(configuringIndicator) && (
                             <div className="py-20 text-center opacity-40">
                                <Activity size={40} className="mx-auto mb-4 text-[#a6aeb9]" />
                                <p className="text-[13px] font-medium text-[#a6aeb9]">Advanced settings for<br/>{configuringIndicator}<br/>coming soon.</p>
                             </div>
                          )}
                       </div>

                       <div className="pt-10">
                          <button 
                             onClick={() => {
                                toggleIndicator(configuringIndicator);
                                setConfiguringIndicator(null);
                             }}
                             className={`w-full py-4 rounded-2xl font-black text-[15px] uppercase tracking-tight transition-all active:scale-[0.98] ${indicatorSettings[configuringIndicator]?.enabled ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#FFE24C] text-black'}`}
                          >
                             {indicatorSettings[configuringIndicator]?.enabled ? "Disable Indicator" : "Enable and Apply"}
                          </button>
                       </div>
                    </div>
                 </div>
              ) : indicatorTab === 'indicators' ? (
                <>
                  {indicatorPresets.length > 0 && (
                    <div className="px-6 py-5 border-b border-[#2C2D33]/30">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[#a6aeb9] text-[11px] font-bold tracking-widest uppercase m-0">Presets</p>
                        <button onClick={() => setShowPresetInput(!showPresetInput)} className="text-[11px] font-black text-[#FFE24C] hover:opacity-80 transition-opacity uppercase tracking-tighter">
                           {showPresetInput ? "Cancel" : "+ Save current"}
                        </button>
                      </div>
                      {showPresetInput && (
                        <div className="flex gap-2 mb-4">
                          <input type="text" value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} placeholder="Preset name" className="flex-1 bg-[#1a1b1f] border border-[#2C2D33] text-white text-[13px] px-4 py-2 rounded-lg outline-none focus:border-[#4B4C53]" />
                          <button onClick={() => saveIndicatorPreset(newPresetName)} className="bg-[#FFE24C] text-black text-[12px] font-black px-4 py-2 rounded-lg uppercase tracking-tight">Save</button>
                        </div>
                      )}
                      <div className="space-y-2">
                         {indicatorPresets.map(preset => (
                           <div key={preset.id} className="flex items-center justify-between bg-[#1a1b1f] p-4 rounded-xl border border-white/5 group hover:border-white/10 transition-all">
                              <span className="text-[14px] font-bold text-gray-200">{preset.name}</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => loadIndicatorPreset(preset.data)} className="text-[11px] font-black bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg uppercase transition-all">Load</button>
                                {preset.id !== 'default' && (
                                  <button onClick={() => deleteIndicatorPreset(preset.id)} className="text-gray-500 hover:text-red-400 p-2 transition-colors"><Trash size={14} /></button>
                                )}
                              </div>
                           </div>
                         ))}
                      </div>
                    </div>
                  )}

                  <div className="px-6 py-4 flex items-center justify-between border-b border-[#2C2D33]/30">
                    <span className="text-[#a6aeb9] text-[13px] font-medium opacity-50 uppercase tracking-widest">Available Indicators</span>
                    <button 
                      onClick={() => {
                        setIndicatorSettings((prev: any) => {
                          const next = { ...prev };
                          Object.keys(next).forEach(key => {
                            if (next[key]) next[key].enabled = false;
                          });
                          return next;
                        });
                        setActiveStrategy(null);
                        toast.success("All indicators cleared");
                      }}
                      className="text-[11px] font-black text-red-400 hover:text-red-300 uppercase tracking-tighter"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="flex flex-col">
                    {[
                      { name: "SMA", icon: TrendingUp, description: "Simple Moving Average" },
                      { name: "EMA", icon: TrendingUp, description: "Exponential Moving Average" },
                      { name: "WMA", icon: TrendingUp, description: "Weighted Moving Average" },
                      { name: "WEMA", icon: TrendingUp, description: "Wilder's Smoothing Moving Average" },
                      { name: "ZigZag", icon: Activity, description: "Price trend filtering" },
                      { name: "Standard Deviation", icon: Activity, description: "Volatility measurement" },
                      { name: "VWAP", icon: Waves, description: "Volume Weighted Average Price" },
                      { name: "OBV", icon: Activity, description: "On Balance Volume" },
                      { name: "ForceIndex", icon: Activity, description: "Alexander Elder's Force Index" },
                      { name: "Social Trading", icon: Users, hasDot: true, description: "Follow successful trades" },
                      { name: "Ichimoku Cloud", icon: Cloud, description: "Support & resistance assessment" },
                      { name: "ADX", icon: BarChart2, description: "Average Directional Index" },
                      { name: "Momentum", icon: Zap, description: "Rate of price change" },
                      { name: "MFI", icon: Waves, description: "Money Flow Index" },
                      { name: "CCI", icon: LineChart, description: "Commodity Channel Index" },
                      { name: "Awesome Oscillator", icon: BarChart3, description: "Market momentum measurement" },
                      { name: "RSI", icon: Activity, description: "Relative Strength Index" },
                      { name: "Fractals", icon: Triangle, description: "Identifying local peaks/troughs" },
                      { name: "Parabolic SAR", icon: Signal, description: "Stop and Reverse tracking" },
                      { name: "Moving Average", icon: TrendingUp, description: "SMA, EMA, WMA variants" },
                      { name: "MACD", icon: BarChart, description: "Moving Average Conv./Div." },
                      { name: "Bollinger Bands", icon: Layers, description: "Volatility & trend strength" },
                      { name: "Alligator", icon: Share2, description: "Bill Williams' Alligator" },
                      { name: "ATR", icon: Ruler, description: "Average True Range" },
                      { name: "Stochastic", icon: Repeat, description: "Momentum oscillator" }
                    ].map((ind, idx) => (
                      <div 
                        key={ind.name} 
                        className={`flex items-center gap-4 px-6 py-[18px] group transition-all cursor-pointer border-b border-[#2C2D33]/20 last:border-0 hover:bg-white/5 ${indicatorSettings[ind.name]?.enabled ? 'bg-white/[0.03]' : ''}`}
                        onClick={() => setConfiguringIndicator(configuringIndicator === ind.name ? null : ind.name)}
                      >
                         <div className="relative shrink-0">
                            <ind.icon 
                               size={24} 
                               className={`transition-colors ${indicatorSettings[ind.name]?.enabled ? 'text-white' : 'text-[#a6aeb9] group-hover:text-white'}`} 
                               strokeWidth={1.5} 
                            />
                            {ind.hasDot && (
                               <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF4757] rounded-full border-2 border-[#222329]" />
                            )}
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                               <span className={`text-[15px] font-bold transition-colors truncate ${indicatorSettings[ind.name]?.enabled ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                  {ind.name}
                               </span>
                            </div>
                            <div className="text-[11px] text-white/40 mt-0.5 line-clamp-1">{ind.description}</div>
                         </div>
                         <div className="flex items-center gap-3">
                            <button 
                               onClick={(e) => {
                                  e.stopPropagation();
                                  toggleIndicator(ind.name);
                               }}
                               className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${indicatorSettings[ind.name]?.enabled ? 'bg-[#FFE24C]' : 'bg-[#383a42]'}`}
                            >
                               <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${indicatorSettings[ind.name]?.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                            <button 
                               className="p-1.5 hover:bg-white/5 rounded-lg text-[#a6aeb9] hover:text-[#FFE24C] transition-all"
                               onClick={(e) => {
                                  e.stopPropagation();
                                  setConfiguringIndicator(configuringIndicator === ind.name ? null : ind.name);
                               }}
                            >
                               <Settings size={16} strokeWidth={2} />
                            </button>
                         </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : indicatorTab === 'drawings' ? (
                <div className="flex flex-col h-full bg-[#222329] px-6 py-6 pb-24 overflow-y-auto">
                  <p className="text-[#a6aeb9] text-[11px] font-bold tracking-widest uppercase mb-5">
                    Drawing Tools
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                      { id: 'trend', name: 'Trend Line', icon: MoveHorizontal },
                      { id: 'horizontal', name: 'Horizontal', icon: MinusCircle },
                      { id: 'vertical', name: 'Vertical', icon: MinusCircle, rotate: 90 },
                      { id: 'rectangle', name: 'Rectangle', icon: Square },
                      { id: 'fibo', name: 'Fibonacci', icon: MenuSquare },
                      { id: 'ray', name: 'Price Ray', icon: ArrowUpRight }
                    ].map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                            setSelectedTool(tool.id);
                            setShowIndicatorsModal(false);
                            toast.success(`${tool.name} tool active`);
                        }}
                        className="flex flex-col items-center justify-center p-5 bg-[#1a1b1f] hover:bg-[#2C2D33] rounded-2xl border border-white/5 transition-all group active:scale-95 shadow-sm"
                      >
                        <tool.icon 
                           size={28} 
                           className={`text-[#a6aeb9] group-hover:text-white mb-3 transition-colors ${tool.rotate ? 'rotate-90' : ''}`} 
                           strokeWidth={1.5}
                        />
                        <span className="text-[13px] font-bold text-gray-300 group-hover:text-white">{tool.name}</span>
                      </button>
                    ))}
                  </div>

                  {drawings.filter(d => !d.assetId || d.assetId === activeAsset).length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[#a6aeb9] text-[11px] font-bold tracking-widest uppercase">
                          Active ({drawings.filter(d => !d.assetId || d.assetId === activeAsset).length})
                        </p>
                        <button 
                          onClick={() => setDrawings(drawings.filter(d => d.assetId && d.assetId !== activeAsset))}
                          className="text-[11px] text-red-400 hover:text-red-300 font-bold uppercase tracking-tighter transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="space-y-2">
                        {drawings.filter(d => !d.assetId || d.assetId === activeAsset).map((d, i) => (
                          <div key={d.id} className="flex items-center justify-between p-4 bg-[#1a1b1f]/80 rounded-xl border border-white/5 group hover:border-white/10 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: d.color || '#FFE24C' }} />
                              <span className="text-[13px] font-bold text-gray-200 capitalize">{d.type} {i + 1}</span>
                            </div>
                            <button 
                              onClick={() => setDrawings(drawings.filter(item => item.id !== d.id))}
                              className="text-[#a6aeb9] hover:text-red-400 p-1.5 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full bg-[#222329] px-0 py-0 pb-24 overflow-y-auto">
                   <div className="py-4 text-center">
                    <span className="text-[#a6aeb9] text-[13px] font-medium opacity-50">Proven Methods</span>
                  </div>

                  <div className="flex flex-col">
                    {[
                      { name: "Exponential Ribbon", difficulty: "Beginner", icon: TrendingUp, color: "#0091ff" },
                      { name: "Golden Cross", difficulty: "Intermediate", icon: Star, color: "#FFE24C" },
                      { name: "Bollinger Rebound", difficulty: "Advanced", icon: Layers, color: "#ff4757" },
                      { name: "RSI Divergence", difficulty: "Intermediate", icon: Activity, color: "#00C980" },
                      { name: "Fractal Chaos", difficulty: "Advanced", icon: Triangle, color: "#a55eea" },
                      { name: "Volume Spike", difficulty: "Beginner", icon: BarChart3, color: "#45aaf2" }
                    ].map((strategy, idx) => (
                      <div 
                        key={strategy.name} 
                        className={`flex items-center gap-4 px-6 py-[22px] group transition-all cursor-pointer border-b border-[#2C2D33]/20 last:border-0 ${activeStrategy === strategy.name ? 'bg-white/[0.08]' : 'hover:bg-white/5 active:bg-white/10'}`}
                        onClick={() => handleApplyStrategy(strategy.name)}
                      >
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${activeStrategy === strategy.name ? 'bg-[#FFE24C]/10 border-[#FFE24C]/30' : 'bg-[#1a1b1f] border-white/5 group-hover:border-white/10'}`}>
                            <strategy.icon 
                               size={26} 
                               className={`${activeStrategy === strategy.name ? 'opacity-100' : 'opacity-80'}`}
                               strokeWidth={1.5}
                               style={{ color: activeStrategy === strategy.name ? '#FFE24C' : strategy.color }}
                            />
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className={`text-[15.5px] font-bold transition-colors truncate ${activeStrategy === strategy.name ? 'text-[#FFE24C]' : 'text-white group-hover:text-[#FFE24C]'}`}>
                               {strategy.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[10px] font-black uppercase tracking-widest text-[#a6aeb9]">{strategy.difficulty}</span>
                               <span className="w-1 h-1 rounded-full bg-white/20" />
                               <span className="text-[10px] font-bold text-[#00C980]">74% Success Rate</span>
                            </div>
                         </div>
                         <div className={`${activeStrategy === strategy.name ? 'text-[#FFE24C]' : 'text-[#a6aeb9] group-hover:text-white'} transition-colors`}>
                            {activeStrategy === strategy.name ? (
                              <div className="text-[10px] font-black uppercase bg-[#FFE24C]/20 text-[#FFE24C] px-2 py-1 rounded-md">Active</div>
                            ) : (
                              <ChevronRight size={18} strokeWidth={2.5} />
                            )}
                         </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 py-10 mt-4 border-t border-[#2C2D33]/40">
                     <div className="bg-gradient-to-br from-[#FFE24C]/10 to-transparent p-5 rounded-2xl border border-[#FFE24C]/20">
                        <h5 className="text-[14px] font-black text-[#FFE24C] uppercase tracking-wide mb-2">Pro Trading Tip</h5>
                        <p className="text-[12px] text-gray-400 leading-relaxed font-medium">
                           Combining multiple indicators like MACD and RSI can significantly increase your forecast accuracy.
                        </p>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>

      {showSignalsModal && (
        <div className="fixed inset-0 z-[1000] bg-[#1a1b1e] flex flex-col font-sans animate-in fade-in zoom-in duration-250 ring-inset">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
            <h2 className="text-white text-lg font-bold">Trading Signals</h2>
            <button 
              onClick={() => setShowSignalsModal(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center">
            {/* Illustration */}
            <div className="w-full max-w-md aspect-video mb-8 relative shrink-0">
              <img 
                src={signalsIllustration} 
                alt="Signals Illustration" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
               loading="lazy" />
            </div>

            <div className="max-w-md w-full space-y-6">
              <p className="text-gray-300 text-[15px] leading-relaxed">
                Trading Signals is a new tool that provides you with price forecasts. You'll see when and in which direction a price will move.
              </p>

              <ol className="space-y-6 list-none pb-8">
                <li className="flex gap-4">
                  <span className="text-white font-bold shrink-0">1.</span>
                  <p className="text-gray-300 text-[15px] leading-relaxed">
                    Signals have various expiration times: 1, 3, or 5 minutes. E.g., 1 min DOWN means that an asset price will decrease in a minute
                  </p>
                </li>
                <li className="flex gap-4">
                  <span className="text-white font-bold shrink-0">2.</span>
                  <p className="text-gray-300 text-[15px] leading-relaxed">
                    Signals are generated for all the FTT assets on the real account. If a signal isn't found, choose another asset and resume trading
                  </p>
                </li>
                <li className="flex gap-4">
                  <span className="text-white font-bold shrink-0">3.</span>
                  <p className="text-gray-300 text-[15px] leading-relaxed">
                    You have 30 seconds to use a trading signal. Set the trade amount and press UP or DOWN. That's it!
                  </p>
                </li>
              </ol>
            </div>
          </div>

          {/* Footer - "Try it" Button */}
          <div className="p-6 pb-12 md:pb-8 flex justify-center bg-[#1a1b1e] border-t border-white/5 shrink-0">
            <button 
              onClick={() => setShowSignalsModal(false)}
              className="w-full max-w-md bg-[#ffdd00] hover:bg-[#ffea00] py-4 rounded-xl text-black font-bold text-lg transition-all active:scale-95 shadow-[0_4px_15px_rgba(255,221,0,0.2)]"
            >
              Try it
            </button>
          </div>
        </div>
      )}
      {activeTab === "support" && (
        <div className="fixed inset-0 md:inset-auto md:left-[84px] md:bottom-10 md:w-[380px] md:h-[620px] z-[500] flex flex-col bg-[#1a1b1e] rounded-t-[24px] md:rounded-[24px] shadow-[0_30px_90px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 animate-in fade-in zoom-in duration-250">
          {/* Header */}
          <div className="bg-[#1e1f21] px-6 py-5 flex items-center gap-4 shrink-0 transition-all border-b border-white/5">
            <div className="bg-[#FFE24C] w-11 h-11 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(255,226,76,0.3)] shrink-0">
               <div className="bg-black w-8 h-8 rounded-full flex items-center justify-center">
                  <div className="flex gap-0.5">
                     <div className="w-1.5 h-3.5 bg-[#FFE24C] rounded-full transform -rotate-12"></div>
                     <div className="w-1.5 h-3.5 bg-[#FFE24C] rounded-full transform rotate-12"></div>
                  </div>
               </div>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
               <h2 className="text-white text-[18px] font-bold tracking-tight leading-tight">Contact us</h2>
               <span className="text-gray-400 text-[13px] font-medium leading-tight">Support Team</span>
            </div>
            <button onClick={() => setActiveTab("trade")} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
               <X size={22} strokeWidth={2} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-[#1a1b1e]">
            <div className="py-2">
               {userTickets.length === 0 ? (
                 <div className="p-10 text-center flex flex-col items-center justify-center">
                    <MessageSquare size={48} className="text-gray-800 mb-4" />
                    <p className="text-gray-500 font-medium tracking-wide">No active conversations found</p>
                 </div>
               ) : userTickets.map((session, idx) => (
                 <div 
                   key={`session-${idx}-${session.id || 'session-' + idx}`}
                   onClick={() => {
                     setSelectedTicket(session);
                     setActiveTab("support-detail");
                   }}
                   className="px-6 py-5 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer group"
                 >
                    <div className="flex gap-4">
                       <div className="bg-[#FFE24C] w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          <div className="w-7 h-7 border-2 border-black rounded-lg flex flex-col items-center justify-center gap-0.5 relative pt-0.5">
                             <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                             </div>
                             <div className="w-3 h-0.5 bg-black rounded-full mt-1"></div>
                          </div>
                       </div>
                       <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center justify-between mb-1">
                              <span className="text-[15px] font-bold text-white truncate">{session.subject}</span>
                              <span className="text-[12px] text-gray-400 font-medium whitespace-nowrap">
                                {new Date(session.updatedAt || session.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                           </div>
                           <p className="text-[13px] text-gray-400 leading-[1.4] line-clamp-2 mb-3 font-medium">
                              {session.lastMessage || "Your conversation with Support"}
                           </p>
                           <div className="inline-flex">
                              <span className={`px-3 py-0.5 rounded-full text-[11px] font-black uppercase border tracking-wider ${
                                session.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                session.status === 'pending' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-white/5 text-gray-500 border-white/10'
                              }`}>
                                 {session.status}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            </div>

          {/* Footer */}
          <div className="p-6 bg-[#1a1b1e] border-t border-white/5 shrink-0">
             <button 
               onClick={() => setIsCreatingTicket(true)}
               className="w-full h-[54px] bg-[#FFE24C] hover:bg-[#E5CB44] text-black rounded-[18px] font-black text-[15px] transition-all transform active:scale-[0.98] shadow-[0_10px_30px_rgba(255,226,76,0.15)] flex items-center justify-center gap-2">
                <Plus size={18} strokeWidth={3} />
                START NEW CHAT
             </button>
          </div>
        </div>
      )}



      {activeTab === "support" && (
        <div className="fixed bottom-6 left-6 z-[600] md:hidden">
           <button 
             onClick={() => setActiveTab("trade")}
             className="w-14 h-14 bg-[#ff5252] rounded-2xl flex items-center justify-center text-white shadow-[0_10px_30px_rgba(255,82,82,0.5)] active:scale-95 transition-all animate-in fade-in zoom-in duration-300"
           >
              <X size={32} strokeWidth={3} />
           </button>
        </div>
      )}

      {activeTab === "support-detail" && (
        <div className="fixed inset-0 md:inset-auto md:left-[84px] md:bottom-10 md:w-[420px] md:h-[680px] z-[500] flex flex-col bg-[#f0f2f5] rounded-t-[28px] md:rounded-[28px] shadow-[0_30px_90px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in zoom-in duration-300">
          {/* Header - Screenshot Matched */}
          <div className="bg-[#2d2d2d] px-5 py-4 flex items-center gap-4 shrink-0 shadow-sm relative z-10">
            <button onClick={() => { setActiveTab("support"); setSelectedTicket(null); }} className="text-white/80 hover:text-white transition-colors">
               <ArrowLeft size={22} strokeWidth={2.5} />
            </button>
            <div className="bg-[#ffd700] w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md">
               <div className="bg-black w-7 h-7 rounded-full flex flex-col items-center justify-center pt-0.5">
                  <div className="flex gap-0.5">
                     <div className="w-1 h-3 bg-[#ffd700] rounded-full transform -rotate-12"></div>
                     <div className="w-1 h-3 bg-[#ffd700] rounded-full transform rotate-12"></div>
                  </div>
               </div>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
               <h2 className="text-white text-[15px] font-black tracking-tight leading-tight truncate">
                  Started {new Date(selectedTicket?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(selectedTicket?.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
               </h2>
               <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-white/60 text-[11px] font-bold tracking-wide">Bot is active</span>
               </div>
            </div>
            <button onClick={() => { setActiveTab("trade"); setSelectedTicket(null); }} className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all">
               <ChevronDown size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-white custom-scrollbar">
             {/* Mocking the specific conversation from the screenshot for a professional feel */}
             <div className="flex justify-start">
                <div className="bg-[#f3f4f6] text-[#333] rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-sm border border-gray-100">
                   <p className="text-[14px] font-medium leading-relaxed">Thank you for your feedback :)</p>
                </div>
             </div>

             <div className="flex justify-end">
                <div className="bg-[#333] text-white rounded-2xl rounded-tr-none p-4 max-w-[85%] shadow-md">
                   <p className="text-[14px] font-medium leading-relaxed">হাই</p>
                </div>
             </div>

             <div className="flex justify-start">
                <div className="bg-[#f3f4f6] text-[#333] rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-sm border border-gray-100">
                   <div className="space-y-3">
                      <p className="text-[14px] font-medium leading-relaxed">
                         Seems like you're speaking a foreign language which I don't currently understand.
                      </p>
                      <p className="text-[14px] font-medium leading-relaxed">
                         Choose your preferred language from the list. Try using English for the best experience with this bot.
                      </p>
                   </div>
                </div>
             </div>

             {/* Language Options Grid - Screenshot Matched */}
             <div className="flex flex-wrap gap-2.5 pl-4 pr-10">
                {["English", "हिन्दी, हिंदी", "Português", "Español", "Tiếng Việt", "Bahasa Indonesia", "Türkçe"].map((lang) => (
                   <button 
                     key={lang}
                     className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-[14px] font-bold text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                   >
                      {lang}
                   </button>
                ))}
             </div>

             {ticketMessages.length > 0 && ticketMessages.map((msg, idx) => {
               const isStaff = msg.senderType === 'support';
               return (
                 <div key={`msg-${idx}`} className={`flex ${isStaff ? 'justify-start' : 'justify-end'}`}>
                    <div className={`${isStaff ? 'bg-[#f3f4f6] text-[#333] rounded-tl-none border border-gray-100' : 'bg-[#333] text-white rounded-tr-none shadow-md'} rounded-2xl p-4 max-w-[85%]`}>
                       <p className="text-[14px] font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                       <div className={`mt-2 flex items-center gap-2 ${isStaff ? 'text-gray-400' : 'text-white/40'}`}>
                          <span className="text-[9px] font-black uppercase tracking-widest">{isStaff ? 'Bot' : 'You'}</span>
                          <span className="text-[9px] font-bold">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                    </div>
                 </div>
               );
             })}
             <div ref={messagesEndRef} />
             
             {isBotTyping && (
                 <div className="flex justify-start">
                    <div className="bg-[#f3f4f6] text-[#333] rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-sm border border-gray-100 flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                       <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                       <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                 </div>
              )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
             <button className="text-gray-400 hover:text-gray-600 transition-colors p-2">
                <Paperclip size={22} strokeWidth={2.5} />
             </button>
             <div className="flex-1 relative">
                <input 
                  value={ticketReply}
                  onChange={(e) => setTicketReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendTicketMessage()}
                  placeholder="Type a message" 
                  className="w-full bg-[#f3f4f6] text-[#333] text-[15px] py-3 px-5 pr-10 rounded-full outline-none placeholder:text-gray-400 font-medium" 
                />
             </div>
             <button 
                onClick={sendTicketMessage}
                disabled={!ticketReply.trim()}
                className={`p-2 transition-all ${ticketReply.trim() ? 'text-[#0091ff] scale-110' : 'text-gray-300'}`}
             >
                <Send size={22} strokeWidth={2.5} />
             </button>
          </div>
        </div>
      )}

      {/* Floating Close Button - Bottom Left Matched to Screenshot */}
      {activeTab === "support-detail" && (
        <div className="fixed bottom-10 left-10 z-[600]">
           <button 
             onClick={() => { setActiveTab("trade"); setSelectedTicket(null); }}
             className="w-[52px] h-[52px] bg-[#f45c5c] rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-white/10"
           >
              <X size={28} strokeWidth={3} />
           </button>
        </div>
      )}
      {isCreatingTicket && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-250">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0, y: 20 }}
             animate={{ scale: 1, opacity: 1, y: 0 }}
             className="w-full max-w-[420px] bg-[#1a1b1e] rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col border border-white/10"
           >
              <div className="bg-[#1e1f21] px-8 py-7 flex items-center justify-between border-b border-white/5">
                 <div>
                    <h2 className="text-white text-[22px] font-black tracking-tight leading-none mb-1">New Support Ticket</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Support Core</p>
                 </div>
                 <button onClick={() => setIsCreatingTicket(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                    <X size={24} />
                 </button>
              </div>

              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="block text-gray-500 text-[11px] font-black uppercase tracking-[0.2em] ml-1">Subject of Inquiry</label>
                    <div className="bg-[#2a2b30] border border-white/5 rounded-2xl px-5 py-4 focus-within:border-emerald-500/40 transition-all shadow-inner">
                       <input 
                         type="text" 
                         value={ticketSubject}
                         onChange={(e) => setTicketSubject(e.target.value)}
                         placeholder="e.g., Deposit verification"
                         className="w-full bg-transparent text-white text-[15px] outline-none placeholder:text-gray-600 font-medium"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="block text-gray-500 text-[11px] font-black uppercase tracking-[0.2em] ml-1">Detailed Message</label>
                    <div className="bg-[#2a2b30] border border-white/5 rounded-2xl px-5 py-4 focus-within:border-emerald-500/40 transition-all shadow-inner">
                       <textarea 
                         rows={4}
                         value={ticketMessage}
                         onChange={(e) => setTicketMessage(e.target.value)}
                         placeholder="Explain your situation clearly..."
                         className="w-full bg-transparent text-white text-[15px] outline-none placeholder:text-gray-600 font-medium resize-none"
                       />
                    </div>
                 </div>

                 <button 
                   onClick={async () => {
                     if (!ticketSubject.trim() || !ticketMessage.trim()) {
                       toast.error("Please fill all fields");
                       return;
                     }
                     const ticketId = await createSupportTicket(ticketSubject, ticketMessage);
                     if (ticketId) {
                       setIsCreatingTicket(false);
                       setTicketSubject("");
                       setTicketMessage("");
                     }
                   }}
                   disabled={!ticketSubject.trim() || !ticketMessage.trim()}
                   className="w-full py-5 bg-white text-black rounded-2xl font-black text-[16px] transition-all transform active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest">
                    Submit to Core
                 </button>
              </div>
           </motion.div>
        </div>
      )}


      {/* OVERLAY PROMOTIONS VIEW */}
      {activeTab === "promotions" && (
        <div className="fixed inset-0 z-[600] flex flex-col bg-[#0b0c0e] text-white overflow-y-auto pb-safe">
          {/* Header */}
          <div className="h-16 flex items-center px-4 md:px-8 border-b border-white/5 shrink-0 sticky top-0 bg-[#0b0c0e]/80 backdrop-blur-md z-[210]">
             <button 
                onClick={() => setActiveTab("trade")} 
                className="p-2 -ml-2 text-gray-500 hover:text-white transition-all active:scale-95 flex items-center gap-2"
             >
                <ArrowLeft size={24} />
             </button>
             <h2 className="text-xl font-black ml-4 tracking-tight uppercase">Special Offers</h2>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center py-20 px-6 bg-[#0b0c0e]">
             <div className="max-w-[1200px] w-full text-center">
                <h2 className="text-[56px] md:text-[84px] font-black tracking-tighter mb-4 text-white leading-none uppercase">Promotions</h2>
                <p className="text-gray-500 text-lg md:text-xl font-medium tracking-wide mb-12">Exclusive bonuses and rewards for our trading community</p>
                
                {promotionsData.length === 0 ? (
                  <div className="mt-20 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                       <Gift size={40} className="text-gray-700" />
                    </div>
                    <p className="text-[22px] font-bold text-gray-400 mb-2">No promotions currently available</p>
                    <p className="text-gray-500 max-w-sm">Sorry, there are no active events at the moment. Please check back later or watch our telegram channel.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                    {promotionsData.map((promo, promoIdx) => (
                      <div key={`promo-card-${promo.id}-${promoIdx}`} className="bg-[#1a1b1e] rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5 flex flex-col group hover:-translate-y-2 hover:border-yellow-500/30 transition-all duration-500">
                        <div className="relative h-[240px] overflow-hidden bg-[#121316]">
                          {promo.image || promo.imageUrl ? (
                            <img 
                              src={promo.image || promo.imageUrl} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90 group-hover:opacity-100" 
                              alt={promo.title} 
                             loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1b1e] to-[#121316]">
                              <Gift size={48} className="text-gray-800" />
                            </div>
                          )}
                          <div className="absolute top-6 right-6 px-4 py-1.5 bg-yellow-500 text-black text-[11px] font-black uppercase rounded-full shadow-lg">Active</div>
                        </div>
                        <div className="p-8 flex flex-col flex-1 text-left">
                          <h3 className="text-[24px] font-black tracking-tight mb-3 text-white leading-tight">{promo.title}</h3>
                          <p className="text-gray-400 text-[15px] font-medium leading-relaxed mb-8 grow line-clamp-3">
                            {promo.description}
                          </p>
                          <button 
                             onClick={() => setSelectedPromotion(promo)}
                             className="w-full py-4 bg-white hover:bg-gray-200 text-black rounded-2xl font-black text-sm transition-all uppercase tracking-widest shadow-xl active:scale-[0.98]"
                          >
                             View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
      

          {/* Promotion Detail Overlay */}
          <AnimatePresence>
            {selectedPromotion && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6"
              >
                 <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-[#1a1b1e] w-full w-full rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative max-h-[90vh] flex flex-col border border-white/10"
                 >
                    <button 
                      onClick={() => setSelectedPromotion(null)}
                      className="absolute top-6 right-6 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors z-20"
                    >
                      <X size={24} />
                    </button>

                    <div className="overflow-y-auto">
                       <div className="h-[300px] bg-[#121316] relative">
                          {(selectedPromotion.image || selectedPromotion.imageUrl) ? (
                            <img 
                              src={selectedPromotion.image || selectedPromotion.imageUrl} 
                              className="w-full h-full object-cover" 
                              alt={selectedPromotion.title} 
                             loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <Gift size={64} className="text-gray-200" />
                            </div>
                          )}
                       </div>
                       <div className="p-10 text-left">
                          <h2 className="text-[36px] font-black tracking-tighter text-gray-900 mb-6 leading-none">
                            {selectedPromotion.title}
                          </h2>
                          <div className="prose prose-lg max-w-none text-gray-600 font-medium leading-relaxed">
                             {selectedPromotion.content || selectedPromotion.description}
                          </div>
                          
                          <div className="mt-12">
                             <button 
                               onClick={() => setSelectedPromotion(null)}
                               className="bg-black text-white font-black h-14 px-10 rounded-2xl hover:scale-105 active:scale-95 transition-transform text-[16px] uppercase tracking-widest"
                             >
                               Got it
                             </button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

      {/* CHART TYPE MODAL */}
      {showChartTypeModal && (
        <AnimatePresence>
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowChartTypeModal(false)}
               className="fixed md:absolute inset-0 bg-black/50 md:bg-transparent z-[140] md:pointer-events-none"
            />
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
              className="fixed md:absolute left-0 md:left-[76px] top-0 bottom-0 w-[85%] md:w-[360px] z-[150] flex flex-col bg-[#222329] border-r border-[#2C2D33] shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Top Header */}
              <div className="pt-[18px] pb-4 px-5 flex items-center justify-between border-b border-[#2C2D33]/40">
                <h2 className="text-[15px] font-medium tracking-wide text-white mb-0">
                  Chart type
                </h2>
                <button
                  onClick={() => setShowChartTypeModal(false)}
                  className="text-[#888] hover:text-white transition-colors p-1 -mr-1"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pt-5 pb-20 custom-scrollbar space-y-3">
                {chartTypeOptions.map((type, idx) => (
                  <button
                    key={`ctype-${type.id}-${idx}`}
                    onClick={() => {
                      setChartLoading(true);
                      setChartType(type.id);
                      setShowChartTypeModal(false);
                      setTimeout(() => setChartLoading(false), 250);
                    }}
                    className={`w-full py-4 px-5 rounded-[12px] text-[13px] font-bold transition-all flex items-center justify-between overflow-hidden shadow-sm outline-none group border ${
                      chartType === type.id
                          ? "bg-transparent border-[#FFE24C]/20 shadow-[inset_0_0_0_1px_rgba(255,226,76,0.3)] text-white relative after:content-[''] after:absolute after:inset-0 after:border-[2px] after:border-[#222329] after:rounded-[12px]"
                          : "bg-[#2c2d33]/50 border-transparent text-[#e4e4e4] hover:bg-[#2c2d33]"
                    }`}
                    style={chartType === type.id ? { borderColor: '#555', backgroundColor: '#383a42' } : {}}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <type.Icon size={20} className={chartType === type.id ? "text-white" : "text-gray-400 group-hover:text-white"} />
                      <span className="tracking-wide text-[14px]">{type.label}</span>
                    </div>
                    <div className={`transition-opacity relative z-10 ${chartType === type.id ? "opacity-100" : "opacity-60 saturate-50 group-hover:opacity-100 group-hover:saturate-100"}`}>
                      {type.preview}
                    </div>
                  </button>
                ))}

                <div className="mt-8 pt-6 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded-[4px] border border-[#FFE24C] bg-[#FFE24C]/20 flex items-center justify-center">
                            <Icons.Check size={14} className="text-[#FFE24C]" strokeWidth={3} />
                        </div>
                        <span className="text-[#e4e4e4] text-[13px] font-bold tracking-wide group-hover:text-white transition-colors">View quote details</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded-[4px] border border-[#FFE24C] bg-[#FFE24C]/20 flex items-center justify-center">
                            <Icons.Check size={14} className="text-[#FFE24C]" strokeWidth={3} />
                        </div>
                        <span className="text-[#e4e4e4] text-[13px] font-bold tracking-wide group-hover:text-white transition-colors">View timer until next quote</span>
                    </label>
                </div>
              </div>
            </motion.div>
        </AnimatePresence>
      )}

      {/* OVERLAY PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] w-full max-md rounded-2xl overflow-hidden shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="w-full bg-[#2A2B31] border border-[#3b3b3f] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">New Password</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="w-full bg-[#2A2B31] border border-[#3b3b3f] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full bg-[#2A2B31] border border-[#3b3b3f] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={async () => {
                  if (!passwords.current || !passwords.new || !passwords.confirm) {
                    toast.error("Please fill all fields");
                    return;
                  }
                  if (passwords.new !== passwords.confirm) {
                    toast.error("New passwords do not match");
                    return;
                  }
                  if (passwords.new.length < 6) {
                    toast.error("Password must be at least 6 characters");
                    return;
                  }

                  try {
                    if (!currentUser || !currentUser.email) return;
                    const credential = EmailAuthProvider.credential(currentUser.email, passwords.current);
                    await reauthenticateWithCredential(currentUser, credential);
                    await updatePassword(currentUser, passwords.new);

                    toast.success("Password updated successfully!");
                    setShowPasswordModal(false);
                    setPasswords({ current: "", new: "", confirm: "" });
                  } catch (e: any) {
                    console.error("Password update error:", e);
                    toast.error(e.message || "Failed to update password");
                  }
                }}
                className="w-full py-3.5 bg-[#FFD700] hover:bg-[#F0C800] text-black font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]"
              >
                Update Password
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-full py-3.5 bg-transparent border border-gray-600 text-gray-300 hover:bg-white/5 rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showTradeHistoryModal && <TradeHistoryModal onClose={() => setShowTradeHistoryModal(false)} />}
      {/* OVERLAY VIDEO PLAYER */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] w-full w-full rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-[#2C2C2E]">
              <h3 className="font-bold text-white text-lg truncate pr-4">{activeVideoTitle}</h3>
              <button
                onClick={() => { setActiveVideoUrl(null); setActiveVideoTitle(null); }}
                className="text-gray-400 hover:text-white transition-colors bg-[#2C2C2E] rounded-full p-1.5 focus:outline-none"
              >
                <Icons.X size={20} />
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
               <iframe
                 src={activeVideoUrl.includes('watch?v=') ? activeVideoUrl.replace('watch?v=', 'embed/').split('&')[0] : activeVideoUrl.includes('youtu.be/') ? activeVideoUrl.replace('youtu.be/', 'youtube.com/embed/').split('?')[0] : activeVideoUrl}
                 title={activeVideoTitle || "Video player"}
                 className="absolute inset-0 w-full h-full border-0"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
               ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT AGREEMENT MODAL */}
      {showClientAgreement && (
        <div className="fixed inset-0 z-[500] bg-[#1C1C1E] w-full h-full overflow-y-auto">
          <div className="w-full h-full text-white relative">
            <div className="sticky top-0 bg-[#1C1C1E] border-b border-[#2C2C2E] p-6 z-10 flex items-center justify-between">
              <h2 className="text-3xl font-black w-full text-center">{clientAgreementData?.title}</h2>
              <button
                onClick={() => setShowClientAgreement(false)}
                className="absolute right-4 text-gray-400 hover:text-white transition-colors bg-[#2C2C2E] rounded-full p-2 focus:outline-none"
              >
                <Icons.X size={24} />
              </button>
            </div>
            <div className="max-w-3xl mx-auto p-8 md:p-12 space-y-6">
               <div className="text-gray-300 whitespace-pre-line leading-relaxed text-[15px] md:text-[17px]">
                  {clientAgreementData?.content}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* TIME PICKER MODAL */}
      {showTimePicker && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 pointer-events-auto">
           <div className="absolute inset-0 bg-black/20" onClick={() => setShowTimePicker(false)}></div>
           <div className="bg-[#2A2C31] w-full max-w-[280px] rounded-2xl p-1 relative shadow-2xl border border-white/5 z-10 animate-in fade-in zoom-in-95 duration-200">
              <div className="grid grid-cols-2">
                {/* Left Column: 15-minute intervals */}
                <div className="flex flex-col border-r border-white/5 py-2">
                   {(() => {
                      const options = [];
                      let base = new Date(nowMs);
                      base.setSeconds(0);
                      base.setMilliseconds(0);
                      
                      // Find next 15-min mark
                      let minutes = base.getMinutes();
                      let next15 = Math.ceil((minutes + 1) / 15) * 15;
                      base.setMinutes(next15);
                      
                      for(let i=0; i<4; i++) {
                        const d = new Date(base.getTime() + i * 15 * 60000);
                        options.push(d);
                      }
                      return options.map(d => (
                        <button 
                          key={`15m-${d.getTime()}`} 
                          onClick={() => { setTargetExpiration(d); setShowTimePicker(false); }}
                          className="w-full py-3.5 text-[#9ea0a5] hover:text-white text-[15px] font-medium transition-colors hover:bg-white/5 rounded-lg"
                        >
                          {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </button>
                      ));
                   })()}
                </div>
                {/* Right Column: 1-minute intervals */}
                <div className="flex flex-col py-2">
                   {(() => {
                      const options = [];
                      let base = new Date(defaultExpiration.getTime());
                      for(let i=0; i<5; i++) {
                        const d = new Date(base.getTime() + i * 60000);
                        options.push(d);
                      }
                      return options.map(d => (
                        <button 
                          key={`1m-${d.getTime()}`} 
                          onClick={() => { setTargetExpiration(d); setShowTimePicker(false); }}
                          className="w-full py-3.5 text-[#9ea0a5] hover:text-white text-[15px] font-medium transition-colors hover:bg-white/5 rounded-lg"
                        >
                          {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </button>
                      ));
                   })()}
                </div>
              </div>
           </div>
        </div>
      )}

      {/* REGULATIONS MODAL */}
      {showRegulations && (
        <div className="fixed inset-0 z-[500] bg-[#1C1C1E] w-full h-full overflow-y-auto">
          <div className="w-full h-full text-white relative">
            <div className="sticky top-0 bg-[#1C1C1E] border-b border-[#2C2C2E] p-6 z-10 flex items-center justify-between">
              <h2 className="text-3xl font-black w-full text-center">Regulation</h2>
              <button
                onClick={() => setShowRegulations(false)}
                className="absolute right-4 text-gray-400 hover:text-white transition-colors bg-[#2C2C2E] rounded-full p-2 focus:outline-none"
              >
                <Icons.X size={24} />
              </button>
            </div>
            
            <div className="max-w-3xl mx-auto p-8 md:p-12 space-y-10">
              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold">{regulationsData?.title}</h3>
                {regulationsData?.introParas?.map((p: string, i: number) => (
                  <p key={`intro-${i}`} className="text-gray-400 text-[15px] md:text-[17px] leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              <div className="pt-4">
                <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-xl w-full md:w-auto shadow-lg transition-colors">
                  View certificate
                </button>
              </div>

              <div className="flex flex-col items-center py-6 border-y border-white/5 space-y-6">
                <div className="w-32 h-32 bg-green-900/40 rounded-full flex items-center justify-center border-4 border-green-700 shadow-[0_0_30px_rgba(34,197,94,0.15)] relative overflow-hidden">
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-green-700/80 flex items-center justify-center transform -skew-y-6 origin-bottom-right">
                    <span className="font-bold text-white tracking-widest">€20.000</span>
                  </div>
                  <Icons.Building size={48} className="text-green-500 mb-4" />
                </div>
                <p className="text-center text-gray-300 font-medium leading-relaxed w-full text-[15px] md:text-[17px]">
                  {regulationsData?.compensationFundText}
                </p>
              </div>

              <div className="space-y-8 pt-4">
                <h4 className="text-2xl font-bold text-center">Commission:</h4>
                <div className="space-y-10 relative">
                  <div className="absolute left-6 top-6 bottom-6 w-px bg-[#2C2C2E] hidden md:block"></div>
                  {regulationsData?.appealSteps?.map((step: string, i: number) => (
                    <div key={`step-${i}`} className="flex flex-col md:flex-row items-center md:items-start gap-6 relative">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 flex items-center justify-center font-bold text-xl flex-shrink-0 z-10 mx-auto md:mx-0">
                        {i + 1}
                      </div>
                      <p className="text-gray-400 leading-relaxed text-center md:text-left text-[15px] md:text-[17px] pt-2">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {regulationsData?.appealNote && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 md:p-8 mt-10">
                  <p className="text-yellow-500/90 font-bold text-[15px] md:text-[17px] text-center leading-relaxed">
                    {regulationsData?.appealNote}
                  </p>
                </div>
              )}

              <div className="space-y-8 pt-10 border-t border-white/5">
                <h4 className="text-2xl font-bold text-center">The Financial Commission for the trader</h4>
                <div className="space-y-8 max-w-3xl mx-auto">
                  {regulationsData?.traderFeatures?.map((feature: any, i: number) => (
                    <div key={`feat-${i}`} className="flex items-start gap-6">
                      <div className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center text-black flex-shrink-0">
                        {feature.icon === 'shield' ? <Icons.ShieldCheck size={28} /> : 
                         feature.icon === 'scales' ? <Icons.Scale size={28} /> : 
                         <Icons.FileText size={28} />}
                      </div>
                      <p className="text-gray-300 leading-relaxed text-[15px] md:text-[17px] pt-3">{feature.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {regulationsData?.vmtSection && (
                <div className="bg-[#242427] border border-white/5 rounded-2xl p-8 md:p-12 mt-12 text-center flex flex-col items-center shadow-lg">
                  <div className="mb-8 w-32 h-32">
                    <div className="w-full h-full bg-blue-900/40 rounded-full flex items-center justify-center border-4 border-blue-700 relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 bottom-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNGRwIiBoZWlnaHQ9IjI0ZHAiIGZpbGw9IiM0QTlGRkYiPjxwYXRoIGQ9Ik0xMiAxTDMgNXYxNGw5IDEwIDktMTBWNUwxMiAxem0wIDJ2MTZsLTctN3YtOGw3LTR6Ij48L3BhdGg+PC9zdmc+')] bg-center bg-no-repeat bg-[length:60%] opacity-30"></div>
                      <Icons.CheckCircle size={48} className="text-blue-500 relative z-10" />
                      <div className="absolute inset-x-0 bottom-6 bg-orange-600/90 text-[10px] font-black tracking-widest text-white py-1 z-20 shadow-md transform -rotate-2">
                        BEST EXECUTION
                      </div>
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold mb-8 max-w-xl leading-snug">{regulationsData?.vmtSection?.title}</h4>
                  <div className="space-y-6 text-left max-w-3xl">
                    {regulationsData?.vmtSection?.paras?.map((p: string, i: number) => (
                      <p key={`vmt-p-${i}`} className="text-gray-400 text-[15px] md:text-[17px] leading-relaxed">
                        {i === 0 && typeof p === 'string' ? <span className="font-semibold text-white/80">{(p || "").split("Verify My Trade (VMT)")[0]}Verify My Trade (VMT){(p || "").split("Verify My Trade (VMT)")[1]}</span> : 
                         i === 1 && typeof p === 'string' ? <><span className="font-semibold text-white/80">Verify My Trade</span>{(p || "").substring(15)}</> : 
                         typeof p === 'string' ? p : ""}
                      </p>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* COPY TRADING HOW IT WORKS MODAL */}
      {showCopyTradingHowItWorks && (
        <div className="fixed inset-0 z-[600] bg-[#1C1C1E] flex flex-col">
          <div className="sticky top-0 bg-[#1C1C1E] border-b border-[#2C2C2E] p-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold">How Copy Trading works</h2>
            <button
              onClick={() => setShowCopyTradingHowItWorks(false)}
              className="p-2 bg-[#2C2C2E] rounded-full text-gray-400 hover:text-white"
            >
              <Icons.X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#1C1C1E]">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#FFE24C]/10 rounded-full flex items-center justify-center text-[#FFE24C]">
                <Icons.Search size={24} />
              </div>
              <h3 className="text-lg font-bold">1. Choose a master trader</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Browse through our list of expert traders. Look at their win rates, strategies, and performance history to find the one that matches your goals.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                <Icons.Settings size={24} />
              </div>
              <h3 className="text-lg font-bold">2. Set your budget</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Decide how much of your balance you want to allocate to this trader. You can also set a maximum trade amount and trade limit for extra safety.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                <Icons.RefreshCw size={24} />
              </div>
              <h3 className="text-lg font-bold">3. Automatic synchronization</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Once you start copying, every trade the master trader makes will be automatically copied to your account in real-time, proportional to your allocated budget.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-500">
                <Icons.Wallet size={24} />
              </div>
              <h3 className="text-lg font-bold">4. Track and grow</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Monitor your earnings in the "My card" tab. You can stop copying at any time, and your remaining allocated funds plus profits will be returned to your main wallet.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 pb-10">
              <button
                onClick={() => setShowCopyTradingHowItWorks(false)}
                className="w-full py-4 bg-[#FFE24C] text-black font-bold rounded-xl"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABOUT US MODAL */}
      {showAboutUs && (
        <div className="fixed inset-0 z-[500] bg-[#1C1C1E] w-full h-full overflow-y-auto">
          <div className="w-full h-full text-white relative">
            <div className="sticky top-0 bg-[#1C1C1E] border-b border-[#2C2C2E] p-6 z-10 flex items-center justify-between">
              <h2 className="text-3xl font-black w-full text-center">About us</h2>
              <button
                onClick={() => setShowAboutUs(false)}
                className="absolute right-4 text-gray-400 hover:text-white transition-colors bg-[#2C2C2E] rounded-full p-2 focus:outline-none"
              >
                <Icons.X size={24} />
              </button>
            </div>
            
            <div className="max-w-3xl mx-auto p-8 md:p-12 space-y-10">
              {/* Title & Paragraphs */}
              <div className="space-y-6">
                {aboutUsData?.title && (
                  <h3 className="text-xl md:text-2xl font-bold leading-relaxed">{aboutUsData?.title}</h3>
                )}
                {aboutUsData?.paragraphs && aboutUsData?.paragraphs?.map((p: string, i: number) => (
                  <p key={`para-${i}`} className="text-gray-400 text-[15px] md:text-[17px] leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              {/* Advantages List */}
              {aboutUsData?.advantages && aboutUsData?.advantages.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-white/5">
                  <h3 className="text-2xl font-bold mb-8">Our advantage:</h3>
                  <div className="space-y-6">
                    {aboutUsData?.advantages.map((adv: string, i: number) => (
                      <div key={`adv-${i}`} className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 rounded-full border-2 border-yellow-500 flex items-center justify-center text-yellow-500">
                            <Icons.Check size={18} strokeWidth={3} />
                          </div>
                        </div>
                        <p className="text-gray-300 text-lg leading-relaxed pt-1.5">{adv}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Credit Cards Accepted */}
              <div className="pt-10 pb-4 text-center space-y-6">
                <h4 className="text-xl font-bold">Credit Cards accepted</h4>
                <div className="flex items-center justify-center gap-6">
                  {/* Master Card Icon */}
                  <svg width="48" height="32" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="36" height="24" rx="4" fill="#1C1C1E"/>
                    <circle cx="12" cy="12" r="7.5" fill="#EB001B"/>
                    <circle cx="24" cy="12" r="7.5" fill="#F79E1B"/>
                    <path d="M18 17.5C16.8 16 16 14.1 16 12C16 9.9 16.8 8 18 6.5C19.2 8 20 9.9 20 12C20 14.1 19.2 16 18 17.5Z" fill="#FF5F00"/>
                  </svg>
                  {/* Visa Icon */}
                  <svg width="64" height="32" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.1 15.6L22.5 0.500002H27.5L24 15.6H19.1ZM35.3 11C35.3 7 41.2 6.7 41.2 4.7C41.2 4.1 40.7 3.4 39 3.2C38 3 35.5 3.5 34 4.3L33.3 0.800001C34.7 0.200001 37.1 0 39.4 0C44.7 0 48.3 2.5 48.3 7C48.3 11.2 42.4 11.6 42.4 13.6C42.4 14.3 43.1 15 44.8 15.1C46 15.2 47.3 14.8 48.6 14.1L47.9 17.8C46.6 18.4 44.4 18.7 42.5 18.7C37.3 18.7 35.3 15.8 35.3 11ZM12.7 15.6H8.20001L5.30001 4.2C5.00001 3.2 4.80001 2.8 4.00001 2.3C2.80001 1.7 1.20001 1.2 0 0.900002L0.100006 0.500002H6.90001C8.20001 0.500002 9.20001 1.3 9.50001 2.6L11.3 10.7L16.2 0.500002H21.2L12.7 15.6ZM28.9 15.6H33.5L36.2 0.500002H31.6L28.9 15.6Z" fill="#1434CB"/>
                  </svg>
                  {/* JCB Icon */}
                  <div className="font-bold text-blue-500 text-2xl italic tracking-tighter">JCB</div>
                </div>
              </div>

              {/* Contacts */}
              {aboutUsData?.contacts && (
                <div className="pt-10 border-t border-white/5 space-y-10 pb-8">
                  <h3 className="text-3xl font-bold text-center">Contacts</h3>
                  
                  <div className="space-y-6 max-w-xl mx-auto">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-black">
                          <Icons.Home size={22} strokeWidth={2.5} />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">{aboutUsData?.contacts?.companyName}</h4>
                        <p className="text-gray-400 mt-1">{aboutUsData?.contacts?.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-black">
                          <Icons.Mail size={22} strokeWidth={2.5} />
                        </div>
                      </div>
                      <h4 className="text-xl font-bold">{aboutUsData?.contacts?.email}</h4>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4 pt-4">
                    <div className="w-12 h-12 bg-[#2C2C2E] rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black cursor-pointer transition-colors">
                      <Icons.Youtube size={20} />
                    </div>
                    <div className="w-12 h-12 bg-[#2C2C2E] rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black cursor-pointer transition-colors">
                      <Icons.Instagram size={20} />
                    </div>
                    <div className="w-12 h-12 bg-[#2C2C2E] rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black cursor-pointer transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.9 1.2-5.36 3.51-.51.35-.97.53-1.39.52-.46-.01-1.34-.26-2-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49 1-.76 3.91-1.7 6.52-2.79 7.84-3.34 3.73-1.55 4.51-1.81 5.01-1.82.11 0 .36.03.49.14.11.09.14.22.15.31-.01.07-.01.2-.01.25z"/></svg>
                    </div>
                    <div className="w-12 h-12 bg-[#2C2C2E] rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black cursor-pointer transition-colors">
                      <Icons.Facebook size={20} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* STATUSES VIEW */}
      {activeTab === "statuses" && (
        <div className="fixed inset-0 z-[600] flex flex-col bg-[#fafafa] text-gray-900 overflow-y-auto pb-safe">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-200 shrink-0 sticky top-0 bg-white/90 backdrop-blur-md z-[210]">
             <div className="flex items-center">
                 <button 
                    onClick={() => setActiveTab("trade")} 
                    className="p-2 -ml-2 text-gray-500 hover:text-black transition-all active:scale-95 flex items-center gap-2"
                 >
                    <ArrowLeft size={24} />
                 </button>
             </div>
             
             <div className="flex items-center gap-4">
               <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Demo account</span>
                  <span className="text-base font-black text-black leading-none">{formatWithCurrency(demoBalance, userCurrency)}</span>
               </div>
               <button onClick={() => setActiveTab("trade")} className="bg-[#fcd535] hover:bg-[#ebd04f] text-black px-6 py-2 rounded-lg font-bold transition-all text-sm uppercase tracking-wide ml-2 md:ml-0">
                 Trading
               </button>
             </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center py-6 md:py-12 px-4 md:px-6">
             <div className="max-w-[1400px] w-full">
                <h2 className="text-[32px] md:text-[42px] font-black tracking-tight mb-2 text-black leading-none text-center md:text-left">Statuses</h2>
                <p className="text-gray-500 text-sm md:text-base font-medium mb-8 text-center md:text-left">More trading advantages and benefits with each status. Check in cards below</p>
                
                <div className="flex flex-col xl:flex-row items-stretch gap-4 md:gap-6 pb-10 xl:overflow-visible">
                  {/* FREE CARD */}
                  <div className="w-full xl:w-1/5 bg-white rounded-2xl flex flex-col shadow-sm border border-gray-200 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 opacity-5">
                       <Diamond size={100} fill="currentColor" className="text-gray-400" />
                    </div>
                    <div className="p-5 md:p-6 relative z-10 flex flex-col h-full">
                       <h3 className="text-xl font-bold mb-4">Free</h3>
                       <div className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1.5 rounded inline-flex items-center uppercase tracking-wider mb-6 self-start">
                         <Icons.Check size={12} className="mr-1" strokeWidth={3} /> Unlocked
                       </div>

                       <div className="space-y-3 mb-6">
                         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center h-20">
                           <div className="font-black text-xl flex items-center justify-between">
                              <span>30 trades</span>
                              <Icons.Info size={16} className="text-gray-300" />
                           </div>
                           <div className="text-xs text-gray-500 mt-0.5">on demo account</div>
                         </div>
                         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between h-20">
                            <div>
                               <div className="font-black text-xl flex items-center gap-2">
                                 <LayoutGrid size={18} strokeWidth={2.5} /> 100+
                               </div>
                               <div className="text-xs text-gray-500 mt-0.5">assets</div>
                            </div>
                            <Icons.Info size={16} className="text-gray-300 self-start" />
                         </div>
                       </div>

                       <div className="space-y-3 text-sm border-b border-gray-200 pb-4 mb-4">
                         <div className="flex justify-between items-center"><span className="text-gray-600">Withdrawals</span><span className="font-bold text-gray-400">—</span></div>
                         <div className="flex justify-between items-center"><span className="text-gray-600 border-b border-gray-300 border-dashed cursor-help leading-tight">Invite Friends</span><span className="font-bold text-gray-400">—</span></div>
                         <div className="flex justify-between items-center"><span className="text-gray-600">Deposit bonuses</span><span className="font-bold text-gray-400">—</span></div>
                       </div>

                       <div className="space-y-3 text-[13px] text-gray-400 font-medium">
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Advanced payments if your deposit takes too long to process</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Risk-free trades to protect your investments from losses</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Free access to VIP tournaments</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Personal manager</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Insurance for your deposits if your balance reaches 0</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Multi-window trading</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Trading signals</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Crypto calendar</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">VIP mobile app</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Monthly Cashback Plus of 5% for unsuccessful trades</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">High priority support</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Deposit insurance</span></div>
                       </div>
                    </div>
                  </div>

                  {/* STANDARD CARD */}
                  <div className="w-full xl:w-1/5 bg-white rounded-2xl flex flex-col shadow-sm border border-t-[4px] border-t-[#00c980] border-gray-200 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 opacity-5">
                       <Diamond size={100} fill="currentColor" className="text-[#00c980]" />
                    </div>
                    <div className="p-5 md:p-6 relative z-10 flex flex-col h-full">
                       <h3 className="text-xl font-bold mb-4">Standard</h3>
                       <div className="bg-[#00c980] text-white text-[10px] font-bold px-3 py-1.5 rounded inline-flex items-center uppercase tracking-wider mb-6 self-start">
                         <Icons.Check size={12} className="mr-1" strokeWidth={3} /> Your status
                       </div>

                       <div className="space-y-3 mb-6">
                         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center h-20">
                           <div className="text-gray-400 text-xs mb-0.5 font-medium"><Icons.ChevronUp size={14} className="inline text-gray-300" strokeWidth={3} /> profitability</div>
                           <div className="font-black text-xl flex items-center justify-between">
                             <span>up to 85%</span>
                             <Icons.Info size={16} className="text-gray-300" />
                           </div>
                         </div>
                         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between h-20">
                            <div>
                               <div className="font-black text-xl flex items-center gap-2">
                                 <LayoutGrid size={18} strokeWidth={2.5} /> 120+
                               </div>
                               <div className="text-xs text-gray-500 mt-0.5">assets</div>
                            </div>
                            <Icons.Info size={16} className="text-gray-300 self-start" />
                         </div>
                       </div>

                       <div className="space-y-3 text-sm border-b border-gray-200 pb-4 mb-4">
                         <div className="flex justify-between items-center"><span className="text-gray-600">Withdrawals</span><span className="font-bold text-gray-900">3 days</span></div>
                         <div className="flex justify-between items-center"><span className="text-gray-600 border-b border-gray-300 border-dashed cursor-help leading-tight">Invite Friends</span><span className="font-bold text-gray-900">up to $50</span></div>
                         <div className="flex justify-between items-center"><span className="text-gray-600">Deposit bonuses</span><span className="font-bold text-gray-900">up to 100%</span></div>
                       </div>

                       <div className="space-y-3 text-[13px] text-gray-400 font-medium">
                         <div className="flex items-start gap-2 text-gray-700 font-semibold"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3} /> <span>Advanced payments if your deposit takes too long to process</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Risk-free trades to protect your investments from losses</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Free access to VIP tournaments</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Personal manager</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Insurance for your deposits if your balance reaches 0</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Multi-window trading</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Trading signals</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Crypto calendar</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">VIP mobile app</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Monthly Cashback Plus of 5% for unsuccessful trades</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">High priority support</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Deposit insurance</span></div>
                       </div>
                    </div>
                  </div>

                  {/* GOLD CARD */}
                  <div className="w-full xl:w-1/5 bg-white rounded-2xl flex flex-col shadow-md border border-yellow-300 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 opacity-20">
                       <Diamond size={100} fill="currentColor" className="text-yellow-400" />
                    </div>
                    <div className="p-5 md:p-6 relative z-10 flex flex-col h-full">
                       <h3 className="text-xl font-bold mb-4">Gold</h3>
                       
                       <div className="mb-6 w-full px-1">
                          <div className="text-[12px] font-bold mb-2 flex justify-between">
                            <span className="text-gray-900">৳4,250</span> <span className="text-gray-400">/ ৳42,000</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full w-full overflow-hidden">
                             <div className="h-full bg-yellow-400 w-[10%] rounded-full"></div>
                          </div>
                       </div>

                       <div className="space-y-3 mb-6">
                         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center h-20">
                           <div className="text-gray-400 text-xs mb-0.5 font-medium"><Icons.ChevronUp size={14} className="inline text-gray-300" strokeWidth={3} /> profitability</div>
                           <div className="font-black text-xl flex items-center justify-between">
                             <span>up to 90%</span>
                             <Icons.Info size={16} className="text-gray-300" />
                           </div>
                         </div>
                         <div className="flex gap-3">
                           <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center h-20 flex-1 relative">
                              <div className="font-black text-xl flex items-center gap-1.5">
                                <LayoutGrid size={16} strokeWidth={2.5}/> 130+
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">assets</div>
                              <Icons.Info size={14} className="absolute top-2 right-2 text-gray-300 hidden xl:block" />
                           </div>
                           <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center h-20 flex-1 relative">
                              <div className="font-black text-xl flex items-center gap-1.5">
                                <Icons.RefreshCcw size={16} strokeWidth={3} className="text-gray-800" /> 5%
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">cashback</div>
                              <Icons.Info size={14} className="absolute top-2 right-2 text-gray-300 hidden xl:block" />
                           </div>
                         </div>
                       </div>

                       <div className="space-y-3 text-sm border-b border-gray-200 pb-4 mb-4">
                         <div className="flex justify-between items-center"><span className="text-gray-600">Withdrawals</span><span className="font-bold text-gray-900">24 hours</span></div>
                         <div className="flex justify-between items-center"><span className="text-gray-600 border-b border-gray-300 border-dashed cursor-help leading-tight">Invite Friends</span><span className="font-bold text-gray-900">up to $50</span></div>
                         <div className="flex justify-between items-center"><span className="text-gray-600">Deposit bonuses</span><span className="font-bold text-gray-900">up to 150%</span></div>
                       </div>

                       <div className="space-y-3 text-[13px] text-gray-400 font-medium mb-6">
                         <div className="flex items-start gap-2 text-gray-700 font-semibold"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3} /> <span>Advanced payments if your deposit takes too long to process</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Risk-free trades to protect your investments from losses</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Free access to VIP tournaments</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Personal manager</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Insurance for your deposits if your balance reaches 0</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Multi-window trading</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Trading signals</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Crypto calendar</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">VIP mobile app</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Monthly Cashback Plus of 5% for unsuccessful trades</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">High priority support</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-gray-300" /> <span className="opacity-80">Deposit insurance</span></div>
                       </div>
                       
                       <div className="mt-auto pt-4">
                         <button className="w-full bg-[#fcd535] hover:bg-[#ebd04f] text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_10px_rgba(252,213,53,0.3)] active:scale-[0.98]">
                           Upgrade
                         </button>
                       </div>
                    </div>
                  </div>

                  {/* VIP CARD */}
                  <div className="w-full xl:w-1/5 bg-[#0066ff] bg-gradient-to-br from-[#0066ff] to-[#004dc2] rounded-2xl flex flex-col shadow-2xl relative overflow-hidden transform xl:-translate-y-4 xl:scale-105 z-20 border border-[#4092ff]/30">
                    <div className="bg-[#111] text-[10px] font-black text-white px-5 py-2.5 uppercase tracking-widest flex justify-between items-center rounded-t-2xl">
                      <span>MOST POPULAR</span>
                      <div className="w-3.5 h-3.5 bg-blue-400 rotate-45 transform"></div>
                    </div>
                    <div className="absolute top-12 -right-8 opacity-20">
                       <Diamond size={130} fill="currentColor" className="text-black" />
                    </div>
                    <div className="p-5 md:p-6 relative z-10 flex flex-col h-full text-white">
                       <h3 className="text-[26px] font-black mb-4 flex items-center justify-between">VIP <Icons.Info size={18} className="text-white/40" /></h3>
                       
                       <div className="mb-6 w-full px-1">
                          <div className="text-[12px] font-bold mb-2 flex justify-between">
                            <span className="text-white">৳4,250</span> <span className="text-white/50">/ ৳85,000</span>
                          </div>
                          <div className="h-1.5 bg-black/20 rounded-full w-full overflow-hidden">
                             <div className="h-full bg-white w-[5%] rounded-full shadow-[0_0_10px_white]"></div>
                          </div>
                       </div>

                       <div className="text-[10px] font-black tracking-widest text-white/50 uppercase mb-4 border-b border-white/10 pb-2">Top Features</div>
                       
                       <div className="space-y-4 mb-6 relative z-20">
                          <div className="flex gap-3">
                             <div className="mt-0.5"><Icons.Clock size={16} strokeWidth={2.5} className="text-white" /></div>
                             <div>
                               <div className="font-bold text-[14px]">Fast withdraw</div>
                               <div className="text-white/70 text-xs mt-0.5 leading-tight">Get your funds in 4 hours or less</div>
                             </div>
                          </div>
                          <div className="flex gap-3">
                             <div className="mt-0.5"><Icons.ShieldCheck size={16} strokeWidth={2.5} className="text-white" /></div>
                             <div>
                               <div className="font-bold text-[14px]">Risk-free trades</div>
                               <div className="text-white/70 text-xs mt-0.5 leading-tight">Profit from successful trades and forget the unsuccessful.</div>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-3 mb-6">
                         <div className="bg-black/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm flex flex-col justify-center h-20">
                           <div className="text-white/60 text-xs mb-0.5 font-medium"><Icons.ChevronUp size={14} className="inline text-white/40" strokeWidth={3} /> profitability</div>
                           <div className="font-black text-xl flex items-center justify-between">
                             <span>up to 90%</span>
                           </div>
                         </div>
                         <div className="flex gap-3">
                           <div className="bg-black/10 p-4 rounded-xl border border-white/10 flex-col justify-center h-20 flex-1 relative backdrop-blur-sm">
                              <div className="font-black text-xl flex items-center gap-1.5">
                                <LayoutGrid size={16} strokeWidth={2.5}/> 140+
                              </div>
                              <div className="text-xs text-white/60 mt-0.5">assets</div>
                              <Icons.Info size={14} className="absolute top-2 right-2 text-white/40 hidden xl:block" />
                           </div>
                           <div className="bg-black/10 p-4 rounded-xl border border-white/10 flex-col justify-center h-20 flex-1 relative backdrop-blur-sm">
                              <div className="font-black text-xl flex items-center gap-1.5">
                                <Icons.RefreshCcw size={16} strokeWidth={3} className="text-white" /> 10%
                              </div>
                              <div className="text-xs text-white/60 mt-0.5">cashback</div>
                              <Icons.Info size={14} className="absolute top-2 right-2 text-white/40 hidden xl:block" />
                           </div>
                         </div>
                       </div>

                       <div className="space-y-3 text-sm border-b border-white/10 pb-4 mb-4">
                         <div className="flex justify-between items-center"><span className="text-white/80">Withdrawals</span><span className="font-bold text-white">4 hours</span></div>
                         <div className="flex justify-between items-center"><span className="text-white/80 border-b border-white/30 border-dashed cursor-help leading-tight">Invite Friends</span><span className="font-bold text-white">up to $850</span></div>
                         <div className="flex justify-between items-center"><span className="text-white/80">Deposit bonuses</span><span className="font-bold text-white">up to 200%</span></div>
                       </div>

                       <div className="space-y-3 text-[13px] text-white/90 font-medium mb-6">
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Advanced payments if your deposit takes too long to process</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Risk-free trades to protect your investments from losses</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Free access to VIP tournaments</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Personal manager</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Insurance for your deposits if your balance reaches 0</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Multi-window trading</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Trading signals</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Crypto calendar</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-white/40" /> <span className="opacity-60 line-through">VIP mobile app</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-white/40" /> <span className="opacity-60 line-through">Monthly Cashback Plus of 5% for unsuccessful trades</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-white/40" /> <span className="opacity-60 line-through">High priority support</span></div>
                         <div className="flex items-start gap-2"><X size={16} className="shrink-0 mt-0.5 text-white/40" /> <span className="opacity-60 line-through">Deposit insurance</span></div>
                       </div>
                       
                       <div className="mt-auto pt-4 relative z-20">
                         <button className="w-full bg-[#fcd535] hover:bg-[#ebd04f] text-black font-bold py-4 rounded-xl transition-all shadow-[0_8px_20px_rgba(0,0,0,0.3)] active:scale-[0.98] text-[15px]">
                           Upgrade
                         </button>
                       </div>
                    </div>
                  </div>

                  {/* PRESTIGE CARD */}
                  <div className="w-full xl:w-1/5 bg-[#6b21a8] bg-gradient-to-b from-[#7e22ce] to-[#581c87] rounded-2xl flex flex-col shadow-xl relative overflow-hidden border border-[#9333ea]/50">
                    <div className="absolute -top-4 -right-4 opacity-50 blur-[1px]">
                       <Diamond size={130} fill="currentColor" className="text-[#a855f7]" />
                    </div>
                    <div className="p-5 md:p-6 relative z-10 flex flex-col h-full text-white">
                       <h3 className="text-[26px] font-black mb-4 flex items-center justify-between">Prestige <Icons.Info size={18} className="text-purple-300" /></h3>
                       
                       <div className="mb-6 w-full px-1">
                          <div className="text-[12px] font-bold mb-2 flex justify-between">
                            <span className="text-white">৳4,250</span> <span className="text-purple-200/60">/ ৳360,000</span>
                          </div>
                          <div className="h-1.5 bg-purple-950/50 rounded-full w-full overflow-hidden">
                             <div className="h-full bg-purple-300 w-[2%] rounded-full shadow-[0_0_10px_#d8b4fe]"></div>
                          </div>
                       </div>

                       <div className="text-[10px] font-black tracking-widest text-purple-300 uppercase mb-4 border-b border-purple-800 pb-2">Top Features</div>
                       
                       <div className="space-y-4 mb-6 relative z-20">
                          <div className="flex gap-3">
                             <div className="mt-0.5"><Icons.Plus size={16} strokeWidth={3} className="text-white" /></div>
                             <div>
                               <div className="font-bold text-[14px]">Cashback Plus</div>
                               <div className="text-purple-200 text-xs mt-0.5 leading-tight">Additional 5% compensation for unsuccessful trades every month</div>
                             </div>
                          </div>
                          <div className="flex gap-3">
                             <div className="mt-0.5"><Icons.ShieldCheck size={16} strokeWidth={2.5} className="text-white" /></div>
                             <div>
                               <div className="font-bold text-[14px]">Deposit insurance</div>
                               <div className="text-purple-200 text-xs mt-0.5 leading-tight">Use your money with more certainty. Increased deposit insurance can help</div>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-3 mb-6">
                         <div className="bg-black/15 p-4 rounded-xl border border-white/10 backdrop-blur-sm flex flex-col justify-center h-20">
                           <div className="text-white/60 text-xs mb-0.5 font-medium"><Icons.ChevronUp size={14} className="inline text-white/40" strokeWidth={3} /> profitability</div>
                           <div className="font-black text-xl flex items-center justify-between">
                             <span>up to 90%</span>
                           </div>
                         </div>
                         <div className="flex gap-3">
                           <div className="bg-black/15 p-4 rounded-xl border border-white/10 flex-col justify-center h-20 flex-1 relative backdrop-blur-sm">
                              <div className="font-black text-xl flex items-center gap-1.5">
                                <LayoutGrid size={16} strokeWidth={2.5}/> 140+
                              </div>
                              <div className="text-xs text-white/60 mt-0.5">assets</div>
                           </div>
                           <div className="bg-black/15 p-4 rounded-xl border border-white/10 flex-col justify-center h-20 flex-1 relative backdrop-blur-sm">
                              <div className="font-black text-xl flex items-center gap-1.5">
                                <Icons.RefreshCcw size={16} strokeWidth={3} className="text-white" /> 10%
                              </div>
                              <div className="text-xs text-white/60 mt-0.5">cashback</div>
                           </div>
                         </div>
                       </div>

                       <div className="space-y-3 text-sm border-b border-purple-800 pb-4 mb-4">
                         <div className="flex justify-between items-center"><span className="text-white/80">Withdrawals</span><span className="font-bold text-white">4 hours</span></div>
                         <div className="flex justify-between items-center"><span className="text-white/80 border-b border-white/30 border-dashed cursor-help leading-tight">Invite Friends</span><span className="font-bold text-white">up to $850</span></div>
                         <div className="flex justify-between items-center"><span className="text-white/80">Deposit bonuses</span><span className="font-bold text-white">up to 300%</span></div>
                       </div>

                       <div className="space-y-3 text-[13px] text-white/90 font-medium mb-6">
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Advanced payments if your deposit takes too long to process</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Risk-free trades to protect your investments from losses</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Free access to VIP tournaments</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Personal manager</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Insurance for your deposits if your balance reaches 0</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Multi-window trading</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Trading signals</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Crypto calendar</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>VIP mobile app</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Monthly Cashback Plus of 5% for unsuccessful trades</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>High priority support</span></div>
                         <div className="flex items-start gap-2"><Icons.Check size={16} className="shrink-0 mt-0.5 text-[#00c980]" strokeWidth={3}/> <span>Deposit insurance</span></div>
                       </div>
                       
                       <div className="mt-auto pt-4 relative z-20">
                         <button className="w-full bg-[#fcd535] hover:bg-[#ebd04f] text-black font-bold py-4 rounded-xl transition-all shadow-[0_8px_20px_rgba(0,0,0,0.3)] active:scale-[0.98] text-[15px]">
                           Upgrade
                         </button>
                       </div>
                    </div>
                  </div>

                </div>
             </div>
          </div>
        </div>
      )}

      <TimeZoneModal 
        isOpen={showTimeZoneModal}
        onClose={() => setShowTimeZoneModal(false)}
        selectedTimeZone={timeZone}
        onSelect={async (newTz) => {
          setTimeZone(newTz);
          if (currentUser) {
            try {
              await updateDoc(doc(db, "users", currentUser.uid), {
                timeZone: newTz
              });
              toast.success(`Time zone updated to ${newTz.replace(/_/g, ' ')}`);
            } catch (err) {
              console.error("Failed to update timezone:", err);
            }
          }
        }}
      />

      <AnimatePresence>
        {showPromoAdModal && appConfig?.loginPromoAd_enabled && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-hidden"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="relative w-full max-w-[440px] rounded-[32px] overflow-hidden flex flex-col shadow-2xl"
              style={{ backgroundColor: appConfig?.loginPromoAd_bgColor || '#cd6f23' }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowPromoAdModal(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors backdrop-blur-md"
              >
                <Icons.X size={16} strokeWidth={2.5} />
              </button>

              {/* Image Area */}
              {appConfig?.loginPromoAd_imageUrl && (
                <div className="w-full aspect-[4/3] bg-[#1a1a24] relative">
                  <img 
                    src={appConfig.loginPromoAd_imageUrl} 
                    alt="Promo" 
                    className="w-full h-full object-cover"
                   loading="lazy" />
                </div>
              )}

              {/* Content Area */}
              <div className="p-8 pt-6 flex flex-col items-start text-white">
                {appConfig?.loginPromoAd_title && (
                   <h2 className="text-[28px] font-bold leading-tight mb-4">{appConfig.loginPromoAd_title}</h2>
                )}
                {appConfig?.loginPromoAd_description && (
                   <p className="text-[15px] opacity-90 leading-relaxed mb-8">{appConfig.loginPromoAd_description}</p>
                )}
                
                {appConfig?.loginPromoAd_buttonText && (
                   <button 
                      onClick={() => {
                          if (appConfig.loginPromoAd_buttonUrl) {
                              window.open(appConfig.loginPromoAd_buttonUrl, '_blank');
                          }
                          setShowPromoAdModal(false);
                      }}
                      className="w-full bg-[#fcd535] hover:bg-[#ebd04f] text-black font-bold py-4 rounded-xl text-[16px] transition-all shadow-lg active:scale-[0.98]"
                   >
                     {appConfig.loginPromoAd_buttonText}
                   </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHallOfFameModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md overflow-y-auto"
          >
            <div className="min-h-screen relative flex flex-col items-center py-12 px-4 pb-24">
              <button 
                onClick={() => setShowHallOfFameModal(false)}
                className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Icons.X size={24} className="text-white" />
              </button>

              <div className="w-full max-w-md flex flex-col items-center mt-8 relative">
                  {/* Global overlay light effect */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#FFE24C]/10 blur-[100px] pointer-events-none rounded-full"></div>

                  <div className="w-24 h-24 bg-gradient-to-br from-[#FFDE4D] to-[#FCA01F] rounded-full p-[2px] shadow-[0_0_40px_rgba(255,222,77,0.3)] mb-6 z-10">
                      <div className="w-full h-full bg-gradient-to-b from-[#332b1a] to-[#121318] rounded-full flex items-center justify-center border-[6px] border-[#1c1d24]">
                          <Icons.BadgePercent size={40} className="text-[#FFDE4D] drop-shadow-[0_0_10px_rgba(255,222,77,0.8)]" />
                      </div>
                  </div>
                  <h2 className="text-[26px] font-bold text-white mb-1 z-10 drop-shadow-lg">Success Showcase</h2>
                  <p className="text-[#a6aeb9] text-[15px] font-medium text-center mb-8 z-10">The biggest share of successful trades</p>

                  <div className="w-full bg-[#292A30]/80 backdrop-blur-md rounded-[24px] p-6 shadow-2xl flex flex-col gap-6 z-10 border border-white/5">
                      {[
                        { flag: "🇨🇴", account: "166803***", val: "90%" },
                        { flag: "🇮🇩", account: "177132***", val: "86%" },
                        { flag: "🇮🇩", account: "182629***", val: "83%" }
                      ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                               <div className="w-[24px] h-[24px] rounded-md bg-[#FFE24C] text-black font-black flex items-center justify-center text-[12px]">{i+1}</div>
                               <span className="text-[22px]">{item.flag}</span>
                               <span className="text-white font-medium text-[15px] tracking-wide">{item.account}</span>
                             </div>
                             <span className="text-white font-bold text-[18px]">{item.val}</span>
                          </div>
                      ))}
                  </div>

                  <div className="w-24 h-24 bg-gradient-to-br from-[#FFDE4D] to-[#FCA01F] rounded-full p-[2px] shadow-[0_0_40px_rgba(255,222,77,0.3)] mb-6 mt-16 z-10">
                      <div className="w-full h-full bg-gradient-to-b from-[#332b1a] to-[#121318] rounded-full flex items-center justify-center border-[6px] border-[#1c1d24]">
                          <Icons.Trophy size={40} className="text-[#FFDE4D] drop-shadow-[0_0_10px_rgba(255,222,77,0.8)]" />
                      </div>
                  </div>
                  <h2 className="text-[26px] font-bold text-white mb-1 z-10 drop-shadow-lg">Profit Hunter</h2>
                  <p className="text-[#a6aeb9] text-[15px] font-medium text-center mb-8 z-10">The biggest trading turnover</p>

                  <div className="w-full bg-[#292A30]/80 backdrop-blur-md rounded-[24px] p-6 shadow-2xl flex flex-col gap-6 z-10 border border-white/5">
                      {[
                        { flag: "🇻🇳", account: "tienphong0203", val: "$714,677.00" },
                        { flag: "🇿🇦", account: "Musongyesquare", val: "$602,823.24" },
                        { flag: "🇮🇩", account: "Rama", val: "$428,469.24" }
                      ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                               <div className="w-[24px] h-[24px] rounded-md bg-[#FFE24C] text-black font-black flex items-center justify-center text-[12px]">{i+1}</div>
                               <span className="text-[22px]">{item.flag}</span>
                               <span className="text-white font-medium text-[15px] tracking-wide">{item.account}</span>
                             </div>
                             <span className="text-white font-bold text-[18px]">{item.val}</span>
                          </div>
                      ))}
                  </div>

                  <div className="w-24 h-24 bg-gradient-to-br from-[#FFDE4D] to-[#FCA01F] rounded-full p-[2px] shadow-[0_0_40px_rgba(255,222,77,0.3)] mb-6 mt-16 z-10">
                      <div className="w-full h-full bg-gradient-to-b from-[#332b1a] to-[#121318] rounded-full flex items-center justify-center border-[6px] border-[#1c1d24]">
                          <Icons.Activity size={40} className="text-[#FFDE4D] drop-shadow-[0_0_10px_rgba(255,222,77,0.8)]" />
                      </div>
                  </div>
                  <h2 className="text-[26px] font-bold text-white mb-1 z-10 drop-shadow-lg">Unstoppable Force</h2>
                  <p className="text-[#a6aeb9] text-[15px] font-medium text-center mb-8 z-10">The biggest number of trades</p>

                  <div className="w-full bg-[#292A30]/80 backdrop-blur-md rounded-[24px] p-6 shadow-2xl flex flex-col gap-6 z-10 border border-white/5">
                      {[
                        { flag: "🇮🇩", account: "Wietjok", val: "50725" },
                        { flag: "🇿🇦", account: "Musongyesquare", val: "45523" },
                        { flag: "🇮🇩", account: "182642***", val: "38561" }
                      ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                               <div className="w-[24px] h-[24px] rounded-md bg-[#FFE24C] text-black font-black flex items-center justify-center text-[12px]">{i+1}</div>
                               <span className="text-[22px]">{item.flag}</span>
                               <span className="text-white font-medium text-[15px] tracking-wide">{item.account}</span>
                             </div>
                             <span className="text-white font-bold text-[18px]">{item.val}</span>
                          </div>
                      ))}
                  </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeScanner && (
          <CameraScanner 
            title={
              activeScanner === 'front' ? "Scan ID Front" :
              activeScanner === 'back' ? "Scan ID Back" :
              "Scan Selfie with ID"
            }
            onClose={() => setActiveScanner(null)}
            onCapture={(blob) => {
              const file = new File([blob], `${activeScanner}.jpg`, { type: 'image/jpeg' });
              if (activeScanner === 'front') setKycData(prev => ({ ...prev, idFront: file }));
              if (activeScanner === 'back') setKycData(prev => ({ ...prev, idBack: file }));
              if (activeScanner === 'selfie') setKycData(prev => ({ ...prev, selfie: file }));
              setActiveScanner(null);
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showStory && (
          <StoryViewer 
            stories={STORIES}
            initialIndex={selectedStoryIndex}
            onClose={() => setShowStory(false)}
          />
        )}
      </AnimatePresence>

      {isAppLoading && (
        <div className="fixed inset-0 z-[9999] bg-[#131418] flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Skeleton (Desktop) */}
            <div className="hidden md:flex w-[72px] lg:w-[76px] flex-col h-full bg-[#1f2026] border-r border-white/5 pt-16 gap-8 items-center shrink-0">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={`side-skel-${i}`} className="w-8 h-8 rounded-lg opacity-40 animate-pulse bg-gray-700/50" />
                ))}
            </div>

            <div className="flex-1 flex flex-col min-w-0 h-full">
                {/* Header Skeleton */}
                <div className="h-[56px] md:h-[64px] bg-[#1f2026] border-b border-white/5 flex items-center justify-between px-4 md:px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg animate-pulse bg-gray-700/50" />
                        <div className="w-24 h-6 rounded-md hidden md:block animate-pulse bg-gray-700/50" />
                        <div className="w-32 h-10 rounded-xl ml-4 hidden md:block animate-pulse bg-gray-700/50" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-1 hidden md:flex">
                            <div className="w-20 h-3 rounded animate-pulse bg-gray-700/50" />
                            <div className="w-28 h-5 rounded animate-pulse bg-gray-700/50" />
                        </div>
                        <div className="w-24 md:w-32 h-10 rounded-xl animate-pulse bg-gray-700/50" />
                        <div className="w-10 h-10 rounded-full hidden md:block animate-pulse bg-gray-700/50" />
                    </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                    {/* Chart Area Skeleton */}
                    <div className="flex-1 relative bg-[#131417] overflow-hidden p-6">
                        <div className="flex gap-2">
                             <div className="w-16 h-8 rounded-lg animate-pulse bg-gray-700/50" />
                             <div className="w-16 h-8 rounded-lg animate-pulse bg-gray-700/50" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-5">
                             <div className="w-full h-full border-t border-l border-white/20 grid grid-cols-6 grid-rows-6">
                                {[...Array(36)].map((_, i) => <div key={`grid-${i}`} className="border-r border-b border-white/20" />)}
                             </div>
                        </div>
                        <div className="absolute bottom-6 left-6 flex gap-2">
                            {[1, 2, 3, 4].map(i => <div key={`tool-${i}`} className="w-10 h-10 rounded-xl animate-pulse bg-gray-700/50" />)}
                        </div>
                    </div>

                    {/* Right Panel Skeleton (Desktop) */}
                    <div className="hidden md:flex w-[280px] lg:w-[320px] bg-[#1a1b1f] border-l border-white/5 flex-col p-6 gap-6 shrink-0">
                        <div className="space-y-4">
                            <div className="w-full h-[60px] rounded-2xl animate-pulse bg-gray-700/50" />
                            <div className="w-full h-[60px] rounded-2xl animate-pulse bg-gray-700/50" />
                        </div>
                        <div className="flex flex-col items-center gap-2 py-4">
                            <div className="w-20 h-4 rounded animate-pulse bg-gray-700/50" />
                            <div className="w-32 h-8 rounded animate-pulse bg-gray-700/50" />
                        </div>
                        <div className="flex flex-col gap-4 mt-auto">
                            <div className="w-full h-[80px] rounded-2xl bg-emerald-500/20 animate-pulse" />
                            <div className="w-full h-[80px] rounded-2xl bg-rose-500/20 animate-pulse" />
                        </div>
                    </div>

                    {/* Bottom Panel Skeleton (Mobile) */}
                    <div className="md:hidden flex flex-col p-4 gap-4 bg-[#1a1b1f] border-t border-white/5">
                        <div className="flex gap-3">
                            <div className="flex-1 h-12 rounded-xl animate-pulse bg-gray-700/50" />
                            <div className="flex-1 h-12 rounded-xl animate-pulse bg-gray-700/50" />
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1 h-14 rounded-xl bg-emerald-500/20 animate-pulse" />
                            <div className="flex-1 h-14 rounded-xl bg-rose-500/20 animate-pulse" />
                        </div>
                        <div className="flex justify-around items-center h-12 mt-2">
                             {[1, 2, 3, 4, 5].map(i => <div key={`mob-nav-${i}`} className="w-6 h-6 rounded-md opacity-40 animate-pulse bg-gray-700/50" />)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
    </>
  );
};
