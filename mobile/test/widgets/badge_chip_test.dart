import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/shared/widgets/badge_chip.dart';

void main() {
  group('BadgeChip', () {
    testWidgets('renders label text', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: BadgeChip(
              label: 'FREE',
              color: Colors.green,
            ),
          ),
        ),
      );

      expect(find.text('FREE'), findsOneWidget);
    });

    testWidgets('renders with provided color in background', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: BadgeChip(
              label: 'NEW',
              color: Colors.blue,
            ),
          ),
        ),
      );

      expect(find.text('NEW'), findsOneWidget);
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, isNotNull);
    });

    testWidgets('renders with optional icon', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: BadgeChip(
              label: 'LIVE',
              color: Colors.red,
              icon: Icons.circle,
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.circle), findsOneWidget);
      expect(find.text('LIVE'), findsOneWidget);
    });

    testWidgets('does not render icon when not provided', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: BadgeChip(
              label: 'POPULAR',
              color: Colors.orange,
            ),
          ),
        ),
      );

      expect(find.byType(Icon), findsNothing);
    });

    testWidgets('uses custom textColor when provided', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: BadgeChip(
              label: 'PREMIUM',
              color: Colors.purple,
              textColor: Colors.yellow,
            ),
          ),
        ),
      );

      final text = tester.widget<Text>(find.text('PREMIUM'));
      expect(text.style?.color, Colors.yellow);
    });

    testWidgets('uses color as textColor when textColor is null', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: BadgeChip(
              label: 'SALE',
              color: Colors.red,
            ),
          ),
        ),
      );

      final text = tester.widget<Text>(find.text('SALE'));
      expect(text.style?.color, Colors.red);
    });
  });
}
