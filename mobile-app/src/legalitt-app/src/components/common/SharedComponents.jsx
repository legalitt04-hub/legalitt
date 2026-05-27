import React from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { getInitials } from '../../utils/helpers';

// ─── LoadingSpinner ───────────────────────────────────────────────────────────

export const LoadingSpinner = ({ fullScreen = false, message }) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        {message && <Text style={styles.loadingMsg}>{message}</Text>}
      </View>
    );
  }
  return (
    <View style={styles.spinner}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message && <Text style={styles.loadingMsg}>{message}</Text>}
    </View>
  );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────

export const EmptyState = ({ emoji = '📭', title, subtitle, actionLabel, onAction }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyEmoji}>{emoji}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    {actionLabel && onAction && (
      <TouchableOpacity style={styles.emptyAction} onPress={onAction}>
        <Text style={styles.emptyActionText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── ErrorView ────────────────────────────────────────────────────────────────

export const ErrorView = ({ message, onRetry }) => (
  <View style={styles.errorView}>
    <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Text style={styles.errorMessage}>{message || 'Please check your connection and try again.'}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryBtnText}>Try Again</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── StarRating ───────────────────────────────────────────────────────────────

export const StarRating = ({ rating = 0, maxStars = 5, size = 16, onPress }) => (
  <View style={styles.starsRow}>
    {Array.from({ length: maxStars }, (_, i) => {
      const filled = i < Math.floor(rating);
      const half = !filled && i < rating;
      return (
        <TouchableOpacity key={i} onPress={() => onPress?.(i + 1)} disabled={!onPress}>
          <Ionicons
            name={filled ? 'star' : half ? 'star-half' : 'star-outline'}
            size={size}
            color={filled || half ? COLORS.star : COLORS.border}
          />
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────

export const Avatar = ({
  uri, name, size = SIZES.avatarMd,
  online, style, onPress,
}) => {
  const radius = size / 2;
  const content = uri ? (
    <Image source={{ uri }} style={[styles.avatarImg, { width: size, height: size, borderRadius: radius }]} />
  ) : (
    <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: radius }]}>
      <Text style={[styles.avatarInitials, { fontSize: size * 0.35 }]}>
        {getInitials(name || '?')}
      </Text>
    </View>
  );

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={[styles.avatarWrap, style]}>
      {content}
      {online !== undefined && (
        <View style={[
          styles.onlineIndicator,
          { backgroundColor: online ? COLORS.online : COLORS.offline },
          { width: size * 0.28, height: size * 0.28, borderRadius: size * 0.14 },
        ]} />
      )}
    </TouchableOpacity>
  );
};

// ─── SectionHeader ────────────────────────────────────────────────────────────

export const SectionHeader = ({ title, actionLabel, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Divider ─────────────────────────────────────────────────────────────────

export const Divider = ({ label }) => (
  label ? (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerLabel}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  ) : (
    <View style={styles.simpleDivider} />
  )
);

// ─── OnlineBadge ──────────────────────────────────────────────────────────────

export const OnlineBadge = ({ isOnline }) => (
  <View style={[styles.onlineBadge, isOnline ? styles.onlineBadgeActive : styles.onlineBadgeInactive]}>
    <View style={[styles.onlineDot, { backgroundColor: isOnline ? COLORS.online : COLORS.offline }]} />
    <Text style={[styles.onlineBadgeText, { color: isOnline ? '#15803d' : COLORS.textMuted }]}>
      {isOnline ? 'Online' : 'Offline'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  fullScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  spinner: { paddingVertical: 32, alignItems: 'center' },
  loadingMsg: { marginTop: 12, fontSize: SIZES.body, color: COLORS.textSecondary },
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: SIZES.screenPadding },
  emptyEmoji: { fontSize: 56, marginBottom: SIZES.lg },
  emptyTitle: { fontSize: SIZES.subtitle, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  emptySubtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: SIZES.sm, lineHeight: 22 },
  emptyAction: { marginTop: SIZES.xl, backgroundColor: COLORS.primary, borderRadius: SIZES.radiusFull, paddingHorizontal: 24, paddingVertical: 12 },
  emptyActionText: { color: '#fff', fontWeight: '700', fontSize: SIZES.body },
  errorView: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: SIZES.screenPadding },
  errorTitle: { fontSize: SIZES.subtitle, fontWeight: '700', color: COLORS.textPrimary, marginTop: SIZES.md },
  errorMessage: { fontSize: SIZES.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: SIZES.sm, lineHeight: 22 },
  retryBtn: { marginTop: SIZES.xl, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: SIZES.radiusFull, paddingHorizontal: 24, paddingVertical: 12 },
  retryBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: SIZES.body },
  starsRow: { flexDirection: 'row', gap: 2 },
  avatarWrap: { position: 'relative' },
  avatarImg: { resizeMode: 'cover' },
  avatarFallback: { backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: COLORS.primary, fontWeight: '700' },
  onlineIndicator: { position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: '#fff' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.screenPadding, marginBottom: SIZES.sm },
  sectionTitle: { fontSize: SIZES.subtitle, fontWeight: '700', color: COLORS.textPrimary },
  sectionAction: { fontSize: SIZES.body, color: COLORS.primary, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: SIZES.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerLabel: { marginHorizontal: SIZES.md, fontSize: SIZES.body, color: COLORS.textMuted },
  simpleDivider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: SIZES.sm },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radiusFull, gap: 5 },
  onlineBadgeActive: { backgroundColor: '#dcfce7' },
  onlineBadgeInactive: { backgroundColor: '#f3f4f6' },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5 },
  onlineBadgeText: { fontSize: SIZES.tiny, fontWeight: '700' },
});
