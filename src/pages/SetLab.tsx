import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLabStore } from '../store/lab';
import { Monitor, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SetLab() {
  const [labName, setLabName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setLabId } = useLabStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labName.trim()) {
      setError('Please enter a valid lab name');
      return;
    }

    try {
      await setLabId(labName.trim().toUpperCase());
      navigate('/login');
    } catch (err) {
      setError('Failed to set lab name. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20"
      >
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <Monitor className="h-12 w-12 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Lab Setup</h1>
          <p className="text-blue-200">Assign this computer to a lab</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="labName" className="block text-sm font-medium text-blue-200">
              Lab Name
            </label>
            <input
              type="text"
              id="labName"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              className="block w-full rounded-lg bg-white/5 border border-white/10 py-3 px-4 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter lab name (e.g., LAB-1)"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-red-300 bg-red-900/20 p-3 rounded-lg"
            >
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Set Lab Name
          </button>
        </form>
      </motion.div>
    </div>
  );
}