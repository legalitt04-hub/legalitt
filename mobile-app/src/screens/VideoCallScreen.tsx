import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Alert,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Animated,
  Easing,
  Image,
} from 'react-native';
import Constants from 'expo-constants';
import { getSocket } from '../services/socket';
import { callsAPI } from '../services/api';

// ── Safe lazy load — only in EAS builds ────────────────────────────────────
let ZegoUIKitPrebuiltCall: any = null;
let ONE_ON_ONE_VIDEO_CALL_CONFIG: any = null;
let ONE_ON_ONE_VOICE_CALL_CONFIG: any = null;

try {
  if (Constants.appOwnership !== 'expo') {
    const zego = require('@zegocloud/zego-uikit-prebuilt-call-rn');
    ZegoUIKitPrebuiltCall      = zego.ZegoUIKitPrebuiltCall      ?? null;
    ONE_ON_ONE_VIDEO_CALL_CONFIG = zego.ONE_ON_ONE_VIDEO_CALL_CONFIG ?? null;
    ONE_ON_ONE_VOICE_CALL_CONFIG = zego.ONE_ON_ONE_VOICE_CALL_CONFIG ?? null;
  }
} catch (_) {}

// ── Zego credentials ────────────────────────────────────────────────────────
const _extra = Constants.expoConfig?.extra ?? {};
const FALLBACK_APP_ID   = 954831467;
const FALLBACK_APP_SIGN = '6aaa4f1b530a5ddff76b050d56a56974101548cf30d10b1c547feb7da07b16ad';

function resolveAppId(param?: any): number {
  const fromEnv = Number(_extra.ZEGO_APP_ID);
  const fromParam = Number(param);
  return (fromEnv > 0 ? fromEnv : 0) || (fromParam > 0 ? fromParam : 0) || FALLBACK_APP_ID;
}
function resolveAppSign(): string {
  const s = String(_extra.ZEGO_APP_SIGN ?? '');
  return s.length > 10 ? s : FALLBACK_APP_SIGN;
}

// ────────────────────────────────────────────────────────────────────────────

