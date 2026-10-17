import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/enrollment.dart';

class EnrollmentService {
  final SupabaseClient _client;

  EnrollmentService(this._client);

  Future<List<Enrollment>> getMyEnrollments(String studentId) async {
    final data = await _client
        .from('enrollments')
        .select('*, courses(*)')
        .eq('student_id', studentId)
        .order('last_accessed_at', ascending: false, nullsFirst: false);

    return (data as List)
        .map((row) => Enrollment.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<Enrollment?> getEnrollment(
    String studentId,
    String courseId,
  ) async {
    final data = await _client
        .from('enrollments')
        .select('*, courses(*)')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .maybeSingle();

    if (data == null) return null;
    return Enrollment.fromJson(data);
  }

  Future<Enrollment> enrollInCourse(
    String studentId,
    String courseId,
  ) async {
    final data = await _client.from('enrollments').insert({
      'student_id': studentId,
      'course_id': courseId,
      'status': 'active',
      'progress_percentage': 0,
      'enrolled_at': DateTime.now().toIso8601String(),
    }).select('*, courses(*)').single();

    return Enrollment.fromJson(data);
  }

  Future<void> updateProgress(
    String enrollmentId,
    double progress,
  ) async {
    await _client.from('enrollments').update({
      'progress_percentage': progress,
      'last_accessed_at': DateTime.now().toIso8601String(),
    }).eq('id', enrollmentId);
  }

  Future<void> updateLastAccessed(String enrollmentId) async {
    await _client.from('enrollments').update({
      'last_accessed_at': DateTime.now().toIso8601String(),
    }).eq('id', enrollmentId);
  }
}
