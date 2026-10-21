import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/constants.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/supabase_provider.dart';
import '../../core/utils/extensions.dart';
import '../../shared/theme/colors.dart';
import '../../shared/theme/typography.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final fullName =
        user?.userMetadata?['full_name'] as String? ?? 'Student';
    final email = user?.email ?? '';
    final initials = fullName.initials;

    return ListView(
        children: [
          const SizedBox(height: 24),
          Center(
            child: CircleAvatar(
              radius: 44,
              backgroundColor: AppColors.orange.withValues(alpha: 0.12),
              child: Text(
                initials,
                style: AppTypography.heading2.copyWith(color: AppColors.orange),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Center(
            child: Text(fullName, style: AppTypography.heading3),
          ),
          const SizedBox(height: 4),
          Center(
            child: Text(
              email,
              style:
                  AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
          ),
          const SizedBox(height: 32),
          const Divider(height: 1),
          _MenuItem(
            icon: Icons.person_outline,
            title: 'Edit Profile',
            onTap: () {},
          ),
          _MenuItem(
            icon: Icons.receipt_long_outlined,
            title: 'Payment History',
            onTap: () => context.push('/payment-history'),
          ),
          _MenuItem(
            icon: Icons.emoji_events_outlined,
            title: 'My Certificates',
            onTap: () {},
          ),
          _MenuItem(
            icon: Icons.help_outline,
            title: 'Help & Support',
            onTap: () async {
              final uri = Uri(
                scheme: 'mailto',
                path: AppConstants.supportEmail,
                queryParameters: {'subject': 'Support Request - Dream Edge App'},
              );
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri);
              }
            },
          ),
          _MenuItem(
            icon: Icons.info_outline,
            title: 'About',
            subtitle: 'Version 1.0.0',
            onTap: () {},
          ),
          const Divider(height: 1),
          _MenuItem(
            icon: Icons.logout,
            title: 'Logout',
            titleColor: AppColors.error,
            onTap: () async {
              final confirmed = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Logout'),
                  content: const Text('Are you sure you want to logout?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      child: const Text('Logout'),
                    ),
                  ],
                ),
              );
              if (confirmed == true) {
                await ref.read(authServiceProvider).logout();
              }
            },
          ),
          const SizedBox(height: 32),
        ],
      );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Color? titleColor;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.title,
    this.subtitle,
    this.titleColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: titleColor ?? AppColors.textSecondary),
      title: Text(
        title,
        style: AppTypography.bodyLarge.copyWith(color: titleColor),
      ),
      subtitle: subtitle != null
          ? Text(subtitle!, style: AppTypography.caption)
          : null,
      trailing: titleColor == null
          ? const Icon(Icons.chevron_right, color: AppColors.gray)
          : null,
      onTap: onTap,
    );
  }
}
