import { useNavigate } from 'react-router-dom';
import { Scale } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}>
      {/* Top section - Logo */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center shadow-xl backdrop-blur">
          <Scale size={52} className="text-white" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">Legalitt</h1>
          <p className="text-teal-100 mt-2 text-base">Your trusted legal partner</p>
        </div>
        <div className="flex flex-col items-center gap-2 mt-6 text-center">
          <p className="text-white/80 text-sm leading-relaxed max-w-xs">
            Find verified advocates, get AI legal assistance, and manage your documents securely.
          </p>
        </div>
      </div>

      {/* Bottom section - Buttons */}
      <div className="px-6 pb-12 flex flex-col gap-3">
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-white text-teal-600 py-4 rounded-2xl font-bold text-base shadow-xl active:scale-95 transition-all"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/register')}
          className="w-full bg-white/20 border-2 border-white/40 text-white py-4 rounded-2xl font-bold text-base backdrop-blur active:scale-95 transition-all"
        >
          Create Account
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full text-white/60 py-3 font-semibold text-sm active:scale-95 transition-all"
        >
          Skip for now →
        </button>
      </div>
    </div>
  );
}
