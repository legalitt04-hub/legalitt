import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Settings, LogOut, ChevronDown, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';

const PAGE_MAP: Record<string, { title: string; subtitle: string }> = {
  '/':              { title: 'Dashboard', subtitle: 'Platform overview, analytics & system health' },
  '/users':         { title: 'User Management', subtitle: 'View, search and manage all platform users.' },
  '/advocates':     { title: 'Advocate Management', subtitle: 'View and manage advocate profiles.' },
  '/pending-advocates': { title: 'Pending Advocates', subtitle: 'Advocates awaiting approval.' },
  '/verification':  { title: 'Verifications', subtitle: 'Review and approve pending advocate applications.' },
  '/earnings':      { title: 'Earnings & Revenue', subtitle: 'Platform revenue and financial insights.' },
  '/withdrawals':   { title: 'Withdrawals', subtitle: 'Manage payout requests from advocates.' },
  '/coupons':       { title: 'Coupons & Promos', subtitle: 'Discount codes and promotional campaigns.' },
  '/cases':         { title: 'Case Management', subtitle: 'Track and manage legal cases.' },
  '/consultations': { title: 'Consultations', subtitle: 'Chat and video consultation management.' },
  '/chats':         { title: 'Chat Management', subtitle: 'Active chat sessions and history.' },
  '/calendar':      { title: 'Calendar', subtitle: 'Schedule and appointment management.' },
  '/support':       { title: 'Support Desk', subtitle: 'Customer support tickets and issues.' },
  '/reviews':       { title: 'Reviews & Ratings', subtitle: 'User feedback and advocate ratings.' },
  '/categories':    { title: 'Categories', subtitle: 'Legal service categories.' },
  '/services':      { title: 'Services', subtitle: 'Platform service configurations.' },
  '/ai-drafts':     { title: 'AI Drafts', subtitle: 'AI-generated legal documents and drafts.' },
  '/documents':     { title: 'Documents', subtitle: 'Uploaded documents and files.' },
  '/notifications': { title: 'Notifications', subtitle: 'System and push notification management.' },
  '/reports':       { title: 'Reports & Analytics', subtitle: 'Deep analytics and export tools.' },
  '/audit-logs':    { title: 'Audit Logs', subtitle: 'System activity and change history.' },
  '/settings':      { title: 'Settings', subtitle: 'Manage platform configurations.' },
  '/ads':           { title: 'Ads Management', subtitle: 'Create and manage advertisements.' },
  '/roles':         { title: 'Role Management', subtitle: 'Admin accounts and RBAC permissions.' },
  '/admins':        { title: 'Admin Team', subtitle: 'Manage admin accounts.' },
};

const ROLE_COLORS: Record<string, string> = {
  super_admin:           'bg-red-100 text-red-700 border-red-200',
  admin:                 'bg-indigo-100 text-indigo-700 border-indigo-200',
  support_executive:     'bg-blue-100 text-blue-700 border-blue-200',
  accounts:              'bg-emerald-100 text-emerald-700 border-emerald-200',
  forensic_expert:       'bg-violet-100 text-violet-700 border-violet-200',
  property_verification: 'bg-amber-100 text-amber-700 border-amber-200',
};

interface HeaderProps {
  onMenuClick?: () => void;
  isSidebarCollapsed?: boolean;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { displayRole } = useRole();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find best matching page info
  const pageInfo = Object.entries(PAGE_MAP)
    .filter(([path]) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path)))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] || null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
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

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  const roleColorClass = ROLE_COLORS[user?.role || 'admin'] || ROLE_COLORS['admin'];

  return (
    <header className="h-16 md:h-20 px-3 md:px-8 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200 shadow-sm">
      {/* Left: Hamburger + Page Title */}
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
        {pageInfo && (
          <h1 className="md:hidden text-sm font-bold text-slate-900 truncate">{pageInfo.title}</h1>
        )}
      </div>

      {/* Right: Role Badge + Notifications + Profile */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* Role Badge */}
        <div className={`hidden md:flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider ${roleColorClass}`}>
          {displayRole}
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100 active:scale-95"
          aria-label="Notifications"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 md:p-1.5 md:pr-3 rounded-full hover:bg-slate-100 transition-colors active:scale-[0.98]"
            aria-label="Admin profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{user?.email || ''}</p>
            </div>
            <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 py-1 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <span className={`inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleColorClass}`}>
                  {displayRole}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-3 transition-colors"
                >
                  <User className="w-4 h-4" /> My Profile
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
