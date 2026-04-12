import Auth from "./pages/Auth";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomNav from './components/BottomNav';
import Onboarding from './pages/Onboarding';
import RoleSelect from './pages/RoleSelect';
import Login from './pages/Login';
import Home from './pages/Home';
import SearchPage from './pages/Search';
import AdvocateProfile from './pages/AdvocateProfile';
import MapPage from './pages/MapPage';
import Payment from './pages/Payment';
import Chat from './pages/Chat';
import Spinner from './components/Spinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-surface max-w-lg mx-auto relative">
          <Routes>
            <Route path="/onboarding"  element={<GuestRoute><Onboarding /></GuestRoute>} />
            <Route path="/role-select" element={<RoleSelect />} />
            <Route path="/profile" element={<ProtectedRoute><Login /></ProtectedRoute>} />
                <Route path="/auth" element={<GuestRoute><Auth /></GuestRoute>} />
                <Route path="/login"       element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/"            element={<Home />} />
            <Route path="/search"      element={<SearchPage />} />
            <Route path="/map"         element={<MapPage />} />
            <Route path="/advocate/:id" element={<AdvocateProfile />} />
            <Route path="/payment"     element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/chat"        element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
