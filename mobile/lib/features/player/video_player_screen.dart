import 'package:chewie/chewie.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:video_player/video_player.dart';

import '../../core/models/content.dart';
import '../../core/providers/content_provider.dart';
import '../../shared/theme/colors.dart';
import '../../shared/theme/typography.dart';
import 'widgets/content_info_section.dart';
import 'widgets/video_placeholder.dart';

class VideoPlayerScreen extends ConsumerStatefulWidget {
  final String contentId;

  const VideoPlayerScreen({super.key, required this.contentId});

  @override
  ConsumerState<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends ConsumerState<VideoPlayerScreen> {
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  bool _playerReady = false;
  String? _playerError;

  @override
  void dispose() {
    _chewieController?.dispose();
    _videoController?.dispose();
    super.dispose();
  }

  Future<void> _initializePlayer(Content content) async {
    if (!content.hasVideo) return;

    try {
      final controller =
          VideoPlayerController.networkUrl(Uri.parse(content.videoUrl!));
      await controller.initialize();

      if (!mounted) {
        controller.dispose();
        return;
      }

      final chewie = ChewieController(
        videoPlayerController: controller,
        autoPlay: true,
        looping: false,
        allowFullScreen: true,
        allowMuting: true,
        showControls: true,
        materialProgressColors: ChewieProgressColors(
          playedColor: AppColors.orange,
          handleColor: AppColors.orange,
          bufferedColor: AppColors.orange.withValues(alpha: 0.3),
          backgroundColor: AppColors.gray.withValues(alpha: 0.3),
        ),
      );

      setState(() {
        _videoController = controller;
        _chewieController = chewie;
        _playerReady = true;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _playerError = 'Failed to load video';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final contentAsync = ref.watch(contentDetailProvider(widget.contentId));

    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        backgroundColor: AppColors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        title: contentAsync.whenOrNull(
          data: (content) => Text(
            content.title,
            style:
                AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.w600),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        centerTitle: false,
      ),
      body: contentAsync.when(
        data: (content) => _buildPlayerView(content),
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.orange),
        ),
        error: (error, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline_rounded,
                    size: 48, color: AppColors.error),
                const SizedBox(height: 16),
                Text(
                  'Could not load content',
                  style: AppTypography.bodyLarge
                      .copyWith(color: AppColors.textPrimary),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => ref
                      .invalidate(contentDetailProvider(widget.contentId)),
                  child: Text(
                    'Retry',
                    style:
                        AppTypography.button.copyWith(color: AppColors.orange),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPlayerView(Content content) {
    if (!_playerReady && _playerError == null && content.hasVideo) {
      _initializePlayer(content);
    }

    return Column(
      children: [
        _buildVideoArea(content),
        Expanded(
          child: SingleChildScrollView(
            child: ContentInfoSection(content: content),
          ),
        ),
      ],
    );
  }

  Widget _buildVideoArea(Content content) {
    if (!content.hasVideo) {
      return const VideoPlaceholder(state: PlaceholderState.unavailable);
    }

    if (_playerError != null) {
      return VideoPlaceholder(
        state: PlaceholderState.error,
        onRetry: () {
          setState(() {
            _playerError = null;
            _playerReady = false;
          });
        },
      );
    }

    if (!_playerReady || _chewieController == null) {
      return const VideoPlaceholder(state: PlaceholderState.loading);
    }

    return AspectRatio(
      aspectRatio: 16 / 9,
      child: Chewie(controller: _chewieController!),
    );
  }
}
