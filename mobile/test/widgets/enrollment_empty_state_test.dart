import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/learning/widgets/enrollment_empty_state.dart';

void main() {
  group('EnrollmentEmptyState', () {
    testWidgets('renders "No courses yet" text', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EnrollmentEmptyState(
              onBrowseCourses: () {},
            ),
          ),
        ),
      );

      expect(find.text('No courses yet'), findsOneWidget);
    });

    testWidgets('renders encouragement subtitle', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EnrollmentEmptyState(
              onBrowseCourses: () {},
            ),
          ),
        ),
      );

      expect(
        find.text('Start learning by enrolling in a course that interests you.'),
        findsOneWidget,
      );
    });

    testWidgets('renders Browse Courses button', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EnrollmentEmptyState(
              onBrowseCourses: () {},
            ),
          ),
        ),
      );

      expect(find.text('Browse Courses'), findsOneWidget);
      expect(find.byType(ElevatedButton), findsOneWidget);
    });

    testWidgets('onBrowseCourses callback fires on button tap', (tester) async {
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EnrollmentEmptyState(
              onBrowseCourses: () => tapped = true,
            ),
          ),
        ),
      );

      await tester.tap(find.text('Browse Courses'));
      expect(tapped, true);
    });

    testWidgets('renders school icon', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EnrollmentEmptyState(
              onBrowseCourses: () {},
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.school_outlined), findsOneWidget);
    });
  });
}
