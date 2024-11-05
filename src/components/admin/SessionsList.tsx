import React from 'react';
import { Clock, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

interface Session {
  id: string;
  admissionNumber: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  compensation: number;
}

interface SessionsListProps {
  sessions: Session[];
}

export default function SessionsList({ sessions }: SessionsListProps) {
  return (
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
                    <IndianRupee className="h-4 w-4 mr-1 text-green-400" />
                    {session.compensation}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}