export default function VideoCallScreen({ navigation, route }: any) {
  const {
    zegoRoomId,
    zegoToken,
    advocateName = 'Advocate',
    myUserId     = '',
    myUserName   = 'User',
    mode         = 'video',
    bookingId,
    advocateUserId,
    zegoAppId,
  } = route?.params ?? {};

  const stableUserIdRef = useRef<string>(
    myUserId ? String(myUserId) : `cli_${Math.floor(Math.random() * 1e9)}`
  );

  const effectiveAppId   = resolveAppId(zegoAppId);
  const effectiveAppSign = resolveAppSign();
  const effectiveRoomId  = zegoRoomId || (bookingId ? `legalitt-${bookingId}` : null);
  const isCallReady      = !!effectiveRoomId && effectiveAppId > 0;

  const [permissionsGranted, setPermissionsGranted] = useState(Platform.OS === 'ios');
  const [zegoReady, setZegoReady] = useState(false);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (remoteJoined) return;
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,    duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    anim.start();
    return () => anim.stop();
  }, [remoteJoined, pulse]);

  // ── Request permissions ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isCallReady) {
      Alert.alert(
        'Call Not Ready',
        'Missing booking or room info. Please go back and try again.',
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
        const perms: string[] = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
        if (mode === 'video') perms.push(PermissionsAndroid.PERMISSIONS.CAMERA);
        if ((Platform.Version as number) >= 31) perms.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);

        const result = await PermissionsAndroid.requestMultiple(perms as any);
        const micOk = result[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;
        const camOk = mode !== 'video' || result[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;

        if (micOk && camOk) {
          setPermissionsGranted(true);
        } else {
          Alert.alert(
            'Permission Required',
            mode === 'video' ? 'Camera & microphone access needed.' : 'Microphone access needed.',
            [{ text: 'Go Back', onPress: () => navigation.goBack() }]
          );
        }
      } catch {
        // Optimistic fallback — proceed anyway
        setPermissionsGranted(true);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Wait a tick after permissions so Zego mounts cleanly ────────────────
  useEffect(() => {
    if (!permissionsGranted) return;
    const t = setTimeout(() => setZegoReady(true), 300);
    return () => clearTimeout(t);
  }, [permissionsGranted]);

  // ── Socket: listen for remote hang-up ───────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onEnded = () => {
      // Remote hung up, we should run the same hangup logic
      handleHangUp();
    };
    socket.on('call_ended', onEnded);
    return () => { socket.off('call_ended', onEnded); };
  }, [callStartTime, bookingId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Hang-up handler ──────────────────────────────────────────────────────
  const handleHangUp = async () => {
    let duration = 0;
    if (callStartTime) {
      duration = Math.floor((Date.now() - callStartTime) / 1000);
    }

    try {
      const socket = getSocket();
      if (socket) {
        if (duration > 0) {
          socket.emit('call_completed', { bookingId, clientId: stableUserIdRef.current, advocateUserId: advocateUserId ?? null, mode, duration });
        } else {
          socket.emit('call_missed', { bookingId, clientId: stableUserIdRef.current, advocateUserId: advocateUserId ?? null, mode });
        }
        socket.emit('call_ended', {
          bookingId,
          clientId: stableUserIdRef.current,
          advocateUserId: advocateUserId ?? null,
        });
      }
      
      // Hit backend to save call log and auto-complete booking
      await callsAPI.logCall({
        bookingId,
        advocateUserId: advocateUserId ?? null,
        clientUserId: stableUserIdRef.current,
        mode: mode ?? 'video',
        status: duration > 0 ? 'completed' : 'missed',
        duration,
        endedAt: new Date().toISOString()
      });
    } catch (_) {}

    // Navigate to feedback screen if call was connected, else go back
    if (duration > 0 && bookingId) {
      navigation.replace('CallFeedback', { 
        bookingId, 
        duration,
        advocateUserId: advocateUserId ?? null,
        mode 
      });
    } else {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.replace('Home');
    }
  };

  // ── Loading / permission gate ────────────────────────────────────────────
  if (!isCallReady || !permissionsGranted || !zegoReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#14B8A6" />
        <Text style={styles.waitText}>
          {!isCallReady
            ? 'Setting up room...'
            : !permissionsGranted
            ? mode === 'video' ? 'Requesting camera & mic...' : 'Requesting mic...'
            : 'Starting call...'}
        </Text>
      </View>
    );
  }

  // ── Expo Go / module-not-loaded fallback ─────────────────────────────────
  if (!ZegoUIKitPrebuiltCall || Constants.appOwnership === 'expo') {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Text style={styles.devIcon}>{mode === 'video' ? '📹' : '🎙️'}</Text>
        <Text style={styles.devTitle}>{mode === 'video' ? 'Video Call' : 'Voice Call'}</Text>
        <Text style={styles.devRoom}>Room: {effectiveRoomId}</Text>
        <Text style={styles.devNote}>
          Calling is only available in the EAS build.{'\n'}
          This is an Expo Go / dev build — native modules not linked.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Zego config — default preset + required no-op stubs ─────────────────
  // IMPORTANT: Zego internally calls onJoinRoom, onUserJoin, onCallEnd etc.
  // Passing undefined for these causes "undefined is not a function" crash.
  const callConfig = {
    ...(mode === 'video' ? (ONE_ON_ONE_VIDEO_CALL_CONFIG ?? {}) : (ONE_ON_ONE_VOICE_CALL_CONFIG ?? {})),
    turnOnCameraWhenJoining:     mode === 'video',
    turnOnMicrophoneWhenJoining: true,
    useSpeakerWhenJoining:       true,
    onJoinRoom:       () => {},
    onUserJoin:       () => { 
      setRemoteJoined(true); 
      if (!callStartTime) setCallStartTime(Date.now());
    },
    onUserLeave:      () => { setRemoteJoined(false); },
    onCallEnd:        () => { handleHangUp(); },
    onDurationUpdate: () => {},
    bottomMenuBarConfig: {
      buttons: mode === 'video' 
        ? ['toggleCameraButton', 'switchCameraButton', 'hangUpButton', 'toggleMicrophoneButton']
        : ['toggleMicrophoneButton', 'hangUpButton', 'switchAudioOutputButton'],
    },
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const peerName = advocateName || 'Advocate';
  const peerAvatar = route?.params?.advocateAvatar || null;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ZegoUIKitPrebuiltCall
        appID={effectiveAppId}
        appSign={effectiveAppSign}
        userID={stableUserIdRef.current}
        userName={String(myUserName || 'User')}
        callID={String(effectiveRoomId)}
        config={callConfig}
      />
      {!remoteJoined && (
        <View 
          style={[styles.ringingOverlay, { backgroundColor: mode === 'voice' ? '#0f172a' : 'rgba(15, 23, 42, 0.4)' }]} 
          pointerEvents="none"
        >
          <Animated.View style={[styles.ringingAvatarFrame, { transform: [{ scale: pulse }] }]}>
            {peerAvatar ? (
              <Image source={{ uri: peerAvatar }} style={styles.ringingAvatar} />
            ) : (
              <View style={styles.ringingAvatarFallback}>
                <Text style={styles.ringingAvatarInitial}>{peerName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </Animated.View>
          <Text style={styles.ringingName}>Calling {peerName}...</Text>
          <Text style={styles.ringingSub}>Waiting for them to join</Text>
        </View>
      )}
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
  backBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  ringingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingBottom: 40,
  },
  ringingAvatarFrame: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 3, borderColor: '#14B8A6',
    marginBottom: 24,
    backgroundColor: '#1E293B',
    elevation: 10,
    shadowColor: '#14B8A6', shadowOpacity: 0.5, shadowRadius: 15,
  },
  ringingAvatar: { width: '100%', height: '100%', borderRadius: 60 },
  ringingAvatarFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 60 },
  ringingAvatarInitial: { fontSize: 48, fontWeight: '700', color: '#14B8A6' },
  ringingName: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  ringingSub: { color: 'rgba(255,255,255,0.7)', fontSize: 16, textAlign: 'center' },
});
