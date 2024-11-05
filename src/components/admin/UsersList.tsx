import React from 'react';
import { motion } from 'framer-motion';

interface User {
  id: string;
  admissionNumber: string;
  name: string;
  class: string;
  imageUrl?: string;
}

interface UsersListProps {
  users: User[];
  onUserClick: (user: User) => void;
}

export default function UsersList({ users, onUserClick }: UsersListProps) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead>
            <tr className="bg-black/20">
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                Profile
              </th>
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
              <motion.tr
                key={user.id}
                onClick={() => onUserClick(user)}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                className="cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {user.imageUrl ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.imageUrl}
                          alt={user.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                          <span className="text-blue-200 font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {user.admissionNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {user.class}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}