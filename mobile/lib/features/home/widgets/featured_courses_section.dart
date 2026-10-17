import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/providers/course_provider.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/typography.dart';
import '../../../shared/widgets/shimmer_box.dart';
import 'course_card.dart';

class FeaturedCoursesSection extends ConsumerWidget {
  const FeaturedCoursesSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final featured = ref.watch(featuredCoursesProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Text('Featured Courses', style: AppTypography.heading3),
        ),
        const SizedBox(height: 12),
        featured.when(
          data: (courses) {
            if (courses.isEmpty) {
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  'No featured courses yet',
                  style: AppTypography.bodyMedium
                      .copyWith(color: AppColors.textSecondary),
                ),
              );
            }
            return SizedBox(
              height: 270,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: courses.length,
                separatorBuilder: (_, _) => const SizedBox(width: 14),
                itemBuilder: (context, index) => CourseCard(
                  course: courses[index],
                  onTap: () =>
                      context.push('/course/${courses[index].id}'),
                ),
              ),
            );
          },
          loading: () => SizedBox(
            height: 270,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: 3,
              separatorBuilder: (_, _) => const SizedBox(width: 14),
              itemBuilder: (_, _) =>
                  const ShimmerBox(width: 220, height: 260, borderRadius: 12),
            ),
          ),
          error: (error, _) => Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                Text(
                  'Could not load courses',
                  style: AppTypography.bodyMedium
                      .copyWith(color: AppColors.error),
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () => ref.invalidate(featuredCoursesProvider),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
