import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Animated, Dimensions,
  TouchableOpacity, StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';
import Button from '../../components/common/Button';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Find Verified Advocates Nearby',
    subtitle: 'Connect with trusted, verified advocates around you. Chat, call, or book consultations easily.',
    emoji: '👨‍⚖️',
    bg: '#fff',
  },
  {
    id: '2',
    title: 'AI Legal Assistant & Document Storage',
    subtitle: 'Ask legal questions anytime. Upload, save, and manage your documents securely with AI support.',
    emoji: '🤖',
    bg: '#fff',
  },
  {
    id: '3',
    title: 'Easy Case & Document Handling',
    subtitle: 'Secure document handling with seamless case, chat, and update management.',
    emoji: '📄',
    bg: '#fff',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('LoginRegister');
    }
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      {/* Illustration area */}
      <View style={styles.illustrationArea}>
        <View style={styles.illustrationCircle}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 20, 8], extrapolate: 'clamp' });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });
          return (
            <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity }]} />
          );
        })}
      </View>

      {/* Button */}
      <View style={styles.buttonArea}>
        <Button
          title="Get Started"
          onPress={handleNext}
          style={{ marginHorizontal: SIZES.screenPadding }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  slide: { width, flex: 1, alignItems: 'center' },
  illustrationArea: {
    flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center',
    paddingTop: 60,
  },
  illustrationCircle: {
    width: width * 0.7, height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 100 },
  content: { paddingHorizontal: SIZES.screenPadding, paddingBottom: 20, alignItems: 'center' },
  title: {
    fontSize: SIZES.heading, fontWeight: '800', color: COLORS.primary,
    textAlign: 'center', lineHeight: 34,
  },
  subtitle: {
    fontSize: SIZES.body, color: COLORS.textSecondary, textAlign: 'center',
    marginTop: 12, lineHeight: 22,
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  dot: { height: 8, borderRadius: 4, backgroundColor: COLORS.secondary, marginHorizontal: 4 },
  buttonArea: { paddingBottom: 40, paddingHorizontal: SIZES.screenPadding },
  getStartedBtn: {
    backgroundColor: '#1a2e6b',
    borderRadius: 32,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SIZES.screenPadding,
  },
  getStartedBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default OnboardingScreen;
