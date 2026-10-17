import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../config/constants.dart';
import '../../../core/providers/course_provider.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/typography.dart';

class CourseFilters extends ConsumerWidget {
  final String? selectedClass;
  final String? selectedCategory;
  final ValueChanged<String?> onClassChanged;
  final ValueChanged<String?> onCategoryChanged;

  const CourseFilters({
    super.key,
    required this.selectedClass,
    required this.selectedCategory,
    required this.onClassChanged,
    required this.onCategoryChanged,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categories = ref.watch(categoriesProvider);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          _buildDropdown(
            value: selectedClass,
            hint: 'All Classes',
            items: [
              const DropdownMenuItem(value: null, child: Text('All Classes')),
              ...AppConstants.classes.map(
                (c) => DropdownMenuItem(value: c, child: Text('Class $c')),
              ),
            ],
            onChanged: onClassChanged,
          ),
          const SizedBox(width: 12),
          categories.when(
            data: (list) => _buildDropdown(
              value: selectedCategory,
              hint: 'All Categories',
              items: [
                const DropdownMenuItem(
                    value: null, child: Text('All Categories')),
                ...list.map(
                  (cat) => DropdownMenuItem(value: cat.id, child: Text(cat.name)),
                ),
              ],
              onChanged: onCategoryChanged,
            ),
            loading: () => _buildDropdown(
              value: null,
              hint: 'Loading...',
              items: const [],
              onChanged: (_) {},
            ),
            error: (_, _) => _buildDropdown(
              value: null,
              hint: 'Categories',
              items: const [],
              onChanged: (_) {},
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDropdown({
    required String? value,
    required String hint,
    required List<DropdownMenuItem<String?>> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: DropdownButtonHideUnderline(
          child: DropdownButton<String?>(
            value: value,
            hint: Text(hint, style: AppTypography.bodySmall),
            isExpanded: true,
            icon: const Icon(Icons.keyboard_arrow_down,
                size: 20, color: AppColors.gray),
            style: AppTypography.bodySmall
                .copyWith(color: AppColors.textPrimary),
            items: items,
            onChanged: onChanged,
          ),
        ),
      ),
    );
  }
}
