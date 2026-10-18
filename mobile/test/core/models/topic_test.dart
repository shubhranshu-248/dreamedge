import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/models/topic.dart';

void main() {
  group('Topic', () {
    final completeJson = {
      'id': 't-001',
      'subject_id': 'sub-001',
      'name': 'Linear Equations',
      'description': 'Solving linear equations in one variable',
      'content_count': 5,
      'sort_order': 1,
      'created_at': '2025-01-01T00:00:00Z',
    };

    test('fromJson parses complete data correctly', () {
      final topic = Topic.fromJson(completeJson);

      expect(topic.id, 't-001');
      expect(topic.subjectId, 'sub-001');
      expect(topic.name, 'Linear Equations');
      expect(topic.description, 'Solving linear equations in one variable');
      expect(topic.contentCount, 5);
      expect(topic.sortOrder, 1);
    });

    test('fromJson handles null description', () {
      final json = {
        'id': 't-002',
        'subject_id': 'sub-001',
        'name': 'Quadratic Equations',
        'created_at': '2025-01-01T00:00:00Z',
      };
      final topic = Topic.fromJson(json);
      expect(topic.description, isNull);
    });

    test('contentCount defaults to 0', () {
      final json = {
        'id': 't-003',
        'subject_id': 'sub-001',
        'name': 'Polynomials',
        'created_at': '2025-01-01T00:00:00Z',
      };
      final topic = Topic.fromJson(json);
      expect(topic.contentCount, 0);
    });

    test('sortOrder defaults to 0', () {
      final json = {
        'id': 't-004',
        'subject_id': 'sub-001',
        'name': 'Factoring',
        'created_at': '2025-01-01T00:00:00Z',
      };
      final topic = Topic.fromJson(json);
      expect(topic.sortOrder, 0);
    });

    test('toJson produces correct output', () {
      final topic = Topic.fromJson(completeJson);
      final json = topic.toJson();

      expect(json['id'], 't-001');
      expect(json['subject_id'], 'sub-001');
      expect(json['name'], 'Linear Equations');
      expect(json['description'], 'Solving linear equations in one variable');
      expect(json['content_count'], 5);
      expect(json['sort_order'], 1);
    });
  });
}
