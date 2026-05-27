import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import SafeScreen from '../../components/SafeScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

export default function HomeScreen({ navigation }) {
  // Mock featured advocate data
  const featured = {
    id: '1',
    name: 'Adv. Rajesh Kumar',
    avatar: 'https://i.pravatar.cc/150?img=12',
    title: 'Corporate Lawyer',
    experience: 15,
    rating: 4.8,
    reviews: 124,
    callRate: 50,
  };

  const quickActions = [
    { 
      id: '1', 
      icon: 'location-outline', 
      title: 'Find Nearby Advocates', 
      subtitle: 'You Can Find Advocates Nearby', 
      cta: 'Open', 
      screen: 'Map' 
    },
    { 
      id: '2', 
      icon: 'sparkles-outline', 
      title: 'AI Legal Assistant', 
      subtitle: 'Ask Law-related Questions', 
      cta: 'Chat with AI', 
      screen: 'AI' 
    },
    { 
      id: '3', 
      icon: 'document-text-outline', 
      title: 'FIR Draft Generator', 
      subtitle: 'Generate FIR Drafts Easily', 
      cta: 'Generate', 
      screen: 'FIR' 
    },
    { 
      id: '4', 
      icon: 'calendar-outline', 
      title: 'My Bookings', 
      subtitle: 'Track Your Consultations', 
      cta: 'View', 
      screen: 'MyBookings' 
    },
  ];

  return (
    <SafeScreen backgroundColor="#F9FAFB" barStyle="dark-content">
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>S</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.userName}>Suresh</Text>
            </View>
          </View>
          
          <View style={styles.headerIcons}>
            <IconButton onPress={() => navigation.navigate('Chat')}>
              <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
            </IconButton>
            <IconButton onPress={() => {}}>
              <Ionicons name="notifications-outline" size={18} color="#6B7280" />
            </IconButton>
            <IconButton onPress={() => {}}>
              <Ionicons name="heart-outline" size={18} color="#6B7280" />
            </IconButton>
          </View>
        </View>

        {/* AI Hero Card */}
        <TouchableOpacity 
          style={styles.aiHero}
          onPress={() => navigation.navigate('AI')}
          activeOpacity={0.9}
        >
          <View style={styles.aiHeroContent}>
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.aiText}>
              <Text style={styles.aiTitle}>Chat With AI Legal Assistant</Text>
              <Text style={styles.aiSubtitle}>Get instant legal guidance</Text>
              <View style={styles.aiButton}>
                <Text style={styles.aiButtonText}>Chat with AI</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
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

        {/* Featured Advocate Card */}
        <TouchableOpacity 
          style={styles.featuredCard}
          onPress={() => navigation.navigate('AdvocateProfile', { advocateId: featured.id })}
          activeOpacity={0.7}
        >
          <View style={styles.featuredHeader}>
            <Image 
              source={{ uri: featured.avatar }}
              style={styles.advocateAvatar}
            />
            <View style={styles.advocateInfo}>
              <View style={styles.advocateNameRow}>
                <Text style={styles.advocateName}>{featured.name}</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedCheck}>✓</Text>
                </View>
                <TouchableOpacity style={styles.bookmarkIcon}>
                  <Ionicons name="bookmark-outline" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <Text style={styles.advocateTitle}>
                {featured.title} of {featured.experience} year of experience
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text style={styles.ratingText}>{featured.rating}</Text>
                <Text style={styles.reviewCount}>({featured.reviews} reviews)</Text>
              </View>
            </View>
          </View>

          <View style={styles.consultationBar}>
            <View style={styles.rateInfo}>
              <Ionicons name="call" size={14} color={COLORS.primary} />
              <Text style={styles.rateText}>₹{featured.callRate}/per min</Text>
            </View>
            <View style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book Consultation</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Nearby Advocates Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Advocates</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Map')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Advocate List Cards */}
        {nearbyAdvocates.map((advocate) => (
          <AdvocateCard
            key={advocate.id}
            advocate={advocate}
            onViewProfile={() => navigation.navigate('AdvocateProfile', { advocateId: advocate.id })}
            onBookNow={() => navigation.navigate('Payment', { advocateId: advocate.id })}
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeScreen>
  );
}

function IconButton({ children, onPress }) {
  return (
    <TouchableOpacity 
      style={styles.iconButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
}

function QuickCard({ icon, title, subtitle, cta, onPress }) {
  return (
    <TouchableOpacity 
      style={styles.quickCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: isSmallDevice ? 20 : 24,
    paddingBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6F7F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  greeting: {
    fontSize: 12,
    color: '#6B7280',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiHero: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  aiHeroContent: {
    flexDirection: 'row',
    gap: 12,
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiText: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  aiButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  quickCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F7F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
    lineHeight: 16,
  },
  quickSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 14,
    marginBottom: 12,
  },
  quickCta: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  quickCtaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  featuredHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  advocateAvatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  advocateInfo: {
    flex: 1,
  },
  advocateNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  advocateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheck: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bookmarkIcon: {
    marginLeft: 'auto',
  },
  advocateTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0F172A',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  consultationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E6F7F8',
    borderRadius: 12,
    padding: 10,
  },
  rateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rateText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bookButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
