import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { aiAPI } from '../../services/api';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const DISCLAIMER = '⚠️ AI responses are for informational purposes only and do not constitute legal advice.';

const SUGGESTIONS = [
  'What is an FIR and how to file it?',
  'Explain tenant rights in India',
  'What are bail provisions under BNSS?',
  'Steps to file a consumer complaint',
  'How to transfer property in India?',
];

const AIAssistantScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', content: 'Hello! I\'m your AI Legal Assistant. Ask me any legal question or I can help draft an FIR. Remember, I provide general information only — not legal advice.\n\n' + DISCLAIMER },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatRef = useRef(null);

  const send = async (text) => {
    const q = text || input.trim();
    if (!q) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: q });
      const { data } = await aiAPI.chat(history);
      setMessages((prev) => [...prev, { id: Date.now().toString() + 'a', role: 'assistant', content: data.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { id: Date.now().toString() + 'e', role: 'assistant', content: 'Sorry, I could not process your request. Please try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMsg = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgWrap, isUser && styles.msgWrapUser]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={{ fontSize: 16 }}>🤖</Text>
          </View>
        )}
        <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleAI]}>
          <Text style={[styles.msgText, isUser && styles.msgTextUser]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.aiHeaderIcon}>
            <Text style={{ fontSize: 28 }}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Legal Assistant</Text>
            <Text style={styles.headerSub}>Powered by Claude AI</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('FIRDraft')} style={styles.firBtn}>
            <Text style={styles.firBtnText}>FIR Draft</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMsg}
        contentContainerStyle={styles.msgList}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={loading ? (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        ) : null}
        ListHeaderComponent={
          <View style={styles.suggestions}>
            <Text style={styles.suggestionsTitle}>Quick Questions</Text>
            <View style={styles.suggestionsRow}>
              {SUGGESTIONS.map((s, i) => (
                <TouchableOpacity key={i} onPress={() => send(s)} style={styles.suggestionChip}>
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask a legal question..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          multiline
          returnKeyType="send"
          onSubmitEditing={() => send()}
        />
        <TouchableOpacity
          onPress={() => send()}
          disabled={!input.trim() || loading}
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: SIZES.screenPadding },
  headerInner: { flexDirection: 'row', alignItems: 'center' },
  aiHeaderIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: SIZES.md },
  headerTitle: { fontSize: SIZES.subtitle, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: SIZES.caption, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  firBtn: { marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: SIZES.radiusFull, paddingHorizontal: 14, paddingVertical: 8 },
  firBtnText: { color: '#fff', fontSize: SIZES.caption, fontWeight: '700' },
  msgList: { padding: SIZES.screenPadding, paddingBottom: 20 },
  suggestions: { marginBottom: SIZES.xl },
  suggestionsTitle: { fontSize: SIZES.caption, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 10 },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: { backgroundColor: COLORS.primaryLight, borderRadius: SIZES.radiusFull, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.primary + '40' },
  suggestionText: { fontSize: SIZES.caption, color: COLORS.primary, fontWeight: '600' },
  msgWrap: { flexDirection: 'row', marginBottom: SIZES.lg, alignItems: 'flex-end' },
  msgWrapUser: { flexDirection: 'row-reverse' },
  aiAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.sm },
  msgBubble: { maxWidth: '80%', borderRadius: 16, padding: SIZES.md },
  msgBubbleAI: { backgroundColor: '#f3f4f6', borderBottomLeftRadius: 4 },
  msgBubbleUser: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  msgText: { fontSize: SIZES.body, color: COLORS.textPrimary, lineHeight: 22 },
  msgTextUser: { color: '#fff' },
  loadingBubble: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, gap: 8 },
  loadingText: { fontSize: SIZES.caption, color: COLORS.textMuted },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: SIZES.screenPadding, paddingVertical: 10,
    backgroundColor: '#fff', borderTopWidth: 1, borderColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    ...SHADOWS.sm,
  },
  input: {
    flex: 1, fontSize: SIZES.body, color: COLORS.textPrimary,
    backgroundColor: COLORS.inputBg, borderRadius: SIZES.radiusXl,
    paddingHorizontal: SIZES.lg, paddingVertical: 10,
    maxHeight: 120, marginRight: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: COLORS.textMuted },
});

export default AIAssistantScreen;
