// lib/core/services/sound_service.dart

import 'package:audioplayers/audioplayers.dart';

class SoundService {
  static final SoundService _instance = SoundService._internal();
  factory SoundService() => _instance;
  SoundService._internal();

  final AudioPlayer _sfxPlayer = AudioPlayer();
  final AudioPlayer _bgMusicPlayer = AudioPlayer(); // ← NUEVO

  bool _soundEnabled = true;
  bool _musicEnabled = true; // ← NUEVO

  void toggleSound(bool enabled) => _soundEnabled = enabled;
  void toggleMusic(bool enabled) {
    // ← NUEVO
    _musicEnabled = enabled;
    if (!enabled) stopBackgroundMusic();
  }

  Future<void> play(GameSound sound) async {
    if (!_soundEnabled) return;
    await _sfxPlayer.play(AssetSource('sounds/${sound.filename}'));
  }

  // ═══ MÚSICA DE FONDO ═══
  Future<void> playBackgroundMusic() async {
    if (!_musicEnabled) return;
    await _bgMusicPlayer.setReleaseMode(ReleaseMode.loop);
    await _bgMusicPlayer.play(AssetSource('sounds/ambient_loop.mp3'));
    await _bgMusicPlayer.setVolume(0.3);
  }

  Future<void> stopBackgroundMusic() async {
    await _bgMusicPlayer.stop();
  }

  Future<void> pauseBackgroundMusic() async {
    await _bgMusicPlayer.pause();
  }

  Future<void> resumeBackgroundMusic() async {
    if (!_musicEnabled) return;
    await _bgMusicPlayer.resume();
  }
}

enum GameSound {
  // Existentes
  keystroke('keystroke.mp3'),
  objectiveComplete('objective_complete.mp3'),
  missionSuccess('mission_success.mp3'),
  missionFailed('mission_failed.mp3'),
  fbiAlert('fbi_alert.mp3'),
  traceWarning('trace_warning.mp3'),
  traceCritical('trace_critical.mp3'),
  messageReceived('message_received.mp3'),
  errorBeep('error_beep.mp3'),

  // Nuevos para UI
  menuClick('menu_click.mp3'),
  tabSwitch('tab_switch.mp3'),
  rankUp('rank_up.mp3'),
  uploadSuccess('upload_success.mp3'),
  saveSuccess('save_success.mp3'),
  podiumReveal('podium_reveal.mp3'),
  glitchTransition('glitch_transition.mp3'),
  refresh('refresh.mp3'),
  logout('logout.mp3');

  final String filename;
  const GameSound(this.filename);
}
