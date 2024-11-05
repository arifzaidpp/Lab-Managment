import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSession } from '../hooks/useSession';
import { useApi } from '../hooks/useApi';
import { LogOut, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import AnalyticsOverview from '../components/admin/AnalyticsOverview';
import AddUserModal from '../components/admin/AddUserModal';
import UsersList from '../components/admin/UsersList';
import SessionsList from '../components/admin/SessionsList';
import { motion } from 'framer-motion';

interface User {
  id: string;
  admissionNumber: string;
  name: string;
  class: string;
  imageUrl?: string;
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { sessions, getAllSessions } = useSession();
  const api = useApi();
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    getAllSessions().catch(console.error);
    fetchUsers();
  }, [getAllSessions]);

  const fetchUsers = async () => {
    try {
      const response = await api.get<User[]>('/auth/users');
      setUsers(response);
    } catch (error) {
      console.error('Failed to fetch users:', error);
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
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add user');
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
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <AnalyticsOverview data={sessionData} />

        <div className="mb-8">
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
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Session History</h2>
          <SessionsList sessions={sessions} />
        </div>
      </main>

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onSubmit={handleAddUser}
        />
      )}
    </div>
  );
}