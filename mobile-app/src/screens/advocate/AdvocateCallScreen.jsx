import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { getSocket } from '../../services/socket';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Theme Colors matching "A4 - 1 (7).pdf"
const THEME = {
  // Voice call background
  voiceBg: '#FAF8F5',          // Light cream background for voice call
  voiceCardBg: '#FFFFFF',      // White
  // Video call colors
  videoBg: '#1A1816',          // Dark video backdrop
  selfBorder: 'rgba(255, 255, 255, 0.4)',
  // Brand & Controls
  primary: '#8C6E52',          // Warm beige/brown
  primaryLight: '#B09C85',
  controlBg: '#F3EFEB',        // Light cream for circular control buttons
  controlBgActive: '#8C6E52',   // Primary color when active
  controlIconColor: '#8C6E52', // Icon color
  controlIconActive: '#FFFFFF',
  endCallRed: '#EF4444',       // End call red button
  endCallIcon: '#FFFFFF',
  textDark: '#2D2824',         // Dark charcoal
  textMuted: '#7D756E',        // Muted secondary text
  textLight: '#FFFFFF',        // White text for video overlay
  statusGreen: '#10B981',      // Connected green dot
  statusRed: '#EF4444',        // Live timer red dot
};

export default function AdvocateCallScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  // Extract call params
  const clientName = route?.params?.clientName || route?.params?.advocateName || 'Rahul Sharma';
  const clientAvatar = route?.params?.clientAvatar || route?.params?.avatar || null;
  const initialCallType = route?.params?.callType || route?.params?.mode || 'video'; // 'video' | 'voice'
  const isIncoming = route?.params?.isIncoming === true;

  // Call states: 'incoming' | 'connected' | 'ended'
  const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'connected');
  const [callType, setCallType] = useState(initialCallType); // 'video' | 'voice'

  // Control toggle states
  const [isCameraOn, setIsCameraOn] = useState(initialCallType === 'video');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(initialCallType === 'video');

  // Real live call duration timer
  const [connectedTimestamp, setConnectedTimestamp] = useState(isIncoming ? null : Date.now());
  const [durationString, setDurationString] = useState('00:00 min');
  const timerRef = useRef(null);

  // ─── LIVE DURATION TIMER (START FROM 00:00 ON CONNECT) ─────────────────────
  useEffect(() => {
    if (callStatus === 'connected') {
      const startTime = connectedTimestamp || Date.now();
      if (!connectedTimestamp) {
        setConnectedTimestamp(startTime);
      }

      // Update timer every second based on actual elapsed time
      timerRef.current = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
        const secs = String(elapsedSeconds % 60).padStart(2, '0');
        setDurationString(`${mins}:${secs} min`);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callStatus, connectedTimestamp]);

  // ─── SOCKET LISTENER FOR CALL TERMINATION ──────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleCallEnded = () => {
      handleEndCall();
    };

    socket.on('call_ended', handleCallEnded);
    return () => {
      socket.off('call_ended', handleCallEnded);
    };
  }, []);

  // ─── CALL ACTIONS ──────────────────────────────────────────────────────────

  const handleAcceptCall = () => {
    setConnectedTimestamp(Date.now());
    setCallStatus('connected');
    const socket = getSocket();
    if (socket) {
      socket.emit('call_accepted', {
        bookingId: route?.params?.bookingId,
        clientId: route?.params?.clientId,
      });
    }
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const socket = getSocket();
    if (socket) {
      socket.emit('call_ended', {
        bookingId: route?.params?.bookingId,
        clientId: route?.params?.clientId,
      });
    }
    navigation.goBack();
  };

  const handleSafeBack = () => {
    if (callStatus === 'connected') {
      Alert.alert(
        'Active Call',
        'Do you want to end this consultation call?',
        [
          { text: 'Stay in Call', style: 'cancel' },
          { text: 'End Call', style: 'destructive', onPress: handleEndCall },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // ─── CONTROL TOGGLES ───────────────────────────────────────────────────────

  const toggleCamera = () => {
    if (callType === 'voice') return;
    setIsCameraOn((prev) => !prev);
  };

  const toggleMic = () => {
    setIsMicOn((prev) => !prev);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn((prev) => !prev);
  };

  const toggleVideo = () => {
    if (callType === 'voice') return;
    setIsVideoOn((prev) => !prev);
  };

  // ─── INCOMING CALL OVERLAY ─────────────────────────────────────────────────
  if (callStatus === 'incoming') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: THEME.voiceBg }]}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.voiceBg} />

        <View style={styles.incomingContainer}>
          <View style={styles.incomingAvatarWrapper}>
            {clientAvatar ? (
              <Image source={{ uri: clientAvatar }} style={styles.incomingAvatar} />
            ) : (
              <View style={styles.incomingAvatarFallback}>
                <Text style={styles.incomingAvatarInitial}>
                  {(clientName || 'C')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.incomingBadgePill}>
              <Text style={styles.incomingBadgeText}>
                Incoming {callType === 'video' ? 'Video' : 'Voice'} Call
              </Text>
            </View>
          </View>

          <Text style={styles.incomingClientName}>{clientName}</Text>
          <Text style={styles.incomingSubtitle}>Legal Consultation Call Request</Text>

          {/* Accept / Decline Buttons */}
          <View style={styles.incomingActionRow}>
            <TouchableOpacity
              style={[styles.callBtnCircle, styles.declineBtn]}
              onPress={handleEndCall}
              activeOpacity={0.8}
            >
              <MaterialIcons name="call-end" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.callBtnCircle, styles.acceptBtn]}
              onPress={handleAcceptCall}
              activeOpacity={0.8}
            >
              <MaterialIcons name="call" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── 1. VIDEO CALL SCREEN (MATCHING PDF SCREEN 1) ──────────────────────────
  if (callType === 'video') {
    return (
      <View style={styles.videoContainer}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Client Main Video Feed */}
        <View style={styles.mainVideoArea}>
          {isVideoOn ? (
            <Image
              source={{
                uri: clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
              }}
              style={styles.clientVideoImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.videoOffPlaceholder}>
              <Ionicons name="videocam-off" size={48} color="rgba(255,255,255,0.4)" />
              <Text style={styles.videoOffText}>Client camera is off</Text>
            </View>
          )}

          {/* Top Bar: Back Button */}
          <SafeAreaView style={styles.videoTopBar}>
            <TouchableOpacity
              style={styles.videoBackBtn}
              onPress={handleSafeBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Advocate Self-Camera Preview (Top Right) */}
          <View style={[styles.selfPreviewCard, { top: Math.max(insets.top, 20) + 10 }]}>
            {isCameraOn ? (
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
                }}
                style={styles.selfPreviewImage}
              />
            ) : (
              <View style={styles.selfPreviewOff}>
                <Ionicons name="camera-reverse" size={20} color="rgba(255,255,255,0.6)" />
              </View>
            )}
          </View>

          {/* Bottom Info Bar: Client Name + Live Timer */}
          <View style={styles.videoInfoBar}>
            <Text style={styles.videoClientName}>Client : {clientName}</Text>
            <View style={styles.videoTimerRow}>
              <View style={styles.liveRedDot} />
              <Text style={styles.videoTimerText}>{durationString}</Text>
            </View>
          </View>
        </View>

        {/* 5 Bottom Call Controls */}
        <SafeAreaView
          edges={['bottom']}
          style={[styles.controlsBar, styles.videoControlsBar]}
        >
          {/* 1. Camera Toggle */}
          <TouchableOpacity
            style={[styles.controlBtnCircle, !isCameraOn && styles.controlBtnOff]}
            onPress={toggleCamera}
            activeOpacity={0.75}
          >
            <Feather
              name={isCameraOn ? 'camera' : 'camera-off'}
              size={20}
              color={THEME.controlIconColor}
            />
          </TouchableOpacity>

          {/* 2. Microphone Toggle */}
          <TouchableOpacity
            style={[styles.controlBtnCircle, !isMicOn && styles.controlBtnOff]}
            onPress={toggleMic}
            activeOpacity={0.75}
          >
            <Ionicons
              name={isMicOn ? 'mic' : 'mic-off'}
              size={20}
              color={THEME.controlIconColor}
            />
          </TouchableOpacity>

          {/* 3. Red End Call Button */}
          <TouchableOpacity
            style={styles.endCallCircle}
            onPress={handleEndCall}
            activeOpacity={0.8}
          >
            <MaterialIcons name="call-end" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* 4. Speaker Toggle */}
          <TouchableOpacity
            style={[styles.controlBtnCircle, !isSpeakerOn && styles.controlBtnOff]}
            onPress={toggleSpeaker}
            activeOpacity={0.75}
          >
            <Ionicons
              name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
              size={20}
              color={THEME.controlIconColor}
            />
          </TouchableOpacity>

          {/* 5. Video Track Toggle */}
          <TouchableOpacity
            style={[styles.controlBtnCircle, !isVideoOn && styles.controlBtnOff]}
            onPress={toggleVideo}
            activeOpacity={0.75}
          >
            <Ionicons
              name={isVideoOn ? 'videocam' : 'videocam-off'}
              size={20}
              color={THEME.controlIconColor}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  // ─── 2. VOICE CALL SCREEN (MATCHING PDF SCREEN 2) ───────────────────────────
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: THEME.voiceBg }]}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.voiceBg} />

      {/* Top Header: Back Button */}
      <View style={styles.voiceHeader}>
        <TouchableOpacity
          style={styles.voiceBackBtn}
          onPress={handleSafeBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={THEME.textDark} />
        </TouchableOpacity>
      </View>

      {/* Main Center Area: Client Avatar + Name + Connected Status + Live Timer */}
      <View style={styles.voiceCenterArea}>
        {/* Prominent Client Avatar */}
        <View style={styles.voiceAvatarOuterRing}>
          {clientAvatar ? (
            <Image source={{ uri: clientAvatar }} style={styles.voiceAvatarImage} />
          ) : (
            <View style={styles.voiceAvatarFallback}>
              <Text style={styles.voiceAvatarInitial}>
                {(clientName || 'C')[0].toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Client Name */}
        <Text style={styles.voiceClientName}>{clientName}</Text>

        {/* Voice Consultation Subtitle */}
        <Text style={styles.voiceSubText}>Voice Consultation</Text>

        {/* ● Connected Indicator */}
        <View style={styles.voiceStatusRow}>
          <View style={styles.connectedGreenDot} />
          <Text style={styles.voiceStatusText}>Connected</Text>
        </View>

        {/* Prominent Running Duration Timer */}
        <Text style={styles.voiceDurationText}>{durationString}</Text>
      </View>

      {/* Bottom Info Bar: Client : {clientName} ● {duration} min */}
      <View style={styles.voiceBottomInfoBar}>
        <Text style={styles.voiceInfoClientText}>Client : {clientName}</Text>
        <View style={styles.voiceTimerPill}>
          <View style={styles.liveRedDot} />
          <Text style={styles.voiceInfoTimerText}>{durationString}</Text>
        </View>
      </View>

      {/* 5 Bottom Call Controls */}
      <View style={[styles.controlsBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        {/* 1. Camera Control (Disabled in voice mode) */}
        <TouchableOpacity
          style={[styles.controlBtnCircle, styles.controlBtnDisabled]}
          disabled={true}
          activeOpacity={1}
        >
          <Feather name="camera" size={20} color="#BDB7AF" />
        </TouchableOpacity>

        {/* 2. Microphone Toggle */}
        <TouchableOpacity
          style={[styles.controlBtnCircle, !isMicOn && styles.controlBtnOff]}
          onPress={toggleMic}
          activeOpacity={0.75}
        >
          <Ionicons
            name={isMicOn ? 'mic' : 'mic-off'}
            size={20}
            color={THEME.controlIconColor}
          />
        </TouchableOpacity>

        {/* 3. Red End Call Button */}
        <TouchableOpacity
          style={styles.endCallCircle}
          onPress={handleEndCall}
          activeOpacity={0.8}
        >
          <MaterialIcons name="call-end" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* 4. Speaker Toggle */}
        <TouchableOpacity
          style={[styles.controlBtnCircle, !isSpeakerOn && styles.controlBtnOff]}
          onPress={toggleSpeaker}
          activeOpacity={0.75}
        >
          <Ionicons
            name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
            size={20}
            color={THEME.controlIconColor}
          />
        </TouchableOpacity>

        {/* 5. Video Control (Disabled in voice mode) */}
        <TouchableOpacity
          style={[styles.controlBtnCircle, styles.controlBtnDisabled]}
          disabled={true}
          activeOpacity={1}
        >
          <Ionicons name="videocam" size={20} color="#BDB7AF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  // ─── 1. VIDEO CALL STYLES ──────────────────────────────────────────
  videoContainer: {
    flex: 1,
    backgroundColor: THEME.videoBg,
  },
  mainVideoArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  clientVideoImage: {
    width: '100%',
    height: '100%',
  },
  videoOffPlaceholder: {
    flex: 1,
    backgroundColor: '#1E1B18',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  videoOffText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  videoTopBar: {
    position: 'absolute',
    top: 10,
    left: 16,
    zIndex: 10,
  },
  videoBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfPreviewCard: {
    position: 'absolute',
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: THEME.selfBorder,
    overflow: 'hidden',
    backgroundColor: '#2D2824',
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  selfPreviewImage: {
    width: '100%',
    height: '100%',
  },
  selfPreviewOff: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38322D',
  },
  videoInfoBar: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  videoClientName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  videoTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveRedDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.statusRed,
  },
  videoTimerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  videoControlsBar: {
    backgroundColor: 'rgba(26, 24, 22, 0.95)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  // ─── 2. VOICE CALL STYLES ──────────────────────────────────────────
  voiceHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  voiceBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEAE4',
  },
  voiceCenterArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  voiceAvatarOuterRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#EFE9E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2D9CE',
    marginBottom: 8,
    shadowColor: '#2D2824',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  voiceAvatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  voiceAvatarFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceAvatarInitial: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  voiceClientName: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.textDark,
    marginTop: 4,
  },
  voiceSubText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.textMuted,
  },
  voiceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  connectedGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.statusGreen,
  },
  voiceStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.statusGreen,
  },
  voiceDurationText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    marginTop: 2,
  },
  voiceBottomInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEAE4',
  },
  voiceInfoClientText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textDark,
  },
  voiceTimerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voiceInfoTimerText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textDark,
  },

  // ─── 3. 5 CALL CONTROLS BAR ─────────────────────────────────────────
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  controlBtnCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.controlBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EBE4DB',
  },
  controlBtnOff: {
    backgroundColor: '#E5DED5',
  },
  controlBtnDisabled: {
    opacity: 0.4,
    backgroundColor: '#EFEAE4',
  },
  endCallCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: THEME.endCallRed,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.endCallRed,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },

  // ─── 4. INCOMING CALL SCREEN ───────────────────────────────────────
  incomingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  incomingAvatarWrapper: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  incomingAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: THEME.primary,
  },
  incomingAvatarFallback: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomingAvatarInitial: {
    fontSize: 54,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  incomingBadgePill: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3EFEB',
    borderWidth: 1,
    borderColor: '#EAE4DC',
  },
  incomingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.primary,
  },
  incomingClientName: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.textDark,
  },
  incomingSubtitle: {
    fontSize: 14,
    color: THEME.textMuted,
    fontWeight: '500',
  },
  incomingActionRow: {
    flexDirection: 'row',
    gap: 40,
    marginTop: 36,
  },
  callBtnCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  declineBtn: {
    backgroundColor: THEME.endCallRed,
    shadowColor: THEME.endCallRed,
  },
  acceptBtn: {
    backgroundColor: THEME.statusGreen,
    shadowColor: THEME.statusGreen,
  },
});
