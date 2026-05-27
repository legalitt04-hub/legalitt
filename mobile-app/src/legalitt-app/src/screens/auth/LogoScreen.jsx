import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, Easing } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

// Legalitt Shield Logo (matches your design)
const ShieldLogo = ({ size = 120 }) => {
  const scale = size / 100; // Base size is 100
  
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <G transform={`scale(${scale})`}>
        {/* Shield background */}
        <Path
          d="M50 10 L85 25 L85 55 Q85 75 50 90 Q15 75 15 55 L15 25 Z"
          fill={COLORS.primary || '#14B8A6'}
        />
        {/* Scale of Justice */}
        <Path
          d="M45 35 L55 35 M50 35 L50 60 M35 40 L45 40 L40 50 L30 50 Z M55 40 L65 40 L70 50 L60 50 Z M40 65 L60 65"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="white"
          fillOpacity="0.9"
        />
      </G>
    </Svg>
  );
};

export default function LogoScreen({ navigation }) {
  // Logo animations
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  
  // Letter animations (one for each letter in "Legalitt")
  const letterAnims = useRef(
    'Legalitt'.split('').map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
      scale: new Animated.Value(0.5),
    }))
  ).current;

  // Tagline animation
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    StatusBar.setBackgroundColor('#FCFBF8');

    // Professional animation sequence
    Animated.sequence([
      // 1. Logo appears with smooth zoom and rotation (800ms)
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),

      // Small pause
      Animated.delay(200),

      // 2. Letters appear one by one (stagger: 80ms each, total ~640ms for 8 letters)
      Animated.stagger(
        80,
        letterAnims.map((anim) =>
          Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 400,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.spring(anim.translateY, {
              toValue: 0,
              friction: 7,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.spring(anim.scale, {
              toValue: 1,
              friction: 6,
              tension: 50,
              useNativeDriver: true,
            }),
          ])
        )
      ),

      // Small pause after letters
      Animated.delay(300),

      // 3. Tagline slides up and fades in (500ms)
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(taglineSlide, {
          toValue: 0,
          friction: 9,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),

      // Hold the complete screen for a moment
      Animated.delay(600),

    ]).start(() => {
      // Navigate to RoleSelect
      // Total time: 800 + 200 + 640 + 300 + 500 + 600 = ~3040ms (~3s)
      navigation.replace('RoleSelect');
    });
  }, [navigation]);

  const logoRotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFBF8" />

      <View style={styles.content}>
        {/* Logo with zoom + rotate animation */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [
              { scale: logoScale },
              { rotate: logoRotateInterpolate },
            ],
          }}
        >
          <ShieldLogo size={140} />
        </Animated.View>

        {/* "Legalitt" - Letter by letter reveal */}
        <View style={styles.titleContainer}>
          {'Legalitt'.split('').map((letter, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: letterAnims[index].opacity,
                transform: [
                  { translateY: letterAnims[index].translateY },
                  { scale: letterAnims[index].scale },
                ],
              }}
            >
              <Text style={styles.letter}>{letter}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Tagline with slide up animation */}
        <Animated.View
          style={{
            opacity: taglineOpacity,
            transform: [{ translateY: taglineSlide }],
            marginTop: 24,
          }}
        >
          <Text style={styles.tagline}>
            Justice, simplified.{'\n'}
            Connect with verified advocates anytime.
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFBF8',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    marginTop: 32,
    height: 50,
    alignItems: 'center',
  },
  letter: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary || '#14B8A6',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
});
