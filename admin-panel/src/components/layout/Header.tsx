import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Input } from '../ui/input';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole, type Role } from '../../contexts/RoleContext';

const getPageInfo = (pathname: string) => {
  if (pathname === '/') return { title: 'Dashboard', subtitle: 'Platform overview, analytics & system health' };
  if (pathname.startsWith('/users')) return { title: 'User Management', subtitle: 'View, search and manage all platform users.' };
  if (pathname.startsWith('/advocates')) return { title: 'Advocate Management', subtitle: 'View and manage advocate profiles.' };
  if (pathname.startsWith('/verification')) return { title: 'Verifications', subtitle: 'Review and approve pending advocate applications.' };
  if (pathname.startsWith('/earnings')) return { title: 'Earnings & Analytics', subtitle: 'Platform revenue and financial insights.' };
  if (pathname.startsWith('/settings')) return { title: 'Settings', subtitle: 'Manage platform configurations.' };
  return null;
};

interface HeaderProps {
  onMenuClick?: () => void;
  isSidebarCollapsed?: boolean;
}

const Header = ({ onMenuClick, isSidebarCollapsed }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageInfo = getPageInfo(location.pathname);
  const { logout } = useAuth();
  const { activeRole, setActiveRole } = useRole();
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 md:h-20 px-3 md:px-8 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors active:scale-95"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {pageInfo && (
          <div className="hidden md:block min-w-0">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight truncate">{pageInfo.title}</h1>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{pageInfo.subtitle}</p>
          </div>
        )}

        {/* Mobile page title */}
        {pageInfo && (
          <h1 className="md:hidden text-sm font-bold text-slate-900 truncate">{pageInfo.title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <button 
          className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100 active:scale-95"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Role Switcher (For Testing RBAC) */}
        <div className="relative hidden md:block" ref={roleDropdownRef}>
          <button 
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-xs font-semibold uppercase tracking-wider"
            title="Switch Role (Testing)"
          >
            {activeRole}
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${roleMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 pb-2 mb-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preview as Role</p>
              </div>
              {[
                'Super Admin', 'Admin', 'Advocate', 'Support Executive', 
                'Accounts', 'Forensic Expert', 'Property Verification Executive'
              ].map(role => (
                <button
                  key={role}
                  onClick={() => { setActiveRole(role as Role); setRoleMenuOpen(false); navigate('/'); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${activeRole === role ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 md:p-1.5 md:pr-3 rounded-full hover:bg-slate-100 transition-colors active:scale-[0.98]"
            aria-label="Admin profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              AD
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-900 leading-none">Admin</p>
            </div>
            <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">Admin User</p>
                <p className="text-xs text-slate-500 truncate">admin@legalitt.com</p>
              </div>
              <div className="py-1">
                <button 
                  onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-3 transition-colors"
                >
                  <User className="w-4 h-4" /> Profile
                </button>
                <button 
                  onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-3 transition-colors"
                >
                  <Settings className="w-4 h-4" /> Settings
                </button>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
};

export default Header;
