class Content {
  final String id;
  final String topicId;
  final String title;
  final String? description;
  final String? videoUrl;
  final String? thumbnailUrl;
  final int durationMinutes;
  final int sortOrder;
  final bool isFree;
  final String contentType;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Content({
    required this.id,
    required this.topicId,
    required this.title,
    this.description,
    this.videoUrl,
    this.thumbnailUrl,
    required this.durationMinutes,
    required this.sortOrder,
    required this.isFree,
    required this.contentType,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isVideo => contentType == 'video';

  bool get hasVideo => videoUrl != null && videoUrl!.isNotEmpty;

  String get formattedDuration {
    if (durationMinutes < 1) return '< 1 min';
    if (durationMinutes < 60) return '$durationMinutes min';
    final hours = durationMinutes ~/ 60;
    final mins = durationMinutes % 60;
    if (mins == 0) return '$hours hr';
    return '$hours hr $mins min';
  }

  factory Content.fromJson(Map<String, dynamic> json) {
    return Content(
      id: json['id'] as String,
      topicId: json['topic_id'] as String,
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      videoUrl: json['video_url'] as String?,
      thumbnailUrl: json['thumbnail_url'] as String?,
      durationMinutes: (json['duration_minutes'] as num?)?.toInt() ?? 0,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? 0,
      isFree: json['is_free'] as bool? ?? false,
      contentType: json['content_type'] as String? ?? 'video',
      createdAt: DateTime.parse(
          json['created_at'] as String? ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(
          json['updated_at'] as String? ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'topic_id': topicId,
      'title': title,
      'description': description,
      'video_url': videoUrl,
      'thumbnail_url': thumbnailUrl,
      'duration_minutes': durationMinutes,
      'sort_order': sortOrder,
      'is_free': isFree,
      'content_type': contentType,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
