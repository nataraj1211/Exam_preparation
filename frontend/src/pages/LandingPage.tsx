import React from 'react';
import { 
  GraduationCap, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  MessageSquareText, 
  HelpCircle, 
  BarChart3, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Award, 
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LandingPageProps {
  onGetStarted: () => void;
  onDemoLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onGetStarted, 
  onDemoLogin 
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              StudyMate AI
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Exam Assistant
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer shadow-xs active:scale-95"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline text-amber-300">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden md:inline text-slate-700">Dark</span>
              </>
            )}
          </button>

          <button
            onClick={onDemoLogin}
            className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Demo Student
          </button>
          <button
            onClick={onGetStarted}
            className="flex items-center space-x-1.5 px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 text-center space-y-8">
        
        {/* Glowing Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-xs">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
          <span>Next-Generation College Exam Preparation Platform</span>
        </div>

        {/* Hero Title & Tagline */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Turn Your Study Materials Into{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Top Exam Scores
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            "Upload. Understand. Practice. Score."
          </p>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Upload course PDFs, Word docs, PowerPoint presentations, or notes. StudyMate AI extracts key concepts, generates 2/5/16-mark university questions, solves doubts with document citations, and tests you with interactive MCQs!
          </p>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-95 shadow-xl shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onDemoLogin}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-4 rounded-2xl text-base font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>Launch MCA Demo Experience</span>
          </button>
        </div>

        {/* Supported Formats strip */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>PDF Documents</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Word (.docx)</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>PowerPoint (.pptx)</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Text Notes (.txt)</span>
          </span>
        </div>

        {/* Live Feature Preview Mockup */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-slate-400 ml-2">StudyMate AI Workspace • Operating Systems Unit 1.pdf</span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ Ready for Viva & Exams
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Quick Summary</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Focuses on Process Lifecycle, PCB structures, Context Switching costs, and Coffman's 4 Deadlock conditions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
                <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 mb-2">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Exam Focus (2 & 16 Marks)</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Predicts Banker's Algorithm proofs, Convoy Effect comparisons, and 5-state diagrams with scoring outlines.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/50">
                <div className="flex items-center space-x-2 text-pink-600 dark:text-pink-400 mb-2">
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Instant MCQs</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Generates 5 to 20 multiple choice questions with instant explanations and score tracking.
                </p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              How StudyMate AI Works
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Designed specifically for engineering and college students preparing for tests and final semester exams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Upload Material
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Drag and drop your syllabus notes, textbook chapter PDF, DOCX, or presentation slides.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Deep Analysis
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                System extracts clean text, partitions sections into RAG chunks, and synthesizes key summaries and formulas.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Practice & Clarify
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Ask doubts in natural language, review 3D revision flashcards, and practice custom difficulty MCQs.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Score & Progress
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Get instant score validation, export study guides to PDF, and track topic mastery before exam day.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            Engineered For Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Everything College Students Need
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Summary & Key Definitions
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Provides both a quick refresher and comprehensive unit summaries, listing definitions, mathematical formulas, and critical keywords.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ask Doubts (RAG Chatbot)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Trained to answer questions strictly using your uploaded notes. Ask for 2-mark definitions or 16-mark essay structures with document citations.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Interactive MCQ Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Select 5 to 20 questions, configure Easy/Medium/Hard difficulties, test with instant answer validation, and review full explanations.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Interactive 3D Flashcards
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Quick card flip revision for definitions, advantages, and algorithmic steps with shuffle and mastery marking.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2, 5 & 16-Mark Question Bank
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Identifies high-probability semester examination questions with expected answer outlines and point-by-point scoring keys.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Study Progress & Analytics
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Visualizes topic-wise performance across Operating Systems, DBMS, Networks, and tracks accuracy over time.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500">
        <p>StudyMate AI • MCA Final Year Project Demonstration • Built for College Students</p>
      </footer>
    </div>
  );
};
