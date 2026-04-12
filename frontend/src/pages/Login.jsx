import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Eye, EyeOff, ArrowRight, ChevronLeft } from 'lucide-react';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('main'); // 'main' | 'email' | 'otp' | 'otp-verify'
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
      setStep('otp-verify');
      toast.success('OTP sent!');
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
        await googleLogin(tokenRes.access_token);
        navigate('/');
      } catch (_) { toast.error('Google login failed'); } finally { setLoading(false); }
    },
    onError: () => toast.error('Google login failed')
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f7fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .lg-card { background: white; border-radius: 28px; width: 100%; max-width: 420px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.08); }
        .lg-header { background: linear-gradient(135deg, #0d7a5f 0%, #0a6b52 100%); padding: 40px 32px 32px; }
        .lg-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        .lg-logo-icon { width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .lg-logo-text { color: white; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .lg-title { color: white; font-size: 26px; font-weight: 700; margin: 0 0 6px; letter-spacing: -0.5px; }
        .lg-subtitle { color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; }
        .lg-body { padding: 28px 32px 32px; }
        .lg-input { width: 100%; padding: 14px 16px; border: 1.5px solid #e8eaed; border-radius: 14px; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; box-sizing: border-box; color: #1a1a2e; background: #fafafa; }
        .lg-input:focus { border-color: #0d7a5f; background: white; }
        .lg-input::placeholder { color: #aab; }
        .lg-label { font-size: 13px; font-weight: 600; color: #444; margin-bottom: 8px; display: block; }
        .lg-btn { width: 100%; padding: 15px; background: #0d7a5f; color: white; border: none; border-radius: 14px; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s, transform 0.1s; }
        .lg-btn:hover { background: #0a6b52; }
        .lg-btn:active { transform: scale(0.98); }
        .lg-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .lg-btn-outline { background: white; color: #333; border: 1.5px solid #e8eaed; }
        .lg-btn-outline:hover { background: #f5f7fa; border-color: #ccc; }
        .lg-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .lg-divider-line { flex: 1; height: 1px; background: #e8eaed; }
        .lg-divider-text { font-size: 12px; color: #999; font-weight: 500; }
        .lg-option { display: flex; align-items: center; gap: 14px; padding: 16px; border: 1.5px solid #e8eaed; border-radius: 16px; cursor: pointer; transition: all 0.2s; margin-bottom: 12px; background: white; width: 100%; text-align: left; }
        .lg-option:hover { border-color: #0d7a5f; background: #f0faf7; }
        .lg-option-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .lg-option-text { font-size: 15px; font-weight: 600; color: #1a1a2e; }
        .lg-option-sub { font-size: 12px; color: #888; margin-top: 2px; }
        .lg-back { display: flex; align-items: center; gap: 6px; background: none; border: none; color: rgba(255,255,255,0.8); font-size: 14px; font-family: 'DM Sans', sans-serif; cursor: pointer; padding: 0; margin-bottom: 20px; }
        .lg-back:hover { color: white; }
        .lg-phone-row { display: flex; gap: 8px; }
        .lg-prefix { padding: 14px 14px; background: #f0faf7; border: 1.5px solid #e8eaed; border-radius: 14px; font-size: 15px; font-weight: 600; color: #0d7a5f; white-space: nowrap; }
        .lg-otp-boxes { display: flex; gap: 10px; justify-content: center; margin: 8px 0; }
        .lg-otp-box { width: 52px; height: 56px; border: 1.5px solid #e8eaed; border-radius: 14px; text-align: center; font-size: 22px; font-weight: 700; font-family: 'DM Sans', sans-serif; outline: none; background: #fafafa; color: #1a1a2e; transition: border-color 0.2s; }
        .lg-otp-box:focus { border-color: #0d7a5f; background: white; }
        .lg-terms { font-size: 12px; color: #999; text-align: center; margin-top: 20px; line-height: 1.6; }
        .lg-terms a { color: #0d7a5f; text-decoration: none; }
        .slide-in { animation: slideIn 0.25s ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      <div className="lg-card">
        {/* Header */}
        <div className="lg-header">
          {step !== 'main' && (
            <button className="lg-back" onClick={() => { setStep('main'); setOtpSent(false); }}>
              <ChevronLeft size={18} /> Back
            </button>
          )}
          <div className="lg-logo">
            <div className="lg-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="lg-logo-text">Legalitt</span>
          </div>
          <h1 className="lg-title">
            {step === 'main' && 'Login / Register'}
            {step === 'email' && 'Sign in with Email'}
            {step === 'otp' && 'Enter Mobile Number'}
            {step === 'otp-verify' && 'Verify OTP'}
          </h1>
          <p className="lg-subtitle">
            {step === 'main' && 'Login/Register In Your Account'}
            {step === 'email' && 'Enter your credentials to continue'}
            {step === 'otp' && 'We will send a 6-digit code to your number'}
            {step === 'otp-verify' && `Code sent to +91 ${form.phone}`}
          </p>
        </div>

        {/* Body */}
        <div className="lg-body">

          {/* MAIN — choose method */}
          {step === 'main' && (
            <div className="slide-in">
              <div style={{ marginBottom: 8 }}>
                <label className="lg-label">E-mail / Mobile No</label>
                <input
                  className="lg-input"
                  placeholder="Enter email or mobile number"
                  value={form.email}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm(f => ({ ...f, email: v, phone: v }));
                  }}
                />
              </div>

              <button
                className="lg-btn"
                style={{ marginTop: 16 }}
                onClick={() => {
                  const v = form.email;
                  if (/^[6-9]\d{9}$/.test(v)) setStep('otp');
                  else if (v.includes('@')) setStep('email');
                  else { setStep('otp'); }
                }}
              >
                Next <ArrowRight size={16} />
              </button>

              <div className="lg-divider">
                <div className="lg-divider-line" />
                <span className="lg-divider-text">OR</span>
                <div className="lg-divider-line" />
              </div>

              {/* Google */}
              <button className="lg-btn lg-btn-outline" onClick={() => handleGoogle()} disabled={loading} style={{ marginBottom: 10 }}>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </button>

              <div className="lg-terms">
                Follow <a href="#">Terms & Condition</a> | <a href="#">Privacy Policy</a>
              </div>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#666', marginTop: 16 }}>
                No account?{' '}
                <Link to="/register" style={{ color: '#0d7a5f', fontWeight: 600, textDecoration: 'none' }}>
                  Create one free
                </Link>
              </p>
            </div>
          )}

          {/* EMAIL LOGIN */}
          {step === 'email' && (
            <form onSubmit={handleEmailLogin} className="slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="lg-label">Email address</label>
                <input type="email" value={form.email} onChange={set('email')} required
                  placeholder="you@example.com" className="lg-input" />
              </div>
              <div>
                <label className="lg-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    required placeholder="••••••••" className="lg-input" style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#999'
                  }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="lg-btn" style={{ marginTop: 4 }}>
                {loading ? <Spinner size="sm" color="white" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
              </button>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>
                No account?{' '}
                <Link to="/register" style={{ color: '#0d7a5f', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
              </p>
            </form>
          )}

          {/* OTP — enter phone */}
          {step === 'otp' && (
            <div className="slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="lg-label">Mobile Number</label>
                <div className="lg-phone-row">
                  <div className="lg-prefix">🇮🇳 +91</div>
                  <input type="tel" value={form.phone} onChange={set('phone')} maxLength={10}
                    placeholder="9876543210" className="lg-input" style={{ flex: 1 }} />
                </div>
              </div>
              <button onClick={handleSendOTP} disabled={loading} className="lg-btn">
                {loading ? <Spinner size="sm" color="white" /> : <><span>Send OTP</span><ArrowRight size={16} /></>}
              </button>
            </div>
          )}

          {/* OTP — verify */}
          {step === 'otp-verify' && (
            <form onSubmit={handleOTPLogin} className="slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="lg-label" style={{ textAlign: 'center' }}>Enter verification code</label>
                <div className="lg-otp-boxes">
                  {[0,1,2,3,4,5].map(i => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      className="lg-otp-box"
                      maxLength={1}
                      value={form.otp[i] || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g,'');
                        const arr = (form.otp + '      ').split('').slice(0,6);
                        arr[i] = val;
                        setForm(f => ({ ...f, otp: arr.join('').trim() }));
                        if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Backspace' && !form.otp[i] && i > 0) document.getElementById(`otp-${i-1}`)?.focus();
                      }}
                    />
                  ))}
                </div>
                <button type="button" onClick={() => { setStep('otp'); setOtpSent(false); }} style={{
                  background: 'none', border: 'none', color: '#0d7a5f', fontSize: 13,
                  cursor: 'pointer', display: 'block', margin: '8px auto 0', fontFamily: 'DM Sans, sans-serif'
                }}>
                  Change number
                </button>
              </div>
              <button type="submit" disabled={loading} className="lg-btn">
                {loading ? <Spinner size="sm" color="white" /> : <><span>Verify & Login</span><ArrowRight size={16} /></>}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
