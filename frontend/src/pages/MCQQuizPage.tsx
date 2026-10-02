import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Loader2, 
  AlertCircle,
  Award,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { Question, QuizAnswer } from '../types';

interface MCQQuizPageProps {
  quizId: string;
  onFinishQuiz: (resultData: any) => void;
  onExit: () => void;
}

export const MCQQuizPage: React.FC<MCQQuizPageProps> = ({ 
  quizId, 
  onFinishQuiz, 
  onExit 
}) => {
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, {
    selected_answer: string | null;
    is_correct?: boolean;
    correct_answer?: string;
    explanation?: string;
    is_marked_for_review: boolean;
  }>>({});

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    loadQuizData();
  }, [quizId]);

  // Timer
  useEffect(() => {
    if (loading || submitting) return;
    const interval = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, submitting]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      const res = await api.getQuiz(quizId);
      setQuiz(res.quiz);
      setQuestions(res.questions || []);

      // Reconstruct answers map if re-entering
      const ansMap: Record<string, any> = {};
      (res.answers || []).forEach((a: any) => {
        ansMap[a.question_id] = {
          selected_answer: a.selected_answer,
          is_correct: a.is_correct,
          is_marked_for_review: Boolean(a.is_marked_for_review)
        };
      });
      setAnswers(ansMap);
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIndex];
  const currentAns = currentQ ? answers[currentQ.id] : null;

  const handleSelectOption = async (optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQ) return;
    
    // Once answered, do not allow changing to preserve genuine test conditions
    if (currentAns?.selected_answer) return;

    try {
      const res = await api.answerQuestion(quizId, {
        question_id: currentQ.id,
        selected_answer: optionKey,
        is_marked_for_review: currentAns?.is_marked_for_review || false
      });

      setAnswers(prev => ({
        ...prev,
        [currentQ.id]: {
          selected_answer: optionKey,
          is_correct: res.is_correct,
          correct_answer: res.correct_answer,
          explanation: res.explanation,
          is_marked_for_review: prev[currentQ.id]?.is_marked_for_review || false
        }
      }));
    } catch (err) {
      console.error('Failed to record answer:', err);
    }
  };

  const toggleMarkForReview = () => {
    if (!currentQ) return;
    const isMarked = !currentAns?.is_marked_for_review;
    
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...(prev[currentQ.id] || { selected_answer: null }),
        is_marked_for_review: isMarked
      }
    }));

    if (currentAns?.selected_answer) {
      api.answerQuestion(quizId, {
        question_id: currentQ.id,
        selected_answer: currentAns.selected_answer,
        is_marked_for_review: isMarked
      }).catch(console.error);
    }
  };

  const handleSubmitQuiz = async () => {
    setShowSubmitConfirm(false);
    setSubmitting(true);
    try {
      const res = await api.submitQuiz(quizId, { time_taken_seconds: secondsElapsed });
      onFinishQuiz(res);
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz.');
      setSubmitting(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Initializing MCQ test session...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-16 text-center space-y-4">
        <p className="text-sm text-slate-500">No questions available in this test.</p>
        <button onClick={onExit} className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white">
          Back
        </button>
      </div>
    );
  }

  const answeredCount = Object.values(answers).filter(a => a.selected_answer).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Test Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to leave the test? Progress will be saved.')) {
                onExit();
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/80 active:scale-95 shadow-2xs"
            title="Leave test and return"
            aria-label="Exit test"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Exit Test</span>
          </button>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-sm">
              {quiz?.topic || 'MCQ Practice Quiz'}
            </h3>
            <p className="text-xs text-slate-400">
              Difficulty: <span className="font-semibold text-purple-600 dark:text-purple-400">{quiz?.difficulty || 'Medium'}</span>
            </p>
          </div>
        </div>

        {/* Timer & Submit Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          <button
            onClick={() => setShowSubmitConfirm(true)}
            disabled={submitting}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit Quiz</span>
          </button>
        </div>
      </div>

      {/* Question Navigation Bar (1, 2, ..., N with 4 states) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Question Navigation ({answeredCount}/{questions.length} Attempted)
          </span>
          <div className="hidden sm:flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
              <span>Unattempted</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Answered</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Marked for Review</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const ans = answers[q.id];
            const isCurrent = currentIndex === idx;
            const isAnswered = Boolean(ans?.selected_answer);
            const isMarked = Boolean(ans?.is_marked_for_review);

            let bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200';
            if (isAnswered) {
              bgClass = 'bg-emerald-500 text-white shadow-xs';
            }
            if (isMarked) {
              bgClass = 'bg-amber-500 text-white shadow-xs';
            }
            if (isCurrent) {
              bgClass += ' ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 font-black scale-105';
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${bgClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          
          {/* Question Header & Mark for Review */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            <button
              onClick={toggleMarkForReview}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                currentAns?.is_marked_for_review
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {currentAns?.is_marked_for_review ? (
                <BookmarkCheck className="w-4 h-4 text-amber-500" />
              ) : (
                <Bookmark className="w-4 h-4 text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {currentAns?.is_marked_for_review ? 'Marked' : 'Mark for Review'}
              </span>
            </button>
          </div>

          {/* Clickable Options A, B, C, D */}
          <div className="space-y-3">
            {[
              { key: 'A', text: currentQ.option_a },
              { key: 'B', text: currentQ.option_b },
              { key: 'C', text: currentQ.option_c },
              { key: 'D', text: currentQ.option_d }
            ].map((opt) => {
              const isSelected = currentAns?.selected_answer === opt.key;
              const hasAnswered = Boolean(currentAns?.selected_answer);
              const isCorrectAnswer = hasAnswered && (currentAns?.correct_answer === opt.key || currentQ.correct_answer === opt.key);

              let optionStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200';

              if (hasAnswered) {
                if (isSelected && currentAns?.is_correct) {
                  // User chose correctly
                  optionStyle = 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
                } else if (isSelected && !currentAns?.is_correct) {
                  // User chose incorrectly
                  optionStyle = 'border-red-500 bg-red-50/50 dark:bg-red-950/40 text-red-900 dark:text-red-200';
                } else if (isCorrectAnswer) {
                  // Show which was correct
                  optionStyle = 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-semibold';
                } else {
                  optionStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
                }
              }

              return (
                <button
                  key={opt.key}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(opt.key as any)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${optionStyle}`}
                >
                  <div className="flex items-center space-x-3.5">
                    <span className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                      isSelected
                        ? currentAns?.is_correct ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        : isCorrectAnswer
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {opt.key}
                    </span>
                    <span className="text-sm font-medium leading-relaxed">
                      {opt.text}
                    </span>
                  </div>

                  {hasAnswered && isSelected && (
                    currentAns?.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 ml-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 ml-2" />
                    )
                  )}
                </button>
              );
            })}
          </div>

          {/* Instant Validation Feedback & Explanation (revealed only AFTER selection) */}
          {currentAns?.selected_answer && (
            <div className={`p-5 rounded-2xl border text-xs sm:text-sm space-y-2 animate-in fade-in duration-200 ${
              currentAns.is_correct
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-red-50/80 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
            }`}>
              <div className="flex items-center space-x-2 font-bold text-base">
                {currentAns.is_correct ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400">✓ Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-700 dark:text-red-400">
                      ✗ Incorrect. Correct Answer: {currentAns.correct_answer || currentQ.correct_answer}
                    </span>
                  </>
                )}
              </div>

              <div className="pt-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-bold">Explanation: </span>
                {currentAns.explanation || currentQ.explanation}
              </div>
            </div>
          )}

          {/* Navigation Controls: Prev, Next, Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Quiz</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* Confirmation Modal for Submitting */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Ready to Submit Your Quiz?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You have answered <span className="font-bold text-indigo-600">{answeredCount}</span> of <span className="font-bold">{questions.length}</span> questions. Unanswered questions will be counted as skipped.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Keep Practicing
              </button>
              <button
                onClick={handleSubmitQuiz}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
