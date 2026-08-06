import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  Easing,
  Image,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Logo Bounding Dimensions
const LOGO_WIDTH = 260;
const LOGO_HEIGHT = 120;

export default function LogoRevealScreen({ navigation }) {
  // Timeline Animation Drivers
  // 1. Slim Line & Mask Reveal Driver (0.5s - 2.5s)
  const lineAnim = useRef(new Animated.Value(0)).current;

  // 2. Bold Rectangular Bar Driver (2.6s - 3.5s)
  const barAnim = useRef(new Animated.Value(0)).current;
  const barOpacity = useRef(new Animated.Value(0)).current;

  // Ambient Glow Driver
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#07080A');

    // Run Timeline Sequence (Total ~3.5s+)
    Animated.sequence([
      // 0.0s - 0.5s: Matte Black Intro & Ambient Glow Rise
      Animated.timing(glowAnim, {
        toValue: 0.6,
        duration: 500,
        useNativeDriver: false,
      }),

      // 0.5s - 2.5s: STAGE 1 - Slim Yellow Line moves left -> right + Progressive Mask Reveal
      Animated.timing(lineAnim, {
        toValue: 1,
        duration: 2000, // 2.0s duration
        easing: Easing.linear,
        useNativeDriver: false,
      }),

      // Small 100ms pause (2.5s -> 2.6s)
      Animated.delay(100),

      // 2.6s - 3.5s: STAGE 2 - Bold Rectangular Yellow Bar Glossy Sweep
      Animated.parallel([
        Animated.timing(barOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(barAnim, {
          toValue: 1,
          duration: 900, // 0.9s duration (2.6s to 3.5s)
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]),

      // 3.5s: Fade out bold bar on exit
      Animated.timing(barOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),

      // Hold final revealed state
      Animated.delay(800),
    ]).start(() => {
      if (navigation && navigation.replace) {
        navigation.replace('RoleSelect');
      }
    });
  }, [navigation]);

  // Interpolated Values
  // Slim Line Movement (Logo left - 20 to Logo right + 20)
  const lineX = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, LOGO_WIDTH + 20],
  });

  // Reveal Mask Width (0 to LOGO_WIDTH + 20)
  const maskWidth = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, LOGO_WIDTH + 20],
  });

  // Bold Rectangular Bar Movement (Logo left - 60 to Logo right + 60)
  const BOLD_BAR_WIDTH = 45;
  const barX = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-BOLD_BAR_WIDTH - 20, LOGO_WIDTH + 20],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07080A" />

      {/* Ambient Golden Glow Backdrop */}
      <Animated.View
        style={[
          styles.ambientGlow,
          {
            opacity: glowAnim,
          },
        ]}
      />

      {/* Main Logo Container */}
      <View style={styles.logoWrapper}>
        {/* LOGO REVEAL LAYER (Synchronized Clip Mask) */}
        <Animated.View
          style={[
            styles.maskContainer,
            {
              width: maskWidth,
            },
          ]}
        >
          <Image
            source={require('../../../assets/logo-transparent.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* 1. FIRST ELEMENT: SLIM YELLOW LINE (Active 0.5s - 2.5s) */}
        <Animated.View
          style={[
            styles.slimYellowLine,
            {
              transform: [{ translateX: lineX }],
              opacity: lineAnim.interpolate({
                inputRange: [0, 0.01, 0.99, 1],
                outputRange: [0, 1, 1, 0],
              }),
            },
          ]}
        >
          <View style={styles.slimLineCapTop} />
          <View style={styles.slimLineCapBottom} />
        </Animated.View>

        {/* 2. SECOND ELEMENT: BOLD RECTANGULAR YELLOW BAR (Active 2.6s - 3.5s) */}
        <Animated.View
          style={[
            styles.boldRectBar,
            {
              width: BOLD_BAR_WIDTH,
              transform: [{ translateX: barX }],
              opacity: barOpacity,
            },
          ]}
        >
          {/* Specular sheen line down center */}
          <View style={styles.barShineStreak} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080A', // Matte Black
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: (SCREEN_WIDTH * 0.9) / 2,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 60,
  },
  logoWrapper: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    position: 'relative',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  maskContainer: {
    height: LOGO_HEIGHT,
    overflow: 'hidden',
  },
  logoImage: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },
  // Slim Yellow Line Styles
  slimYellowLine: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 2.5,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  slimLineCapTop: {
    position: 'absolute',
    top: 0,
    left: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  slimLineCapBottom: {
    position: 'absolute',
    bottom: 0,
    left: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  // Bold Rectangular Bar Styles
  boldRectBar: {
    position: 'absolute',
    top: -15,
    bottom: -15,
    borderRadius: 5,
    backgroundColor: '#FFD700',
    borderWidth: 1,
    borderColor: '#FFE875',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 16,
    elevation: 10,
  },
  barShineStreak: {
    position: 'absolute',
    left: '25%',
    top: 2,
    bottom: 2,
    width: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
});
