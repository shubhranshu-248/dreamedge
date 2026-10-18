import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/models/subject.dart';

void main() {
  group('Subject', () {
    final completeJson = {
      'id': 'sub-001',
      'course_id': 'c-001',
      'name': 'Algebra',
      'description': 'Linear equations, quadratics, and polynomials',
      'icon_url': 'https://example.com/algebra.svg',
      'topic_count': 8,
      'sort_order': 1,
      'created_at': '2025-01-01T00:00:00Z',
    };

    test('fromJson parses complete data correctly', () {
      final subject = Subject.fromJson(completeJson);

      expect(subject.id, 'sub-001');
      expect(subject.courseId, 'c-001');
      expect(subject.name, 'Algebra');
      expect(subject.description, 'Linear equations, quadratics, and polynomials');
      expect(subject.iconUrl, 'https://example.com/algebra.svg');
      expect(subject.topicCount, 8);
      expect(subject.sortOrder, 1);
    });

    test('fromJson handles null optional fields', () {
      final json = {
        'id': 'sub-002',
        'course_id': 'c-001',
        'name': 'Geometry',
        'created_at': '2025-01-01T00:00:00Z',
      };
      final subject = Subject.fromJson(json);

      expect(subject.description, isNull);
      expect(subject.iconUrl, isNull);
    });

    test('topicCount defaults to 0', () {
      final json = {
        'id': 'sub-003',
        'course_id': 'c-001',
        'name': 'Trigonometry',
        'created_at': '2025-01-01T00:00:00Z',
      };
      final subject = Subject.fromJson(json);
      expect(subject.topicCount, 0);
    });

    test('sortOrder defaults to 0', () {
      final json = {
        'id': 'sub-004',
        'course_id': 'c-001',
        'name': 'Statistics',
        'created_at': '2025-01-01T00:00:00Z',
      };
      final subject = Subject.fromJson(json);
      expect(subject.sortOrder, 0);
    });

    test('toJson produces correct output', () {
      final subject = Subject.fromJson(completeJson);
      final json = subject.toJson();

      expect(json['id'], 'sub-001');
      expect(json['course_id'], 'c-001');
      expect(json['name'], 'Algebra');
      expect(json['description'], 'Linear equations, quadratics, and polynomials');
      expect(json['icon_url'], 'https://example.com/algebra.svg');
      expect(json['topic_count'], 8);
      expect(json['sort_order'], 1);
    });
  });
}
