import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// Theme Colors matching "Legal notice response pdf (1).pdf"
const THEME = {
  background: '#FAF9F8',       // Light cream / off-white page bg
  cardBg: '#FFFFFF',           // Pure white
  primary: '#8C6E52',          // Warm beige / tan primary
  primaryLight: COLORS.accent,     // Soft secondary beige
  cardBorder: '#F0ECE7',       // Subtle card border
  badgeBg: '#F5EFEB',          // Neutral badge bg
  textDark: '#2D2824',         // Dark charcoal
  textMuted: '#7D756E',        // Muted secondary text
  textSubtle: '#9E958C',
  divider: '#F0ECE7',

  // Status Badges
  statusPendingBg: '#F5EFEB',
  statusPendingText: '#8C6E52',
  statusDraftBg: '#FEF3C7',
  statusDraftText: '#B45309',
  statusReadyBg: '#E0E7FF',
  statusReadyText: '#4338CA',
  statusSuccessBg: '#DCFCE7',
  statusSuccessText: '#15803D',
  statusFailedBg: '#FEE2E2',
  statusFailedText: '#B91C1C',
  statusNeutralBg: '#F3F4F6',
  statusNeutralText: '#4B5563',
};

import {
  MOCK_LEGAL_NOTICE_CASE,
  MOCK_LEGAL_NOTICE_STATES,
} from '../../data/legalNoticeResponseMock';

