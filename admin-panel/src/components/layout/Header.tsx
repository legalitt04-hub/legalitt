import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';

const Header = () => {
  return (
    <header className="h-20 px-8 flex items-center justify-between bg-slate-950/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
          <Menu className="w-5 h-5" />
        </button>
        

      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-slate-950" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-white">Super Admin</p>
            <p className="text-xs text-slate-400">Headquarters</p>
          </div>
          <Avatar className="h-10 w-10 border border-slate-700 bg-slate-900 p-1">
            <AvatarImage src="/assets/shield-logo.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
