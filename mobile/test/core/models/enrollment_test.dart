import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/models/enrollment.dart';

void main() {
  group('Enrollment', () {
    final courseJson = {
      'id': 'c-001',
      'category_id': 'cat-math',
      'title': 'Mathematics Class 10',
      'target_class': '10',
      'price': 999,
      'discount_price': 799,
      'status': 'published',
      'is_featured': true,
      'enrollment_count': 150,
      'total_lessons': 45,
      'duration_minutes': 750,
      'created_at': '2025-01-01T00:00:00Z',
      'updated_at': '2025-01-15T00:00:00Z',
    };

    final completeJson = {
      'id': 'e-001',
      'student_id': 's-001',
      'course_id': 'c-001',
      'enrolled_at': '2025-02-01T00:00:00Z',
      'status': 'active',
      'progress_percentage': 45.0,
      'last_accessed_at': '2025-03-01T12:00:00Z',
      'created_at': '2025-02-01T00:00:00Z',
      'courses': courseJson,
    };

    test('fromJson parses complete data with nested course', () {
      final enrollment = Enrollment.fromJson(completeJson);

      expect(enrollment.id, 'e-001');
      expect(enrollment.studentId, 's-001');
      expect(enrollment.courseId, 'c-001');
      expect(enrollment.status, 'active');
      expect(enrollment.progressPercentage, 45.0);
      expect(enrollment.lastAccessedAt, isNotNull);
      expect(enrollment.course, isNotNull);
      expect(enrollment.course!.title, 'Mathematics Class 10');
    });

    test('fromJson works without nested course', () {
      final json = {
        'id': 'e-002',
        'student_id': 's-001',
        'course_id': 'c-002',
        'enrolled_at': '2025-03-01T00:00:00Z',
        'status': 'active',
        'created_at': '2025-03-01T00:00:00Z',
      };
      final enrollment = Enrollment.fromJson(json);

      expect(enrollment.course, isNull);
      expect(enrollment.courseId, 'c-002');
    });

    test('fromJson handles null lastAccessedAt', () {
      final json = {
        'id': 'e-003',
        'student_id': 's-001',
        'course_id': 'c-001',
        'enrolled_at': '2025-02-01T00:00:00Z',
        'created_at': '2025-02-01T00:00:00Z',
      };
      final enrollment = Enrollment.fromJson(json);
      expect(enrollment.lastAccessedAt, isNull);
    });

    group('computed properties', () {
      test('isActive returns true for active status', () {
        final enrollment = Enrollment.fromJson(completeJson);
        expect(enrollment.isActive, true);
        expect(enrollment.isCompleted, false);
        expect(enrollment.isExpired, false);
      });

      test('isCompleted returns true for completed status', () {
        final json = {...completeJson, 'status': 'completed'};
        final enrollment = Enrollment.fromJson(json);
        expect(enrollment.isCompleted, true);
        expect(enrollment.isActive, false);
      });

      test('isExpired returns true for expired status', () {
        final json = {...completeJson, 'status': 'expired'};
        final enrollment = Enrollment.fromJson(json);
        expect(enrollment.isExpired, true);
        expect(enrollment.isActive, false);
      });

      test('formattedProgress returns percentage string', () {
        final enrollment = Enrollment.fromJson(completeJson);
        expect(enrollment.formattedProgress, '45%');
      });

      test('formattedProgress rounds decimal values', () {
        final json = {...completeJson, 'progress_percentage': 67.8};
        final enrollment = Enrollment.fromJson(json);
        expect(enrollment.formattedProgress, '68%');
      });
    });

    test('progressPercentage defaults to 0', () {
      final json = {
        'id': 'e-004',
        'student_id': 's-001',
        'course_id': 'c-001',
        'enrolled_at': '2025-02-01T00:00:00Z',
        'created_at': '2025-02-01T00:00:00Z',
      };
      final enrollment = Enrollment.fromJson(json);
      expect(enrollment.progressPercentage, 0);
    });

    test('status defaults to active when null in JSON', () {
      final json = {
        'id': 'e-005',
        'student_id': 's-001',
        'course_id': 'c-001',
        'enrolled_at': '2025-02-01T00:00:00Z',
        'status': null,
        'created_at': '2025-02-01T00:00:00Z',
      };
      final enrollment = Enrollment.fromJson(json);
      expect(enrollment.status, 'active');
    });

    test('toJson produces correct output', () {
      final enrollment = Enrollment.fromJson(completeJson);
      final json = enrollment.toJson();

      expect(json['id'], 'e-001');
      expect(json['student_id'], 's-001');
      expect(json['course_id'], 'c-001');
      expect(json['status'], 'active');
      expect(json['progress_percentage'], 45.0);
      expect(json.containsKey('last_accessed_at'), true);
    });
  });
}
