import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/content.dart';

class ContentService {
  final SupabaseClient _client;

  ContentService(this._client);

  Future<List<Content>> getContentsByTopic(String topicId) async {
    final data = await _client
        .from('contents')
        .select()
        .eq('topic_id', topicId)
        .order('sort_order');
    return (data as List)
        .map((e) => Content.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Content> getContentById(String id) async {
    final data =
        await _client.from('contents').select().eq('id', id).single();
    return Content.fromJson(data);
  }

  Future<List<Content>> getFreeContents({int limit = 10}) async {
    final data = await _client
        .from('contents')
        .select()
        .eq('is_free', true)
        .eq('content_type', 'video')
        .order('created_at', ascending: false)
        .limit(limit);
    return (data as List)
        .map((e) => Content.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
