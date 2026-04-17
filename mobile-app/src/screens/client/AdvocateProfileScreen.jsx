import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, StatusBar, Modal, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { advocateAPI } from '../../services/api';
import Button from '../../components/common/Button';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const TABS = ['Overview', 'Experience', 'Reviews'];

const AdvocateProfileScreen = ({ route, navigation }) => {
  const { advocateId, openBooking } = route.params;
  const [advocate, setAdvocate] = useState(null);
  const [tab, setTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);

  useEffect(() => {
    advocateAPI.getOne(advocateId).then(({ data }) => {
      setAdvocate(data.data);
      if (openBooking) setBookingModal(true);
    }).finally(() => setLoading(false));
  }, [advocateId]);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!advocate) return null;

  const user = advocate.user || {};
  const specs = (advocate.specializations || []).join(' • ');

  const renderTabContent = () => {
    if (tab === 'Overview') return (
      <View style={styles.tabContent}>
        <Text style={styles.bio}>{advocate.about || 'Experienced advocate with years of legal practice.'}</Text>
        <Text style={styles.infoTitle}>{advocate.experience} Years Of Experience</Text>
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Call Charges:</Text>
            <Text style={styles.infoValue}>₹40/min</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.infoItemText}>{advocate.location?.address?.city}, {advocate.location?.address?.state}</Text>
          </View>
          <Text style={styles.availText}>{user.name} is Available To Take Your Call Just Click</Text>
          <TouchableOpacity style={styles.msgBtn} onPress={() => navigation.navigate('Chat', { advocateId })}>
            <Ionicons name="chatbubbles" size={18} color={COLORS.primary} />
            <Text style={styles.msgBtnText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    if (tab === 'Experience') return (
      <View style={styles.tabContent}>
        <Text style={styles.expHead}>Professional Background</Text>
        {[`${advocate.experience}+ Years of Legal Practice`, '500+ Cases Handled', 'Representation in District & High Courts', 'Expertise in Property Title Verification'].map((item, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
        <Text style={styles.expHead}>Core Practice Areas</Text>
        {(advocate.specializations || []).map((s, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{s}</Text>
          </View>
        ))}
        <Text style={styles.expHead}>Languages</Text>
        <Text style={styles.bio}>{(advocate.languages || ['Hindi', 'English']).join(', ')}</Text>
      </View>
    );

    if (tab === 'Reviews') return (
      <View style={styles.tabContent}>
        <View style={styles.ratingOverview}>
          <View>
            <Text style={styles.bigRating}>{advocate.rating?.average || '4.9'}</Text>
            <Text style={styles.ratingBase}>Based on {advocate.rating?.count || 559} reviews</Text>
            <View style={styles.starsRow}>
              {[1,2,3,4,5].map(i => <Ionicons key={i} name="star" size={18} color={COLORS.star} />)}
            </View>
          </View>
          <View style={styles.ratingBars}>
            {[5,4,3,2,1].map((star) => (
              <View key={star} style={styles.ratingBarRow}>
                <Text style={styles.ratingBarLabel}>{star}</Text>
                <View style={styles.ratingBarBg}>
                  <View style={[styles.ratingBarFill, { width: star === 5 ? '80%' : `${star * 10}%` }]} />
                </View>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.expHead}>Useful Reviews</Text>
        {(advocate.reviews || []).map((r, i) => (
          <View key={i} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{(r.client?.name || 'U')[0]}</Text>
              </View>
              <Text style={styles.reviewName}>{r.client?.name || 'User'}</Text>
            </View>
            <View style={styles.starsRow}>
              {Array.from({ length: r.rating || 5 }).map((_, i) => <Ionicons key={i} name="star" size={14} color={COLORS.star} />)}
            </View>
            <Text style={styles.reviewText}>{r.comment || 'Good'}</Text>
            <Text style={styles.reviewDate}>{new Date(r.createdAt).toDateString()}</Text>
          </View>
        ))}
        {(!advocate.reviews?.length) && <Text style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 20 }}>No reviews yet</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="chatbubble-outline" size={22} color={COLORS.textPrimary} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="heart-outline" size={22} color={COLORS.textPrimary} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarWrap}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.profileAvatar} />
            ) : (
              <View style={[styles.profileAvatar, { backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 40, fontWeight: '700', color: COLORS.primary }}>{(user.name || 'A')[0]}</Text>
              </View>
            )}
            <View style={[styles.onlineDot2, { backgroundColor: advocate.isOnline ? COLORS.online : COLORS.offline }]} />
            <View style={[styles.onlineBadge2, { backgroundColor: advocate.isOnline ? '#dcfce7' : '#f3f4f6' }]}>
              <Text style={{ fontSize: 10, color: advocate.isOnline ? '#15803d' : COLORS.textMuted, fontWeight: '600' }}>
                {advocate.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.profileName}>{user.name}</Text>
              {advocate.isVerified && <Ionicons name="checkmark-circle" size={18} color="#2563eb" style={{ marginLeft: 4 }} />}
            </View>
            <Text style={styles.profileDesig}>Senior Advocate</Text>
            <Text style={styles.profileSpecs}>{specs}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={COLORS.star} />
              <Text style={styles.ratingTxt}>{advocate.rating?.average} ({advocate.rating?.count} review)</Text>
            </View>
            <Text style={styles.profileFee}>₹{advocate.consultationFee}/ Consultation</Text>
            <TouchableOpacity style={styles.availBadge}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={styles.availBadgeText}>Available</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {TABS.map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={styles.tabBtn}>
              <Text style={[styles.tabTxt, tab === t && styles.tabTxtActive]}>{t}</Text>
              {tab === t && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {renderTabContent()}
      </ScrollView>

      {/* Book consultation button */}
      <View style={styles.footer}>
        <Button title="Book Consultation" onPress={() => setBookingModal(true)} />
      </View>

      {/* Booking modal */}
      <Modal visible={bookingModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setBookingModal(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Consultation To Start Chat</Text>
              <TouchableOpacity onPress={() => setBookingModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>To ensure serious inquiries and professional time commitment, consultation must be booked before messaging the advocate.</Text>
            <View style={styles.modalPrice}>
              <Text style={styles.modalPriceText}>₹{advocate.consultationFee}/<Text style={{ fontWeight: '400', color: COLORS.textSecondary }}> Consultation</Text></Text>
            </View>
            <Text style={styles.includesLabel}>Includes:</Text>
            {['Direct in-app chat access', 'Document sharing', 'Case discussion', 'Secure communication'].map((item) => (
              <View key={item} style={styles.includeRow}>
                <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                <Text style={styles.includeText}>{item}</Text>
              </View>
            ))}
            <View style={styles.modalBtns}>
              <Button title="Cancel" variant="outline" onPress={() => setBookingModal(false)} style={{ flex: 1, marginRight: 12 }} />
              <Button title="Book Consultation" onPress={() => {
                setBookingModal(false);
                navigation.navigate('Booking', { advocateId, advocateName: user.name, fee: advocate.consultationFee });
              }} style={{ flex: 1 }} />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.screenPadding, paddingTop: 52, paddingBottom: 8 },
  backBtn: { padding: 4 },
  topBarIcons: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6 },
  profileHeader: { flexDirection: 'row', padding: SIZES.screenPadding },
  profileAvatarWrap: { position: 'relative', marginRight: SIZES.md },
  profileAvatar: { width: 100, height: 120, borderRadius: SIZES.radiusMd },
  onlineDot2: { position: 'absolute', bottom: 36, left: 6, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#fff' },
  onlineBadge2: { position: 'absolute', bottom: 12, left: 0, right: 0, borderRadius: 4, paddingVertical: 2, alignItems: 'center' },
  profileInfo: { flex: 1, justifyContent: 'center' },
  profileName: { fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary },
  profileDesig: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginTop: 2 },
  profileSpecs: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingTxt: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginLeft: 4 },
  profileFee: { fontSize: SIZES.subtitle, fontWeight: '700', color: COLORS.textPrimary, marginTop: 4 },
  availBadge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.success, borderRadius: SIZES.radiusFull, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 6 },
  availBadgeText: { fontSize: SIZES.caption, color: COLORS.success, marginLeft: 4, fontWeight: '600' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border, marginHorizontal: SIZES.screenPadding },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabTxt: { fontSize: SIZES.body, color: COLORS.textSecondary, fontWeight: '500' },
  tabTxtActive: { color: COLORS.textPrimary, fontWeight: '700' },
  tabUnderline: { position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 2.5, backgroundColor: COLORS.textPrimary, borderRadius: 2 },
  tabContent: { padding: SIZES.screenPadding },
  bio: { fontSize: SIZES.body, color: COLORS.textSecondary, lineHeight: 22 },
  infoTitle: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16, marginBottom: 8 },
  infoBox: { borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radiusMd, padding: SIZES.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: SIZES.body, color: COLORS.textSecondary },
  infoValue: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoItemText: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginLeft: 4 },
  availText: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginBottom: 8 },
  msgBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radiusFull, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start' },
  msgBtnText: { marginLeft: 6, color: COLORS.primary, fontWeight: '600' },
  expHead: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary, marginTop: 16, marginBottom: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 6, marginRight: 10 },
  bulletText: { flex: 1, fontSize: SIZES.body, color: COLORS.textSecondary, lineHeight: 22 },
  ratingOverview: { flexDirection: 'row', marginBottom: 20 },
  bigRating: { fontSize: 48, fontWeight: '900', color: COLORS.textPrimary },
  ratingBase: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  starsRow: { flexDirection: 'row', marginTop: 4 },
  ratingBars: { flex: 1, marginLeft: 20 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ratingBarLabel: { fontSize: SIZES.caption, color: COLORS.textSecondary, width: 12, marginRight: 6 },
  ratingBarBg: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  ratingBarFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: 4 },
  reviewCard: { borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radiusMd, padding: SIZES.md, marginBottom: SIZES.md },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  reviewName: { fontWeight: '700', fontSize: SIZES.body, color: COLORS.textPrimary },
  reviewText: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: 6, lineHeight: 20 },
  reviewDate: { fontSize: SIZES.caption, color: COLORS.textMuted, marginTop: 4 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: SIZES.screenPadding, paddingBottom: 32, borderTopWidth: 1, borderColor: COLORS.border },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SIZES.screenPadding, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: SIZES.subtitle, fontWeight: '700', color: COLORS.textPrimary, flex: 1, marginRight: 8 },
  modalDesc: { fontSize: SIZES.caption, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 16 },
  modalPrice: { borderBottomWidth: 1, borderColor: COLORS.border, paddingBottom: 12, marginBottom: 12 },
  modalPriceText: { fontSize: SIZES.subtitle, fontWeight: '700', color: COLORS.textPrimary },
  includesLabel: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: 8 },
  includeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  includeText: { marginLeft: 8, fontSize: SIZES.body, color: COLORS.textPrimary },
  modalBtns: { flexDirection: 'row', marginTop: 20 },
});

export default AdvocateProfileScreen;
