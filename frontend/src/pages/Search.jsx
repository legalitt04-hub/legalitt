import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, MapPin, Star,
  CheckCircle2, IndianRupee, Map
} from 'lucide-react';
import { useAdvocates } from '../hooks/useAdvocates';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

function AdvocateRow({ advocate }) {
  const navigate = useNavigate();
  const isOnline = advocate.available;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-card">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={advocate.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(advocate.name)}&background=0d7a5f&color=fff&size=80`}
            alt={advocate.name}
            className="w-16 h-16 rounded-2xl object-cover"
            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(advocate.name)}&background=0d7a5f&color=fff&size=80`; }}
          />
          <span className={`absolute -bottom-1 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold border border-white ${
            isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-gray-900 text-sm truncate">{advocate.name}</h3>
            {advocate.verified && <CheckCircle2 size={13} className="text-primary-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Senior Advocate</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {advocate.specialization} • Civil • Property
          </p>

          <div className="flex items-center gap-1 mt-1.5">
            <Star size={11} className="text-gold-400 fill-gold-400" />
            <span className="text-xs font-semibold text-gray-700">{advocate.rating?.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({advocate.reviews?.length || 0} review)</span>
          </div>

          <p className="text-xs text-primary-600 font-semibold mt-1">
            ₹{advocate.fees?.toLocaleString('en-IN')}/ Consultation
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => navigate(`/advocate/${advocate._id}`)}
          className="flex-1 py-2.5 rounded-xl border-2 border-primary-500 text-primary-600 text-xs font-bold hover:bg-primary-50 transition-colors"
        >
          View Profile
        </button>
        <button
          onClick={() => navigate(`/advocate/${advocate._id}`)}
          className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-xs font-bold hover:bg-primary-600 transition-colors"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { advocates, loading, fetchAdvocates, fetchNearby } = useAdvocates();
  const { location, loading: locLoading } = useGeolocation();
  const [query, setQuery] = useState('');

  const firstName = user?.name?.split(' ')[0] || 'XYZ';

  useEffect(() => {
    fetchAdvocates({ page: 1, limit: 15 });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAdvocates({ name: query, page: 1, limit: 15 });
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm overflow-hidden">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="font-semibold text-gray-800 text-sm">Hello, {firstName}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <button><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>
            <button><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>
            <button><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search Lawyers"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50"
            />
          </div>
          <button
            type="button"
            className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <SlidersHorizontal size={16} className="text-white" />
          </button>
        </form>
      </div>

      {/* Map preview strip */}
      <div
        onClick={() => navigate('/map')}
        className="mx-4 mt-4 relative h-32 bg-gray-200 rounded-2xl overflow-hidden cursor-pointer shadow-card"
      >
        {/* Simple map placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={28} className="text-primary-500 mx-auto" />
            <p className="text-xs text-gray-500 mt-1">View lawyers on map</p>
          </div>
          {/* Fake pins */}
          <div className="absolute top-4 left-12 w-3 h-3 bg-red-500 rounded-full shadow" />
          <div className="absolute top-8 left-24 w-3 h-3 bg-red-500 rounded-full shadow" />
          <div className="absolute top-6 right-16 w-3 h-3 bg-red-500 rounded-full shadow" />
          <div className="absolute bottom-8 left-20 w-3 h-3 bg-red-500 rounded-full shadow" />
          <div className="absolute bottom-6 right-20 w-3 h-3 bg-red-500 rounded-full shadow" />
        </div>
        {/* View Map button */}
        <div className="absolute top-3 right-3">
          <div className="bg-white rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-md">
            <Map size={13} className="text-primary-600" />
            <span className="text-xs font-bold text-primary-600">View Map</span>
          </div>
        </div>
      </div>

      {/* Advocate list */}
      <div className="px-4 mt-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-10"><Spinner size="lg" /></div>
        )}
        {!loading && advocates.map(adv => (
          <AdvocateRow key={adv._id} advocate={adv} />
        ))}
        {!loading && advocates.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">No advocates found.</div>
        )}
      </div>
    </div>
  );
}
