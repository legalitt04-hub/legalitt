import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Design Language Constants matching Legalitt App
class LegalittTheme {
  static const Color primaryWarmBeige = Color(0xFFC2A78B);
  static const Color primaryDarkBeige = Color(0xFFA68B70);
  static const Color primaryLightBeige = Color(0xFFF4EFEA);
  static const Color surfaceBackground = Color(0xFFFFFFFF);
  static const Color cardBackground = Color(0xFFFAFAF8);
  static const Color textPrimary = Color(0xFF1F2937);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color borderColor = Color(0xFFE8E2D9);
  static const Color shadowColor = Color(0x0F000000);
  static const Color successGreen = Color(0xFF10B981);

  static const double borderRadius = 22.0;

  static List<BoxShadow> softShadow = [
    const BoxShadow(
      color: shadowColor,
      blurRadius: 16,
      offset: Offset(0, 6),
    ),
  ];
}

class DocumentUploadItem {
  final String id;
  final String title;
  final String subtitle;
  final IconData icon;

  bool isUploading;
  double uploadProgress;
  bool isUploaded;
  String? uploadedFileName;

  DocumentUploadItem({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.icon,
    this.isUploading = false,
    this.uploadProgress = 0.0,
    this.isUploaded = false,
    this.uploadedFileName,
  });
}

class AILegalNoticeStep4Screen extends StatefulWidget {
  const AILegalNoticeStep4Screen({Key? key}) : super(key: key);

  @override
  State<AILegalNoticeStep4Screen> createState() => _AILegalNoticeStep4ScreenState();
}

