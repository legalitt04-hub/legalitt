import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const MenuItem = ({ icon, label, desc, onPress, danger = false }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
      <Ionicons name={icon} size={22} color={danger ? COLORS.error : COLORS.primary} />
    </View>
    <View style={styles.menuText}>
      <Text style={[styles.menuLabel, danger && { color: COLORS.error }]}>{label}</Text>
      {desc && <Text style={styles.menuDesc}>{desc}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color={COLORS.primary} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil" size={14} color={COLORS.primary} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <MenuItem
            icon="chatbubbles-outline"
            label="My Chats"
            desc="All conversations with advocates"
            onPress={() => navigation.navigate('ChatList')}
          />
          <MenuItem
            icon="document-text-outline"
            label="My Requests"
            desc="Status and Report"
            onPress={() => navigation.navigate('MyBookings')}
          />
          <MenuItem
            icon="bookmark-outline"
            label="Saved Advocates"
            desc="Users can bookmark lawyers"
            onPress={() => {}}
          />
          <MenuItem
            icon="settings-outline"
            label="Settings"
            desc="Language, notification & Privacy"
            onPress={() => {}}
          />
          <MenuItem
            icon="card-outline"
            label="Payments"
            desc="Consultation Payments & invoice"
            onPress={() => navigation.navigate('MyBookings')}
          />
          <MenuItem
            icon="power-outline"
            label="Logout"
            onPress={handleLogout}
            danger
          />
        </View>

        {/* App version */}
        <Text style={styles.version}>Legalitt v1.0.0 • Made in India 🇮🇳</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundGrey },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding, paddingTop: 52, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border,
  },
  backBtn: { width: 40, padding: 4 },
  headerTitle: { fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary },
  content: { paddingBottom: 100 },
  avatarSection: { backgroundColor: COLORS.backgroundGrey, alignItems: 'center', paddingVertical: 32 },
  avatarWrap: { marginBottom: 12 },
  avatar: { width: SIZES.avatarXl, height: SIZES.avatarXl, borderRadius: SIZES.avatarXl / 2 },
  avatarPlaceholder: {
    width: SIZES.avatarXl, height: SIZES.avatarXl, borderRadius: SIZES.avatarXl / 2,
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  userName: { fontSize: SIZES.heading, fontWeight: '800', color: COLORS.textPrimary },
  userEmail: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: 4 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', marginTop: 12,
    backgroundColor: COLORS.primaryLight, borderRadius: SIZES.radiusFull,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  editBtnText: { color: COLORS.primary, fontWeight: '700', marginLeft: 6 },
  menuSection: { backgroundColor: '#fff', marginTop: 4 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.screenPadding, paddingVertical: SIZES.lg,
    borderBottomWidth: 1, borderColor: COLORS.borderLight,
  },
  menuIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
    marginRight: SIZES.md,
  },
  menuIconDanger: { backgroundColor: '#fef2f2' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary },
  menuDesc: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginTop: 2 },
  version: { textAlign: 'center', fontSize: SIZES.caption, color: COLORS.textMuted, marginTop: 24, paddingBottom: 20 },
});

export default ProfileScreen;
