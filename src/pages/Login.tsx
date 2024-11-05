import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLabStore } from '../store/lab';
import { KeyRound, UserRound, AlertCircle, Monitor, Volume2, VolumeX } from 'lucide-react';
import { usePurposes } from '../hooks/usePurposes';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [password, setPassword] = useState('');
  const [purpose, setPurpose] = useState('internet');
  const [error, setError] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { login } = useAuth();
  const { purposes } = usePurposes();
  const [isLoading, setIsLoading] = useState(false);
  const labId = useLabStore((state) => state.labId);
  const [errorAudio] = useState(new Audio('/error.mp3'));

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(admissionNumber, password, purpose, labId!);
    } catch (err) {
      setError('Invalid credentials');
      if (soundEnabled) {
        errorAudio.play().catch(console.error);
      }
      motion.div.animate({ x: [-10, 10, -10, 10, 0] }, { duration: 0.5 });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2] 
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute -inset-[10px] opacity-50"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-3xl"></div>
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/20 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/20 blur-3xl"></div>
        </motion.div>
      </div>

      {/* Sound Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleSound}
        className="fixed top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
      >
        {soundEnabled ? (
          <Volume2 className="h-6 w-6 text-white" />
        ) : (
          <VolumeX className="h-6 w-6 text-white" />
        )}
      </motion.button>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20 relative z-10"
      >
        <div className="text-center space-y-2">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex justify-center mb-6"
          >
            <Monitor className="h-12 w-12 text-blue-400" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Lab Management</h1>
          <p className="text-blue-200">Sign in to your account</p>
          <div className="text-sm text-blue-300 mt-2">
            Lab ID: {labId}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <motion.div 
              className="relative group"
              whileTap={{ scale: 0.995 }}
            >
              <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5 transition-colors group-focus-within:text-blue-400" />
              <input
                type="text"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                className="pl-10 block w-full rounded-lg bg-white/5 border border-white/10 py-3 px-4 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your admission number"
                required
              />
            </motion.div>
            
            <motion.div 
              className="relative group"
              whileTap={{ scale: 0.995 }}
            >
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5 transition-colors group-focus-within:text-blue-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 block w-full rounded-lg bg-white/5 border border-white/10 py-3 px-4 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                required
              />
            </motion.div>

            <motion.div 
              className="relative"
              whileTap={{ scale: 0.995 }}
            >
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="block w-full rounded-lg bg-white/5 border border-white/10 py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              >
                {purposes.map(p => (
                  <option key={p.id} value={p.name} className="bg-gray-900 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center space-x-2 text-red-300 bg-red-900/20 p-3 rounded-lg"
              >
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900 transition-all duration-200 ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        <div className="text-center text-blue-200 text-sm">
          <p>Contact administrator if you need access</p>
        </div>
      </motion.div>
    </motion.div>
  );
}