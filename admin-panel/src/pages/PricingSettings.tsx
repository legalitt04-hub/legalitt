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
  const { token } = useAuth();
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
    <div className="space-y-6">
      <div className="flex items-center space-x-3 text-white">
        <div className="p-2 bg-primary-500/10 rounded-lg">
          <Settings className="h-6 w-6 text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold">Service Pricing Settings</h1>
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
            className="bg-slate-800 border border-slate-700 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">{price.name}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Base Price ({price.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <Input
                    type="number"
                    value={price.basePrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(price._id, e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <Button
                onClick={() => savePrice(price)}
                disabled={saving === price._id}
                className="w-full flex items-center justify-center space-x-2"
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
