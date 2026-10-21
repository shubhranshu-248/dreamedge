import 'package:supabase_flutter/supabase_flutter.dart';

class PaymentService {
  final SupabaseClient _supabase = Supabase.instance.client;

  String get _userId => _supabase.auth.currentUser!.id;

  String? get userEmail => _supabase.auth.currentUser?.email;

  Future<Map<String, dynamic>> createOrder({
    required String courseId,
    required double amount,
    String currency = 'INR',
  }) async {
    final receipt = 'rcpt_${DateTime.now().millisecondsSinceEpoch}';

    final response = await _supabase.from('orders').insert({
      'user_id': _userId,
      'course_id': courseId,
      'amount': amount,
      'currency': currency,
      'status': 'pending',
      'receipt': receipt,
    }).select().single();

    return response;
  }

  Future<void> completeOrder({
    required String orderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
    String? razorpayOrderId,
  }) async {
    await _supabase.from('orders').update({
      'status': 'completed',
      'razorpay_payment_id': razorpayPaymentId,
      'razorpay_signature': razorpaySignature,
      'razorpay_order_id': razorpayOrderId,
      'updated_at': DateTime.now().toIso8601String(),
    }).eq('id', orderId);
  }

  Future<void> failOrder(String orderId) async {
    await _supabase.from('orders').update({
      'status': 'failed',
      'updated_at': DateTime.now().toIso8601String(),
    }).eq('id', orderId);
  }

  Future<void> enrollUser({
    required String courseId,
    required String orderId,
  }) async {
    await _supabase.from('enrollments').upsert({
      'user_id': _userId,
      'course_id': courseId,
      'order_id': orderId,
      'status': 'active',
    }, onConflict: 'user_id,course_id');
  }

  Future<bool> isEnrolled(String courseId) async {
    final response = await _supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', _userId)
        .eq('course_id', courseId)
        .eq('status', 'active')
        .maybeSingle();

    return response != null;
  }

  Future<List<Map<String, dynamic>>> getOrderHistory() async {
    final response = await _supabase
        .from('orders')
        .select()
        .eq('user_id', _userId)
        .order('created_at', ascending: false);

    return List<Map<String, dynamic>>.from(response);
  }

  Future<Map<String, dynamic>?> getOrderById(String orderId) async {
    final response = await _supabase
        .from('orders')
        .select()
        .eq('id', orderId)
        .maybeSingle();

    return response;
  }
}
