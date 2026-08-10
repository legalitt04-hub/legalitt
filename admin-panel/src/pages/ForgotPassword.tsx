import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Mail, ArrowLeft, KeyRound, Lock, Eye, EyeOff, CheckCircle2, RefreshCw, Shield, Loader2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const navigate = useNavigate();

  // STEP 1: Send OTP to Email
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email: email.toLowerCase().trim() });
      if (response.data.success) {
        setMessage(response.data.message || 'A 6-digit OTP code has been sent to your email.');
        setStep(2);
      } else {
        setError(response.data.message || 'Failed to send reset code');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP Code
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/verify-reset-otp', {
        email: email.toLowerCase().trim(),
        otp,
      });

      if (response.data.success && response.data.data?.resetToken) {
        setResetToken(response.data.data.resetToken);
        setMessage('OTP verified! Now enter your new password.');
        setStep(3);
      } else {
        setError(response.data.message || 'Invalid OTP code.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Set & Confirm New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and Confirm password do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        token: resetToken,
        password: newPassword,
      });

      if (response.data.success) {
        alert('✅ Password reset successful! Please log in with your new password.');
        navigate('/login');
      } else {
        setError(response.data.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reset session expired. Please request a new OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-[#111111]/80 backdrop-blur-2xl border border-white/10 shadow-2xl z-10"
      >
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
          <p className="text-slate-400 text-sm text-center mt-1">
            {step === 1 && 'Step 1: Enter your registered admin email'}
            {step === 2 && 'Step 2: Enter the 6-digit OTP code sent to your email'}
            {step === 3 && 'Step 3: Create and confirm your new password'}
          </p>
        </div>

        {/* 3-Step Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-amber-500' : 'w-2 bg-emerald-500'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-amber-500' : step > 2 ? 'w-2 bg-emerald-500' : 'w-2 bg-white/20'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 3 ? 'w-8 bg-amber-500' : 'w-2 bg-white/20'}`} />
        </div>

        {/* Alerts */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{message}</span>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium text-center">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type="email"
                  name="user-email"
                  autoComplete="email"
                  placeholder="admin@legalitt.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 h-12 bg-[#1A1A1A] border border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 bg-amber-500 hover:bg-amber-400 text-[#0A0A0A] rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {loading ? 'Sending OTP...' : 'Send Verification OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4" autoComplete="off">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  6-Digit OTP Code
                </label>
                <span className="text-[11px] text-amber-500 font-mono truncate max-w-[180px]">{email}</span>
              </div>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type="text"
                  name="one-time-code"
                  id="one-time-code-input"
                  autoComplete="one-time-code"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="w-full pl-11 pr-4 h-12 bg-[#1A1A1A] border border-white/10 text-white placeholder:text-slate-600 rounded-xl text-center text-lg tracking-[0.5em] font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full h-12 mt-2 bg-amber-500 hover:bg-amber-400 text-[#0A0A0A] rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {loading ? 'Verifying OTP...' : 'Verify OTP Code'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setMessage(''); setError(''); }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Resend OTP / Change Email
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Set & Confirm Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="new-password"
                  id="new-password-input"
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  className="w-full pl-11 pr-12 h-12 bg-[#1A1A1A] border border-white/10 text-white placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm-password"
                  id="confirm-password-input"
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  className="w-full pl-11 pr-12 h-12 bg-[#1A1A1A] border border-white/10 text-white placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full h-12 mt-2 bg-amber-500 hover:bg-amber-400 text-[#0A0A0A] rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
