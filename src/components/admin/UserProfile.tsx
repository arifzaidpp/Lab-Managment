import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Edit2, Trash2, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UserProfileProps {
  user: {
    id: string;
    admissionNumber: string;
    name: string;
    class: string;
    imageUrl?: string;
    totalUsage: number;
    totalCompensation: number;
    creditBalance: number;
  };
  sessions: Array<{
    id: string;
    startTime: string;
    endTime: string;
    duration: number;
    purpose: string;
  }>;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddCredit: (amount: number, note: string) => Promise<void>;
}

export default function UserProfile({
  user,
  sessions,
  onClose,
  onEdit,
  onDelete,
  onAddCredit
}: UserProfileProps) {
  const [showAddCredit, setShowAddCredit] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditAmount || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddCredit(Number(creditAmount), creditNote);
      setCreditAmount('');
      setCreditNote('');
      setShowAddCredit(false);
    } catch (error) {
      console.error('Failed to add credit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare data for usage graph
  const usageData = sessions.reduce((acc: any[], session) => {
    const date = format(new Date(session.startTime), 'MM/dd');
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.duration += session.duration;
    } else {
      acc.push({
        date,
        duration: session.duration
      });
    }
    return acc;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-blue-600/20 flex items-center justify-center">
                <User className="h-8 w-8 text-blue-400" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-blue-200">{user.admissionNumber}</p>
              <p className="text-blue-300 text-sm">{user.class}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-100 hover:bg-blue-600/30"
            >
              <Edit2 className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              className="p-2 rounded-lg bg-red-600/20 border border-red-500/30 text-red-100 hover:bg-red-600/30"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-sm text-blue-200 mb-1">Total Usage</p>
            <p className="text-2xl font-bold text-white">{user.totalUsage} mins</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-sm text-blue-200 mb-1">Total Compensation</p>
            <p className="text-2xl font-bold text-white">₹{user.totalCompensation}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-sm text-blue-200 mb-1">Credit Balance</p>
            <p className="text-2xl font-bold text-white">₹{user.creditBalance}</p>
          </div>
        </div>

        {/* Usage Graph */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Usage Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="duration" fill="#3b82f6" name="Duration (mins)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Add Credit Form */}
        {showAddCredit ? (
          <form onSubmit={handleAddCredit} className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="block w-full rounded-lg bg-white/5 border border-white/10 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Note
                </label>
                <input
                  type="text"
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  className="block w-full rounded-lg bg-white/5 border border-white/10 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-blue-600/20 border border-blue-500/30 text-blue-100 py-2 rounded-lg hover:bg-blue-600/30"
                >
                  {isSubmitting ? 'Adding...' : 'Add Credit'}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddCredit(false)}
                  className="flex-1 bg-white/5 border border-white/10 text-gray-300 py-2 rounded-lg hover:bg-white/10"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </form>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddCredit(true)}
            className="w-full bg-blue-600/20 border border-blue-500/30 text-blue-100 py-2 rounded-lg hover:bg-blue-600/30 mb-6"
          >
            <Plus className="h-4 w-4 inline-block mr-2" />
            Add Credit
          </motion.button>
        )}

        {/* Session History */}
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          <h3 className="text-lg font-semibold text-white p-4 border-b border-white/10">
            Session History
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr className="bg-black/20">
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {format(new Date(session.startTime), 'PPp')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {session.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {session.duration} mins
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}