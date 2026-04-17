import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdvocateBookings } from '../../hooks/useBookings';
import BookingCard from '../../components/booking/BookingCard';
import { COLORS, SIZES } from '../../constants/theme';

const CasesScreen = ({ navigation }) => {
  const { bookings, loading, updateStatus } = useAdvocateBookings();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.title}>Today Cases</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('ChatList')} style={styles.iconBtn}>
            <Ionicons name="chatbubble-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.primary} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: SIZES.screenPadding, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>⚖️</Text>
              <Text style={styles.emptyText}>No cases today</Text>
            </View>
          }
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              variant="advocate"
              showActions
              onAction={updateStatus}
              onPress={() => navigation.navigate('CaseDetail', { booking: item })}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.screenPadding, paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff' },
  title: { fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary },
  headerRight: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: 12 },
});

export default CasesScreen;
