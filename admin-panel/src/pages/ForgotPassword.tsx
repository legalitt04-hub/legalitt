import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setMessage(response.data.message || 'A 6-digit reset OTP has been sent to your email.');
        setStep(2);
      } else {
        setError(response.data.message || 'Failed to send reset link');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', { email, otp, newPassword });
      if (response.data.success) {
        alert('Password has been successfully reset. Please log in.');
        navigate('/login');
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-100/30 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md p-8 md:p-10 rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xl shadow-slate-200/50 z-10"
      >
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 mb-6 relative">
            <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full"></div>
            <img src="/assets/shield-logo.png" alt="Legalitt Shield" className="w-full h-full object-contain relative z-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h1>
          <p className="text-slate-500 text-sm text-center">
            {step === 1 ? "Enter your email and we'll send you a reset OTP." : "Enter the OTP and your new password."}
          </p>
        </div>

        {message && step === 2 && (
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-center text-sm mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center mb-4">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:ring-amber-500/50 focus-visible:border-amber-400"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 mt-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all duration-300"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Send Reset OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:ring-amber-500/50 focus-visible:border-amber-400 text-center tracking-widest font-bold"
                required
              />
            </div>
            
            <div className="relative">
              <Input
                type="password"
                placeholder="New Password (min 8 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:ring-amber-500/50 focus-visible:border-amber-400"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 mt-6 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 transition-all duration-300"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Reset Password"}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
