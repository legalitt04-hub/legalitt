// screens/shared/SupportScreen.jsx
// Customer Support + Bug Report for both Client and Advocate

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, Alert, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#B89A6A';
const BG      = '#FAF9F8';

// ─── Common Issues per Role ───────────────────────────────────────────────────
const CLIENT_ISSUES = [
  {
    icon: 'card-outline',
    label: 'Payment Failed',
    subject: 'Payment Failed / Deducted but not confirmed',
    category: 'payment',
    priority: 'high',
    template: 'My payment was deducted but my booking is still showing as pending. Please help me resolve this.',
  },
  {
    icon: 'person-remove-outline',
    label: 'Advocate Not Responding',
    subject: 'Advocate not responding to my consultation',
    category: 'consultation',
    priority: 'high',
    template: 'My advocate is not responding to my chat/call. Booking ID: [ADD YOUR BOOKING ID]. Please help.',
  },
  {
    icon: 'videocam-off-outline',
    label: 'Call Not Working',
    subject: 'Video / Voice call not connecting',
    category: 'technical',
    priority: 'high',
    template: 'I am unable to start/join the video or voice call for my consultation. The call screen shows an error.',
  },
  {
    icon: 'time-outline',
    label: 'Session Expired',
    subject: 'Consultation session expired before completion',
    category: 'consultation',
    priority: 'medium',
    template: 'My consultation session expired before I could complete my discussion with the advocate. Please extend or reopen the session.',
  },
  {
    icon: 'document-attach-outline',
    label: 'Document Upload Issue',
    subject: 'Unable to upload documents',
    category: 'technical',
    priority: 'medium',
    template: 'I am unable to upload my documents to the consultation. The upload fails with an error.',
  },
  {
    icon: 'calendar-outline',
    label: 'Reschedule Issue',
    subject: 'Cannot reschedule my consultation',
    category: 'consultation',
    priority: 'medium',
    template: 'I need to reschedule my consultation but the system is not allowing me to do so.',
  },
  {
    icon: 'lock-closed-outline',
    label: 'Login / Account Issue',
    subject: 'Cannot login to my account',
    category: 'account',
    priority: 'high',
    template: 'I am unable to login to my Legalitt account. My registered phone/email is: [ADD YOUR CONTACT].',
  },
  {
    icon: 'star-outline',
    label: 'Refund Request',
    subject: 'Refund request for cancelled consultation',
    category: 'payment',
    priority: 'high',
    template: 'My consultation was cancelled and I have not received my refund yet. Booking ID: [ADD BOOKING ID]. Payment Date: [ADD DATE].',
  },
  {
    icon: 'chatbubble-ellipses-outline',
    label: 'Chat Not Loading',
    subject: 'Chat messages not loading',
    category: 'technical',
    priority: 'medium',
    template: 'The chat screen is not loading messages or I cannot send messages in my consultation chat.',
  },
  {
    icon: 'shield-checkmark-outline',
    label: 'FIR Draft Issue',
    subject: 'FIR draft not generated / incorrect',
    category: 'legal',
    priority: 'medium',
    template: 'The AI FIR draft was not generated correctly or has incorrect details. Please review my FIR request.',
  },
];

