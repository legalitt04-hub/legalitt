import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import MainLayout from './components/layout/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Users from './pages/Users';
import Advocates from './pages/Advocates';
import Verification from './pages/Verification';
import Earnings from './pages/Earnings';
import Settings from './pages/Settings';

// Phase 3 New Pages
import Cases from './pages/Cases';
import Services from './pages/Services';
import AIDrafts from './pages/AIDrafts';
import Documents from './pages/Documents';
import Support from './pages/Support';
import Reports from './pages/Reports';
import CalendarView from './pages/CalendarView';
import Notifications from './pages/Notifications';

function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected Routes Wrapper */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/services" element={<Services />} />
            <Route path="/ai-drafts" element={<AIDrafts />} />
            <Route path="/documents" element={<Documents />} />
            
            <Route path="/users" element={<Users />} />
            <Route path="/advocates" element={<Advocates />} />
            <Route path="/verification" element={<Verification />} />
            
            <Route path="/support" element={<Support />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/notifications" element={<Notifications />} />
            
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
