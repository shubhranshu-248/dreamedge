import 'package:intl/intl.dart';

class LiveClass {
  final String id;
  final String? courseId;
  final String title;
  final String? description;
  final String instructorName;
  final String? instructorAvatarUrl;
  final DateTime scheduledAt;
  final int durationMinutes;
  final String status;
  final String? meetingUrl;
  final String? thumbnailUrl;
  final String? recordingUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  const LiveClass({
    required this.id,
    this.courseId,
    required this.title,
    this.description,
    required this.instructorName,
    this.instructorAvatarUrl,
    required this.scheduledAt,
    required this.durationMinutes,
    required this.status,
    this.meetingUrl,
    this.thumbnailUrl,
    this.recordingUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isLive => status == 'live';
  bool get isScheduled => status == 'scheduled';
  bool get isCompleted => status == 'completed';
  bool get isCancelled => status == 'cancelled';

  bool get hasRecording =>
      recordingUrl != null && recordingUrl!.isNotEmpty;

  bool get canJoin => isLive && meetingUrl != null;

  String get formattedDate =>
      DateFormat('EEE, d MMM yyyy').format(scheduledAt);

  String get formattedTime =>
      DateFormat('h:mm a').format(scheduledAt);

  String get formattedDuration {
    final hours = durationMinutes ~/ 60;
    final mins = durationMinutes % 60;
    if (hours > 0 && mins > 0) return '${hours}h ${mins}m';
    if (hours > 0) return '${hours}h';
    return '${mins}m';
  }

  DateTime get endTime =>
      scheduledAt.add(Duration(minutes: durationMinutes));

  bool get isToday {
    final now = DateTime.now();
    return scheduledAt.year == now.year &&
        scheduledAt.month == now.month &&
        scheduledAt.day == now.day;
  }

  bool get isUpcoming =>
      scheduledAt.isAfter(DateTime.now()) && isScheduled;

  String get countdown {
    final diff = scheduledAt.difference(DateTime.now());
    if (diff.isNegative) return 'Started';
    if (diff.inDays > 0) return 'In ${diff.inDays}d';
    if (diff.inHours > 0) return 'In ${diff.inHours}h';
    if (diff.inMinutes > 0) return 'In ${diff.inMinutes}m';
    return 'Starting soon';
  }

  factory LiveClass.fromJson(Map<String, dynamic> json) {
    return LiveClass(
      id: json['id'] as String,
      courseId: json['course_id'] as String?,
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      instructorName: json['instructor_name'] as String? ?? '',
      instructorAvatarUrl: json['instructor_avatar_url'] as String?,
      scheduledAt: DateTime.parse(
        json['scheduled_at'] as String? ?? DateTime.now().toIso8601String(),
      ),
      durationMinutes: (json['duration_minutes'] as num?)?.toInt() ?? 60,
      status: json['status'] as String? ?? 'scheduled',
      meetingUrl: json['meeting_url'] as String?,
      thumbnailUrl: json['thumbnail_url'] as String?,
      recordingUrl: json['recording_url'] as String?,
      createdAt: DateTime.parse(
        json['created_at'] as String? ?? DateTime.now().toIso8601String(),
      ),
      updatedAt: DateTime.parse(
        json['updated_at'] as String? ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'course_id': courseId,
      'title': title,
      'description': description,
      'instructor_name': instructorName,
      'instructor_avatar_url': instructorAvatarUrl,
      'scheduled_at': scheduledAt.toIso8601String(),
      'duration_minutes': durationMinutes,
      'status': status,
      'meeting_url': meetingUrl,
      'thumbnail_url': thumbnailUrl,
      'recording_url': recordingUrl,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
