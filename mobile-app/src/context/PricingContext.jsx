import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const PricingContext = createContext();

export const PricingProvider = ({ children }) => {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPrices = async () => {
    try {
      const response = await api.get('/pricing');
      if (response.data && response.data.data) {
        const pricingMap = {};
        response.data.data.forEach(item => {
          pricingMap[item.serviceId] = item.basePrice;
        });
        setPrices(pricingMap);
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
      // Fallback prices in case API fails
      setPrices({
        chat_consultation: 499,
        voice_consultation: 499,
        video_consultation: 1199,
        fir_draft: 499,
        property_research: 2999,
        document_forensic: 2999,
        legal_notice: 1199,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const getPrice = (serviceId, fallbackPrice) => {
    return prices[serviceId] !== undefined ? prices[serviceId] : fallbackPrice;
  };

  return (
    <PricingContext.Provider value={{ prices, loading, getPrice, refreshPrices: fetchPrices }}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = () => useContext(PricingContext);
