import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/models/course.dart';

void main() {
  group('Course', () {
    final completeJson = {
      'id': 'c-001',
      'category_id': 'cat-math',
      'title': 'Mathematics Class 10',
      'subtitle': 'Complete CBSE Syllabus',
      'description': 'Master mathematics with detailed explanations.',
      'thumbnail_url': 'https://example.com/math.jpg',
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

    test('fromJson parses complete data correctly', () {
      final course = Course.fromJson(completeJson);

      expect(course.id, 'c-001');
      expect(course.categoryId, 'cat-math');
      expect(course.title, 'Mathematics Class 10');
      expect(course.subtitle, 'Complete CBSE Syllabus');
      expect(course.description, 'Master mathematics with detailed explanations.');
      expect(course.thumbnailUrl, 'https://example.com/math.jpg');
      expect(course.targetClass, '10');
      expect(course.price, 999);
      expect(course.discountPrice, 799);
      expect(course.status, 'published');
      expect(course.isFeatured, true);
      expect(course.enrollmentCount, 150);
      expect(course.totalLessons, 45);
      expect(course.durationMinutes, 750);
    });

    test('fromJson handles null optional fields', () {
      final json = {
        'id': 'c-002',
        'category_id': 'cat-sci',
        'title': 'Science Class 9',
        'target_class': '9',
        'price': 599,
        'status': 'draft',
        'created_at': '2025-01-01T00:00:00Z',
        'updated_at': '2025-01-01T00:00:00Z',
      };
      final course = Course.fromJson(json);

      expect(course.subtitle, isNull);
      expect(course.description, isNull);
      expect(course.thumbnailUrl, isNull);
      expect(course.discountPrice, isNull);
    });

    test('fromJson uses "name" as fallback for title', () {
      final json = {
        'id': 'c-003',
        'name': 'Fallback Title',
        'created_at': '2025-01-01T00:00:00Z',
        'updated_at': '2025-01-01T00:00:00Z',
      };
      final course = Course.fromJson(json);
      expect(course.title, 'Fallback Title');
    });

    test('fromJson uses "thumbnail" as fallback for thumbnail_url', () {
      final json = {
        'id': 'c-004',
        'title': 'Test',
        'thumbnail': 'https://example.com/fallback.jpg',
        'created_at': '2025-01-01T00:00:00Z',
        'updated_at': '2025-01-01T00:00:00Z',
      };
      final course = Course.fromJson(json);
      expect(course.thumbnailUrl, 'https://example.com/fallback.jpg');
    });

    group('default values', () {
      final minimalJson = {
        'id': 'c-005',
        'created_at': '2025-01-01T00:00:00Z',
        'updated_at': '2025-01-01T00:00:00Z',
      };

      test('enrollmentCount defaults to 0', () {
        expect(Course.fromJson(minimalJson).enrollmentCount, 0);
      });

      test('isFeatured defaults to false', () {
        expect(Course.fromJson(minimalJson).isFeatured, false);
      });

      test('price defaults to 0', () {
        expect(Course.fromJson(minimalJson).price, 0);
      });

      test('status defaults to draft', () {
        expect(Course.fromJson(minimalJson).status, 'draft');
      });
    });

    group('computed properties', () {
      test('formattedPrice returns ₹999 format', () {
        final course = Course.fromJson(completeJson);
        expect(course.formattedPrice, '₹999');
      });

      test('formattedDiscountPrice returns ₹799 format', () {
        final course = Course.fromJson(completeJson);
        expect(course.formattedDiscountPrice, '₹799');
      });

      test('formattedDiscountPrice returns empty when no discount', () {
        final json = {...completeJson, 'discount_price': null};
        final course = Course.fromJson(json);
        expect(course.formattedDiscountPrice, '');
      });

      test('hasDiscount returns true when discountPrice is less than price', () {
        final course = Course.fromJson(completeJson);
        expect(course.hasDiscount, true);
      });

      test('hasDiscount returns false when discountPrice is null', () {
        final json = {...completeJson, 'discount_price': null};
        final course = Course.fromJson(json);
        expect(course.hasDiscount, false);
      });

      test('formattedDuration returns hours and minutes', () {
        final course = Course.fromJson(completeJson);
        expect(course.formattedDuration, '12h 30m');
      });

      test('formattedDuration returns hours only when no remainder', () {
        final json = {...completeJson, 'duration_minutes': 120};
        final course = Course.fromJson(json);
        expect(course.formattedDuration, '2h');
      });

      test('formattedDuration returns minutes only when under an hour', () {
        final json = {...completeJson, 'duration_minutes': 45};
        final course = Course.fromJson(json);
        expect(course.formattedDuration, '45m');
      });
    });

    test('toJson round-trip preserves data', () {
      final original = Course.fromJson(completeJson);
      final roundTripped = Course.fromJson(original.toJson());

      expect(roundTripped.id, original.id);
      expect(roundTripped.title, original.title);
      expect(roundTripped.price, original.price);
      expect(roundTripped.discountPrice, original.discountPrice);
      expect(roundTripped.isFeatured, original.isFeatured);
      expect(roundTripped.enrollmentCount, original.enrollmentCount);
    });
  });
}
