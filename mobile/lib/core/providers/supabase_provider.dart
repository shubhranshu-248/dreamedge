import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final supabaseClientProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

final authStateProvider = StreamProvider<AuthState>((ref) {
  return ref.watch(supabaseClientProvider).auth.onAuthStateChange;
});

final currentSessionProvider = Provider<Session?>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.whenData((state) => state.session).valueOrNull;
});

final currentUserProvider = Provider<User?>((ref) {
  final session = ref.watch(currentSessionProvider);
  if (session == null) return null;
  return ref.watch(supabaseClientProvider).auth.currentUser;
});
