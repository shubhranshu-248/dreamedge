import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AppNotification {
  final String id;
  final String title;
  final String body;
  final String? imageUrl;
  final String? route;
  final String type;
  final bool isRead;
  final DateTime createdAt;

  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    this.imageUrl,
    this.route,
    required this.type,
    required this.isRead,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      title: json['title'] as String? ?? '',
      body: json['body'] as String? ?? '',
      imageUrl: json['image_url'] as String?,
      route: json['route'] as String?,
      type: json['type'] as String? ?? 'promo',
      isRead: json['is_read'] as bool? ?? false,
      createdAt: DateTime.parse(
        json['created_at'] as String? ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'image_url': imageUrl,
      'route': route,
      'type': type,
      'is_read': isRead,
      'created_at': createdAt.toIso8601String(),
    };
  }

  IconData get typeIcon {
    switch (type) {
      case 'live_class':
        return Icons.videocam_outlined;
      case 'enrollment':
        return Icons.school_outlined;
      case 'course_update':
        return Icons.update_outlined;
      default:
        return Icons.campaign_outlined;
    }
  }

  Color get typeColor {
    switch (type) {
      case 'live_class':
        return const Color(0xFFEF4444);
      case 'enrollment':
        return const Color(0xFF22C55E);
      case 'course_update':
        return const Color(0xFF3B82F6);
      default:
        return const Color(0xFFF26A21);
    }
  }

  String get formattedTime {
    final now = DateTime.now();
    final diff = now.difference(createdAt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return DateFormat('d MMM').format(createdAt);
  }
}
