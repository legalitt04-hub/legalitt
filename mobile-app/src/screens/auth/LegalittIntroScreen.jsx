// screens/auth/LegalittIntroScreen.jsx - Premium Cinematic Logo Reveal (Optimized 60 FPS, Zero Black Box)
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  Image,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 15 Golden dust particles drifting slowly
const PARTICLE_COUNT = 15;
const VIEWPORT_WIDTH = 290;
const VIEWPORT_HEIGHT = 100;

export default function LegalittIntroScreen({ navigation }) {
  // Cinematic Dolly Scale
  const dollyScale = useRef(new Animated.Value(0.96)).current;

  // Screen/overlay fade
  const screenOpacity = useRef(new Animated.Value(1)).current;

  // Ambient center glow opacity
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // Logo Reveal Opacity
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Reveal TranslateX (animates from 0 to VIEWPORT_WIDTH for a native-smooth reveal)
  const revealTranslateX = useRef(new Animated.Value(0)).current;

  // Light sweep offset (for metallic shine on the icon)
  const sweepOffset = useRef(new Animated.Value(-120)).current;

  // Asset readiness state
  const [assetsReady, setAssetsReady] = useState(false);

  // Floating Particles animations
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }).map(() => ({
      x: Math.random() * SCREEN_WIDTH,
      y: SCREEN_HEIGHT * 0.4 + Math.random() * (SCREEN_HEIGHT * 0.3),
      animY: new Animated.Value(0),
      animX: new Animated.Value(0),
      opacity: new Animated.Value(0),
      speedY: 1.5 + Math.random() * 2,
      speedX: -0.5 + Math.random() * 1.0,
      size: 1 + Math.random() * 2.5,
    }))
  ).current;

  useEffect(() => {
    let isMounted = true;

    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#000000');

    // 1. Preload Logo Asset into Memory for instant 0ms painting
    const preloadAssets = async () => {
      try {
        const logoAsset = require('../../../assets/logo-transparent.png');
        await Asset.loadAsync(logoAsset);
        const resolved = Image.resolveAssetSource(logoAsset);
        if (resolved?.uri) {
          await Image.prefetch(resolved.uri);
        }
      } catch (err) {
        // Fallback gracefully
      }

      if (!isMounted) return;
      setAssetsReady(true);

      // Hide native splash screen seamlessly into custom dark splash
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // Native splash already hidden
      }
    };

    preloadAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!assetsReady) return;

    // --- Particle Animation Setup ---
    particles.forEach((p) => {
      Animated.timing(p.opacity, {
        toValue: 0.4 + Math.random() * 0.6,
        duration: 1000 + Math.random() * 1500,
        useNativeDriver: true,
      }).start();

      Animated.timing(p.animY, {
        toValue: -250 - Math.random() * 200,
        duration: 7500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();

      Animated.timing(p.animX, {
        toValue: p.speedX * 80,
        duration: 7500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    });

    // Ambient dolly scale runs smoothly across the scene
    Animated.timing(dollyScale, {
      toValue: 1.04,
      duration: 7500,
      easing: Easing.out(Easing.sin),
      useNativeDriver: true,
    }).start();

    // --- SEQUENTIAL ANIMATION TIMELINE ---
    // Sequence: Background -> Loading Bar 100% -> 150ms Delay -> Logo Reveal -> Metallic Sweep -> Transition
    Animated.sequence([
      // 1. Scene begins in darkness, ambient center glow starts to build
      Animated.timing(glowOpacity, {
        toValue: 0.6,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),

      // 2. Golden loading bar moves 100% from left to right (0 -> VIEWPORT_WIDTH)
      Animated.timing(revealTranslateX, {
        toValue: VIEWPORT_WIDTH,
        duration: 2200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),

      // 3. Loading bar completed 100%. Add explicit 150 ms delay
      Animated.delay(150),

      // 4. ONLY NOW does the Logo fade & glow in
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      // 5. Metallic gold light sweep travels across the golden hexagon icon
      Animated.timing(sweepOffset, {
        toValue: 240,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      // 6. Hold the fully revealed logo for settling
      Animated.delay(1400),

      // 7. Fade smoothly to black / transition out
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        navigation?.replace('RoleSelect');
      }
    });
  }, [assetsReady, navigation]);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

      {/* Cinematic Ambient Glow Background */}
      <Animated.View style={[styles.ambientGlow, { opacity: glowOpacity }]} />

      {/* Volumetric diagonal light rays */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Path
            d="M -20 -10 L 40 -10 L 0 110 L -60 110 Z"
            fill="rgba(234, 179, 8, 0.02)"
          />
          <Path
            d="M 20 -10 L 80 -10 L 40 110 L -20 110 Z"
            fill="rgba(234, 179, 8, 0.015)"
          />
          <Path
            d="M 60 -10 L 120 -10 L 80 110 L 20 110 Z"
            fill="rgba(234, 179, 8, 0.02)"
          />
        </Svg>
      </View>

      {/* Floating Golden Dust Particles */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              opacity: p.opacity,
              transform: [
                { translateY: p.animY },
                { translateX: p.animX },
              ],
            },
          ]}
        />
      ))}

      {/* Animated Dolly-In Container */}
      <Animated.View
        style={[
          styles.logoDollyWrapper,
          {
            transform: [{ scale: dollyScale }],
          },
        ]}
      >
        <View style={styles.logoViewport}>
          {/* Underlay shadow backup of the logo for soft bloom */}
          <Animated.Image
            source={require('../../../assets/logo-transparent.png')}
            style={[styles.logoBloomUnderlay, { opacity: Animated.multiply(logoOpacity, 0.12) }]}
            resizeMode="contain"
          />

          {/* The Static Transparent Logo Image */}
          <Animated.Image
            source={require('../../../assets/logo-transparent.png')}
            style={[styles.logoImage, { opacity: logoOpacity }]}
            resizeMode="contain"
          />

          {/* Gold metallic sweep overlaying the logo icon */}
          <Animated.View
            style={[
              styles.sweepWrapper,
              {
                transform: [
                  { translateX: sweepOffset },
                  { rotate: '20deg' }
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255, 228, 160, 0.35)', 'rgba(255, 228, 160, 0.75)', 'rgba(255, 228, 160, 0.35)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sweepGradient}
            />
          </Animated.View>

          {/* Glowing vertical light streak carving across the logo (NO BLACK RECTANGLE) */}
          <Animated.View
            style={[
              styles.lightStreakWrapper,
              {
                transform: [{ translateX: revealTranslateX }],
              },
            ]}
          >
            <View style={styles.lightStreak} />
          </Animated.View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: (SCREEN_WIDTH * 0.8) / 2,
    backgroundColor: 'rgba(234, 179, 8, 0.03)',
    shadowColor: '#EAB308',
    shadowRadius: 100,
    shadowOpacity: 0.05,
    top: '30%',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#FFE4A0',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 2,
    shadowOpacity: 0.6,
  },
  logoDollyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoViewport: {
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: VIEWPORT_WIDTH,
    height: '100%',
  },
  logoBloomUnderlay: {
    width: VIEWPORT_WIDTH,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    tintColor: '#FFE4A0',
  },
  lightStreakWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 20,
    height: '100%',
    zIndex: 10,
  },
  lightStreak: {
    width: 4,
    height: '100%',
    backgroundColor: '#FFE4A0',
    shadowColor: '#FFE4A0',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    shadowOpacity: 1.0,
    elevation: 5,
  },
  sweepWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 60,
    height: '100%',
    zIndex: 5,
  },
  sweepGradient: {
    width: '100%',
    height: '100%',
  },
});
