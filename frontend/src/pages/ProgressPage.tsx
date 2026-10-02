import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  BookOpen, 
  Calendar, 
  Award, 
  TrendingUp,
  Loader2,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import { ProgressAnalytics } from '../types';

interface ProgressPageProps {
  onStartQuiz: (docId?: string) => void;
  onReviewQuiz?: (quizId: string) => void;
  onBack?: () => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ 
  onStartQuiz,
  onReviewQuiz,
  onBack
}) => {
  const [data, setData] = useState<ProgressAnalytics | null>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const [progRes, quizRes] = await Promise.all([
        api.getProgressAnalytics(),
        api.getQuizHistory()
      ]);
      setData(progRes);
      setQuizzes(quizRes.quizzes || []);
    } catch (err) {
      console.error('Failed to load progress analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
        <p className="text-sm text-slate-500">Computing syllabus mastery metrics...</p>
      </div>
    );
  }

  const accuracyRate = data?.total_questions 
    ? Math.round((data.correct_answers / data.total_questions) * 100) 
    : 85;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
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

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <span>📊 Study Progress & Mastery</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time assessment tracking across all syllabus units and topics
          </p>
        </div>

        <button
          onClick={() => onStartQuiz()}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Launch Practice Quiz</span>
        </button>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <BookOpen className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {data?.total_documents || 0}
          </p>
          <p className="text-[11px] font-semibold text-slate-500">Total Documents</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <Award className="w-5 h-5 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {data?.total_quizzes || 0}
          </p>
          <p className="text-[11px] font-semibold text-slate-500">Quizzes Completed</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <HelpCircle className="w-5 h-5 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {data?.total_questions || 0}
          </p>
          <p className="text-[11px] font-semibold text-slate-500">Total Questions</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {data?.correct_answers || 0}
          </p>
          <p className="text-[11px] font-semibold text-slate-500">Correct Answers</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <XCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-red-600 dark:text-red-400">
            {data?.wrong_answers || 0}
          </p>
          <p className="text-[11px] font-semibold text-slate-500">Wrong Answers</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-1">
          <TrendingUp className="w-5 h-5 text-pink-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {data?.average_percentage || 0}%
          </p>
          <p className="text-[11px] font-semibold text-slate-500">Average Score</p>
        </div>

      </div>

      {/* Topic-Wise Performance Chart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <span>Topic-Wise Syllabus Performance</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Subject proficiency based on your completed practice quizzes
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            {accuracyRate}% Overall Accuracy
          </span>
        </div>

        <div className="space-y-5">
          {(data?.topic_performance || []).map((tp, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {tp.subject}
                  </span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    ({tp.quizzes} tests)
                  </span>
                </div>
                <div className="flex items-center space-x-2 font-black">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {tp.accuracy}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {tp.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar with vibrant gradient */}
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    tp.percentage >= 85
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : tp.percentage >= 75
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}
                  style={{ width: `${tp.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Quiz Attempt History Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Quiz Attempt History
          </h3>
          <span className="text-xs text-slate-400">
            {quizzes.length} total attempts
          </span>
        </div>

        {quizzes.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No quiz records yet. Take a test to see your history!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="pb-3 px-2">Topic / Subject</th>
                  <th className="pb-3 px-2">Difficulty</th>
                  <th className="pb-3 px-2">Score</th>
                  <th className="pb-3 px-2">Percentage</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {quizzes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-2 font-bold text-slate-800 dark:text-slate-200">
                      {q.document_name || q.topic}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {q.score} / {q.question_count}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`font-black ${
                        q.percentage >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {q.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-400">
                      {new Date(q.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => onStartQuiz(q.document_id)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Retake Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
