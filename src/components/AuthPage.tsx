import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { AuthUser } from '../types';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  checkUserExists
} from '../services/authService';
import { ForgotPasswordFlow } from './ForgotPasswordFlow';
import { WelcomeSetup } from './WelcomeSetup';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  onAuthSuccess: (user: AuthUser) => void;
  onCancel?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onAuthSuccess,
  onCancel
}) => {
  const [isLogin, setIsLogin] = useState<boolean>(initialMode === 'login');
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [userExists, setUserExists] = useState<boolean>(false);
  const [existingUserEmail, setExistingUserEmail] = useState<string>('');

  // Form inputs
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // UI States
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingUser, setIsCheckingUser] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if user exists on component mount (Single User Constraint)
  useEffect(() => {
    async function checkExistingUser() {
      setIsCheckingUser(true);
      const result = await checkUserExists();
      setUserExists(result.exists);
      if (result.exists && result.email) {
        setExistingUserEmail(result.email);
        setIsLogin(true); // Force login mode if user exists
        setShowWelcome(false); // Hide welcome page if user exists
      } else {
        // No user exists - show welcome page
        setShowWelcome(true);
      }
      setIsCheckingUser(false);
    }
    checkExistingUser();
  }, []);

  // Re-check user existence when switching between login/signup modes
  const recheckUserExists = async () => {
    const result = await checkUserExists();
    setUserExists(result.exists);
    if (result.exists && result.email) {
      setExistingUserEmail(result.email);
      setIsLogin(true);
      setShowWelcome(false);
    }
  };

  // Handle Email + Password Submit (Login or Sign Up)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Re-check user existence before allowing signup
    await recheckUserExists();

    // Single User Constraint: Block signup if user already exists
    if (!isLogin && userExists) {
      setError(`Account already exists (${existingUserEmail}). This system supports only ONE admin account. Please sign in instead.`);
      setIsLogin(true);
      return;
    }

    if (!isLogin && !name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    if (isLogin) {
      const res = await signInWithEmail(email.trim(), password);
      setIsLoading(false);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setError(res.error || 'Invalid credentials. Please try again.');
      }
    } else {
      const res = await signUpWithEmail({
        email: email.trim(),
        password,
        name: name.trim()
      });
      setIsLoading(false);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setError(res.error || 'Registration failed.');
        // If single user constraint triggered, switch to login mode
        if (res.error?.includes('Account already exists') || res.error?.includes('already registered')) {
          await recheckUserExists();
          setTimeout(() => setIsLogin(true), 2000);
        }
      }
    }
  };



  // Show welcome page if no user exists and user hasn't started signup
  if (showWelcome && !userExists) {
    return (
      <WelcomeSetup
        onCreateAccount={() => {
          setShowWelcome(false);
          setIsLogin(false); // Switch to signup mode
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 text-slate-100 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 relative z-10">
        
        {/* Forgot Password Flow */}
        {isForgotPassword ? (
          <ForgotPasswordFlow
            onBack={() => {
              setIsForgotPassword(false);
              setError(null);
              setSuccessMessage(null);
            }}
            onSuccess={() => {
              setSuccessMessage('Password reset successful! You can now sign in.');
            }}
          />
        ) : (
          <>
            {/* Brand Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-xl flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-lg shadow-blue-500/20 border border-blue-400/30">
                SA
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="font-bold text-lg text-white tracking-tight">Sufiyan Autos</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {isLogin ? 'Welcome Back' : 'Create Admin Account'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isLogin 
                  ? 'Sign in to access your ERP dashboard' 
                  : 'Register as the system administrator'}
              </p>
            </div>

            {/* Loading State while checking user existence */}
            {isCheckingUser ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : (
              <>
                {/* Single User Constraint Warning for Signup */}
                {!isLogin && userExists && (
                  <div className="mb-5 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl flex items-start gap-3 animate-in fade-in">
                    <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-bold mb-1">Single User System</p>
                      <p className="leading-relaxed">
                        An admin account already exists in this system (<strong>{existingUserEmail}</strong>). 
                        This ERP supports only ONE administrator account. Please sign in instead.
                      </p>
                    </div>
                  </div>
                )}

                {/* Mode Switcher Tabs (Login vs Sign Up) - Hide signup if user exists */}
                {!userExists && (
                  <div className="flex p-1 bg-slate-900/80 border border-slate-700/60 rounded-xl mb-5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(true);
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                        isLogin
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(false);
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                        !isLogin
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                )}

                {/* Error Alert */}
                {error && (
                  <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                {/* Success Alert */}
                {successMessage && (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span className="leading-relaxed">{successMessage}</span>
                  </div>
                )}

                {/* Main Authentication Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Sign Up Fields: Name */}
                  {!isLogin && !userExists && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Muhammad Bilawal"
                          className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@dealership.pk"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Password <span className="text-rose-400">*</span>
                      </label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setError(null);
                            setSuccessMessage(null);
                          }}
                          className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || (!isLogin && userExists)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-blue-500/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : isLogin ? (
                      <>
                        <span>Sign In to Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{userExists ? 'Sign Up Disabled' : 'Create Admin Account'}</span>
                      </>
                    )}
                  </button>
                </form>
                
                {/* Modal Dismiss */}
                {onCancel && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={onCancel}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      Close
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
