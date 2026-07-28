import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Design Language Constants for Legalitt App
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

  static const double borderRadius = 22.0;

  static List<BoxShadow> softShadow = [
    const BoxShadow(
      color: shadowColor,
      blurRadius: 16,
      offset: Offset(0, 6),
    ),
  ];
}

class AILegalNoticeStep1Screen extends StatefulWidget {
  const AILegalNoticeStep1Screen({Key? key}) : super(key: key);

  @override,
  State<AILegalNoticeStep1Screen> createState() => _AILegalNoticeStep1ScreenState();
}

class _AILegalNoticeStep1ScreenState extends State<AILegalNoticeStep1Screen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeInAnimation;
  late Animation<Offset> _slideUpAnimation;

  final TextEditingController _issueTextController = TextEditingController();
  String? _selectedCategory;

  final List<String> _quickActionCategories = [
    'Property Dispute',
    'Money Recovery',
    'Tenant Issue',
    'Family Dispute',
    'Cheque Bounce',
    'Consumer Complaint',
    'Employment Issue',
    'Cyber Crime',
    'Loan Recovery',
    'Other',
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );

    _fadeInAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    );

    _slideUpAnimation = Tween<Offset>(
      begin: const Offset(0, 0.08),
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
    _issueTextController.dispose();
    super.dispose();
  }

  void _onCategorySelected(String category) {
    HapticFeedback.lightImpact();
    setState(() {
      if (_selectedCategory == category) {
        _selectedCategory = null;
      } else {
        _selectedCategory = category;
      }
    });
  }

  void _onContinue() {
    HapticFeedback.mediumImpact();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: LegalittTheme.primaryWarmBeige,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        content: Text(
          _selectedCategory != null
              ? 'Proceeding with $_selectedCategory...'
              : 'Proceeding to Step 2...',
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
                // ── Horizontal Step Progress Indicator ─────────────────
                const _StepProgressBar(currentStep: 1, totalSteps: 5),

                // ── Scrollable Body Content ────────────────────────────
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

                        // ── AI Hero Illustration ───────────────────────
                        Center(
                          child: Hero(
                            tag: 'ai_assistant_avatar',
                            child: _AIAssistantAvatar(),
                          ),
                        ),

                        const SizedBox(height: 20),

                        // ── AI Conversational Chat Bubble ───────────────
                        const _AIChatBubble(
                          message: "Hello 👋\n\nI'm your AI Legal Assistant.\n\nPlease tell me what legal issue you're facing today.",
                        ),

                        const SizedBox(height: 28),

                        // ── Quick Actions Section Header ───────────────
                        const Text(
                          'Quick Actions',
                          style: TextStyle(
                            color: LegalittTheme.textPrimary,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -0.2,
                          ),
                        ),

                        const SizedBox(height: 12),

                        // ── Categorized Quick Chips Grid/Wrap ──────────
                        Wrap(
                          spacing: 8.0,
                          runSpacing: 10.0,
                          children: _quickActionCategories.map((category) {
                            final bool isSelected = _selectedCategory == category;
                            return _QuickActionChip(
                              label: category,
                              isSelected: isSelected,
                              onTap: () => _onCategorySelected(category),
                            );
                          }).toList(),
                        ),

                        const SizedBox(height: 28),

                        // ── Large Rounded Multiline Input Field ────────
                        _CustomIssueInputField(
                          controller: _issueTextController,
                        ),

                        const SizedBox(height: 16),

                        // ── Security & Confidentiality Note ───────────
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

                // ── Fixed Bottom CTA Button Container ──────────────────
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

// ── Horizontal Step Progress Component ─────────────────────────────────────
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

// ── Circular AI Illustration Avatar ─────────────────────────────────────────
class _AIAssistantAvatar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 96,
      height: 96,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: LegalittTheme.primaryLightBeige,
        boxShadow: [
          BoxShadow(
            color: LegalittTheme.primaryWarmBeige.withOpacity(0.2),
            blurRadius: 24,
            spreadRadius: 4,
            offset: const Offset(0, 8),
          ),
        ],
        border: Border.all(
          color: Colors.white,
          width: 4,
        ),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Subtle background glow
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
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
          ),
          const Icon(
            Icons.auto_awesome_rounded,
            color: Colors.white,
            size: 40,
          ),
          // Online AI Active Status Dot
          Positioned(
            right: 4,
            bottom: 4,
            child: Container(
              width: 16,
              height: 16,
              decoration: BoxDecoration(
                color: const Color(0xFF10B981),
                shape: BoxShape.circle,
                border: Border.all(
                  color: Colors.white,
                  width: 2.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── AI Conversational Chat Bubble ───────────────────────────────────────────
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
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Rounded Category Action Chip ────────────────────────────────────────────
class _QuickActionChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _QuickActionChip({
    Key? key,
    required this.label,
    required this.isSelected,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(LegalittTheme.borderRadius),
        splashColor: LegalittTheme.primaryWarmBeige.withOpacity(0.15),
        highlightColor: LegalittTheme.primaryWarmBeige.withOpacity(0.05),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeInOut,
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
          decoration: BoxDecoration(
            color: isSelected
                ? LegalittTheme.primaryWarmBeige
                : LegalittTheme.cardBackground,
            borderRadius: BorderRadius.circular(LegalittTheme.borderRadius),
            border: Border.all(
              color: isSelected
                  ? LegalittTheme.primaryWarmBeige
                  : LegalittTheme.borderColor,
              width: 1.2,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: LegalittTheme.primaryWarmBeige.withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ]
                : [],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (isSelected) ...[
                const Icon(
                  Icons.check_circle_rounded,
                  size: 15,
                  color: Colors.white,
                ),
                const SizedBox(width: 6),
              ],
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? Colors.white : LegalittTheme.textPrimary,
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Multiline Input Field Component ─────────────────────────────────────────
class _CustomIssueInputField extends StatelessWidget {
  final TextEditingController controller;

  const _CustomIssueInputField({
    Key? key,
    required this.controller,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: LegalittTheme.cardBackground,
        borderRadius: BorderRadius.circular(LegalittTheme.borderRadius),
        border: Border.all(
          color: LegalittTheme.borderColor,
          width: 1.2,
        ),
        boxShadow: LegalittTheme.softShadow,
      ),
      child: TextField(
        controller: controller,
        maxLines: 5,
        minLines: 4,
        style: const TextStyle(
          color: LegalittTheme.textPrimary,
          fontSize: 14.5,
          height: 1.45,
        ),
        decoration: InputDecoration(
          hintText: 'Describe your legal issue in simple words...',
          hintStyle: const TextStyle(
            color: LegalittTheme.textSecondary,
            fontSize: 14,
            fontWeight: FontWeight.w400,
          ),
          contentPadding: const EdgeInsets.all(18.0),
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(LegalittTheme.borderRadius),
            borderSide: const BorderSide(
              color: LegalittTheme.primaryWarmBeige,
              width: 1.5,
            ),
          ),
        ),
      ),
    );
  }
}
