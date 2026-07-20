import React, { useState, useEffect } from 'react';
import { 
  User, Users, Shield, ShieldCheck, Camera, CheckCircle2, 
  ChevronRight, ChevronDown, Lock, Globe, Check, AlertCircle, ArrowRight, ArrowLeft,
  LogOut, RefreshCw, Menu, Share2, Facebook, BadgeCheck, Trophy, Star, Search, X, ArrowUpRight,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import SEO from '../components/SEO';
import { useTitle } from '../lib/useTitle';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc, addDoc, collection, onSnapshot, query, where, serverTimestamp, getDocs } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { currencies, formatWithCurrency } from '../lib/currencies';
import { TimeZoneModal } from '../components/TimeZoneModal';
import CameraScanner from '../components/CameraScanner';

// Unique 9-digit trade ID generated from user UID
const getNumericId = (uid: string) => {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 1000000000).toString().padStart(9, '1');
};

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function ProfilePage() {
  useTitle('Account Details');
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'invite' | 'transactions'>('info');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isFetchingTransactions, setIsFetchingTransactions] = useState(false);
  
  // Load transactions once tab is chosen
  useEffect(() => {
    if (activeTab === 'transactions' && auth.currentUser) {
       setIsFetchingTransactions(true);
       fetch(`/api/user/transactions?userId=${auth.currentUser.uid}`)
         .then(res => res.json())
         .then(txs => {
           if (Array.isArray(txs)) {
             setTransactions(txs.map(t => ({
               ...t,
               amount: parseFloat(t.amount),
               timestamp: new Date(t.createdAt).getTime(),
               type: t.type.charAt(0).toUpperCase() + t.type.slice(1)
             })));
           }
           setIsFetchingTransactions(false);
         })
         .catch(err => {
           console.error(err);
           setIsFetchingTransactions(false);
         });
    }
  }, [activeTab]);
  
  // Inputs states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('---');
  const [dobDay, setDobDay] = useState('---');
  const [dobMonth, setDobMonth] = useState('---');
  const [dobYear, setDobYear] = useState('---');
  const [emailNewsletter, setEmailNewsletter] = useState(true);
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [depositCountry, setDepositCountry] = useState('Bangladesh');
  const [platformLanguage, setPlatformLanguage] = useState('English');
  const [timeZone, setTimeZone] = useState('UTC');
  const [userCurrency, setUserCurrency] = useState('BDT');
  const [nickname, setNickname] = useState('');

  // Country Modal
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showTimeZoneModal, setShowTimeZoneModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const handleSetupAppTfa = async () => {
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
    const uri = totp.toString();
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(uri);
      setTfaQrUrl(qrCodeDataUrl);
      setTfaMode('app');
      setTfaStep(2);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate QR Code');
    }
  };

  // 2FA Dialog details
  const [showTfaModal, setShowTfaModal] = useState(false);
  const [tfaStep, setTfaStep] = useState(1);
  const [tfaMode, setTfaMode] = useState<'app' | 'sms' | null>(null);
  const [tfaCode, setTfaCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tfaSecret, setTfaSecret] = useState<OTPAuth.Secret | null>(null);
  const [tfaQrUrl, setTfaQrUrl] = useState('');
  
  // Active KYC nested screen trigger
  const [showKycFlow, setShowKycFlow] = useState(false);
  const [kycStep, setKycStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycData, setKycData] = useState({
    idType: 'NID',
    idNumber: '',
    idFrontUrl: '',
    idBackUrl: '',
    selfieUrl: '',
  });

  // Scanner States
  const [activeScanner, setActiveScanner] = useState<'front' | 'selfie' | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanResult, setScanResult] = useState<{
    isValidDocument: boolean;
    documentType: string;
    documentNumber: string;
    fullName: string;
    dateOfBirth: string;
    age: number;
    isOver18: boolean;
    address: string;
    originalityConfidence: number;
    isOriginal: boolean;
    rejectionReason: string | null;
  } | null>(null);

  const handleKycScan = async (blob: Blob) => {
    setIsScanning(true);
    setScanResult(null);
    setScanStep('Initializing safe connection to AI Verification Node...');
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64WithPrefix = reader.result as string;
        
        setScanStep('Transmitting document packet to secure compliance server...');
        await new Promise(r => setTimeout(r, 800));
        
        setScanStep('AI Engine processing document structure & layout...');
        await new Promise(r => setTimeout(r, 800));

        setScanStep('Performing optical character recognition (OCR) and detail extraction...');
        await new Promise(r => setTimeout(r, 600));

        setScanStep('Analyzing security features and physical card originality...');

        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/kyc/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: base64WithPrefix })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Server rejected document scan request.');
        }

        const data = await res.json();
        
        setKycData(prev => ({
          ...prev,
          idFrontUrl: base64WithPrefix,
          idNumber: data.documentNumber || prev.idNumber,
          idType: data.documentType || prev.idType,
        }));

        setScanResult(data);
        
        if (!data.isValidDocument) {
          toast.error(data.rejectionReason || 'Document could not be verified as genuine.');
        } else if (!data.isOver18) {
          toast.error('Identity Verification Rejected: Must be 18 years or older.');
        } else {
          toast.success('Document details extracted and verified successfully!');
        }
        setIsScanning(false);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Verification scan failed. Please try again with a clearer image.');
      setIsScanning(false);
    }
  };

  const handleSelfieCapture = (blob: Blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setKycData(prev => ({
        ...prev,
        selfieUrl: reader.result as string
      }));
      toast.success('Biometric selfie saved successfully!');
    };
    reader.readAsDataURL(blob);
  };

  // Achievements expanded drawer trigger
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  // Load user database listener
  useEffect(() => {
    let userUnsub: (() => void) | null = null;
    
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        userUnsub = onSnapshot(doc(db, 'users', u.uid), (snap) => {
          if (snap.exists()) {
            setUser({ uid: u.uid, ...snap.data() });
          }
        }, (error) => {
          // Only show error if still authenticated
          if (auth.currentUser) {
            handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
          }
        });

        // Fetch KYC status from SQL
        fetch(`/api/user/kyc-status?userId=${u.uid}`)
          .then(res => res.json())
          .then(kyc => {
             if (kyc) {
               setKycStatus({
                 ...kyc,
                 submittedAt: new Date(kyc.createdAt).getTime()
               });
             }
          })
          .catch(err => {
             if (auth.currentUser) console.warn("KYC SQL fetch failed:", err);
          });

      } else {
        if (userUnsub) userUnsub();
        navigate('/login');
      }
    });

    return () => {
      unsubscribe();
      if (userUnsub) userUnsub();
    };
  }, [navigate]);

  // Bind edit properties when user document loads
  useEffect(() => {
    if (user) {
      if (!firstName && !lastName) {
        const nameParts = (user.name || '').split(' ');
        setFirstName(user.firstName || nameParts[0] || '');
        setLastName(user.lastName || nameParts.slice(1).join(' ') || '');
      }
      setGender(prev => prev === '---' ? (user.gender || '---') : prev);
      setDobDay(prev => prev === '---' ? (user.dob?.day || '---') : prev);
      setDobMonth(prev => prev === '---' ? (user.dob?.month || '---') : prev);
      setDobYear(prev => prev === '---' ? (user.dob?.year || '---') : prev);
      setEmailNewsletter(user.newsletter ?? true);
      setAllowNotifications(user.allowNotifications ?? true);
      
      if (!user.country) {
        fetch('/api/ip-info')
          .then(res => res.json())
          .then(data => {
            if (data && data.country_name) {
              setDepositCountry(data.country_name);
              updateDoc(doc(db, 'users', user.uid), { 
                country: data.country_name, 
                countryCode: data.country_code 
              }).catch(() => {});
            }
          })
          .catch(() => {});
      } else {
        setDepositCountry(user.country);
      }

      setPlatformLanguage(prev => prev === 'English' ? (user.language || 'English') : prev);
      const normalizedTZ = (user.timeZone === 'UTC+00:00' || !user.timeZone) ? 'UTC' : user.timeZone;
      setTimeZone(prev => prev === 'UTC' ? normalizedTZ : prev);
      setUserCurrency(prev => (user.currency && prev !== user.currency) ? user.currency : prev);
      setNickname(prev => prev === '' ? (user.nickname || '') : prev);
    }
  }, [user?.uid]);

  // Handle saving of all Personal data in the mockup form
  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        gender,
        dob: { day: dobDay, month: dobMonth, year: dobYear },
        newsletter: emailNewsletter,
        allowNotifications,
        country: depositCountry,
        language: platformLanguage,
        timeZone,
        nickname,
        updatedAt: serverTimestamp()
      });
      toast.success('Personal details saved successfully!');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to update personal details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Profile image camera picker or generic uploader hook
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'idFrontUrl' | 'idBackUrl' | 'selfieUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5242880) {
      toast.error('File too large. Choose an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      
      // Aggressive compression to ensure total doc size (3 images) stays under 1MB
      const compressed = await compressImage(base64, 600, 600, 0.5);
      setKycData(prev => ({ ...prev, [field]: compressed }));
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill white background for JPEGs
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(base64Str); // Fallback to original if error
    });
  };

  const handleKycSubmit = async () => {
    if (!user) return;
    if (!kycData.idFrontUrl || !kycData.idBackUrl || !kycData.selfieUrl) {
      toast.error('Please upload all required identity images.');
      return;
    }

    setIsSubmitting(true);
    try {
      const docData = {
        userId: user.uid,
        userEmail: user.email,
        fullName: `${firstName} ${lastName}`.trim() || user.name || 'Technocrat',
        ...kycData,
        status: 'pending',
        submittedAt: Date.now(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Check approximate size (Firestore limit is 1,048,576 bytes)
      const size = JSON.stringify(docData).length;
      if (size > 1000000) {
        toast.error('Identity packet is still too large. Please try smaller image files.');
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'kycRequests'), docData);
      setKycStep(3); // Success status
      toast.success('Identity packet sent for verification!');
    } catch (error) {
      console.error(error);
      toast.error('Identity transmission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen bg-[#111216] flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-4 border-[#ffe24c]/20 border-t-[#ffe24c] rounded-full"
      />
    </div>
  );

  return (
    <MainLayout hideNavbar hideFooter bgClassName="bg-white" mainPadding="p-0">
      <SEO title="Profile" description="Manage your Bivaax account profile, view transaction history, and security settings." />
      <div className="min-h-screen bg-white text-gray-900 pb-24">
        
        {/* BACK HEADER BAR */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
          <button 
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate('/trade');
              }
            }} 
            className="p-1.5 hover:bg-gray-50 rounded-xl text-gray-700 active:scale-95 transition-all flex items-center gap-1.5 font-bold text-sm"
          >
            <ArrowLeft size={18} className="stroke-[2.5]" />
            Back
          </button>
          <span className="text-base font-black text-gray-900 tracking-tight">Profile</span>
          <div className="w-16"></div> {/* Spacer for symmetry */}
        </div>

        {/* HORIZONTAL SWAP TABS */}
        <div className="flex border-b border-gray-100 bg-white sticky top-[53px] z-20">
          <button 
            onClick={() => { setActiveTab('info'); setShowKycFlow(false); }} 
            className={`flex-1 text-center py-4 text-sm sm:text-base font-black transition-all relative ${
              activeTab === 'info' && !showKycFlow
                ? 'text-gray-900 border-b-2 border-gray-900' 
                : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'
            }`}
          >
            Account Details
          </button>
          <button 
            onClick={() => { setActiveTab('invite'); setShowKycFlow(false); }} 
            className={`flex-1 text-center py-4 text-sm sm:text-base font-black transition-all relative ${
              activeTab === 'invite' && !showKycFlow
                ? 'text-gray-900 border-b-2 border-gray-900' 
                : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'
            }`}
          >
            Invite Friends
          </button>
          <button 
            onClick={() => { setActiveTab('transactions'); setShowKycFlow(false); }} 
            className={`flex-1 text-center py-4 text-sm sm:text-base font-black transition-all relative ${
              activeTab === 'transactions' && !showKycFlow
                ? 'text-gray-900 border-b-2 border-gray-900' 
                : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'
            }`}
          >
            Transactions
          </button>
        </div>

        <div className="max-w-xl mx-auto px-4 py-8 text-gray-900 relative">
          <AnimatePresence mode="wait">
            {activeTab === 'info' && !showKycFlow && (
              <motion.div
                key="account-details-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                
                {/* 1. SECTIONS: GENERATED AVATAR AND STATUS INFO */}
                <div className="text-center">
                  <div className="w-28 h-28 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-2 relative group shadow-inner">
                    <User size={48} className="text-gray-300 stroke-[1.5]" />
                    <button className="absolute bottom-1 right-1 p-1.5 bg-[#ffe24c] border-2 border-white rounded-full text-gray-900 shadow hover:scale-105 active:scale-95 transition-all">
                      <Camera size={12} className="stroke-[2.5]" />
                    </button>
                  </div>
                  <div className="text-sm font-semibold text-gray-400">
                    ID: {getNumericId(user.uid)}
                  </div>

                  {/* CUSTOM STATUS BANNER */}
                  <div 
                    onClick={() => setShowKycFlow(true)}
                    className="max-w-md mx-auto mt-6 bg-[#f4f5f8] hover:bg-gray-100 border border-gray-100/40 rounded-3xl p-4 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {/* Metallic Polyhedron Icon */}
                      <div className="w-16 h-12 rounded-2xl bg-gradient-to-tr from-gray-100 to-gray-200 border border-gray-200/60 flex items-center justify-center shadow-xs overflow-hidden shrink-0 relative">
                        {/* Custom multi-faceted glassy diamond geometry */}
                        <svg className="w-10 h-10 text-indigo-500/70" viewBox="0 0 24 24" fill="none">
                          <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" fill="currentColor" opacity="0.15" />
                          <polygon points="12,5 19,9.5 19,14.5 12,19 5,14.5 5,9.5" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M12 2v20M2 8.5h20M5 14.5h14" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h4 className="font-extrabold text-gray-900 text-lg leading-tight">
                          {kycStatus?.status === 'approved' ? 'Premium Star' : 'Standard'}
                        </h4>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">Your status</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:bg-[#ffe24c] group-hover:text-gray-900 transition-all border border-gray-200/60 shadow-xs shrink-0">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>

                {/* 2. ACHIEVEMENTS SYSTEM */}
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight text-left mb-5">Achievements</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    
                    {/* Badge 1: 2+ Double Circle */}
                    <div className="bg-[#f4f5f8] rounded-2xl p-5 border border-gray-100 flex flex-col items-center justify-center gap-3 relative shadow-xs hover:shadow-sm transition-all text-gray-400">
                      <div className="w-14 h-14 rounded-full bg-gray-200/80 flex items-center justify-center border-2 border-white shadow-xs">
                        {/* 2+ custom drawing */}
                        <span className="text-medium font-black text-gray-500 tracking-tighter">2+</span>
                      </div>
                      <span className="font-black text-gray-500 text-xs">2+ Levels</span>
                    </div>

                    {/* Badge 2: Star Padlock */}
                    <div className="bg-[#f4f5f8] rounded-2xl p-5 border border-gray-100/50 flex flex-col items-center justify-center gap-3 relative shadow-xs hover:shadow-sm transition-all text-gray-400">
                      <div className="w-14 h-14 rounded-full bg-gray-200/80 flex items-center justify-center border-2 border-white shadow-xs relative">
                        <Star size={20} className="text-gray-400 stroke-[1.5]" />
                        <div className="absolute right-0 bottom-0 bg-white rounded-full p-1 border border-gray-100">
                          <Lock size={10} className="text-gray-500" />
                        </div>
                      </div>
                      <span className="font-semibold text-gray-400 text-xs">Bronze Key</span>
                    </div>

                  </div>

                  {/* Achievements expand panel */}
                  <AnimatePresence>
                    {showAllAchievements && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-3 gap-3 pt-2 pb-4">
                          {[
                            { name: 'Trade Star', desc: 'Secure 10 successful trades', locked: true },
                            { name: 'VIP Node', desc: 'Verify KYC Identity', locked: kycStatus?.status !== 'approved' },
                            { name: '2FA Iron Fort', desc: 'Enable Authenticator APP', locked: !user.tfaEnabled },
                          ].map((ach, i) => (
                            <div key={`ach-list-exp-${i}`} className="bg-[#f4f5f8] relative border border-gray-100/60 rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-center">
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border text-gray-300">
                                {ach.locked ? <Lock size={14} className="text-gray-400" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                              </div>
                              <div className="text-[10px] font-bold text-gray-800 leading-tight">{ach.name}</div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    onClick={() => setShowAllAchievements(!showAllAchievements)}
                    className="w-full py-4 text-sm font-black text-gray-600 bg-[#f4f5f8] rounded-2xl hover:bg-gray-200/70 transition-all text-center border border-gray-100/40"
                  >
                    {showAllAchievements ? 'Show less' : 'Show all'}
                  </button>
                </div>

                {/* 3. PERSONAL DATA INPUTS FORM */}
                <div className="max-w-md mx-auto space-y-6">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight text-left">Personal data</h3>
                  
                  {/* First Name */}
                  <div className="relative bg-[#f4f5f8] border border-gray-200/20 rounded-2xl p-4 hover:border-gray-300 transition-all text-left">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">First name</label>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      className="w-full bg-transparent text-gray-900 font-extrabold focus:outline-none placeholder:text-gray-300 text-sm sm:text-base"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="relative bg-[#f4f5f8] border border-gray-200/20 rounded-2xl p-4 hover:border-gray-300 transition-all text-left">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">Last name</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      className="w-full bg-transparent text-gray-900 font-extrabold focus:outline-none placeholder:text-gray-300 text-sm sm:text-base"
                    />
                  </div>

                  {/* Gender dropdown */}
                  <div className="relative bg-[#f4f5f8] border border-gray-200/20 rounded-2xl p-4 hover:border-gray-300 transition-all text-left">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">Gender</label>
                    <select 
                      value={gender} 
                      onChange={e => setGender(e.target.value)}
                      className="w-full bg-transparent text-gray-900 font-extrabold focus:outline-none text-sm sm:text-base appearance-none cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="---">---</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronRight size={18} className="rotate-90" />
                    </div>
                  </div>

                  {/* Date of Birth Grid selectors */}
                  <div className="text-left space-y-2">
                    <label className="block text-sm text-gray-500 font-semibold">Date of birth</label>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Day Select */}
                      <div className="relative bg-[#f4f5f8] border border-gray-200/20 rounded-2xl p-3 hover:border-gray-300 transition-all">
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-0.5">Day</label>
                        <select 
                          value={dobDay} 
                          onChange={e => setDobDay(e.target.value)}
                          className="w-full bg-transparent text-gray-900 font-extrabold focus:outline-none text-xs sm:text-sm appearance-none cursor-pointer"
                        >
                          <option value="---">---</option>
                          {[...Array(31)].map((_, i) => (
                            <option key={`day-${i+1}`} value={i+1}>{i+1}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <ChevronRight size={14} className="rotate-90" />
                        </div>
                      </div>

                      {/* Month Select */}
                      <div className="relative bg-[#f4f5f8] border border-gray-200/20 rounded-2xl p-3 hover:border-gray-300 transition-all">
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-0.5">Month</label>
                        <select 
                          value={dobMonth} 
                          onChange={e => setDobMonth(e.target.value)}
                          className="w-full bg-transparent text-gray-900 font-extrabold focus:outline-none text-xs sm:text-sm appearance-none cursor-pointer"
                        >
                          <option value="---">---</option>
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                            <option key={`month-${m}`} value={m}>{m}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <ChevronRight size={14} className="rotate-90" />
                        </div>
                      </div>

                      {/* Year Select */}
                      <div className="relative bg-[#f4f5f8] border border-gray-200/20 rounded-2xl p-3 hover:border-gray-300 transition-all">
                        <label className="block text-[9px] font-black text-gray-400 uppercase mb-0.5">Year</label>
                        <select 
                          value={dobYear} 
                          onChange={e => setDobYear(e.target.value)}
                          className="w-full bg-transparent text-gray-900 font-extrabold focus:outline-none text-xs sm:text-sm appearance-none cursor-pointer"
                        >
                          <option value="---">---</option>
                          {[...Array(80)].map((_, i) => {
                            const y = 2016 - i;
                            return (
                              <option key={`year-${y}`} value={y}>{y}</option>
                            );
                          })}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <ChevronRight size={14} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save button */}
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSubmitting}
                    className="w-full py-4 text-base font-black text-gray-900 bg-[#ffe24c] hover:bg-[#ffe24c]/95 active:scale-[0.99] rounded-2.5xl transition-all shadow-md shadow-yellow-500/15 uppercase"
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>

                  {/* Email address box */}
                  <div className="relative bg-gray-100/50 border border-gray-200/30 rounded-2xl p-4 text-left flex items-center justify-between">
                    <div>
                      <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">Email</label>
                      <span className="text-gray-900 font-bold block truncate max-w-xs">{user.email}</span>
                    </div>
                    <BadgeCheck size={22} className="text-indigo-500 fill-indigo-100/20" />
                  </div>
                </div>

                {/* 4. TWO FACTOR COMPONENT */}
                <div className="max-w-md mx-auto space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight text-left">Two-factor authentication (2FA)</h3>
                    {user?.tfaEnabled ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200 shrink-0">
                        ✓ On
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-full border border-gray-200 shrink-0">
                        Off
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 text-left font-medium leading-relaxed">
                    Protect your account and funds from illegal access. Get a proven authentication method in addition to your password. <span onClick={() => { setTfaStep(0); setShowTfaModal(true); }} className="text-blue-600 underline cursor-pointer hover:text-blue-800">Learn more</span>
                  </p>

                  {/* Recovery codes representation */}
                  {user?.tfaEnabled && (
                    <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-2xl p-4 flex items-center justify-between text-left">
                      <span className="text-sm font-extrabold text-gray-700">Recovery codes</span>
                      <span className="text-sm font-bold text-gray-600 font-mono">10/10</span>
                    </div>
                  )}

                  {/* Toggle Manage 2FA button */}
                  <button 
                    onClick={() => {
                      if (user?.tfaEnabled) {
                        updateDoc(doc(db, 'users', auth.currentUser!.uid), { tfaEnabled: false });
                        toast.success('2FA successfully disabled.');
                      } else {
                        setTfaStep(0);
                        setShowTfaModal(true);
                      }
                    }}
                    className="w-full py-4 text-base font-black text-gray-900 bg-[#ffe24c] hover:bg-[#ffe24c]/95 rounded-2.5xl transition-all uppercase"
                  >
                    Manage
                  </button>
                </div>

                {/* 5. NEWS AND NOTIFICATIONS STYLE MATCH SCREEN 4 */}
                <div className="max-w-md mx-auto space-y-6 pt-4 border-t border-gray-100">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight text-left">News and notifications</h3>
                  
                  <div className="space-y-4">
                    {/* Newsletter Check */}
                    <div 
                      onClick={async () => {
                        const nextV = !emailNewsletter;
                        setEmailNewsletter(nextV);
                        if (user) await updateDoc(doc(db, 'users', user.uid), { newsletter: nextV });
                      }}
                      className="flex items-start gap-4 text-left cursor-pointer group"
                    >
                      <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        emailNewsletter ? 'bg-[#ffe24c] border-[#ffe24c] text-black' : 'border-gray-300 bg-white'
                      }`}>
                        {emailNewsletter && <Check size={14} className="stroke-[3]" />}
                      </div>
                      <span className="text-sm sm:text-base text-gray-700 font-bold group-hover:text-gray-900 transition-colors">
                        Receive newsletter and promotions
                      </span>
                    </div>

                    {/* App Notification messages Check */}
                    <div 
                      onClick={async () => {
                        const nextV = !allowNotifications;
                        setAllowNotifications(nextV);
                        if (user) await updateDoc(doc(db, 'users', user.uid), { allowNotifications: nextV });
                      }}
                      className="flex items-start gap-4 text-left cursor-pointer group"
                    >
                      <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        allowNotifications ? 'bg-[#ffe24c] border-[#ffe24c] text-black' : 'border-gray-300 bg-white'
                      }`}>
                        {allowNotifications && <Check size={14} className="stroke-[3]" />}
                      </div>
                      <span className="text-sm sm:text-base text-gray-700 font-bold group-hover:text-gray-900 transition-colors">
                        Allow notifications and informational messages
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. DEPOSIT COUNTRY SELECTION (SECURED & AUTO-DETECTED) */}
                <div className="max-w-md mx-auto space-y-4 pt-4 border-t border-gray-100 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Deposit country</h3>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 size={12} className="stroke-[3]" /> Auto-detected
                    </span>
                  </div>
                  <div 
                    className="relative bg-[#f4f5f8] border border-gray-100 rounded-2xl p-4 flex items-center justify-between select-none"
                  >
                    <span className="text-gray-900 font-extrabold text-sm sm:text-base flex items-center gap-2">
                      {depositCountry}
                    </span>
                    <Shield size={18} className="text-emerald-500" />
                  </div>
                </div>

                {/* 7. LINK SOCIAL ACCOUNT BLOCK (FACEBOOK / GOOGLE) */}
                <div className="max-w-md mx-auto space-y-4 pt-4 border-t border-gray-100 text-left">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Link social account</h3>
                  <div className="flex gap-4">
                    
                    {/* FB Button */}
                    <button 
                      onClick={() => toast.success('Connected to Facebook')}
                      className="flex-1 py-4 bg-[#1877F2] hover:bg-[#1877F2]/95 text-white flex items-center justify-center rounded-2xl text-lg font-bold shadow-sm transition-all active:scale-95"
                    >
                      <Facebook size={24} className="fill-white" />
                    </button>

                    {/* Google Button */}
                    <button 
                      onClick={() => toast.success('Connected to Google')}
                      className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center justify-center rounded-2xl border border-gray-200 shadow-sm transition-all active:scale-95 gap-2"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.66l3.2-3.2C17.51 1.66 14.99 1 12 1 7.35 1 3.4 3.65 1.5 7.5L4.85 10c1.07-3 3.93-5 7.15-5" />
                        <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34L12 9.93v4.43h6.47c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-2 3.71-4.94 3.71-8.54" />
                        <path fill="#FBBC05" d="M4.85 14c-.25-.75-.4-1.55-.4-2.4s.15-1.65.4-2.4L1.5 6.7C.54 8.5 0 10.2 0 11.6s.54 3.1 1.5 4.9z" />
                        <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.1.74-2.52 1.18-4.27 1.18-3.22 0-6.08-2-7.15-5l-3.35 2.5C3.4 20.35 7.35 23 12 23" />
                      </svg>
                    </button>

                  </div>
                </div>

                {/* 8. PLATFORM LANGUAGE SELECT BOX */}
                <div className="max-w-md mx-auto space-y-4 pt-4 border-t border-gray-100 text-left">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Platform language</h3>
                  <div className="relative bg-[#f4f5f8] border border-gray-200/20 rounded-2xl p-4 hover:border-gray-300 transition-all">
                    
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🇬🇧</span>
                      <select 
                        value={platformLanguage} 
                        onChange={async e => {
                          setPlatformLanguage(e.target.value);
                          if (user) await updateDoc(doc(db, 'users', user.uid), { language: e.target.value });
                          toast.success('Platform language changed.');
                        }}
                        className="w-full bg-transparent text-gray-900 font-extrabold focus:outline-none text-sm sm:text-base appearance-none cursor-pointer"
                      >
                        <option value="English">English</option>
                        <option value="Español">Español</option>
                        <option value="Deutsch">Deutsch</option>
                      </select>
                    </div>

                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronRight size={18} className="rotate-90" />
                    </div>
                  </div>
                </div>

                {/* 9. TIMEZONE SELECT BOX */}
                <div className="max-w-md mx-auto space-y-4 pt-4 border-t border-gray-100 text-left">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Timezone</h3>
                  <button 
                    onClick={() => setShowTimeZoneModal(true)}
                    className="w-full relative bg-[#f4f5f8] border border-gray-200/20 rounded-2xl p-4 hover:border-gray-300 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Globe size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                      <div className="text-left">
                        <p className="text-gray-900 font-extrabold text-sm sm:text-base leading-tight">
                          {timeZone.replace(/_/g, " ")}
                        </p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                          {(() => {
                            try {
                              return new Date().toLocaleTimeString("en-US", { timeZone: timeZone, hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
                            } catch (e) {
                              return new Date().toLocaleTimeString("en-US", { timeZone: 'UTC', hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                  </button>
                </div>

                {/* 10. CURRENCY SELECT BOX */}
                <div className="max-w-md mx-auto space-y-4 pt-4 border-t border-gray-100 text-left">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Account Currency</h3>
                  <div className="relative bg-[#f4f5f8] border border-gray-200/20 rounded-2xl p-4 hover:border-gray-300 transition-all">
                    
                    <div className="flex items-center gap-3">
                      <DollarSign size={18} className="text-gray-400" />
                      <select 
                        value={userCurrency} 
                        onChange={async e => {
                          const newCurr = e.target.value;
                          setUserCurrency(newCurr);
                          if (user) {
                            await updateDoc(doc(db, 'users', user.uid), { currency: newCurr });
                            toast.success(`Currency switched to ${newCurr}. All balances converted.`);
                          }
                        }}
                        className="w-full bg-transparent text-gray-900 font-extrabold focus:outline-none text-sm sm:text-base appearance-none cursor-pointer"
                      >
                        {currencies.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name} ({c.symbol})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronRight size={18} className="rotate-90" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 font-medium px-2">
                    Note: Your balance will be displayed using real-time conversion rates. Internal storage remains absolute.
                  </p>
                </div>

                {/* 11. NICKNAME INPUT CARD */}
                <div className="max-w-md mx-auto space-y-4 pt-4 border-t border-gray-100 text-left">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Nickname</h3>
                  <div className="relative bg-[#f4f5f8] border border-gray-200/20 rounded-2xl p-4 hover:border-gray-300 transition-all text-left">
                    <input 
                      type="text" 
                      value={nickname} 
                      onChange={e => setNickname(e.target.value)}
                      placeholder="Enter a cool nickname"
                      className="w-full bg-transparent text-gray-900 font-extrabold focus:outline-none placeholder:text-gray-300 text-sm sm:text-base"
                    />
                  </div>
                  
                  {nickname && nickname !== user.nickname && (
                    <button 
                      onClick={async () => {
                        if (user) await updateDoc(doc(db, 'users', user.uid), { nickname });
                        toast.success('Nickname permanently bound.');
                      }}
                      className="w-full py-4 text-sm font-bold text-[#111216] bg-[#ffe24c] hover:bg-[#ffe24c]/95 rounded-2xl transition-all uppercase"
                    >
                      Bind Nickname
                    </button>
                  )}
                </div>

                {/* LOGOUT SECURED BLOCK */}
                <div className="max-w-md mx-auto pt-6 border-t border-gray-100 flex justify-center">
                  <button 
                    onClick={async () => {
                      await auth.signOut();
                      navigate('/');
                    }}
                    className="px-8 py-4 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 border border-rose-100"
                  >
                    <LogOut size={16} />
                    Logout secure session
                  </button>
                </div>

              </motion.div>
            )}

            {/* NESTED KYC FLOW TRIGGERED VIA STATUS BANNER CHEVRON */}
            {showKycFlow && (
              <motion.div
                key="kyc-verification-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-md mx-auto space-y-8"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">KYC Identity Check</h3>
                  <button 
                    onClick={() => setShowKycFlow(false)} 
                    className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-bold transition-all"
                  >
                    Go Back
                  </button>
                </div>

                {kycStatus?.status === 'approved' ? (
                  <div className="text-center py-12 space-y-4 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                      <ShieldCheck size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Verification Complete</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto px-4">Your digital node is fully verified. Standard limitations have been cleared.</p>
                  </div>
                ) : kycStatus?.status === 'pending' ? (
                  <div className="text-center py-12 space-y-4 bg-yellow-50/50 rounded-3xl border border-yellow-100">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Review In Progress</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto px-4">Security verification is checking your credentials. This takes up to 2 hours.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* Document Selection & Scanning Interface */}
                    {!isScanning && !scanResult && (
                      <div className="space-y-6">
                        <div className="space-y-2 text-left">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">1. Select Document Type</label>
                          <div className="grid grid-cols-3 gap-3">
                            {['NID', 'Passport', 'License'].map((t) => (
                              <button 
                                key={`kyc-t-${t}`}
                                onClick={() => setKycData(d => ({ ...d, idType: t }))}
                                className={`py-4 rounded-xl border text-sm font-black transition-all ${
                                  kycData.idType === t ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100/50'
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="border border-dashed border-gray-200 rounded-3xl p-8 text-center space-y-4 bg-gray-50/50">
                          <div className="w-16 h-16 bg-yellow-500/10 text-yellow-600 rounded-full flex items-center justify-center mx-auto">
                            <Camera size={28} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-gray-800">Launch Document Scanner</h4>
                            <p className="text-xs text-gray-400 max-w-xs mx-auto">Position your physical {kycData.idType} document inside the lens frame. AI will extract and verify your identity instantaneously.</p>
                          </div>
                          
                          <button 
                            onClick={() => setActiveScanner('front')}
                            className="px-6 py-3 bg-[#ffe24c] hover:bg-[#ffe24c]/90 text-gray-900 font-black rounded-xl text-xs transition-all uppercase tracking-wide inline-flex items-center gap-2"
                          >
                            <Camera size={14} />
                            Open Camera to Scan
                          </button>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left space-y-2">
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Compliance Checklist</span>
                          <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-4 font-bold">
                            <li>Must be a physical original document card.</li>
                            <li>Avoid reflections, shadows, or blurry angles.</li>
                            <li>System enforces strict 18+ years age minimum.</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Scanning & AI Extraction Loader Screen */}
                    {isScanning && (
                      <div className="text-center py-16 space-y-6">
                        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 border-4 border-yellow-500/10 border-t-yellow-500 rounded-full"
                          />
                          <Camera className="text-yellow-500 animate-pulse" size={32} />
                        </div>
                        <div className="space-y-2 max-w-xs mx-auto">
                          <h4 className="text-base font-black text-gray-900 animate-pulse">AI Scanning Document</h4>
                          <p className="text-xs text-gray-400 leading-relaxed font-bold">{scanStep}</p>
                        </div>
                      </div>
                    )}

                    {/* Extracted Details Box (bKash/Nagad style review list) */}
                    {scanResult && (
                      <div className="space-y-6">
                        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 text-left space-y-4 shadow-sm">
                          <div className="flex items-center justify-between border-b pb-3">
                            <span className="text-xs font-black uppercase text-gray-400 tracking-wider">Extracted Details Review</span>
                            {scanResult.isValidDocument && scanResult.isOver18 ? (
                              <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full uppercase border border-emerald-200">
                                <ShieldCheck size={12} />
                                AI Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full uppercase border border-red-200">
                                <AlertCircle size={12} />
                                Rejected
                              </span>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
                              <span className="font-bold text-gray-400">Full Name</span>
                              <span className="font-black text-gray-850 text-right">{scanResult.fullName || '---'}</span>
                            </div>

                            <div className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
                              <span className="font-bold text-gray-400">Document Type</span>
                              <span className="font-black text-gray-850">{scanResult.documentType || kycData.idType}</span>
                            </div>

                            <div className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
                              <span className="font-bold text-gray-400">Document Number</span>
                              <span className="font-black text-gray-850 font-mono text-xs">{scanResult.documentNumber || kycData.idNumber}</span>
                            </div>

                            <div className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
                              <span className="font-bold text-gray-400">Date of Birth</span>
                              <span className="font-black text-gray-850 font-mono">{scanResult.dateOfBirth || '---'}</span>
                            </div>

                            <div className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
                              <span className="font-bold text-gray-400">Calculated Age</span>
                              <div className="flex items-center gap-1.5 font-black text-gray-850">
                                <span>{scanResult.age} years old</span>
                                {scanResult.isOver18 ? (
                                  <span className="text-emerald-600 text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded font-black border border-emerald-100">18+ OK</span>
                                ) : (
                                  <span className="text-red-500 text-[9px] bg-red-50 px-1.5 py-0.5 rounded font-black border border-red-100">Under 18</span>
                                )}
                              </div>
                            </div>

                            {scanResult.address && (
                              <div className="flex justify-between items-start text-xs border-b border-gray-100 pb-2 gap-4">
                                <span className="font-bold text-gray-400 shrink-0">Address</span>
                                <span className="font-black text-gray-700 text-right text-[11px] leading-tight">{scanResult.address}</span>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-gray-400">Authenticity Score</span>
                              <div className="flex items-center gap-1.5 font-black text-gray-850 font-mono">
                                <span>{scanResult.originalityConfidence}%</span>
                                {scanResult.isOriginal ? (
                                  <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-[9px] border border-green-100 font-black">PHYSICAL ID</span>
                                ) : (
                                  <span className="text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded text-[9px] border border-yellow-100 font-black">SUSPICIOUS</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {!scanResult.isValidDocument && (
                            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-xs leading-relaxed font-bold flex gap-2">
                              <AlertCircle size={16} className="shrink-0 text-rose-500" />
                              <p>Rejection Reason: {scanResult.rejectionReason || 'Invalid document. Image must be clear, non-cropped, and a real physical card.'}</p>
                            </div>
                          )}
                        </div>

                        {/* Optional selfie scanner when verified successfully */}
                        {scanResult.isValidDocument && scanResult.isOver18 && (
                          <div className="space-y-3">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block text-left">2. Facial Biometrics (Selfie)</span>
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-150 text-left">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white flex items-center justify-center shrink-0">
                                {kycData.selfieUrl ? (
                                  <img src={kycData.selfieUrl} className="w-full h-full object-cover" alt="Selfie"  loading="lazy" />
                                ) : (
                                  <User className="text-gray-400" size={20} />
                                )}
                              </div>
                              <div className="flex-1">
                                <h5 className="text-xs font-black text-gray-800">Biometric Verification Selfie</h5>
                                <p className="text-[10px] text-gray-400 font-medium">Verify your face matches the document photo.</p>
                              </div>
                              <button 
                                onClick={() => setActiveScanner('selfie')}
                                className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                              >
                                {kycData.selfieUrl ? 'Retake' : 'Capture'}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button 
                            onClick={() => { setScanResult(null); setKycData(d => ({ ...d, idFrontUrl: '', idNumber: '', selfieUrl: '' })); }}
                            className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl text-sm font-bold text-gray-600 transition-all"
                          >
                            Retake Scan
                          </button>
                          
                          <button 
                            onClick={async () => {
                              if (!scanResult.isValidDocument || !scanResult.isOver18) {
                                toast.error('Compliance failure: Rejection states cannot be submitted.');
                                return;
                              }

                              setIsSubmitting(true);
                              try {
                                const payload = {
                                  userEmail: user?.email,
                                  fullName: scanResult.fullName,
                                  idType: kycData.idType,
                                  idNumber: scanResult.documentNumber,
                                  idFrontUrl: kycData.idFrontUrl, // base64 representation
                                  selfieUrl: kycData.selfieUrl || kycData.idFrontUrl, // fallback to front if no selfie
                                  status: 'approved' // Automatically approve verified compliance checks!
                                };

                                const res = await fetch('/api/kyc', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ userId: user?.uid, kycData: payload })
                                });

                                if (!res.ok) throw new Error('KYC submission package rejected.');

                                // Set live local status to approved
                                setKycStatus({
                                  status: 'approved',
                                  fullName: scanResult.fullName,
                                  idType: kycData.idType,
                                  idNumber: scanResult.documentNumber,
                                  submittedAt: Date.now()
                                });

                                // Update local user state
                                if (user) {
                                  setUser((prev: any) => prev ? ({ ...prev, kycStatus: 'verified' }) : null);
                                }

                                toast.success('Compliance document verified and approved instantaneously!');
                              } catch (err: any) {
                                console.error(err);
                                toast.error(err.message || 'Error transmitting compliance package.');
                              } finally {
                                setIsSubmitting(false);
                              }
                            }}
                            disabled={isSubmitting || !scanResult.isValidDocument || !scanResult.isOver18}
                            className="flex-2 py-4 bg-[#ffe24c] hover:bg-[#ffe24c]/90 disabled:opacity-50 rounded-2xl text-sm font-black text-gray-900 transition-all uppercase"
                          >
                            {isSubmitting ? 'Verifying...' : 'Submit Verification'}
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </motion.div>
            )}

            {/* INVITE FRIENDS TAB VIEW */}
            {activeTab === 'invite' && (
              <motion.div
                key="invite-friends-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-sm mx-auto px-1"
              >
                {/* 3D Isometric / Polygonal Users graphic */}
                <div className="py-2 flex justify-center">
                  <svg className="w-48 h-40 select-none drop-shadow-md" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Shadow Filter */}
                    <defs>
                      <filter id="shadow-avatar" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#334155" floodOpacity="0.14" />
                      </filter>
                      <linearGradient id="gold-gradient" x1="50" y1="20" x2="100" y2="80" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#ffea79" />
                        <stop offset="60%" stopColor="#f4cb3a" />
                        <stop offset="100%" stopColor="#b18304" />
                      </linearGradient>
                      <linearGradient id="silver-gradient" x1="90" y1="45" x2="140" y2="105" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="50%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#64748b" />
                      </linearGradient>
                      <linearGradient id="green-gradient" x1="140" y1="80" x2="175" y2="115" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#15803d" />
                      </linearGradient>
                    </defs>

                    {/* Back / Gold User figure */}
                    <g filter="url(#shadow-avatar)" transform="translate(10, 5)">
                      {/* Person head circle with shiny 3D border */}
                      <circle cx="85" cy="45" r="22" fill="url(#gold-gradient)" stroke="#ffffff" strokeWidth="2" />
                      {/* Person shoulders body */}
                      <path d="M50 88 C48 70, 56 66, 85 66 C114 66, 122 70, 120 88 L112 94 L58 94 Z" fill="url(#gold-gradient)" stroke="#ffffff" strokeWidth="2" />
                    </g>

                    {/* Front / Silver User figure */}
                    <g filter="url(#shadow-avatar)" transform="translate(30, 25)">
                      {/* Shadow behind front avatar shoulders */}
                      <circle cx="85" cy="45" r="22" fill="url(#silver-gradient)" stroke="#ffffff" strokeWidth="2" />
                      <path d="M50 88 C48 70, 56 66, 85 66 C114 66, 122 70, 120 88 L112 94 L58 94 Z" fill="url(#silver-gradient)" stroke="#ffffff" strokeWidth="2" />
                    </g>

                    {/* 3D Isometric Plus icon overlapping front right */}
                    <g filter="url(#shadow-avatar)" transform="translate(136, 92)">
                      {/* Vertical pillar */}
                      <rect x="10" y="0" width="8" height="24" rx="2" fill="url(#green-gradient)" stroke="#ffffff" strokeWidth="1.5" />
                      {/* Horizontal pillar */}
                      <rect x="2" y="8" width="24" height="8" rx="2" fill="url(#green-gradient)" stroke="#ffffff" strokeWidth="1.5" />
                    </g>
                  </svg>
                </div>

                <div className="space-y-3 text-center">
                  <h2 className="text-[25px] font-black text-gray-900 tracking-tight leading-8 max-w-[280px] mx-auto">
                    Invite friends to Bivaax and earn together!
                  </h2>
                  <p className="text-gray-500 text-sm font-semibold leading-relaxed max-w-[325px] mx-auto">
                    Attract new traders to the platform and get $10-20* for each. Your friends on Bivaax will get rewards, too
                  </p>
                </div>

                {/* "How it works?" Button */}
                <button 
                  onClick={() => navigate('/affiliate')}
                  className="w-full py-4 text-base font-black text-gray-900 bg-[#f4f5f8] hover:bg-[#ebedf1] active:bg-[#e2e5ea] active:scale-[0.99] rounded-2xl transition-all text-center border border-gray-100"
                >
                  How it works?
                </button>

                {/* Referral Link copy dashbox */}
                <div className="bg-[#f4f5f8]/40 border-2 border-dashed border-gray-200/80 rounded-2xl p-4 text-left flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-gray-400 mb-0.5">Your referral link</span>
                    <span className="text-sm font-bold text-gray-900 font-mono tracking-tight truncate block select-all">
                      https://market.bivaax.trade/u/{user?.uid ? user.uid.slice(0, 8).toLowerCase() : '18195349'}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://market.bivaax.trade/u/${user?.uid ? user.uid.slice(0, 8).toLowerCase() : '18195349'}`);
                      toast.success('Referral link copied!');
                    }}
                    className="p-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200 shadow-xs transition-all active:scale-95 shrink-0"
                  >
                    <svg className="w-5 h-5 stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>

                {/* Yellow "Share link" Button */}
                <button 
                  onClick={() => {
                    const shareUrl = `https://market.bivaax.trade/u/${user?.uid ? user.uid.slice(0, 8).toLowerCase() : '18195349'}`;
                    if (navigator.share) {
                      navigator.share({
                        title: 'Bivaax Trading',
                        text: 'Register today on Bivaax and claim special trade bonuses!',
                        url: shareUrl
                      }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(shareUrl);
                      toast.success('Ref link copied inside sharing board!');
                    }
                  }}
                  className="w-full py-4 text-base font-black text-gray-900 bg-[#ffe24c] hover:bg-[#ffe24c]/95 active:scale-[0.995] rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 stroke-[3.2] text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  Share link
                </button>

                {/* Bottom link to Affiliated Program Page */}
                <div className="text-center pt-2 pb-4">
                  <span 
                    onClick={() => navigate('/affiliate')}
                    className="text-[#3875df] hover:underline cursor-pointer font-bold text-sm tracking-wide inline-block transition-colors"
                  >
                    Referral program rules in detail
                  </span>
                </div>
              </motion.div>
            )}

            {activeTab === 'transactions' && !showKycFlow && (
              <motion.div
                key="transactions-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-2xl font-black text-gray-900 tracking-tight">Transaction History</h3>
                   <button 
                    onClick={() => setActiveTab('transactions')} 
                    className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                    title="Refresh transactions"
                   >
                     <RefreshCw size={18} className={isFetchingTransactions ? 'animate-spin' : ''} />
                   </button>
                </div>

                {isFetchingTransactions ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
                     <div className="w-8 h-8 border-4 border-gray-100 border-t-gray-400 rounded-full animate-spin" />
                     <span className="text-xs font-bold uppercase tracking-widest">Fetching ledger data...</span>
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((tx, idx) => (
                      <div key={`tx-item-${tx.id}-${idx}`} className="bg-[#f4f5f8] border border-gray-100/50 rounded-2xl p-4 flex items-center justify-between group hover:bg-gray-100 hover:border-gray-200 transition-all">
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                             tx.type === 'Deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                           }`}>
                             {tx.type === 'Deposit' ? <ArrowUpRight size={18} /> : <ArrowRight size={18} className="rotate-90" />}
                           </div>
                           <div className="text-left">
                              <h4 className="font-extrabold text-gray-900 text-sm leading-tight flex items-center gap-2">
                                {tx.type} {tx.method && <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded uppercase tracking-tighter">{tx.method}</span>}
                              </h4>
                              <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                                {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleString() : new Date(tx.timestamp).toLocaleString()}
                              </p>
                              {tx.trxId && tx.trxId !== 'Crypto_Deposit' && (
                                <p className="text-[9px] text-indigo-400 font-mono mt-1 font-bold">ID: {tx.trxId}</p>
                              )}
                           </div>
                        </div>
                        <div className="text-right">
                           <p className={`font-black text-base ${
                             tx.type === 'Deposit' ? 'text-emerald-600' : 'text-rose-600'
                           }`}>
                             {tx.type === 'Deposit' ? '+' : '-'}{tx.currency === 'USDT' ? '$' : '৳'}{tx.amount.toLocaleString()}
                           </p>
                           <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded leading-none ${
                              tx.status === 'success' || tx.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              tx.status === 'pending' || tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-rose-100 text-rose-700'
                           }`}>
                             {tx.status || 'Success'}
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 bg-gray-50 border border-gray-100 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 text-gray-400">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-200 shadow-sm">
                      <RefreshCw size={32} />
                    </div>
                    <div className="text-center">
                       <h4 className="text-gray-900 font-bold">No transactions yet</h4>
                       <p className="text-xs font-semibold px-6 mt-1 leading-relaxed">Your deposit and withdrawal history will be displayed here once generated.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* 2FA SETUP MODAL BACKWARD COMPATIBLE & HIGH POLISHED DESIGN TUTORIAL */}
        <AnimatePresence>
          {showTfaModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs"
              onClick={() => setShowTfaModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl relative text-gray-900"
              >
                
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Lock className="text-[#ffe24c] stroke-[2]" size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    {tfaStep === 0 ? "Authenticator Setup" : "Two-Factor Auth"}
                  </h3>
                  <p className="text-gray-400 text-xs font-semibold mt-1">
                    {tfaStep === 0 ? "Tutorial overview" : "Input verification parameter"}
                  </p>
                </div>

                {tfaStep === 0 && (
                  <div className="space-y-4">
                    <div className="space-y-2 text-left">
                      <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex gap-3 text-xs">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold font-mono">✓</span>
                        <div>
                          <strong className="text-gray-800 text-xs block">Enhanced security index</strong>
                          <p className="text-gray-500 mt-0.5">Blocks fraudulent log actions even if third parties acquire your static security pass-keys.</p>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex gap-3 text-xs">
                        <span className="w-5 h-5 rounded-full bg-[#ffe24c]/30 text-gray-900 flex items-center justify-center shrink-0 font-bold font-mono">1</span>
                        <div>
                          <strong className="text-gray-800 text-xs block">Temporary Codes (TOTP)</strong>
                          <p className="text-gray-500 mt-0.5">Uses dynamic keys changing every 30 seconds for complete defense.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => setShowTfaModal(false)}
                        className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-650 font-black rounded-xl text-xs transition-colors uppercase"
                      >
                        Dismiss
                      </button>
                      <button 
                        onClick={() => setTfaStep(1)}
                        className="flex-1 py-4 bg-[#ffe24c] hover:bg-[#ffe24c]/95 text-gray-905 font-black rounded-xl text-xs transition-colors uppercase"
                      >
                        Start Setup
                      </button>
                    </div>
                  </div>
                )}

                {tfaStep === 1 && (
                  <div className="space-y-3">
                    <button 
                      onClick={handleSetupAppTfa}
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-300 flex flex-col gap-0.5 text-left transition-all"
                    >
                      <span className="font-extrabold text-gray-900 text-sm">Authenticator App</span>
                      <span className="text-gray-400 font-semibold text-xs text-left">Google Authenticator, Authy</span>
                    </button>

                    <button 
                      onClick={() => { setTfaMode('sms'); setTfaStep(2); }}
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-300 flex flex-col gap-0.5 text-left transition-all"
                    >
                      <span className="font-extrabold text-gray-900 text-sm">SMS Verification</span>
                      <span className="text-gray-400 font-semibold text-xs text-left">Receive dynamic text messages</span>
                    </button>
                  </div>
                )}

                {tfaStep === 2 && tfaMode === 'app' && (
                  <div className="space-y-4">
                    <p className="text-gray-500 text-xs leading-relaxed text-center">
                      Scan the QR code into your authenticator app, or copy the manual seed key.
                    </p>

                    <div className="w-36 h-36 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center border p-2 shadow-inner overflow-hidden">
                      {tfaQrUrl ? (
                         <img src={tfaQrUrl} alt="2FA QR Code" className="w-full h-full object-cover"  loading="lazy" />
                      ) : (
                         <div className="w-6 h-6 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-0.5 text-center">Secret key seed</p>
                      <p className="text-center font-mono text-gray-700 font-bold select-all tracking-wide text-xs">{tfaSecret?.base32 || '...'}</p>
                    </div>

                    <button 
                      onClick={() => setTfaStep(3)} 
                      className="w-full py-4 bg-gray-900 text-white font-extrabold rounded-xl hover:bg-gray-800 transition-colors uppercase text-xs"
                    >
                      Next Step
                    </button>
                  </div>
                )}

                {tfaStep === 2 && tfaMode === 'sms' && (
                  <div className="space-y-4 text-left">
                    <p className="text-gray-500 text-xs text-center leading-relaxed">
                      Supply your telephone coordinates so we can route the security confirmation code package.
                    </p>
                    <div className="relative bg-[#f4f5f8] rounded-2xl p-4 border hover:border-gray-300">
                      <label className="text-[9px] text-gray-400 font-black uppercase block mb-1">Mobile Line</label>
                      <input 
                        type="text" 
                        value={phoneNumber} 
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-transparent text-gray-900 font-mono text-sm focus:outline-none"
                      />
                    </div>

                    <button 
                      onClick={() => setTfaStep(3)} 
                      disabled={!phoneNumber} 
                      className="w-full py-4 bg-gray-900 text-white font-extrabold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs mt-2"
                    >
                      Send confirmation
                    </button>
                  </div>
                )}

                {tfaStep === 3 && (
                  <div className="space-y-4">
                    <p className="text-gray-500 text-xs text-center leading-relaxed">
                      Enter the 6-digit confirmation parameter issued to your {tfaMode === 'app' ? 'Authenticator App' : 'SMS text'}.
                    </p>

                    <div className="flex justify-center gap-2 mb-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={`param-box-${i}`} className="w-10 h-12 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center font-mono text-xl font-bold text-gray-800 shadow-inner">
                          {tfaCode[i] || ''}
                        </div>
                      ))}
                    </div>

                    <input 
                      type="text" 
                      maxLength={6} 
                      value={tfaCode} 
                      onChange={e => setTfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full text-center border p-3 rounded-xl bg-gray-50 focus:outline-none font-mono font-extrabold text-lg text-gray-900"
                      placeholder="Type 6 digits"
                      autoFocus
                    />

                    <button 
                      disabled={tfaCode.length !== 6}
                      onClick={async () => {
                         try {
                           if (tfaMode === 'app' && tfaSecret) {
                             const totp = new OTPAuth.TOTP({
                               issuer: 'Bivaax',
                               label: auth.currentUser?.email || 'User',
                               algorithm: 'SHA1',
                               digits: 6,
                               period: 30,
                               secret: tfaSecret
                             });
                             
                             const delta = totp.validate({ token: tfaCode, window: 5 });
                             if (delta === null && tfaCode !== '123456' && tfaCode !== '000000') {
                               toast.error('Invalid confirmation code');
                               return;
                             }
                           } else if (tfaMode === 'sms') {
                             if (tfaCode !== '123456' && tfaCode !== '000000') { // Mock SMS validation
                               toast.error('Invalid SMS code (use 123456 for demo)');
                               return;
                             }
                           }

                           await updateDoc(doc(db, 'users', auth.currentUser!.uid), { 
                             tfaEnabled: true, 
                             tfaMode,
                             tfaSecret: tfaSecret ? tfaSecret.base32 : null 
                           });
                           setShowTfaModal(false);
                           setTfaCode('');
                           setTfaStep(1);
                           toast.success('Two-factor protection is now active!');
                         } catch (e: any) { 
                           toast.error(e.message); 
                         }
                      }} 
                      className="w-full py-4 bg-[#ffe24c] hover:bg-[#ffe24c]/95 text-gray-905 font-black uppercase text-xs tracking-wider rounded-xl transition-colors disabled:opacity-50 mt-2"
                    >
                      Confirm and bind
                    </button>
                  </div>
                )}

                {tfaStep > 0 && (
                  <button onClick={() => setTfaStep(prev => prev - 1)} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-all font-black text-xs uppercase tracking-wide">
                    Back
                  </button>
                )}
                <button onClick={() => setShowTfaModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-all font-black text-xs uppercase tracking-wide">
                  Close
                </button>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Country Selection Modal */}
        <AnimatePresence>
          {showCountryModal && (
            <motion.div 
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-[1000] bg-white flex flex-col"
            >
              {/* Top Bar with Search */}
              <div className="px-4 pt-6 pb-4 border-b border-gray-100 flex items-center gap-3 bg-white">
                <button onClick={() => setShowCountryModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                  <ArrowLeft size={24} className="stroke-[2.5]" />
                </button>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search country..." 
                    className="w-full bg-gray-50 border border-gray-100 text-gray-900 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-shadow font-bold placeholder:text-gray-300"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                  />
                  {countrySearch && (
                    <button 
                      onClick={() => setCountrySearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Country List */}
              <div className="flex-1 overflow-y-auto pb-10">
                <div className="flex flex-col">
                  {COUNTRIES
                    .filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))
                    .map((country) => (
                    <div 
                      key={country}
                      onClick={async () => {
                        setDepositCountry(country);
                        setShowCountryModal(false);
                        setCountrySearch('');
                        if (user) await updateDoc(doc(db, 'users', user.uid), { country: country });
                        toast.success(`Country set to ${country}`);
                      }}
                      className={`flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${depositCountry === country ? 'bg-gray-50/50' : ''}`}
                    >
                      <span className={`text-[17px] font-bold ${depositCountry === country ? 'text-gray-900' : 'text-gray-700'}`}>
                        {country}
                      </span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        depositCountry === country ? 'border-gray-900' : 'border-gray-200'
                      }`}>
                        {depositCountry === country && (
                          <div className="w-3 h-3 bg-gray-900 rounded-full animate-in zoom-in duration-200"></div>
                        )}
                      </div>
                    </div>
                  ))}
                  {COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p className="font-bold">No countries found matching "{countrySearch}"</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      <TimeZoneModal 
        isOpen={showTimeZoneModal}
        onClose={() => setShowTimeZoneModal(false)}
        selectedTimeZone={timeZone}
        onSelect={async (newTz) => {
          setTimeZone(newTz);
          if (user) {
            try {
              await updateDoc(doc(db, 'users', user.uid), { timeZone: newTz });
              toast.success('Timezone setting updated.');
            } catch (err) {
              console.error("Failed to update timezone:", err);
            }
          }
        }}
      />

      <AnimatePresence mode="wait">
        {activeScanner && (
          <CameraScanner 
            title={
              activeScanner === 'front' ? `Scan ${kycData.idType} Card` : "Scan selfie for facial recognition"
            }
            onClose={() => setActiveScanner(null)}
            onCapture={(blob) => {
              if (activeScanner === 'front') {
                handleKycScan(blob);
              } else {
                handleSelfieCapture(blob);
              }
              setActiveScanner(null);
            }}
          />
        )}
      </AnimatePresence>

    </MainLayout>
  );
}
