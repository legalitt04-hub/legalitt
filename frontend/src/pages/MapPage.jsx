import { useEffect, useState, useRef } from 'react';
import {
  MapPin, SlidersHorizontal, X, ChevronLeft, ChevronRight,
  Maximize2, Minimize2, List, Star, CheckCircle2, IndianRupee,
  Search, Navigation
} from 'lucide-react';
import MapView from '../components/MapView';
import Spinner from '../components/Spinner';
import { useAdvocates } from '../hooks/useAdvocates';
import { useGeolocation } from '../hooks/useGeolocation';
import { advocateAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const SPEC_COLORS = {
  'Criminal Law':  'bg-red-50    text-red-700',
  'Civil Law':     'bg-blue-50   text-blue-700',
  'Family Law':    'bg-pink-50   text-pink-700',
  'Corporate Law': 'bg-purple-50 text-purple-700',
  'Property Law':  'bg-amber-50  text-amber-700',
  'Labour Law':    'bg-green-50  text-green-700',
  'Tax Law':       'bg-teal-50   text-teal-700',
  'Consumer Law':  'bg-orange-50 text-orange-700',
  'Cyber Law':     'bg-cyan-50   text-cyan-700',
};

const SPECIALIZATIONS = [
  'Criminal Law','Civil Law','Family Law','Corporate Law',
  'Property Law','Labour Law','Tax Law','Consumer Law','Cyber Law',
];

const SORT_OPTIONS = [
  { label: 'Highest Rated',    value: '-rating'      },
  { label: 'Most Reviewed',    value: '-reviewCount'  },
  { label: 'Nearest First',    value: 'distance'      },
  { label: 'Most Experienced', value: '-enrollYear'   },
  { label: 'Lowest Fees',      value: 'fees'          },
];

/* ── Compact advocate card ── */
function SidebarCard({ advocate, isSelected, onClick }) {
  const navigate  = useNavigate();
  const specColor = SPEC_COLORS[advocate.specialization] || 'bg-gray-50 text-gray-700';
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-3 cursor-pointer transition-all border-2 ${
        isSelected
          ? 'border-primary-500 bg-primary-50 shadow-md'
          : 'border-transparent bg-white hover:border-gray-200 shadow-sm'
      }`}
    >
      <div className="flex gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={advocate.image}
            alt={advocate.name}
            className="w-12 h-12 rounded-xl object-cover bg-gray-100"
            onError={e => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(advocate.name)}&background=0d7a5f&color=fff&size=48`;
            }}
          />
          {advocate.available && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-gray-900 text-xs truncate">{advocate.name}</p>
            {advocate.verified && <CheckCircle2 size={11} className="text-primary-500 flex-shrink-0" />}
          </div>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${specColor}`}>
            {advocate.specialization}
          </span>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-gray-700">
              <Star size={9} className="text-gold-400 fill-gold-400" />
              {advocate.rating?.toFixed(1)}
            </span>
            {advocate.distance != null && (
              <span className="text-[10px] text-primary-600 font-semibold">· {advocate.distance} km</span>
            )}
            <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
              <IndianRupee size={9} />{advocate.fees?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); navigate(`/advocate/${advocate._id}`); }}
        className="mt-2.5 w-full py-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-[11px] font-bold transition-colors"
      >
        View Profile
      </button>
    </div>
  );
}

/* ── Filter panel ── */
function FilterPanel({ onFilter, showDistanceSort, onClose }) {
  const [search,         setSearch]         = useState('');
  const [specialization, setSpecialization] = useState('');
  const [sort,           setSort]           = useState('-rating');
  const [minRating,      setMinRating]      = useState('');
  const [city,           setCity]           = useState('');
  const [cities,         setCities]         = useState([]);

  useEffect(() => {
    advocateAPI.getCities().then(r => setCities(r.data.data)).catch(() => {});
  }, []);

  const apply = () => { onFilter({ search, specialization, sort, minRating, city }); onClose?.(); };
  const reset = () => { setSearch(''); setSpecialization(''); setSort('-rating'); setMinRating(''); setCity(''); onFilter({}); };
  const hasFilters = search || specialization || minRating || city;

  return (
    <div className="space-y-4 p-4">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter Advocates</p>

      {/* Name search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name..."
          onKeyDown={e => e.key === 'Enter' && apply()}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50"
        />
      </div>

      {/* Specialization pills */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Specialization</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSpecialization('')}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
              !specialization ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 text-gray-500 hover:border-primary-300'
            }`}
          >All</button>
          {SPECIALIZATIONS.map(s => (
            <button key={s} onClick={() => setSpecialization(s === specialization ? '' : s)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                specialization === s ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 text-gray-500 hover:border-primary-300'
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Sort By</p>
        <div className="space-y-1">
          {SORT_OPTIONS.filter(o => showDistanceSort || o.value !== 'distance').map(o => (
            <button key={o.value} onClick={() => setSort(o.value)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                sort === o.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
              }`}
            >
              {o.label}
              {sort === o.value && (
                <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* City */}
      {cities.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">City</p>
          <select value={city} onChange={e => setCity(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary-400"
          >
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* Min Rating */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Minimum Rating</p>
        <div className="flex gap-1.5">
          {[3, 3.5, 4, 4.5].map(r => (
            <button key={r} onClick={() => setMinRating(minRating == r ? '' : r)}
              className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                minRating == r ? 'bg-gold-400 text-white border-gold-400' : 'border-gray-200 text-gray-500 hover:border-yellow-300 bg-gray-50'
              }`}
            >⭐ {r}+</button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button onClick={apply}
          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-primary-100"
        >Apply Filters</button>
        {hasFilters && (
          <button onClick={reset}
            className="px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-500 text-xs font-semibold hover:border-red-200 hover:text-red-500 transition-all flex items-center gap-1"
          ><X size={12} /> Clear</button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN MapPage
══════════════════════════════════════════ */
export default function MapPage() {
  const { advocates, loading, fetchNearby, fetchAdvocates } = useAdvocates();
  const { location, loading: locLoading, error: locError, retry } = useGeolocation();
  const [selectedId,  setSelectedId]  = useState(null);
  const [radius,      setRadius]      = useState(20);
  const [filters,     setFilters]     = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab,   setActiveTab]   = useState('list');
  const [fullMap,     setFullMap]     = useState(false);
  const cardRefs = useRef({});

  useEffect(() => {
    if (location) {
      fetchNearby({ lat: location.lat, lng: location.lng, radius, ...filters });
    } else if (!locLoading) {
      fetchAdvocates({ limit: 50, ...filters });
    }
  }, [location, radius, filters]);

  const handleSelectAdvocate = (id) => {
    setSelectedId(id);
    setSidebarOpen(true);
    setActiveTab('list');
    setFullMap(false);
    setTimeout(() => cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 350);
  };

  const toggleFullMap = () => {
    const next = !fullMap;
    setFullMap(next);
    setSidebarOpen(!next);
  };

  return (
    <div className="relative flex overflow-hidden" style={{ height: 'calc(100dvh - 56px)' }}>

      {/* ════════════ SIDEBAR ════════════ */}
      <div
        className="flex-shrink-0 flex flex-col bg-white z-20 border-r border-gray-100 overflow-hidden"
        style={{
          width: sidebarOpen && !fullMap ? '280px' : '0px',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: sidebarOpen && !fullMap ? '4px 0 24px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100 px-3 pt-3 pb-2">
          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-0.5 mb-2">
            {[
              { id: 'list',    icon: List,              label: 'Advocates' },
              { id: 'filters', icon: SlidersHorizontal,  label: 'Filters'   },
            ].map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all ${
                  activeTab === id ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={12} />
                {label}
                {id === 'list' && advocates.length > 0 && (
                  <span className="bg-primary-100 text-primary-700 text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                    {advocates.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Radius pills */}
          {activeTab === 'list' && location && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <span className="text-[10px] text-gray-400 font-semibold flex-shrink-0">Radius:</span>
              {[5, 10, 20, 30, 50].map(r => (
                <button key={r} onClick={() => setRadius(r)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                    radius === r ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 text-gray-500 hover:border-primary-300'
                  }`}
                >{r}km</button>
              ))}
            </div>
          )}
        </div>

        {/* Advocates list */}
        {activeTab === 'list' && (
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading && <div className="flex justify-center pt-10"><Spinner size="lg" /></div>}
            {!loading && advocates.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <MapPin size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-xs font-medium">No advocates in this area</p>
                <p className="text-[10px] mt-1 text-gray-300">Try increasing the radius</p>
              </div>
            )}
            {advocates.map(adv => (
              <div key={adv._id} ref={el => cardRefs.current[adv._id] = el}>
                <SidebarCard
                  advocate={adv}
                  isSelected={selectedId === adv._id}
                  onClick={() => handleSelectAdvocate(adv._id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        {activeTab === 'filters' && (
          <div className="flex-1 overflow-y-auto">
            <FilterPanel
              onFilter={f => { setFilters(f); setActiveTab('list'); }}
              showDistanceSort={!!location}
              onClose={() => setActiveTab('list')}
            />
          </div>
        )}
      </div>

      {/* ════════════ MAP ════════════ */}
      <div className="flex-1 relative">

        {/* GPS loading overlay */}
        {locLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-30 backdrop-blur-sm">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="text-sm text-gray-500 mt-3 font-medium">Getting your GPS location...</p>
            </div>
          </div>
        )}

        {/* Floating: location status pill */}
        <div className="absolute top-3 left-3 z-20">
          <div className="bg-white rounded-xl px-3 py-2 shadow-md flex items-center gap-2 text-xs font-semibold">
            {locLoading ? (
              <><Spinner size="sm" /><span className="text-gray-400">Locating...</span></>
            ) : location ? (
              <><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                <span className="text-green-700">Location detected</span></>
            ) : (
              <><span className="text-amber-600">⚠️ {locError || 'Location off'}</span>
                <button onClick={retry} className="text-primary-600 font-bold underline ml-1">Retry</button></>
            )}
          </div>
        </div>

        {/* Floating: top-right controls */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
          {/* Full map */}
          <button onClick={toggleFullMap}
            className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
            title={fullMap ? 'Show sidebar' : 'Full map'}
          >
            {fullMap ? <Minimize2 size={16} className="text-gray-600" /> : <Maximize2 size={16} className="text-gray-600" />}
          </button>

          {/* Sidebar toggle */}
          {!fullMap && (
            <button onClick={() => setSidebarOpen(o => !o)}
              className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
              title={sidebarOpen ? 'Hide sidebar' : 'Show list'}
            >
              {sidebarOpen
                ? <ChevronLeft size={16} className="text-gray-600" />
                : <ChevronRight size={16} className="text-gray-600" />}
            </button>
          )}
        </div>

        {/* Floating: bottom count + mobile toggle */}
        {!locLoading && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {advocates.length > 0 && (
              <div className="bg-white rounded-full px-4 py-2 shadow-lg text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                {advocates.length} advocates found
              </div>
            )}
            <button
              onClick={() => { setFullMap(false); setSidebarOpen(o => !o); }}
              className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-4 py-2 shadow-lg text-xs font-bold flex items-center gap-1.5 transition-colors md:hidden"
            >
              <List size={12} />
              {sidebarOpen ? 'Hide List' : 'Show List'}
            </button>
          </div>
        )}

        <MapView
          advocates={advocates}
          userLocation={location}
          selectedId={selectedId}
          onSelectAdvocate={handleSelectAdvocate}
          radius={radius}
        />
      </div>
    </div>
  );
}
