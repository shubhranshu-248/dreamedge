class PaymentConfig {
  static const String razorpayKeyId = String.fromEnvironment('RAZORPAY_KEY_ID');

  static const String currency = 'INR';
  static const String merchantName = 'Dream Edge Online';

  static const int themeColor = 0xFFF26A21;

  static void assertConfigured() {
    assert(
      razorpayKeyId.isNotEmpty,
      'RAZORPAY_KEY_ID must be set via --dart-define=RAZORPAY_KEY_ID=...',
    );
  }
}
