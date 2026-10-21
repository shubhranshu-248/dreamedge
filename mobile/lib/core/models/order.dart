import 'package:intl/intl.dart';

class CourseOrder {
  final String id;
  final String userId;
  final String courseId;
  final double amount;
  final String currency;
  final String status;
  final String? razorpayOrderId;
  final String? razorpayPaymentId;
  final String? razorpaySignature;
  final String? paymentMethod;
  final String? receipt;
  final Map<String, dynamic> notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  const CourseOrder({
    required this.id,
    required this.userId,
    required this.courseId,
    required this.amount,
    required this.currency,
    required this.status,
    this.razorpayOrderId,
    this.razorpayPaymentId,
    this.razorpaySignature,
    this.paymentMethod,
    this.receipt,
    this.notes = const {},
    required this.createdAt,
    required this.updatedAt,
  });

  factory CourseOrder.fromJson(Map<String, dynamic> json) {
    return CourseOrder(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      courseId: json['course_id'] as String,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'INR',
      status: json['status'] as String? ?? 'pending',
      razorpayOrderId: json['razorpay_order_id'] as String?,
      razorpayPaymentId: json['razorpay_payment_id'] as String?,
      razorpaySignature: json['razorpay_signature'] as String?,
      paymentMethod: json['payment_method'] as String?,
      receipt: json['receipt'] as String?,
      notes: json['notes'] as Map<String, dynamic>? ?? {},
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'course_id': courseId,
      'amount': amount,
      'currency': currency,
      'status': status,
      'razorpay_order_id': razorpayOrderId,
      'razorpay_payment_id': razorpayPaymentId,
      'razorpay_signature': razorpaySignature,
      'payment_method': paymentMethod,
      'receipt': receipt,
      'notes': notes,
    };
  }

  bool get isPending => status == 'pending';
  bool get isCompleted => status == 'completed';
  bool get isFailed => status == 'failed';
  bool get isRefunded => status == 'refunded';

  String get formattedAmount {
    final formatter =
        NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
    return formatter.format(amount);
  }

  String get formattedDate {
    return DateFormat('dd MMM yyyy, hh:mm a').format(createdAt.toLocal());
  }

  String get statusLabel {
    switch (status) {
      case 'completed':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  }
}
