import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell, Search, MapPin, Navigation, MessageSquare,
  ChevronRight, FileText, Users, Settings, Star,
  Briefcase, IndianRupee, CheckCircle2, SlidersHorizontal
} from 'lucide-react';
import { useAdvocates } from '../hooks/useAdvocates';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const SPECIALIZATIONS = [
  'All', 'Criminal Law', 'Family Law', 'Property Law',
  'Corporate Law', 'Consumer Law', 'Cyber Law', 'Labour Law',
];

const QUICK_ACTIONS = [
  { icon: MessageSquare, label: 'My Chats',    color: 'bg-teal-50  text-primary-600', to: '/chats' },
  { icon: FileText,      label: 'My Requests', color: 'bg-blue-50  text-blue-600',    to: '/requests' },
  { icon: Users,         label: 'Saved\nAdvocates', color: 'bg-purple-50 text-purple-600', to: '/saved' },
  { icon: Settings,      label: 'Settings',    color: 'bg-orange-50 text-orange-600', to: '/settings' },
];

function NearbyCard({ advocate, showDistance }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/advocate/${advocate._id}`)}
      className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-card hover:shadow-card-hover transition-all cursor-pointer active:scale-[0.98]"
    >
      <img
        src={advocate.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(advocate.name)}&background=0d7a5f&color=fff&size=64`}
        alt={advocate.name}
        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-primary-50"
        onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(advocate.name)}&background=0d7a5f&color=fff&size=64`; }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{advocate.name}</h3>
          {advocate.verified && <CheckCircle2 size={12} className="text-primary-500 flex-shrink-0" />}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{advocate.specialization}</p>
        <div className="flex items-center gap-2.5 mt-1.5">
          <span className="flex items-center gap-0.5 text-xs font-semibold text-gray-700">
            <Star size={11} className="text-gold-400 fill-gold-400" />
            {advocate.rating?.toFixed(1)}
          </span>
          <span className="flex items-center gap-0.5 text-xs text-gray-400">
            <MapPin size={10} />
            {advocate.location?.city || 'MP'}
            {showDistance && advocate.distance != null && (
              <span className="text-primary-600 font-medium ml-0.5">· {advocate.distance} km</span>
            )}
          </span>
          <span className="flex items-center gap-0.5 text-xs text-gray-400">
            <IndianRupee size={10} />
            {advocate.fees?.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={e => { e.stopPropagation(); navigate(`/advocate/${advocate._id}`); }}
          className="bg-primary-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Book
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { advocates, loading, error, pagination, fetchAdvocates, fetchNearby } = useAdvocates();
  const { location, loading: locLoading } = useGeolocation();
  const [activeSpec, setActiveSpec]     = useState('All');
  const [nearbyMode, setNearbyMode]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [showSearch, setShowSearch]     = useState(false);
  const searchRef = useRef(null);

  const firstName = user?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    const filters = activeSpec !== 'All' ? { specialization: activeSpec } : {};
    if (searchQuery) filters.name = searchQuery;
    fetchAdvocates({ ...filters, page: 1, limit: 10 });
    setNearbyMode(false);
  }, [activeSpec]);

  const handleNearby = () => {
    if (!location) return;
    setNearbyMode(true);
    const filters = activeSpec !== 'All' ? { specialization: activeSpec } : {};
    fetchNearby({ lat: location.lat, lng: location.lng, radius: 20, ...filters });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAdvocates({ name: searchQuery, page: 1, limit: 10 });
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* ── Header ── */}
      <div className="bg-primary-500 pt-12 pb-20 px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-200 text-xs font-medium">Good morning 👋</p>
            <h1 className="text-white text-xl font-bold mt-0.5">Hello, {firstName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border border-white" />
            </button>
            <div onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm overflow-hidden cursor-pointer hover:bg-white/30 transition-all">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative mt-2">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search advocates, specializations..."
            className="w-full bg-white rounded-xl pl-9 pr-12 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none shadow-sm"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
          >
            <SlidersHorizontal size={16} />
          </button>
        </form>
      </div>

      {/* ── Main Card (overlapping the header) ── */}
      <div className="px-4 -mt-12 space-y-4">

        {/* AI Legal Assistant Banner */}
        <div className="bg-primary-600 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <MessageSquare size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Chat With AI Legal Assistant</p>
            <p className="text-primary-200 text-xs mt-0.5">Get instant answers to legal questions</p>
          </div>
          <ChevronRight size={18} className="text-white/60" />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <div className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map(({ icon: Icon, label, color, to }) => (
              <Link to={to} key={label} className="flex flex-col items-center gap-2 group">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] text-gray-600 font-medium text-center leading-tight whitespace-pre-line">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Nearby Lawyers Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-base">Nearby Lawyers</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleNearby}
                disabled={locLoading}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors"
              >
                {locLoading ? <Spinner size="sm" /> : <Navigation size={12} />}
                Near Me
              </button>
              <Link to="/map" className="text-xs font-semibold text-primary-600">
                View Map →
              </Link>
            </div>
          </div>

          {/* Spec filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {SPECIALIZATIONS.map(s => (
              <button
                key={s}
                onClick={() => setActiveSpec(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeSpec === s
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Cards */}
          {loading && (
            <div className="flex justify-center py-10">
              <Spinner size="lg" />
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-8 text-red-500 text-sm bg-white rounded-2xl">
              {error} — <button onClick={() => fetchAdvocates({ page: 1, limit: 10 })} className="underline">Retry</button>
            </div>
          )}

          {!loading && !error && advocates.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl text-gray-400 text-sm">
              No advocates found. Try a different filter.
            </div>
          )}

          {!loading && advocates.length > 0 && (
            <div className="space-y-3">
              {advocates.map(adv => (
                <NearbyCard key={adv._id} advocate={adv} showDistance={nearbyMode || adv.distance != null} />
              ))}
            </div>
          )}

          {/* View all */}
          {!loading && advocates.length > 0 && (
            <button
              onClick={() => fetchAdvocates({ page: 1, limit: 50 })}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-all"
            >
              View all advocates
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
