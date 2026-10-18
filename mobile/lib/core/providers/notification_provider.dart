import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/app_notification.dart';
import '../services/notification_inbox_service.dart';
import 'supabase_provider.dart';

final notificationInboxServiceProvider =
    Provider<NotificationInboxService>((ref) {
  return NotificationInboxService(ref.watch(supabaseClientProvider));
});

final notificationsProvider =
    FutureProvider<List<AppNotification>>((ref) {
  return ref.watch(notificationInboxServiceProvider).getNotifications();
});

final unreadCountProvider = FutureProvider<int>((ref) {
  return ref.watch(notificationInboxServiceProvider).getUnreadCount();
});
