import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';

import '../../core/models/order.dart';
import '../../core/providers/payment_provider.dart';
import '../../shared/theme/colors.dart';

class PaymentHistoryScreen extends ConsumerWidget {
  const PaymentHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(orderHistoryProvider);

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: Text(
          'Payment History',
          style: GoogleFonts.playfairDisplay(
            fontWeight: FontWeight.w700,
            fontSize: 20,
            color: AppColors.textPrimary,
          ),
        ),
        backgroundColor: AppColors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
      ),
      body: ordersAsync.when(
        loading: () => _buildShimmer(),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline_rounded,
                    size: 48, color: AppColors.error),
                const SizedBox(height: 16),
                Text(
                  'Failed to load payment history',
                  style: GoogleFonts.inter(
                      fontSize: 16, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () => ref.invalidate(orderHistoryProvider),
                  child: Text(
                    'Retry',
                    style: GoogleFonts.inter(
                        color: AppColors.orange, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
        ),
        data: (orders) {
          if (orders.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.receipt_long_rounded,
                      size: 64,
                      color: AppColors.textSecondary.withValues(alpha: 0.4)),
                  const SizedBox(height: 16),
                  Text(
                    'No payments yet',
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Your payment history will appear here',
                    style: GoogleFonts.inter(
                        fontSize: 14, color: AppColors.textSecondary),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            color: AppColors.orange,
            onRefresh: () async => ref.invalidate(orderHistoryProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: orders.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, index) =>
                  _OrderTile(order: orders[index]),
            ),
          );
        },
      ),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade200,
      highlightColor: Colors.grey.shade50,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: 5,
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (_, _) => Container(
          height: 80,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}

class _OrderTile extends StatelessWidget {
  final CourseOrder order;

  const _OrderTile({required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: _statusColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(_statusIcon, color: _statusColor, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  order.formattedAmount,
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  order.formattedDate,
                  style: GoogleFonts.inter(
                      fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: _statusColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              order.statusLabel,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: _statusColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color get _statusColor {
    switch (order.status) {
      case 'completed':
        return AppColors.success;
      case 'failed':
        return AppColors.error;
      case 'refunded':
        return AppColors.golden;
      default:
        return AppColors.textSecondary;
    }
  }

  IconData get _statusIcon {
    switch (order.status) {
      case 'completed':
        return Icons.check_circle_rounded;
      case 'failed':
        return Icons.cancel_rounded;
      case 'refunded':
        return Icons.replay_rounded;
      default:
        return Icons.schedule_rounded;
    }
  }
}
