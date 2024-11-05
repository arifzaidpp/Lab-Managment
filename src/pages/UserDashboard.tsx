import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSession } from '../hooks/useSession';
import FloatingTimer from '../components/FloatingTimer';

export default function UserDashboard() {
  const { logout } = useAuth();
  const { activeSession, startSession, endSession } = useSession();
  const [timeLeft, setTimeLeft] = useState(60);
  const [showInactiveWarning, setShowInactiveWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  useEffect(() => {
    if (!activeSession) {
      startSession().catch(console.error);
    }
  }, []);

  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
      setShowInactiveWarning(false);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);

  useEffect(() => {
    const checkInactivity = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      if (inactiveTime > 50000 && !showInactiveWarning) {
        setShowInactiveWarning(true);
      }
      if (inactiveTime > 60000) {
        handleEndSession();
      }
    }, 1000);

    return () => clearInterval(checkInactivity);
  }, [lastActivity, showInactiveWarning]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
      {/* Floating Timer */}
      {activeSession && (
        <FloatingTimer
          timeLeft={timeLeft}
          onEndSession={handleEndSession}
        />
      )}

      {/* Inactivity Warning Modal */}
      {showInactiveWarning && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 border border-white/20 rounded-xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-center text-yellow-500 mb-4">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">
              Inactivity Detected
            </h3>
            <p className="text-blue-200 text-center mb-6">
              You will be automatically logged out in {Math.ceil((60000 - (Date.now() - lastActivity)) / 1000)} seconds due to inactivity.
            </p>
            <button
              onClick={() => setShowInactiveWarning(false)}
              className="w-full bg-blue-600/20 border border-blue-500/30 text-blue-100 py-2 rounded-lg hover:bg-blue-600/30 transition-colors duration-200"
            >
              I'm still here
            </button>
          </div>
        </div>
      )}
    </div>
  );
}