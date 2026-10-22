import 'package:flutter/material.dart';

enum LogoSize { small, medium, large }

class AppLogo extends StatelessWidget {
  final LogoSize size;

  const AppLogo({super.key, this.size = LogoSize.medium});

  double get _height {
    switch (size) {
      case LogoSize.small:
        return 40;
      case LogoSize.medium:
        return 64;
      case LogoSize.large:
        return 96;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/images/logo.jpg',
      height: _height,
      fit: BoxFit.contain,
    );
  }
}
