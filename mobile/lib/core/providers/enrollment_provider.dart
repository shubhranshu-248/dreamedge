import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/enrollment.dart';
import '../services/enrollment_service.dart';
import 'supabase_provider.dart';

final enrollmentServiceProvider = Provider<EnrollmentService>((ref) {
  return EnrollmentService(ref.watch(supabaseClientProvider));
});

final currentStudentIdProvider = Provider<String?>((ref) {
  final session = ref.watch(currentSessionProvider);
  return session?.user.id;
});

final myEnrollmentsProvider = FutureProvider<List<Enrollment>>((ref) {
  final studentId = ref.watch(currentStudentIdProvider);
  if (studentId == null) return [];
  return ref.watch(enrollmentServiceProvider).getMyEnrollments(studentId);
});

final courseEnrollmentProvider =
    FutureProvider.family<Enrollment?, String>((ref, courseId) {
  final studentId = ref.watch(currentStudentIdProvider);
  if (studentId == null) return null;
  return ref.watch(enrollmentServiceProvider).getEnrollment(studentId, courseId);
});
