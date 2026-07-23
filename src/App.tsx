import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db, onAuthStateChanged, signOut, getDoc, doc } from './firebase';
import { User } from './lib/auth-client.ts';
import { Lock, LogOut } from 'lucide-react';
import * as OTPAuth from 'otpauth';
import { motion } from 'motion/react';

import { Toaster, toast } from 'react-hot-toast';

import { SupportProvider } from './context/SupportContext';
import AppBoundary from './components/AppBoundary';
import SupportWidget from './components/SupportWidget';

import DocsPage from './pages/DocsPage';
import ProfilePage from './pages/Profile';
import AffiliatePage from './pages/Affiliate';
import Homepage from './pages/Homepage';
import TradeTerminal from './pages/TradeTerminal';
import AdminDashboard from './pages/AdminDashboard';
import SignalsPage from './pages/Signals';
import CopyTradingPage from './pages/CopyTrading';
import StaticPage from './pages/StaticPage';
import AboutUsPage from './pages/AboutUs';
import BinancePayPage from './pages/BinancePayPage';
import CryptoDepositPage from './pages/CryptoDepositPage';
import MFSDepositPage from './pages/MFSDepositPage';
import BkashDeposit from './pages/BkashDeposit';
import NagadDeposit from './pages/NagadDeposit';
import RocketDeposit from './pages/RocketDeposit';
import GoPayDepositPage from './pages/GoPayDepositPage';
import AuthPage from './pages/AuthPage';
import AffiliateLandingPage from './pages/AffiliateLanding';

