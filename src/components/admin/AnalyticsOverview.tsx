import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsProps {
  data: {
    date: string;
    sessions: number;
    compensation: number;
  }[];
}

export default function AnalyticsOverview({ data }: AnalyticsProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">Analytics Overview</h2>
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
  );
}