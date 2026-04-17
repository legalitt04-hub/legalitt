import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import { uploadAPI } from '../../services/api';
import { MessageBubble, TypingIndicator, ChatInput } from '../../components/chat/ChatComponents';
import { COLORS, SIZES } from '../../constants/theme';
import { formatCountdown } from '../../utils/helpers';

const CHAT_DURATION_SEC = 60 * 60;

const ChatScreen = ({ route, navigation }) => {
  const { chatId, advocateName, advocateAvatar } = route.params || {};
  const { user } = useAuth();
  const flatRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState(CHAT_DURATION_SEC);
  React.useEffect(() => {
    const interval = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

  const { messages, loading, connected, isTyping, sendMessage, sendTyping } = useChat(chatId, user?._id);

  React.useEffect(() => {
    if (messages.length > 0) setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  const handleSend = useCallback((text) => { sendMessage(text); }, [sendMessage]);

  const handleAttach = useCallback(async (type) => {
    try {
      let result;
      if (type === 'image' || type === 'camera') {
        const opts = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 };
        result = type === 'camera'
          ? await ImagePicker.launchCameraAsync(opts)
          : await ImagePicker.launchImageLibraryAsync(opts);
        if (!result.canceled && result.assets?.[0]) {
          const asset = result.assets[0];
          const fd = new FormData();
          fd.append('file', { uri: asset.uri, name: `photo_${Date.now()}.jpg`, type: 'image/jpeg' });
          const { data } = await uploadAPI.document(fd);
          sendMessage('', 'image', data.data.url, `photo_${Date.now()}.jpg`);
        }
      } else {
        result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: false });
        if (!result.canceled && result.assets?.[0]) {
          const asset = result.assets[0];
          const fd = new FormData();
          fd.append('file', { uri: asset.uri, name: asset.name, type: asset.mimeType || 'application/octet-stream' });
          const { data } = await uploadAPI.document(fd);
          sendMessage('', 'file', data.data.url, asset.name);
        }
      }
    } catch { /* ignore */ }
  }, [sendMessage]);

  const renderMsg = useCallback(({ item, index }) => {
    const isMe = item.sender?._id === user?._id || item.sender === user?._id;
    const prev = messages[index - 1];
    const showAvatar = !isMe && (!prev || prev.sender?._id !== item.sender?._id);
    return <MessageBubble message={item} isMe={isMe} showAvatar={showAvatar} />;
  }, [messages, user?._id]);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 4 }}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={s.avatarWrap}>
          {advocateAvatar
            ? <Image source={{ uri: advocateAvatar }} style={s.avatar} />
            : <View style={[s.avatar, { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>{(advocateName || 'A')[0]}</Text>
              </View>
          }
          <View style={[s.dot, { backgroundColor: connected ? COLORS.online : COLORS.offline }]} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={s.name}>{advocateName || 'Advocate'}</Text>
            <Ionicons name="checkmark-circle" size={15} color="#2563eb" />
          </View>
          <Text style={s.status}>{connected ? 'Online' : 'Connecting...'}</Text>
        </View>
        <TouchableOpacity style={{ padding: 6 }}>
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={[s.timer, timeLeft < 300 && s.timerWarn]}>
        <Ionicons name="time-outline" size={14} color={timeLeft < 300 ? COLORS.error : COLORS.primary} />
        <Text style={[s.timerTxt, timeLeft < 300 && { color: COLORS.error }]}>Chat Valid Upto 1 Hour From Now</Text>
        <Text style={[s.timerCount, timeLeft < 300 && { color: COLORS.error }]}>{formatCountdown(timeLeft)}</Text>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item, i) => item._id || String(i)}
        renderItem={renderMsg}
        contentContainerStyle={{ paddingVertical: SIZES.lg, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
            <Text style={{ fontSize: 40 }}>💬</Text>
            <Text style={{ fontSize: SIZES.body, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: 40 }}>
              Say hello! Your consultation has started.
            </Text>
          </View>
        }
        ListFooterComponent={isTyping ? <TypingIndicator name={advocateName} /> : null}
      />

      <ChatInput onSend={handleSend} onAttach={handleAttach} onTyping={sendTyping} disabled={timeLeft === 0} />

      {timeLeft === 0 && (
        <View style={s.expired}>
          <Ionicons name="time-outline" size={40} color={COLORS.textMuted} />
          <Text style={{ fontSize: SIZES.subtitle, fontWeight: '700', color: COLORS.textPrimary }}>Chat session ended</Text>
          <Text style={{ fontSize: SIZES.body, color: COLORS.textSecondary }}>Book a new consultation to continue</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.screenPadding, paddingTop: Platform.OS === 'ios' ? 52 : 44, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatarWrap: { position: 'relative', marginRight: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  dot: { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 5.5, borderWidth: 2, borderColor: '#fff' },
  name: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary },
  status: { fontSize: SIZES.tiny, color: COLORS.textMuted, marginTop: 1 },
  timer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight, paddingHorizontal: SIZES.screenPadding, paddingVertical: 8, gap: 6 },
  timerWarn: { backgroundColor: '#fee2e2' },
  timerTxt: { flex: 1, fontSize: SIZES.caption, color: COLORS.primary, fontWeight: '500' },
  timerCount: { fontSize: SIZES.caption, fontWeight: '800', color: COLORS.primary },
  expired: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', gap: 12 },
});

export default ChatScreen;
