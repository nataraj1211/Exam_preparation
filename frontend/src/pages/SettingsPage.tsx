import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Cpu, 
  Sun, 
  Moon, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Save, 
  Key,
  GraduationCap,
  ArrowLeft,
  Building2,
  Phone,
  Clock,
  Database,
  Activity,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface SettingsPageProps {
  onBack?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme, setThemeMode } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [targetExam, setTargetExam] = useState(user?.target_exam || 'MCA Final Semester');
  const [collegeName, setCollegeName] = useState(user?.college_name || '');
  const [department, setDepartment] = useState(user?.department || 'MCA');
  const [phone, setPhone] = useState(user?.phone || '');
  const [customApiKey, setCustomApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTargetExam(user.target_exam || 'MCA Final Semester');
      setCollegeName(user.college_name || '');
      setDepartment(user.department || 'MCA');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUser({ 
        name, 
        target_exam: targetExam,
        college_name: collegeName,
        department,
        phone
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Back button and Title */}
      <div className="space-y-3">
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

        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <span>⚙ Settings & Preferences</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your student profile, exam targets, and AI engine preferences
          </p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Profile Settings */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Student Profile
              </h3>
              <p className="text-xs text-slate-500">
                Your personal details for personalized quiz reports and certificates
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Database Account ID)
              </label>
              <input
                type="text"
                disabled
                value={user?.email || 'student@studymate.ai'}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                College / University Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Sastha Institute / Anna University"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Branch
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master of Computer Applications (MCA)"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile / Contact
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Examination / Degree
              </label>
              <input
                type="text"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Persistent Database Records Badge */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Database Record Info (backend/database/database.json)
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                  Synchronized
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Total Logins:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{user?.login_count || 1} times</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Last Login:</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {user?.last_login_at ? new Date(user.last_login_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active now'}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[10px]">User Role:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">{user?.role || 'student'}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer shadow-md shadow-indigo-500/20 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved to Database!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes to Database</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* AI Engine & Provider Configuration */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                AI Service Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Environment variable based abstraction (Secure & Pluggable)
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-emerald-800 dark:text-emerald-300">
                Built-in College Tutor NLP Engine is Active (100% Reliable)
              </p>
              <p className="text-emerald-700 dark:text-emerald-400">
                The application processes syllabus documents locally with RAG text chunking, instant summaries, and university-grade MCQs. No mandatory cloud API key is required for evaluation.
              </p>
            </div>
          </div>

          <div className="space-y-3 max-w-xl text-xs">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Optional Cloud AI Key (Gemini or OpenAI)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="AI_API_KEY from backend .env is securely utilized"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Per security requirements, API keys are never exposed in frontend code. Keys are configured via <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">backend/.env</code>.
            </p>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Interface Theme (Dark / Light Mode)
              </h3>
              <p className="text-xs text-slate-500">
                Choose between high-contrast Dark theme or crisp educational Light theme
              </p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
              Active: {theme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Light Mode Card */}
            <div
              onClick={() => setThemeMode('light')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md shadow-indigo-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-amber-500">
                  <Sun className="w-5 h-5" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Light Mode</span>
                </div>
                {theme === 'light' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Selected</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Clean paper-white styling designed for daylight reading, printing, and clear presentation notes.
              </p>
            </div>

            {/* Dark Mode Card */}
            <div
              onClick={() => setThemeMode('dark')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md shadow-indigo-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Moon className="w-5 h-5" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</span>
                </div>
                {theme === 'dark' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Selected</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Sleek midnight palette designed to reduce eye strain during late-night study and viva preparation.
              </p>
            </div>
          </div>
        </div>

        {/* Project & MCA Demonstration Details */}
        <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-slate-700 dark:text-slate-300">
            <GraduationCap className="w-4 h-4 text-indigo-500" />
            <span>StudyMate AI • Final Year Project Dossier</span>
          </div>
          <p>
            Developed as a comprehensive MCA / Computer Science final-year web application incorporating Document Extraction (PDF, Word, PPTX, TXT), RAG Retrieval, Interactive Assessment, and Automated Study Progress tracking.
          </p>
        </div>

      </div>

    </div>
  );
};
