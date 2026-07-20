import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Share2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Story {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
  bgGradient?: string;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const duration = 5000; // 5 seconds per story

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) return;

    const interval = 10;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, handleNext]);

  const story = stories[currentIndex];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-0 md:p-6"
    >
      {/* Dynamic Background Blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.img 
          key={`bg-${story.id}`}
          src={story.imageUrl} 
          className="w-full h-full object-cover scale-150 blur-[100px] opacity-40 transition-all duration-1000"
          alt="background"
        />
      </div>

      <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white z-50 transition-colors">
        <X size={32} strokeWidth={1.5} />
      </button>

      <div 
        className="relative w-full max-w-[420px] h-full md:max-h-[85vh] bg-[#1a1b1e] md:rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] flex flex-col"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress Bars */}
        <div className="absolute top-6 left-6 right-6 flex gap-2 z-50">
          {stories.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-[10ms] ease-linear"
                style={{ 
                  width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={story.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <img src={story.imageUrl} className="w-full h-full object-cover select-none" alt={story.title}  loading="lazy" />
              
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

              {/* Text Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 pt-20">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-[32px] font-black text-white leading-[1.1] mb-4 tracking-tight drop-shadow-lg">
                    {story.title}
                  </h2>
                  {story.description && (
                    <p className="text-[15px] text-white/80 leading-relaxed mb-8 font-medium drop-shadow-md">
                      {story.description}
                    </p>
                  )}
                  
                  <div className="flex gap-3">
                    <button className="flex-1 bg-[#FFE24C] hover:bg-[#fff080] text-black font-black py-4 rounded-2xl text-[14px] uppercase tracking-wider transition-all active:scale-95 shadow-[0_8px_20px_-4px_rgba(255,226,76,0.5)]">
                      Learn More
                    </button>
                    <button className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all active:scale-95">
                      <Share2 size={20} />
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Click Targets */}
          <div className="absolute inset-y-0 left-0 w-1/3 z-40 cursor-pointer" onClick={handlePrev} />
          <div className="absolute inset-y-0 right-0 w-1/3 z-40 cursor-pointer" onClick={handleNext} />
        </div>
      </div>

      {/* Desktop External Controls */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="absolute left-10 text-white/30 hover:text-white transition-all disabled:opacity-0 hidden xl:block"
      >
        <ChevronLeft size={64} strokeWidth={1} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-10 text-white/30 hover:text-white transition-all hidden xl:block"
      >
        <ChevronRight size={64} strokeWidth={1} />
      </button>
    </motion.div>
  );
};
