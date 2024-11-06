import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Edit2, Check, XCircle } from 'lucide-react';

interface Purpose {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

interface PurposeManagementProps {
  purposes: Purpose[];
  onClose: () => void;
  onAddPurpose: (data: { name: string; description: string }) => Promise<void>;
  onRefresh: () => void;
}

export default function PurposeManagement({
  purposes,
  onClose,
  onAddPurpose,
  onRefresh
}: PurposeManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Please enter a purpose name');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddPurpose({ name, description });
      setShowAddForm(false);
      setName('');
      setDescription('');
      setError('');
      onRefresh();
    } catch (error) {
      setError('Failed to add purpose');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-2xl w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Manage Purposes</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-400" />
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="w-full mb-6 bg-blue-600/20 border border-blue-500/30 text-blue-100 py-2 rounded-lg hover:bg-blue-600/30 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 inline-block mr-2" />
          Add New Purpose
        </motion.button>

        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Purpose Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/10 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/10 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <div className="flex space-x-2">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-blue-600/20 border border-blue-500/30 text-blue-100 py-2 rounded-lg hover:bg-blue-600/30"
                >
                  {isSubmitting ? 'Adding...' : 'Add Purpose'}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-white/5 border border-white/10 text-gray-300 py-2 rounded-lg hover:bg-white/10"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {purposes.map((purpose) => (
            <div
              key={purpose.id}
              className={`bg-white/5 border border-white/10 rounded-lg p-4 ${
                !purpose.active && 'opacity-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-white">{purpose.name}</h3>
                  {purpose.description && (
                    <p className="text-sm text-gray-400 mt-1">{purpose.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {purpose.active ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-600/20 text-green-400 text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-600/20 text-red-400 text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </span>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 hover:bg-white/10 rounded-lg"
                  >
                    <Edit2 className="h-4 w-4 text-blue-400" />
                  </motion.button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}