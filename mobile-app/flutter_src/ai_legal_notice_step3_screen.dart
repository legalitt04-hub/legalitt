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
  static const Color errorRed = Color(0xFFEF4444);

  static const double borderRadius = 22.0;

  static List<BoxShadow> softShadow = [
    const BoxShadow(
      color: shadowColor,
      blurRadius: 16,
      offset: Offset(0, 6),
    ),
  ];
}

class AILegalNoticeStep3Screen extends StatefulWidget {
  const AILegalNoticeStep3Screen({Key? key}) : super(key: key);

  @override
  State<AILegalNoticeStep3Screen> createState() => _AILegalNoticeStep3ScreenState();
}

class _AILegalNoticeStep3ScreenState extends State<AILegalNoticeStep3Screen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeInAnimation;
  late Animation<Offset> _slideUpAnimation;

  final _formKey = GlobalKey<FormState>();

  final TextEditingController _senderNameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // ── Smooth Entrance Animation Sequence (Fade In + Slide Up) ───────────
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
    _senderNameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  bool _isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  bool _isValidPhone(String phone) {
    return RegExp(r'^[0-9+ ]{10,15}$').hasMatch(phone);
  }

  void _onContinue() {
    if (_formKey.currentState?.validate() ?? false) {
      HapticFeedback.mediumImpact();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: LegalittTheme.primaryWarmBeige,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          content: Text(
            'Sender information validated for ${_senderNameController.text.trim()}. Proceeding to Step 4...',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      );
    } else {
      HapticFeedback.vibrate();
    }
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
                // ── 1. Horizontal Step Progress Indicator (Step 3 of 5) ────────
                const _StepProgressBar(currentStep: 3, totalSteps: 5),

                // ── 2. Scrollable Form Content ─────────────────────────────────
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24.0,
                      vertical: 16.0,
                    ),
                    child: Form(
                      key: _formKey,
                      autovalidateMode: AutovalidateMode.onUserInteraction,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 8),

                          // ── AI Conversational Query Chat Bubble ───────────────
                          const _AIChatBubble(
                            message: "Please provide your details.",
                          ),

                          const SizedBox(height: 24),

                          // ── Field 1: Sender Full Name ─────────────────────────
                          _ValidatedInputField(
                            controller: _senderNameController,
                            label: 'Full Name',
                            placeholder: 'e.g., Ananya Sharma',
                            icon: Icons.person_outline_rounded,
                            validator: (val) {
                              if (val == null || val.trim().isEmpty) {
                                return 'Please enter your full legal name';
                              }
                              if (val.trim().length < 3) {
                                return 'Name must be at least 3 characters';
                              }
                              return null;
                            },
                          ),

                          const SizedBox(height: 16),

                          // ── Field 2: Phone Number ──────────────────────────────
                          _ValidatedInputField(
                            controller: _phoneController,
                            label: 'Phone Number',
                            placeholder: 'e.g., +91 98765 43210',
                            icon: Icons.phone_outlined,
                            keyboardType: TextInputType.phone,
                            validator: (val) {
                              if (val == null || val.trim().isEmpty) {
                                return 'Please enter your phone number';
                              }
                              if (!_isValidPhone(val.trim())) {
                                return 'Enter a valid phone number';
                              }
                              return null;
                            },
                          ),

                          const SizedBox(height: 16),

                          // ── Field 3: Email Address ─────────────────────────────
                          _ValidatedInputField(
                            controller: _emailController,
                            label: 'Email Address',
                            placeholder: 'e.g., ananya.sharma@example.com',
                            icon: Icons.email_outlined,
                            keyboardType: TextInputType.emailAddress,
                            validator: (val) {
                              if (val == null || val.trim().isEmpty) {
                                return 'Please enter your email address';
                              }
                              if (!_isValidEmail(val.trim())) {
                                return 'Enter a valid email address';
                              }
                              return null;
                            },
                          ),

                          const SizedBox(height: 16),

                          // ── Field 4: Complete Address (Multiline Address) ──────
                          _ValidatedInputField(
                            controller: _addressController,
                            label: 'Complete Address',
                            placeholder: 'House/Flat No., Building, Street, City, State, Pincode',
                            icon: Icons.location_on_outlined,
                            isMultiline: true,
                            maxLines: 3,
                            minLines: 3,
                            validator: (val) {
                              if (val == null || val.trim().isEmpty) {
                                return 'Please enter your complete address';
                              }
                              if (val.trim().length < 10) {
                                return 'Please provide full address details';
                              }
                              return null;
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
                ),

                // ── 3. Fixed Bottom Action Container with Soft Ripple Button ────
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

// ── Auto-Validated Focus Input Field Widget (22px Radius) ───────────────────
class _ValidatedInputField extends StatefulWidget {
  final TextEditingController controller;
  final String label;
  final String placeholder;
  final IconData icon;
  final bool isMultiline;
  final int maxLines;
  final int minLines;
  final TextInputType? keyboardType;
  final FormFieldValidator<String>? validator;

  const _ValidatedInputField({
    Key? key,
    required this.controller,
    required this.label,
    required this.placeholder,
    required this.icon,
    this.isMultiline = false,
    this.maxLines = 1,
    this.minLines = 1,
    this.keyboardType,
    this.validator,
  }) : super(key: key);

  @override
  State<_ValidatedInputField> createState() => _ValidatedInputFieldState();
}

class _ValidatedInputFieldState extends State<_ValidatedInputField> {
  final FocusNode _focusNode = FocusNode();
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      setState(() {
        _isFocused = _focusNode.hasFocus;
      });
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4.0, bottom: 6.0),
          child: Text(
            widget.label,
            style: const TextStyle(
              color: LegalittTheme.textPrimary,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          decoration: BoxDecoration(
            color: LegalittTheme.cardBackground,
            borderRadius: BorderRadius.circular(LegalittTheme.borderRadius),
            border: Border.all(
              color: _isFocused
                  ? LegalittTheme.primaryWarmBeige
                  : LegalittTheme.borderColor,
              width: _isFocused ? 1.6 : 1.2,
            ),
            boxShadow: _isFocused
                ? [
                    BoxShadow(
                      color: LegalittTheme.primaryWarmBeige.withOpacity(0.18),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ]
                : LegalittTheme.softShadow,
          ),
          child: TextFormField(
            controller: widget.controller,
            focusNode: _focusNode,
            maxLines: widget.isMultiline ? widget.maxLines : 1,
            minLines: widget.isMultiline ? widget.minLines : 1,
            keyboardType: widget.keyboardType,
            validator: widget.validator,
            style: const TextStyle(
              color: LegalittTheme.textPrimary,
              fontSize: 14,
              height: 1.4,
            ),
            decoration: InputDecoration(
              prefixIcon: Padding(
                padding: EdgeInsets.only(
                  bottom: widget.isMultiline ? 36.0 : 0.0,
                ),
                child: Icon(
                  widget.icon,
                  size: 20,
                  color: _isFocused
                      ? LegalittTheme.primaryWarmBeige
                      : LegalittTheme.textSecondary,
                ),
              ),
              hintText: widget.placeholder,
              hintStyle: const TextStyle(
                color: LegalittTheme.textSecondary,
                fontSize: 13.5,
                fontWeight: FontWeight.w400,
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 16.0,
              ),
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              errorBorder: InputBorder.none,
              focusedErrorBorder: InputBorder.none,
              errorStyle: const TextStyle(
                color: LegalittTheme.errorRed,
                fontSize: 11.5,
                height: 1.2,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
