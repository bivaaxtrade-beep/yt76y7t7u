import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, sendEmailVerification, signOut } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, increment } from '../firebase';
import { getNextAffiliateId, getUserByAffiliateId } from '../lib/affiliate';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, initialView = 'login', onSuccess }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register' | 'forgot_password'>(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [currency, setCurrency] = useState('৳');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync state if initialView changes when opening modal
  React.useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
      try {
          setError(null);
          setLoading(true);
          
          // 1. Get the Google Auth URL from server
          const response = await fetch('/api/auth/google/url');
          const data = await response.json();
          
          if (!data.url) throw new Error('Failed to get auth URL');
          
          // 2. Open popup
          const width = 500;
          const height = 600;
          const left = window.screen.width / 2 - width / 2;
          const top = window.screen.height / 2 - height / 2;
          const popup = window.open(data.url, 'google-login', `width=${width},height=${height},left=${left},top=${top}`);
          
          // 3. Listen for success
          const handleMessage = async (event: MessageEvent) => {
             if (event.data.type === 'OAUTH_AUTH_SUCCESS') {
                 window.removeEventListener('message', handleMessage);
                 // Save token or handle user data
                 localStorage.setItem('auth_token', event.data.token);
                 // Assuming you need to refresh or redirect
                 onSuccess();
                 onClose();
             }
          };
          window.addEventListener('message', handleMessage);

      } catch (err: any) {
          setError(err.message || 'Failed to sign in with Google');
      } finally {
          setLoading(false);
      }
  };

  const handleFacebookSignIn = async () => {
    // Placeholder for FB auth
    setError("Facebook login is not configured yet.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'register' && !agreed) {
        setError("Please agree to the Service agreement.");
        return;
    }
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
        if (view === 'forgot_password') {
            await sendPasswordResetEmail(auth, email);
            setSuccessMsg("Password reset email sent! Please check your inbox.");
            setView('login');
        } else if (view === 'register') {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Send email verification (optional, we won't force them out)
            sendEmailVerification(userCredential.user).catch(console.error);
            
            // Generate professional numeric ID
            const affiliateId = await getNextAffiliateId();

            // Handle referral code
            const referralCode = localStorage.getItem('referralCode');
            const referralSub = localStorage.getItem('referralSub');
            let referredBy = null;
            let referredByUid = null;
            
            const deviceRegistered = localStorage.getItem('device_registered');
            
            if (referralCode && !deviceRegistered) {
              const referrer = await getUserByAffiliateId(referralCode);
              if (referrer) {
                 referredBy = referralCode;
                 referredByUid = referrer.uid;
                 // Increment referrer stats
                 await updateDoc(doc(db, 'users', referrer.uid), {
                     referralCount: increment(1)
                 }).catch(console.error);
              }
            } else if (referralCode && deviceRegistered) {
                console.warn('Self-referral or multiple accounts from same device detected. Referral ignored.');
            }

            // Create the initial user record in Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: userCredential.user.email,
                balance: 0.0,
                demoBalance: 10000.0,
                currency: currency,
                affiliateId: affiliateId,
                referredBy: referredBy,
                referredByUid: referredByUid,
                referredSub: referralSub || 'default',
                createdAt: Number(Date.now()),
                isVerified: false
            });
            
            localStorage.setItem('device_registered', 'true');

            const userEmailLower = userCredential.user.email?.toLowerCase();
            const rawAdminEmail = import.meta.env.VITE_ADMIN_EMAIL;
            const adminEmail = (rawAdminEmail && rawAdminEmail !== 'undefined' && rawAdminEmail !== 'null' && rawAdminEmail.trim() !== '') 
                ? rawAdminEmail.toLowerCase().trim() 
                : null;
            if (adminEmail && userEmailLower === adminEmail) {
                try {
                    await setDoc(doc(db, 'admins', userCredential.user.uid), {
                        email: userCredential.user.email,
                        role: 'superadmin',
                        createdAt: Number(Date.now())
                    });
                } catch(e) {
                    console.warn("Bootstrap: Could not create admin record (might already exist or rules blocked it):", e);
                }
            }
            
            // Clear used referral code
            localStorage.removeItem('referralCode');
            localStorage.removeItem('referralSub');
            
            onSuccess();
            onClose();
        } else {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Auto-bootstrap admin record if it doesn't exist in the database
            const userEmailLower = userCredential.user.email?.toLowerCase();
            const rawAdminEmail = import.meta.env.VITE_ADMIN_EMAIL;
            const adminEmail = (rawAdminEmail && rawAdminEmail !== 'undefined' && rawAdminEmail !== 'null' && rawAdminEmail.trim() !== '') 
                ? rawAdminEmail.toLowerCase().trim() 
                : null;
            if (adminEmail && userEmailLower === adminEmail) {
                try {
                    const adminRef = doc(db, 'admins', userCredential.user.uid);
                    const adminSnap = await getDoc(adminRef).catch(() => null);
                    if (!adminSnap || !adminSnap.exists()) {
                        await setDoc(adminRef, {
                            email: userCredential.user.email,
                            role: 'superadmin',
                            createdAt: Number(Date.now())
                        });
                    }
                } catch(e) {
                    console.warn("Bootstrap: Could not create admin record on login:", e);
                }
            }
            
            onSuccess();
            onClose();
        }
    } catch (err: any) {
        let msg = err.message;
        if (msg.includes('auth/invalid-credential')) msg = 'Incorrect email or password.';
        if (msg.includes('auth/email-already-in-use')) msg = 'This email is already registered.';
        if (msg.includes('auth/weak-password')) msg = 'Password should be at least 6 characters.';
        if (msg.includes('auth/invalid-email')) msg = 'Please enter a valid email address.';
        if (msg.includes('auth/user-not-found')) msg = 'No user found with this email.';
        setError(msg);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 shadow-lg p-0 m-0 w-full h-full sm:p-4">
      <div 
        className="w-full h-full sm:h-auto sm:max-w-[420px] bg-[#2a2c31] sm:rounded-[12px] relative flex flex-col pt-0 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Desktop (inside panel top right, absolute) */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors z-20 hidden sm:block"
        >
          <X size={24} />
        </button>

        {/* Close Button Mobile */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors z-20 sm:hidden"
        >
          <X size={24} />
        </button>

        {/* Tabs */}
        {view !== 'forgot_password' && (
          <div className="flex w-full pt-6 px-6 border-b border-[#3a3c42] relative bg-[#2a2c31] z-10 sticky top-0">
            <button
              onClick={() => { setView('register'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 pb-4 text-[16px] font-medium transition-all duration-200 relative ${
                view === 'register' 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Registration
              {view === 'register' && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white"></div>
              )}
            </button>
            <button
              onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 pb-4 text-[16px] font-medium transition-all duration-200 relative ${
                view === 'login' 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Login
              {view === 'login' && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white"></div>
              )}
            </button>
          </div>
        )}

        <div className="p-6 pt-6">

          {/* ISLAMIC ACCOUNT BANNER */}
          {view === 'register' && (
            <div className="mb-6 bg-[#213f31] border border-[#2c5441] rounded-[8px] p-4 flex items-center justify-center gap-3 shadow-inner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.4 9.6H22L15.8 14.4L18.2 22L12 17.2L5.8 22L8.2 14.4L2 9.6H9.6L12 2Z" fill="#2bb871"/>
              </svg>
              <span className="text-[#2bb871] font-bold text-[13px] tracking-wide uppercase">Islamic account is available</span>
            </div>
          )}

          {/* Social Auth Buttons */}
          {view !== 'forgot_password' && (
            <div className="flex gap-4 mb-6">
              <button 
                type="button" 
                onClick={handleFacebookSignIn} 
                className="flex-1 h-[48px] bg-[#1877f2] rounded-[8px] flex items-center justify-center hover:bg-[#166fe5] transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0C5.373 0 0 5.405 0 12.073C0 18.102 4.411 23.094 10.125 24V15.56H7.078V12.073H10.125V9.414C10.125 6.388 11.916 4.717 14.657 4.717C15.97 4.717 17.344 4.952 17.344 4.952V7.925H15.831C14.34 7.925 13.875 8.855 13.875 9.81V12.073H17.203L16.671 15.56H13.875V24C19.589 23.094 24 18.102 24 12.073Z" fill="white"/>
                </svg>
              </button>
              <button 
                type="button" 
                onClick={handleGoogleSignIn} 
                className="flex-1 h-[48px] bg-white rounded-[8px] flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
              >
                <svg width="22" height="22" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </button>
            </div>
          )}

          {error && (
              <div className="mb-4 text-red-500 text-[13px] bg-red-500/10 p-3 rounded-lg border border-red-500/20 font-medium">
                  {error}
              </div>
          )}

          {successMsg && (
              <div className="mb-4 text-green-500 text-[13px] bg-green-500/10 p-3 rounded-lg border border-green-500/20 font-medium">
                  {successMsg}
              </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative border border-[#4a4c52] rounded-[8px] bg-[#323339] focus-within:border-[#ffcf00] transition-colors overflow-hidden">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full bg-transparent px-4 py-4 text-white placeholder-gray-500 focus:outline-none text-[15px]"
              />
            </div>
            
            <div className="relative border border-[#4a4c52] rounded-[8px] bg-[#323339] focus-within:border-[#ffcf00] transition-colors overflow-hidden">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full bg-transparent px-4 py-4 text-white placeholder-gray-500 focus:outline-none text-[15px]"
              />
            </div>

            {view === 'register' && (
              <p className="text-[13px] text-gray-400 leading-snug">
                8-64 characters. Latin letters, numbers or special symbols. Ensure you don't use this password anywhere else
              </p>
            )}

            {view === 'register' && (
              <div className="flex gap-3 mt-1">
                {['€', '$', '৳'].map(sym => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setCurrency(sym)}
                    className={`flex-1 h-[48px] rounded-[8px] border-[1.5px] font-bold text-[18px] transition-colors flex items-center justify-center ${
                      currency === sym 
                        ? 'border-[#ffcf00] text-[#ffcf00] bg-transparent' 
                        : 'border-[#4a4c52] text-white bg-transparent hover:border-gray-500'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            )}

            {view === 'login' && (
              <div className="flex justify-start">
                <button 
                  type="button"
                  onClick={() => setView('forgot_password')} 
                  className="text-gray-400 text-[13px] hover:text-white transition-colors underline decoration-gray-600 underline-offset-4"
                >
                  Forgot my password
                </button>
              </div>
            )}

            {view === 'forgot_password' && (
              <div className="flex justify-start">
                <button 
                  type="button"
                  onClick={() => setView('login')} 
                  className="text-gray-400 text-[13px] hover:text-white transition-colors underline decoration-gray-600 underline-offset-4"
                >
                  Back to login
                </button>
              </div>
            )}

            {view === 'register' && (
              <label className="flex items-start gap-3 mt-2 cursor-pointer group select-none">
                <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                  <input 
                    type="checkbox" 
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="appearance-none w-5 h-5 border-[1.5px] border-[#ffcf00] rounded-[4px] bg-transparent checked:bg-[#ffcf00] transition-colors cursor-pointer"
                  />
                  {agreed && (
                    <svg className="absolute w-3 h-3 text-black pointer-events-none" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-[14px] text-gray-300 leading-snug transition-colors">
                  I accept the terms of the <span className="underline decoration-gray-500 underline-offset-2 hover:text-white">Client Agreement</span> and <span className="underline decoration-gray-500 underline-offset-2 hover:text-white">Privacy Policy</span> and confirm being adult
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffcf00] hover:bg-[#e6bb00] disabled:opacity-50 active:scale-[0.98] text-[#1c1d22] font-semibold text-[16px] py-4 rounded-[8px] mt-2 transition-all flex items-center justify-center"
            >
              {loading ? <span className="w-5 h-5 border-2 border-[#1c1d22] border-t-transparent inset-0 rounded-full animate-spin"></span> : (view === 'login' ? 'Log in' : view === 'register' ? 'Register' : 'Reset password')}
            </button>
            
            {view === 'login' && (
              <div className="flex items-center justify-end mt-4 gap-3 text-[14px]">
                <span className="text-gray-400">No account?</span>
                <button 
                  type="button"
                  onClick={() => { setView('register'); setError(null); }}
                  className="bg-[#3a3c42] hover:bg-[#4a4c52] text-white px-5 py-2.5 rounded-[8px] transition-colors font-medium text-[14px]"
                >
                  Register
                </button>
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
}
