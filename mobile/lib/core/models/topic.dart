class Topic {
  final String id;
  final String subjectId;
  final String name;
  final String? description;
  final int sortOrder;
  final int contentCount;
  final DateTime createdAt;

  const Topic({
    required this.id,
    required this.subjectId,
    required this.name,
    this.description,
    required this.sortOrder,
    required this.contentCount,
    required this.createdAt,
  });

  factory Topic.fromJson(Map<String, dynamic> json) {
    return Topic(
      id: json['id'] as String,
      subjectId: json['subject_id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? 0,
      contentCount: (json['content_count'] as num?)?.toInt() ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'subject_id': subjectId,
      'name': name,
      'description': description,
      'sort_order': sortOrder,
      'content_count': contentCount,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
