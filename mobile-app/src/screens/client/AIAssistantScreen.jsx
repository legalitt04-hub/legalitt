import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator,
  Alert, Modal, Linking, Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import EventSource from 'react-native-sse';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import api, { BASE_URL } from '../../services/api';

import { FormattedAIResponse } from '../../components/ai/FormattedAIResponse';

const DISCLAIMER = '⚠️ AI responses are for informational purposes only and do not constitute legal advice.';

const AIAssistantScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      role: 'model', 
      content: 'Hello! I\'m your AI Legal Assistant. I can help you with:\n\n• Legal questions and explanations\n• Document analysis\n• FIR drafting guidance\n\n' + DISCLAIMER 
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  
  const flatRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    requestAudioPermission();

    const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const showSub = Keyboard.addListener(keyboardShowEvent, () => {
      setTimeout(() => {
        flatRef.current?.scrollToEnd({ animated: true });
      }, 50);
    });

    return () => {
      showSub.remove();
    };
  }, []);

  const requestAudioPermission = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.log('Audio permission error:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/ai/history');
      if (response.data.success) {
        setChatHistory(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching history:', error);
    }
  };

  const loadSession = (session) => {
    const formattedMsgs = session.messages.map(m => ({
      id: m._id,
      role: m.role,
      content: m.content
    }));
    setMessages(formattedMsgs);
    setCurrentConversationId(session._id);
    setShowHistory(false);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const deleteSession = async (id) => {
    try {
      await api.delete(`/ai/history/${id}`);
      setChatHistory(prev => prev.filter(s => s._id !== id));
      if (currentConversationId === id) startNewChat();
    } catch (error) {
      Alert.alert('Error', 'Could not delete conversation');
    }
  };

  const startNewChat = () => {
    setMessages([{ id: '1', role: 'model', content: 'How can I help you today?\n\n' + DISCLAIMER }]);
    setCurrentConversationId(null);
    setUploadedDoc(null);
    setShowHistory(false);
  };

  const sendToAI = async (userMessage, documentContent = null) => {
    return new Promise(async (resolve, reject) => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        const url = `${BASE_URL}/ai/stream?message=${encodeURIComponent(userMessage)}&conversationId=${currentConversationId || ''}`;
        
        let fullReply = '';
        setMessages(prev => [...prev, { id: 'streaming', role: 'model', content: '' }]);

        const es = new EventSource(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        es.addEventListener('message', (event) => {
          const data = JSON.parse(event.data);
          
          if (data.chunk) {
            fullReply += data.chunk;
            setMessages(prev => prev.map(m => 
              m.id === 'streaming' ? { ...m, content: fullReply } : m
            ));
            setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 20);
          }

          if (data.done) {
            if (!currentConversationId) {
              setCurrentConversationId(data.conversationId);
              fetchHistory();
            }
            setMessages(prev => prev.map(m => 
              m.id === 'streaming' ? { ...m, id: Date.now().toString() + '_ai', content: fullReply + DISCLAIMER } : m
            ));
            es.close();
            setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 50);
            resolve(true);
          }

          if (data.error) {
            es.close();
            reject(new Error(data.error));
          }
        });

        es.addEventListener('error', (err) => {
          console.error('SSE Error:', err);
          es.close();
          reject(err);
        });

      } catch (error) {
        console.error('AI Error:', error);
        reject(error);
      }
    });
  };

  const send = async (text) => {
    const q = text || input.trim();
    if (!q && !uploadedDoc) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: q }]);
    setInput('');
    setLoading(true);

    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      await sendToAI(q, uploadedDoc?.content);
      setUploadedDoc(null);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString() + '_err', role: 'model', content: 'Error connecting to AI.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*', 'text/*'] });
      if (result.canceled) return;
      const file = result.assets[0];
      if (file.mimeType?.startsWith('text/')) {
        const content = await FileSystem.readAsStringAsync(file.uri);
        setUploadedDoc({ name: file.name, content: content.substring(0, 5000) });
      } else {
        Alert.alert('Support', 'Please upload text files for analysis.');
      }
    } catch (error) { console.log(error); }
  };

  const renderMsg = ({ item }) => (
    <View style={[styles.msgWrap, item.role === 'user' && styles.msgWrapUser]}>
      {item.role !== 'user' && <View style={styles.aiAvatar}><Text>🤖</Text></View>}
      <View style={[styles.msgBubble, item.role === 'user' ? styles.msgBubbleUser : styles.msgBubbleAI]}>
        {item.role === 'user' ? (
          <Text style={[styles.msgText, styles.msgTextUser]}>{item.content}</Text>
        ) : (
          <FormattedAIResponse content={item.content} onSelectFollowUp={(q) => send(q)} />
        )}
      </View>
    </View>
  );

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header stays pinned at top outside KeyboardAvoidingView */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark || '#8D7865']} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.headerTitle}>AI Legal Assistant</Text>
            <Text style={styles.headerSub}>Secure & Private</Text>
          </View>
          <TouchableOpacity onPress={() => setShowHistory(true)}><Ionicons name="time-outline" size={24} color="#fff" /></TouchableOpacity>
        </View>
      </LinearGradient>

      {/* KeyboardAvoidingView adjusts view layout dynamically on iOS & Android */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <FlatList
              ref={flatRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMsg}
              contentContainerStyle={styles.msgList}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
              ListFooterComponent={loading && <ActivityIndicator color={COLORS.primary} style={{ margin: 10 }} />}
            />
          </View>
        </TouchableWithoutFeedback>

        {uploadedDoc && (
          <View style={styles.docIndicator}>
            <Text style={styles.docIndicatorText}>{uploadedDoc.name}</Text>
            <TouchableOpacity onPress={() => setUploadedDoc(null)}>
              <Ionicons name="close-circle" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.inputBar, { paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 12) : 12 }]}>
          <TouchableOpacity onPress={pickDocument} activeOpacity={0.7}>
            <Ionicons name="attach" size={28} color={COLORS.textSecondary || '#6B7280'} />
          </TouchableOpacity>
          <TextInput
            value={input}
            onChangeText={(txt) => {
              setInput(txt);
              flatRef.current?.scrollToEnd({ animated: true });
            }}
            onFocus={() => {
              setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
            }}
            placeholder="Type message..."
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            multiline
          />
          <TouchableOpacity onPress={() => send()} style={styles.sendBtn} activeOpacity={0.8}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Modal visible={showHistory} animationType="slide">
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chat History</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={chatHistory}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.historyItemRow}>
                  <TouchableOpacity style={styles.historyItem} onPress={() => loadSession(item)}>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.historyDate}>{new Date(item.lastUpdated).toLocaleDateString()}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteSession(item._id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No history found</Text>
                </View>
              }
            />
            
            <TouchableOpacity style={styles.newChatBtn} onPress={startNewChat}>
              <Text style={styles.newChatBtnText}>+ Start New Conversation</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { paddingTop: 10, paddingBottom: 15, paddingHorizontal: 20 },
  headerInner: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  msgList: { padding: 20, paddingBottom: 10 },
  msgWrap: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end' },
  msgWrapUser: { flexDirection: 'row-reverse' },
  aiAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  msgBubble: { maxWidth: '80%', padding: 12, borderRadius: 15 },
  msgBubbleAI: { backgroundColor: '#f0f0f0' },
  msgBubbleUser: { backgroundColor: COLORS.primary },
  msgText: { fontSize: 14, color: '#333' },
  msgTextUser: { color: '#fff' },
  inputBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    backgroundColor: '#FFFFFF', 
    borderTopWidth: 1, 
    borderColor: '#E8E2D9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  input: { 
    flex: 1, 
    marginHorizontal: 10, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    backgroundColor: '#FAFAF8', 
    borderRadius: 22, 
    borderWidth: 1, 
    borderColor: '#E8E2D9', 
    fontSize: 14, 
    color: '#1F2937', 
    maxHeight: 110, 
    minHeight: 44,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  docIndicator: { padding: 10, backgroundColor: 'rgba(176, 156, 133, 0.15)', flexDirection: 'row', justifyContent: 'space-between' },
  docIndicatorText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  modalContent: { flex: 1, paddingTop: 50 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  historyItemRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    borderBottomWidth: 1, 
    borderColor: '#eee' 
  },
  historyItem: { flex: 1, paddingVertical: 15 },
  historyTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  historyDate: { fontSize: 11, color: '#999', marginTop: 2 },
  deleteBtn: { padding: 10 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999' },
  newChatBtn: { 
    margin: 20, 
    padding: 15, 
    backgroundColor: COLORS.primary, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  newChatBtnText: { color: '#fff', fontWeight: '700' }
});

export default AIAssistantScreen;
