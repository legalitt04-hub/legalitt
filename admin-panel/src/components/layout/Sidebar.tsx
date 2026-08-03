import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  ShieldCheck, 
  CreditCard, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Layers,
  Bot,
  FileText,
  LifeBuoy,
  BarChart3,
  Calendar,
  Bell,
  MessageSquare,
  MessageCircle,
  Tag,
  Star,
  Ticket,
  UserCog,
  History,
  Grid
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import { cn } from '../../lib/utils';

// We'll organize nav items into sections
const navSections = [
  {
    title: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    ]
  },
  {
    title: 'Consultations & Ops',
    items: [
      { icon: MessageSquare, label: 'Chat Consultations ⭐', path: '/consultations' },
      { icon: MessageCircle, label: 'Chat Management', path: '/chats' },
      { icon: Briefcase, label: 'Legal Notice Requests', path: '/cases' },
      { icon: Grid, label: 'Categories', path: '/categories' },
      { icon: Bot, label: 'AI Drafts', path: '/ai-drafts' },
      { icon: FileText, label: 'Documents', path: '/documents' },
    ]
  },
  {
    title: 'Network & Team',
    items: [
      { icon: Users, label: 'Users', path: '/users' },
      { icon: UserCheck, label: 'Advocates', path: '/advocates' },
      { icon: ShieldCheck, label: 'Verification', path: '/verification' },
      { icon: UserCog, label: 'Admin Team', path: '/admins' },
    ]
  },
  {
    title: 'Financials',
    items: [
      { icon: CreditCard, label: 'Payments & Revenue', path: '/earnings' },
      { icon: Tag, label: 'Coupons & Promos', path: '/coupons' },
    ]
  },
  {
    title: 'Workspace & Desk',
    items: [
      { icon: LifeBuoy, label: 'Support Desk', path: '/support' },
      { icon: Star, label: 'Reviews & Ratings', path: '/reviews' },
      { icon: Calendar, label: 'Calendar', path: '/calendar' },
      { icon: Bell, label: 'Notifications', path: '/notifications' },
    ]
  },
  {
    title: 'System & Intelligence',
    items: [
      { icon: BarChart3, label: 'Reports & Analytics', path: '/reports' },
      { icon: History, label: 'Audit Logs', path: '/audit-logs' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ]
  }
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: SidebarProps) => {
  const { logout } = useAuth();
  const { activeRole, canAccess } = useRole();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter sections and items based on role
  const filteredNavSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => canAccess(item.path))
  })).filter(section => section.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside 
        className={cn(
          "fixed h-screen top-0 left-0 z-50 transition-all duration-300 ease-in-out lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "p-3"
        )}
      >
        <div className="h-full w-full bg-white border border-slate-200 rounded-2xl flex flex-col shadow-xl shadow-slate-200/50 overflow-hidden">
          {/* Logo + Collapse Toggle */}
          <div className="p-4 flex items-center justify-between shrink-0">
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center w-full")}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                <img src="/logo.png" alt="Legalitt" className="w-full h-full object-contain" />
              </div>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xl font-bold text-slate-900 tracking-tight"
                >
                  Legal<span className="text-amber-500">itt</span>
                </motion.span>
              )}
            </div>
            {/* Collapse/Expand button — desktop only */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-900 transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 min-h-0 px-3 py-2 overflow-y-auto space-y-4">
            {filteredNavSections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="space-y-1">
                {!isCollapsed && (
                  <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    {section.title}
                  </h4>
                )}
                
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 rounded-xl transition-all duration-200 group relative",
                      isCollapsed ? "px-3 py-3 justify-center" : "px-3 py-2.5",
                      isActive 
                        ? "text-amber-700 bg-amber-500/10 font-semibold" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div 
                            layoutId="activeTab" 
                            className="absolute left-0 top-0 w-1 h-full bg-amber-500 rounded-r-full"
                          />
                        )}
                        <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-amber-600" : "group-hover:text-amber-500 transition-colors")} />
                        {!isCollapsed && (
                          <span className="text-sm">{item.label}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* User Profile / Logout */}
          <div className="p-3 mt-auto shrink-0">
            <div className={cn(
              "rounded-xl bg-slate-50 border border-slate-200",
              isCollapsed ? "p-2" : "p-3"
            )}>
              {!isCollapsed ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-slate-950 text-xs">AD</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{activeRole}</p>
                      <p className="text-[10px] font-medium text-amber-600 uppercase tracking-wider">Role Preview</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 text-sm shadow-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Log out</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
