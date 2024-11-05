import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface InactivityWarningProps {
  show: boolean;
  timeLeft: number;
  onConfirm: () => void;
}

export default function InactivityWarning({ show, timeLeft, onConfirm }: InactivityWarningProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/10 border border-white/20 rounded-xl p-8 max-w-md w-full mx-4"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="flex items-center justify-center text-yellow-500 mb-4"
            >
              <AlertTriangle className="h-12 w-12" />
            </motion.div>
            <h3 className="text-xl font-bold text-white text-center mb-2">
              Inactivity Detected
            </h3>
            <p className="text-blue-200 text-center mb-6">
              You will be automatically logged out in {Math.ceil(timeLeft / 1000)} seconds due to inactivity.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className="w-full bg-blue-600/20 border border-blue-500/30 text-blue-100 py-2 rounded-lg hover:bg-blue-600/30 transition-colors duration-200"
            >
              I'm still here
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}