import { useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, ChevronRight, Settings, FileText, Heart } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('legalitt_user') || '{}');
  const role = localStorage.getItem('legalitt_role') || user.role || 'user';

  const handleLogout = () => {
    localStorage.removeItem('legalitt_token');
    localStorage.removeItem('legalitt_user');
    localStorage.removeItem('legalitt_role');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <div className="bg-primary-500 pt-12 pb-16 px-5">
        <h1 className="text-white font-bold text-xl mb-6">Profile</h1>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} className="w-16 h-16 rounded-2xl object-cover" alt="avatar" />
            ) : (
              <User size={32} className="text-white" />
            )}
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">{user.name || 'Guest User'}</h2>
            <p className="text-primary-100 text-sm">{user.email || ''}</p>
            <div className="flex items-center gap-1 mt-1">
              <Shield size={12} className="text-primary-200" />
              <span className="text-primary-200 text-xs capitalize font-medium">
                {role === 'lawyer' ? 'Lawyer • Offer Legal Services' : 'User • Get Legal Services'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {[
            { icon: FileText, label: 'My Requests' },
            { icon: Heart, label: 'Saved Advocates' },
            { icon: Settings, label: 'Settings' },
          ].map(({ icon: Icon, label }, i) => (
            <button key={i}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
              <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
                <Icon size={18} className="text-primary-500" />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-gray-800">{label}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </div>

        <button onClick={() => navigate('/role-select')}
          className="w-full mt-3 flex items-center gap-3 px-4 py-4 bg-white rounded-2xl shadow-card hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-primary-500" />
          </div>
          <span className="flex-1 text-left text-sm font-medium text-gray-800">Change Role</span>
          <ChevronRight size={16} className="text-gray-400" />
        </button>

        <button onClick={handleLogout}
          className="w-full mt-3 flex items-center gap-3 px-4 py-4 bg-white rounded-2xl shadow-card hover:bg-red-50 transition-colors">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
            <LogOut size={18} className="text-red-500" />
          </div>
          <span className="flex-1 text-left text-sm font-medium text-red-500">Logout</span>
        </button>
      </div>
    </div>
  );
}
