import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, MapPin, Bot, FileText, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    icon: MapPin,
    title: 'Find Verified Advocates Nearby',
    desc: 'Connect with legal experts around you. Chat, consult or book your case consultation easily.',
    bg: 'from-primary-500 to-primary-600',
  },
  {
    icon: Bot,
    title: 'AI Legal Assistant & Document Storage',
    desc: 'Ask legal questions anytime, and manage your documents securely with AI to support.',
    bg: 'from-primary-600 to-primary-700',
  },
  {
    icon: FileText,
    title: 'Easy Case & Document Handling',
    desc: 'Secure document handling via direct chat, with update tracking and legal advisory.',
    bg: 'from-primary-500 to-primary-600',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const handleSkip = () => {
    localStorage.setItem('onboarding_done', 'true');
    navigate('/role-select');
  };
  const [phase, setPhase] = useState('splash'); // splash | slides
  const [slide, setSlide] = useState(0);

  // Auto-advance splash after 2s
  useEffect(() => {
    if (phase === 'splash') {
      const t = setTimeout(() => setPhase('slides'), 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleNext = () => {
    if (slide < SLIDES.length - 1) {
      setSlide(s => s + 1);
    } else {
      navigate('/role-select');
    }
  };

  const skip = () => navigate('/role-select');

  // ── Splash ──────────────────────────────────────────
  if (phase === 'splash') {
    return (
      <div className="min-h-screen bg-primary-500 flex flex-col items-center justify-center">
        <div className="animate-fade-in-up flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center">
            <Scale size={52} className="text-white" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h1 className="text-white text-3xl font-bold tracking-tight">Legalitt</h1>
            <p className="text-primary-200 text-sm mt-1">Your Legal Partner</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Onboarding slides ────────────────────────────────
  const { icon: Icon, title, desc } = SLIDES[slide];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end px-5 pt-12 pb-4">
        <button onClick={skip} className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors">
          Skip
        </button>
      </div>

      {/* Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        <div className={`w-52 h-52 rounded-[40px] bg-gradient-to-br ${SLIDES[slide].bg} flex items-center justify-center shadow-xl shadow-primary-200 mb-10 animate-fade-in`}>
          <Icon size={80} className="text-white" strokeWidth={1.2} />
        </div>

        {/* Dots */}
        <div className="flex gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === slide ? 'w-6 h-2.5 bg-primary-500' : 'w-2.5 h-2.5 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="text-center animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-3">{title}</h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-10 safe-area-pb">
        <button
          onClick={handleNext}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-2xl text-base transition-all active:scale-95 shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
        >
          {slide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
