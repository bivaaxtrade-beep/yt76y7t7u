import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LiveSupport } from './LiveSupport';
import { useSupport } from '../context/SupportContext';

const SupportWidget: React.FC = () => {
  const { isOpen, setIsOpen } = useSupport();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed inset-0 z-[500] pointer-events-none"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setIsOpen(false)} />
          <div className="pointer-events-auto">
            <LiveSupport onClose={() => setIsOpen(false)} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SupportWidget;
