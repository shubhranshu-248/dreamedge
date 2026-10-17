import 'course.dart';

class Enrollment {
  final String id;
  final String studentId;
  final String courseId;
  final DateTime enrolledAt;
  final String status;
  final double progressPercentage;
  final DateTime? lastAccessedAt;
  final DateTime createdAt;
  final Course? course;

  Enrollment({
    required this.id,
    required this.studentId,
    required this.courseId,
    required this.enrolledAt,
    required this.status,
    this.progressPercentage = 0,
    this.lastAccessedAt,
    required this.createdAt,
    this.course,
  });

  bool get isActive => status == 'active';
  bool get isCompleted => status == 'completed';
  bool get isExpired => status == 'expired';

  String get formattedProgress =>
      '${progressPercentage.round()}%';

  factory Enrollment.fromJson(Map<String, dynamic> json) {
    Course? course;
    if (json['courses'] is Map<String, dynamic>) {
      course = Course.fromJson(json['courses'] as Map<String, dynamic>);
    }

    return Enrollment(
      id: json['id'] as String,
      studentId: json['student_id'] as String,
      courseId: json['course_id'] as String,
      enrolledAt: DateTime.parse(json['enrolled_at'] as String),
      status: json['status'] as String? ?? 'active',
      progressPercentage:
          (json['progress_percentage'] as num?)?.toDouble() ?? 0,
      lastAccessedAt: json['last_accessed_at'] != null
          ? DateTime.parse(json['last_accessed_at'] as String)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      course: course,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'student_id': studentId,
      'course_id': courseId,
      'enrolled_at': enrolledAt.toIso8601String(),
      'status': status,
      'progress_percentage': progressPercentage,
      'last_accessed_at': lastAccessedAt?.toIso8601String(),
    };
  }
}