const ADVOCATE_ISSUES = [
  {
    icon: 'wallet-outline',
    label: 'Withdrawal Not Received',
    subject: 'Withdrawal request not processed',
    category: 'payment',
    priority: 'high',
    template: 'I submitted a withdrawal request but have not received the payment in my bank account. Withdrawal ID: [ADD ID]. Date: [ADD DATE].',
  },
  {
    icon: 'checkmark-circle-outline',
    label: 'Profile Not Approved',
    subject: 'Advocate profile pending approval for too long',
    category: 'account',
    priority: 'high',
    template: 'My advocate profile has been pending for more than 48 hours. Please review and approve my documents.',
  },
  {
    icon: 'document-text-outline',
    label: 'Documents Rejected',
    subject: 'My verification documents were rejected',
    category: 'account',
    priority: 'high',
    template: 'My verification documents were rejected but I have not received a clear reason. Please help me understand what needs to be corrected.',
  },
  {
    icon: 'notifications-off-outline',
    label: 'Not Receiving Bookings',
    subject: 'Not receiving new consultation requests',
    category: 'consultation',
    priority: 'high',
    template: 'I am not receiving any new consultation requests even though my profile is active. Please check my account status.',
  },
  {
    icon: 'call-outline',
    label: 'Client Not Joining Call',
    subject: 'Client not joining video/voice call',
    category: 'consultation',
    priority: 'medium',
    template: 'My client is not joining the scheduled video/voice call. Booking ID: [ADD ID]. Please help notify the client.',
  },
  {
    icon: 'trending-up-outline',
    label: 'Earnings Discrepancy',
    subject: 'Earnings amount appears incorrect',
    category: 'payment',
    priority: 'high',
    template: 'The earnings shown in my wallet do not match the consultations I have completed. Please review my earnings.',
  },
  {
    icon: 'search-outline',
    label: 'Profile Not Visible',
    subject: 'My advocate profile is not visible in search',
    category: 'account',
    priority: 'medium',
    template: 'My advocate profile is approved but I cannot see it appearing in the client search results.',
  },
  {
    icon: 'phone-portrait-outline',
    label: 'App Technical Issue',
    subject: 'App crashing / technical problem',
    category: 'technical',
    priority: 'medium',
    template: 'The Legalitt app is crashing or showing a technical error. Device: [ADD DEVICE]. Issue: [DESCRIBE].',
  },
  {
    icon: 'time-outline',
    label: 'Session Time Issue',
    subject: 'Consultation session time limit issue',
    category: 'consultation',
    priority: 'medium',
    template: 'My consultation session ended before the scheduled time. Please extend the session for booking ID: [ADD ID].',
  },
  {
    icon: 'star-half-outline',
    label: 'Unfair Review',
    subject: 'Client left an unfair/fake review',
    category: 'legal',
    priority: 'medium',
    template: 'I received an unfair or fake review from a client. Review details: [DESCRIBE]. Please investigate and remove if appropriate.',
  },
];

