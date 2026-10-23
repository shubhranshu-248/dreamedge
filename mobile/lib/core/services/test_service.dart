import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/test.dart';
import '../models/test_attempt.dart';
import '../models/test_question.dart';

class TestService {
  final SupabaseClient _client;

  TestService(this._client);

  /// Returns all published tests for the courses the student is enrolled in.
  Future<List<Test>> getTestsForStudent(String studentId) async {
    final enrollments = await _client
        .from('enrollments')
        .select('course_id')
        .eq('student_id', studentId)
        .eq('status', 'active');

    final courseIds = (enrollments as List)
        .map((e) => (e as Map)['course_id'] as String)
        .toList();
    if (courseIds.isEmpty) return [];

    final data = await _client
        .from('tests')
        .select()
        .inFilter('course_id', courseIds)
        .eq('status', 'published')
        .order('start_time', ascending: true);

    return (data as List)
        .map((row) => Test.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<List<Test>> getTestsForCourse(String courseId) async {
    final data = await _client
        .from('tests')
        .select()
        .eq('course_id', courseId)
        .eq('status', 'published')
        .order('start_time', ascending: true);

    return (data as List)
        .map((row) => Test.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<Test> getTestById(String id) async {
    final data =
        await _client.from('tests').select().eq('id', id).single();
    return Test.fromJson(data);
  }

  Future<List<TestQuestion>> getQuestionsForTest(String testId) async {
    final data = await _client
        .from('questions')
        .select()
        .eq('test_id', testId)
        .order('sort_order', ascending: true);

    return (data as List)
        .map((row) => TestQuestion.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<List<TestAttempt>> getAttemptsForStudent(String studentId) async {
    final data = await _client
        .from('test_attempts')
        .select()
        .eq('student_id', studentId)
        .order('submitted_at', ascending: false);

    return (data as List)
        .map((row) => TestAttempt.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<List<TestAttempt>> getAttemptsForTest(
    String studentId,
    String testId,
  ) async {
    final data = await _client
        .from('test_attempts')
        .select()
        .eq('student_id', studentId)
        .eq('test_id', testId)
        .order('attempt_number', ascending: false);

    return (data as List)
        .map((row) => TestAttempt.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<TestAttempt> getAttemptById(String attemptId) async {
    final data = await _client
        .from('test_attempts')
        .select()
        .eq('id', attemptId)
        .single();
    return TestAttempt.fromJson(data);
  }

  Future<TestAttempt> submitAttempt({
    required String studentId,
    required Test test,
    required List<TestQuestion> questions,
    required Map<String, dynamic> answers,
    required int timeTakenSeconds,
  }) async {
    // Compute auto-score client-side.
    double score = 0;
    double totalMarks = 0;
    for (final q in questions) {
      totalMarks += q.positiveMarks;
      final answer = answers[q.id];
      if (answer == null) continue;
      final verdict = _evaluate(q, answer);
      if (verdict == _Verdict.correct) {
        score += q.positiveMarks;
      } else if (verdict == _Verdict.wrong) {
        score -= q.negativeMarks;
      }
    }
    if (score < 0) score = 0;

    final double effectiveTotal =
        test.totalMarks > 0 ? test.totalMarks : totalMarks;
    final double percentage =
        effectiveTotal > 0 ? (score / effectiveTotal) * 100 : 0;

    // Determine next attempt number.
    final existing = await _client
        .from('test_attempts')
        .select('attempt_number')
        .eq('student_id', studentId)
        .eq('test_id', test.id);
    final attemptNumber = ((existing as List).length) + 1;

    final insert = {
      'student_id': studentId,
      'test_id': test.id,
      'answers': answers,
      'score': score,
      'total_marks': effectiveTotal,
      'percentage': double.parse(percentage.toStringAsFixed(2)),
      'time_taken_seconds': timeTakenSeconds,
      'attempt_number': attemptNumber,
      'submitted_at': DateTime.now().toUtc().toIso8601String(),
    };

    final data = await _client
        .from('test_attempts')
        .insert(insert)
        .select()
        .single();

    return TestAttempt.fromJson(data);
  }

  _Verdict _evaluate(TestQuestion q, dynamic answer) {
    switch (q.type) {
      case QuestionType.mcqSingle:
        if (!q.hasAutoCorrectAnswer) return _Verdict.unscored;
        final chosen = answer?.toString();
        if (chosen == null || chosen.isEmpty) return _Verdict.blank;
        return q.correctOptionIds.contains(chosen)
            ? _Verdict.correct
            : _Verdict.wrong;
      case QuestionType.mcqMultiple:
        if (!q.hasAutoCorrectAnswer) return _Verdict.unscored;
        if (answer is! List) return _Verdict.blank;
        final chosen = answer.map((e) => e.toString()).toSet();
        if (chosen.isEmpty) return _Verdict.blank;
        final correct = q.correctOptionIds.toSet();
        return (chosen.length == correct.length &&
                chosen.containsAll(correct))
            ? _Verdict.correct
            : _Verdict.wrong;
      case QuestionType.trueFalse:
        final chosen = answer?.toString().toLowerCase();
        if (chosen == null || chosen.isEmpty) return _Verdict.blank;
        final expected = q.correctAnswer?.toLowerCase();
        if (expected == null || expected.isEmpty) return _Verdict.unscored;
        return chosen == expected ? _Verdict.correct : _Verdict.wrong;
      case QuestionType.shortAnswer:
        final text = answer?.toString().trim();
        if (text == null || text.isEmpty) return _Verdict.blank;
        final expected = q.correctAnswer?.trim();
        if (expected == null || expected.isEmpty) return _Verdict.unscored;
        return text.toLowerCase() == expected.toLowerCase()
            ? _Verdict.correct
            : _Verdict.wrong;
      case QuestionType.subjective:
      case QuestionType.matchPair:
      case QuestionType.imageBased:
      case QuestionType.unknown:
        return _Verdict.unscored;
    }
  }
}

enum _Verdict { correct, wrong, blank, unscored }

/// Shared evaluator exposed for the results screen.
class QuestionEvaluator {
  const QuestionEvaluator._();

  static QuestionVerdict evaluate(TestQuestion q, dynamic answer) {
    if (!q.hasAutoCorrectAnswer) return QuestionVerdict.pendingReview;
    switch (q.type) {
      case QuestionType.mcqSingle:
        final chosen = answer?.toString();
        if (chosen == null || chosen.isEmpty) return QuestionVerdict.blank;
        return q.correctOptionIds.contains(chosen)
            ? QuestionVerdict.correct
            : QuestionVerdict.wrong;
      case QuestionType.mcqMultiple:
        if (answer is! List || answer.isEmpty) return QuestionVerdict.blank;
        final chosen = answer.map((e) => e.toString()).toSet();
        final correct = q.correctOptionIds.toSet();
        return (chosen.length == correct.length &&
                chosen.containsAll(correct))
            ? QuestionVerdict.correct
            : QuestionVerdict.wrong;
      case QuestionType.trueFalse:
        final chosen = answer?.toString().toLowerCase();
        if (chosen == null || chosen.isEmpty) return QuestionVerdict.blank;
        return chosen == q.correctAnswer?.toLowerCase()
            ? QuestionVerdict.correct
            : QuestionVerdict.wrong;
      case QuestionType.shortAnswer:
        final text = answer?.toString().trim();
        if (text == null || text.isEmpty) return QuestionVerdict.blank;
        return text.toLowerCase() ==
                (q.correctAnswer ?? '').trim().toLowerCase()
            ? QuestionVerdict.correct
            : QuestionVerdict.wrong;
      default:
        return QuestionVerdict.pendingReview;
    }
  }

  static double marksFor(TestQuestion q, QuestionVerdict verdict) {
    switch (verdict) {
      case QuestionVerdict.correct:
        return q.positiveMarks;
      case QuestionVerdict.wrong:
        return -q.negativeMarks;
      case QuestionVerdict.blank:
      case QuestionVerdict.pendingReview:
        return 0;
    }
  }
}

enum QuestionVerdict { correct, wrong, blank, pendingReview }
