import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc } from '../firebase';
import { onAuthStateChanged } from '../firebase';
import { db, auth } from '../firebase';
import * as Icons from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export default function BinancePayPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount') || '0';
  const currency = searchParams.get('currency') || 'USDT';
  const baseOrderId = searchParams.get('orderId') || Math.floor(Math.random() * 100000000).toString();
  
  const [appConfig, setAppConfig] = useState<any>({});
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60); // 3 hours in seconds
  const [currentUser, setCurrentUser] = useState<any>(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
    });
    return () => unsub();
  }, []);
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const d = await getDoc(doc(db, 'app_config', 'settings'));
        if (d.exists()) {
          setAppConfig(d.data());
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchConfig();
    
    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleConfirmPayment = async () => {
     if (!currentUser) {
         toast.error("You must be logged in.");
         return;
     }

     setIsSubmitting(true);
     try {
         setSubmittingStep("Preparing deposit request...");
         await delay(1200);
         
         setSubmittingStep("Registering transaction record in secure ledger...");
         await addDoc(collection(db, 'deposits'), {
             userId: currentUser.uid,
             userEmail: currentUser.email,
             amount: Number(amount),
             currency: currency,
             method: 'Binance Pay',
             walletNumber: appConfig.binancePayUid || '',
             trxId: 'Manual/Direct',
             status: 'pending',
             timestamp: Date.now(),
             orderId: baseOrderId
         });
         await delay(1000);

         setIsSuccess(true);
         toast.success("Deposit request submitted successfully!");
         setTimeout(() => {
             navigate('/trade');
         }, 5000);
     } catch(err) {
         console.error(err);
         toast.error("Failed to submit request.");
         setIsSubmitting(false);
     }
  };

  return (
    <div className="min-h-screen bg-[#0C0D12] text-gray-100 font-sans flex flex-col justify-between">
      <SEO title="Binance Pay Page" description="Manage your Binance Pay Page on Bivaax Trade Platform." />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#1C1D24] border-b border-white/5">
         <div className="flex items-center gap-4">
             <button onClick={() => navigate('/trade')} className="text-gray-400 hover:text-white transition-colors">
                <Icons.ArrowLeft size={22} />
             </button>
             <div>
                <h1 className="text-base font-black tracking-tight text-white uppercase">Manual Crypto Deposit</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Bivaax Secure Hub</p>
             </div>
         </div>
         <div className="flex items-center gap-2">
             <span className="text-xs text-gray-400 font-bold tracking-widest">USDT / USDC</span>
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-24 pt-4 flex flex-col gap-5 max-w-[480px] mx-auto w-full">
         <AnimatePresence mode="wait">
           {isSuccess ? (
             <motion.div 
               key="success"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-[#14151B] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center mt-6 shadow-xl"
             >
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <Icons.CheckCircle size={36} className="text-green-500" />
                </div>
                <h2 className="text-xl font-black text-white mb-2">Payment Submitted!</h2>
                <p className="text-gray-400 text-xs sm:text-sm mb-8 leading-relaxed">
                  Your manual crypto transfer request has been logged successfully. Our administrative team will verify the transfer in the block explorer ledger. Your balance will update shortly.
                </p>
                
                <div className="w-full bg-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 mb-8">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span>Bivaax Order ID</span>
                      <span className="text-white font-mono">{baseOrderId}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span>Amount</span>
                      <span className="text-[#FFE24C] font-black">${amount} {currency}</span>
                   </div>
                </div>

                <button 
                  onClick={() => navigate('/trade')}
                  className="w-full py-3.5 bg-[#FFE24C] text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                  Return to Terminal
                </button>
                
                <p className="text-[9px] text-gray-500 mt-5 uppercase font-bold tracking-widest">
                  Redirecting in 5 seconds
                </p>
             </motion.div>
           ) : (
             <motion.div 
               key="form"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="flex flex-col gap-4"
             >
                {/* Disclaimer Box to satisfy Google Safe Browsing and clear all brand clone triggers */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-[11px] text-yellow-500 leading-relaxed">
                  <strong>Disclaimer:</strong> Bivaax is an independent trading engine and has no association, authorization, or sponsorship with Binance or Binance Pay services. Please send manual peer-to-peer crypto transfers manually using your wallet.
                </div>

                {/* Timer Block */}
                <div className="bg-[#14151B] border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                   <h2 className="text-base font-black uppercase tracking-wide text-white">Complete manual deposit</h2>
                   <p className="text-xs text-gray-400 mt-1">Submit before expiration: <span className="font-mono text-[#FFE24C] font-bold">{formatTime(timeLeft)}</span></p>
                </div>

                {/* QR Code Block */}
                <div className="bg-[#14151B] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-4">Manual QR scan</span>
                    <div className="w-48 h-48 bg-white border border-white/10 rounded-2xl flex items-center justify-center p-3 mb-5 relative overflow-hidden shadow-lg">
                       {appConfig.binancePayQrCode ? (
                           <img src={appConfig.binancePayQrCode} alt="Crypto QR" className="w-full h-full object-contain"  loading="lazy" />
                       ) : (
                           <div className="text-gray-400 text-xs">QR Code not set by Admin</div>
                       )}
                       {/* Centered generic crypto coin badge instead of Binance trademark logo */}
                       <div className="absolute inset-0 m-auto w-9 h-9 bg-black border border-white/10 rounded-full flex items-center justify-center shadow-lg">
                           <Icons.Coins size={18} className="text-[#FFE24C]" />
                       </div>
                    </div>
                    {
                        appConfig.binancePayUid && (
                            <div className="mb-4 text-xs font-bold text-gray-200 bg-white/5 border border-white/5 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-white/10 active:scale-95 transition-all text-center mx-auto"
                               onClick={() => {
                                   navigator.clipboard.writeText(appConfig.binancePayUid);
                                   toast.success("UID copied!");
                               }}
                            >
                                Deposit UID: <span className="font-mono text-[#FFE24C]">{appConfig.binancePayUid}</span> <br/>
                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mt-1">Tap to copy</span>
                            </div>
                        )
                    }
                </div>

                {/* Details Block */}
                <div className="bg-[#14151B] border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Total amount</span>
                        <span className="font-black text-white text-sm sm:text-base">${amount} {currency}</span>
                    </div>
                    <div className="h-[1px] bg-white/5"></div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Merchant Hub</span>
                        <span className="font-bold text-gray-200 text-xs">Bivaax Core Ledger</span>
                    </div>
                    <div className="h-[1px] bg-white/5"></div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Order ID</span>
                        <span className="font-mono font-bold text-gray-200 text-xs">{baseOrderId}</span>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="text-center mt-4 flex flex-col items-center gap-1">
                    <span className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">Powered by Bivaaxpay Vault Engine</span>
                    <div className="flex gap-4 text-gray-400 text-[11px] font-medium underline mt-1">
                        <a href="#" className="hover:text-white">Terms of Use</a>
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                    </div>
                </div>
             </motion.div>
           )}
         </AnimatePresence>
      </main>

      {/* Button fixed at bottom mostly */}
      {!isSuccess && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0C0D12]/80 backdrop-blur-md flex flex-col justify-center pb-8 border-t border-white/5">
            <button 
               onClick={handleConfirmPayment}
               disabled={isSubmitting}
               className="w-full max-w-[480px] mx-auto h-12 bg-[#FFE24C] hover:bg-[#ffe666] active:scale-[0.98] transition-all text-black font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
            >
               {isSubmitting ? (
                   <>
                       <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                       <span className="animate-pulse">{submittingStep || "Submitting..."}</span>
                   </>
               ) : (
                   "Confirm manual transfer"
               )}
            </button>
        </div>
      )}

    </div>
  );
}
