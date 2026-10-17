import 'package:flutter/material.dart';

import '../theme/typography.dart';

class BadgeChip extends StatelessWidget {
  final String label;
  final Color color;
  final IconData? icon;
  final Color? textColor;

  const BadgeChip({
    super.key,
    required this.label,
    required this.color,
    this.icon,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    final displayColor = textColor ?? color;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: displayColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: AppTypography.caption.copyWith(
              color: displayColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