const FAQ_DATA = [
  {
    role: 'client',
    q: 'How long will it take to assign an advocate to me?',
    a: 'Advocates are typically assigned within 24 hours of booking. You will receive a push notification as soon as an advocate is assigned.',
  },
  {
    role: 'client',
    q: 'Can I get a refund if I am not satisfied?',
    a: 'Yes, refunds are available for cancelled bookings before the session starts. Once a session is in progress, refunds are evaluated case-by-case.',
  },
  {
    role: 'client',
    q: 'How do I start a video/voice call?',
    a: 'Go to My Requests → your confirmed booking → tap "Video Call" or "Voice Call". Make sure the booking is confirmed and the scheduled time has arrived.',
  },
  {
    role: 'advocate',
    q: 'How long does profile verification take?',
    a: 'Profile verification usually takes 24–48 hours. Make sure all your documents (Bar Council certificate, Aadhar) are clearly uploaded.',
  },
  {
    role: 'advocate',
    q: 'When will my withdrawal be processed?',
    a: 'Withdrawals are processed within 3–5 business days. Minimum withdrawal amount is ₹500. You will receive a notification when processed.',
  },
  {
    role: 'advocate',
    q: 'Why am I not receiving new bookings?',
    a: 'Ensure your profile is approved and you are set as available. Also check that your specializations match what clients are searching for.',
  },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SupportScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const role = user?.role || 'client';
  const isAdvocate = role === 'advocate';

  const issues  = isAdvocate ? ADVOCATE_ISSUES  : CLIENT_ISSUES;
  const myFAQs  = FAQ_DATA.filter(f => f.role === role);

  const [tab, setTab]           = useState('help'); // help | faq | mytickets
  const [modal, setModal]       = useState(false);
  const [submitting, setSub]    = useState(false);
  const [myTickets, setMyTkts]  = useState([]);
  const [tktLoading, setTktL]   = useState(false);
  const [expandedFAQ, setFAQex] = useState(null);
  
  // Ticket Reply state
  const [viewTicket, setViewTicket] = useState(null);
  const [replyText, setReplyText]   = useState('');
  const [replying, setReplying]     = useState(false);

  const [form, setForm] = useState({
    subject: '', description: '', category: 'general', priority: 'medium',
  });

  const openIssue = (issue) => {
    setForm({
      subject:     issue.subject,
      description: issue.template,
      category:    issue.category,
      priority:    issue.priority,
    });
    setModal(true);
  };

  const openBugReport = () => {
    setForm({
      subject:     'Bug Report: App issue',
      description: 'Steps to reproduce:\n1. \n2. \n\nExpected: \nActual: \n\nDevice/OS: ',
      category:    'bug',
      priority:    'medium',
    });
    setModal(true);
  };

  const openBlankTicket = () => {
    setForm({ subject: '', description: '', category: 'general', priority: 'medium' });
    setModal(true);
  };

  const submit = async () => {
    if (!form.subject.trim() || !form.description.trim()) {
      Alert.alert('Required', 'Please fill in subject and description.');
      return;
    }
    setSub(true);
    try {
      await api.post('/support', form);
      setModal(false);
      Alert.alert('✅ Ticket Submitted!', 'Our support team will respond within 24 hours. You can track it in "My Tickets".');
      fetchMyTickets();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to submit. Try again.');
    } finally {
      setSub(false);
    }
  };

  const fetchMyTickets = useCallback(async () => {
    setTktL(true);
    try {
      const { data } = await api.get('/support/mine');
      setMyTkts(data.data || []);
    } catch {
      setMyTkts([]);
    } finally {
      setTktL(false);
    }
  }, []);

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      const { data } = await api.post(`/support/${viewTicket._id}/reply`, { message: replyText });
      setViewTicket(data.data);
      setReplyText('');
      fetchMyTickets();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const STATUS_CFG = {
    open:        { color: '#EF4444', bg: '#FEF2F2', label: 'Open' },
    'in-progress':{ color: '#F59E0B', bg: '#FFFBEB', label: 'In Progress' },
    resolved:    { color: '#10B981', bg: '#ECFDF5', label: 'Resolved' },
    closed:      { color: '#94A3B8', bg: '#F8FAFC', label: 'Closed' },
  };

  const PRIORITY_COLOR = { high: '#EF4444', medium: '#F59E0B', low: '#10B981', urgent: '#7C3AED' };

  return (
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#2E2A26" />
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Help & Support</Text>
          <Text style={s.headerSub}>{isAdvocate ? 'Advocate Support' : 'Client Support'}</Text>
        </View>
        <TouchableOpacity onPress={openBugReport} style={s.bugBtn}>
          <Ionicons name="bug-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {[
          { key: 'help',      label: 'Get Help',  icon: 'help-circle-outline' },
          { key: 'faq',       label: 'FAQ',        icon: 'book-outline' },
          { key: 'mytickets', label: 'My Tickets', icon: 'list-outline' },
        ].map(t => (
          <TouchableOpacity key={t.key}
            style={[s.tab, tab === t.key && s.tabActive]}
            onPress={() => { setTab(t.key); if (t.key === 'mytickets') fetchMyTickets(); }}>
            <Ionicons name={t.icon} size={14} color={tab === t.key ? '#FFFFFF' : '#8D7865'} />
            <Text style={[s.tabLabel, tab === t.key && s.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── GET HELP TAB ── */}
      {tab === 'help' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingTop: 8 }} showsVerticalScrollIndicator={false}>
          {/* Quick actions */}
          <View style={s.quickRow}>
            <TouchableOpacity style={s.quickCard} onPress={openBlankTicket}>
              <View style={[s.quickIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="create-outline" size={22} color="#3B82F6" />
              </View>
              <Text style={s.quickLabel}>New Ticket</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.quickCard} onPress={openBugReport}>
              <View style={[s.quickIcon, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="bug-outline" size={22} color="#EF4444" />
              </View>
              <Text style={s.quickLabel}>Report Bug</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.quickCard} onPress={() => { setTab('mytickets'); fetchMyTickets(); }}>
              <View style={[s.quickIcon, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="checkmark-circle-outline" size={22} color="#10B981" />
              </View>
              <Text style={s.quickLabel}>My Tickets</Text>
            </TouchableOpacity>
          </View>

          {/* Common Issues */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Common Issues</Text>
            <Text style={s.sectionSub}>Tap any issue to auto-fill and submit a support ticket</Text>
            <View style={s.issueGrid}>
              {issues.map((issue, i) => (
                <TouchableOpacity key={i} style={s.issueCard} onPress={() => openIssue(issue)} activeOpacity={0.75}>
                  <View style={[s.issueIcon, { backgroundColor: PRIORITY_COLOR[issue.priority] + '15' }]}>
                    <Ionicons name={issue.icon} size={20} color={PRIORITY_COLOR[issue.priority]} />
                  </View>
                  <Text style={s.issueLabel}>{issue.label}</Text>
                  <Ionicons name="chevron-forward" size={12} color="#C4B5A5" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact */}
          <View style={s.contactBox}>
            <Ionicons name="mail-outline" size={20} color={PRIMARY} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.contactTitle}>Email Support</Text>
              <Text style={s.contactSub}>support@legalitt.com · Response in 24hrs</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* ── FAQ TAB ── */}
      {tab === 'faq' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
          <Text style={s.sectionTitle}>{isAdvocate ? 'Advocate' : 'Client'} FAQs</Text>
          {myFAQs.map((faq, i) => (
            <TouchableOpacity key={i} style={s.faqCard} activeOpacity={0.8}
              onPress={() => setFAQex(expandedFAQ === i ? null : i)}>
              <View style={s.faqQ}>
                <Text style={s.faqQText}>{faq.q}</Text>
                <Ionicons name={expandedFAQ === i ? 'chevron-up' : 'chevron-down'} size={16} color="#8D7865" />
              </View>
              {expandedFAQ === i && <Text style={s.faqA}>{faq.a}</Text>}
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={s.contactBox} onPress={openBlankTicket}>
            <Ionicons name="help-circle-outline" size={20} color={PRIMARY} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.contactTitle}>Didn't find your answer?</Text>
              <Text style={s.contactSub}>Submit a support ticket and we'll help you</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={PRIMARY} />
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ── MY TICKETS TAB ── */}
      {tab === 'mytickets' && (
        tktLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        ) : (
          <FlatList
            data={myTickets}
            keyExtractor={(item, i) => item._id || String(i)}
            contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120, gap: 12 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingTop: 60, gap: 10 }}>
                <Ionicons name="ticket-outline" size={48} color="#D1C4B8" />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#2E2A26' }}>No tickets yet</Text>
                <Text style={{ color: '#8D7865', textAlign: 'center' }}>Your submitted support tickets will appear here</Text>
                <TouchableOpacity style={[s.submitBtn, { marginTop: 16, paddingHorizontal: 24 }]} onPress={openBlankTicket}>
                  <Text style={s.submitBtnText}>Submit a Ticket</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => {
              const cfg = STATUS_CFG[item.status] || STATUS_CFG.open;
              return (
                <TouchableOpacity style={s.ticketCard} activeOpacity={0.8} onPress={() => setViewTicket(item)}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    <Text style={s.ticketDate}>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </Text>
                  </View>
                  <Text style={s.ticketSubject}>{item.subject}</Text>
                  <Text style={s.ticketDesc} numberOfLines={2}>{item.description}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <View style={[s.catBadge, { backgroundColor: '#F8F4EC' }]}>
                      <Text style={s.catText}>{item.category}</Text>
                    </View>
                    <View style={[s.catBadge, { backgroundColor: PRIORITY_COLOR[item.priority] + '15' }]}>
                      <Text style={[s.catText, { color: PRIORITY_COLOR[item.priority] }]}>{item.priority}</Text>
                    </View>
                  </View>
                  {item.messages?.length > 0 && (
                    <View style={s.replyBox}>
                      <Ionicons name="chatbubble-ellipses" size={12} color={PRIMARY} />
                      <Text style={s.replyText} numberOfLines={2}>
                        {item.messages[item.messages.length - 1]?.isStaff ? 'Agent: ' : 'You: '}
                        {item.messages[item.messages.length - 1]?.message}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )
      )}

      {/* ── SUBMIT MODAL ── */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setModal(false)} />
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Submit Support Ticket</Text>
            <Text style={s.modalSub}>We'll respond within 24 hours</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {/* Category */}
              <Text style={s.fieldLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}
                contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}>
                {['general', 'payment', 'consultation', 'technical', 'account', 'legal', 'bug'].map(c => (
                  <TouchableOpacity key={c} onPress={() => setForm(f => ({ ...f, category: c }))}
                    style={[s.catChip, form.category === c && s.catChipActive]}>
                    <Text style={[s.catChipText, form.category === c && { color: '#FFFFFF' }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Priority */}
              <Text style={s.fieldLabel}>Priority</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {['low', 'medium', 'high'].map(p => (
                  <TouchableOpacity key={p} onPress={() => setForm(f => ({ ...f, priority: p }))}
                    style={[s.catChip, { flex: 1, justifyContent: 'center' }, form.priority === p && { backgroundColor: PRIORITY_COLOR[p], borderColor: PRIORITY_COLOR[p] }]}>
                    <Text style={[s.catChipText, form.priority === p && { color: '#FFFFFF' }]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Subject */}
              <Text style={s.fieldLabel}>Subject *</Text>
              <TextInput
                style={s.input}
                placeholder="Brief description of your issue..."
                placeholderTextColor="#C4B5A5"
                value={form.subject}
                onChangeText={t => setForm(f => ({ ...f, subject: t }))}
              />

              {/* Description */}
              <Text style={s.fieldLabel}>Description *</Text>
              <TextInput
                style={[s.input, { height: 130, textAlignVertical: 'top' }]}
                placeholder="Please describe your issue in detail..."
                placeholderTextColor="#C4B5A5"
                multiline
                value={form.description}
                onChangeText={t => setForm(f => ({ ...f, description: t }))}
              />

              <TouchableOpacity
                style={[s.submitBtn, submitting && { backgroundColor: '#C4B5A5' }]}
                onPress={submit}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.submitBtnText}>Submit Ticket</Text>
                }
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── TICKET DETAILS / REPLY MODAL ── */}
      <Modal visible={!!viewTicket} transparent animationType="slide" onRequestClose={() => setViewTicket(null)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setViewTicket(null)} />
          <View style={[s.modalSheet, { height: '85%' }]}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>{viewTicket?.subject}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
               <View style={[s.statusBadge, { backgroundColor: (STATUS_CFG[viewTicket?.status] || STATUS_CFG.open).bg }]}>
                  <Text style={[s.statusText, { color: (STATUS_CFG[viewTicket?.status] || STATUS_CFG.open).color }]}>
                     {(STATUS_CFG[viewTicket?.status] || STATUS_CFG.open).label}
                  </Text>
               </View>
               <Text style={s.ticketDate}>
                  {new Date(viewTicket?.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
               </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              <View style={[s.msgBubble, { alignSelf: 'flex-end', backgroundColor: '#F8F4EC', borderBottomRightRadius: 4 }]}>
                 <Text style={s.msgText}>{viewTicket?.description}</Text>
              </View>

              {viewTicket?.messages?.map((msg, i) => (
                <View key={i} style={[
                  s.msgBubble, 
                  msg.isStaff 
                    ? { alignSelf: 'flex-start', backgroundColor: '#F1F5F9', borderBottomLeftRadius: 4 }
                    : { alignSelf: 'flex-end', backgroundColor: '#F8F4EC', borderBottomRightRadius: 4 }
                ]}>
                  {msg.isStaff && <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '700', marginBottom: 4 }}>Support Team</Text>}
                  <Text style={s.msgText}>{msg.message}</Text>
                </View>
              ))}
            </ScrollView>

            {viewTicket?.status !== 'closed' && viewTicket?.status !== 'resolved' ? (
              <View style={s.replyInputBox}>
                <TextInput 
                  style={s.replyInput}
                  placeholder="Type a reply..."
                  value={replyText}
                  onChangeText={setReplyText}
                  multiline
                />
                <TouchableOpacity style={s.sendBtn} onPress={sendReply} disabled={replying || !replyText.trim()}>
                  {replying ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={16} color="#fff" />}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ padding: 16, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, marginBottom: 16 }}>
                 <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '600' }}>This ticket has been {viewTicket?.status}.</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#F1EDE6',
    gap: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F4EC', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#2E2A26' },
  headerSub:   { fontSize: 11, color: '#8D7865', fontWeight: '600' },
  bugBtn: { marginLeft: 'auto', width: 38, height: 38, borderRadius: 19, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECACA' },

  tabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8, gap: 8, borderBottomWidth: 1, borderColor: '#F1EDE6' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F8F4EC', borderWidth: 1, borderColor: '#E8E2D8' },
  tabActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  tabLabel: { fontSize: 11, fontWeight: '700', color: '#8D7865' },
  tabLabelActive: { color: '#FFFFFF' },

  quickRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  quickCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#F1EDE6', elevation: 1, shadowColor: '#0000000A', shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  quickIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '700', color: '#4B3F35', textAlign: 'center' },

  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#2E2A26', marginBottom: 4 },
  sectionSub: { fontSize: 11, color: '#8D7865', marginBottom: 14 },
  issueGrid: { gap: 8 },
  issueCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#F1EDE6',
    elevation: 1, shadowColor: '#0000000A', shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
  },
  issueIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  issueLabel: { flex: 1, fontSize: 13, fontWeight: '700', color: '#2E2A26' },

  contactBox: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: '#FDF8F2', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E8E2D8',
  },
  contactTitle: { fontSize: 13, fontWeight: '700', color: '#2E2A26' },
  contactSub: { fontSize: 11, color: '#8D7865', marginTop: 2 },

  faqCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#F1EDE6', marginBottom: 10, overflow: 'hidden' },
  faqQ: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10 },
  faqQText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#2E2A26' },
  faqA: { fontSize: 13, color: '#6D6A66', lineHeight: 20, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 },

  ticketCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1EDE6', elevation: 1, shadowColor: '#0000000A', shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  statusText: { fontSize: 11, fontWeight: '800' },
  ticketDate: { fontSize: 11, color: '#A8A29E' },
  ticketSubject: { fontSize: 14, fontWeight: '700', color: '#2E2A26', marginBottom: 4 },
  ticketDesc: { fontSize: 12, color: '#8D7865', lineHeight: 18 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catText: { fontSize: 10, fontWeight: '700', color: '#8D7865', textTransform: 'capitalize' },
  replyBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10, backgroundColor: '#FDF8F2', borderRadius: 10, padding: 10, borderLeftWidth: 3, borderLeftColor: PRIMARY },
  replyText: { flex: 1, fontSize: 12, color: '#6D6A66', fontStyle: 'italic' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 0, maxHeight: '90%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2D8CC', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#2E2A26', marginBottom: 4 },
  modalSub: { fontSize: 12, color: '#8D7865', marginBottom: 20 },

  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#8D7865', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  input: {
    backgroundColor: '#F8F4EC', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, color: '#2E2A26', borderWidth: 1, borderColor: '#E8E2D8', marginBottom: 16,
  },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5, borderColor: '#E8E2D8', backgroundColor: '#F8F4EC' },
  catChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  catChipText: { fontSize: 12, fontWeight: '700', color: '#6D6A66', textTransform: 'capitalize' },

  submitBtn: { height: 52, borderRadius: 14, backgroundColor: '#2E2A26', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },

  msgBubble: { maxWidth: '85%', padding: 12, borderRadius: 16, marginBottom: 12 },
  msgText: { fontSize: 13, color: '#334155', lineHeight: 18 },
  replyInputBox: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderTopWidth: 1, borderColor: '#F1EDE6', backgroundColor: '#FFFFFF', paddingBottom: 30 },
  replyInput: { flex: 1, backgroundColor: '#F8F4EC', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 13, color: '#2E2A26', maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
