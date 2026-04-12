import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const STEPS = { MAIN: 'main', OTP: 'otp', NAME: 'name' };
const isPhone = v => /^[6-9]\d{9}$/.test(v.replace(/\s/g, ''));
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function Login() {
  const navigate = useNavigate();
  const { login, register, googleLogin } = useAuth();

  const [step, setStep]         = useState(STEPS.MAIN);
  const [input, setInput]       = useState('');
  const [otp, setOtp]           = useState(['', '', '', '']);
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [agreed, setAgreed]     = useState(false);

  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  const inputType = isEmail(input) ? 'email' : null;

  // ── Handle Next from main step ────────────────────────
  const handleNext = async () => {
    if (!inputType) { toast.error('Enter a valid email or 10-digit mobile number'); return; }
    if (!agreed)    { toast.error('Please accept Terms & Privacy Policy');           return; }
    setLoading(true);
    try {
      if (inputType === 'phone') {
        await authAPI.sendOTP(input.replace(/\s/g, ''));
        setStep(STEPS.NAME);
      } else {
        // Email flow — prompt password via OTP step reused as password
        setStep(STEPS.NAME);
      }
    } catch (_) {
    } finally { setLoading(false); }
  };

  // ── OTP box handling ──────────────────────────────────
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 3) otpRefs[i + 1].current?.focus();
  };
  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs[i - 1].current?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 4) { toast.error('Enter the 4-digit code'); return; }
    setLoading(true);
    try {
      await authAPI.verifyOTP(input, code, '');
      setStep(STEPS.NAME);
    } catch (_) {
    } finally { setLoading(false); }
  };

  const handleFinish = async () => {
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    setLoading(true);
    try {
      const code = otp.join('');
      await authAPI.verifyOTP(input, code, name);
      navigate('/');
    } catch (_) {
    } finally { setLoading(false); }
  };

  // ── Google login ──────────────────────────────────────
  const handleGoogle = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
    } catch (err) {
      toast.error('Google sign-in failed');
    }
  };

  // ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-14 pb-10">

      {/* Back button (steps > main) */}
      {step !== STEPS.MAIN && (
        <button
          onClick={() => { setStep(STEPS.MAIN); setOtp(['','','','']); }}
          className="flex items-center gap-1.5 text-gray-500 text-sm mb-6 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
      )}

      {/* Logo */}
      {step === STEPS.MAIN && (
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <Scale size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Legalitt</span>
        </div>
      )}

      {/* ── STEP: MAIN ── */}
      {step === STEPS.MAIN && (
        <div className="flex-1 flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Login / Register</h1>
          <p className="text-gray-500 text-sm mb-8">Login/Register in Your Account</p>

          <label className="text-xs font-semibold text-gray-600 mb-1.5">E-mail / Mobile No.</label>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="E-mail / Mobile No."
            type="text"
            inputMode="text"
            className="input mb-6"
            onKeyDown={e => e.key === 'Enter' && handleNext()}
          />

          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mb-6"
          >
            {loading ? <Spinner size="sm" color="white" /> : 'Next'}
          </button>

          {/* OR divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social logins */}
          <div className="flex items-center justify-center gap-5 mb-8">
                          {/* Google */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogle}
                  onError={() => toast.error('Google sign-in failed')}
                  useOneTap={false}
                  shape="circle"
                  size="large"
                />
              </div>

            {/* Facebook */}
            <button className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            {/* Apple */}
            <button className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#000">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </button>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2.5 mt-auto">
            <button
              onClick={() => setAgreed(a => !a)}
              className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all mt-0.5 ${
                agreed ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
              }`}
            >
              {agreed && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
            <p className="text-xs text-gray-500 leading-relaxed">
              Follow{' '}
              <button className="text-primary-600 font-semibold">Terms & Condition</button>
              {' | '}
              <button className="text-primary-600 font-semibold">Privacy Policy</button>
            </p>
          </div>
        </div>
      )}

      {/* ── STEP: OTP ── */}
      {step === STEPS.OTP && (
        <div className="flex-1 flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter verification code</h1>
          <p className="text-gray-500 text-sm mb-10">
            Code sent to <span className="font-semibold text-gray-800">{input}</span>
          </p>

          <label className="text-xs font-semibold text-gray-500 mb-3">Code</label>
          <div className="flex gap-3 mb-10">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={otpRefs[i]}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                maxLength={1}
                inputMode="numeric"
                className="w-16 h-16 text-center text-2xl font-bold border-2 rounded-2xl outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100 border-gray-200 bg-gray-50"
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length < 4}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-auto"
          >
            {loading ? <Spinner size="sm" color="white" /> : 'Next'}
          </button>

          <button className="text-center text-sm text-primary-600 font-semibold mt-4 hover:underline">
            Resend Code
          </button>
        </div>
      )}

      {/* ── STEP: NAME ── */}
      {step === STEPS.NAME && (
        <div className="flex-1 flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">What's your name?</h1>
          <p className="text-gray-500 text-sm mb-8">Help us personalize your experience</p>

          <label className="text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your full name"
            className="input mb-6"
            onKeyDown={e => e.key === 'Enter' && handleFinish()}
          />

          <button
            onClick={handleFinish}
            disabled={loading || !name.trim()}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-auto"
          >
            {loading ? <Spinner size="sm" color="white" /> : 'Get Started →'}
          </button>
        </div>
      )}
    </div>
  );
}
