import React, { useState } from 'react';
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
  KeyRound
} from 'lucide-react';
import { AuthUser } from '../types';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  sendPasswordReset 
} from '../services/authService';

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

  // Form inputs
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // UI States
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle Email + Password Submit (Login or Sign Up)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (isForgotPassword) {
      if (!email.trim()) {
        setError('Please enter your account email address.');
        return;
      }
      setIsLoading(true);
      const res = await sendPasswordReset(email.trim());
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage(`Password reset link has been sent to ${email.trim()}. Check your inbox.`);
      } else {
        setError(res.error || 'Failed to send password reset email.');
      }
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
      }
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);
    
    console.log('Attempting Google Sign-In...');
    
    const res = await signInWithGoogle();
    setIsGoogleLoading(false);
    
    if (res.success && res.user) {
      console.log('Google Sign-In successful:', res.user.email);
      onAuthSuccess(res.user);
    } else {
      console.error('Google Sign-In failed:', res.error);
      setError(res.error || 'Google authentication was not completed. Please check the setup guide (GOOGLE_AUTH_SETUP.md) or try email/password login.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 text-slate-100 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-xl flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-lg shadow-blue-500/20 border border-blue-400/30">
            SA
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="font-bold text-lg text-white tracking-tight">Sufiyan Autos</span>
            {/* <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Cloud v2.0
            </span> */}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            {isForgotPassword 
              ? 'Reset Your Password' 
              : isLogin 
                ? 'Welcome Back' 
                : 'Create Team Account'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isForgotPassword
              ? 'Enter your email to receive a recovery link'
              : isLogin 
                ? 'Sign in to access real-time electric bike inventory' 
                : 'Register your dealership profile on the cloud database'}
          </p>
        </div>

        {/* Mode Switcher Tabs (Login vs Sign Up) */}
        {!isForgotPassword && (
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

        {/* One-Click Google Authentication */}
        {!isForgotPassword && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold py-2.5 px-4 rounded-xl text-xs transition shadow-md active:scale-[0.99] border border-slate-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isLogin ? 'Continue with Google' : 'Sign up with Google'}</span>
            </button>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Or with Email
              </span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl flex flex-col gap-2 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
            {error.toLowerCase().includes('google') && (
              <div className="pt-2 border-t border-red-500/20 text-[11px] text-slate-300">
                <p className="font-semibold text-amber-300 mb-1">To fix Google Sign-in in 1 minute:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-300 text-[11px]">
                  <li>Open <a href="https://console.firebase.google.com/project/sufiyanautos-4975a/authentication/providers" target="_blank" rel="noreferrer" className="text-blue-400 underline font-medium hover:text-blue-300">Firebase Console (sufiyanautos-4975a)</a></li>
                  <li>Go to <strong>Authentication &rarr; Sign-in method</strong></li>
                  <li>Click <strong>Google</strong> &rarr; Toggle <strong>Enable</strong> &rarr; Select your support email &rarr; Click <strong>Save</strong></li>
                </ol>
              </div>
            )}
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
          {!isLogin && !isForgotPassword && (
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

          {/* Password (if not in forgot password mode) */}
          {!isForgotPassword && (
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
          )}


          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-blue-500/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isForgotPassword ? (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Send Password Reset Link</span>
              </>
            ) : isLogin ? (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create Cloud Account</span>
              </>
            )}
          </button>
        </form>

        {/* Back to Login from Forgot Password */}
        {isForgotPassword && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

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

      </div>
    </div>
  );
};
