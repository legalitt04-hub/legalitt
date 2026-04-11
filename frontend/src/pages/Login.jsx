import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Scale, Eye, EyeOff, ArrowRight, Phone, Mail } from 'lucide-react';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('email'); // 'email' | 'otp'
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [form, setForm] = useState({ email: '', password: '', phone: '', otp: '' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (_) {} finally { setLoading(false); }
  };

  const handleSendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(form.phone)) { toast.error('Enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      const res = await authAPI.sendOTP(form.phone);
      setOtpSent(true);
      toast.success('OTP sent! Check your phone.');
      if (res.data.otp) toast(`Dev OTP: ${res.data.otp}`, { icon: '🔑' });
    } catch (_) {} finally { setLoading(false); }
  };

  const handleOTPLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.verifyOTP(form.phone, form.otp);
      localStorage.setItem('legalitt_token', res.data.token);
      localStorage.setItem('legalitt_user', JSON.stringify(res.data.user));
      toast.success('Login successful!');
      navigate('/');
    } catch (_) {} finally { setLoading(false); }
  };

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenRes) => {
      setLoading(true);
      try {
        // Exchange access token for ID token via userinfo
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenRes.access_token}` }
        }).then(r => r.json());
        // For full flow use idToken; this demo uses access token
        await googleLogin(tokenRes.access_token);
        navigate('/');
      } catch (_) {} finally { setLoading(false); }
    },
    onError: () => toast.error('Google login failed')
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 50%, #4d7aff 0%, transparent 60%), radial-gradient(circle at 80% 20%, #1a4fd6 0%, transparent 50%)'
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Scale size={20} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white">Legalitt</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Justice Starts<br />With the Right<br />Advocate
          </h2>
          <p className="text-primary-200 text-base leading-relaxed max-w-sm">
            Connect with 21,000+ verified advocates across Madhya Pradesh. Find expert legal help near you.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[['21,000+', 'Advocates'], ['16', 'Cities'], ['12', 'Specializations'], ['4.5★', 'Avg Rating']].map(([num, label]) => (
            <div key={label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-white font-bold text-xl">{num}</p>
              <p className="text-primary-200 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <Scale size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-primary-900">Legalitt</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to find legal help near you</p>

          {/* Mode toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {[['email', Mail, 'Email'], ['otp', Phone, 'Mobile OTP']].map(([m, Icon, label]) => (
              <button
                key={m}
                onClick={() => { setMode(m); setOtpSent(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  mode === m ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {/* Email form */}
          {mode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email address</label>
                <input type="email" value={form.email} onChange={set('email')} required
                  placeholder="you@example.com" className="input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    required placeholder="••••••••" className="input pr-11" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                {loading ? <Spinner size="sm" color="white" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* OTP form */}
          {mode === 'otp' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 font-medium">+91</div>
                  <input type="tel" value={form.phone} onChange={set('phone')} maxLength={10}
                    placeholder="9876543210" className="input flex-1" disabled={otpSent} />
                </div>
              </div>
              {!otpSent ? (
                <button onClick={handleSendOTP} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                  {loading ? <Spinner size="sm" color="white" /> : 'Send OTP'}
                </button>
              ) : (
                <form onSubmit={handleOTPLogin} className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Enter 6-digit OTP</label>
                    <input type="text" value={form.otp} onChange={set('otp')} maxLength={6}
                      placeholder="••••••" className="input text-center text-xl tracking-[0.5em] font-mono" />
                    <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-primary-600 mt-1.5 hover:underline">
                      Change number
                    </button>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                    {loading ? <Spinner size="sm" color="white" /> : <><span>Verify & Login</span><ArrowRight size={16} /></>}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button
            onClick={() => handleGoogle()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl py-3 text-sm font-medium text-gray-700 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            No account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
