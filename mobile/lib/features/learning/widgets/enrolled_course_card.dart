import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';

import '../../../core/models/enrollment.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/typography.dart';

class EnrolledCourseCard extends StatelessWidget {
  final Enrollment enrollment;

  const EnrolledCourseCard({super.key, required this.enrollment});

  @override
  Widget build(BuildContext context) {
    final course = enrollment.course;
    final title = course?.title ?? 'Course';
    final targetClass = course?.targetClass;
    final thumbnailUrl = course?.thumbnailUrl;

    return GestureDetector(
      onTap: () => context.push('/course/${enrollment.courseId}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: SizedBox(
                width: 80,
                height: 80,
                child: thumbnailUrl != null
                    ? CachedNetworkImage(
                        imageUrl: thumbnailUrl,
                        fit: BoxFit.cover,
                        placeholder: (_, _) => _thumbnailPlaceholder(),
                        errorWidget: (_, _, _) => _thumbnailPlaceholder(),
                      )
                    : _thumbnailPlaceholder(),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (targetClass != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 6),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.orange.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'Class $targetClass',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.orange,
                          fontWeight: FontWeight.w600,
                          fontSize: 10,
                        ),
                      ),
                    ),
                  Text(
                    title,
                    style: AppTypography.bodyMedium
                        .copyWith(fontWeight: FontWeight.w600),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: enrollment.progressPercentage / 100,
                            backgroundColor:
                                AppColors.gray.withValues(alpha: 0.15),
                            valueColor: const AlwaysStoppedAnimation<Color>(
                                AppColors.orange),
                            minHeight: 6,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        enrollment.formattedProgress,
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  if (enrollment.lastAccessedAt != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      _formatLastAccessed(enrollment.lastAccessedAt!),
                      style: AppTypography.caption.copyWith(
                        color: AppColors.gray,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 4),
            const Icon(
              Icons.chevron_right_rounded,
              color: AppColors.gray,
              size: 22,
            ),
          ],
        ),
      ),
    );
  }

  Widget _thumbnailPlaceholder() {
    return Container(
      color: AppColors.darkBlue,
      child: Center(
        child: Icon(
          Icons.play_circle_outline,
          size: 28,
          color: AppColors.white.withValues(alpha: 0.4),
        ),
      ),
    );
  }

  String _formatLastAccessed(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 60) return 'Accessed just now';
    if (diff.inHours < 24) return 'Accessed ${diff.inHours}h ago';
    if (diff.inDays < 7) return 'Accessed ${diff.inDays}d ago';
    return 'Accessed on ${date.day}/${date.month}/${date.year}';
  }
}
