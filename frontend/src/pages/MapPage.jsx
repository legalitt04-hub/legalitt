import { useEffect, useState, useRef } from 'react';
import { Navigation, MapPin, Loader } from 'lucide-react';
import MapView from '../components/MapView';
import AdvocateCard from '../components/AdvocateCard';
import SearchFilters from '../components/SearchFilters';
import Spinner from '../components/Spinner';
import { useAdvocates } from '../hooks/useAdvocates';
import { useGeolocation } from '../hooks/useGeolocation';

export default function MapPage() {
  const { advocates, loading, fetchNearby, fetchAdvocates } = useAdvocates();
  const { location, loading: locLoading, error: locError, retry } = useGeolocation();
  const [selectedId, setSelectedId] = useState(null);
  const [radius, setRadius] = useState(20);
  const [filters, setFilters] = useState({});
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
    // Scroll card into view
    const el = cardRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={15} className="text-primary-500" />
          {locLoading ? (
            <span className="flex items-center gap-1.5"><Spinner size="sm" /> Detecting location...</span>
          ) : location ? (
            <span className="font-medium text-green-700">📍 Location detected</span>
          ) : (
            <span className="text-amber-600">⚠️ {locError || 'Location unavailable'}</span>
          )}
        </div>
        {!locLoading && !location && (
          <button onClick={retry} className="text-xs btn-outline py-1.5 px-3">
            Retry
          </button>
        )}
        {location && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-500">Radius:</span>
            <select
              value={radius}
              onChange={e => setRadius(+e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {[5,10,15,20,30,50].map(r => <option key={r} value={r}>{r} km</option>)}
            </select>
            <span className="text-xs text-gray-400 font-medium">{advocates.length} found</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: list */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-surface border-r border-gray-100 overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-white">
            <SearchFilters onFilter={setFilters} showDistanceSort={!!location} />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading && (
              <div className="flex justify-center pt-10"><Spinner /></div>
            )}
            {!loading && advocates.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">
                <MapPin size={32} className="mx-auto mb-3 opacity-30" />
                No advocates in this area
              </div>
            )}
            {advocates.map(adv => (
              <div key={adv._id} ref={el => cardRefs.current[adv._id] = el}>
                <AdvocateCard
                  advocate={adv}
                  isSelected={selectedId === adv._id}
                  onClick={() => handleSelectAdvocate(adv._id)}
                  showDistance={true}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: map */}
        <div className="flex-1 relative">
          {locLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="text-sm text-gray-500 mt-3">Getting your location...</p>
              </div>
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
    </div>
  );
}
