import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scale, MapPin, Menu, X, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary-600 transition-colors">
              <Scale size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-primary-900">Legalitt</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={`btn-ghost text-sm ${isActive('/') ? 'text-primary-600 bg-primary-50' : ''}`}>Browse</Link>
            <Link to="/map" className={`btn-ghost text-sm flex items-center gap-1.5 ${isActive('/map') ? 'text-primary-600 bg-primary-50' : ''}`}>
              <MapPin size={15} /> Map View
            </Link>
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                      <User size={14} className="text-primary-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-800">{user?.name?.split(' ')[0]}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-modal border border-gray-100 py-1.5 animate-fade-in">
                    <button
                      onClick={() => { setDropdownOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 animate-fade-in">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block btn-ghost text-sm">Browse Advocates</Link>
          <Link to="/map" onClick={() => setMenuOpen(false)} className="block btn-ghost text-sm">Map View</Link>
          {isAuthenticated ? (
            <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="w-full text-left btn-ghost text-sm text-red-600">
              Logout
            </button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 btn-outline text-sm text-center">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 btn-primary text-sm text-center">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
