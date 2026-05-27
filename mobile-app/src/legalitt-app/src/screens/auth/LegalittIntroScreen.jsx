import React, { useEffect } from 'react';
import { View, Animated, StyleSheet, Text, Image, StatusBar } from 'react-native';

export default function LegalittIntroScreen({ navigation }) {
  const logoScale = React.useRef(new Animated.Value(0.3)).current;
  const logoOpacity = React.useRef(new Animated.Value(0)).current;
  const textOpacity = React.useRef(new Animated.Value(0)).current;
  const textSlide = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Shield logo grows and fades in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      // 2. Hold for a moment
      Animated.delay(400),

      // 3. "Legalitt" text slides in and fades in
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(textSlide, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),

      // 4. Hold the complete logo
      Animated.delay(1200),

      // 5. Navigate to next screen
    ]).start(() => {
      navigation?.replace('RoleSelect');
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <View style={styles.logoContainer}>
        {/* Shield Logo */}
        <Animated.View
          style={{
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          }}
        >
          <Image
            source={require('../../../assets/shield-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* "Legalitt" Text - using image from Figma */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateX: textSlide }],
            marginLeft: 16,
          }}
        >
          <Image
            source={require('../../../assets/legalitt-text.png')}
            style={styles.textImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
  },
  textImage: {
    width: 140,
    height: 50,
  },
});
