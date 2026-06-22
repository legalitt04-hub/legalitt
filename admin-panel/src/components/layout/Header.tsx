import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { Input } from '../ui/input';
import { useLocation } from 'react-router-dom';

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

  return (
    <header className="h-20 px-4 md:px-8 flex items-center justify-between bg-slate-950/50 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {pageInfo && (
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-white tracking-tight">{pageInfo.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{pageInfo.subtitle}</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-slate-950" />
        </button>
      </div>
    </header>
  );
};

export default Header;
