import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';

interface Pricing {
  _id: string;
  serviceId: string;
  name: string;
  basePrice: number;
  currency: string;
  isActive: boolean;
}

export default function PricingSettings() {
  const [prices, setPrices] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const response = await api.get(`/pricing`);
      setPrices(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch pricing settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (id: string, value: string) => {
    setPrices(prices.map(p => {
      if (p._id === id) {
        return { ...p, basePrice: parseInt(value) || 0 };
      }
      return p;
    }));
  };

  const savePrice = async (price: Pricing) => {
    try {
      setSaving(price._id);
      setError('');
      await api.put(
        `/admin/pricing/${price._id}`,
        { basePrice: price.basePrice }
      );
      // Show brief success (optional)
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to update ${price.name}`);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-3 text-slate-900 mb-8">
        <div className="p-3 bg-teal-500/10 rounded-xl">
          <Settings className="h-6 w-6 text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Service Pricing</h1>
          <p className="text-sm text-slate-500 mt-1">Configure base prices for consultations</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prices.map((price, index) => (
          <motion.div
            key={price._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/60 border border-slate-200/60 rounded-2xl p-6 shadow-sm backdrop-blur-xl hover:shadow-md transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Settings className="w-16 h-16 text-teal-500" />
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mb-6">{price.name}</h3>
            
            <div className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-600">
                  Base Price ({price.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                  <Input
                    type="number"
                    value={price.basePrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(price._id, e.target.value)}
                    className="pl-8 bg-white border-slate-200/60 focus:border-teal-500 focus:ring-teal-500/20 text-slate-900 shadow-sm"
                  />
                </div>
              </div>

              <Button
                onClick={() => savePrice(price)}
                disabled={saving === price._id}
                className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-all"
              >
                {saving === price._id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
