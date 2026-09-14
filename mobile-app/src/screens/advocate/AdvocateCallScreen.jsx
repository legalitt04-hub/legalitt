// screens/advocate/AdvocateCallScreen.jsx
// Hardened Advocate call screen — Zego loaded lazily inside useEffect (not at module level)
// This prevents the "TypeError: undefined is not a function" startup crash.
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';
import { getSocket } from '../../services/socket';
import { callsAPI } from '../../services/api';

let ZegoUIKitPrebuiltCall = null;
let ONE_ON_ONE_VIDEO_CALL_CONFIG = {};
let ONE_ON_ONE_VOICE_CALL_CONFIG = {};

if (Constants.appOwnership !== 'expo') {
  try {
    const mod = require('@zegocloud/zego-uikit-prebuilt-call-rn');
    ZegoUIKitPrebuiltCall = mod.ZegoUIKitPrebuiltCall;
    ONE_ON_ONE_VIDEO_CALL_CONFIG = mod.ONE_ON_ONE_VIDEO_CALL_CONFIG;
    ONE_ON_ONE_VOICE_CALL_CONFIG = mod.ONE_ON_ONE_VOICE_CALL_CONFIG;
  } catch (e) {
    console.warn('Error loading Zego', e);
  }
}

// ── Zego credentials ──────────────────────────────────────────────────────────
const _extra = Constants.expoConfig?.extra || {};
const FALLBACK_APP_ID   = 954831467;
const FALLBACK_APP_SIGN = '6aaa4f1b530a5ddff76b050d56a56974101548cf30d10b1c547feb7da07b16ad';

function resolveAppId(zegoAppIdParam) {
  const fromEnv  = _extra.ZEGO_APP_ID;
  const fromEnvN = (fromEnv && fromEnv !== 'undefined') ? Number(fromEnv) : 0;
  const fromParam = (zegoAppIdParam && zegoAppIdParam !== 'undefined') ? Number(zegoAppIdParam) : 0;
  return fromEnvN || fromParam || FALLBACK_APP_ID;
}

function resolveAppSign() {
  const s = _extra.ZEGO_APP_SIGN;
  return (s && s !== 'undefined' && s.length > 10) ? String(s) : FALLBACK_APP_SIGN;
}
// ─────────────────────────────────────────────────────────────────────────────

