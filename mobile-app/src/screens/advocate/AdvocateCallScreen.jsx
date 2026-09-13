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

  // ── Lazy Zego state ───────────────────────────────────────────────────────
  const [zegoState, setZegoState] = useState({
    loaded: false,
    Component: null,
    videoConfig: {},
    voiceConfig: {},
    error: null,
  });

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
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ];
        if (Platform.Version >= 31) toRequest.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
        if (Platform.Version >= 33) toRequest.push('android.permission.POST_NOTIFICATIONS');

        const result = await PermissionsAndroid.requestMultiple(toRequest);
        const camOk  = result[PermissionsAndroid.PERMISSIONS.CAMERA]       === PermissionsAndroid.RESULTS.GRANTED;
        const micOk  = result[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;

        if (camOk && micOk) {
          setPermissionsGranted(true);
        } else {
          Alert.alert(
            'Permissions Denied',
            'Camera and microphone access are required to join this call.',
            [{ text: 'Go Back', onPress: () => navigation.goBack() }]
          );
        }
      } catch {
        // Proceed optimistically if requestMultiple itself fails
        setPermissionsGranted(true);
      }
    })();
  }, [isCallReady]);

  // ── STEP 2: Lazy-load Zego ONLY after permissions granted ─────────────────
  // Key fix: require() inside useEffect prevents module-level hook crashes at startup.
  useEffect(() => {
    if (!permissionsGranted || !isCallReady) return;

    if (Constants.appOwnership === 'expo') {
      setZegoState(s => ({ ...s, loaded: true, error: 'expo_go' }));
      return;
    }

    try {
      const mod       = require('@zegocloud/zego-uikit-prebuilt-call-rn');
      const Component = mod?.ZegoUIKitPrebuiltCall ?? null;
      const videoConf = mod?.ONE_ON_ONE_VIDEO_CALL_CONFIG ?? {};
      const voiceConf = mod?.ONE_ON_ONE_VOICE_CALL_CONFIG ?? {};

      if (!Component || typeof Component !== 'function') {
        setZegoState(s => ({ ...s, loaded: true, error: 'invalid_module' }));
        return;
      }
      setZegoState({ loaded: true, Component, videoConfig: videoConf, voiceConfig: voiceConf, error: null });
    } catch (e) {
      console.warn('[AdvocateCallScreen] Zego load error:', e?.message);
      setZegoState(s => ({ ...s, loaded: true, error: String(e?.message || 'load_error') }));
    }
  }, [permissionsGranted, isCallReady]);

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
  if (!isCallReady || !permissionsGranted || !zegoState.loaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#14B8A6" />
        <Text style={styles.waitText}>
          {!permissionsGranted
            ? 'Requesting camera & mic access...'
            : !zegoState.loaded
            ? 'Loading call engine...'
            : 'Setting up room...'}
        </Text>
      </View>
    );
  }

  // ── Expo Go / load error fallback ─────────────────────────────────────────
  if (zegoState.error) {
    const isExpoGo = zegoState.error === 'expo_go';
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
  const { Component: ZegoCall, videoConfig, voiceConfig } = zegoState;

  const callConfig = mode === 'video'
    ? {
        ...videoConfig,
        bottomMenuBarConfig: {
          buttons: ['toggleCameraButton', 'switchCameraButton', 'hangUpButton', 'toggleMicrophoneButton'],
        },
      }
    : {
        ...voiceConfig,
        bottomMenuBarConfig: {
          buttons: ['toggleMicrophoneButton', 'hangUpButton', 'switchAudioOutputButton'],
        },
      };

  // ── Render call ───────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ZegoCall
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
