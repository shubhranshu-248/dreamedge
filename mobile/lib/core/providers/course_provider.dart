import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/course.dart';
import '../models/course_category.dart';
import '../models/subject.dart';
import '../models/topic.dart';
import '../services/course_service.dart';
import 'supabase_provider.dart';

final courseServiceProvider = Provider<CourseService>((ref) {
  final client = ref.watch(supabaseClientProvider);
  return CourseService(client);
});

final categoriesProvider = FutureProvider<List<CourseCategory>>((ref) {
  return ref.watch(courseServiceProvider).getCategories();
});

final featuredCoursesProvider = FutureProvider<List<Course>>((ref) {
  return ref.watch(courseServiceProvider).getFeaturedCourses();
});

final allCoursesProvider = FutureProvider<List<Course>>((ref) {
  return ref.watch(courseServiceProvider).getCourses();
});

final coursesProvider =
    FutureProvider.family<List<Course>, CourseFilter>((ref, filter) {
  return ref.watch(courseServiceProvider).getCourses(
        categoryId: filter.categoryId,
        targetClass: filter.targetClass,
        searchQuery: filter.searchQuery,
      );
});

final courseDetailProvider =
    FutureProvider.family<Course, String>((ref, id) {
  return ref.watch(courseServiceProvider).getCourseById(id);
});

final subjectsProvider =
    FutureProvider.family<List<Subject>, String>((ref, courseId) {
  return ref.watch(courseServiceProvider).getSubjects(courseId);
});

final topicsProvider =
    FutureProvider.family<List<Topic>, String>((ref, subjectId) {
  return ref.watch(courseServiceProvider).getTopics(subjectId);
});

class CourseFilter {
  final String? categoryId;
  final String? targetClass;
  final String? searchQuery;

  const CourseFilter({this.categoryId, this.targetClass, this.searchQuery});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CourseFilter &&
          categoryId == other.categoryId &&
          targetClass == other.targetClass &&
          searchQuery == other.searchQuery;

  @override
  int get hashCode => Object.hash(categoryId, targetClass, searchQuery);
}
