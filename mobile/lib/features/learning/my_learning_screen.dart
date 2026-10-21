import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/enrollment_provider.dart';
import '../../shared/theme/colors.dart';
import '../../shared/theme/typography.dart';
import '../../shared/widgets/shimmer_box.dart';
import 'widgets/enrolled_course_card.dart';
import 'widgets/enrollment_empty_state.dart';

class MyLearningScreen extends ConsumerWidget {
  const MyLearningScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final enrollmentsAsync = ref.watch(myEnrollmentsProvider);

    return RefreshIndicator(
        color: AppColors.orange,
        onRefresh: () async {
          ref.invalidate(myEnrollmentsProvider);
        },
        child: enrollmentsAsync.when(
          data: (enrollments) {
            if (enrollments.isEmpty) {
              return ListView(
                children: [
                  SizedBox(
                    height: MediaQuery.of(context).size.height * 0.65,
                    child: EnrollmentEmptyState(
                      onBrowseCourses: () => context.go('/'),
                    ),
                  ),
                ],
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              itemCount: enrollments.length,
              itemBuilder: (context, index) =>
                  EnrolledCourseCard(enrollment: enrollments[index]),
            );
          },
          loading: () => ShimmerList(itemCount: 4, itemHeight: 100),
          error: (error, _) => Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Could not load your courses',
                  style: AppTypography.bodyLarge
                      .copyWith(color: AppColors.error),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => ref.invalidate(myEnrollmentsProvider),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
  }
}
