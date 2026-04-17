import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import { COLORS, SIZES } from '../../constants/theme';

const PaymentSuccessScreen = ({ route, navigation }) => {
  const { bookingId, chatId, advocateName } = route.params || {};
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <View style={styles.body}>
        <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="checkmark" size={72} color="#fff" />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={styles.title}>Consultation Booked Successfully</Text>
          <Text style={styles.subtitle}>You can now start chat with the advocate</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Button
          title="Start Chat"
          onPress={() => navigation.navigate('Chat', { chatId, advocateName })}
          style={{ marginBottom: SIZES.md }}
        />
        <Button
          title="View Details"
          variant="outline"
          onPress={() => navigation.navigate('MyBookings')}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundGrey },
  header: { paddingTop: 52, paddingBottom: 16, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.screenPadding },
  checkCircle: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center',
    marginBottom: SIZES.xxxl,
    shadowColor: '#22c55e', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
  },
  title: { fontSize: SIZES.heading, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: SIZES.sm, textAlign: 'center' },
  footer: { padding: SIZES.screenPadding, paddingBottom: 48 },
});

export default PaymentSuccessScreen;
