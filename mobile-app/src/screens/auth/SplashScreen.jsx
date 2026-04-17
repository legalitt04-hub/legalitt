// SplashScreen.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { COLORS } from '../../constants/theme';

const SplashScreen = ({ navigation }) => {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    // Animate gavel appearing
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(400),
      Animated.timing(textFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(800),
    ]).start(() => navigation.replace('Onboarding'));
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim }}>
        {/* Gavel icon — SVG-style using Text emojis as stand-in */}
        <Text style={styles.icon}>⚖️</Text>
      </Animated.View>
      <Animated.Text style={[styles.appName, { opacity: textFade }]}>Legalitt</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 80 },
  appName: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 16, letterSpacing: 1 },
});

export default SplashScreen;
