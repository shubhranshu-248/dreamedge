enum QuestionType {
  mcqSingle,
  mcqMultiple,
  trueFalse,
  shortAnswer,
  matchPair,
  subjective,
  imageBased,
  unknown;

  static QuestionType fromString(String? raw) {
    switch (raw) {
      case 'mcq_single':
        return QuestionType.mcqSingle;
      case 'mcq_multiple':
        return QuestionType.mcqMultiple;
      case 'true_false':
        return QuestionType.trueFalse;
      case 'short_answer':
        return QuestionType.shortAnswer;
      case 'match_pair':
        return QuestionType.matchPair;
      case 'subjective':
        return QuestionType.subjective;
      case 'image_based':
        return QuestionType.imageBased;
      default:
        return QuestionType.unknown;
    }
  }

  String get label {
    switch (this) {
      case QuestionType.mcqSingle:
        return 'Single choice';
      case QuestionType.mcqMultiple:
        return 'Multiple choice';
      case QuestionType.trueFalse:
        return 'True / False';
      case QuestionType.shortAnswer:
        return 'Short answer';
      case QuestionType.matchPair:
        return 'Match the pairs';
      case QuestionType.subjective:
        return 'Subjective';
      case QuestionType.imageBased:
        return 'Image-based';
      case QuestionType.unknown:
        return 'Question';
    }
  }

  bool get isAutoGradable =>
      this == QuestionType.mcqSingle ||
      this == QuestionType.mcqMultiple ||
      this == QuestionType.trueFalse;
}

class QuestionOption {
  final String id;
  final String text;
  final bool isCorrect;

  const QuestionOption({
    required this.id,
    required this.text,
    required this.isCorrect,
  });

  factory QuestionOption.fromJson(Map<String, dynamic> json) {
    return QuestionOption(
      id: json['id']?.toString() ?? '',
      text: json['text']?.toString() ?? '',
      isCorrect: json['is_correct'] as bool? ?? false,
    );
  }
}

class TestQuestion {
  final String id;
  final String testId;
  final QuestionType type;
  final String content;
  final List<QuestionOption> options;
  final String? correctAnswer;
  final double positiveMarks;
  final double negativeMarks;
  final String difficulty;
  final String? topicTag;
  final String? imageUrl;
  final String? hint;
  final int sortOrder;

  const TestQuestion({
    required this.id,
    required this.testId,
    required this.type,
    required this.content,
    required this.options,
    this.correctAnswer,
    required this.positiveMarks,
    required this.negativeMarks,
    required this.difficulty,
    this.topicTag,
    this.imageUrl,
    this.hint,
    required this.sortOrder,
  });

  List<String> get correctOptionIds =>
      options.where((o) => o.isCorrect).map((o) => o.id).toList();

  bool get hasAutoCorrectAnswer {
    if (type == QuestionType.mcqSingle ||
        type == QuestionType.mcqMultiple) {
      return options.any((o) => o.isCorrect);
    }
    if (type == QuestionType.trueFalse) {
      return correctAnswer != null && correctAnswer!.isNotEmpty;
    }
    if (type == QuestionType.shortAnswer) {
      return correctAnswer != null && correctAnswer!.trim().isNotEmpty;
    }
    return false;
  }

  factory TestQuestion.fromJson(Map<String, dynamic> json) {
    final rawOptions = json['options'];
    final options = <QuestionOption>[];
    if (rawOptions is List) {
      for (final item in rawOptions) {
        if (item is Map<String, dynamic>) {
          options.add(QuestionOption.fromJson(item));
        } else if (item is Map) {
          options.add(QuestionOption.fromJson(Map<String, dynamic>.from(item)));
        }
      }
    }

    return TestQuestion(
      id: json['id'] as String,
      testId: json['test_id'] as String,
      type: QuestionType.fromString(json['type'] as String?),
      content: json['content'] as String? ?? '',
      options: options,
      correctAnswer: json['correct_answer'] as String?,
      positiveMarks: (json['positive_marks'] as num?)?.toDouble() ?? 1,
      negativeMarks: (json['negative_marks'] as num?)?.toDouble() ?? 0,
      difficulty: json['difficulty'] as String? ?? 'medium',
      topicTag: json['topic_tag'] as String?,
      imageUrl: json['image_url'] as String?,
      hint: json['hint'] as String?,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? 0,
    );
  }
}
