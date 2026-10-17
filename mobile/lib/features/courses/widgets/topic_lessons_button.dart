import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/theme/colors.dart';
import '../../../shared/theme/typography.dart';

class TopicLessonsButton extends StatelessWidget {
  final String topicId;
  final String topicName;
  final int contentCount;

  const TopicLessonsButton({
    super.key,
    required this.topicId,
    required this.topicName,
    required this.contentCount,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/lessons/$topicId', extra: topicName),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.orange.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '$contentCount lessons',
              style: AppTypography.caption.copyWith(
                color: AppColors.orange,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right_rounded,
                size: 16, color: AppColors.orange),
          ],
        ),
      ),
    );
  }
}
