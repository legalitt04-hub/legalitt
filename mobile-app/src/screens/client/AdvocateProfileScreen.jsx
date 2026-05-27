// screens/client/AdvocateProfileScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const AdvocateProfileScreen = ({ navigation, route }) => {
  const advocateId = route?.params?.id;
  const [activeTab, setActiveTab] = useState('Overview');

  // Mock data - replace with actual API data
  const advocate = {
    id: advocateId,
    name: 'Ajay Chohan',
    avatar: 'https://i.pravatar.cc/150?img=12',
    title: 'Senior Advocate',
    tags: ['Criminal', 'Civil', 'Property'],
    rating: 4.9,
    reviews: 559,
    fee: 2000,
    callRate: 600,
    experience: 12,
    city: 'Indore',
    online: true,
    verified: true,
    available: true,
  };

  const tabs = ['Overview', 'Experience', 'Reviews'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="chatbubble-outline" size={14} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={14} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="heart-outline" size={14} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: advocate.avatar }} style={styles.avatar} />
            {advocate.online && (
              <View style={styles.onlineBadge}>
                <Text style={styles.onlineBadgeText}>● Online</Text>
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{advocate.name}</Text>
              {advocate.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={9} color="#FFFFFF" />
                </View>
              )}
            </View>

            <Text style={styles.title}>{advocate.title}</Text>
            <Text style={styles.tags}>{advocate.tags.join(' · ')}</Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FCD34D" />
              <Text style={styles.ratingText}>{advocate.rating}</Text>
              <Text style={styles.reviewsText}>({advocate.reviews} reviews)</Text>
            </View>

            <Text style={styles.feeText}>
              <Text style={styles.feeBold}>₹{advocate.fee}/</Text> Consultation
            </Text>

            {advocate.available && (
              <View style={styles.availableBadge}>
                <View style={styles.availableDot} />
                <Text style={styles.availableText}>Available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'Overview' && <OverviewTab advocate={advocate} />}
          {activeTab === 'Experience' && <ExperienceTab />}
          {activeTab === 'Reviews' && <ReviewsTab advocate={advocate} />}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Book Consultation Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('Booking', { advocateId: advocate.id })}
        >
          <Text style={styles.bookButtonText}>Book Consultation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Overview Tab Component
const OverviewTab = ({ advocate }) => (
  <View style={styles.overviewContainer}>
    <Text style={styles.description}>
      {advocate.name} is a Senior Advocate with over {advocate.experience} years of
      experience in Criminal, Civil, and Property law. Known for a strategic legal
      approach, thorough case preparation, and client-focused guidance.
    </Text>

    <View style={styles.experienceSection}>
      <Text style={styles.sectionTitle}>
        {advocate.experience} Years Of Experience
      </Text>

      <View style={styles.callCard}>
        <View style={styles.callCardRow}>
          <Text style={styles.callCardLabel}>Call Charges:</Text>
          <Text style={styles.callCardValue}>₹{advocate.callRate}/min</Text>
        </View>

        <Text style={styles.callCardCity}>● {advocate.city}</Text>
        <Text style={styles.callCardInfo}>
          {advocate.name} is available to take your call. Just click.
        </Text>

        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="call-outline" size={14} color={COLORS.primary} />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// Experience Tab Component
const ExperienceTab = () => (
  <View style={styles.experienceContainer}>
    <Section
      title="Professional Background"
      items={[
        '12+ Years of Legal Practice',
        '500+ Criminal, Civil & Property Cases Handled',
        'Representation in District & High Courts',
        'Expertise in Property Title Verification & Legal Due Diligence',
      ]}
    />
    <Section
      title="Core Practice Areas"
      items={[
        'Criminal Defense & Bail Matters',
        'Civil Disputes & Recovery Cases',
        'Property Documentation & Title Clearance',
        'Legal Advisory & Consultation Services',
      ]}
    />
    <Section
      title="Professional Approach"
      items={[
        'Strategic Case Preparation',
        'Client-Focused Legal Guidance',
        'Confidential & Ethical Practice',
        'Transparent Consultation Process',
      ]}
    />
  </View>
);

const Section = ({ title, items }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionItems}>
      {items.map((item, index) => (
        <Text key={index} style={styles.sectionItem}>
          • {item}
        </Text>
      ))}
    </View>
  </View>
);

// Reviews Tab Component
const ReviewsTab = ({ advocate }) => (
  <View style={styles.reviewsContainer}>
    {/* Rating Summary */}
    <View style={styles.ratingSummary}>
      <View style={styles.ratingLeft}>
        <Text style={styles.ratingBig}>{advocate.rating}</Text>
        <Text style={styles.ratingSubtext}>Based on {advocate.reviews} reviews</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Ionicons key={i} name="star" size={12} color="#10B981" />
          ))}
        </View>
      </View>

      <View style={styles.ratingBars}>
        {[
          { stars: 5, percent: 88 },
          { stars: 4, percent: 40 },
          { stars: 3, percent: 15 },
          { stars: 2, percent: 8 },
          { stars: 1, percent: 3 },
        ].map((item) => (
          <View key={item.stars} style={styles.ratingBarRow}>
            <Text style={styles.ratingBarLabel}>{item.stars}</Text>
            <View style={styles.ratingBarTrack}>
              <View
                style={[styles.ratingBarFill, { width: `${item.percent}%` }]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>

    {/* Reviews List */}
    <View style={styles.reviewsList}>
      <Text style={styles.reviewsListTitle}>Useful Reviews</Text>

      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?img=22' }}
            style={styles.reviewAvatar}
          />
          <Text style={styles.reviewName}>Vaibhav Sharma</Text>
        </View>
        <Text style={styles.reviewText}>Good</Text>
        <Text style={styles.reviewDate}>Sat, Jan 12, 2026 10:20 PM</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    transform: [{ translateX: -28 }],
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  onlineBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  tags: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  feeText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  feeBold: {
    fontWeight: '600',
    color: '#1F2937',
  },
  availableBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  availableText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#10B981',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingBottom: 8,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  overviewContainer: {
    gap: 16,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },
  experienceSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  callCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  callCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  callCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  callCardValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  callCardCity: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  callCardInfo: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 12,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  experienceContainer: {
    gap: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionItems: {
    gap: 4,
  },
  sectionItem: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  reviewsContainer: {
    gap: 16,
  },
  ratingSummary: {
    flexDirection: 'row',
    gap: 16,
  },
  ratingLeft: {
    alignItems: 'flex-start',
  },
  ratingBig: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
  },
  ratingSubtext: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingBars: {
    flex: 1,
    gap: 4,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBarLabel: {
    fontSize: 10,
    color: '#6B7280',
    width: 8,
  },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  reviewsList: {
    gap: 8,
  },
  reviewsListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  reviewName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewText: {
    fontSize: 12,
    color: '#1F2937',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 10,
    color: '#6B7280',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AdvocateProfileScreen;
