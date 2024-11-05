import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSession } from '../hooks/useSession';
import { useApi } from '../hooks/useApi';
import { LogOut, Clock, IndianRupee, UserPlus, Users, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface User {
  id: string;
  admissionNumber: string;
  name: string;
  class: string;
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { sessions, getAllSessions } = useSession();
  const api = useApi();
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    admissionNumber: '',
    name: '',
    class: '',
    password: '',
  });
  const [error, setError] = useState('');

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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/users', newUser);
      setNewUser({ admissionNumber: '', name: '', class: '', password: '' });
      setShowAddUser(false);
      fetchUsers();
    } catch (error: any) {
      setError(error.message);
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
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-100 hover:bg-red-600/30 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Analytics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Analytics Overview</h2>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionData}>
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
                <Bar dataKey="sessions" fill="#3b82f6" name="Sessions" />
                <Bar dataKey="compensation" fill="#10b981" name="Compensation (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Management Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">User Management</h2>
            <button
              onClick={() => setShowAddUser(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-lg text-green-100 hover:bg-green-600/30 transition-colors duration-200"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New User
            </button>
          </div>

          {/* Add User Modal */}
          {showAddUser && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white/10 border border-white/20 rounded-xl p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Add New User</h3>
                  <button
                    onClick={() => setShowAddUser(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-200">
                      Admission Number
                    </label>
                    <input
                      type="text"
                      value={newUser.admissionNumber}
                      onChange={(e) => setNewUser({ ...newUser, admissionNumber: e.target.value })}
                      className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200">
                      Class
                    </label>
                    <input
                      type="text"
                      value={newUser.class}
                      onChange={(e) => setNewUser({ ...newUser, class: e.target.value })}
                      className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200">
                      Password
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 text-red-300 bg-red-900/20 p-3 rounded-lg">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600/20 border border-blue-500/30 text-blue-100 py-2 rounded-lg hover:bg-blue-600/30 transition-colors duration-200"
                  >
                    Add User
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead>
                  <tr className="bg-black/20">
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Admission Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Class
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {user.admissionNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.class}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sessions Section */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Session History</h2>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead>
                  <tr className="bg-black/20">
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Admission Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Compensation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {session.admissionNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {format(new Date(session.startTime), 'PPp')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {session.endTime ? format(new Date(session.endTime), 'PPp') : 'Active'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <span className="inline-flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-blue-400" />
                          {session.duration} mins
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <span className="inline-flex items-center">
                          <IndianRupee className="h-4 w-4 mr-1 text-green-400" />{session.compensation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}