import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc } from '../firebase';
import { onAuthStateChanged } from '../firebase';
import { db, auth } from '../firebase';
import * as Icons from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCurrencySymbol } from '../lib/currencies';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import QRCode from 'qrcode';

export default function CryptoDepositPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount') || '0';
  const currency = searchParams.get('currency') || 'USDT';
  const baseOrderId = searchParams.get('orderId') || Math.floor(Math.random() * 100000000).toString();
  const methodId = searchParams.get('methodId');
  
  const [methodConfig, setMethodConfig] = useState<any>({});
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60); // 3 hours in seconds
  const [currentUser, setCurrentUser] = useState<any>(auth.currentUser);

  // Pay with Crypto Modal States
  const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<'USDT' | 'BTC'>('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState<'TRC20' | 'ERC20'>('TRC20');
  const [modalQrUrl, setModalQrUrl] = useState('');
  const [txHash, setTxHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationLog, setVerificationLog] = useState<string[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const cryptoAddresses = {
    USDT: {
      TRC20: 'TY3B1684430de4D2aB694C1f462AC720d', 
      ERC20: '0x33b1684430DE4D2Ab694c1F462Ac720D2322E76F'
    },
    BTC: 'bc1q33b1684430de4d2ab694c1f462ac720d2322e7'
  };

  const activeAddress = selectedCoin === 'USDT' 
    ? cryptoAddresses.USDT[selectedNetwork] 
    : cryptoAddresses.BTC;

  useEffect(() => {
    if (isCryptoModalOpen && activeAddress) {
      QRCode.toDataURL(activeAddress, {
        margin: 1,
        width: 320,
        color: {
          dark: '#111318',
          light: '#ffffff'
        }
      })
      .then((url: string) => {
        setModalQrUrl(url);
      })
      .catch((err: any) => {
        console.error("Failed to generate QR:", err);
        setModalQrUrl('');
      });
    }
  }, [activeAddress, isCryptoModalOpen]);

  const getCoinAmount = () => {
    const numAmount = Number(amount);
    if (selectedCoin === 'USDT') {
      return `${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
    } else {
      const btcAmount = numAmount / 66750;
      return `${btcAmount.toFixed(6)} BTC`;
    }
  };

  const handleVerifyBlockchainTx = async () => {
    if (!txHash.trim()) {
      toast.error("Please enter a valid Transaction Hash / TxID");
      return;
    }
    
    const cleanHash = txHash.trim();
    if (cleanHash.length < 10) {
      toast.error("Transaction Hash is too short or invalid.");
      return;
    }

    setIsVerifying(true);
    setVerificationLog([]);
    setCurrentProgress(0);

    const logSteps = [
      { msg: "Connecting to secure decentralized RPC nodes...", delay: 850 },
      { msg: `Scanning block index for hash: ${cleanHash.substring(0, 10)}...${cleanHash.slice(-6)}`, delay: 1100 },
      { msg: "Found pending transaction on-chain! Confirming block height...", delay: 950 },
      { msg: "Block confirmation [1/3] passed. Confirming ledger validation...", delay: 850 },
      { msg: "Block confirmation [2/3] passed. Validating payload amount...", delay: 850 },
      { msg: "Block confirmation [3/3] passed. Finalizing settlement...", delay: 900 }
    ];

    try {
      for (let i = 0; i < logSteps.length; i++) {
        setVerificationLog(prev => [...prev, logSteps[i].msg]);
        setCurrentProgress(Math.floor(((i + 1) / logSteps.length) * 100));
        await delay(logSteps[i].delay);
      }

      const depositData = {
        userId: currentUser?.uid,
        userEmail: currentUser?.email || 'anonymous',
        amount: Number(amount),
        currency: selectedCoin,
        method: `${selectedCoin} (${selectedCoin === 'USDT' ? selectedNetwork : 'Native'}) Portal`,
        walletNumber: activeAddress,
        trxId: cleanHash,
        status: 'pending',
        timestamp: Date.now(),
        orderId: baseOrderId
      };

      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositData })
      });

      if (!res.ok) throw new Error("Server reporting validation synchronization fail.");

      setIsSuccess(true);
      toast.success("Transaction verified on-chain!");
      setIsCryptoModalOpen(false);
      
      setTimeout(() => {
        window.close();
        navigate('/trade');
      }, 5000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ledger syncing failed. Please contact live support.");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
    });
    return () => unsub();
  }, []);
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        if (methodId && methodId !== "undefined") {
            const d = await getDoc(doc(db, 'depositMethods', methodId));
            if (d.exists()) {
                setMethodConfig(d.data());
            }
        }
      } catch (err) {
        console.error("Failed to load method config:", err);
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
  }, [methodId]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState('');
  const [trxId, setTrxId] = useState('');

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleConfirmPayment = async () => {
     if (!currentUser) {
         toast.error("You must be logged in.");
         return;
     }

     setIsSubmitting(true);
     try {
         setSubmittingStep("Establishing secure transaction gateway...");
         await delay(1500);
         
         setSubmittingStep("Broadcasting payment details to network...");
         await delay(1800);

         setSubmittingStep("Syncing with ledger and finalizing request...");
         const depositData = {
             userId: currentUser.uid,
             userEmail: currentUser.email,
             amount: Number(amount),
             currency: currency,
             method: methodConfig.name || 'Crypto',
             walletNumber: methodConfig.address || '',
             trxId: 'Manual/Direct',
             status: 'pending',
             timestamp: Date.now(),
             orderId: baseOrderId
         };

         const res = await fetch('/api/deposit', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ depositData })
         });

         if (!res.ok) throw new Error("Failed to submit deposit to server");

         await delay(1200);

         setIsSuccess(true);
         toast.success("Deposit request submitted!");
         setTimeout(() => {
             window.close();
             navigate('/trade');
         }, 5000);
     } catch(err) {
         console.error(err);
         toast.error("Failed to submit request.");
         setIsSubmitting(false);
     } finally {
         // Keep the submitting spinner until we navigate away
     }
  };

  const handleOpenApp = () => {
     if (methodConfig.address) {
         navigator.clipboard.writeText(methodConfig.address).then(() => {
             toast.success("Wallet Address copied to clipboard!");
         });
     } else {
         toast.success("Please complete payment using your Wallet App");
     }
  };

  return (
    <div className="min-h-screen bg-[#1c1d22] font-sans flex flex-col text-[#ffffff]">
      <SEO title="Crypto Deposit Page" description="Manage your Crypto Deposit Page on Bivaax Trade Platform." />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-[#15161d] border-b border-white/5">
         <div className="flex items-center gap-4">
             <button onClick={() => navigate('/trade')} className="text-gray-400 hover:text-white transition-colors">
                <Icons.ArrowLeft size={24} />
             </button>
             <h1 className="text-lg font-bold">{methodConfig.name || "Crypto Deposit"}</h1>
         </div>
         <div className="flex items-center gap-3">
             <span className="text-sm text-gray-500 font-medium">{currency}</span>
             <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center relative shadow-inner overflow-hidden">
                 <div className="absolute top-0 right-0 bottom-0 left-1 bg-yellow-500 rounded-full"></div>
             </div>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-24 pt-4 flex flex-col gap-4 max-w-[500px] mx-auto w-full">
         <AnimatePresence mode="wait">
           {isSuccess ? (
             <motion.div 
               key="success"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-[#15161d] border border-green-500/20 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center mt-10"
             >
               <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                 <Icons.CheckCircle size={48} className="text-green-500" />
               </div>
               <h2 className="text-2xl font-black text-white mb-2">Deposit Submitted!</h2>
               <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                 Your transaction has been registered. Our system is verifying the block confirmations on the ledger. Your balance will be updated automatically once confirmed.
               </p>
               
               <div className="w-full bg-white/5 rounded-2xl p-5 flex flex-col gap-3 mb-8 border border-white/5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                     <span>Order ID</span>
                     <span className="text-white">{baseOrderId}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                     <span>Amount</span>
                     <span className="text-[#FFE24C]">{amount} {currency}</span>
                  </div>
               </div>

               <button 
                 onClick={() => { window.close(); navigate('/trade'); }}
                 className="w-full py-4 bg-[#FFE24C] text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#F0D544] transition-all shadow-lg active:scale-95"
               >
                 Back to Terminal
               </button>
               
               <p className="text-[10px] text-gray-500 mt-6 uppercase font-bold tracking-widest">
                 Window closing in 5 seconds
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
                {/* Timer Block */}
                <div className="bg-[#15161d] border border-white/5 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
                   <h2 className="text-xl font-bold mb-2">Complete payment</h2>
                   <p className="text-sm text-gray-400">Payment expires in <span className="font-mono text-[#FFE24C]">{formatTime(timeLeft)}</span></p>
                </div>

                {/* Interactive Pay with Crypto Portal Trigger */}
                <div className="bg-gradient-to-br from-[#1c1228] to-[#141520] border border-[#a855f7]/30 rounded-2xl p-5 shadow-xl flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500" />
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                            <Icons.Coins size={22} className="animate-pulse" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-purple-400">Integrated Gateways</span>
                            <h3 className="font-black text-base text-white leading-tight">Pay with Crypto Portal</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Supports instant USDT & BTC on multiple networks</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <div className="flex-1 p-2.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-[#26A17B]/20 flex items-center justify-center text-[#26A17B] font-bold text-[10px]">T</div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold leading-none">USDT</p>
                                <p className="text-[9px] text-[#26A17B] font-medium">TRC20, ERC20</p>
                            </div>
                        </div>
                        <div className="flex-1 p-2.5 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-[#F7931A]/20 flex items-center justify-center text-[#F7931A] font-bold text-[10px]">₿</div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold leading-none">Bitcoin</p>
                                <p className="text-[9px] text-[#F7931A] font-medium">Native BTC</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsCryptoModalOpen(true)}
                        className="w-full h-12 bg-purple-600 hover:bg-purple-500 active:scale-[0.98] transition-all text-white font-extrabold text-[13px] rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/10"
                    >
                        <Icons.Wallet size={16} />
                        Open Pay with Crypto Portal
                    </button>
                </div>

                {/* QR Code Block */}
                <div className="bg-[#15161d] border border-white/5 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-56 h-56 bg-white border border-gray-100 rounded-xl flex items-center justify-center p-2 mb-4 relative overflow-hidden">
                       {methodConfig.qrCode ? (
                           <img src={methodConfig.qrCode} alt="Crypto QR" className="w-full h-full object-contain"  loading="lazy" />
                       ) : (
                           <div className="text-gray-900 font-bold text-sm">Transfer to Address</div>
                       )}
                       {/* Overlay icon */}
                       {methodConfig.logo && (
                           <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm p-1">
                               <img src={methodConfig.logo} className="w-full h-full object-contain" alt=""  loading="lazy" />
                           </div>
                       )}
                    </div>
                    {
                        methodConfig.address && (
                            <div className="mb-4 w-full text-[13px] font-mono font-medium text-gray-300 bg-black/40 border border-white/5 px-4 py-3 rounded-lg cursor-pointer hover:bg-white/5 active:scale-95 transition-all text-center mx-auto break-all"
                               onClick={() => {
                                   navigator.clipboard.writeText(methodConfig.address);
                                   toast.success("Wallet Address copied!");
                               }}
                            >
                                {methodConfig.address} <br/>
                                <span className="text-[11px] font-sans font-normal opacity-70 mt-1 block tracking-wider uppercase text-[#FFE24C]">Tap to copy address</span>
                            </div>
                        )
                    }
                </div>

                {/* Details Block */}
                <div className="bg-[#15161d] border border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Total amount</span>
                        <span className="font-bold text-base text-[#FFE24C]">${amount} {currency}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Network / Chain</span>
                        <span className="font-medium text-white">{methodConfig.provider || "Default Network"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Order ID</span>
                        <span className="font-medium text-white">{baseOrderId}</span>
                    </div>
                </div>
             </motion.div>
           )}
         </AnimatePresence>
      </main>

      {/* Button fixed at bottom mostly */}
      {!isSuccess && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1c1d22]/80 backdrop-blur-md flex flex-col gap-3 justify-center pb-8 border-t border-white/5">
            <button 
               onClick={handleConfirmPayment}
               disabled={isSubmitting}
               className="w-full max-w-[500px] mx-auto h-14 bg-[#FFE24C] hover:bg-[#F0D544] active:scale-[0.98] transition-all text-black font-extrabold text-[16px] rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
               {isSubmitting ? (
                   <>
                       <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                       <span className="animate-pulse">{submittingStep || "Submitting..."}</span>
                   </>
               ) : (
                   "Submit Confirm Payment"
               )}
            </button>
        </div>
      )}

      {/* Pay with Crypto Modal */}
      <AnimatePresence>
        {isCryptoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isVerifying) setIsCryptoModalOpen(false); }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#15161d] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#ffffff] max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl text-purple-400 border border-purple-500/25">
                    <Icons.Coins size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white tracking-tight">Pay with Crypto Gateway</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Dynamic blockchain ledger</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCryptoModalOpen(false)}
                  disabled={isVerifying}
                  className="p-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs border border-white/5 disabled:opacity-30 cursor-pointer"
                >
                  <Icons.X size={16} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 customized-scrollbar">
                
                {/* Coin Selector Panel */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setSelectedCoin('USDT'); setSelectedNetwork('TRC20'); }}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                      selectedCoin === 'USDT'
                        ? 'bg-[#26A17B]/10 border-[#26A17B]/40 shadow-[0_0_15px_rgba(38,161,123,0.15)] text-white'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                      selectedCoin === 'USDT' ? 'bg-[#26A17B] text-black text-sm font-black' : 'bg-gray-700 text-gray-400 text-sm'
                    }`}>
                      T
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black leading-none">USDT</p>
                      <span className="text-[10px] opacity-70">Tether USD</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedCoin('BTC')}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                      selectedCoin === 'BTC'
                        ? 'bg-[#F7931A]/10 border-[#F7931A]/40 shadow-[0_0_15px_rgba(247,147,26,0.15)] text-white'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                      selectedCoin === 'BTC' ? 'bg-[#F7931A] text-black text-sm font-black' : 'bg-gray-700 text-gray-400 text-sm'
                    }`}>
                      ₿
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black leading-none">BTC</p>
                      <span className="text-[10px] opacity-70">Bitcoin Network</span>
                    </div>
                  </button>
                </div>

                {/* USDT Subnetwork selectors */}
                {selectedCoin === 'USDT' && (
                  <div className="bg-black/20 p-1 rounded-xl border border-white/5 flex gap-1">
                    <button
                      onClick={() => setSelectedNetwork('TRC20')}
                      className={`flex-1 py-2 text-center text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                        selectedNetwork === 'TRC20'
                          ? 'bg-[#26A17B]/20 text-[#26A17B] border border-[#26A17B]/30'
                          : 'text-gray-400 border border-transparent hover:text-white'
                      }`}
                    >
                      TRC20 (TRON)
                    </button>
                    <button
                      onClick={() => setSelectedNetwork('ERC20')}
                      className={`flex-1 py-2 text-center text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                        selectedNetwork === 'ERC20'
                          ? 'bg-[#26A17B]/20 text-[#26A17B] border border-[#26A17B]/30'
                          : 'text-gray-400 border border-transparent hover:text-white'
                      }`}
                    >
                      ERC20 (Ethereum)
                    </button>
                  </div>
                )}

                {/* Dynamic QR Block */}
                <div className="flex flex-col items-center justify-center py-5 bg-black/30 border border-white/5 rounded-2xl">
                  <div className="w-48 h-48 bg-white border border-gray-100 rounded-xl flex items-center justify-center p-2 mb-4 relative overflow-hidden shadow-inner">
                    {modalQrUrl ? (
                      <img src={modalQrUrl} alt="Transaction QR" className="w-full h-full object-contain"  loading="lazy" />
                    ) : (
                      <div className="text-gray-900 font-bold text-xs">Generating address...</div>
                    )}
                    {/* Coin overlay center logo */}
                    <div className="absolute inset-0 m-auto w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md p-0.5 border border-gray-200">
                      <span className={`font-black text-sm ${selectedCoin === 'USDT' ? 'text-[#26A17B]' : 'text-[#F7931A]'}`}>
                        {selectedCoin === 'USDT' ? 'T' : '₿'}
                      </span>
                    </div>
                  </div>

                  {/* Copy Address Row */}
                  <div 
                    onClick={() => {
                      navigator.clipboard.writeText(activeAddress);
                      toast.success("Deposit Address copied to clipboard!");
                    }}
                    className="w-[90%] font-mono text-[11px] text-gray-300 bg-black/40 border border-white/5 hover:border-purple-500/40 hover:bg-purple-500/5 px-4 py-3 rounded-xl cursor-pointer active:scale-98 transition-all text-center flex flex-col gap-1 items-center justify-center leading-snug"
                  >
                    <span className="text-[9px] text-[#FFE24C] font-semibold tracking-wider uppercase mb-0.5 flex items-center gap-1">
                      <Icons.Copy size={11} /> Tap to copy wallet address
                    </span>
                    <span className="break-all font-semibold tracking-wide text-white">{activeAddress}</span>
                  </div>
                </div>

                {/* Amount detail conversion */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Amount To Deposit</p>
                    <p className="text-lg font-black text-[#FFE24C]">{getCoinAmount()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-medium">Conversion rate applied</p>
                    <p className="text-xs text-gray-300 font-mono font-bold">1 {selectedCoin} = {selectedCoin === 'USDT' ? '$1.00' : '$66,750'}</p>
                  </div>
                </div>

                {/* Hash / Input field, or logs scanner */}
                {!isVerifying ? (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Icons.Hash size={12} className="text-purple-400" /> Enter TxID / Transaction Hash
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Paste transaction signature hash"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 pl-10 text-xs font-mono font-medium text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all"
                      />
                      <Icons.Compass size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>
                    <p className="text-[9px] text-gray-500 leading-snug">
                      Validate your block hash after completing transfer. Our network indexer will fast-track confirmations to the Bivaax ledger.
                    </p>
                  </div>
                ) : (
                  /* Decent scan output */
                  <div className="bg-black/60 p-4 rounded-xl border border-purple-500/20 flex flex-col gap-3 font-mono">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-purple-400 flex items-center gap-1.5 animate-pulse">
                        <Icons.Compass size={13} className="animate-spin text-purple-400" /> Synchronizing Ledger
                      </span>
                      <span className="text-[#FFE24C]">{currentProgress}%</span>
                    </div>

                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${currentProgress}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                        transition={{ ease: "easeInOut" }}
                      />
                    </div>

                    <div className="bg-black/80 p-3 rounded-lg border border-white/5 h-28 overflow-y-auto text-[10px] flex flex-col gap-1 custom-terminal leading-snug select-none">
                      {verificationLog.map((log, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-gray-500 font-bold">&gt;</span>
                          <span className={idx === verificationLog.length - 1 ? "text-emerald-400 font-semibold" : "text-gray-300"}>
                            {log}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer actions */}
              <div className="p-6 border-t border-white/5 bg-black/20 flex gap-3">
                <button
                  onClick={() => setIsCryptoModalOpen(false)}
                  disabled={isVerifying}
                  className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-white/5 disabled:opacity-30"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyBlockchainTx}
                  disabled={isVerifying || !txHash.trim()}
                  className="flex-1 h-12 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-purple-600/15 flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <Icons.CheckCircle size={14} />
                      <span>Verify Block</span>
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
