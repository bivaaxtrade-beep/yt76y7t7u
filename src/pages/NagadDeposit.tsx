import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, onSnapshot, getDoc } from '../firebase';

const NagadDeposit: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const amount = searchParams.get('amount') || '0';
  const orderId = searchParams.get('orderId') || Math.floor(Math.random() * 100000000).toString();
  const methodId = searchParams.get('methodId');

  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [lang, setLang] = useState<'BN' | 'EN'>('BN');
  const [appConfig, setAppConfig] = useState<any>({});
  const [methodData, setMethodData] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'app_config', 'settings'), (doc) => {
      if (doc.exists()) {
        setAppConfig(doc.data());
      }
    });

    if (methodId) {
        getDoc(doc(db, 'depositMethods', methodId)).then(snap => {
            if (snap.exists()) {
                setMethodData(snap.data());
            }
        });
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const accountNumber = methodData?.accountNumber || appConfig.nagad_number || "01833264202";
  const agentType = methodData?.agentType || appConfig.nagad_type || "এজেন্ট";

  const t = {
    BN: {
      timeLeft: "বাকি সময়",
      submitted: "অনুরোধ জমা হয়েছে!",
      successDesc: `আপনার Nagad ম্যানুয়াল জমার অনুরোধ গ্রহণ করা হয়েছে। আমাদের সাপোর্ট টিম মার্চেন্ট রেকর্ডের সাথে আপনার লেনদেন আইডিটি যাচাই করবে।`,
      orderId: "অর্ডার আইডি",
      amount: "পরিমাণ",
      return: "টার্মিনালে ফিরে যান",
      warning: "অনুগ্রহ করে প্রেরিত পরিমাণ পরিবর্তন করবেন না",
      step1: "ক্যাশ আউট নম্বর কপি করুন",
      step1Desc: appConfig.nagad_step1_bn || `নিচের নম্বরে Nagad অ্যাপ বা ক্যাশআউট মেনু দিয়ে টাকা পাঠান।`,
      step2: "লেনদেন আইডি (TrxID) দিন",
      trxPlaceholder: "লেনদেন আইডি প্রবেশ করুন (যেমন: 73V36DXK)",
      paste: "পেস্ট করুন",
      submit: "অনুরোধ নিশ্চিত করুন",
      upgrade: "নিরাপদ ডিপোজিট প্যানেল",
      guideTitle: `Nagad ম্যানুয়াল ডিপোজিট করার নিয়ম`,
      guide: appConfig.nagad_guide_bn ? appConfig.nagad_guide_bn.split('\n') : [
        "১. আপনার Nagad অ্যাপ অথবা মোবাইল মেনু ডায়াল করুন (*১৬৭#)।",
        "২. ক্যাশ আউট (Cash Out) অপশনটি নির্বাচন করুন।",
        "৩. উপরে দেওয়া Nagad নম্বরটি কপি করে প্রবেশ করান।",
        "৪. সঠিক জমার পরিমাণটি প্রদান করুন।",
        "৫. আপনার পিন দিয়ে লেনদেন সম্পন্ন করুন।",
        "৬. সম্পন্ন হওয়ার পর যে TrxID (ট্রানজেকশন আইডি) পাবেন, সেটি কপি করুন।",
        "৭. সেই TrxIDটি এখানে পেস্ট করে 'অনুরোধ নিশ্চিত করুন' বাটনে ক্লিক করুন।"
      ],
      footerText: "বিভ্যাক্স ম্যানুয়াল গেটওয়ে সিস্টেম"
    },
    EN: {
      timeLeft: "Time Remaining",
      submitted: "Request Submitted!",
      successDesc: `Your Nagad manual deposit request has been received. Our support team will verify the transaction with your ledger records shortly.`,
      orderId: "Order ID",
      amount: "Amount",
      return: "Return to Terminal",
      warning: "Please do not change the deposit amount",
      step1: "Copy Cash Out Number",
      step1Desc: appConfig.nagad_step1_en || `Send money to the number below using Nagad cash out.`,
      step2: "Enter Transaction ID (TrxID)",
      trxPlaceholder: "Enter Transaction ID (e.g. 73V36DXK)",
      paste: "Paste",
      submit: "Confirm Request",
      upgrade: "Secure P2P Deposit",
      guideTitle: `How to Deposit via Nagad`,
      guide: appConfig.nagad_guide_en ? appConfig.nagad_guide_en.split('\n') : [
        "1. Open your Nagad app or dial USSD (*167#).",
        "2. Choose the Cash Out option.",
        "3. Enter or paste the copied Nagad account number.",
        "4. Enter the exact payment amount shown above.",
        "5. Complete the cash out by entering your Nagad PIN.",
        "6. Copy the resulting TrxID (Transaction ID) from the confirmation screen.",
        "7. Paste the TrxID here and click 'Confirm Request'."
      ],
      footerText: "Bivaax Manual Ledger System"
    }
  }[lang];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    if (!trxId || trxId.length < 6) {
      toast.error(lang === 'BN' ? "দয়া করে সঠিক লেনদেন আইডি দিন" : "Please enter a valid Transaction ID");
      return;
    }

    setIsSubmitting(true);
    try {
      if (auth.currentUser) {
        await addDoc(collection(db, `users/${auth.currentUser.uid}/transactions`), {
          type: 'Deposit',
          amount: Number(amount),
          method: 'Nagad',
          currency: 'BDT',
          status: 'pending',
          trxId: trxId,
          orderId: orderId,
          timestamp: Date.now(),
          category: 'MFS'
        });
      }
      
      setIsSuccess(true);
      toast.success(lang === 'BN' ? "লেনদেন আইডি যাচাইয়ের জন্য পাঠানো হয়েছে" : "Transaction submitted for support verification");
      
      setTimeout(() => {
        navigate('/trade');
      }, 5000);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} ${lang === 'BN' ? 'কপি হয়েছে' : 'copied'}!`);
  };

  return (
    <div className="min-h-screen bg-[#0C0D12] text-gray-100 font-sans flex flex-col items-center">
      <SEO title="Nagad Deposit" description="Manage your Nagad Deposit on Bivaax Trade Platform." />

      {/* Header Section */}
      <div className="w-full pt-6 pb-2 flex flex-col items-center relative overflow-hidden bg-gradient-to-b from-[#1C1D24] to-[#0C0D12]">
          <div className="w-full max-w-md px-6 flex items-center justify-between text-white mb-4 z-10">
            <button 
              onClick={() => navigate('/trade')}
              className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              <Icons.ArrowLeft size={16} />
              {lang === 'BN' ? "ফিরে যান" : "Back"}
            </button>
            <div className="flex gap-1.5">
                <button 
                  onClick={() => setLang('BN')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${lang === 'BN' ? 'bg-[#FFE24C] text-black' : 'bg-white/10 text-gray-300'}`}
                >
                  বাং
                </button>
                <button 
                  onClick={() => setLang('EN')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all ${lang === 'EN' ? 'bg-[#FFE24C] text-black' : 'bg-white/10 text-gray-300'}`}
                >
                  EN
                </button>
            </div>
          </div>

          <div className="w-full max-w-md px-6 flex items-center justify-start gap-4 z-10 mb-6 mt-2">
              <div className="bg-[#FFE24C]/10 border border-[#FFE24C]/30 p-2.5 rounded-xl">
                <Icons.Wallet size={24} className="text-[#FFE24C]" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white uppercase">Nagad Manual P2P</h1>
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Manual Deposit Verification</p>
              </div>
          </div>

          {/* Disclaimer Box to prevent Google Safe Browsing Brand Cloning triggers */}
          <div className="w-full max-w-md px-4 mb-4 z-10">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-[11px] text-yellow-500 leading-relaxed">
              <strong>Disclaimer:</strong> This manual payment system is independent and NOT affiliated with or endorsed by Nagad Ltd. Send money manually and enter your transaction ID.
            </div>
          </div>

          {/* Timer Bar */}
          <div className="w-full max-w-md bg-white/5 border border-white/5 rounded-2xl py-3 px-5 flex items-center justify-between text-white z-10 mb-4">
             <span className="text-[13px] font-bold text-gray-400">{t.timeLeft}</span>
             <span className="text-lg font-mono font-black text-[#FFE24C] tracking-[2px]">{formatTime(timeLeft)}</span>
          </div>
      </div>

      <div className="w-full max-w-md p-3 sm:p-4 flex-1">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#14151B] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center mt-4 shadow-xl"
            >
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <Icons.CheckCircle size={36} className="text-green-500" />
                </div>
                <h2 className="text-xl font-black text-white mb-2">{t.submitted}</h2>
                <p className="text-gray-400 text-xs sm:text-sm mb-8 leading-relaxed">
                  {t.successDesc}
                </p>
                <div className="w-full bg-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 mb-8 text-left">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span>{t.orderId}</span>
                      <span className="text-white">{orderId}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span>{t.amount}</span>
                      <span className="text-[#FFE24C] font-black">৳{amount} BDT</span>
                   </div>
                </div>
                <button 
                  onClick={() => navigate('/trade')}
                  className="w-full py-3.5 bg-[#FFE24C] text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                  {t.return}
                </button>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Amount Display */}
              <div className="bg-[#14151B] border border-white/5 rounded-3xl p-5 sm:p-8 flex flex-col items-center relative overflow-hidden">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t.amount}</span>
                  <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">৳ {Number(amount).toLocaleString()}</span>
                      <button 
                         onClick={() => copyToClipboard(amount, t.amount)}
                         className="p-1.5 text-gray-400 hover:text-white transition-colors"
                      >
                          <Icons.Copy size={16} />
                      </button>
                  </div>
                  <div className="bg-white/5 border border-white/5 px-4 py-1.5 rounded-full">
                      <span className="text-yellow-500 font-bold text-[11px]">{t.warning}</span>
                  </div>
              </div>

              {/* Step 1: Copy Account Number */}
              <div className="bg-[#14151B] border border-white/5 rounded-3xl overflow-hidden">
                  <div className="p-4 sm:p-5 flex items-start gap-3">
                      <span className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FFE24C] text-black font-black text-xs shrink-0 shadow-md">1</span>
                      <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                              <span className="bg-white/10 text-gray-300 text-[9px] font-black px-2 py-0.5 rounded uppercase">{agentType}</span>
                              <span className="font-black text-[14px] sm:text-[16px] text-white truncate">{t.step1}</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                              <Icons.Bell size={13} className="mt-0.5 shrink-0 text-[#FFE24C]" />
                              <span className="text-[11px] text-gray-400 font-semibold leading-tight tracking-tight">{t.step1Desc}</span>
                          </div>
                      </div>
                  </div>
                  <div className="px-4 sm:px-5 pb-5">
                      <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
                          <div className="flex items-center gap-3 min-w-0">
                              <div className="relative w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 font-black text-xs shrink-0">
                                 Ng
                              </div>
                              <span className="font-mono font-black text-lg sm:text-2xl text-white tracking-[1px] truncate">{accountNumber}</span>
                          </div>
                          <button 
                              onClick={() => copyToClipboard(accountNumber, "Number")}
                              className="p-1.5 text-gray-400 hover:text-white transition-colors shrink-0"
                          >
                              <Icons.Copy size={18} />
                          </button>
                      </div>
                  </div>
              </div>

              {/* Step 2: Transaction ID */}
              <div className="bg-[#14151B] border border-white/5 rounded-3xl overflow-hidden">
                  <div className="p-4 sm:p-5 flex items-center gap-3">
                      <span className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FFE24C] text-black font-black text-xs shrink-0 shadow-md">2</span>
                      <span className="font-black text-[14px] sm:text-[16px] text-white">{t.step2}</span>
                  </div>
                  <div className="px-4 sm:px-5 pb-5">
                      <div className="relative mb-4">
                          <input 
                              type="text"
                              placeholder={t.trxPlaceholder}
                              value={trxId}
                              onChange={(e) => setTrxId(e.target.value)}
                              className="w-full bg-black/30 border border-white/5 rounded-2xl p-4 pr-24 text-sm font-bold text-white transition-all outline-none placeholder:text-gray-600 focus:border-[#FFE24C]"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                              <button 
                                  onClick={async () => {
                                      try {
                                          const text = await navigator.clipboard.readText();
                                          setTrxId(text);
                                          toast.success(lang === 'BN' ? "পেস্ট হয়েছে!" : "Pasted!");
                                      } catch (e) {
                                          toast.error("Clipboard access denied.");
                                      }
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-[#FFE24C]/10 border border-[#FFE24C]/20 rounded-xl text-[10px] font-black text-[#FFE24C] uppercase shadow-sm active:scale-95 transition-all"
                              >
                                  <Icons.ClipboardPaste size={12} />
                                  {t.paste}
                              </button>
                          </div>
                      </div>

                      <button 
                          onClick={handleConfirm}
                          disabled={isSubmitting}
                          className="w-full text-black font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center text-sm uppercase tracking-widest bg-[#FFE24C] hover:bg-[#ffe666] disabled:opacity-50"
                      >
                          {isSubmitting ? (
                              <div className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin"></div>
                          ) : (
                              t.submit
                          )}
                      </button>
                  </div>
              </div>

              {/* Accordion Guide */}
              <div className="bg-[#14151B] border border-white/5 rounded-3xl overflow-hidden mb-6">
                  <details className="group">
                      <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                          <div className="flex items-center gap-3">
                              <Icons.ChevronDown size={18} className="text-gray-400 group-open:rotate-180 transition-transform duration-300" />
                              <span className="font-bold text-[13px] text-gray-300">{t.guideTitle}</span>
                          </div>
                      </summary>
                      <div className="px-6 pb-5 flex flex-col gap-3.5 text-xs text-gray-400 font-semibold leading-relaxed border-t border-white/5 pt-4">
                        {t.guide.map((line: string, idx: number) => (
                          <p key={idx}>{line}</p>
                        ))}
                      </div>
                  </details>
              </div>

              {/* Footer Brand */}
              <div className="flex flex-col items-center gap-1.5 py-6">
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.footerText}</span>
                   <span className="text-[9px] text-gray-600">Bivaax Secure Core Trading Engine</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NagadDeposit;
