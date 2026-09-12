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
} from 'react-native';
import Constants from 'expo-constants';
import ZegoUIKitPrebuiltCallComponent, {
  ONE_ON_ONE_VIDEO_CALL_CONFIG,
  ONE_ON_ONE_VOICE_CALL_CONFIG,
} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { getSocket } from '../../services/socket';
import { callsAPI } from '../../services/api';

const ZegoCall = ZegoUIKitPrebuiltCallComponent;
const { ZEGO_APP_ID, ZEGO_APP_SIGN } = Constants.expoConfig?.extra || {};

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

  const effectiveAppId   = Number(zegoAppId || ZEGO_APP_ID || 0);
  const effectiveAppSign = ZEGO_APP_SIGN || '';

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
    return () => socket.off('call_ended', handler);
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
        userID={String(myUserId)}
        userName={String(myUserName)}
        callID={String(zegoRoomId)}
        token={zegoToken}
        config={{
          ...callConfig,
          onHangUp: () => {
            // Emit call_ended so client side also closes
            const socket = getSocket();
            if (socket && bookingId) {
              socket.emit('call_ended', { bookingId, clientId });
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
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
  subText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
