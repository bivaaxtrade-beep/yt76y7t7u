import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  sendEmailVerification
} from '../firebase';
import { saveAuth } from '../lib/auth-client.ts';
import { getNextAffiliateId, getUserByAffiliateId } from '../lib/affiliate';
import { Logo } from '../components/Logo';
import { toast } from 'react-hot-toast';
import SEO from '../components/SEO';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAffiliateSubdomain = window.location.hostname.startsWith('affiliate.') || window.location.hostname.includes('affiliate');
  
  // Determine if login or register based on URL path
  const isRegisterPath = location.pathname === '/register' || location.pathname === '/signup';
  
  const [view, setView] = useState<'login' | 'register' | 'forgot_password'>(
    isRegisterPath ? 'register' : 'login'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [currency, setCurrency] = useState('৳');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Keep state in-sync with URL changes
  useEffect(() => {
    setView(isRegisterPath ? 'register' : 'login');
    setError(null);
    setSuccessMsg(null);
  }, [isRegisterPath]);

  // Handle message from Google Auth popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        saveAuth(event.data.token, event.data.user);
        toast.success("Successfully logged in with Google!");
        navigate('/trade');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const handleToggleView = (newView: 'login' | 'register') => {
    setError(null);
    setSuccessMsg(null);
    if (newView === 'register') {
      navigate('/register');
    } else {
      navigate('/login');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Auto-bootstrap user record if it doesn't exist
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const affiliateId = await getNextAffiliateId();
        await setDoc(userRef, {
          email: userCredential.user.email,
          balance: 0.0,
          demoBalance: 10000.0,
          currency: '৳',
          affiliateId: affiliateId,
          createdAt: Date.now(),
          isVerified: false
        });
      }

      toast.success("Successfully logged in with Google!");
      navigate('/trade');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = () => {
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
        
        const affiliateId = await getNextAffiliateId();
        const referralCode = localStorage.getItem('referralCode');
        let referredBy = null;
        let referredByUid = null;

        if (referralCode) {
          const referrer = await getUserByAffiliateId(referralCode);
          if (referrer) {
            referredBy = referralCode;
            referredByUid = referrer.uid;
          }
        }

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          balance: 0.0,
          demoBalance: 10000.0,
          currency: currency,
          affiliateId: affiliateId,
          referredBy: referredBy,
          referredByUid: referredByUid,
          createdAt: Date.now(),
          isVerified: false
        });

        toast.success("Registration successful!");
        navigate('/trade');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
        navigate('/trade');
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1d22] text-white font-sans flex flex-col justify-between relative overflow-x-hidden pt-4 pb-8 px-4 selection:bg-[#ffcf00]/30 selection:text-black">
      <SEO 
        title={view === 'login' ? 'Login' : view === 'register' ? 'Create Account' : 'Reset Password'}
        description={`Access your Bivaax Trading account. ${view === 'login' ? 'Login to trade.' : 'Sign up for a free demo account today.'}`}
        keywords="Bivaax login, Bivaax register, Bivaax signup, binary trade login"
      />
      {/* Background ambient glowing gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-[#ffcf00]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Bar */}
      <header className="max-w-[1200px] w-full mx-auto flex items-center justify-between z-10 relative py-2 mb-4 sm:mb-8">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
          <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        <div className="flex items-center justify-center flex-col gap-1">
          <Logo />
          {isAffiliateSubdomain && (
            <span className="text-[10px] text-[#ffcf00] font-black tracking-widest uppercase mt-1">Partner Network</span>
          )}
        </div>
        <div className="w-[100px] hidden sm:block"></div> {/* Spacer for symmetry */}
      </header>

      {/* Main Auth Panel & Layout */}
      <main className="w-full flex-grow flex items-center justify-center z-10 relative my-4">
        <div className="w-full max-w-[440px] bg-[#22232a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
          
          {/* Header tabs for toggling Register vs Login */}
          {view !== 'forgot_password' && (
            <div className="flex w-full pt-6 px-6 border-b border-white/5 relative bg-[#22232a] z-10">
              <button
                type="button"
                onClick={() => handleToggleView('register')}
                className={`flex-1 pb-4 text-[16px] font-bold transition-all duration-200 relative text-center focus:outline-none ${
                  view === 'register' 
                    ? 'text-[#ffcf00]' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {isAffiliateSubdomain ? "Partner Registration" : "Registration"}
                {view === 'register' && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#ffcf00] rounded-t-full"></div>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleToggleView('login')}
                className={`flex-1 pb-4 text-[16px] font-bold transition-all duration-200 relative text-center focus:outline-none ${
                  view === 'login' 
                    ? 'text-[#ffcf00]' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {isAffiliateSubdomain ? "Partner Login" : "Login"}
                {view === 'login' && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#ffcf00] rounded-t-full"></div>
                )}
              </button>
            </div>
          )}

          <div className="p-6 sm:p-8 flex-grow">
            
            {/* AFFILIATE SPECIAL BANNER */}
            {isAffiliateSubdomain && view === 'register' && (
              <div className="mb-6 bg-indigo-950/40 border border-indigo-900/30 rounded-2xl p-4.5 flex flex-col gap-1.5 shadow-inner text-left">
                <span className="text-[#8892ff] font-black text-[11px] tracking-wider uppercase">Bivaax Elite Partner</span>
                <span className="text-gray-400 text-[11px] leading-relaxed font-semibold">Join standard partnerships immediately. Configure Sub-IDs, view precision stats, and earn up to 80% RevShare immediately!</span>
              </div>
            )}

            {/* ISLAMIC ACCOUNT BANNER */}
            {view === 'register' && (
              <div className="mb-6 bg-[#162e24] border border-[#214737] rounded-xl p-4 flex items-center justify-center gap-3 shadow-inner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L14.4 9.6H22L15.8 14.4L18.2 22L12 17.2L5.8 22L8.2 14.4L2 9.6H9.6L12 2Z" fill="#1ebd6f"/>
                </svg>
                <span className="text-[#1ebd6f] font-black text-[13px] tracking-wide uppercase">Islamic account is available</span>
              </div>
            )}

            {/* Social Authentication buttons */}
            {view !== 'forgot_password' && (
              <div className="flex gap-4 mb-6">
                <button 
                  type="button" 
                  onClick={handleFacebookSignIn} 
                  className="flex-1 h-[52px] bg-[#1877f2] rounded-xl flex items-center justify-center hover:bg-[#166fe5] active:scale-[0.98] transition-all"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0C5.373 0 0 5.405 0 12.073C0 18.102 4.411 23.094 10.125 24V15.56H7.078V12.073H10.125V9.414C10.125 6.388 11.916 4.717 14.657 4.717C15.97 4.717 17.344 4.952 17.344 4.952V7.925H15.831C14.34 7.925 13.875 8.855 13.875 9.81V12.073H17.203L16.671 15.56H13.875V24C19.589 23.094 24 18.102 24 12.073Z" fill="white"/>
                  </svg>
                </button>
                <button 
                  type="button" 
                  onClick={handleGoogleSignIn} 
                  className="flex-1 h-[52px] bg-white rounded-xl flex items-center justify-center hover:bg-gray-100 active:scale-[0.98] transition-all shadow-md"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 text-red-500 text-[13px] bg-red-500/10 p-3.5 rounded-xl border border-red-500/20 font-semibold leading-relaxed">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 text-green-500 text-[13px] bg-green-500/10 p-3.5 rounded-xl border border-green-500/20 font-semibold leading-relaxed">
                {successMsg}
              </div>
            )}

            {/* General Fields */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative border border-[#4a4c52] rounded-xl bg-[#2d2f36] focus-within:border-[#ffcf00] focus-within:bg-[#32343c] transition-all duration-200 overflow-hidden">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full bg-transparent px-4 py-4.5 text-white placeholder-gray-500 focus:outline-none text-[15px]"
                />
              </div>
              
              <div className="relative border border-[#4a4c52] rounded-xl bg-[#2d2f36] focus-within:border-[#ffcf00] focus-within:bg-[#32343c] transition-all duration-200 overflow-hidden flex items-center pr-3">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required={view !== 'forgot_password'}
                  minLength={6}
                  className="w-full bg-transparent px-4 py-4.5 text-white placeholder-gray-500 focus:outline-none text-[15px]"
                />
                {view !== 'forgot_password' && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
              </div>

              {view === 'register' && (
                <p className="text-[12px] text-gray-400 leading-snug">
                  8-64 characters. Latin letters, numbers or special symbols. Ensure you don't use this password anywhere else
                </p>
              )}

              {/* Currency Selector */}
              {view === 'register' && (
                <div className="flex gap-3 mt-1">
                  {['€', '$', '৳'].map(sym => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setCurrency(sym)}
                      className={`flex-1 h-[52px] rounded-xl border-[1.5px] font-bold text-[19px] transition-colors flex items-center justify-center ${
                        currency === sym 
                          ? 'border-[#ffcf00] text-[#ffcf00] bg-[#ffcf00]/5' 
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
                    className="text-gray-400 text-[13px] hover:text-[#ffcf00] transition-colors underline decoration-gray-600 hover:decoration-[#ffcf00] underline-offset-4 font-semibold"
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
                    className="text-gray-400 text-[13px] hover:text-[#ffcf00] transition-colors underline decoration-gray-600 hover:decoration-[#ffcf00] underline-offset-4 font-semibold"
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
                      className="appearance-none w-5 h-5 border-[1.5px] border-[#ffcf00] rounded-[6px] bg-transparent checked:bg-[#ffcf00] transition-all cursor-pointer"
                    />
                    {agreed && (
                      <svg className="absolute w-3 h-3 text-black pointer-events-none" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-[13px] sm:text-[14px] text-gray-300 leading-snug transition-colors">
                    I accept the terms of the <span className="underline decoration-gray-500 underline-offset-2 hover:text-white">Client Agreement</span> and <span className="underline decoration-gray-500 underline-offset-2 hover:text-white">Privacy Policy</span> and confirm being adult
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ffcf00] hover:bg-[#e6bb00] disabled:opacity-50 active:scale-[0.98] text-[#1c1d22] font-semibold text-[16px] py-4.5 rounded-xl mt-4 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ffcf00]/10 font-bold"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-[#1c1d22] border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  view === 'login' ? 'Log in' : view === 'register' ? 'Register' : 'Reset password'
                )}
              </button>
              
              {view === 'login' && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-[14px]">
                  <span className="text-gray-400">No account?</span>
                  <button 
                    type="button"
                    onClick={() => handleToggleView('register')}
                    className="bg-[#3a3c42] hover:bg-[#4a4c52] active:scale-95 text-white px-5 py-2.5 rounded-xl transition-all font-semibold text-[13px]"
                  >
                    Register
                  </button>
                </div>
              )}

              {view === 'register' && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-[14px]">
                  <span className="text-gray-400">Already a member?</span>
                  <button 
                    type="button"
                    onClick={() => handleToggleView('login')}
                    className="bg-[#3a3c42] hover:bg-[#4a4c52] active:scale-95 text-white px-5 py-2.5 rounded-xl transition-all font-semibold text-[13px]"
                  >
                    Log In
                  </button>
                </div>
              )}
            </form>

          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="w-full max-w-[1200px] mx-auto z-10 relative flex items-center justify-center border-t border-white/5 pt-6 mt-4">
        <p className="text-[12px] text-gray-500 flex items-center gap-1">
          <Shield size={12} />
          Banking-level encryption & Secure SSL transfers
        </p>
      </footer>
    </div>
  );
}
