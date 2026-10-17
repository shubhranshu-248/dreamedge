import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../theme/colors.dart';

enum LogoSize { small, medium, large }

class AppLogo extends StatelessWidget {
  final LogoSize size;

  const AppLogo({super.key, this.size = LogoSize.medium});

  double get _fontSize {
    switch (size) {
      case LogoSize.small:
        return 24;
      case LogoSize.medium:
        return 32;
      case LogoSize.large:
        return 44;
    }
  }

  @override
  Widget build(BuildContext context) {
    return RichText(
      text: TextSpan(
        style: GoogleFonts.playfairDisplay(
          fontSize: _fontSize,
          fontWeight: FontWeight.w700,
        ),
        children: const [
          TextSpan(
            text: 'Dream',
            style: TextStyle(color: AppColors.black),
          ),
          TextSpan(
            text: 'Edge',
            style: TextStyle(color: AppColors.orange),
          ),
        ],
      ),
    );
  }
}
