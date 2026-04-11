import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Briefcase, Phone, Mail, Star,
  CheckCircle2, IndianRupee, Calendar, Hash, MessageSquare, Send
} from 'lucide-react';
import StarRating from '../components/StarRating';
import Spinner from '../components/Spinner';
import { advocateAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SPEC_COLORS = {
  'Criminal Law': 'bg-red-100 text-red-700 border-red-200',
  'Civil Law': 'bg-blue-100 text-blue-700 border-blue-200',
  'Family Law': 'bg-pink-100 text-pink-700 border-pink-200',
  'Corporate Law': 'bg-purple-100 text-purple-700 border-purple-200',
  'Property Law': 'bg-amber-100 text-amber-700 border-amber-200',
  'Labour Law': 'bg-green-100 text-green-700 border-green-200',
  'Tax Law': 'bg-teal-100 text-teal-700 border-teal-200',
  'Consumer Law': 'bg-orange-100 text-orange-700 border-orange-200',
  'Cyber Law': 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

function ReviewCard({ review }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
            {(review.userName || review.user || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{review.userName || review.user || 'Anonymous'}</p>
            <StarRating rating={review.rating} size="sm" />
          </div>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {new Date(review.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-2.5 leading-relaxed">{review.comment}</p>
    </div>
  );
}

export default function AdvocateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [advocate, setAdvocate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    advocateAPI.getById(id)
      .then(res => setAdvocate(res.data.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to leave a review'); return; }
    if (reviewForm.comment.trim().length < 10) { toast.error('Review must be at least 10 characters'); return; }
    setSubmitting(true);
    try {
      const res = await reviewAPI.add({ advocateId: id, ...reviewForm });
      setAdvocate(prev => ({
        ...prev,
        reviews: res.data.data.reviews,
        rating: res.data.data.rating
      }));
      setReviewForm({ rating: 5, comment: '' });
      setShowReviewForm(false);
      toast.success('Review submitted! Thank you.');
    } catch (_) {} finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (!advocate) return null;

  const specColor = SPEC_COLORS[advocate.specialization] || 'bg-gray-100 text-gray-700 border-gray-200';
  const ratingDist = [5,4,3,2,1].map(r => ({
    r,
    count: advocate.reviews.filter(rv => rv.rating === r).length,
    pct: advocate.reviews.length ? Math.round(advocate.reviews.filter(rv => rv.rating === r).length / advocate.reviews.length * 100) : 0
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-6 text-center">
            <div className="relative inline-block mb-4">
              <img
                src={advocate.image}
                alt={advocate.name}
                className="w-28 h-28 rounded-3xl object-cover mx-auto shadow-md"
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(advocate.name)}&background=1a4fd6&color=fff&size=112`; }}
              />
              {advocate.available && (
                <span className="absolute bottom-1 right-1 flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full border border-green-200">
                  ● Available
                </span>
              )}
            </div>

            <h1 className="font-display text-xl font-bold text-gray-900 leading-tight mb-1">{advocate.name}</h1>
            <span className={`badge border ${specColor} mb-3`}>{advocate.specialization}</span>

            <div className="flex items-center justify-center gap-2 mb-1">
              <StarRating rating={advocate.rating} size="md" />
              <span className="font-bold text-gray-800">{advocate.rating?.toFixed(1)}</span>
            </div>
            <p className="text-xs text-gray-400 mb-5">{advocate.reviews.length} reviews</p>

            <div className="space-y-2.5 text-left">
              {[
                [Briefcase, 'Experience', advocate.experience],
                [MapPin, 'Location', advocate.location?.city || 'MP'],
                [Calendar, 'Enrolled', advocate.enrollYear || 'N/A'],
                [Hash, 'Bar No.', advocate.enrollNo || 'N/A'],
                [IndianRupee, 'Consultation', `₹${advocate.fees?.toLocaleString('en-IN')} onwards`],
              ].map(([Icon, label, value]) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-medium text-gray-800 text-xs">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact buttons */}
            <div className="mt-5 space-y-2">
              {advocate.mobile && (
                <a href={`tel:+91${advocate.mobile}`}
                  className="flex items-center justify-center gap-2 w-full btn-primary text-sm py-2.5">
                  <Phone size={15} /> Call Advocate
                </a>
              )}
              {advocate.email && advocate.email !== 'nan' && (
                <a href={`mailto:${advocate.email}`}
                  className="flex items-center justify-center gap-2 w-full btn-outline text-sm py-2.5">
                  <Mail size={15} /> Send Email
                </a>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Address</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{advocate.location?.address || advocate.location?.city || 'Madhya Pradesh'}</p>
          </div>
        </div>

        {/* Right: Reviews */}
        <div className="lg:col-span-2 space-y-5">
          {/* Rating summary */}
          <div className="card p-6">
            <div className="flex items-start gap-8">
              <div className="text-center">
                <p className="font-display text-5xl font-bold text-primary-700">{advocate.rating?.toFixed(1)}</p>
                <StarRating rating={advocate.rating} size="md" />
                <p className="text-xs text-gray-400 mt-1">{advocate.reviews.length} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {ratingDist.map(({ r, count, pct }) => (
                  <div key={r} className="flex items-center gap-2 text-xs">
                    <span className="w-4 text-gray-500">{r}</span>
                    <span className="text-gold-500">★</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-gold-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-gray-400 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add review button */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              {!showReviewForm ? (
                <button
                  onClick={() => isAuthenticated ? setShowReviewForm(true) : navigate('/login')}
                  className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  <MessageSquare size={15} />
                  {isAuthenticated ? 'Write a Review' : 'Login to Review'}
                </button>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3 animate-fade-in">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">Your Rating</label>
                    <StarRating
                      rating={reviewForm.rating}
                      size="lg"
                      interactive={true}
                      onChange={r => setReviewForm(f => ({ ...f, rating: r }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">Your Review</label>
                    <textarea
                      rows={3}
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      placeholder="Share your experience with this advocate..."
                      className="input text-sm resize-none"
                      required minLength={10}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={submitting}
                      className="btn-primary text-sm flex items-center gap-2 py-2">
                      {submitting ? <Spinner size="sm" color="white" /> : <><Send size={14} /> Submit</>}
                    </button>
                    <button type="button" onClick={() => setShowReviewForm(false)} className="btn-ghost text-sm py-2">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Reviews list */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-4">
              Client Reviews <span className="text-gray-400 font-normal text-sm">({advocate.reviews.length})</span>
            </h2>
            {advocate.reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...advocate.reviews].reverse().map((review, i) => (
                  <ReviewCard key={i} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
