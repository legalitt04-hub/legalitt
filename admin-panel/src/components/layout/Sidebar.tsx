import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  ShieldCheck, 
  CreditCard, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/' },
  { icon: Users, label: 'Clients', path: '/users' },
  { icon: UserCheck, label: 'Advocates', path: '/advocates' },
  { icon: ShieldCheck, label: 'Verification', path: '/verification' },
  { icon: CreditCard, label: 'Earnings', path: '/earnings' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-64 fixed h-screen top-0 left-0 p-4 z-50"
    >
      <div className="h-full w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[24px] flex flex-col shadow-2xl overflow-hidden relative overflow-y-auto hidden-scrollbar">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img src="/assets/shield-logo.png" alt="Legalitt Shield" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            Legal<span className="text-teal-400">itt</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "text-white bg-slate-800/50" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/30"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute left-0 top-0 w-1 h-full bg-teal-500 rounded-r-full"
                    />
                  )}
                  <item.icon className={cn("w-5 h-5", isActive ? "text-teal-400" : "group-hover:text-teal-400 transition-colors")} />
                  <span className="font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 mt-auto">
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 flex items-center justify-center">
                <span className="font-bold text-white text-sm">AD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">Admin User</p>
                <p className="text-xs text-slate-400 truncate">admin@legalitt.com</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
