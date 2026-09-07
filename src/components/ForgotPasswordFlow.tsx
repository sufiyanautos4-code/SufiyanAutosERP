import React, { useState } from 'react';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import {
  requestPasswordResetOTP,
  verifyPasswordResetOTP,
  validateResetToken
} from '../services/passwordResetService';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

interface ForgotPasswordFlowProps {
  onBack: () => void;
  onSuccess?: () => void;
}

type FlowStep = 'email' | 'otp' | 'success';

export const ForgotPasswordFlow: React.FC<ForgotPasswordFlowProps> = ({
  onBack,
  onSuccess
}) => {
  const [step, setStep] = useState<FlowStep>('email');
  const [email, setEmail] = useState<string>('');
  const [otp, setOTP] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await requestPasswordResetOTP(email.trim());
      setIsLoading(false);

      console.log('Password reset OTP result:', result); // Debug log

      if (result.success) {
        setSuccessMessage(`A 4-digit verification code has been sent to ${email.trim()}`);
        setStep('otp');
      } else {
        setError(result.error || result.message || 'Failed to send verification code. Please try again.');
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Error requesting OTP:', err);
      setError('Network error. Please check your connection and try again.');
    }
  };

  // Step 2: Verify OTP and send Firebase password reset email
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!otp.trim() || otp.trim().length !== 4) {
      setError('Please enter the 4-digit verification code.');
      return;
    }

    setIsLoading(true);

    // Verify OTP
    const verifyResult = await verifyPasswordResetOTP(email.trim(), otp.trim());

    if (!verifyResult.success || !verifyResult.resetToken) {
      setIsLoading(false);
      setError(verifyResult.error || 'Invalid verification code. Please try again.');
      return;
    }

    setResetToken(verifyResult.resetToken);

    // Validate the reset token
    const validateResult = await validateResetToken(email.trim(), verifyResult.resetToken);

    if (!validateResult.success) {
      setIsLoading(false);
      setError(validateResult.error || 'Reset session expired. Please start over.');
      return;
    }

    // Send Firebase password reset email
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage('Verification successful! Password reset email sent. Check your inbox!');
      setStep('success');
      setIsLoading(false);

      // Redirect back to login after 4 seconds
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onBack();
      }, 4000);
    } catch (firebaseError: any) {
      setIsLoading(false);
      setError('Failed to send password reset email. Please try again.');
      console.error('Firebase reset email error:', firebaseError);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const result = await requestPasswordResetOTP(email.trim());
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage('New verification code has been sent to your email.');
      setOTP('');
    } else {
      setError(result.error || 'Failed to resend code.');
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-xl flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-lg shadow-blue-500/20 border border-blue-400/30">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white">
          {step === 'email' && 'Reset Your Password'}
          {step === 'otp' && 'Verify Code'}
          {step === 'success' && 'Success!'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {step === 'email' && 'Enter your email to receive a verification code'}
          {step === 'otp' && 'Check your email for the 4-digit code'}
          {step === 'success' && 'Password reset email has been sent'}
        </p>
      </div>

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

      {/* Step 1: Email Input */}
      {step === 'email' && (
        <form onSubmit={handleRequestOTP} className="space-y-4">
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
                placeholder="your-email@example.com"
                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-lg shadow-blue-500/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <span>Send Verification Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              4-Digit Verification Code <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                maxLength={4}
                pattern="\d{4}"
                value={otp}
                onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                placeholder="1234"
                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9 pr-3 py-2.5 text-2xl text-center text-slate-100 placeholder-slate-500 outline-none transition tracking-[0.5em] font-mono font-bold"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              Enter the 4-digit code sent to <strong className="text-blue-400">{email}</strong>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 4}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-lg shadow-blue-500/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify & Reset Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isLoading}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold disabled:opacity-50"
            >
              Didn't receive the code? Resend
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Success State */}
      {step === 'success' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Verification Successful!</h3>
          <p className="text-sm text-slate-400">
            Check your email for the password reset link. You'll be redirected to login shortly.
          </p>
        </div>
      )}

      {/* Back Button */}
      {step !== 'success' && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Sign In</span>
          </button>
        </div>
      )}
    </div>
  );
};
