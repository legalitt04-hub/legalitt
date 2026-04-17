// All in one file — split at build time
// ChatListScreen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const ChatListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatAPI.getMyChats().then(({ data }) => setChats(data.data || [])).finally(() => setLoading(false));
  }, []);

  const getOtherParticipant = (chat) =>
    (chat.participants || []).find(p => p._id !== user?._id) || {};

  return (
    <View style={st.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={st.title}>My Chats</Text>
        <View style={{ width: 32 }} />
      </View>
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.primary} /> : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 60 }}><Text style={{ fontSize: 48 }}>💬</Text><Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>No chats yet</Text></View>}
          renderItem={({ item }) => {
            const other = getOtherParticipant(item);
            return (
              <TouchableOpacity
                style={st.chatItem}
                onPress={() => navigation.navigate('Chat', { chatId: item._id, advocateName: other.name, advocateAvatar: other.avatar })}
                activeOpacity={0.8}
              >
                <View style={st.chatAvatar}>
                  {other.avatar ? <Image source={{ uri: other.avatar }} style={{ width: '100%', height: '100%', borderRadius: 24 }} /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>{(other.name || 'A')[0]}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.chatName}>{other.name || 'Advocate'}</Text>
                  <Text style={st.chatLast} numberOfLines={1}>{item.lastMessage?.content || 'Start chatting'}</Text>
                </View>
                <Text style={st.chatTime}>{item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.screenPadding, paddingTop: 52, paddingBottom: 12, borderBottomWidth: 1, borderColor: COLORS.border },
  title: { fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary },
  chatItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.screenPadding, paddingVertical: SIZES.lg, borderBottomWidth: 1, borderColor: COLORS.borderLight },
  chatAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.md },
  chatName: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.textPrimary },
  chatLast: { fontSize: SIZES.caption, color: COLORS.textMuted, marginTop: 2 },
  chatTime: { fontSize: SIZES.tiny, color: COLORS.textMuted },
});

export default ChatListScreen;
