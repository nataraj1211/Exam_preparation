import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCw, 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  FileDown, 
  ArrowRight,
  Sparkles,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { PDFExportButton } from '../components/PDFExportButton';

interface QuizResultPageProps {
  quizResult: any;
  onRetryQuiz: (quizId: string) => void;
  onGenerateNew: (documentId: string) => void;
  onBackToSummary: (documentId: string) => void;
  onBack?: () => void;
}

export const QuizResultPage: React.FC<QuizResultPageProps> = ({ 
  quizResult, 
  onRetryQuiz, 
  onGenerateNew, 
  onBackToSummary,
  onBack
}) => {
  const quiz = quizResult?.quiz || {};
  const review = quizResult?.review || [];

  useEffect(() => {
    if (quiz.percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [quiz.percentage]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder}s`;
  };

  const getGradeText = (pct: number) => {
    if (pct >= 90) return { text: 'Outstanding! Distinction Grade 🌟', color: 'text-emerald-500' };
    if (pct >= 75) return { text: 'Excellent! Exam Ready 🎓', color: 'text-indigo-500' };
    if (pct >= 50) return { text: 'Good Effort! Review Mistaken Concepts 📚', color: 'text-amber-500' };
    return { text: 'Needs Revision. Re-read the AI Summary! 💡', color: 'text-red-500' };
  };

  const grade = getGradeText(quiz.percentage || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Back Navigation */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer w-fit"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-indigo-500" />
          <span>Back to Dashboard</span>
        </button>
      )}

      {/* Top Banner Card with Radial Progress */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Trophy className="w-3.5 h-3.5" />
              <span>Assessment Completed</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Your Exam Quiz Result
            </h2>
            <p className={`text-sm font-bold ${grade.color}`}>
              {grade.text}
            </p>
          </div>

          {/* Radial / Circular Percentage Meter */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100 dark:text-slate-800"
                fill="none"
              />
              {/* Animated Progress ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={`${(quiz.percentage / 100) * 264} 264`}
                strokeLinecap="round"
                className="text-indigo-600 transition-all duration-1000 ease-out"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {quiz.percentage}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Score
              </span>
            </div>
          </div>
        </div>

        {/* 4 Score Stats Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-center">
            <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
              {quiz.score} / {quiz.question_count}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Total Marks</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {quiz.correct_count}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Correct Answers</p>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-center">
            <p className="text-2xl font-black text-red-600 dark:text-red-400">
              {quiz.wrong_count}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Wrong Answers</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-2xl font-black text-slate-600 dark:text-slate-300">
              {quiz.skipped_count}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Skipped</p>
          </div>

        </div>

        {/* Action Buttons: Retry Quiz, Generate New Questions, Back to Summary, PDF */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onRetryQuiz(quiz.id)}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry Quiz</span>
            </button>

            <button
              onClick={() => onGenerateNew(quiz.document_id)}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-500/20 transition-all cursor-pointer active:scale-95"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Generate New Questions</span>
            </button>

            <button
              onClick={() => onBackToSummary(quiz.document_id)}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Back to Summary</span>
            </button>
          </div>

          <PDFExportButton
            type="quiz_result"
            data={quizResult}
            title={`${quiz.topic || 'Exam'} - Quiz Result`}
          />
        </div>

      </div>

      {/* Question Review List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Question Review & Solutions
          </h3>
          <span className="text-xs text-slate-400">
            {review.length} Questions Evaluated
          </span>
        </div>

        <div className="space-y-4">
          {review.map((item: any, idx: number) => {
            const isCorrect = item.is_correct;
            const isSkipped = item.is_skipped;

            return (
              <div
                key={item.id || idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
              >
                {/* Review Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Question {idx + 1}
                  </span>

                  <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
                    isCorrect
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : isSkipped
                      ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>✓ Correct</span>
                      </>
                    ) : isSkipped ? (
                      <>
                        <MinusCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span>○ Skipped</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>✗ Wrong</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Question Statement */}
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                  {item.question}
                </h4>

                {/* User Answer vs Correct Answer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className={`p-3 rounded-2xl border ${
                    isCorrect
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                      : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300'
                  }`}>
                    <span className="font-bold">Your Selected Answer: </span>
                    <span>{item.user_answer ? `Option ${item.user_answer}` : 'None (Skipped)'}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300">
                    <span className="font-bold">Correct Answer: </span>
                    <span>Option {item.correct_answer}</span>
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <p className="font-bold text-indigo-600 dark:text-indigo-400">
                    AI Concept Explanation:
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
