import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SetLab from './pages/SetLab';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import { useAuthStore } from './store/auth';
import { useLabStore } from './store/lab';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'admin' | 'user' }) {
  const user = useAuthStore((state) => state.user);
  const isLabSet = useLabStore((state) => state.isLabSet);
  const labId = useLabStore((state) => state.labId);
  
  if (!isLabSet || !labId) {
    return <Navigate to="/set-lab" replace />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== allowedRole) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const { initializeLab } = useLabStore();

  useEffect(() => {
    initializeLab();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/set-lab" element={<SetLab />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;