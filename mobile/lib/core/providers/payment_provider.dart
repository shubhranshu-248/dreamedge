import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/order.dart';
import '../services/payment_service.dart';

final paymentServiceProvider = Provider<PaymentService>((ref) {
  return PaymentService();
});

final orderHistoryProvider = FutureProvider<List<CourseOrder>>((ref) async {
  final service = ref.read(paymentServiceProvider);
  final data = await service.getOrderHistory();
  return data.map((json) => CourseOrder.fromJson(json)).toList();
});

final isEnrolledProvider =
    FutureProvider.family<bool, String>((ref, courseId) async {
  final service = ref.read(paymentServiceProvider);
  return service.isEnrolled(courseId);
});
