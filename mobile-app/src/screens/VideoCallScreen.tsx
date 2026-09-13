import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, Alert, Text, ActivityIndicator, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  ZegoUIKitPrebuiltCall as ZegoUIKitPrebuiltCallComponent,
  ONE_ON_ONE_VIDEO_CALL_CONFIG,
  ONE_ON_ONE_VOICE_CALL_CONFIG,
} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { getSocket } from '../services/socket';

// Guard: In Expo Go, Zego native module is not linked
// In standalone APKs, appOwnership is null or 'standalone', so it will render the real component
const ZegoUIKitPrebuiltCall: any = ZegoUIKitPrebuiltCallComponent;
const isZegoComponent = Constants.appOwnership !== 'expo';

const { ZEGO_APP_ID, ZEGO_APP_SIGN } = Constants.expoConfig?.extra || {};
const FALLBACK_APP_ID = 954831467;
const FALLBACK_APP_SIGN = '6aaa4f1b530a5ddff76b050d56a56974101548cf30d10b1c547feb7da07b16ad';

export default function VideoCallScreen({ navigation, route }: any) {
  const [permissionsGranted, setPermissionsGranted] = useState(Platform.OS === 'ios');

  const {
    zegoRoomId,
    zegoToken,
    advocateName = 'Advocate',
    myUserId = '',
    myUserName = 'User',
    mode = 'video',
    bookingId,
    advocateUserId,
    zegoAppId,
  } = route?.params || {};

  const effectiveRoomId = zegoRoomId || (bookingId ? `legalitt-${bookingId}` : null);
  
  let rawAppId = ZEGO_APP_ID;
  if (!rawAppId || rawAppId === 'undefined') rawAppId = zegoAppId;
  if (!rawAppId || rawAppId === 'undefined') rawAppId = FALLBACK_APP_ID;
  const effectiveAppId = Number(rawAppId) || FALLBACK_APP_ID;

  const effectiveAppSign = ZEGO_APP_SIGN && ZEGO_APP_SIGN !== 'undefined' ? ZEGO_APP_SIGN : FALLBACK_APP_SIGN;
  const isCallReady = !!effectiveRoomId && !!effectiveAppId;

  useEffect(() => {
    if (!isCallReady) {
      Alert.alert(
        'Call Not Ready',
        'Missing booking or room ID. Please go back and try again.',
        [{ text: 'Go Back', onPress: () => navigation.goBack() }]
      );
    }
  }, []);

  // Listen for advocate hanging up — close screen on client side too
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => navigation.goBack();
    socket.on('call_ended', handler);
    return () => socket?.off?.('call_ended', handler);
  }, []);

  // Request Permissions on Android before rendering Zego
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);
          if (
            granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
          ) {
            setPermissionsGranted(true);
          } else {
            Alert.alert('Permissions Required', 'Camera and Microphone permissions are needed to start the call.', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          }
        } catch (err) {
          console.warn(err);
          setPermissionsGranted(true); // Attempt to proceed anyway if error
        }
      }
    };
    if (isCallReady) {
      requestPermissions();
    }
  }, [isCallReady]);

  if (!isCallReady || !permissionsGranted) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#14B8A6" />
        <Text style={styles.waitText}>
          {!permissionsGranted ? 'Requesting permissions...' : 'Setting up call room...'}
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
        <Text style={styles.devRoom}>Room: {effectiveRoomId}</Text>
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

  const handleHangUp = () => {
    // Notify advocate that client hung up
    const socket = getSocket();
    if (socket) {
      socket.emit('call_ended', {
        bookingId,
        clientId: myUserId || null,
        advocateUserId: advocateUserId || null,
      });
    }
    navigation.goBack();
  };

  const callConfig = mode === 'video'
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
          buttons: [
            'toggleMicrophoneButton',
            'hangUpButton',
            'switchAudioOutputButton',
          ],
        },
      };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ZegoUIKitPrebuiltCall
        appID={effectiveAppId}
        appSign={effectiveAppSign || ''}
        userID={String(myUserId || 'user_' + Date.now())}
        userName={String(myUserName || 'User')}
        callID={String(effectiveRoomId)}
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
  waitText:    { color: '#94A3B8', fontSize: 14, marginTop: 12 },
  devIcon:     { fontSize: 64, marginBottom: 16 },
  devTitle:    { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  devRoom:     { color: '#14B8A6', fontSize: 13, marginBottom: 16 },
  devNote:     { color: '#94A3B8', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 32, paddingHorizontal: 32 },
  backBtn:     { backgroundColor: '#14B8A6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  backBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});


