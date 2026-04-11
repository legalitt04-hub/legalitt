import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Search, Scale, ChevronRight } from 'lucide-react';
import AdvocateCard from '../components/AdvocateCard';
import SearchFilters from '../components/SearchFilters';
import Spinner from '../components/Spinner';
import { useAdvocates } from '../hooks/useAdvocates';
import { useGeolocation } from '../hooks/useGeolocation';

const HERO_SPECS = ['Criminal Law','Family Law','Property Law','Corporate Law','Consumer Law','Cyber Law'];

export default function Home() {
  const { advocates, loading, error, pagination, fetchAdvocates, fetchNearby } = useAdvocates();
  const { location, loading: locLoading } = useGeolocation();
  const [activeFilters, setActiveFilters] = useState({});
  const [nearbyMode, setNearbyMode] = useState(false);
  const [radius, setRadius] = useState(20);
  const [page, setPage] = useState(1);
  const listRef = useRef(null);

  useEffect(() => {
    fetchAdvocates({ ...activeFilters, page, limit: 12 });
  }, [activeFilters, page]);

  const handleNearby = () => {
    if (!location) return;
    setNearbyMode(true);
    fetchNearby({ lat: location.lat, lng: location.lng, radius, ...activeFilters });
  };

  const handleFilter = (filters) => {
    setActiveFilters(filters);
    setPage(1);
    setNearbyMode(false);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white pt-14 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, #4d7aff 0%, transparent 50%), radial-gradient(circle at 80% 10%, #84a7ff 0%, transparent 40%)'
        }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium mb-6 animate-fade-in">
            <Scale size={13} /> 21,000+ Verified Advocates in Madhya Pradesh
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5 animate-fade-in-up">
            Find the Right Advocate<br />
            <span className="text-gold-400">Near You</span>
          </h1>
          <p className="text-primary-200 text-base sm:text-lg max-w-xl mx-auto mb-8 animate-fade-in-up stagger-1">
            Browse verified lawyers across Bhopal, Indore, Jabalpur, Gwalior and 12 more cities in MP.
          </p>

          {/* Spec pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in-up stagger-2">
            {HERO_SPECS.map(s => (
              <button
                key={s}
                onClick={() => handleFilter({ specialization: s })}
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium transition-all"
              >
                {s}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up stagger-3">
            <button
              onClick={handleNearby}
              disabled={locLoading}
              className="flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              {locLoading ? <Spinner size="sm" /> : <Navigation size={17} />}
              Find Near Me
            </button>
            <Link to="/map" className="flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-6 py-3 rounded-xl transition-all font-medium">
              <MapPin size={17} /> Open Map View
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-white border-b border-gray-100 py-5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            ['21,000+', 'Advocates'],
            ['16', 'Cities in MP'],
            ['12', 'Specializations'],
            ['Free', 'Registration'],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="font-display text-2xl font-bold text-primary-700">{n}</p>
              <p className="text-xs text-gray-500 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8" ref={listRef}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-20 space-y-4">
              <SearchFilters onFilter={handleFilter} showDistanceSort={nearbyMode} />

              {/* Radius control */}
              {nearbyMode && (
                <div className="bg-white rounded-2xl shadow-card p-4 animate-fade-in">
                  <label className="text-xs font-medium text-gray-700 block mb-2">
                    Search Radius: <span className="text-primary-600 font-bold">{radius} km</span>
                  </label>
                  <input
                    type="range" min={5} max={100} step={5} value={radius}
                    onChange={e => setRadius(+e.target.value)}
                    className="w-full accent-primary-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1"><span>5 km</span><span>100 km</span></div>
                  <button onClick={handleNearby} className="btn-primary w-full text-sm py-2 mt-3">
                    Update Radius
                  </button>
                </div>
              )}

              {!nearbyMode && (
                <button onClick={handleNearby} disabled={locLoading}
                  className="w-full flex items-center justify-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium px-4 py-3 rounded-xl text-sm transition-all border border-primary-200">
                  <Navigation size={15} />
                  Switch to Nearby Mode
                </button>
              )}
            </div>
          </aside>

          {/* Advocates grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900">
                  {nearbyMode ? 'Nearby Advocates' : 'All Advocates'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {nearbyMode
                    ? `${advocates.length} advocates within ${radius} km`
                    : pagination.total
                      ? `${pagination.total.toLocaleString()} advocates found`
                      : ''}
                </p>
              </div>
              {nearbyMode && (
                <button onClick={() => { setNearbyMode(false); fetchAdvocates({ ...activeFilters, page: 1 }); }}
                  className="text-xs text-primary-600 hover:underline font-medium">
                  Show all
                </button>
              )}
            </div>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="text-gray-400 text-sm mt-4">Loading advocates...</p>
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="text-center py-20">
                <p className="text-red-500 text-sm mb-3">{error}</p>
                <button onClick={() => fetchAdvocates(activeFilters)} className="btn-outline text-sm">Retry</button>
              </div>
            )}

            {!loading && !error && advocates.length === 0 && (
              <div className="text-center py-20">
                <Scale size={40} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No advocates found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search radius</p>
              </div>
            )}

            {!loading && advocates.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {advocates.map((adv, i) => (
                    <div key={adv._id} className={`animate-fade-in-up stagger-${Math.min(i % 4 + 1, 4)}`}>
                      <AdvocateCard advocate={adv} showDistance={nearbyMode || adv.distance != null} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {!nearbyMode && pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                      className="btn-outline text-sm px-4 py-2 disabled:opacity-40">← Prev</button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                        const p = i + 1;
                        return (
                          <button key={p} onClick={() => setPage(p)}
                            className={`w-9 h-9 text-sm rounded-lg font-medium transition-all ${page === p ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                            {p}
                          </button>
                        );
                      })}
                    </div>
                    <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}
                      className="btn-outline text-sm px-4 py-2 disabled:opacity-40">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