export default function AdvocateCallScreen({ navigation, route }) {
  const {
    zegoRoomId: paramRoomId,
    zegoToken,
    zegoAppId,
    advocateName,
    clientName   = 'Client',
    clientAvatar,
    myUserId     = '',
    myUserName   = 'Advocate',
    mode         = 'video',
    bookingId,
    clientId,
  } = route?.params || {};

  // ── Stable IDs ────────────────────────────────────────────────────────────
  const stableUserIdRef = useRef(
    myUserId ? String(myUserId) : `adv_${Math.floor(Math.random() * 1e9)}`
  );
  const callStartRef = useRef(Date.now());

  const effectiveAppId   = resolveAppId(zegoAppId);
  const effectiveAppSign = resolveAppSign();
  const zegoRoomId       = paramRoomId || (bookingId ? `legalitt-${bookingId}` : null);
  const isCallReady      = !!zegoRoomId && !!effectiveAppId;

  const [permissionsGranted, setPermissionsGranted] = useState(Platform.OS === 'ios');

  // ── STEP 1: Request permissions ───────────────────────────────────────────
  useEffect(() => {
    if (!isCallReady) {
      Alert.alert(
        'Call Not Ready',
        'The call room is not set up yet. Please go back and try again.',
        [{ text: 'Go Back', onPress: () => navigation.goBack() }]
      );
      return;
    }

    if (Platform.OS !== 'android') {
      setPermissionsGranted(true);
      return;
    }

    (async () => {
      try {
        const toRequest = [
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ];
        if (mode === 'video') {
          toRequest.push(PermissionsAndroid.PERMISSIONS.CAMERA);
        }
        if (Platform.Version >= 31) toRequest.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
        if (Platform.Version >= 33) toRequest.push('android.permission.POST_NOTIFICATIONS');

        const result = await PermissionsAndroid.requestMultiple(toRequest);
        const micOk  = result[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;
        const camOk  = mode === 'video' ? result[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED : true;

        if (camOk && micOk) {
          setPermissionsGranted(true);
        } else {
          Alert.alert(
            'Permissions Denied',
            mode === 'video' ? 'Camera and microphone access are required.' : 'Microphone access is required.',
            [{ text: 'Go Back', onPress: () => navigation.goBack() }]
          );
        }
      } catch {
        // Proceed optimistically if requestMultiple itself fails
        setPermissionsGranted(true);
      }
    })();
  }, [isCallReady]);



  // ── Listen for remote hang-up ─────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onEnded = () => navigation.goBack();
    socket.on('call_ended', onEnded);
    return () => { socket?.off?.('call_ended', onEnded); };
  }, []);

  // ── Handle local hang-up ──────────────────────────────────────────────────
  const handleHangUp = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('call_ended', {
        bookingId,
        clientId,
        advocateUserId: stableUserIdRef.current,
      });
    }

    // Log call duration to backend (fire & forget)
    const durationSec = Math.round((Date.now() - callStartRef.current) / 1000);
    callsAPI.logCall({
      bookingId,
      clientUserId:   clientId,
      advocateUserId: stableUserIdRef.current,
      mode,
      status:    durationSec > 5 ? 'completed' : 'missed',
      duration:  durationSec,
      startedAt: new Date(callStartRef.current).toISOString(),
      endedAt:   new Date().toISOString(),
      zegoRoomId,
    }).catch(() => {});

    navigation.goBack();
  };

  // ── Loading states ────────────────────────────────────────────────────────
  if (!isCallReady || !permissionsGranted) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#14B8A6" />
        <Text style={styles.waitText}>
          {!permissionsGranted ? (mode === 'video' ? 'Requesting camera & mic access...' : 'Requesting mic access...') : 'Setting up room...'}
        </Text>
      </View>
    );
  }

  const isExpoGo = Constants.appOwnership === 'expo';
  const hasZegoError = !ZegoUIKitPrebuiltCall;

  // ── Expo Go / load error fallback ─────────────────────────────────────────
  if (isExpoGo || hasZegoError) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Text style={styles.devIcon}>{isExpoGo ? (mode === 'video' ? '📹' : '🎙️') : '⚠️'}</Text>
        <Text style={styles.devTitle}>
          {isExpoGo ? (mode === 'video' ? 'Video Call' : 'Voice Call') : 'Module Error'}
        </Text>
        {isExpoGo && <Text style={styles.devRoom}>Room: {zegoRoomId}</Text>}
        <Text style={styles.devNote}>
          {isExpoGo
            ? 'Calls are available in the EAS production/preview build.\nDev mode mein Zego native module linked nahi hai.'
            : 'Failed to load native calling module.\nPlease use the EAS production build.'}
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Build call config ─────────────────────────────────────────────────────
  const callConfig = mode === 'video'
    ? {
        ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
        bottomMenuBarConfig: {
          buttons: ['toggleCameraButton', 'switchCameraButton', 'hangUpButton', 'toggleMicrophoneButton'],
        },
      }
    : {
        ...ONE_ON_ONE_VOICE_CALL_CONFIG,
        bottomMenuBarConfig: {
          buttons: ['toggleMicrophoneButton', 'hangUpButton', 'switchAudioOutputButton'],
        },
      };

  // ── Render call ───────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ZegoUIKitPrebuiltCall
        appID={effectiveAppId}
        appSign={effectiveAppSign}
        userID={stableUserIdRef.current}
        userName={String(myUserName || 'Advocate')}
        callID={String(zegoRoomId)}
        config={{
          ...callConfig,
          onHangUp: handleHangUp,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  waitText:    { color: '#94A3B8', fontSize: 14, marginTop: 12, textAlign: 'center' },
  devIcon:     { fontSize: 64, marginBottom: 16 },
  devTitle:    { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  devRoom:     { color: '#14B8A6', fontSize: 13, marginBottom: 16 },
  devNote:     { color: '#94A3B8', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 32, paddingHorizontal: 32 },
  backBtn:     { backgroundColor: '#14B8A6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  backBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
