// VideoCallScreen.web.tsx
// Web stub — Zego video call SDK is native-only and not available on web.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function VideoCallScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📱</Text>
      <Text style={styles.title}>Video Call</Text>
      <Text style={styles.subtitle}>Video calls are only available on the mobile app.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#94A3B8', fontSize: 15, textAlign: 'center' },
});
