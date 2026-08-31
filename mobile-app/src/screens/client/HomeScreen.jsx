// screens/client/HomeScreen.jsx - Production Ready Layout
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
  Dimensions, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import SafeScreen from '../../components/SafeScreen';
import { useAuth } from '../../context/AuthContext';
import { useChatList } from '../../hooks/useChat';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { chats, refetch } = useChatList();
  const unreadCount = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const [refreshing, setRefreshing] = useState(false);

  const displayName = user?.name || user?.user?.name || 'User';
  const firstName = displayName.split(' ')[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetch();
    });
    return unsubscribe;
  }, [navigation, refetch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  // 4 main feature cards in requested order: Legal Advice, Legal Notice, Property Research, AI Legal Assistant
  const fourMainCards = [
    { id: '1', icon: 'scale-outline', title: 'Legal Advice', subtitle: 'Get Expert Legal Guidance', cta: 'Get Advice', screen: 'LegalAdviceLanding' },
    { id: '2', icon: 'document-text-outline', title: 'Legal Notice', subtitle: 'Create Legal Notice', cta: 'Create', screen: 'AILegalNotice' },
    { id: '3', icon: 'home-outline', title: 'Property Research Report', subtitle: 'Verify Ownership & Records', cta: 'Get Report', screen: 'PropertyResearchLanding' },
    { id: '4', icon: 'sparkles-outline', title: 'AI Legal Assistant', subtitle: 'Instant AI Guidance', cta: 'Chat Now', screen: 'AI' },
  ];

  // More Services list (displayed directly without dropdown)
  const moreServicesList = [
    { id: '5', icon: 'document-text-outline', title: 'FIR Draft Service', subtitle: 'Professional FIR Drafting', screen: 'FIRDraft' },
    { id: '6', icon: 'calendar-outline', title: 'My Bookings', subtitle: 'Track Consultations', screen: 'MyBookings' },
    { id: '7', icon: 'document-attach-outline', title: 'Online Documents Forensic', subtitle: 'Verify Document Authenticity', screen: 'DocumentForensic' },
  ];

  return (
    <SafeScreen backgroundColor="#F9FAFB" barStyle="dark-content">
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.userInfo} onPress={() => navigation.navigate('Profile')} activeOpacity={0.7}>
            <Image
              source={{ uri: user?.avatar || user?.user?.avatar || 'https://i.pravatar.cc/150?img=1' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{firstName}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerIcons}>
            <IconButton onPress={() => navigation.navigate('ChatList')}>
              <View style={{ position: 'relative' }}>
                <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
                {unreadCount > 0 && (
                  <View style={styles.badgeDot} />
                )}
              </View>
            </IconButton>
            <IconButton onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={18} color="#6B7280" />
            </IconButton>
          </View>
        </View>

        {/* Hero Card */}
        <TouchableOpacity style={styles.aiHero} onPress={() => navigation.navigate('LegalAdviceLanding')} activeOpacity={0.9}>
          <View style={styles.aiHeroContent}>
            <View style={styles.aiIcon}>
              <Ionicons name="scale-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.aiText}>
              <Text style={styles.aiTitle}>Get Expert Legal Advice Now</Text>
              <Text style={styles.aiSubtitle}>Consult verified legal experts online</Text>
              <View style={styles.aiButton}>
                <Text style={styles.aiButtonText}>Get Advice</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* 4 Main Feature Cards Grid */}
        <View style={styles.quickGrid}>
          {fourMainCards.map((action) => (
            <QuickCard
              key={action.id}
              icon={action.icon}
              title={action.title}
              subtitle={action.subtitle}
              cta={action.cta}
              onPress={() => navigation.navigate(action.screen)}
            />
          ))}
        </View>

        {/* More Services Section (Directly Visible) */}
        <View style={styles.moreServicesSection}>
          <Text style={styles.moreServicesTitle}>More Services</Text>

          <View style={styles.moreServicesDropdownContainer}>
            {moreServicesList.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.moreServiceItemCard}
                onPress={() => navigation.navigate(service.screen)}
                activeOpacity={0.8}
              >
                <View style={styles.moreServiceIconCircle}>
                  <Ionicons name={service.icon} size={20} color={COLORS.primary} />
                </View>
                <View style={styles.moreServiceTextCol}>
                  <Text style={styles.moreServiceItemTitle}>{service.title}</Text>
                  <Text style={styles.moreServiceItemSubtitle}>{service.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeScreen>
  );
}

const QuickCard = ({ icon, title, subtitle, cta, onPress }) => (
  <TouchableOpacity style={styles.quickCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.quickIcon}>
      <Ionicons name={icon} size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.quickTitle}>{title}</Text>
    <Text style={styles.quickSubtitle}>{subtitle}</Text>
    <View style={styles.quickCta}>
      <Text style={styles.quickCtaText}>{cta}</Text>
    </View>
  </TouchableOpacity>
);

const IconButton = ({ children, onPress }) => (
  <TouchableOpacity style={styles.iconButton} onPress={onPress} activeOpacity={0.7}>
    {children}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary },
  greeting: { fontSize: 12, color: '#6B7280' },
  userName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  aiHero: { marginHorizontal: 20, marginBottom: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.primary, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  aiHeroContent: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center' },
  aiText: { flex: 1 },
  aiTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  aiSubtitle: { fontSize: 12, color: 'rgba(255, 255, 255, 0.9)', marginBottom: 12 },
  aiButton: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  aiButtonText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginHorizontal: 20, marginBottom: 16 },
  quickCard: { width: isSmallDevice ? '47%' : '48%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: isSmallDevice ? 14 : 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  quickIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E6F7F8', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickTitle: { fontSize: isSmallDevice ? 12 : 13, fontWeight: '600', color: '#0F172A', marginBottom: 4, lineHeight: 16 },
  quickSubtitle: { fontSize: 11, color: '#6B7280', lineHeight: 14, marginBottom: 12 },
  quickCta: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  quickCtaText: { fontSize: 11, fontWeight: '600', color: '#FFFFFF' },
  badgeDot: { position: 'absolute', right: -4, top: -4, backgroundColor: '#EF4444', borderRadius: 5, width: 10, height: 10, borderWidth: 1.5, borderColor: '#FFFFFF' },
  moreServicesSection: { marginHorizontal: 20, marginBottom: 16 },
  moreServicesTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 12 },
  moreServicesDropdownContainer: { gap: 10 },
  moreServiceItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#E8E2D8' },
  moreServiceIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F4EC', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  moreServiceTextCol: { flex: 1 },
  moreServiceItemTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 2 },
  moreServiceItemSubtitle: { fontSize: 11, color: '#6B7280' },
});
