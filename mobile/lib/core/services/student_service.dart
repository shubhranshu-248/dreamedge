import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/student.dart';

class StudentService {
  final SupabaseClient _client;

  StudentService(this._client);

  Future<Student?> getCurrentStudent() async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return null;

    final data = await _client
        .from('students')
        .select()
        .eq('user_id', userId)
        .maybeSingle();

    if (data == null) return null;
    return Student.fromJson(data);
  }

  Future<Student> createStudentProfile({
    required String userId,
    required String fullName,
    required String email,
    String? phone,
    String? studentClass,
  }) async {
    final data = await _client.from('students').insert({
      'user_id': userId,
      'full_name': fullName,
      'email': email,
      'phone': phone,
      'class': studentClass,
    }).select().single();
    return Student.fromJson(data);
  }

  Future<Student> updateStudentProfile(
    String studentId,
    Map<String, dynamic> updates,
  ) async {
    final data = await _client
        .from('students')
        .update(updates)
        .eq('id', studentId)
        .select()
        .single();
    return Student.fromJson(data);
  }
}
