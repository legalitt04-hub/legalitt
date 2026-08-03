import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type Role = 
  | 'Super Admin'
  | 'Admin'
  | 'Advocate'
  | 'Support Executive'
  | 'Accounts'
  | 'Forensic Expert'
  | 'Property Verification Executive';

interface RoleContextType {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  canAccess: (path: string) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const rolePermissions: Record<Role, string[]> = {
  'Super Admin': ['*'],
  'Admin': ['/', '/cases', '/services', '/ai-drafts', '/documents', '/users', '/advocates', '/verification', '/support', '/calendar', '/notifications', '/reports'],
  'Advocate': ['/', '/cases', '/documents', '/calendar', '/support', '/earnings'],
  'Support Executive': ['/', '/support', '/users', '/cases'],
  'Accounts': ['/', '/earnings', '/reports'],
  'Forensic Expert': ['/', '/documents', '/cases'],
  'Property Verification Executive': ['/', '/documents', '/services']
};

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [activeRole, setActiveRole] = useState<Role>('Super Admin');

  const canAccess = (path: string) => {
    const allowed = rolePermissions[activeRole];
    if (allowed.includes('*')) return true;
    return allowed.includes(path);
  };

  return (
    <RoleContext.Provider value={{ activeRole, setActiveRole, canAccess }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within a RoleProvider');
  return context;
};
