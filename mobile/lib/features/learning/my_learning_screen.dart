import 'package:flutter/material.dart';

import '../../shared/theme/colors.dart';
import '../../shared/theme/typography.dart';

class MyLearningScreen extends StatelessWidget {
  const MyLearningScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(title: const Text('My Learning')),
      body: Center(
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
                "You haven't enrolled in any courses yet",
                style: AppTypography.bodyLarge
                    .copyWith(color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {},
                child: const Text('Browse Courses'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
