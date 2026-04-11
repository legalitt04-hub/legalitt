import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { advocateAPI } from '../services/api';

const SPECIALIZATIONS = [
  'Criminal Law','Civil Law','Family Law','Corporate Law',
  'Property Law','Labour Law','Constitutional Law','Tax Law',
  'Consumer Law','Cyber Law','Intellectual Property','Banking Law'
];

const SORT_OPTIONS = [
  { label: 'Highest Rated', value: '-rating' },
  { label: 'Most Reviewed', value: '-reviewCount' },
  { label: 'Nearest First', value: 'distance' },
  { label: 'Most Experienced', value: '-enrollYear' },
  { label: 'Lowest Fees', value: 'fees' },
];

export default function SearchFilters({ onFilter, showDistanceSort = false }) {
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [sort, setSort] = useState('-rating');
  const [minRating, setMinRating] = useState('');
  const [city, setCity] = useState('');
  const [cities, setCities] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    advocateAPI.getCities().then(r => setCities(r.data.data)).catch(() => {});
  }, []);

  const apply = () => {
    onFilter({ search, specialization, sort, minRating, city });
  };

  const reset = () => {
    setSearch(''); setSpecialization(''); setSort('-rating');
    setMinRating(''); setCity('');
    onFilter({});
  };

  const hasFilters = search || specialization || minRating || city;

  return (
    <div className="bg-white rounded-2xl shadow-card p-4 space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search advocates by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && apply()}
          className="input pl-10 pr-4 text-sm"
        />
      </div>

      {/* Quick filters row */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={specialization}
          onChange={e => setSpecialization(e.target.value)}
          className="input text-sm flex-1 min-w-[140px] cursor-pointer"
        >
          <option value="">All Specializations</option>
          {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="input text-sm w-40 cursor-pointer"
        >
          {SORT_OPTIONS.filter(o => showDistanceSort || o.value !== 'distance').map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-primary-600 font-medium hover:underline"
      >
        <SlidersHorizontal size={13} />
        Advanced filters
        <ChevronDown size={13} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="flex gap-2 flex-wrap animate-fade-in">
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="input text-sm flex-1 min-w-[120px] cursor-pointer"
          >
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={minRating}
            onChange={e => setMinRating(e.target.value)}
            className="input text-sm w-36 cursor-pointer"
          >
            <option value="">Min Rating</option>
            {[4.5, 4, 3.5, 3].map(r => (
              <option key={r} value={r}>⭐ {r}+</option>
            ))}
          </select>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button onClick={apply} className="btn-primary flex-1 text-sm py-2">
          Apply Filters
        </button>
        {hasFilters && (
          <button onClick={reset} className="btn-ghost text-sm px-3 py-2 flex items-center gap-1">
            <X size={14} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
