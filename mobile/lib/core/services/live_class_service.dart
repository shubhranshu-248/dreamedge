import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/live_class.dart';

class LiveClassService {
  final SupabaseClient _client;

  LiveClassService(this._client);

  Future<List<LiveClass>> getUpcomingClasses() async {
    final now = DateTime.now().toIso8601String();
    final data = await _client
        .from('live_classes')
        .select()
        .gte('scheduled_at', now)
        .inFilter('status', ['scheduled', 'live'])
        .order('scheduled_at', ascending: true)
        .limit(20);

    return (data as List)
        .map((e) => LiveClass.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<LiveClass>> getTodayClasses() async {
    final now = DateTime.now();
    final startOfDay = DateTime(now.year, now.month, now.day).toIso8601String();
    final endOfDay =
        DateTime(now.year, now.month, now.day, 23, 59, 59).toIso8601String();

    final data = await _client
        .from('live_classes')
        .select()
        .gte('scheduled_at', startOfDay)
        .lte('scheduled_at', endOfDay)
        .order('scheduled_at', ascending: true);

    return (data as List)
        .map((e) => LiveClass.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<LiveClass>> getPastClasses({int limit = 20}) async {
    final data = await _client
        .from('live_classes')
        .select()
        .eq('status', 'completed')
        .order('scheduled_at', ascending: false)
        .limit(limit);

    return (data as List)
        .map((e) => LiveClass.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<LiveClass?> getLiveClassById(String id) async {
    final data = await _client
        .from('live_classes')
        .select()
        .eq('id', id)
        .maybeSingle();

    if (data == null) return null;
    return LiveClass.fromJson(data);
  }

  Future<List<LiveClass>> getClassesByCourse(String courseId) async {
    final data = await _client
        .from('live_classes')
        .select()
        .eq('course_id', courseId)
        .order('scheduled_at', ascending: false);

    return (data as List)
        .map((e) => LiveClass.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
