import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../config/payment_config.dart';
import '../../core/providers/payment_provider.dart';
import '../../shared/theme/colors.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  final String courseId;
  final String courseName;
  final double price;
  final String? thumbnailUrl;

  const CheckoutScreen({
    super.key,
    required this.courseId,
    required this.courseName,
    required this.price,
    this.thumbnailUrl,
  });

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  late Razorpay _razorpay;
  bool _isProcessing = false;
  String? _currentOrderId;

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  @override
  void dispose() {
    _razorpay.clear();
    super.dispose();
  }

  Future<void> _initiatePayment() async {
    setState(() => _isProcessing = true);

    try {
      final service = ref.read(paymentServiceProvider);

      final enrolled = await service.isEnrolled(widget.courseId);
      if (enrolled && mounted) {
        _showSnackBar('You are already enrolled in this course!',
            isError: false);
        setState(() => _isProcessing = false);
        return;
      }

      final order = await service.createOrder(
        courseId: widget.courseId,
        amount: widget.price,
      );

      _currentOrderId = order['id'] as String;

      final options = {
        'key': PaymentConfig.razorpayKeyId,
        'amount': (widget.price * 100).toInt(),
        'name': PaymentConfig.merchantName,
        'description': widget.courseName,
        'currency': PaymentConfig.currency,
        'receipt': order['receipt'],
        'prefill': {
          'email':
              Supabase.instance.client.auth.currentUser?.email ?? '',
        },
        'theme': {
          'color': '#F26A21',
        },
        'notes': {
          'course_id': widget.courseId,
          'order_id': _currentOrderId,
        },
      };

      _razorpay.open(options);
    } catch (e) {
      if (mounted) {
        _showSnackBar('Failed to initiate payment. Please try again.');
        setState(() => _isProcessing = false);
      }
    }
  }

  Future<void> _handlePaymentSuccess(PaymentSuccessResponse response) async {
    try {
      final service = ref.read(paymentServiceProvider);

      await service.completeOrder(
        orderId: _currentOrderId!,
        razorpayPaymentId: response.paymentId ?? '',
        razorpaySignature: response.signature ?? '',
        razorpayOrderId: response.orderId,
      );

      await service.enrollUser(
        courseId: widget.courseId,
        orderId: _currentOrderId!,
      );

      ref.invalidate(orderHistoryProvider);
      ref.invalidate(isEnrolledProvider(widget.courseId));

      if (mounted) {
        _showSuccessDialog();
      }
    } catch (e) {
      if (mounted) {
        _showSnackBar(
            'Payment received but enrollment failed. Contact support.');
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    final service = ref.read(paymentServiceProvider);
    if (_currentOrderId != null) {
      service.failOrder(_currentOrderId!);
    }

    if (mounted) {
      _showSnackBar(response.message ?? 'Payment failed. Please try again.');
      setState(() => _isProcessing = false);
    }
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    if (mounted) {
      _showSnackBar('External wallet selected: ${response.walletName}',
          isError: false);
    }
  }

  void _showSnackBar(String message, {bool isError = true}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? AppColors.error : AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_rounded,
                  color: AppColors.success, size: 48),
            ),
            const SizedBox(height: 20),
            Text(
              'Payment Successful!',
              style: GoogleFonts.playfairDisplay(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'You are now enrolled in ${widget.courseName}',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  context.go('/');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.orange,
                  foregroundColor: AppColors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: Text(
                  'Start Learning',
                  style: GoogleFonts.inter(
                      fontWeight: FontWeight.w600, fontSize: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: Text(
          'Checkout',
          style: GoogleFonts.playfairDisplay(
            fontWeight: FontWeight.w700,
            fontSize: 20,
            color: AppColors.textPrimary,
          ),
        ),
        backgroundColor: AppColors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded,
              color: AppColors.textPrimary),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (widget.thumbnailUrl != null)
                    ClipRRect(
                      borderRadius:
                          const BorderRadius.vertical(top: Radius.circular(16)),
                      child: AspectRatio(
                        aspectRatio: 16 / 9,
                        child: Image.network(
                          widget.thumbnailUrl!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, _, _) => Container(
                            color: AppColors.darkBlue.withValues(alpha: 0.1),
                            child: const Icon(Icons.image_rounded,
                                size: 48, color: AppColors.textSecondary),
                          ),
                        ),
                      ),
                    ),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.courseName,
                          style: GoogleFonts.inter(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Full course access with all lessons and materials',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Order Summary',
              style: GoogleFonts.playfairDisplay(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  _buildSummaryRow(
                      'Course Price', '₹${widget.price.toStringAsFixed(0)}'),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Divider(height: 1),
                  ),
                  _buildSummaryRow('Discount', '₹0', isSecondary: true),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Divider(height: 1),
                  ),
                  _buildSummaryRow(
                      'Total', '₹${widget.price.toStringAsFixed(0)}',
                      isBold: true),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.shield_rounded,
                      color: AppColors.success, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Payments are secured by Razorpay. Your card details are never stored.',
                      style: GoogleFonts.inter(
                          fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          child: SizedBox(
            height: 52,
            child: ElevatedButton(
              onPressed: _isProcessing ? null : _initiatePayment,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.orange,
                foregroundColor: AppColors.white,
                disabledBackgroundColor:
                    AppColors.orange.withValues(alpha: 0.5),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              child: _isProcessing
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(
                          strokeWidth: 2.5, color: AppColors.white),
                    )
                  : Text(
                      'Pay ₹${widget.price.toStringAsFixed(0)}',
                      style: GoogleFonts.inter(
                          fontSize: 16, fontWeight: FontWeight.w600),
                    ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value,
      {bool isBold = false, bool isSecondary = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: isBold ? FontWeight.w600 : FontWeight.w400,
            color:
                isSecondary ? AppColors.textSecondary : AppColors.textPrimary,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: isBold ? 18 : 14,
            fontWeight: isBold ? FontWeight.w700 : FontWeight.w500,
            color: isBold
                ? AppColors.orange
                : (isSecondary
                    ? AppColors.textSecondary
                    : AppColors.textPrimary),
          ),
        ),
      ],
    );
  }
}