class _AILegalNoticeStep4ScreenState extends State<AILegalNoticeStep4Screen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeInAnimation;
  late Animation<Offset> _slideUpAnimation;

  final List<DocumentUploadItem> _documentItems = [
    DocumentUploadItem(
      id: 'aadhaar',
      title: 'Aadhaar Card',
      subtitle: 'Govt Identity Proof (Front & Back)',
      icon: Icons.badge_outlined,
    ),
    DocumentUploadItem(
      id: 'property',
      title: 'Property Papers',
      subtitle: 'Ownership or Lease Agreement Docs',
      icon: Icons.description_outlined,
    ),
    DocumentUploadItem(
      id: 'sale_deed',
      title: 'Sale Deed',
      subtitle: 'Registered Property Sale Records',
      icon: Icons.article_outlined,
    ),
    DocumentUploadItem(
      id: 'agreement',
      title: 'Agreement',
      subtitle: 'Signed Contract or Rental Agreement',
      icon: Icons.assignment_outlined,
    ),
    DocumentUploadItem(
      id: 'whatsapp',
      title: 'WhatsApp Chats',
      subtitle: 'Chat Screenshots or PDF Export',
      icon: Icons.chat_outlined,
    ),
    DocumentUploadItem(
      id: 'email',
      title: 'Email Evidence',
      subtitle: 'Important Communications or Receipts',
      icon: Icons.email_outlined,
    ),
    DocumentUploadItem(
      id: 'screenshots',
      title: 'Screenshots',
      subtitle: 'Payment Receipts or Notice Messages',
      icon: Icons.image_outlined,
    ),
    DocumentUploadItem(
      id: 'audio',
      title: 'Audio Recording',
      subtitle: 'MP3 / WAV Audio Evidence',
      icon: Icons.mic_none_outlined,
    ),
    DocumentUploadItem(
      id: 'video',
      title: 'Video',
      subtitle: 'MP4 Incident or Property Footage',
      icon: Icons.videocam_outlined,
    ),
    DocumentUploadItem(
      id: 'other',
      title: 'Other Documents',
      subtitle: 'Any additional supporting evidence',
      icon: Icons.folder_open_outlined,
    ),
  ];

  @override
  void initState() {
    super.initState();
    // ── Entrance Animation Sequence (Fade In + Slide Up) ─────────────────
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 850),
    );

    _fadeInAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    );

    _slideUpAnimation = Tween<Offset>(
      begin: const Offset(0, 0.07),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _simulateDocumentUpload(DocumentUploadItem item) {
    if (item.isUploading) return;

    HapticFeedback.lightImpact();

    if (item.isUploaded) {
      // Option to replace or view file
      setState(() {
        item.isUploaded = false;
        item.uploadProgress = 0.0;
        item.uploadedFileName = null;
      });
      return;
    }

    setState(() {
      item.isUploading = true;
      item.uploadProgress = 0.1;
    });

    Timer.periodic(const Duration(milliseconds: 180), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        item.uploadProgress += 0.22;
        if (item.uploadProgress >= 1.0) {
          item.uploadProgress = 1.0;
          item.isUploading = false;
          item.isUploaded = true;
          item.uploadedFileName = '${item.id}_doc.pdf';
          timer.cancel();
          HapticFeedback.mediumImpact();
        }
      });
    });
  }

  void _onContinue() {
    HapticFeedback.mediumImpact();
    final int uploadedCount = _documentItems.where((d) => d.isUploaded).length;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: LegalittTheme.primaryWarmBeige,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        content: Text(
          uploadedCount > 0
              ? '$uploadedCount document(s) attached. Proceeding to Step 5...'
              : 'Proceeding to Final Review (Step 5)...',
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LegalittTheme.surfaceBackground,
      appBar: AppBar(
        backgroundColor: LegalittTheme.surfaceBackground,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new_rounded,
            color: LegalittTheme.textPrimary,
            size: 20,
          ),
          onPressed: () => Navigator.of(context).maybePop(),
          tooltip: 'Back',
        ),
        centerTitle: true,
        title: Column(
          children: const [
            Text(
              'AI Legal Notice Assistance',
              style: TextStyle(
                color: LegalittTheme.textPrimary,
                fontSize: 17,
                fontWeight: FontWeight.w700,
                letterSpacing: -0.2,
              ),
            ),
            SizedBox(height: 2),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.shield_outlined,
                  size: 12,
                  color: LegalittTheme.primaryWarmBeige,
                ),
                SizedBox(width: 4),
                Text(
                  'Secure & Confidential',
                  style: TextStyle(
                    color: LegalittTheme.textSecondary,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeInAnimation,
          child: SlideTransition(
            position: _slideUpAnimation,
            child: Column(
              children: [
                // ── 1. Horizontal Step Progress Indicator (Step 4 of 5) ────────
                const _StepProgressBar(currentStep: 4, totalSteps: 5),

                // ── 2. Scrollable Upload Cards List ───────────────────────────
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24.0,
                      vertical: 16.0,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 8),

                        // ── AI Conversational Query Chat Bubble ───────────────
                        const _AIChatBubble(
                          message: "Upload Supporting Documents",
                        ),

                        const SizedBox(height: 20),

                        // ── Upload Card Items List ───────────────────────────
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _documentItems.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final item = _documentItems[index];
                            return _DocumentUploadCard(
                              item: item,
                              onTap: () => _simulateDocumentUpload(item),
                            );
                          },
                        ),

                        const SizedBox(height: 24),

                        // ── Security & Confidentiality Note ───────────────────
                        Center(
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Icon(
                                Icons.lock_outline_rounded,
                                size: 14,
                                color: LegalittTheme.primaryWarmBeige,
                              ),
                              SizedBox(width: 6),
                              Text(
                                'Your information is safe and confidential.',
                                style: TextStyle(
                                  color: LegalittTheme.textSecondary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),

                // ── 3. Fixed Bottom Action Container ──────────────────────────
                Container(
                  padding: const EdgeInsets.fromLTRB(24.0, 12.0, 24.0, 16.0),
                  decoration: BoxDecoration(
                    color: LegalittTheme.surfaceBackground,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.03),
                        blurRadius: 12,
                        offset: const Offset(0, -4),
                      ),
                    ],
                  ),
                  child: SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _onContinue,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: LegalittTheme.primaryWarmBeige,
                        foregroundColor: Colors.white,
                        elevation: 4,
                        shadowColor: LegalittTheme.primaryWarmBeige.withOpacity(0.4),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(LegalittTheme.borderRadius),
                        ),
                      ),
                      child: const Text(
                        'Continue',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Horizontal Step Progress Indicator Widget ────────────────────────────────
class _StepProgressBar extends StatelessWidget {
  final int currentStep;
  final int totalSteps;

  const _StepProgressBar({
    Key? key,
    required this.currentStep,
    required this.totalSteps,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Step $currentStep of $totalSteps',
                style: const TextStyle(
                  color: LegalittTheme.primaryWarmBeige,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                '${((currentStep / totalSteps) * 100).toInt()}% Completed',
                style: const TextStyle(
                  color: LegalittTheme.textSecondary,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: List.generate(totalSteps, (index) {
              final bool isCurrentOrCompleted = index < currentStep;
              return Expanded(
                child: Container(
                  height: 5,
                  margin: EdgeInsets.only(
                    right: index < totalSteps - 1 ? 6.0 : 0.0,
                  ),
                  decoration: BoxDecoration(
                    color: isCurrentOrCompleted
                        ? LegalittTheme.primaryWarmBeige
                        : LegalittTheme.primaryLightBeige,
                    borderRadius: BorderRadius.circular(3.0),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

// ── AI Conversational Chat Bubble Widget ──────────────────────────────────────
class _AIChatBubble extends StatelessWidget {
  final String message;

  const _AIChatBubble({
    Key? key,
    required this.message,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
      decoration: BoxDecoration(
        color: LegalittTheme.cardBackground,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(6.0),
          topRight: Radius.circular(LegalittTheme.borderRadius),
          bottomLeft: Radius.circular(LegalittTheme.borderRadius),
          bottomRight: Radius.circular(LegalittTheme.borderRadius),
        ),
        border: Border.all(
          color: LegalittTheme.borderColor,
          width: 1,
        ),
        boxShadow: LegalittTheme.softShadow,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: const BoxDecoration(
              color: LegalittTheme.primaryLightBeige,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.gavel_rounded,
              color: LegalittTheme.primaryWarmBeige,
              size: 16,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                color: LegalittTheme.textPrimary,
                fontSize: 14.5,
                height: 1.5,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Interactive Document Upload Card Widget ──────────────────────────────────
class _DocumentUploadCard extends StatelessWidget {
  final DocumentUploadItem item;
  final VoidCallback onTap;

  const _DocumentUploadCard({
    Key? key,
    required this.item,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(LegalittTheme.borderRadius),
        splashColor: LegalittTheme.primaryWarmBeige.withOpacity(0.12),
        highlightColor: LegalittTheme.primaryWarmBeige.withOpacity(0.05),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 240),
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
          decoration: BoxDecoration(
            color: item.isUploaded
                ? LegalittTheme.primaryLightBeige.withOpacity(0.5)
                : LegalittTheme.cardBackground,
            borderRadius: BorderRadius.circular(LegalittTheme.borderRadius),
            border: Border.all(
              color: item.isUploaded
                  ? LegalittTheme.primaryWarmBeige.withOpacity(0.6)
                  : item.isUploading
                      ? LegalittTheme.primaryWarmBeige
                      : LegalittTheme.borderColor,
              width: item.isUploaded || item.isUploading ? 1.5 : 1.0,
            ),
            boxShadow: LegalittTheme.softShadow,
          ),
          child: Row(
            children: [
              // ── Left Avatar Icon ─────────────────────────────────────────
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: item.isUploaded
                      ? LegalittTheme.primaryWarmBeige
                      : LegalittTheme.primaryLightBeige,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  item.icon,
                  size: 22,
                  color: item.isUploaded
                      ? Colors.white
                      : LegalittTheme.primaryWarmBeige,
                ),
              ),

              const SizedBox(width: 14),

              // ── Title & Subtitle Info ────────────────────────────────────
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.title,
                      style: const TextStyle(
                        color: LegalittTheme.textPrimary,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      item.isUploaded
                          ? '✔ Uploaded (${item.uploadedFileName})'
                          : item.isUploading
                              ? 'Uploading... ${(item.uploadProgress * 100).toInt()}%'
                              : item.subtitle,
                      style: TextStyle(
                        color: item.isUploaded
                            ? LegalittTheme.successGreen
                            : item.isUploading
                                ? LegalittTheme.primaryWarmBeige
                                : LegalittTheme.textSecondary,
                        fontSize: 12,
                        fontWeight: item.isUploaded || item.isUploading
                            ? FontWeight.w600
                            : FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 10),

              // ── Right Action / Progress / Success Icon ─────────────────
              if (item.isUploading) ...[
                SizedBox(
                  width: 28,
                  height: 28,
                  child: CircularProgressIndicator(
                    value: item.uploadProgress,
                    strokeWidth: 2.8,
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      LegalittTheme.primaryWarmBeige,
                    ),
                    backgroundColor: LegalittTheme.borderColor,
                  ),
                ),
              ] else if (item.isUploaded) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: LegalittTheme.successGreen.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(
                        Icons.check_circle_rounded,
                        size: 14,
                        color: LegalittTheme.successGreen,
                      ),
                      SizedBox(width: 4),
                      Text(
                        'Uploaded',
                        style: TextStyle(
                          color: LegalittTheme.successGreen,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ] else ...[
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: LegalittTheme.primaryLightBeige,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.cloud_upload_outlined,
                    size: 18,
                    color: LegalittTheme.primaryWarmBeige,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
