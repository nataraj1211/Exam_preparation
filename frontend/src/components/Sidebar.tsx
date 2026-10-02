import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  HelpCircle, 
  MessageSquareText, 
  BarChart3, 
  Settings, 
  Flame, 
  X,
  FileText,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onSelectTab, 
  isOpen, 
  onClose 
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'materials', label: 'Study Materials', icon: BookOpen, badge: '📚' },
    { id: 'mcqs', label: 'MCQ Practice', icon: HelpCircle, badge: '📝' },
    { id: 'doubts', label: 'AI Doubt Solver', icon: MessageSquareText, badge: '💬' },
    { id: 'progress', label: 'Progress', icon: BarChart3, badge: '📊' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: '⚙' }
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Navigation */}
        <div className="p-4 space-y-6">
          
          {/* Mobile Header Close */}
          <div className="flex md:hidden items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-sm text-slate-800 dark:text-white">Navigation</span>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tagline Box */}
          <div className="hidden md:block px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-transparent dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-transparent border border-indigo-100 dark:border-indigo-900/50">
            <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 tracking-wider uppercase">
              StudyMate AI
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              "Upload. Understand. Practice. Score."
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs opacity-80">{item.badge}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Study Streak & Exam Prep Info */}
        <div className="p-4 space-y-3 border-t border-slate-100 dark:border-slate-800">
          
          {/* Streak Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 dark:border-amber-500/30">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Exam Prep Streak</span>
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
              4 Days Active 🔥
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Consistent daily practice boosts retention by 80%!
            </p>
          </div>

          {/* Theme Mode Switcher */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
            </span>
            <button
              onClick={toggleTheme}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer border border-slate-200/60 dark:border-slate-600/60"
            >
              {theme === 'dark' ? 'Switch Light ☀' : 'Switch Dark 🌙'}
            </button>
          </div>

          {/* Quick Target Indicator */}
          <div className="px-2 py-1 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Exam: <span className="font-medium text-slate-600 dark:text-slate-300">{user?.target_exam || 'MCA Final Semester'}</span>
            </p>
          </div>

        </div>
      </aside>
    </>
  );
};
