import React, { useState, useEffect } from 'react';

export const CountUp = ({ to, type = 'number' }: { to: number, type?: 'number' | 'currency' | 'decimal' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (to === 0) {
      setCount(0);
      return;
    }
    
    let startTime: number;
    const duration = 1200;
    
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(to * easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(to);
      }
    };
    
    requestAnimationFrame(animate);
  }, [to]);

  if (type === 'currency') {
    return <>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(count)}</>;
  }
  if (type === 'decimal') {
    return <>{count.toFixed(1)}</>;
  }
  return <>{Math.floor(count).toLocaleString('en-IN')}</>;
};
