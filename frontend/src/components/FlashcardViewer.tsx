import React, { useState } from 'react';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Check, 
  Bookmark, 
  Sparkles,
  Layers
} from 'lucide-react';
import { Flashcard } from '../types';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  title?: string;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ 
  flashcards, 
  title 
}) => {
  const [cards, setCards] = useState<Flashcard[]>(flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500">No flashcards generated for this unit yet.</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const isMastered = masteredIds.has(currentCard.id);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
  };

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const toggleMastered = () => {
    setMasteredIds(prev => {
      const next = new Set(prev);
      if (next.has(currentCard.id)) {
        next.delete(currentCard.id);
      } else {
        next.add(currentCard.id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-500" />
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            Revision Flashcards
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold">
            {currentIndex + 1} of {cards.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShuffle}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Shuffle Cards"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>

          <button
            onClick={toggleMastered}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              isMastered
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isMastered ? 'Mastered ✓' : 'Mark Mastered'}</span>
          </button>
        </div>
      </div>

      {/* 3D Flip Card */}
      <div 
        onClick={handleFlip}
        className="w-full h-80 perspective-1000 cursor-pointer group"
      >
        <div 
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front of Card */}
          <div className="absolute inset-0 backface-hidden p-8 rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-850 dark:to-slate-900 border-2 border-indigo-100 dark:border-slate-700/80 shadow-xl shadow-indigo-500/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Question / Prompt
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {currentCard.difficulty || 'Medium'}
              </span>
            </div>

            <div className="text-center my-auto px-4">
              <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentCard.front}
              </h4>
            </div>

            <div className="flex items-center justify-center space-x-1.5 text-xs text-indigo-500 font-medium group-hover:text-indigo-600">
              <RotateCw className="w-3.5 h-3.5 animate-spin-reverse" />
              <span>Click anywhere to flip and reveal answer</span>
            </div>
          </div>

          {/* Back of Card */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 p-8 rounded-3xl bg-gradient-to-br from-indigo-900/90 to-purple-950/90 text-white border-2 border-indigo-400/40 shadow-xl shadow-purple-500/10 flex flex-col justify-between overflow-y-auto">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-300 uppercase tracking-wider">
                Answer & Key Explanation
              </span>
              <span className="text-[11px] text-indigo-200">
                StudyMate Verified
              </span>
            </div>

            <div className="my-auto py-2 text-sm md:text-base leading-relaxed whitespace-pre-line text-indigo-50 font-normal">
              {currentCard.back}
            </div>

            <div className="flex items-center justify-center space-x-1.5 text-xs text-indigo-300">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Click to flip back to question</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={handlePrev}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleFlip}
          className="px-6 py-2.5 rounded-2xl text-sm font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
        >
          Flip Card
        </button>

        <button
          onClick={handleNext}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer active:scale-95"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
