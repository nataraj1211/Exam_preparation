import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  UploadCloud, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onOpenUpload: () => void;
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
  activePage: string;
  onGoBack?: () => void;
  canGoBack?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenUpload, 
  onOpenSearch, 
  onToggleSidebar, 
  activePage,
  onGoBack,
  canGoBack = false
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile Menu Toggle, Back Button & Brand */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Back Page Button */}
            {canGoBack && onGoBack && (
              <button
                onClick={onGoBack}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Go back to previous page"
                aria-label="Go back to previous page"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  StudyMate AI
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                  College Prep v1.0
                </span>
              </div>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 transition-all shadow-inner group"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span>Search documents, topics, keywords...</span>
              </div>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
                Ctrl + K
              </kbd>
            </button>
          </div>

          {/* Right: Actions (Upload, Theme, Profile) */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Mobile Search Button */}
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Quick Upload Button */}
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Material</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark and Light theme mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline text-amber-300">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline text-slate-700">Dark</span>
                </>
              )}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(prev => !prev)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                    {user?.name || 'Student'}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[110px]">
                    {user?.target_exam || 'MCA Final Year'}
                  </p>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/10 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <div className="p-1">
                    <div className="px-3 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ready for College Exam</span>
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
