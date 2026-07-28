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

class AILegalNoticeStep5Screen extends StatefulWidget {
  const AILegalNoticeStep5Screen({Key? key}) : super(key: key);

  @override
  State<AILegalNoticeStep5Screen> createState() => _AILegalNoticeStep5ScreenState();
}

class _AILegalNoticeStep5ScreenState extends State<AILegalNoticeStep5Screen>
    with TickerProviderStateMixin {
  late AnimationController _entranceController;
  late Animation<double> _fadeInAnimation;
  late Animation<Offset> _slideUpAnimation;

  late AnimationController _successAnimationController;
  late Animation<double> _successScaleAnimation;

  bool _isSubmitted = false;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();

    // ── Step 5 Entrance Animation ─────────────────────────────────────
    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 850),
    );

    _fadeInAnimation = CurvedAnimation(
      parent: _entranceController,
      curve: Curves.easeOut,
    );

    _slideUpAnimation = Tween<Offset>(
      begin: const Offset(0, 0.07),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _entranceController,
      curve: Curves.easeOutCubic,
    ));

    // ── Success Screen Scale Animation ────────────────────────────────
    _successAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 750),
    );

    _successScaleAnimation = CurvedAnimation(
      parent: _successAnimationController,
      curve: Curves.elasticOut,
    );

    _entranceController.forward();
  }

  @override
  void dispose() {
    _entranceController.dispose();
    _successAnimationController.dispose();
    super.dispose();
  }

  void _onSubmitReview() async {
    HapticFeedback.mediumImpact();
    setState(() {
      _isSubmitting = true;
    });

    await Future.delayed(const Duration(milliseconds: 1400));

    if (!mounted) return;

    setState(() {
      _isSubmitting = false;
      _isSubmitted = true;
    });

    _successAnimationController.forward();
    HapticFeedback.heavyImpact();
  }

  void _onEditSection(String sectionName) {
    HapticFeedback.lightImpact();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: LegalittTheme.primaryDarkBeige,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        content: Text(
          'Navigating back to edit $sectionName...',
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
      appBar: _isSubmitted
          ? null
          : AppBar(
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
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 600),
          switchInCurve: Curves.easeInOut,
          switchOutCurve: Curves.easeInOut,
          child: _isSubmitted
              ? _buildSuccessScreen(context)
              : _buildReviewStepScreen(context),
        ),
      ),
    );
  }

  // ── STEP 5 REVIEW & SUMMARY SCREEN VIEW ────────────────────────────────────
  Widget _buildReviewStepScreen(BuildContext context) {
    return FadeTransition(
      key: const ValueKey('step5_review_view'),
      opacity: _fadeInAnimation,
      child: SlideTransition(
        position: _slideUpAnimation,
        child: Column(
          children: [
            // ── 1. Step Progress Indicator (Step 5 of 5 - 100%) ──────────────
            const _StepProgressBar(currentStep: 5, totalSteps: 5),

            // ── 2. Scrollable Summary Content ─────────────────────────────────
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

                    // ── AI Conversational Chat Bubble ─────────────────────────
                    const _AIChatBubble(
                      message: "Please review your legal notice details before final submission.",
                    ),

                    const SizedBox(height: 24),

                    // ── Premium Summary Card Container ────────────────────────
                    Container(
                      padding: const EdgeInsets.all(20.0),
                      decoration: BoxDecoration(
                        color: LegalittTheme.cardBackground,
                        borderRadius: BorderRadius.circular(LegalittTheme.borderRadius),
                        border: Border.all(
                          color: LegalittTheme.borderColor,
                          width: 1.2,
                        ),
                        boxShadow: LegalittTheme.softShadow,
                      ),
                      child: Column(
                        children: [
                          // Section 1: Client Information
                          _SummarySectionRow(
                            icon: Icons.person_outline_rounded,
                            title: 'Client Information',
                            contentLines: const [
                              'Ananya Sharma',
                              '+91 98765 43210 • ananya.sharma@example.com',
                              'Flat 402, Sunshine Heights, Bandra West, Mumbai - 400050',
                            ],
                            onEdit: () => _onEditSection('Client Information'),
                          ),

                          const Divider(height: 32, color: LegalittTheme.borderColor),

                          // Section 2: Recipient Information
                          _SummarySectionRow(
                            icon: Icons.people_outline_rounded,
                            title: 'Recipient Information',
                            contentLines: const [
                              'Rajesh Kumar (Landlord)',
                              '+91 98123 45678 • rajesh.k@example.com',
                              'Plot 12, Ocean View Apartments, Juhu, Mumbai - 400049',
                            ],
                            onEdit: () => _onEditSection('Recipient Information'),
                          ),

                          const Divider(height: 32, color: LegalittTheme.borderColor),

                          // Section 3: Notice Type
                          _SummarySectionRow(
                            icon: Icons.gavel_outlined,
                            title: 'Notice Type',
                            contentLines: const [
                              'Tenant Security Deposit Refund & Illegal Eviction Notice',
                            ],
                            onEdit: () => _onEditSection('Notice Type'),
                          ),

                          const Divider(height: 32, color: LegalittTheme.borderColor),

                          // Section 4: Issue Summary
                          _SummarySectionRow(
                            icon: Icons.notes_outlined,
                            title: 'Issue Summary',
                            contentLines: const [
                              'Landlord has withheld full security deposit (₹1,50,000) despite 30-day prior written notice given on March 1st. Requesting immediate full refund with accrued interest.',
                            ],
                            onEdit: () => _onEditSection('Issue Summary'),
                          ),

                          const Divider(height: 32, color: LegalittTheme.borderColor),

                          // Section 5: Uploaded Documents with Count Badge
                          _SummarySectionRow(
                            icon: Icons.folder_open_outlined,
                            title: 'Uploaded Documents',
                            badgeText: '3 Documents Attached',
                            contentLines: const [
                              '📄 Rental_Agreement_2024.pdf',
                              '💳 Aadhaar_Card_Front_Back.pdf',
                              '💬 Rent_Paid_Receipts_WhatsApp.pdf',
                            ],
                            onEdit: () => _onEditSection('Uploaded Documents'),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // ── Security & Confidentiality Note ───────────────────────
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

            // ── 3. Bottom CTA Action Container ────────────────────────────────
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
                  onPressed: _isSubmitting ? null : _onSubmitReview,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: LegalittTheme.primaryWarmBeige,
                    foregroundColor: Colors.white,
                    elevation: 4,
                    shadowColor: LegalittTheme.primaryWarmBeige.withOpacity(0.4),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(LegalittTheme.borderRadius),
                    ),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text(
                          'Submit Legal Review',
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
    );
  }

  // ── SUCCESS CONFIRMATION SCREEN VIEW ───────────────────────────────────────
  Widget _buildSuccessScreen(BuildContext context) {
    return Container(
      key: const ValueKey('success_screen_view'),
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 28.0, vertical: 24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),

          // ── Success Animated Illustration / Avatar Badge ──────────────────
          ScaleTransition(
            scale: _successScaleAnimation,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: LegalittTheme.primaryLightBeige,
                boxShadow: [
                  BoxShadow(
                    color: LegalittTheme.primaryWarmBeige.withOpacity(0.35),
                    blurRadius: 32,
                    spreadRadius: 6,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Container(
                margin: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [
                      LegalittTheme.primaryWarmBeige,
                      LegalittTheme.primaryDarkBeige,
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  color: Colors.white,
                  size: 64,
                ),
              ),
            ),
          ),

          const SizedBox(height: 36),

          // ── Success Heading ───────────────────────────────────────────────
          const Text(
            'Legal Notice Submitted\nSuccessfully',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: LegalittTheme.textPrimary,
              fontSize: 22,
              fontWeight: FontWeight.w800,
              height: 1.3,
              letterSpacing: -0.3,
            ),
          ),

          const SizedBox(height: 16),

          // ── Explanatory Message ───────────────────────────────────────────
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 12.0),
            child: Text(
              'Our legal experts will review your request and begin drafting your legal notice.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: LegalittTheme.textSecondary,
                fontSize: 14.5,
                height: 1.5,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),

          const SizedBox(height: 32),

          // ── Estimated Review Time Badge Card ─────────────────────────────
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 14.0),
            decoration: BoxDecoration(
              color: LegalittTheme.primaryLightBeige,
              borderRadius: BorderRadius.circular(LegalittTheme.borderRadius),
              border: Border.all(
                color: LegalittTheme.primaryWarmBeige.withOpacity(0.4),
                width: 1.2,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Icon(
                  Icons.access_time_rounded,
                  size: 20,
                  color: LegalittTheme.primaryWarmBeige,
                ),
                SizedBox(width: 10),
                Text(
                  'Estimated Review Time: 24–48 Hours',
                  style: TextStyle(
                    color: LegalittTheme.textPrimary,
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),

          const Spacer(),

          // ── Return to Home Primary Button ─────────────────────────────────
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: () {
                HapticFeedback.mediumImpact();
                Navigator.of(context).popUntil((route) => route.isFirst);
              },
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
                'Return to Home',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.2,
                ),
              ),
            ),
          ),

          const SizedBox(height: 12),
        ],
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
                  color: LegalittTheme.primaryWarmBeige,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
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

// ── Summary Section Row Component ────────────────────────────────────────────
class _SummarySectionRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? badgeText;
  final List<String> contentLines;
  final VoidCallback onEdit;

  const _SummarySectionRow({
    Key? key,
    required this.icon,
    required this.title,
    this.badgeText,
    required this.contentLines,
    required this.onEdit,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              icon,
              size: 18,
              color: LegalittTheme.primaryWarmBeige,
            ),
            const SizedBox(width: 8),
            Text(
              title,
              style: const TextStyle(
                color: LegalittTheme.textPrimary,
                fontSize: 14.5,
                fontWeight: FontWeight.w700,
              ),
            ),
            if (badgeText != null) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: LegalittTheme.primaryWarmBeige.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  badgeText!,
                  style: const TextStyle(
                    color: LegalittTheme.primaryWarmBeige,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
            const Spacer(),
            Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onEdit,
                borderRadius: BorderRadius.circular(20),
                child: Padding(
                  padding: const EdgeInsets.all(6.0),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(
                        Icons.edit_outlined,
                        size: 15,
                        color: LegalittTheme.primaryWarmBeige,
                      ),
                      SizedBox(width: 4),
                      Text(
                        'Edit',
                        style: TextStyle(
                          color: LegalittTheme.primaryWarmBeige,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ...contentLines.map(
          (line) => Padding(
            padding: const EdgeInsets.only(left: 26.0, top: 3.0),
            child: Text(
              line,
              style: const TextStyle(
                color: LegalittTheme.textSecondary,
                fontSize: 13,
                height: 1.45,
                fontWeight: FontWeight.w400,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
