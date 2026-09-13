// screens/advocate/AdvocateCallScreen.jsx
// Real ZEGOCLOUD video/voice call screen for Advocates
// Uses the same ZegoUIKitPrebuiltCall as the client VideoCallScreen
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Constants from 'expo-constants';
import {
  ZegoUIKitPrebuiltCall as ZegoUIKitPrebuiltCallComponent,
  ONE_ON_ONE_VIDEO_CALL_CONFIG,
  ONE_ON_ONE_VOICE_CALL_CONFIG,
} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { getSocket } from '../../services/socket';
import { callsAPI } from '../../services/api';

const ZegoCall = ZegoUIKitPrebuiltCallComponent;
const isZegoComponent = Constants.appOwnership !== 'expo';
const { ZEGO_APP_ID, ZEGO_APP_SIGN } = Constants.expoConfig?.extra || {};
const FALLBACK_APP_ID = 954831467;
const FALLBACK_APP_SIGN = '6aaa4f1b530a5ddff76b050d56a56974101548cf30d10b1c547feb7da07b16ad';

export default function AdvocateCallScreen({ navigation, route }) {
  const {
    zegoRoomId: paramRoomId,
    zegoToken,
    zegoAppId,
    advocateName,
    clientName = 'Client',
    clientAvatar,
    myUserId = '',
    myUserName = 'Advocate',
    mode = 'video',
    bookingId,
    clientId,
  } = route?.params || {};

  const callStartRef = useRef(Date.now());

  let rawAppId = zegoAppId;
  if (!rawAppId || rawAppId === 'undefined') rawAppId = ZEGO_APP_ID;
  if (!rawAppId || rawAppId === 'undefined') rawAppId = FALLBACK_APP_ID;
  const effectiveAppId = Number(rawAppId) || FALLBACK_APP_ID;

  const effectiveAppSign = ZEGO_APP_SIGN && ZEGO_APP_SIGN !== 'undefined' ? ZEGO_APP_SIGN : FALLBACK_APP_SIGN;

  // Fallback roomId: use bookingId if zegoRoomId not provided
  const zegoRoomId = paramRoomId || (bookingId ? `legalitt-${bookingId}` : null);

  // In AppSign mode (appSign present), token is optional — ZEGO handles auth via appSign
  // Only block if we have no roomId OR no appId
  const isCallReady = !!zegoRoomId && !!effectiveAppId;

  useEffect(() => {
    if (!isCallReady) {
      Alert.alert(
        'Call Not Ready',
        'The call room is not set up yet. Please wait for the booking to be confirmed.',
        [{ text: 'Go Back', onPress: () => navigation.goBack() }]
      );
    }
  }, []);

  // Listen for call_ended from socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => navigation.goBack();
    socket.on('call_ended', handler);
    return () => socket?.off?.('call_ended', handler);
  }, []);

  if (!isCallReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#14B8A6" />
        <Text style={styles.waitText}>Setting up call room...</Text>
        <Text style={styles.subText}>
          This call room opens once the booking is confirmed.
        </Text>
      </View>
    );
  }

  // ── Dev mode: Zego native module not available ──────────────────
  if (!isZegoComponent) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Text style={styles.devIcon}>{mode === 'video' ? '📹' : '🎙️'}</Text>
        <Text style={styles.devTitle}>{mode === 'video' ? 'Video Call' : 'Voice Call'}</Text>
        <Text style={styles.devRoom}>Room: {zegoRoomId}</Text>
        <Text style={styles.devNote}>
          Call works in EAS production build.{'\n'}
          Dev mode mein Zego native module linked nahi hai.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const callConfig =
    mode === 'video'
      ? {
          ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
          bottomMenuBarConfig: {
            buttons: [
              'toggleCameraButton',
              'switchCameraButton',
              'hangUpButton',
              'toggleMicrophoneButton',
            ],
          },
        }
      : {
          ...ONE_ON_ONE_VOICE_CALL_CONFIG,
          bottomMenuBarConfig: {
            buttons: ['toggleMicrophoneButton', 'hangUpButton'],
          },
        };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ZegoCall
        appID={effectiveAppId}
        appSign={effectiveAppSign}
        userID={String(myUserId || 'adv_' + Date.now())}
        userName={String(myUserName || 'Advocate')}
        callID={String(zegoRoomId)}
        config={{
          ...callConfig,
          onHangUp: () => {
            // Emit call_ended so client side also closes
            const socket = getSocket();
            if (socket) {
              socket.emit('call_ended', { bookingId, clientId, advocateUserId: myUserId });
            }
            // Log call to backend
            const durationSec = Math.round((Date.now() - callStartRef.current) / 1000);
            callsAPI.logCall({
              bookingId,
              clientUserId: clientId,
              advocateUserId: myUserId,
              mode,
              status: durationSec > 5 ? 'completed' : 'missed',
              duration: durationSec,
              startedAt: new Date(callStartRef.current).toISOString(),
              endedAt: new Date().toISOString(),
              zegoRoomId,
            }).catch(() => {}); // fire and forget
            navigation.goBack();
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  waitText:    { color: '#94A3B8', fontSize: 14, marginTop: 12 },
  subText:     { color: '#64748B', fontSize: 12, marginTop: 6, textAlign: 'center', paddingHorizontal: 20 },
  devIcon:     { fontSize: 64, marginBottom: 16 },
  devTitle:    { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  devRoom:     { color: '#14B8A6', fontSize: 13, marginBottom: 16 },
  devNote:     { color: '#94A3B8', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 32, paddingHorizontal: 32 },
  backBtn:     { backgroundColor: '#14B8A6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  backBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
