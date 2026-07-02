import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Input } from '../ui/input';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const location = useLocation();
  const pageInfo = getPageInfo(location.pathname);
  const { logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 px-4 md:px-8 flex items-center justify-between bg-slate-950/50 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-800">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {pageInfo && (
          <div className="hidden md:block min-w-[200px]">
            <h1 className="text-xl font-bold text-white tracking-tight">{pageInfo.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{pageInfo.subtitle}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Search Bar */}
        <div className="hidden md:flex relative group w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-teal-500 transition-colors" />
          <Input 
            placeholder="Search users, cases, advocates..." 
            className="pl-9 bg-slate-900/50 border-slate-800 focus:border-teal-500/50 w-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-slate-950" />
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
          >
            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm">
              AD
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white leading-none">Admin</p>
              <p className="text-xs text-slate-400 mt-1 leading-none">Super Admin</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 ml-1 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-800 mb-2">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-slate-400 truncate">admin@legalitt.com</p>
              </div>
              <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors">
                <User className="w-4 h-4" /> Profile
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors">
                <Settings className="w-4 h-4" /> Settings
              </button>
              <button 
                onClick={logout}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-800 flex items-center gap-2 mt-2 border-t border-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
