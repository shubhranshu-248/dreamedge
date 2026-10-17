import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  final SharedPreferences _prefs;

  StorageService(this._prefs);

  bool get onboardingSeen => _prefs.getBool('onboarding_seen') ?? false;

  Future<void> setOnboardingSeen() async {
    await _prefs.setBool('onboarding_seen', true);
  }

  String? getString(String key) => _prefs.getString(key);

  Future<void> setString(String key, String value) async {
    await _prefs.setString(key, value);
  }

  Future<void> remove(String key) async {
    await _prefs.remove(key);
  }

  Future<void> clear() async {
    await _prefs.clear();
  }
}
