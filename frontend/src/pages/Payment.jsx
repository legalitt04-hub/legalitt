import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight, CheckCircle } from 'lucide-react';
import Spinner from '../components/Spinner';

const PAY_METHODS = [
  { id: 'upi',    label: 'UPI',             sub: 'Pay Using any UPI app' },
  { id: 'card',   label: 'Credit/Debit Card', sub: 'Debit card or eat' },
  { id: 'netbank',label: 'Net Banking',     sub: 'Net Banking' },
];

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  // advocate info passed via router state
  const advocate  = location.state?.advocate  || { name: 'Advocate', fees: 800 };
  const advocateId = location.state?.advocateId || null;

  const [method,  setMethod]  = useState('upi');
  const [paying,  setPaying]  = useState(false);
  const [success, setSuccess] = useState(false);

  const fee  = advocate.fees || 800;
  const gst  = Math.round(fee * 0.02);   // ~2% platform fee
  const total = fee;

  const handlePay = async () => {
    setPaying(true);
    // Simulate Razorpay
    await new Promise(r => setTimeout(r, 1800));
    setPaying(false);
    setSuccess(true);
  };

  // ── Success screen ────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 pb-10">
        <div className="flex flex-col items-center text-center animate-fade-in-up">
          <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center mb-6 shadow-lg shadow-green-100">
            <CheckCircle size={60} className="text-green-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Consultation Booked Successfully</h2>
          <p className="text-gray-500 text-sm mb-10">You can now start chat with the advocate</p>

          <button
            onClick={() => navigate('/chat', { state: { advocateId } })}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-primary-200 mb-3"
          >
            Start Chat
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 font-semibold text-sm hover:underline"
          >
            View Details
          </button>
        </div>
      </div>
    );
  }

  // ── Payment screen ────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-base font-bold text-gray-900">Payment</h1>
      </div>

      <div className="px-4 mt-5 space-y-4">
        {/* Razorpay brand */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-center mb-5">
            {/* Razorpay wordmark */}
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-blue-600 rounded-full" />
              <span className="font-bold text-gray-800 text-lg">Razorpay</span>
            </div>
          </div>

          {/* Fee breakdown */}
          <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Consultation Fee</span>
              <span className="text-sm font-semibold text-gray-800">₹{fee}/-</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Platform Fee</span>
              <span className="text-sm font-semibold text-gray-800">₹{gst}/-</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">Total</span>
              <span className="text-sm font-bold text-primary-600">₹{total}/-</span>
            </div>
          </div>

          <p className="text-xs font-semibold text-gray-500 mb-3">Pay ₹{total}/-</p>

          {/* Payment methods */}
          <div className="space-y-2">
            {PAY_METHODS.map(({ id, label, sub }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all ${
                  method === id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <p className={`text-sm font-semibold ${method === id ? 'text-primary-700' : 'text-gray-800'}`}>{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pay button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-surface border-t border-gray-100">
        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
        >
          {paying ? <><Spinner size="sm" color="white" /> Processing...</> : `Pay ₹${total}`}
        </button>
      </div>
    </div>
  );
}
