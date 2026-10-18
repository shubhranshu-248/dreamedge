import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/auth/widgets/auth_loading_overlay.dart';

void main() {
  group('AuthLoadingOverlay', () {
    testWidgets('shows child when isLoading is false', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AuthLoadingOverlay(
              isLoading: false,
              child: Text('Content'),
            ),
          ),
        ),
      );

      expect(find.text('Content'), findsOneWidget);
      expect(find.byType(CircularProgressIndicator), findsNothing);
    });

    testWidgets('shows overlay and spinner when isLoading is true', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AuthLoadingOverlay(
              isLoading: true,
              child: Text('Content'),
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('child is still visible under overlay when loading', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AuthLoadingOverlay(
              isLoading: true,
              child: Text('Content'),
            ),
          ),
        ),
      );

      expect(find.text('Content'), findsOneWidget);
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('AbsorbPointer blocks taps when loading', (tester) async {
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AuthLoadingOverlay(
              isLoading: true,
              child: GestureDetector(
                onTap: () => tapped = true,
                child: const Text('Tap me'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Tap me'), warnIfMissed: false);
      expect(tapped, false);
    });

    testWidgets('taps reach child when not loading', (tester) async {
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AuthLoadingOverlay(
              isLoading: false,
              child: GestureDetector(
                onTap: () => tapped = true,
                child: const Text('Tap me'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Tap me'));
      expect(tapped, true);
    });
  });
}
