import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scale, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import Spinner from '../components/Spinner';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const pwdStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const strength = pwdStrength(form.password);
  const strengthColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (strength < 2) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (_) {} finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-800 to-primary-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 70% 80%, rgba(77,122,255,0.3) 0%, transparent 50%)'
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Scale size={20} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-white">Legalitt</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-6">
            Your Legal Journey<br />Starts Here
          </h2>
          <div className="space-y-4">
            {[
              'Access 21,000+ verified advocates',
              'Find help within your locality',
              'Compare ratings and specializations',
              'Get legal consultation at fair prices',
            ].map(text => (
              <div key={text} className="flex items-center gap-3">
                <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                <span className="text-primary-100 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-primary-300 text-xs">
          Legalitt — Connecting people with justice across Madhya Pradesh
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <Scale size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-primary-900">Legalitt</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-8">Free forever — find the legal help you deserve</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={set('name')} required
                placeholder="Rahul Sharma" className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email address</label>
              <input type="email" value={form.email} onChange={set('email')} required
                placeholder="rahul@example.com" className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  required minLength={6} placeholder="••••••••" className="input pr-11" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength >= 4 ? 'text-green-600' : strength >= 3 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading || strength < 2}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? <Spinner size="sm" color="white" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
