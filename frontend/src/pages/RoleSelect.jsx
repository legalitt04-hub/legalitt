import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase } from 'lucide-react';

const ROLES = [
  { id: 'user', icon: User, label: 'User', desc: 'Get Legal Services' },
  { id: 'lawyer', icon: Briefcase, label: 'Lawyer', desc: 'Offer Legal Services' },
];

export default function RoleSelect({ onSelect }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleNext = () => {
    if (!selected) return;
    localStorage.setItem('legalitt_role', selected);
    if (onSelect) onSelect(selected);
    navigate('/welcome');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-10 pb-28">
      {/* Illustration */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-28 h-28 bg-primary-50 rounded-3xl flex items-center justify-center mb-6">
          <User size={56} className="text-primary-400" strokeWidth={1.2} />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Choose Your Role</h1>
          <p className="text-gray-500 text-sm mt-2">You Have To Choose Your Role — What Is Your Profession</p>
        </div>

        {/* Role options */}
        <div className="w-full space-y-3 max-w-xs">
          {ROLES.map(({ id, icon: Icon, label, desc }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all ${
                selected === id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                selected === id ? 'bg-primary-100' : 'bg-gray-100'
              }`}>
                <Icon size={20} className={selected === id ? 'text-primary-600' : 'text-gray-500'} />
              </div>
              <div className="flex-1 text-left">
                <p className={`font-semibold text-sm ${selected === id ? 'text-primary-700' : 'text-gray-800'}`}>{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selected === id ? 'border-primary-500' : 'border-gray-300'
              }`}>
                {selected === id && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Next button */}
      <div className="fixed bottom-8 left-6 right-6">
        <button
          onClick={handleNext}
          disabled={!selected}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white font-bold py-4 rounded-2xl text-base transition-all active:scale-95 shadow-lg shadow-primary-200 flex items-center justify-center gap-2">
          Next
        </button>
      </div>
    </div>
  );
}
