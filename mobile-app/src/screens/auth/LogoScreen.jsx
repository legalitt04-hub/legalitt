import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, Easing } from 'react-native';
import Svg, { Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

// Legalitt Hexagon Ring Logo
const ShieldLogo = ({ size = 120 }) => {
  const scale = size / 100;
  const R = 28;
  const r = 12;
  const angles = [270, 330, 30, 90, 150, 210];

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFE4A0" />
          <Stop offset="50%" stopColor="#E5B25D" />
          <Stop offset="100%" stopColor="#A3742C" />
        </LinearGradient>
      </Defs>
      <G transform={`scale(${scale})`}>
        {angles.map((angle, idx) => {
          const rad = (angle * Math.PI) / 180;
          const cx = 50 + R * Math.cos(rad);
          const cy = 50 + R * Math.sin(rad);
          return (
            <Path
              key={idx}
              d={`
                M ${cx} ${cy - r}
                L ${cx + r * 0.866} ${cy - r * 0.5}
                L ${cx + r * 0.866} ${cy + r * 0.5}
                L ${cx} ${cy + r}
                L ${cx - r * 0.866} ${cy + r * 0.5}
                L ${cx - r * 0.866} ${cy - r * 0.5}
                Z
              `}
              fill="url(#goldGradient)"
            />
          );
        })}
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
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#090D16');

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
      <StatusBar barStyle="light-content" backgroundColor="#090D16" />

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
    backgroundColor: '#090D16',
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
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
});
