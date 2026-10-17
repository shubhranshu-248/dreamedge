import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/content.dart';
import '../services/content_service.dart';
import 'supabase_provider.dart';

final contentServiceProvider = Provider<ContentService>((ref) {
  return ContentService(ref.watch(supabaseClientProvider));
});

final topicContentsProvider =
    FutureProvider.family<List<Content>, String>((ref, topicId) {
  return ref.watch(contentServiceProvider).getContentsByTopic(topicId);
});

final contentDetailProvider =
    FutureProvider.family<Content, String>((ref, contentId) {
  return ref.watch(contentServiceProvider).getContentById(contentId);
});

final freeContentsProvider = FutureProvider<List<Content>>((ref) {
  return ref.watch(contentServiceProvider).getFreeContents();
});
