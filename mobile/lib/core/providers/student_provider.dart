import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/student.dart';
import '../services/student_service.dart';
import 'supabase_provider.dart';

final studentServiceProvider = Provider<StudentService>((ref) {
  return StudentService(ref.watch(supabaseClientProvider));
});

final currentStudentProvider = FutureProvider<Student?>((ref) {
  final session = ref.watch(currentSessionProvider);
  if (session == null) return null;
  return ref.watch(studentServiceProvider).getCurrentStudent();
});
