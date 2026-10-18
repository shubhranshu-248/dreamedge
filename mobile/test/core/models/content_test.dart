import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/models/content.dart';

void main() {
  group('Content', () {
    final completeJson = {
      'id': 'ct-001',
      'topic_id': 't-001',
      'title': 'Introduction to Algebra',
      'description': 'Learn the basics of algebraic expressions.',
      'video_url': 'https://example.com/video.mp4',
      'thumbnail_url': 'https://example.com/thumb.jpg',
      'duration_minutes': 45,
      'sort_order': 1,
      'is_free': true,
      'content_type': 'video',
      'created_at': '2025-01-01T00:00:00Z',
      'updated_at': '2025-01-15T00:00:00Z',
    };

    test('fromJson parses complete data correctly', () {
      final content = Content.fromJson(completeJson);

      expect(content.id, 'ct-001');
      expect(content.topicId, 't-001');
      expect(content.title, 'Introduction to Algebra');
      expect(content.description, 'Learn the basics of algebraic expressions.');
      expect(content.videoUrl, 'https://example.com/video.mp4');
      expect(content.thumbnailUrl, 'https://example.com/thumb.jpg');
      expect(content.durationMinutes, 45);
      expect(content.sortOrder, 1);
      expect(content.isFree, true);
      expect(content.contentType, 'video');
    });

    test('fromJson handles null optional fields', () {
      final json = {
        'id': 'ct-002',
        'topic_id': 't-001',
        'title': 'Equations Practice',
        'content_type': 'pdf',
        'created_at': '2025-01-01T00:00:00Z',
        'updated_at': '2025-01-01T00:00:00Z',
      };
      final content = Content.fromJson(json);

      expect(content.description, isNull);
      expect(content.videoUrl, isNull);
      expect(content.thumbnailUrl, isNull);
    });

    group('computed properties', () {
      test('isVideo returns true when contentType is video', () {
        final content = Content.fromJson(completeJson);
        expect(content.isVideo, true);
      });

      test('isVideo returns false for non-video types', () {
        final json = {...completeJson, 'content_type': 'pdf'};
        final content = Content.fromJson(json);
        expect(content.isVideo, false);
      });

      test('hasVideo returns true when videoUrl is not null or empty', () {
        final content = Content.fromJson(completeJson);
        expect(content.hasVideo, true);
      });

      test('hasVideo returns false when videoUrl is null', () {
        final json = {...completeJson, 'video_url': null};
        final content = Content.fromJson(json);
        expect(content.hasVideo, false);
      });

      test('hasVideo returns false when videoUrl is empty', () {
        final json = {...completeJson, 'video_url': ''};
        final content = Content.fromJson(json);
        expect(content.hasVideo, false);
      });

      test('formattedDuration returns minutes for under 60', () {
        final content = Content.fromJson(completeJson);
        expect(content.formattedDuration, '45 min');
      });

      test('formattedDuration returns "< 1 min" for 0 minutes', () {
        final json = {...completeJson, 'duration_minutes': 0};
        final content = Content.fromJson(json);
        expect(content.formattedDuration, '< 1 min');
      });

      test('formattedDuration returns hours and minutes for 90 min', () {
        final json = {...completeJson, 'duration_minutes': 90};
        final content = Content.fromJson(json);
        expect(content.formattedDuration, '1 hr 30 min');
      });

      test('formattedDuration returns hours only when even', () {
        final json = {...completeJson, 'duration_minutes': 120};
        final content = Content.fromJson(json);
        expect(content.formattedDuration, '2 hr');
      });
    });

    test('sortOrder defaults to 0', () {
      final json = {
        'id': 'ct-003',
        'topic_id': 't-001',
        'title': 'Test',
        'created_at': '2025-01-01T00:00:00Z',
        'updated_at': '2025-01-01T00:00:00Z',
      };
      final content = Content.fromJson(json);
      expect(content.sortOrder, 0);
    });

    test('isFree defaults to false', () {
      final json = {
        'id': 'ct-004',
        'topic_id': 't-001',
        'title': 'Test',
        'created_at': '2025-01-01T00:00:00Z',
        'updated_at': '2025-01-01T00:00:00Z',
      };
      final content = Content.fromJson(json);
      expect(content.isFree, false);
    });

    test('toJson produces correct output', () {
      final original = Content.fromJson(completeJson);
      final json = original.toJson();

      expect(json['id'], 'ct-001');
      expect(json['topic_id'], 't-001');
      expect(json['title'], 'Introduction to Algebra');
      expect(json['is_free'], true);
      expect(json['content_type'], 'video');
      expect(json['duration_minutes'], 45);
    });
  });
}
