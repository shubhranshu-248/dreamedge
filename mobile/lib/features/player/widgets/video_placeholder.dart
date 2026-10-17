import 'package:flutter/material.dart';

import '../../../shared/theme/colors.dart';
import '../../../shared/theme/typography.dart';

enum PlaceholderState { loading, error, unavailable }

class VideoPlaceholder extends StatelessWidget {
  final PlaceholderState state;
  final VoidCallback? onRetry;

  const VideoPlaceholder({
    super.key,
    required this.state,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: Container(
        decoration: const BoxDecoration(color: AppColors.darkBlue),
        child: Center(child: _buildContent()),
      ),
    );
  }

  Widget _buildContent() {
    switch (state) {
      case PlaceholderState.loading:
        return const CircularProgressIndicator(
          color: AppColors.orange,
          strokeWidth: 3,
        );

      case PlaceholderState.error:
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded,
                size: 40, color: AppColors.white),
            const SizedBox(height: 10),
            Text(
              'Could not load video',
              style: AppTypography.bodyMedium
                  .copyWith(color: AppColors.white),
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 12),
              TextButton(
                onPressed: onRetry,
                style: TextButton.styleFrom(
                  backgroundColor: AppColors.orange.withValues(alpha: 0.2),
                  foregroundColor: AppColors.orange,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                ),
                child: const Text('Retry'),
              ),
            ],
          ],
        );

      case PlaceholderState.unavailable:
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.play_circle_outline_rounded,
                size: 48, color: AppColors.white.withValues(alpha: 0.6)),
            const SizedBox(height: 10),
            Text(
              'Video not available',
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.white.withValues(alpha: 0.7),
              ),
            ),
          ],
        );
    }
  }
}
