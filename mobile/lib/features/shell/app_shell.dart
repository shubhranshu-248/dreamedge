import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../shared/theme/colors.dart';
import '../courses/courses_screen.dart';
import '../home/home_screen.dart';
import '../learning/my_learning_screen.dart';
import '../notifications/widgets/notification_bell.dart';
import '../profile/profile_screen.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _currentIndex = 0;

  static const _titles = ['Dream Edge', 'Courses', 'My Learning', 'Profile'];

  final _screens = const [
    HomeScreen(),
    CoursesScreen(),
    MyLearningScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          _titles[_currentIndex],
          style: GoogleFonts.playfairDisplay(
            fontWeight: FontWeight.w700,
            fontSize: 20,
            color: AppColors.textPrimary,
          ),
        ),
        backgroundColor: AppColors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        actions: const [
          NotificationBell(),
          SizedBox(width: 4),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.menu_book_rounded),
            label: 'Courses',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.school_rounded),
            label: 'My Learning',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
