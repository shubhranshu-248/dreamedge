class CourseCategory {
  final String id;
  final String name;
  final String? description;
  final String? iconUrl;
  final int sortOrder;
  final bool isActive;
  final DateTime createdAt;

  const CourseCategory({
    required this.id,
    required this.name,
    this.description,
    this.iconUrl,
    required this.sortOrder,
    required this.isActive,
    required this.createdAt,
  });

  factory CourseCategory.fromJson(Map<String, dynamic> json) {
    return CourseCategory(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      iconUrl: json['icon_url'] as String?,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? 0,
      isActive: json['is_active'] as bool? ?? true,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'icon_url': iconUrl,
      'sort_order': sortOrder,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
