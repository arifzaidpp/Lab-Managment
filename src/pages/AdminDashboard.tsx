import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSession } from '../hooks/useSession';
import { useApi } from '../hooks/useApi';
import { LogOut, UserPlus, Plus, Settings } from 'lucide-react';
import { format } from 'date-fns';
import AnalyticsOverview from '../components/admin/AnalyticsOverview';
import AddUserModal from '../components/admin/AddUserModal';
import UsersList from '../components/admin/UsersList';
import SessionsList from '../components/admin/SessionsList';
import PurposeManagement from '../components/admin/PurposeManagement';
import CreditManagement from '../components/admin/CreditManagement';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  admissionNumber: string;
  name: string;
  class: string;
  imageUrl?: string;
  creditBalance: number;
}

interface Purpose {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

interface Credit {
  id: string;
  userId: string;
  amount: number;
  date: string;
  notes: string;
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { sessions, getAllSessions } = useSession();
  const api = useApi();
  const [users, setUsers] = useState<User[]>([]);
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showPurposeManagement, setShowPurposeManagement] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'sessions' | 'credits'>('users');

  useEffect(() => {
    getAllSessions().catch(console.error);
    fetchUsers();
    fetchPurposes();
    fetchCredits();
  }, [getAllSessions]);

  const fetchUsers = async () => {
    try {
      const response = await api.get<User[]>('/auth/users');
      setUsers(response);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchPurposes = async () => {
    try {
      const response = await api.get<Purpose[]>('/purposes');
      setPurposes(response);
    } catch (error) {
      console.error('Failed to fetch purposes:', error);
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await api.get<{ credits: Credit[] }>('/credits');
      setCredits(response.credits);
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
  };

  const handleAddUser = async (userData: {
    admissionNumber: string;
    name: string;
    class: string;
    password: string;
    image?: File;
  }) => {
    try {
      const formData = new FormData();
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });

      await api.post('/auth/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      fetchUsers();
      setShowAddUser(false);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add user');
    }
  };

  const handleAddCredit = async (creditData: {
    userId: string;
    amount: number;
    notes: string;
  }) => {
    try {
      await api.post('/credits', creditData);
      fetchCredits();
      fetchUsers(); // Refresh user balances
    } catch (error) {
      console.error('Failed to add credit:', error);
      throw error;
    }
  };

  const handleAddPurpose = async (purposeData: {
    name: string;
    description: string;
  }) => {
    try {
      await api.post('/purposes', purposeData);
      fetchPurposes();
    } catch (error) {
      console.error('Failed to add purpose:', error);
      throw error;
    }
  };

  const sessionData = sessions.reduce((acc: any[], session) => {
    const date = format(new Date(session.startTime), 'MM/dd');
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.sessions += 1;
      existing.compensation += session.compensation;
    } else {
      acc.push({
        date,
        sessions: 1,
        compensation: session.compensation
      });
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
      <nav className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-white">Lab Management Admin</h1>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPurposeManagement(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-100 hover:bg-blue-600/30 transition-colors duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Purposes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="inline-flex items-center px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-100 hover:bg-red-600/30 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <AnalyticsOverview data={sessionData} />

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          {(['users', 'sessions', 'credits'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                activeTab === tab
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">User Management</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddUser(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-lg text-green-100 hover:bg-green-600/30 transition-colors duration-200"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New User
                </motion.button>
              </div>
              <UsersList
                users={users}
                onUserClick={setSelectedUser}
              />
            </motion.div>
          )}

          {activeTab === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">Session History</h2>
              <SessionsList sessions={sessions} />
            </motion.div>
          )}

          {activeTab === 'credits' && (
            <motion.div
              key="credits"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CreditManagement
                credits={credits}
                users={users}
                onAddCredit={handleAddCredit}
                onRefresh={fetchCredits}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAddUser && (
          <AddUserModal
            onClose={() => setShowAddUser(false)}
            onSubmit={handleAddUser}
          />
        )}

        {showPurposeManagement && (
          <PurposeManagement
            purposes={purposes}
            onClose={() => setShowPurposeManagement(false)}
            onAddPurpose={handleAddPurpose}
            onRefresh={fetchPurposes}
          />
        )}
      </AnimatePresence>
    </div>
  );
}