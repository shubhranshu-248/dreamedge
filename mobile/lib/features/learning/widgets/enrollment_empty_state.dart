import 'package:flutter/material.dart';

import '../../../shared/theme/colors.dart';
import '../../../shared/theme/typography.dart';

class EnrollmentEmptyState extends StatelessWidget {
  final VoidCallback onBrowseCourses;

  const EnrollmentEmptyState({
    super.key,
    required this.onBrowseCourses,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.school_outlined,
              size: 72,
              color: AppColors.gray.withValues(alpha: 0.4),
            ),
            const SizedBox(height: 20),
            Text(
              'No courses yet',
              style: AppTypography.heading3,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Start learning by enrolling in a course that interests you.',
              style: AppTypography.bodyMedium
                  .copyWith(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: onBrowseCourses,
              child: const Text('Browse Courses'),
            ),
          ],
        ),
      ),
    );
  }
}
