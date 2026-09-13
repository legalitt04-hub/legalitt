import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SkeletonBlock = ({ width, height, borderRadius = 4, style }) => {
  const animatedValue = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB', // Tailwind gray-200
          opacity: animatedValue,
        },
        style,
      ]}
    />
  );
};

export default function SkeletonLoader({ type = 'card', count = 3 }) {
  const skeletons = Array(count).fill(0);

  if (type === 'card') {
    return (
      <View style={styles.listContainer}>
        {skeletons.map((_, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.row}>
              <SkeletonBlock width={46} height={46} borderRadius={23} style={{ marginRight: 12 }} />
              <View style={{ flex: 1, gap: 8 }}>
                <SkeletonBlock width="60%" height={16} />
                <SkeletonBlock width="40%" height={12} />
              </View>
            </View>
            <SkeletonBlock width="100%" height={36} borderRadius={10} style={{ marginTop: 14 }} />
          </View>
        ))}
      </View>
    );
  }

  if (type === 'clientRow') {
    return (
      <View style={styles.listContainer}>
        {skeletons.map((_, index) => (
          <View key={index} style={styles.clientCard}>
            <View style={styles.row}>
              <SkeletonBlock width={54} height={54} borderRadius={27} style={{ marginRight: 14 }} />
              <View style={{ flex: 1, gap: 8 }}>
                <SkeletonBlock width="50%" height={16} />
                <SkeletonBlock width="70%" height={12} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 20, marginVertical: 14 }}>
              <SkeletonBlock width={40} height={12} />
              <SkeletonBlock width={40} height={12} />
              <SkeletonBlock width={40} height={12} />
            </View>
            <SkeletonBlock width="100%" height={40} borderRadius={12} />
          </View>
        ))}
      </View>
    );
  }

  if (type === 'statsGroup') {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        {Array(2).fill(0).map((_, index) => (
          <SkeletonBlock key={index} width={(width - 44) / 2} height={110} borderRadius={20} />
        ))}
        <SkeletonBlock width="100%" height={110} borderRadius={20} />
      </View>
    );
  }

  if (type === 'earnings') {
    return (
      <View style={styles.card}>
        <SkeletonBlock width="40%" height={20} style={{ marginBottom: 16 }} />
        <SkeletonBlock width="100%" height={100} borderRadius={16} />
      </View>
    );
  }

  // Fallback default block
  return (
    <View style={styles.listContainer}>
      {skeletons.map((_, index) => (
        <SkeletonBlock key={index} width="100%" height={80} borderRadius={12} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  clientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0ECE7',
  }
});
