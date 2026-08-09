import React, { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Re-export types for backward compatibility
export type Role =
  | 'super_admin' | 'admin' | 'support_executive'
  | 'accounts' | 'forensic_expert' | 'property_verification';

interface RoleContextType {
  activeRole: string;
  displayRole: string;
  canAccess: (path: string) => boolean;
  hasPermission: (permission: string) => boolean;
  permissions: string[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { user, canAccess } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'admin') return true;
    return user.permissions.includes(permission);
  };

  return (
    <RoleContext.Provider value={{
      activeRole: user?.role || 'admin',
      displayRole: user?.displayRole || 'Admin',
      canAccess,
      hasPermission,
      permissions: user?.permissions || [],
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within a RoleProvider');
  return context;
};
