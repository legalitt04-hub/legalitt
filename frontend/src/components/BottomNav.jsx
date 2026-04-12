import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, MapPin, User } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',     icon: Home,   label: 'Home'    },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/map',  icon: MapPin, label: 'Nearby'  },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('legalitt_token');

  // Hide on auth pages
  const hide = ['/login', '/register'].includes(location.pathname);
  if (hide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2 safe-area-pb">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all group"
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                isActive
                  ? 'bg-primary-500 shadow-md shadow-primary-200'
                  : 'group-hover:bg-gray-100'
              }`}>
                <Icon
                  size={20}
                  className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${
                isActive ? 'text-primary-500' : 'text-gray-400'
              }`}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
