import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSession } from '../hooks/useSession';
import { useAuthStore } from '../store/auth';
import { usePurposes } from '../hooks/usePurposes';
import FloatingTimer from '../components/FloatingTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Volume2, VolumeX, Monitor } from 'lucide-react';

export default function UserDashboard() {
  const { logout } = useAuth();
  const user = useAuthStore((state) => state.user);
  const { activeSession, startSession, endSession } = useSession();
  const { purposes } = usePurposes();
  const [timeLeft, setTimeLeft] = useState(60);
  const [showInactiveWarning, setShowInactiveWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [warningAudio] = useState(new Audio('/warning.mp3'));
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      if (!activeSession && user) {
        try {
          // Get the first active purpose if none is specified
          const defaultPurpose = purposes.find(p => p.active)?.name || 'internet';
          await startSession(defaultPurpose);
        } catch (error) {
          console.error('Failed to start session:', error);
        }
      }
      setIsInitializing(false);
    };

    initializeSession();
  }, [activeSession, user, purposes, startSession]);

  const handleActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowInactiveWarning(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [handleActivity]);

  useEffect(() => {
    const checkInactivity = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      if (inactiveTime > 50000 && !showInactiveWarning) {
        setShowInactiveWarning(true);
        if (soundEnabled) {
          warningAudio.play().catch(console.error);
        }
      }
      if (inactiveTime > 60000) {
        handleEndSession();
      }
    }, 1000);

    return () => clearInterval(checkInactivity);
  }, [lastActivity, showInactiveWarning, soundEnabled]);

  useEffect(() => {
    let timer: number;
    if (activeSession) {
      timer = window.setInterval(() => {
        const startTime = new Date(activeSession.startTime);
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
        const remaining = Math.max(60 - elapsed, 0);
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          handleEndSession();
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeSession]);

  const handleEndSession = async () => {
    try {
      await endSession();
      logout();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Monitor className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p className="text-xl">Initializing session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Sound Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleSound}
        className="fixed top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 z-50"
      >
        {soundEnabled ? (
          <Volume2 className="h-6 w-6 text-white" />
        ) : (
          <VolumeX className="h-6 w-6 text-white" />
        )}
      </motion.button>

      {/* Floating Timer */}
      {activeSession && (
        <FloatingTimer
          timeLeft={timeLeft}
          onEndSession={handleEndSession}
        />
      )}

      {/* Inactivity Warning Modal */}
      <AnimatePresence>
        {showInactiveWarning && (
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
                You will be automatically logged out in {Math.ceil((60000 - (Date.now() - lastActivity)) / 1000)} seconds due to inactivity.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowInactiveWarning(false)}
                className="w-full bg-blue-600/20 border border-blue-500/30 text-blue-100 py-2 rounded-lg hover:bg-blue-600/30 transition-colors duration-200"
              >
                I'm still here
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-4">Welcome, {user?.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-2">Session Info</h2>
              <p className="text-blue-200">Time Remaining: {timeLeft} minutes</p>
              <p className="text-blue-200">Purpose: {activeSession?.purpose}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-2">User Info</h2>
              <p className="text-blue-200">Admission Number: {user?.admissionNumber}</p>
              <p className="text-blue-200">Class: {user?.class}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 left-4 bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/10 z-50"
      >
        <div className="text-white text-sm">
          <span className="opacity-70">Logged in as </span>
          <span className="font-medium">{user?.name}</span>
        </div>
      </motion.div>
    </div>
  );
}