// screens/shared/ChatScreen.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

const ChatScreen = ({ navigation, route }) => {
  const scrollViewRef = useRef(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      from: 'them',
      text: 'Hello, you can now message me with any case concerns or upload any relevant documents here.',
    },
    {
      id: '2',
      from: 'me',
      text: 'Yes I can easily send message and upload any relevant documents easily.',
    },
    {
      id: '3',
      from: 'them',
      text: 'Hello, you can now message me with any case concerns or upload any relevant documents here.',
    },
    {
      id: '4',
      from: 'me',
      text: 'Yes I can easily send message',
    },
    {
      id: '5',
      from: 'them',
      file: { name: 'Adharcard.pdf', size: '1.2 MB' },
    },
  ]);

  const advocate = {
    name: 'Ajay Chohan',
    avatar: 'https://i.pravatar.cc/100?img=12',
    verified: true,
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      from: 'me',
      text: message.trim(),
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate response after 1 second
    setTimeout(() => {
      const response = {
        id: (Date.now() + 1).toString(),
        from: 'them',
        text: 'Thank you for your message. I will review and get back to you shortly.',
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  const handleAttachment = () => {
    // TODO: Implement file picker
    console.log('Open file picker');
  };

  const handleCall = () => {
    // TODO: Implement voice call
    console.log('Start voice call');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Image source={{ uri: advocate.avatar }} style={styles.headerAvatar} />
          <View style={styles.headerTextContainer}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName}>{advocate.name}</Text>
              {advocate.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={8} color="#FFFFFF" />
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={{ width: 24 }} />
      </View>

      {/* Timer Banner */}
      <View style={styles.timerBanner}>
        <Text style={styles.timerText}>● Chat valid upto 1 Hour from now</Text>
        <Text style={styles.timerText}>1:00:00 min</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.from === 'me' ? styles.messageRowMe : styles.messageRowThem,
              ]}
            >
              {msg.from === 'them' && (
                <Image source={{ uri: advocate.avatar }} style={styles.messageAvatar} />
              )}

              <View
                style={[
                  styles.messageBubble,
                  msg.from === 'me' ? styles.messageBubbleMe : styles.messageBubbleThem,
                ]}
              >
                {msg.text && <Text style={styles.messageText}>{msg.text}</Text>}

                {msg.file && (
                  <TouchableOpacity style={styles.fileContainer}>
                    <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName}>{msg.file.name}</Text>
                      <Text style={styles.fileSize}>{msg.file.size} · Tap to view</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachment}>
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic-outline" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Ionicons name="call-outline" size={16} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sendButtonWrapper} onPress={handleSend}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark || '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendButton}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerTextContainer: {
    marginLeft: 8,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowThem: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageBubbleMe: {
    backgroundColor: '#F0FDFA',
    borderBottomRightRadius: 4,
  },
  messageBubbleThem: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 12,
    color: '#1F2937',
    lineHeight: 18,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  fileSize: {
    fontSize: 10,
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    maxHeight: 80,
  },
  micButton: {
    marginLeft: 8,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;
