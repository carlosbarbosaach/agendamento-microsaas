// src/routes/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth } from '../services/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-600">
        Carregando sessão…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
