import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/models/content.dart';
import 'package:mobile/features/lessons/widgets/lesson_tile.dart';

void main() {
  group('LessonTile', () {
    Content makeContent({
      bool isFree = false,
      String title = 'Introduction to Algebra',
      int durationMinutes = 45,
    }) {
      return Content.fromJson({
        'id': 'ct-001',
        'topic_id': 't-001',
        'title': title,
        'duration_minutes': durationMinutes,
        'sort_order': 1,
        'is_free': isFree,
        'content_type': 'video',
        'created_at': '2025-01-01T00:00:00Z',
        'updated_at': '2025-01-01T00:00:00Z',
      });
    }

    testWidgets('renders lesson number in CircleAvatar', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LessonTile(
              content: makeContent(),
              index: 2,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.text('3'), findsOneWidget);
      expect(find.byType(CircleAvatar), findsOneWidget);
    });

    testWidgets('renders lesson title', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LessonTile(
              content: makeContent(title: 'Quadratic Equations'),
              index: 0,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.text('Quadratic Equations'), findsOneWidget);
    });

    testWidgets('renders duration text', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LessonTile(
              content: makeContent(durationMinutes: 30),
              index: 0,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.text('30 min'), findsOneWidget);
    });

    testWidgets('shows FREE badge when isFree is true', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LessonTile(
              content: makeContent(isFree: true),
              index: 0,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.text('FREE'), findsOneWidget);
    });

    testWidgets('does not show FREE badge when isFree is false', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LessonTile(
              content: makeContent(isFree: false),
              index: 0,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.text('FREE'), findsNothing);
    });

    testWidgets('shows play icon for free lessons', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LessonTile(
              content: makeContent(isFree: true),
              index: 0,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.play_circle_fill_rounded), findsOneWidget);
    });

    testWidgets('shows lock icon for paid lessons', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LessonTile(
              content: makeContent(isFree: false),
              index: 0,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.lock_outline_rounded), findsOneWidget);
    });

    testWidgets('onTap callback fires', (tester) async {
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LessonTile(
              content: makeContent(),
              index: 0,
              onTap: () => tapped = true,
            ),
          ),
        ),
      );

      await tester.tap(find.byType(InkWell));
      expect(tapped, true);
    });
  });
}
