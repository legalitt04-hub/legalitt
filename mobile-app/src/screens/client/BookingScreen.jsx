// BookingScreen.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bookingAPI } from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const BookingScreen = ({ route, navigation }) => {
  const { advocateId, advocateName, fee } = route.params || {};
  const [issue, setIssue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!issue.trim() || !date.trim() || !time.trim()) {
      Alert.alert('Required', 'Please fill all fields.'); return;
    }
    setLoading(true);
    try {
      const { data } = await bookingAPI.create({
        advocateId, issue, date,
        timeSlot: { startTime: time, endTime: time },
        type: 'in_person',
      });
      navigation.navigate('Payment', { bookingId: data.data._id, amount: fee, advocateName });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Booking failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>Book Consultation</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: SIZES.screenPadding, paddingBottom: 100 }}>
        <View style={s.advocateInfo}>
          <Ionicons name="person-circle" size={48} color={COLORS.primary} />
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: SIZES.subtitle, fontWeight: '700' }}>{advocateName}</Text>
            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>₹{fee} / Consultation</Text>
          </View>
        </View>
        <Input label="Date (YYYY-MM-DD)" placeholder="e.g. 2025-06-15" value={date} onChangeText={setDate} />
        <Input label="Preferred Time" placeholder="e.g. 10:00 AM" value={time} onChangeText={setTime} />
        <Input label="Describe your legal issue" placeholder="Brief description..." value={issue} onChangeText={setIssue} multiline numberOfLines={4} />
      </ScrollView>
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: SIZES.screenPadding, paddingBottom: 36, backgroundColor: '#fff', borderTopWidth: 1, borderColor: COLORS.border }}>
        <Button title={`Proceed to Pay ₹${fee}`} onPress={handleBook} loading={loading} />
      </View>
    </View>
  );
};
const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.screenPadding, paddingTop: 52, paddingBottom: 12, borderBottomWidth: 1, borderColor: COLORS.border },
  title: { fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary },
  advocateInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight, borderRadius: SIZES.radiusLg, padding: SIZES.lg, marginBottom: SIZES.xl },
});
export default BookingScreen;
