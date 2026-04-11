import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Star, Clock, IndianRupee, CheckCircle2 } from 'lucide-react';
import StarRating from './StarRating';

const SPEC_COLORS = {
  'Criminal Law': 'bg-red-50 text-red-700',
  'Civil Law': 'bg-blue-50 text-blue-700',
  'Family Law': 'bg-pink-50 text-pink-700',
  'Corporate Law': 'bg-purple-50 text-purple-700',
  'Property Law': 'bg-amber-50 text-amber-700',
  'Labour Law': 'bg-green-50 text-green-700',
  'Constitutional Law': 'bg-indigo-50 text-indigo-700',
  'Tax Law': 'bg-teal-50 text-teal-700',
  'Consumer Law': 'bg-orange-50 text-orange-700',
  'Cyber Law': 'bg-cyan-50 text-cyan-700',
  'Intellectual Property': 'bg-violet-50 text-violet-700',
  'Banking Law': 'bg-emerald-50 text-emerald-700',
};

export default function AdvocateCard({ advocate, isSelected, onClick, showDistance = true }) {
  const navigate = useNavigate();
  const specColor = SPEC_COLORS[advocate.specialization] || 'bg-gray-50 text-gray-700';

  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer overflow-hidden group transition-all duration-300 ${
        isSelected ? 'ring-2 ring-primary-400 shadow-card-hover' : 'hover:shadow-card-hover'
      }`}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${isSelected ? 'bg-primary-500' : 'bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity'}`} />

      <div className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={advocate.image || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`}
              alt={advocate.name}
              className="w-16 h-16 rounded-2xl object-cover bg-gray-100"
              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(advocate.name)}&background=1a4fd6&color=fff&size=64`; }}
            />
            {advocate.available && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" title="Available" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate group-hover:text-primary-700 transition-colors">
                {advocate.name}
              </h3>
              {advocate.verified && (
                <CheckCircle2 size={14} className="text-primary-500 flex-shrink-0 mt-0.5" />
              )}
            </div>

            <span className={`badge mt-1 ${specColor} text-xs`}>
              {advocate.specialization}
            </span>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <StarRating rating={advocate.rating} size="sm" />
              <span className="text-xs font-semibold text-gray-800">{advocate.rating?.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({advocate.reviews?.length || 0})</span>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Briefcase size={12} className="text-gray-400" />
            {advocate.experience}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} className="text-gray-400" />
            {advocate.location?.city || 'MP'}
            {showDistance && advocate.distance != null && (
              <span className="text-primary-600 font-medium ml-0.5">· {advocate.distance} km</span>
            )}
          </span>
          <span className="flex items-center gap-1">
            <IndianRupee size={12} className="text-gray-400" />
            {advocate.fees?.toLocaleString('en-IN')}/consultation
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={e => { e.stopPropagation(); navigate(`/advocate/${advocate._id}`); }}
          className="mt-3 w-full btn-primary text-xs py-2 rounded-lg"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}
