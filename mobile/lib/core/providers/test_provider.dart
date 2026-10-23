import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/test.dart';
import '../models/test_attempt.dart';
import '../models/test_question.dart';
import '../services/test_service.dart';
import 'enrollment_provider.dart';
import 'supabase_provider.dart';

final testServiceProvider = Provider<TestService>((ref) {
  return TestService(ref.watch(supabaseClientProvider));
});

/// All published tests available to the current student across their enrolled courses.
final testListProvider = FutureProvider<List<Test>>((ref) {
  final studentId = ref.watch(currentStudentIdProvider);
  if (studentId == null) return [];
  return ref.watch(testServiceProvider).getTestsForStudent(studentId);
});

/// All of the current student's test attempts, newest first.
final myTestAttemptsProvider = FutureProvider<List<TestAttempt>>((ref) {
  final studentId = ref.watch(currentStudentIdProvider);
  if (studentId == null) return [];
  return ref.watch(testServiceProvider).getAttemptsForStudent(studentId);
});

/// Attempts the current student has made on a given test (newest first).
final attemptsForTestProvider =
    FutureProvider.family<List<TestAttempt>, String>((ref, testId) {
  final studentId = ref.watch(currentStudentIdProvider);
  if (studentId == null) return [];
  return ref
      .watch(testServiceProvider)
      .getAttemptsForTest(studentId, testId);
});

final testByIdProvider =
    FutureProvider.family<Test, String>((ref, id) {
  return ref.watch(testServiceProvider).getTestById(id);
});

final questionsForTestProvider =
    FutureProvider.family<List<TestQuestion>, String>((ref, testId) {
  return ref.watch(testServiceProvider).getQuestionsForTest(testId);
});

final attemptByIdProvider =
    FutureProvider.family<TestAttempt, String>((ref, id) {
  return ref.watch(testServiceProvider).getAttemptById(id);
});

/// Imperative submit API: await `ref.read(submitTestAttemptProvider)(payload)`.
class SubmitTestPayload {
  final Test test;
  final List<TestQuestion> questions;
  final Map<String, dynamic> answers;
  final int timeTakenSeconds;

  const SubmitTestPayload({
    required this.test,
    required this.questions,
    required this.answers,
    required this.timeTakenSeconds,
  });
}

typedef SubmitTestAttempt = Future<TestAttempt> Function(
    SubmitTestPayload payload);

final submitTestAttemptProvider = Provider<SubmitTestAttempt>((ref) {
  return (payload) async {
    final studentId = ref.read(currentStudentIdProvider);
    if (studentId == null) {
      throw StateError('No signed-in student to submit for');
    }
    final attempt = await ref.read(testServiceProvider).submitAttempt(
          studentId: studentId,
          test: payload.test,
          questions: payload.questions,
          answers: payload.answers,
          timeTakenSeconds: payload.timeTakenSeconds,
        );
    // Refresh dependent lists.
    ref.invalidate(myTestAttemptsProvider);
    ref.invalidate(attemptsForTestProvider(payload.test.id));
    return attempt;
  };
});
