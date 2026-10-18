import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/models/student.dart';

void main() {
  group('Student', () {
    final completeJson = {
      'id': 's-001',
      'user_id': 'u-001',
      'full_name': 'Rahul Sharma',
      'email': 'rahul@example.com',
      'phone': '9876543210',
      'avatar_url': 'https://example.com/avatar.jpg',
      'class': '10',
      'school_name': 'Kendriya Vidyalaya Nagpur',
      'city': 'Nagpur',
      'state': 'Maharashtra',
      'referral_code': 'RAHUL10',
      'referred_by': 'r-002',
      'is_active': true,
      'free_trial_expires_at': '2025-06-01T00:00:00Z',
      'created_at': '2025-01-01T00:00:00Z',
      'updated_at': '2025-01-15T00:00:00Z',
    };

    test('fromJson parses complete data correctly', () {
      final student = Student.fromJson(completeJson);

      expect(student.id, 's-001');
      expect(student.userId, 'u-001');
      expect(student.fullName, 'Rahul Sharma');
      expect(student.email, 'rahul@example.com');
      expect(student.phone, '9876543210');
      expect(student.avatarUrl, 'https://example.com/avatar.jpg');
      expect(student.studentClass, '10');
      expect(student.schoolName, 'Kendriya Vidyalaya Nagpur');
      expect(student.city, 'Nagpur');
      expect(student.state, 'Maharashtra');
      expect(student.referralCode, 'RAHUL10');
      expect(student.referredBy, 'r-002');
      expect(student.isActive, true);
      expect(student.freeTrialExpiresAt, isNotNull);
    });

    test('fromJson handles null optional fields', () {
      final json = {
        'id': 's-002',
        'user_id': 'u-002',
        'full_name': 'Priya Patel',
        'email': 'priya@example.com',
        'created_at': '2025-01-01T00:00:00Z',
        'updated_at': '2025-01-01T00:00:00Z',
      };
      final student = Student.fromJson(json);

      expect(student.phone, isNull);
      expect(student.avatarUrl, isNull);
      expect(student.studentClass, isNull);
      expect(student.schoolName, isNull);
      expect(student.city, isNull);
      expect(student.state, isNull);
      expect(student.referralCode, isNull);
      expect(student.referredBy, isNull);
      expect(student.freeTrialExpiresAt, isNull);
    });

    test('isActive defaults to true when not in JSON', () {
      final json = {
        'id': 's-003',
        'user_id': 'u-003',
        'full_name': 'Test',
        'email': 'test@example.com',
        'created_at': '2025-01-01T00:00:00Z',
        'updated_at': '2025-01-01T00:00:00Z',
      };
      final student = Student.fromJson(json);
      expect(student.isActive, true);
    });

    group('copyWith', () {
      late Student original;

      setUp(() {
        original = Student.fromJson(completeJson);
      });

      test('creates new instance with changed fields', () {
        final updated = original.copyWith(
          fullName: 'Rahul Kumar',
          city: 'Mumbai',
        );

        expect(updated.fullName, 'Rahul Kumar');
        expect(updated.city, 'Mumbai');
      });

      test('preserves unchanged fields', () {
        final updated = original.copyWith(fullName: 'Rahul Kumar');

        expect(updated.id, original.id);
        expect(updated.userId, original.userId);
        expect(updated.email, original.email);
        expect(updated.phone, original.phone);
        expect(updated.avatarUrl, original.avatarUrl);
        expect(updated.studentClass, original.studentClass);
        expect(updated.schoolName, original.schoolName);
        expect(updated.state, original.state);
        expect(updated.referralCode, original.referralCode);
        expect(updated.isActive, original.isActive);
      });
    });

    test('toJson includes all non-null fields', () {
      final student = Student.fromJson(completeJson);
      final json = student.toJson();

      expect(json['id'], 's-001');
      expect(json['user_id'], 'u-001');
      expect(json['full_name'], 'Rahul Sharma');
      expect(json['email'], 'rahul@example.com');
      expect(json['phone'], '9876543210');
      expect(json['avatar_url'], 'https://example.com/avatar.jpg');
      expect(json['class'], '10');
      expect(json['school_name'], 'Kendriya Vidyalaya Nagpur');
      expect(json['is_active'], true);
    });

    test('toJson omits null optional fields as null values', () {
      final json = {
        'id': 's-004',
        'user_id': 'u-004',
        'full_name': 'Minimal Student',
        'email': 'min@example.com',
        'created_at': '2025-01-01T00:00:00Z',
        'updated_at': '2025-01-01T00:00:00Z',
      };
      final student = Student.fromJson(json);
      final output = student.toJson();

      expect(output['phone'], isNull);
      expect(output['avatar_url'], isNull);
      expect(output['free_trial_expires_at'], isNull);
    });
  });
}
