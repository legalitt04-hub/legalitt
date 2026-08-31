import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, Image, KeyboardAvoidingView, Platform,
  StatusBar, ActivityIndicator, Alert, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Safe lazy-load: expo-notifications crashes if ExpoPushTokenManager native module is missing
let Notifications = null;
try { Notifications = require('expo-notifications'); } catch (e) {}

// Configure notification handler only if module loaded
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {}
}

import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import { COLORS } from '../../constants/theme';
import { formatDate } from '../../utils/helpers';
import { useNetwork } from '../../context/NetworkContext';

const ChatScreen = ({ navigation, route }) => {
  const {
    chatId, advocateName, advocateAvatar, advocateId,
    zegoRoomId, zegoToken, zegoAppId, zegoAppSign, mode: callMode,
    scheduledSlot,
  } = route.params || {};
  const { user } = useAuth();
  const { isConnected } = useNetwork();
  const userData = user?.user || user || {};

  const {
    messages, loading, loadingMore, hasMore, connected, isTyping, error,
    sendMessage, sendTyping, sendStopTyping, loadMoreMessages,
  } = useChat(chatId, user?._id);

  const flatListRef = useRef(null);
  const [text, setText]       = useState('');
  const [sharing, setSharing] = useState(false);

  // ── Register push token on mount ──────────────────────────────
  useEffect(() => {
    const registerPushToken = async () => {
      try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        let finalStatus = existing;
        if (existing !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') return;

        const tokenData = await Notifications.getExpoPushTokenAsync();
        const expoPushToken = tokenData.data;

        // Register with backend
        await api.post('/users/push-token', { expoPushToken });
      } catch (err) {
        // Silently fail — push is optional
        console.log('Push registration skipped:', err.message);
      }
    };
    registerPushToken();
  }, []);

  // ── Send message handler ──────────────────────────────────────
  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
    sendStopTyping();
    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // ── Typing handler ────────────────────────────────────────────
  const handleTextChange = (v) => {
    setText(v);
    if (v.trim().length > 0) sendTyping();
    else sendStopTyping();
  };

  // ── Load older messages (pagination) ─────────────────────────
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) loadMoreMessages();
  }, [loadingMore, hasMore, loadMoreMessages]);

  // ── Share image/document ──────────────────────────────────────
  const handleShareDocument = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Photo library access is required to share files.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSharing(true);
      try {
        const formData = new FormData();
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('file', { uri, name: filename, type });

        const response = await api.post('/uploads/document', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          const docUrl = response.data.data.url;
          sendMessage(filename, 'document', docUrl, filename);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
      } catch (err) {
        Alert.alert('Upload Failed', 'Could not share the file. Please try again.');
      } finally {
        setSharing(false);
      }
    }
  };

  // ── Render individual message bubble ─────────────────────────
  const renderMessage = useCallback(({ item: msg }) => {
    const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
    const isDoc = msg.messageType === 'document' || msg.fileUrl;
    const isPending = msg.pending;

    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
        {!isMe && (
          <View style={styles.messageAvatarContainer}>
            {advocateAvatar ? (
              <Image source={{ uri: advocateAvatar }} style={styles.messageAvatar} />
            ) : (
              <View style={styles.messageAvatarPlaceholder}>
                <Text style={styles.messageAvatarInitial}>{(advocateName || 'A')[0].toUpperCase()}</Text>
              </View>
            )}
          </View>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem, isPending && styles.bubblePending]}>
          {isDoc ? (
            <TouchableOpacity
              onPress={() => msg.fileUrl && Linking.openURL(msg.fileUrl)}
              style={styles.documentRow}
            >
              <Ionicons name="document-text" size={24} color={isMe ? '#FFFFFF' : COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.documentName, isMe ? styles.textWhite : styles.textDark]} numberOfLines={1}>
                  {msg.fileName || msg.content || 'Attached File'}
                </Text>
                <Text style={[styles.documentHint, isMe ? styles.textFade : styles.textSecondary]}>
                  Tap to open attachment
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.msgText, isMe ? styles.textWhite : styles.textDark]}>
              {msg.content}
            </Text>
          )}

          <View style={styles.bubbleMeta}>
            <Text style={[styles.msgTime, isMe ? styles.textFade : styles.textSecondary]}>
              {formatDate(msg.createdAt, 'time')}
            </Text>
            {isPending && (
              <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.5)" style={{ marginLeft: 4 }} />
            )}
            {isMe && !isPending && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color={msg.readAt ? '#38BDF8' : 'rgba(255,255,255,0.6)'}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  }, [user?._id, advocateAvatar, advocateName]);

  const renderListHeader = () => {
    if (!hasMore) return (
      <View style={styles.startOfChat}>
        <Text style={styles.startOfChatText}>— Beginning of conversation —</Text>
      </View>
    );
    return null;
  };

  const renderListFooter = () => {
    if (!isTyping) return null;
    return (
      <View style={[styles.bubbleWrapper, styles.bubbleLeft]}>
        <View style={[styles.bubble, styles.bubbleThem, styles.typingBubble]}>
          <Text style={styles.typingText}>typing...</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('ClientMain')} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          onPress={() => {
            if (advocateId) {
              navigation.navigate('AdvocateProfile', { advocateId, advocateName, advocateAvatar });
            } else {
              Alert.alert('Notice', 'Please go back and re-open this chat to load the profile link.');
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.participantAvatar}>
            {advocateAvatar ? (
              <Image source={{ uri: advocateAvatar }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarPlaceholderText}>{(advocateName || 'A')[0].toUpperCase()}</Text>
            )}
          </View>

          <View style={styles.headerMeta}>
            <Text style={styles.participantName} numberOfLines={1}>{advocateName || 'Legal Counsel'}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, connected ? styles.dotOnline : styles.dotOffline]} />
              <Text style={styles.statusLabel}>{connected ? 'online' : 'connecting...'}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => {
            if (zegoRoomId && zegoToken) {
              navigation.navigate('VideoCall', {
                zegoRoomId,
                zegoToken,
                zegoAppId: zegoAppId || 0,
                zegoAppSign: zegoAppSign || '',
                advocateName,
                myUserId:   String(userData._id || ''),
                myUserName: String(userData.name || 'User'),
                mode: callMode || 'voice',
              });
            } else {
              Alert.alert('Chat Only', 'This consultation is chat-based. Voice/video calls are not available for this booking.');
            }
          }}
        >
          <Ionicons
            name={callMode === 'video' ? 'videocam-outline' : 'call-outline'}
            size={20}
            color={zegoRoomId ? COLORS.primary : COLORS.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Scheduled Slot Banner */}
      {scheduledSlot && (
        <View style={styles.slotHeaderBanner}>
          <Ionicons name="time-outline" size={14} color="#D4AF37" />
          <Text style={styles.slotHeaderBannerText}>
            Session Slot: {scheduledSlot}
          </Text>
        </View>
      )}

      {/* Error / Offline banner */}
      {(error || !isConnected) && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color="#FFFFFF" />
          <Text style={styles.offlineBannerText}>
            {!isConnected ? 'Connection lost. Working offline' : 'Reconnecting... Messages will send when back online'}
          </Text>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item._id || `msg-${index}`}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.15}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          ListHeaderComponentStyle={{ paddingTop: 8 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          // Pull-to-top for older messages indicator
          refreshing={loadingMore}
          onRefresh={handleLoadMore}
        />

        {/* Input Bar or Read-Only Banner */}
        {!isConnected ? (
          <View style={styles.readOnlyInputContainer}>
            <Ionicons name="eye-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
            <Text style={styles.readOnlyInputText}>Chat is in read-only mode while offline</Text>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TouchableOpacity
              onPress={handleShareDocument}
              style={styles.attachmentBtn}
              disabled={sharing}
            >
              {sharing ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons name="attach" size={24} color="#6B7280" />
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              value={text}
              onChangeText={handleTextChange}
              placeholder="Type your message..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxHeight={80}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />

            <TouchableOpacity
              onPress={handleSend}
              style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
              disabled={!text.trim()}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F8' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF9F8' },

  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingTop: 12, paddingBottom: 16, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderColor: '#E8E2D8'
  },
  backBtn: { width: 36, padding: 4 },
  participantAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center', marginRight: 10
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 18 },
  avatarPlaceholderText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  headerMeta: { flex: 1 },
  participantName: { fontSize: 14, fontWeight: '700', color: '#2E2A26' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  dotOnline: { backgroundColor: '#10B981' },
  dotOffline: { backgroundColor: '#9CA3AF' },
  statusLabel: { fontSize: 10, color: '#6D6A66', fontWeight: '500' },
  callBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F8F4EC', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E8E2D8',
  },
  slotHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FAF2E8',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E8E2D8',
  },
  slotHeaderBannerText: {
    color: '#8D7865',
    fontSize: 12,
    fontWeight: '700',
  },

  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#B45309', paddingHorizontal: 16, paddingVertical: 8
  },
  offlineBannerText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600', flex: 1 },

  messagesContent: { padding: 16, paddingBottom: 8 },

  startOfChat: { alignItems: 'center', paddingVertical: 16 },
  startOfChatText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },

  bubbleWrapper: { flexDirection: 'row', marginBottom: 6 },
  bubbleLeft: { justifyContent: 'flex-start' },
  bubbleRight: { justifyContent: 'flex-end' },

  bubble: {
    maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1
  },
  bubbleMe: { backgroundColor: COLORS.accent, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E8E2D8' },
  bubblePending: { opacity: 0.7 },

  msgText: { fontSize: 13, lineHeight: 19 },
  textWhite: { color: '#FFFFFF' },
  textDark: { color: '#2E2A26' },
  textFade: { color: 'rgba(255,255,255,0.7)' },
  textSecondary: { color: '#6D6A66' },

  messageAvatarContainer: { marginRight: 8, justifyContent: 'flex-end', paddingBottom: 4 },
  messageAvatar: { width: 28, height: 28, borderRadius: 14 },
  messageAvatarPlaceholder: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FAF2E8', alignItems: 'center', justifyContent: 'center' },
  messageAvatarInitial: { fontSize: 14, fontWeight: '700', color: COLORS.accent },

  bubbleMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  msgTime: { fontSize: 9, fontWeight: '500' },

  documentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 160, paddingVertical: 2 },
  documentName: { fontSize: 12, fontWeight: '700' },
  documentHint: { fontSize: 10, marginTop: 2 },

  typingBubble: { paddingVertical: 8, paddingHorizontal: 12 },
  typingText: { fontSize: 11, fontStyle: 'italic', color: '#6D6A66', fontWeight: '600' },

  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    padding: 10, borderTopWidth: 1, borderColor: '#E8E2D8',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10
  },
  attachmentBtn: { padding: 8, marginRight: 4 },
  textInput: {
    flex: 1, backgroundColor: '#F8F4EC', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, fontSize: 13,
    color: '#2E2A26', marginRight: 8, borderWidth: 1, borderColor: '#E8E2D8',
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center'
  },
  sendBtnDisabled: { backgroundColor: '#D6CFCE' },
  readOnlyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  readOnlyInputText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ChatScreen;
