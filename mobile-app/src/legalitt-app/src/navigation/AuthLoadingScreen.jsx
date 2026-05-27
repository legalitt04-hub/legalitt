import React, { useState, useEffect } from 'react';
import SplashScreen from '../screens/auth/SplashScreen';
import LegalittIntroScreen from '../screens/auth/LegalittIntroScreen';

export default function AuthLoadingScreen() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // Show gavel for 3 seconds
    const gavelTimer = setTimeout(() => {
      setShowIntro(true);
    }, 3000);

    return () => clearTimeout(gavelTimer);
  }, []);

  if (showIntro) {
    return <LegalittIntroScreen />;
  }
  
  return <SplashScreen />;
}
