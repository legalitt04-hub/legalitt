// screens/auth/LogoScreen.jsx - Premium Cinematic Progressive Logo Reveal (No Yellow Bars)
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  Image,
  Easing,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LOGO_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 300);
const LOGO_HEIGHT = LOGO_WIDTH * 0.42;
const PARTICLE_COUNT = 20;

export default function LogoScreen({ navigation, onAnimationComplete }) {
  const revealAnim = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const dollyScale = useRef(new Animated.Value(0.96)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  // Floating Golden Particles
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }).map(() => ({
      x: Math.random() * SCREEN_WIDTH,
      y: SCREEN_HEIGHT * 0.3 + Math.random() * (SCREEN_HEIGHT * 0.4),
      animY: new Animated.Value(0),
      animX: new Animated.Value(0),
      opacity: new Animated.Value(0),
      speedY: -0.3 - Math.random() * 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      size: 1.5 + Math.random() * 2.5,
    }))
  ).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#07080A');

    // Particles animation
    particles.forEach((p) => {
      Animated.timing(p.opacity, {
        toValue: 0.3 + Math.random() * 0.5,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      Animated.timing(p.animY, {
        toValue: p.speedY * 150,
        duration: 5500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();

      Animated.timing(p.animX, {
        toValue: p.speedX * 80,
        duration: 5500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    });

    // Camera dolly scale
    Animated.timing(dollyScale, {
      toValue: 1.02,
      duration: 5500,
      easing: Easing.out(Easing.sin),
      useNativeDriver: true,
    }).start();

    // Sequence (No yellow bars)
    Animated.sequence([
      // 0.0s - 0.5s: Matte Black & Ambient Glow
      Animated.timing(glowOpacity, {
        toValue: 0.7,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),

      // 0.5s - 2.5s: Progressive Left -> Right Logo Mask Reveal
      Animated.timing(revealAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),

      // 2.5s: Logo fully revealed. Hold 1 second
      Animated.delay(1000),

      // Transition out
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        if (onAnimationComplete) {
          onAnimationComplete();
        } else if (navigation?.replace) {
          navigation.replace('RoleSelect');
        }
      }
    });
  }, [navigation, onAnimationComplete]);

  const maskWidth = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, LOGO_WIDTH + 10],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="#07080A" />

      {/* Ambient Glow Backdrop */}
      <Animated.View style={[styles.ambientGlow, { opacity: glowOpacity }]} />

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

      {/* Dolly Wrapper */}
      <Animated.View
        style={[
          styles.logoDollyWrapper,
          {
            transform: [{ scale: dollyScale }],
          },
        ]}
      >
        <View style={[styles.logoViewport, { width: LOGO_WIDTH, height: LOGO_HEIGHT }]}>
          
          {/* Logo Reveal Layer (Progressive Clip Mask) */}
          <Animated.View style={[styles.maskContainer, { width: maskWidth }]}>
            <Image
              source={require('../../../assets/logo-transparent.png')}
              style={{ width: LOGO_WIDTH, height: LOGO_HEIGHT }}
              resizeMode="contain"
            />
          </Animated.View>

        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    borderRadius: (SCREEN_WIDTH * 0.85) / 2,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 80,
    shadowOpacity: 0.5,
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#FFE4A0',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    shadowOpacity: 0.8,
  },
  logoDollyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoViewport: {
    position: 'relative',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  maskContainer: {
    height: '100%',
    overflow: 'hidden',
  },
});
