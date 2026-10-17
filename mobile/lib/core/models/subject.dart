class Subject {
  final String id;
  final String courseId;
  final String name;
  final String? description;
  final String? iconUrl;
  final int sortOrder;
  final int topicCount;
  final DateTime createdAt;

  const Subject({
    required this.id,
    required this.courseId,
    required this.name,
    this.description,
    this.iconUrl,
    required this.sortOrder,
    required this.topicCount,
    required this.createdAt,
  });

  factory Subject.fromJson(Map<String, dynamic> json) {
    return Subject(
      id: json['id'] as String,
      courseId: json['course_id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      iconUrl: json['icon_url'] as String?,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? 0,
      topicCount: (json['topic_count'] as num?)?.toInt() ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'course_id': courseId,
      'name': name,
      'description': description,
      'icon_url': iconUrl,
      'sort_order': sortOrder,
      'topic_count': topicCount,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
