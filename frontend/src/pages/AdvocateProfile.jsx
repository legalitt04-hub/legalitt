import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Briefcase, Phone, Mail, Star,
  CheckCircle2, IndianRupee, Calendar, Hash, MessageSquare,
  Send, Clock, Award
} from 'lucide-react';
import StarRating from '../components/StarRating';
import Spinner from '../components/Spinner';
import { advocateAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TABS = ['Overview', 'Experience', 'Reviews'];

function ReviewCard({ review }) {
  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
          {(review.userName || review.user || 'U')[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">{review.userName || review.user || 'Anonymous'}</p>
            <span className="text-xs text-gray-400">
              {new Date(review.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 mb-2">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={12} className={i <= review.rating ? 'text-gold-400 fill-gold-400' : 'text-gray-200 fill-gray-200'} />
            ))}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdvocateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [advocate, setAdvocate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
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
      setAdvocate(prev => ({ ...prev, reviews: res.data.data.reviews, rating: res.data.data.rating }));
      setReviewForm({ rating: 5, comment: '' });
      setShowReviewForm(false);
      toast.success('Review submitted! Thank you.');
    } catch (_) {} finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <Spinner size="lg" />
    </div>
  );
  if (!advocate) return null;

  return (
    <div className="min-h-screen bg-surface pb-28">
      {/* ── Hero Header ── */}
      <div className="relative bg-primary-500 pt-12 pb-16 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-5 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={advocate.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(advocate.name)}&background=ffffff&color=0d7a5f&size=80`}
              alt={advocate.name}
              className="w-20 h-20 rounded-2xl object-cover bg-white shadow-md border-2 border-white"
              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(advocate.name)}&background=ffffff&color=0d7a5f&size=80`; }}
            />
            {advocate.available && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold text-lg leading-tight truncate">{advocate.name}</h1>
              {advocate.verified && <CheckCircle2 size={16} className="text-primary-200 flex-shrink-0" />}
            </div>
            <p className="text-primary-200 text-sm mt-0.5">{advocate.specialization}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={12} className={i <= Math.round(advocate.rating) ? 'text-gold-400 fill-gold-400' : 'text-white/30 fill-white/30'} />
                ))}
                <span className="text-white text-xs font-bold ml-1">{advocate.rating?.toFixed(1)}</span>
              </div>
              <span className="text-primary-200 text-xs">({advocate.reviews?.length || 0} reviews)</span>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 mt-4">
          {[
            { label: 'Experience', value: advocate.experience },
            { label: 'City', value: advocate.location?.city || 'MP' },
            { label: 'Fees', value: `₹${advocate.fees?.toLocaleString('en-IN')}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 text-center">
              <p className="text-white font-bold text-sm">{value}</p>
              <p className="text-primary-200 text-[10px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs Card (overlapping header) ── */}
      <div className="px-4 -mt-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? 'text-primary-600 border-b-2 border-primary-500'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-4">
            {activeTab === 'Overview' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    [Briefcase, 'Experience', advocate.experience],
                    [MapPin,    'Location',   advocate.location?.city || 'MP'],
                    [Calendar,  'Enrolled',   advocate.enrollYear || 'N/A'],
                    [Hash,      'Bar No.',    advocate.enrollNo || 'N/A'],
                    [IndianRupee, 'Consultation', `₹${advocate.fees?.toLocaleString('en-IN')}`],
                    [Clock,     'Available',  advocate.available ? 'Yes' : 'No'],
                  ].map(([Icon, label, value]) => (
                    <div key={label} className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                        <p className="text-xs font-semibold text-gray-800 mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {advocate.location?.address && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Address</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{advocate.location.address}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Experience' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-start gap-3 bg-primary-50 rounded-xl p-4">
                  <Award size={20} className="text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Professional Background</p>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {advocate.name} is an experienced {advocate.specialization} attorney
                      with {advocate.experience} of practice based in {advocate.location?.city || 'Madhya Pradesh'}.
                      {advocate.enrollYear && ` Enrolled since ${advocate.enrollYear}.`}
                    </p>
                  </div>
                </div>
                {[
                  { label: 'Specialization', value: advocate.specialization },
                  { label: 'Years of Practice', value: advocate.experience },
                  { label: 'Bar Enrollment No.', value: advocate.enrollNo || 'N/A' },
                  { label: 'Enrollment Year', value: advocate.enrollYear || 'N/A' },
                  { label: 'Primary Location', value: advocate.location?.city || 'Madhya Pradesh' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Reviews' && (
              <div className="animate-fade-in">
                {/* Rating summary */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary-600">{advocate.rating?.toFixed(1)}</p>
                    <div className="flex items-center gap-0.5 justify-center mt-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={14} className={i <= Math.round(advocate.rating) ? 'text-gold-400 fill-gold-400' : 'text-gray-200 fill-gray-200'} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{advocate.reviews?.length} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5,4,3,2,1].map(r => {
                      const count = advocate.reviews?.filter(rv => rv.rating === r).length || 0;
                      const pct = advocate.reviews?.length ? Math.round(count / advocate.reviews.length * 100) : 0;
                      return (
                        <div key={r} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-2">{r}</span>
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gold-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Write review */}
                {!showReviewForm ? (
                  <button
                    onClick={() => isAuthenticated ? setShowReviewForm(true) : navigate('/login')}
                    className="flex items-center gap-2 text-sm font-semibold text-primary-600 bg-primary-50 px-4 py-2.5 rounded-xl w-full justify-center hover:bg-primary-100 transition-colors mb-4"
                  >
                    <MessageSquare size={15} />
                    {isAuthenticated ? 'Write a Review' : 'Login to Review'}
                  </button>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3 bg-gray-50 rounded-xl p-4 mb-4 animate-fade-in">
                    <StarRating
                      rating={reviewForm.rating} size="lg" interactive={true}
                      onChange={r => setReviewForm(f => ({ ...f, rating: r }))}
                    />
                    <textarea
                      rows={3}
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      placeholder="Share your experience..."
                      className="input text-sm resize-none"
                      required minLength={10}
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={submitting}
                        className="btn-primary text-sm flex items-center gap-2 py-2 flex-1">
                        {submitting ? <Spinner size="sm" color="white" /> : <><Send size={14} /> Submit</>}
                      </button>
                      <button type="button" onClick={() => setShowReviewForm(false)} className="btn-ghost text-sm py-2">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Reviews list */}
                {advocate.reviews?.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No reviews yet. Be the first!</p>
                  </div>
                ) : (
                  <div>
                    {[...advocate.reviews].reverse().map((review, i) => (
                      <ReviewCard key={i} review={review} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Fixed Book Consultation CTA ── */}
      <div className="fixed bottom-20 left-0 right-0 px-4 z-40">
        <div className="max-w-lg mx-auto flex gap-3">
          {advocate.mobile && (
            <a
              href={`tel:+91${advocate.mobile}`}
              className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-md border border-gray-200 flex-shrink-0 hover:bg-gray-50 transition-colors"
            >
              <Phone size={18} className="text-primary-600" />
            </a>
          )}
          <button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-200 transition-all active:scale-95 text-sm">
            Book Consultation — ₹{advocate.fees?.toLocaleString('en-IN')}
          </button>
        </div>
      </div>
    </div>
  );
}