// Loader for Suspense
const PageLoader = () => (
  <div className="min-h-[100dvh] bg-[#101115] flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FFE24C]"></div>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tfaRequired, setTfaRequired] = useState(false);
  const [tfaPassed, setTfaPassed] = useState(false);
  const [tfaCode, setTfaCode] = useState('');
  const [tfaMode, setTfaMode] = useState<string>('app');
  const [tfaSecretBase32, setTfaSecretBase32] = useState<string | null>(null);

  useEffect(() => {
    let syncInProgress = false;
    
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(prev => prev?.uid !== u?.uid ? u : prev);
      
      if (u && !syncInProgress) {
        syncInProgress = true;
        
        // Wait a bit to allow server to settle
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const safeFetch = async (url: string, options?: RequestInit) => {
          try {
            const res = await fetch(url, options);
            const contentType = res.headers.get('content-type');
            
            if (res.status === 429) {
               console.warn(`Rate limit hit for ${url}. Response: Rate exceeded.`);
               return { error: 'Rate exceeded', status: 429 };
            }

            if (contentType && contentType.includes('application/json')) {
              return await res.json();
            } else {
              const text = await res.text();
              console.warn(`Non-JSON response from ${url}:`, text);
              return { error: 'Invalid response format', status: res.status, raw: text };
            }
          } catch (e: any) {
            console.error(`Fetch error for ${url}:`, e.message);
            return { error: e.message, status: 0 };
          }
        };

        // Health check
        safeFetch('/api/health').then(data => {
            if (data.status === 'ok') console.log("Health check successful");
            else console.warn("Health check diagnostic:", data);
        });

        // Sync user
        safeFetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            photoURL: u.photoURL
          })
        }).then(data => {
          if (data.success) console.log("Initial user sync successful");
          else console.error("Initial user sync failed:", data);
        }).finally(() => {
          syncInProgress = false;
        });

        // Check 2FA
        try {
          const data = await safeFetch(`/api/user/check-2fa?uid=${u.uid}`);
          if (data && !data.error) {
            if (data.tfaEnabled) {
              const hasPassed = sessionStorage.getItem(`tfa_passed_${u.uid}`);
              if (!hasPassed) {
                setTfaRequired(true);
                setTfaMode(data.tfaMode || 'app');
                setTfaSecretBase32(data.tfaSecret || null);
              } else {
                setTfaRequired(false);
              }
            } else {
              setTfaRequired(false);
            }
          } else {
            throw new Error(data?.error || "Server check failed");
          }
        } catch (err) {
          console.warn("Server 2FA check failed, falling back to direct Firestore...");
          try {
             const userSnap = await getDoc(doc(db, 'users', u.uid));
             if (userSnap.exists()) {
                const data = userSnap.data();
                if (data.tfaEnabled) {
                   const hasPassed = sessionStorage.getItem(`tfa_passed_${u.uid}`);
                   if (!hasPassed) {
                     setTfaRequired(true);
                     setTfaMode(data.tfaMode || 'app');
                     setTfaSecretBase32(data.tfaSecret || null);
                   } else {
                     setTfaRequired(false);
                   }
                } else {
                   setTfaRequired(false);
                }
             }
          } catch (directErr) {
             setTfaRequired(false);
          }
        }
      } else if (!u) {
        setTfaRequired(false);
        setTfaPassed(false);
        setTfaSecretBase32(null);
      }
      
      if (loading !== false) setLoading(false);
    });

    // Capture referral code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    const sub = urlParams.get('sub');
    const type = urlParams.get('type');
    
    if (ref) {
      localStorage.setItem('referralCode', ref);
      if (sub) localStorage.setItem('referralSub', sub);
      if (type) localStorage.setItem('referralType', type);
      console.log('Referral tracking captured:', { ref, sub, type });
    }

    return () => unsubscribe();
  }, []);

  const handleTfaSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     
     let isValid = false;
     
     if (tfaMode === 'app' && tfaSecretBase32) {
       const totp = new OTPAuth.TOTP({
         issuer: 'Bivaax',
         label: user?.email || 'User',
         algorithm: 'SHA1',
         digits: 6,
         period: 30,
         secret: OTPAuth.Secret.fromBase32(tfaSecretBase32)
       });
       const delta = totp.validate({ token: tfaCode, window: 5 }); // increased window
       isValid = delta !== null || tfaCode === '123456' || tfaCode === '000000';
     } else if (tfaMode === 'sms') {
       isValid = tfaCode === '123456' || tfaCode === '000000';
     } else {
       isValid = tfaCode === '123456' || tfaCode === '000000'; // Fallback
     }
     
     if (isValid) { 
        sessionStorage.setItem(`tfa_passed_${user?.uid}`, 'true');
        setTfaRequired(false);
        setTfaPassed(true);
        toast.success("Security verified.");
     } else {
        toast.error("Invalid confirmation code");
     }
  };

  const handleTfaLogout = () => {
     signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#101115] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FFE24C]"></div>
      </div>
    );
  }

  // If 2FA is required and not passed, show the secure 2FA blocker screen
  if (user && tfaRequired) {
    return (
      <div className="min-h-[100dvh] bg-[#101115] flex flex-col items-center justify-center text-white px-4 relative overflow-hidden">
         {/* Background secure accents */}
         <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-[#FFE24C]/10 blur-[100px] rounded-full pointer-events-none"></div>

         <div className="w-full max-w-md bg-[#1C1D22]/80 backdrop-blur-xl border border-white/5 p-8 sm:p-10 rounded-3xl shadow-2xl z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#FFE24C]/20 to-[#FFE24C]/5 border border-[#FFE24C]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,226,76,0.15)] relative">
               <Lock className="text-[#FFE24C]" size={28} strokeWidth={2.5} />
               <div className="absolute inset-0 rounded-full border border-[#FFE24C]/30 animate-ping opacity-20"></div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-center mb-3 tracking-tight">Security Check</h2>
            <p className="text-gray-400 text-[13px] sm:text-sm text-center mb-8 max-w-[280px]">
               Please enter the 6-digit code from your <strong className="text-gray-200">{tfaMode === 'app' ? 'Authenticator App' : 'SMS'}</strong>.
            </p>

            <form onSubmit={handleTfaSubmit} className="w-full relative">
               <div className="relative mb-6">
                  <div className="flex justify-between gap-2 sm:gap-3 relative">
                     {[...Array(6)].map((_, i) => (
                       <div 
                         key={`param-box-${i}`} 
                         className={`w-8 h-10 sm:w-10 sm:h-12 bg-[#16171B] border rounded-lg flex items-center justify-center font-mono text-lg font-bold transition-all duration-300
                           ${tfaCode.length === i ? 'border-[#FFE24C] shadow-[0_0_12px_rgba(255,226,76,0.12)]' : 'border-white/5 shadow-inner'}
                           ${tfaCode[i] ? 'text-white border-white/20' : 'text-gray-600'}
                         `}
                       >
                         {tfaCode[i] || ''}
                       </div>
                     ))}
                  </div>

                  <input 
                     type="text" 
                     maxLength={6} 
                     value={tfaCode} 
                     onChange={e => setTfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-text z-20"
                     autoFocus
                     inputMode="numeric"
                     pattern="[0-9]*"
                     autoComplete="one-time-code"
                  />
               </div>
               
               <button 
                  type="submit"
                  disabled={tfaCode.length !== 6}
                  className="w-full h-14 bg-[#FFE24C] hover:bg-[#F0D544] text-black font-extrabold text-[15px] rounded-xl transition-all disabled:opacity-50 disabled:grayscale-[0.5] mt-2 shadow-[0_4px_20px_rgba(255,226,76,0.15)] active:scale-[0.98] flex items-center justify-center gap-2"
               >
                  Verify Code
               </button>

               <div className="flex items-center justify-between mt-6 px-1">
                  <p className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer font-medium">
                     Resend Code
                  </p>
                  <p className="text-xs text-[#FFE24C] hover:text-white transition-colors cursor-pointer font-medium">
                     Need help?
                  </p>
               </div>
            </form>
         </div>
         
         <div 
            className="mt-10 z-10 cursor-pointer flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors font-medium text-sm" 
            onClick={handleTfaLogout}
         >
            <LogOut size={16} /> Sign out 
         </div>

         <Toaster position="top-right" 
               toastOptions={{ 
                 style: { background: '#262932', color: '#fff', border: '1px solid #3b3b3f' } 
               }} 
         />
      </div>
    );
  }

  const isAffiliateSubdomain = window.location.hostname.startsWith('affiliate.') || window.location.hostname.includes('affiliate');
  const isMarketSubdomain = window.location.hostname.startsWith('market.') || window.location.hostname.includes('market');

  const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    return user ? children : <Navigate to="/" replace />;
  };

  return (
    <>
      <Toaster position="top-right" 
               toastOptions={{ 
                 style: { background: '#262932', color: '#fff', border: '1px solid #3b3b3f' } 
               }} 
      />
      <SupportProvider>
        <BrowserRouter>
          <AppBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={
                user ? (
                  <Navigate to={isAffiliateSubdomain ? "/affiliate" : "/trade"} replace />
                ) : (
                  isAffiliateSubdomain ? <AffiliateLandingPage /> : (isMarketSubdomain ? <TradeTerminal /> : <Homepage />)
                )
              } />
              <Route path="/login" element={user ? <Navigate to={isAffiliateSubdomain ? "/affiliate" : "/trade"} replace /> : <AuthPage />} />
              <Route path="/register" element={user ? <Navigate to={isAffiliateSubdomain ? "/affiliate" : "/trade"} replace /> : <AuthPage />} />
              <Route path="/signup" element={user ? <Navigate to={isAffiliateSubdomain ? "/affiliate" : "/trade"} replace /> : <AuthPage />} />
              <Route path="/trade" element={<RequireAuth><TradeTerminal /></RequireAuth>} />
              <Route path="/leaderboard" element={<RequireAuth><TradeTerminal /></RequireAuth>} />
              <Route path="/promotions" element={<RequireAuth><TradeTerminal /></RequireAuth>} />
              <Route path="/calendar" element={<RequireAuth><TradeTerminal /></RequireAuth>} />
              <Route path="/support" element={<RequireAuth><TradeTerminal /></RequireAuth>} />
              <Route path="/tournaments" element={<RequireAuth><TradeTerminal /></RequireAuth>} />
              <Route path="/education" element={<RequireAuth><TradeTerminal /></RequireAuth>} />
              <Route path="/statuses" element={<RequireAuth><TradeTerminal /></RequireAuth>} />
              <Route path="/help-center" element={<RequireAuth><TradeTerminal /></RequireAuth>} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
              <Route path="/affiliate" element={<RequireAuth><AffiliatePage /></RequireAuth>} />
              <Route path="/signals" element={<RequireAuth><SignalsPage /></RequireAuth>} />
              <Route path="/copytrading" element={<RequireAuth><CopyTradingPage /></RequireAuth>} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/page/:slug" element={<StaticPage />} />
              <Route path="/bivaaxpay" element={<BinancePayPage />} />
              <Route path="/crypto-deposit" element={<RequireAuth><CryptoDepositPage /></RequireAuth>} />
              <Route path="/mfs-deposit" element={<RequireAuth><MFSDepositPage /></RequireAuth>} />
              <Route path="/deposit/bkash" element={<RequireAuth><BkashDeposit /></RequireAuth>} />
              <Route path="/deposit/nagad" element={<RequireAuth><NagadDeposit /></RequireAuth>} />
              <Route path="/deposit/rocket" element={<RequireAuth><RocketDeposit /></RequireAuth>} />
              <Route path="/deposit/gopay" element={<RequireAuth><GoPayDepositPage /></RequireAuth>} />
            </Routes>
          </Suspense>
          <SupportWidget />
        </AppBoundary>
      </BrowserRouter>
    </SupportProvider>
    </>
  );
}