export default function LegalNoticeResponseScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  // Dynamic Case & Client Parameters (with mock defaults from src/data/legalNoticeResponseMock.js)
  const clientName = route?.params?.clientName || MOCK_LEGAL_NOTICE_CASE.client.name;
  const caseTitle = route?.params?.caseTitle || MOCK_LEGAL_NOTICE_CASE.caseTitle;
  const caseId = route?.params?.caseId || MOCK_LEGAL_NOTICE_CASE.caseId;
  const clientId = route?.params?.clientId || MOCK_LEGAL_NOTICE_CASE.client.id;
  const legalNoticeId = route?.params?.legalNoticeId || MOCK_LEGAL_NOTICE_CASE.noticeId;
  const advocateName = route?.params?.advocateName || MOCK_LEGAL_NOTICE_CASE.advocate.name;

  // ─── WORKFLOW STATE MACHINE ────────────────────────────────────────────────
  // States: 'pending' | 'draft_saved' | 'response_ready' | 'upload_signed' | 'signed_uploaded' | 'submitted' | 'failed' | 'no_document' | 'no_response_required'
  const [workflowState, setWorkflowState] = useState(MOCK_LEGAL_NOTICE_STATES.PENDING_RESPONSE);

  // Response Editor State
  const [editorVisible, setEditorVisible] = useState(false);
  const [responseContent, setResponseContent] = useState(MOCK_LEGAL_NOTICE_CASE.initialDraftContent);
  const [activeFormat, setActiveFormat] = useState({ bold: false, italic: false, underline: false });

  // AI Draft Modal State
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiTone, setAiTone] = useState('Professional & Firm');
  const [aiLength, setAiLength] = useState('Standard');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDraftResult, setAiDraftResult] = useState('');

  // Preview & Confirmation Modals
  const [previewVisible, setPreviewVisible] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [noticeSummaryExpanded, setNoticeSummaryExpanded] = useState(true);

  // Signed response document state
  const [signedDocAttached, setSignedDocAttached] = useState(false);

  // ─── WORD COUNT COMPUTATION ────────────────────────────────────────────────
  const wordCount = useMemo(() => {
    const trimmed = responseContent.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [responseContent]);

  // ─── ACTIONS & HANDLERS ────────────────────────────────────────────────────

  const handleOpenDocumentViewer = () => {
    navigation.navigate('DocumentViewer', {
      clientId,
      caseId,
      legalNoticeId,
      clientName,
      caseTitle,
      fileName: 'Divorce_Notice_Rahul.pdf',
      hasDocument: true,
    });
  };

  const handleSaveDraft = () => {
    setWorkflowState('draft_saved');
    setEditorVisible(false);
    Alert.alert('Draft Saved', 'Your legal notice response draft has been saved securely.');
  };

  const handleConfirmReady = () => {
    setWorkflowState('response_ready');
    setPreviewVisible(false);
    setEditorVisible(false);
  };

  const handleUploadSignedResponse = () => {
    setSignedDocAttached(true);
    setWorkflowState('signed_uploaded');
  };

  const handleRemoveSignedResponse = () => {
    setSignedDocAttached(false);
    setWorkflowState('response_ready');
  };

  const handleReplaceSignedResponse = () => {
    Alert.alert('Replace File', 'Upload a new signed response PDF to replace Rahul_Signature.pdf', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Upload New PDF', onPress: () => handleUploadSignedResponse() },
    ]);
  };

  const handleConfirmSubmit = () => {
    setSubmitModalVisible(false);
    // Simulate submission
    setTimeout(() => {
      setWorkflowState('submitted');
    }, 400);
  };

  const handleGenerateAIDraft = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      setAiDraftResult(MOCK_LEGAL_NOTICE_CASE.aiGeneratedDraftContent(clientName, advocateName));
    }, 1200);
  };

  const handleUseAIDraft = () => {
    setResponseContent(aiDraftResult);
    setAiModalVisible(false);
    setAiDraftResult('');
    setAiInstructions('');
  };

  // ─── STATUS BADGE CONFIG ───────────────────────────────────────────────────
  const getBadgeConfig = () => {
    switch (workflowState) {
      case 'draft_saved':
        return { label: 'Draft Saved', bg: THEME.statusDraftBg, color: THEME.statusDraftText };
      case 'response_ready':
        return { label: 'Response Ready', bg: THEME.statusReadyBg, color: THEME.statusReadyText };
      case 'upload_signed':
      case 'signed_uploaded':
        return { label: 'Signed Uploaded', bg: THEME.statusReadyBg, color: THEME.statusReadyText };
      case 'submitted':
        return { label: 'Response Submitted', bg: THEME.statusSuccessBg, color: THEME.statusSuccessText };
      case 'failed':
        return { label: 'Submission Failed', bg: THEME.statusFailedBg, color: THEME.statusFailedText };
      case 'no_document':
        return { label: 'Pending Response', bg: THEME.statusPendingBg, color: THEME.statusPendingText };
      case 'no_response_required':
        return { label: 'No Response Required', bg: THEME.statusNeutralBg, color: THEME.statusNeutralText };
      case 'pending':
      default:
        return { label: 'Pending Response', bg: THEME.statusPendingBg, color: THEME.statusPendingText };
    }
  };

  const badge = getBadgeConfig();

  // ─── RENDER MAIN LEGAL NOTICE RESPONSE VIEW ────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F8" />

      {/* ─── 1. PAGE HEADER ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerIconBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={THEME.textDark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Legal Notice Response</Text>

        <TouchableOpacity
          onPress={() => setMoreMenuVisible(true)}
          style={styles.headerIconBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={22} color={THEME.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 30 },
        ]}
      >
        {/* ─── 2. LEGAL NOTICE REQUEST CARD ────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardMainTitle}>Legal Notice Request</Text>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.statusBadgeText, { color: badge.color }]}>
                {badge.label}
              </Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Client</Text>
              <Text style={styles.gridValue}>{clientName}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Request Date</Text>
              <Text style={styles.gridValue}>13 Aug 2026</Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Case</Text>
              <Text style={styles.gridValue}>{caseTitle}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Response Due</Text>
              <Text style={styles.gridValue}>20 Aug 2026</Text>
            </View>
          </View>
        </View>

        {/* ─── 3. STATE-SPECIFIC SECTIONS ──────────────────────────────────── */}

        {/* ── STATE: NO RESPONSE REQUIRED ── */}
        {workflowState === 'no_response_required' && (
          <View style={styles.stateNoticeCard}>
            <View style={styles.stateIconCircle}>
              <Ionicons name="checkmark-done-circle-outline" size={36} color={THEME.primary} />
            </View>
            <Text style={styles.stateNoticeTitle}>No Response Required</Text>
            <Text style={styles.stateNoticeSubtitle}>
              The notice does not require any response at this time.
            </Text>
            <TouchableOpacity
              style={styles.primaryActionBtn}
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.primaryActionBtnText}>Back to Case</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STATE: NO DOCUMENT AVAILABLE ── */}
        {workflowState === 'no_document' && (
          <View style={styles.stateNoticeCard}>
            <View style={styles.stateIconCircle}>
              <Ionicons name="cloud-upload-outline" size={36} color={THEME.primary} />
            </View>
            <Text style={styles.stateNoticeTitle}>Upload Document</Text>
            <Text style={styles.stateNoticeSubtitle}>
              Upload Notice pdf here to proceed with drafting.
            </Text>
            <TouchableOpacity
              style={[styles.primaryActionBtn, { marginBottom: 10 }]}
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert('Upload Notice', 'Selecting Notice PDF...', [
                  { text: 'OK', onPress: () => setWorkflowState('pending') },
                ]);
              }}
            >
              <Text style={styles.primaryActionBtnText}>Upload Notice PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryActionBtn}
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryActionBtnText}>Back to Case</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STATE: SUBMISSION FAILED ── */}
        {workflowState === 'failed' && (
          <View style={styles.stateNoticeCard}>
            <View style={[styles.stateIconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="alert-circle-outline" size={36} color="#DC2626" />
            </View>
            <Text style={[styles.stateNoticeTitle, { color: '#DC2626' }]}>
              Failed to Submit Response
            </Text>
            <Text style={styles.stateNoticeSubtitle}>
              Something went wrong while submitting your response.
            </Text>
            <TouchableOpacity
              style={[styles.primaryActionBtn, { marginBottom: 10 }]}
              activeOpacity={0.8}
              onPress={() => setSubmitModalVisible(true)}
            >
              <Text style={styles.primaryActionBtnText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryActionBtn}
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryActionBtnText}>Back to Case</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STATE: SUBMITTED SUCCESSFULLY ── */}
        {workflowState === 'submitted' && (
          <View style={styles.card}>
            <View style={styles.successBannerRow}>
              <Ionicons name="checkmark-circle" size={24} color="#15803D" />
              <Text style={styles.successBannerText}>
                Your response has been shared with the client
              </Text>
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionHeading}>Submission Details</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Submitted By</Text>
              <Text style={styles.metaValue}>{advocateName}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Submitted Date</Text>
              <Text style={styles.metaValue}>13 Aug 2026, 5:30 PM</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Response Document</Text>
              <Text style={styles.metaValue}>Response_Rahul_Sharma.pdf</Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryActionBtn, { marginTop: 18 }]}
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.primaryActionBtnText}>Back to Case</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STANDARD FLOW: ORIGINAL NOTICE + REVIEW + ACTIONS ── */}
        {workflowState !== 'no_response_required' &&
          workflowState !== 'no_document' &&
          workflowState !== 'failed' &&
          workflowState !== 'submitted' && (
            <>
              {/* 4. ORIGINAL LEGAL NOTICE */}
              <View style={styles.card}>
                <Text style={styles.sectionHeading}>Original Legal Notice</Text>
                <View style={styles.documentItemRow}>
                  <View style={styles.docIconCircle}>
                    <Ionicons name="document-text-outline" size={22} color={THEME.primary} />
                  </View>
                  <View style={styles.docInfoCol}>
                    <Text style={styles.docFileName}>Divorce_Notice_Rahul.pdf</Text>
                    <Text style={styles.docMetaText}>PDF • 5 pages • Uploaded Today</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.viewDocBtn}
                  activeOpacity={0.8}
                  onPress={handleOpenDocumentViewer}
                >
                  <Ionicons name="eye-outline" size={16} color={THEME.primary} />
                  <Text style={styles.viewDocBtnText}>View Document</Text>
                </TouchableOpacity>
              </View>

              {/* SIGNED RESPONSE CARD (Shown when attached) */}
              {(workflowState === 'signed_uploaded' || signedDocAttached) && (
                <View style={styles.card}>
                  <Text style={styles.sectionHeading}>Signed Response</Text>
                  <View style={styles.documentItemRow}>
                    <View style={[styles.docIconCircle, { backgroundColor: '#DCFCE7' }]}>
                      <Ionicons name="shield-checkmark-outline" size={22} color="#15803D" />
                    </View>
                    <View style={styles.docInfoCol}>
                      <Text style={styles.docFileName}>Rahul_Signature.pdf</Text>
                      <Text style={styles.docMetaText}>PDF • 2.5 MB • Uploaded Today</Text>
                    </View>
                  </View>

                  <View style={styles.signedActionsRow}>
                    <TouchableOpacity
                      style={styles.signedActionPill}
                      onPress={() => setPreviewVisible(true)}
                    >
                      <Text style={styles.signedActionText}>Preview</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.signedActionPill}
                      onPress={handleReplaceSignedResponse}
                    >
                      <Text style={styles.signedActionText}>Replace</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.signedActionPill, { borderColor: '#FCA5A5' }]}
                      onPress={handleRemoveSignedResponse}
                    >
                      <Text style={[styles.signedActionText, { color: '#DC2626' }]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 5. REVIEW NOTICE (COLLAPSIBLE CARD) */}
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.reviewHeaderRow}
                  activeOpacity={0.7}
                  onPress={() => setNoticeSummaryExpanded((prev) => !prev)}
                >
                  <Text style={styles.sectionHeading}>Review Notice</Text>
                  <Ionicons
                    name={noticeSummaryExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={THEME.textDark}
                  />
                </TouchableOpacity>

                {noticeSummaryExpanded && (
                  <View style={styles.reviewContent}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Notice Type</Text>
                      <Text style={styles.metaValue}>Legal Notice</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Subject</Text>
                      <Text style={styles.metaValue}>{caseTitle}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Received From</Text>
                      <Text style={styles.metaValue}>Client</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Received Date</Text>
                      <Text style={styles.metaValue}>Today</Text>
                    </View>

                    <View style={styles.divider} />
                    <Text style={styles.noticeSummaryTitle}>Notice Summary</Text>
                    <Text style={styles.noticeSummaryBody}>
                      Legal Notice regarding dissolution of marriage submitted by client. Requires structured formal response within statutory 7-day timeline.
                    </Text>
                  </View>
                )}
              </View>

              {/* ─── PRIMARY WORKFLOW ACTION BUTTON ─────────────────────────── */}
              {workflowState === 'pending' && (
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  activeOpacity={0.85}
                  onPress={() => setEditorVisible(true)}
                >
                  <Text style={styles.primaryActionBtnText}>Prepare Response</Text>
                </TouchableOpacity>
              )}

              {workflowState === 'draft_saved' && (
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  activeOpacity={0.85}
                  onPress={() => setEditorVisible(true)}
                >
                  <Text style={styles.primaryActionBtnText}>Continue Response</Text>
                </TouchableOpacity>
              )}

              {workflowState === 'response_ready' && (
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  activeOpacity={0.85}
                  onPress={handleUploadSignedResponse}
                >
                  <Text style={styles.primaryActionBtnText}>Upload Signed Response</Text>
                </TouchableOpacity>
              )}

              {workflowState === 'signed_uploaded' && (
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  activeOpacity={0.85}
                  onPress={() => setSubmitModalVisible(true)}
                >
                  <Text style={styles.primaryActionBtnText}>Submit Response</Text>
                </TouchableOpacity>
              )}
            </>
          )}
      </ScrollView>

      {/* ─── 10. PREPARE RESPONSE EDITOR (FULL-SCREEN MODAL) ─────────────── */}
      <Modal visible={editorVisible} animationType="slide">
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#FAF9F8" />

          {/* Editor Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setEditorVisible(false)}
              style={styles.headerIconBtn}
            >
              <Ionicons name="arrow-back" size={24} color={THEME.textDark} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Prepare Response</Text>

            <TouchableOpacity onPress={() => setPreviewVisible(true)}>
              <Text style={styles.headerTextAction}>Preview</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editorScroll} showsVerticalScrollIndicator={false}>
            {/* Rich Formatting Toolbar */}
            <View style={styles.editorToolbar}>
              <TouchableOpacity
                style={[styles.toolBtn, activeFormat.bold && styles.toolBtnActive]}
                onPress={() => setActiveFormat((p) => ({ ...p, bold: !p.bold }))}
              >
                <Feather name="bold" size={16} color={activeFormat.bold ? '#FFFFFF' : THEME.textDark} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toolBtn, activeFormat.italic && styles.toolBtnActive]}
                onPress={() => setActiveFormat((p) => ({ ...p, italic: !p.italic }))}
              >
                <Feather name="italic" size={16} color={activeFormat.italic ? '#FFFFFF' : THEME.textDark} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toolBtn, activeFormat.underline && styles.toolBtnActive]}
                onPress={() => setActiveFormat((p) => ({ ...p, underline: !p.underline }))}
              >
                <Feather name="underline" size={16} color={activeFormat.underline ? '#FFFFFF' : THEME.textDark} />
              </TouchableOpacity>
              <View style={styles.toolbarDivider} />
              <TouchableOpacity style={styles.toolBtn}>
                <Feather name="list" size={16} color={THEME.textDark} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn}>
                <Feather name="align-left" size={16} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            {/* Response Content Editor */}
            <TextInput
              style={[
                styles.editorInput,
                activeFormat.bold && { fontWeight: '700' },
                activeFormat.italic && { fontStyle: 'italic' },
              ]}
              multiline
              value={responseContent}
              onChangeText={setResponseContent}
              placeholder="Type your formal legal notice response..."
              placeholderTextColor="#9CA3AF"
            />

            {/* Word Count Indicator */}
            <View style={styles.wordCountRow}>
              <Text style={styles.wordCountText}>
                {wordCount}/1000 words
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Editor Action Buttons */}
          <View style={[styles.editorBottomBar, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
            <TouchableOpacity
              style={styles.aiDraftTriggerBtn}
              activeOpacity={0.8}
              onPress={() => setAiModalVisible(true)}
            >
              <Ionicons name="sparkles" size={16} color="#FFFFFF" />
              <Text style={styles.aiDraftTriggerText}>Generate Draft with AI</Text>
            </TouchableOpacity>

            <View style={styles.editorButtonRow}>
              <TouchableOpacity
                style={styles.draftSaveBtn}
                activeOpacity={0.8}
                onPress={handleSaveDraft}
              >
                <Text style={styles.draftSaveBtnText}>Save Draft</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.previewActionBtn}
                activeOpacity={0.8}
                onPress={() => setPreviewVisible(true)}
              >
                <Text style={styles.previewActionBtnText}>Preview Response</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ─── 21. PREVIEW RESPONSE MODAL ──────────────────────────────────── */}
      <Modal visible={previewVisible} animationType="slide">
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setPreviewVisible(false)}
              style={styles.headerIconBtn}
            >
              <Ionicons name="arrow-back" size={24} color={THEME.textDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Response Preview</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView style={styles.previewPaperContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.a4PreviewPaper}>
              <Text style={styles.previewText}>{responseContent}</Text>
            </View>
          </ScrollView>

          <View style={[styles.editorBottomBar, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
            <TouchableOpacity
              style={styles.primaryActionBtn}
              activeOpacity={0.85}
              onPress={handleConfirmReady}
            >
              <Text style={styles.primaryActionBtnText}>Confirm & Mark Ready</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ─── 22. AI DRAFT ASSISTANT MODAL ─────────────────────────────────── */}
      <Modal visible={aiModalVisible} animationType="fade" transparent={true}>
        <View style={styles.aiModalOverlay}>
          <View style={styles.aiModalContent}>
            <View style={styles.aiModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="sparkles" size={20} color={THEME.primary} />
                <Text style={styles.aiModalTitle}>Generate Draft with AI</Text>
              </View>
              <TouchableOpacity onPress={() => setAiModalVisible(false)}>
                <Ionicons name="close" size={22} color={THEME.textDark} />
              </TouchableOpacity>
            </View>

            {aiGenerating ? (
              <View style={styles.aiLoadingBox}>
                <ActivityIndicator size="large" color={THEME.primary} />
                <Text style={styles.aiLoadingText}>AI Generating Draft...</Text>
              </View>
            ) : aiDraftResult ? (
              <ScrollView style={styles.aiResultScroll}>
                <Text style={styles.aiResultHeading}>Generated Response:</Text>
                <Text style={styles.aiResultBody}>{aiDraftResult}</Text>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { marginTop: 14 }]}
                  activeOpacity={0.85}
                  onPress={handleUseAIDraft}
                >
                  <Text style={styles.primaryActionBtnText}>Use This Draft</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <ScrollView style={styles.aiFormScroll}>
                <Text style={styles.aiFormLabel}>Instructions & Key Defense Points</Text>
                <TextInput
                  style={styles.aiFormInput}
                  multiline
                  placeholder="e.g., Deny desertion claims, mention willingness to mediate..."
                  placeholderTextColor="#9CA3AF"
                  value={aiInstructions}
                  onChangeText={setAiInstructions}
                />

                <Text style={styles.aiFormLabel}>Draft Tone</Text>
                <View style={styles.aiPillRow}>
                  {['Professional & Firm', 'Conciliatory', 'Strict Legal'].map((tone) => (
                    <TouchableOpacity
                      key={tone}
                      style={[styles.aiPill, aiTone === tone && styles.aiPillActive]}
                      onPress={() => setAiTone(tone)}
                    >
                      <Text style={[styles.aiPillText, aiTone === tone && styles.aiPillTextActive]}>
                        {tone}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.primaryActionBtn, { marginTop: 18 }]}
                  activeOpacity={0.85}
                  onPress={handleGenerateAIDraft}
                >
                  <Text style={styles.primaryActionBtnText}>Generate Draft</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ─── 11. SUBMISSION CONFIRMATION MODAL ─────────────────────────────── */}
      <Modal visible={submitModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlayDim}>
          <View style={styles.confirmModalBox}>
            <Text style={styles.confirmModalTitle}>Submit Legal Notice Response?</Text>
            <Text style={styles.confirmModalMessage}>
              Once submitted, the response will be shared with the client. Please make sure the documents and response are final.
            </Text>
            <View style={styles.confirmActionRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setSubmitModalVisible(false)}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmSubmitBtn}
                onPress={handleConfirmSubmit}
              >
                <Text style={styles.confirmSubmitText}>Submit Response</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── DEVELOPMENT / MORE MENU MODAL ────────────────────────────────── */}
      <Modal visible={moreMenuVisible} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlayDim}
          activeOpacity={1}
          onPress={() => setMoreMenuVisible(false)}
        >
          <View style={styles.devMenuContent}>
            <Text style={styles.devMenuHeading}>TEST WORKFLOW STATES</Text>

            <TouchableOpacity
              style={styles.devMenuRow}
              onPress={() => {
                setWorkflowState('pending');
                setMoreMenuVisible(false);
              }}
            >
              <Text style={styles.devMenuText}>1. Pending Response</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.devMenuRow}
              onPress={() => {
                setWorkflowState('draft_saved');
                setMoreMenuVisible(false);
              }}
            >
              <Text style={styles.devMenuText}>2. Draft Saved</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.devMenuRow}
              onPress={() => {
                setWorkflowState('response_ready');
                setMoreMenuVisible(false);
              }}
            >
              <Text style={styles.devMenuText}>3. Response Ready</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.devMenuRow}
              onPress={() => {
                setSignedDocAttached(true);
                setWorkflowState('signed_uploaded');
                setMoreMenuVisible(false);
              }}
            >
              <Text style={styles.devMenuText}>4. Signed Response Uploaded</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.devMenuRow}
              onPress={() => {
                setWorkflowState('submitted');
                setMoreMenuVisible(false);
              }}
            >
              <Text style={styles.devMenuText}>5. Response Submitted</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.devMenuRow}
              onPress={() => {
                setWorkflowState('failed');
                setMoreMenuVisible(false);
              }}
            >
              <Text style={styles.devMenuText}>6. Submission Failed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.devMenuRow}
              onPress={() => {
                setWorkflowState('no_document');
                setMoreMenuVisible(false);
              }}
            >
              <Text style={styles.devMenuText}>7. No Document Available</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.devMenuRow}
              onPress={() => {
                setWorkflowState('no_response_required');
                setMoreMenuVisible(false);
              }}
            >
              <Text style={styles.devMenuText}>8. No Response Required</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: THEME.background,
    borderBottomWidth: 1,
    borderColor: THEME.divider,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textDark,
  },
  headerTextAction: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.primary,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },

  // ─── CARDS ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    shadowColor: '#2D2824',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardMainTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 11,
    color: THEME.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textDark,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 12,
  },

  // ─── DOCUMENT ROWS ───────────────────────────────────────────────────
  documentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  docIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: THEME.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEAE4',
  },
  docInfoCol: {
    flex: 1,
  },
  docFileName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textDark,
  },
  docMetaText: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  viewDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: THEME.badgeBg,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFEAE4',
  },
  viewDocBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.primary,
  },

  // ─── SIGNED RESPONSE ACTIONS ─────────────────────────────────────────
  signedActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  signedActionPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    backgroundColor: '#FAF9F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signedActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textDark,
  },

  // ─── REVIEW NOTICE COLLAPSIBLE ───────────────────────────────────────
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewContent: {
    marginTop: 4,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: THEME.textMuted,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.divider,
    marginVertical: 10,
  },
  noticeSummaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textDark,
  },
  noticeSummaryBody: {
    fontSize: 12,
    lineHeight: 18,
    color: THEME.textMuted,
  },

  // ─── STATE NOTICE CARDS (ERROR / EMPTY / SUCCESS) ────────────────────
  stateNoticeCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    gap: 8,
  },
  stateIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stateNoticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    textAlign: 'center',
  },
  stateNoticeSubtitle: {
    fontSize: 13,
    color: THEME.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  successBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  successBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },

  // ─── BUTTONS ────────────────────────────────────────────────────────
  primaryActionBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    backgroundColor: '#FAF9F8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    width: '100%',
  },
  secondaryActionBtnText: {
    color: THEME.textDark,
    fontSize: 13,
    fontWeight: '700',
  },

  // ─── PREPARE RESPONSE EDITOR STYLES ─────────────────────────────────
  editorScroll: {
    flex: 1,
    padding: 16,
  },
  editorToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    marginBottom: 12,
  },
  toolBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  toolBtnActive: {
    backgroundColor: THEME.primary,
  },
  toolbarDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  editorInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    padding: 16,
    minHeight: 320,
    fontSize: 14,
    lineHeight: 22,
    color: THEME.textDark,
    textAlignVertical: 'top',
  },
  wordCountRow: {
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  wordCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  editorBottomBar: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderColor: THEME.divider,
    gap: 10,
  },
  aiDraftTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4338CA',
    borderRadius: 12,
    paddingVertical: 12,
  },
  aiDraftTriggerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  editorButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  draftSaveBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  draftSaveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textDark,
  },
  previewActionBtn: {
    flex: 1,
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  previewActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ─── PREVIEW PAPER ──────────────────────────────────────────────────
  previewPaperContainer: {
    flex: 1,
    padding: 16,
  },
  a4PreviewPaper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EDE7DF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 30,
  },
  previewText: {
    fontSize: 13,
    lineHeight: 22,
    color: THEME.textDark,
  },

  // ─── AI DRAFT ASSISTANT MODAL ───────────────────────────────────────
  aiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  aiModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  aiModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
  },
  aiFormScroll: {
    maxHeight: 380,
  },
  aiFormLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 6,
    marginTop: 10,
  },
  aiFormInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  aiPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  aiPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  aiPillActive: {
    backgroundColor: THEME.primary,
  },
  aiPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  aiPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  aiLoadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  aiLoadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.primary,
  },
  aiResultScroll: {
    maxHeight: 340,
  },
  aiResultHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textDark,
    marginBottom: 6,
  },
  aiResultBody: {
    fontSize: 13,
    lineHeight: 20,
    color: THEME.textDark,
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 12,
  },

  // ─── CONFIRMATION MODAL ─────────────────────────────────────────────
  modalOverlayDim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmModalBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    gap: 12,
  },
  confirmModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.textDark,
    textAlign: 'center',
  },
  confirmModalMessage: {
    fontSize: 13,
    color: THEME.textMuted,
    lineHeight: 18,
    textAlign: 'center',
  },
  confirmActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textDark,
  },
  confirmSubmitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: THEME.primary,
    alignItems: 'center',
  },
  confirmSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ─── DEV STATE SWITCHER ─────────────────────────────────────────────
  devMenuContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    gap: 6,
  },
  devMenuHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.textSubtle,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  devMenuRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F5F1EB',
  },
  devMenuText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textDark,
  },
});
