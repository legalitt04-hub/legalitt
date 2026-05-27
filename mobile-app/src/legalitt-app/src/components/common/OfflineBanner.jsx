import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetwork } from '../../context/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OfflineBanner() {
  const { isConnected } = useNetwork();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isConnected ? 0 : 1,
      tension: 40,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [isConnected]);

  // Make the height responsive to safe area insets
  const bannerHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 36 + insets.top],
  });

  const paddingTopAnim = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, insets.top],
  });

  const opacityAnim = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={[
      styles.banner, 
      { 
        height: bannerHeight,
        opacity: opacityAnim,
        paddingTop: paddingTopAnim,
      }
    ]}>
      <View style={styles.content}>
        <Ionicons name="cloud-offline-outline" size={15} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.text}>Offline Mode • Using cached data</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    backgroundColor: '#E11D48', // Elegant red rose color
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    width: '100%',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
