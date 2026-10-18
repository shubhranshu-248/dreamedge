import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/live_class.dart';
import '../services/live_class_service.dart';
import 'supabase_provider.dart';

final liveClassServiceProvider = Provider<LiveClassService>((ref) {
  return LiveClassService(ref.watch(supabaseClientProvider));
});

final upcomingClassesProvider = FutureProvider<List<LiveClass>>((ref) {
  return ref.watch(liveClassServiceProvider).getUpcomingClasses();
});

final todayClassesProvider = FutureProvider<List<LiveClass>>((ref) {
  return ref.watch(liveClassServiceProvider).getTodayClasses();
});

final pastClassesProvider = FutureProvider<List<LiveClass>>((ref) {
  return ref.watch(liveClassServiceProvider).getPastClasses();
});

final liveClassDetailProvider =
    FutureProvider.family<LiveClass?, String>((ref, id) {
  return ref.watch(liveClassServiceProvider).getLiveClassById(id);
});

final courseClassesProvider =
    FutureProvider.family<List<LiveClass>, String>((ref, courseId) {
  return ref.watch(liveClassServiceProvider).getClassesByCourse(courseId);
});
